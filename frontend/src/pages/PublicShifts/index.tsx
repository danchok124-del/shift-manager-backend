import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Shift } from '../../types';
import './PublicShifts.scss';

function PublicShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const response = await api.getPublicShifts({ limit: 20 });
      setShifts(response.data);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="public-shifts">
      <header className="public-header">
        <div className="container">
          <h1>Správa směn provozu</h1>
          <p>Systém pro rozvrhování směn a sledování docházky</p>
          <div className="public-header__actions">
            <Link to="/login" className="btn btn--primary btn--lg">Přihlásit se</Link>
            <Link to="/register" className="btn btn--outline btn--lg">Registrace</Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem' }}>
        <section>
          <h2>Volné směny</h2>
          <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
            Přihlaste se, abyste se mohli registrovat na dostupné směny.
          </p>

          {isLoading ? (
            <div className="loading">Načítání...</div>
          ) : shifts.length === 0 ? (
            <div className="empty-state">
              <p>Momentálně nejsou žádné veřejné směny</p>
            </div>
          ) : (
            <div className="shifts-grid">
              {shifts.map((shift) => (
                <div key={shift.id} className="shift-card">
                  <div className="shift-card__header">
                    <h3>{shift.title}</h3>
                    <span className="badge badge--primary">Volná</span>
                  </div>
                  <div className="shift-card__body">
                    <p className="shift-card__time">
                      {formatDateTime(shift.startTime)} - {formatDateTime(shift.endTime)}
                    </p>
                    {shift.department && (
                      <p className="shift-card__dept">{shift.department.name}</p>
                    )}
                    <p className="shift-card__slots">
                      {shift.availableSlots} volných míst
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="public-footer">
        <div className="container">
          <p>© 2024 Správa směn provozu</p>
        </div>
      </footer>
    </div>
  );
}

export default PublicShifts;
