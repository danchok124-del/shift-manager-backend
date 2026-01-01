import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthFooter, AuthLayout, AuthLinks } from '../../components/auth/AuthLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Přihlášení selhalo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Přihlášení" 
      subtitle="Správa směn provozu"
      error={error}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        
        <Input
          label="Heslo"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          isLoading={isLoading} 
          block
        >
          Přihlásit se
        </Button>
      </form>
      
      <AuthLinks>
        <Link to="/forgot-password">Zapomenuté heslo?</Link>
        <span>·</span>
        <Link to="/register">Registrace</Link>
      </AuthLinks>
      
      <AuthFooter>
        <Link to="/">← Zobrazit veřejné směny</Link>
      </AuthFooter>
    </AuthLayout>
  );
}

export default Login;
