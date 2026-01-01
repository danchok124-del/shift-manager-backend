import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout, AuthLinks } from '../../components/auth/AuthLayout'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { api } from '../../services/api'

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    if (!token) {
      setError('Chybí token pro obnovení hesla');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.resetPassword(token, password);
      setMessage(response.message);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
    } catch (err: any) {

      setError(err.message || 'Něco se pokazilo při obnově hesla');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Nové heslo" 
      subtitle="Zadejte své nové heslo níže"
      error={error}
      successMessage={message}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Nové heslo"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        
        <Input
          label="Potvrzení nového hesla"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          isLoading={isLoading} 
          disabled={!token || !!message}
          block
        >
          Změnit heslo
        </Button>
      </form>
      
      <AuthLinks>
        <button className="link-button" onClick={() => navigate('/login')}>
          Zpět na přihlášení
        </button>
      </AuthLinks>
    </AuthLayout>
  );
}

export default ResetPassword;
