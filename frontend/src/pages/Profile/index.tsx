import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateUser(user!.id, formData);
      setMessage('Profil byl aktualizován');
      setIsEditing(false);
    } catch (err: any) {
      setMessage(err.message || 'Nepodařilo se aktualizovat profil');
    }
  };

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>Můj profil</h1>
        <p>Správa osobních údajů</p>
      </header>

      {message && (
        <div className={`alert ${message.includes('aktualizován') ? 'alert--success' : 'alert--error'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>Osobní údaje</h2>
          {!isEditing && (
            <button className="btn btn--outline btn--sm" onClick={() => setIsEditing(true)}>
              Upravit
            </button>
          )}
        </div>
        <div className="card__body">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">Jméno</label>
                <input
                  type="text"
                  id="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Příjmení</label>
                <input
                  type="text"
                  id="lastName"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telefon</label>
                <input
                  type="tel"
                  id="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn--primary">Uložit</button>
                <button type="button" className="btn btn--outline" onClick={() => setIsEditing(false)}>
                  Zrušit
                </button>
              </div>
            </form>
          ) : (
            <dl className="detail-list">
              <dt>E-mail</dt>
              <dd>{user?.email}</dd>
              
              <dt>Jméno</dt>
              <dd>{user?.firstName} {user?.lastName}</dd>
              
              <dt>Telefon</dt>
              <dd>{user?.phone || '-'}</dd>
              
              <dt>Role</dt>
              <dd><span className="badge badge--primary">{user?.role}</span></dd>
              
              <dt>Oddělení</dt>
              <dd>{user?.department?.name || 'Nepřiřazeno'}</dd>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
