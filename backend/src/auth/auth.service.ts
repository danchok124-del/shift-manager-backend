import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import * as crypto from 'node:crypto'
import * as nodemailer from 'nodemailer'
import { Repository } from 'typeorm'

import { User } from '../entities/user.entity'
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}


  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('MAIL_HOST'),
        port: this.configService.get('MAIL_PORT', 587),
        secure: this.configService.get('MAIL_PORT') === 465,
        auth: {
          user: this.configService.get('MAIL_USER'),
          pass: this.configService.get('MAIL_PASS'),
        },
      });
    }
    return this.transporter;
  }




  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await this.usersRepository.save(user);

    return { message: 'Registration successful' };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['department'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    };

    const accessToken = this.jwtService.sign(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await this.usersRepository.save(user);

    const transporter = await this.getTransporter();
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    transporter.sendMail({
      from: this.configService.get('MAIL_FROM', '"Shift Management" <noreply@example.com>'),
      to: email,
      subject: 'Password Reset Request',

      text: `You requested a password reset. Please use the following link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your Shift Management account.</p>
          <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
        </div>
      `,
    }).then(info => {
      console.log('------------------------------------------');
      console.log(`PASSWORD RESET REQUEST for ${email}`);
      console.log(`Message sent: ${info.messageId}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log('------------------------------------------');
    }).catch(err => {
      console.error('Error sending email:', err);
    });

    return { message: 'If the email exists, a reset link has been sent' };

  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['department'],
    });
  }
}
