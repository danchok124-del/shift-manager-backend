import { NestFactory } from '@nestjs/core'
import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { AppModule } from './app.module'
import { Department } from './entities/department.entity'
import { UserRole } from './entities/enums'
import { AssignmentStatus, ShiftAssignment } from './entities/shift-assignment.entity'
import { Shift } from './entities/shift.entity'
import { Skill } from './entities/skill.entity'
import { SkillStatus, UserSkill } from './entities/user-skill.entity'
import { User } from './entities/user.entity'

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting database seed...');

  // Get repositories
  const userRepo = dataSource.getRepository(User);
  const departmentRepo = dataSource.getRepository(Department);
  const shiftRepo = dataSource.getRepository(Shift);
  const assignmentRepo = dataSource.getRepository(ShiftAssignment);
  const skillRepo = dataSource.getRepository(Skill);
  const userSkillRepo = dataSource.getRepository(UserSkill);

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await assignmentRepo.createQueryBuilder().delete().execute();
  await userSkillRepo.createQueryBuilder().delete().execute();
  await shiftRepo.createQueryBuilder().delete().execute();
  await skillRepo.createQueryBuilder().delete().execute();
  await userRepo.createQueryBuilder().delete().execute();
  await departmentRepo.createQueryBuilder().delete().execute();

  // Create Departments
  console.log('🏢 Creating departments...');
  const departments = await departmentRepo.save([
    { name: 'Kitchen', description: 'Food preparation and cooking', isActive: true },
    { name: 'Front Desk', description: 'Customer service and reception', isActive: true },
    { name: 'Warehouse', description: 'Inventory and shipping', isActive: true },
    { name: 'IT Support', description: 'Technical support and maintenance', isActive: true },
  ]);

  const [kitchen, frontDesk, warehouse, it] = departments;

  // Create Skills
  console.log('🎯 Creating skills...');
  const skills = await skillRepo.save([
    { name: 'Food Safety', description: 'Food handling and safety certification', isActive: true },
    { name: 'Customer Service', description: 'Customer interaction skills', isActive: true },
    { name: 'Forklift Operation', description: 'Licensed forklift operator', isActive: true },
    { name: 'First Aid', description: 'First aid and CPR certified', isActive: true },
    { name: 'Network Administration', description: 'Network setup and troubleshooting', isActive: true },
  ]);

  const [foodSafety, customerService, forklift, firstAid, networkAdmin] = skills;

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  console.log('👥 Creating users...');
  const users = await userRepo.save([
    // HR User
    {
      email: 'hr@example.com',
      password: hashedPassword,
      firstName: 'Anna',
      lastName: 'HR Manager',
      role: UserRole.HR,
      phone: '+420 111 222 333',
      isActive: true,
      departmentId: null,
      cardId: 'CARD001',
    },
    // Manager - Kitchen
    {
      email: 'chef@example.com',
      password: hashedPassword,
      firstName: 'Gordon',
      lastName: 'Ramsay',
      role: UserRole.MANAGER,
      phone: '+420 222 333 444',
      isActive: true,
      departmentId: kitchen.id,
      cardId: 'CARD002',
    },
    // Manager - Front Desk
    {
      email: 'manager@example.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Connor',
      role: UserRole.MANAGER,
      phone: '+420 333 444 555',
      isActive: true,
      departmentId: frontDesk.id,
      cardId: 'CARD003',
    },
    // Employees
    {
      email: 'john@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.EMPLOYEE,
      phone: '+420 444 555 666',
      isActive: true,
      departmentId: kitchen.id,
      cardId: 'CARD004',
    },
    {
      email: 'jane@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.EMPLOYEE,
      phone: '+420 555 666 777',
      isActive: true,
      departmentId: kitchen.id,
      cardId: 'CARD005',
    },
    {
      email: 'bob@example.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Wilson',
      role: UserRole.EMPLOYEE,
      phone: '+420 666 777 888',
      isActive: true,
      departmentId: frontDesk.id,
      cardId: 'CARD006',
    },
    {
      email: 'alice@example.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: UserRole.EMPLOYEE,
      phone: '+420 777 888 999',
      isActive: true,
      departmentId: warehouse.id,
      cardId: 'CARD007',
    },
    {
      email: 'charlie@example.com',
      password: hashedPassword,
      firstName: 'Charlie',
      lastName: 'Brown',
      role: UserRole.EMPLOYEE,
      phone: '+420 888 999 000',
      isActive: true,
      departmentId: it.id,
      cardId: 'CARD008',
    },
  ]);

  const [hrUser, chefManager, frontManager, john, jane, bob, alice, charlie] = users;

  // Assign Skills to Users
  console.log('🔗 Assigning skills to users...');
  await userSkillRepo.save([
    { userId: john.id, skillId: foodSafety.id, status: SkillStatus.APPROVED, approvedById: hrUser.id },
    { userId: john.id, skillId: firstAid.id, status: SkillStatus.APPROVED, approvedById: hrUser.id },
    { userId: jane.id, skillId: foodSafety.id, status: SkillStatus.APPROVED, approvedById: hrUser.id },
    { userId: bob.id, skillId: customerService.id, status: SkillStatus.APPROVED, approvedById: hrUser.id },
    { userId: bob.id, skillId: firstAid.id, status: SkillStatus.PENDING },
    { userId: alice.id, skillId: forklift.id, status: SkillStatus.APPROVED, approvedById: hrUser.id },
    { userId: charlie.id, skillId: networkAdmin.id, status: SkillStatus.APPROVED, approvedById: hrUser.id },
  ]);

  // Create Shifts
  console.log('📅 Creating shifts...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const shifts = await shiftRepo.save([
    // Kitchen shifts
    {
      title: 'Morning Kitchen Shift',
      description: 'Breakfast and lunch preparation',
      startTime: new Date(tomorrow.setHours(6, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
      departmentId: kitchen.id,
      requiredEmployees: 3,
      isPublic: false,
      isActive: true,
    },
    {
      title: 'Evening Kitchen Shift',
      description: 'Dinner preparation and closing',
      startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(22, 0, 0, 0)),
      departmentId: kitchen.id,
      requiredEmployees: 2,
      isPublic: false,
      isActive: true,
    },
    // Front Desk shifts
    {
      title: 'Front Desk Morning',
      description: 'Morning reception duties',
      startTime: new Date(tomorrow.setHours(8, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
      departmentId: frontDesk.id,
      requiredEmployees: 2,
      isPublic: true,
      isActive: true,
    },
    {
      title: 'Front Desk Evening',
      description: 'Evening reception duties',
      startTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(23, 0, 0, 0)),
      departmentId: frontDesk.id,
      requiredEmployees: 1,
      isPublic: true,
      isActive: true,
    },
    // Warehouse shift
    {
      title: 'Warehouse Day Shift',
      description: 'Inventory management and shipping',
      startTime: new Date(dayAfter.setHours(7, 0, 0, 0)),
      endTime: new Date(dayAfter.setHours(15, 0, 0, 0)),
      departmentId: warehouse.id,
      requiredEmployees: 2,
      isPublic: true,
      isActive: true,
    },
    // IT Support shift
    {
      title: 'IT Support On-Call',
      description: 'Technical support coverage',
      startTime: new Date(nextWeek.setHours(9, 0, 0, 0)),
      endTime: new Date(nextWeek.setHours(17, 0, 0, 0)),
      departmentId: it.id,
      requiredEmployees: 1,
      isPublic: false,
      isActive: true,
    },
  ]);

  const [morningKitchen, eveningKitchen, frontMorning, frontEvening, warehouseShift, itShift] = shifts;

  // Create Shift Assignments
  console.log('📝 Creating shift assignments...');
  await assignmentRepo.save([
    { shiftId: morningKitchen.id, userId: john.id, status: AssignmentStatus.CONFIRMED, assignedById: chefManager.id },
    { shiftId: morningKitchen.id, userId: jane.id, status: AssignmentStatus.CONFIRMED, assignedById: chefManager.id },
    { shiftId: eveningKitchen.id, userId: john.id, status: AssignmentStatus.PENDING, assignedById: null },
    { shiftId: frontMorning.id, userId: bob.id, status: AssignmentStatus.CONFIRMED, assignedById: frontManager.id },
    { shiftId: warehouseShift.id, userId: alice.id, status: AssignmentStatus.CONFIRMED, assignedById: hrUser.id },
    { shiftId: itShift.id, userId: charlie.id, status: AssignmentStatus.CONFIRMED, assignedById: hrUser.id },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   HR Admin:     hr@example.com / password123');
  console.log('   Manager:      chef@example.com / password123');
  console.log('   Manager:      manager@example.com / password123');
  console.log('   Employee:     john@example.com / password123');
  console.log('   Employee:     jane@example.com / password123');
  console.log('   Employee:     bob@example.com / password123');
  console.log('   Employee:     alice@example.com / password123');
  console.log('   Employee:     charlie@example.com / password123');
  console.log('');

  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
