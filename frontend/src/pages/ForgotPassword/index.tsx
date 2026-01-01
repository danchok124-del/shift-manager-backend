import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, AuthLinks } from '../../components/auth/AuthLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { api } from '../../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.forgotPassword(email);
      setMessage(response.message);
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Obnovení hesla" 
      subtitle="Zadejte svůj e-mail pro obnovení hesla"
      error={error}
      successMessage={message}
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
        
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          isLoading={isLoading} 
          block
        >
          Odeslat odkaz
        </Button>
      </form>
      
      <AuthLinks>
        <Link to="/login">← Zpět na přihlášení</Link>
      </AuthLinks>
    </AuthLayout>
  );
}

export default ForgotPassword;
