import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, AuthLinks } from '../../components/auth/AuthLayout'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useToast } from '../../context/ToastContext'
import { api } from '../../services/api'

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (formData.password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    setIsLoading(true);

    const { email, password, firstName, lastName } = formData;

    try {
      await api.register({ email, password, firstName, lastName });
      showToast('success', 'Registrace proběhla úspěšně! Nyní se můžete přihlásit.');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.message || 'Registrace selhala';
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Registrace" 
      subtitle="Vytvořte si účet"
      error={error}
    >
      <form onSubmit={handleSubmit}>
        <div className={authStyles.formRow}>
          <Input
            label="Jméno"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            label="Příjmení"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        
        <Input
          label="E-mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        
        <Input
          label="Heslo"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          autoComplete="new-password"
        />
        
        <Input
          label="Potvrzení hesla"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />
        
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          isLoading={isLoading} 
          block
        >
          Zaregistrovat se
        </Button>
      </form>
      
      <AuthLinks>
        <span>Již máte účet?</span>
        <Link to="/login">Přihlásit se</Link>
      </AuthLinks>
    </AuthLayout>
  );
}

export default Register;
