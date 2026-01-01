import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Shift, UserRole } from '../../types'

function ShiftDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shift, setShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState<any>(null);

  useEffect(() => {
    loadShift();
  }, [id]);

  const loadShift = async () => {
    try {
      const [shiftData, attendanceData] = await Promise.all([
        api.getShift(Number(id)),
        api.getMyAttendance({ page: 1, limit: 1 })
      ]);
      
      setShift(shiftData);
      
      // Check if there's an open attendance record
      const lastRecord = attendanceData.data[0];
      if (lastRecord && !lastRecord.clockOut) {
        setIsClockedIn(true);
        setActiveAttendance(lastRecord);
      } else {
        setIsClockedIn(false);
        setActiveAttendance(null);
      }
    } catch (err) {
      console.error('Failed to load shift or attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      await api.assignToShift(Number(id));
      loadShift();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se přihlásit');
    }
  };

  const handleRemoveAssignment = async (userId: number) => {
    try {
      await api.removeFromShift(Number(id), userId);
      loadShift();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se odhlásit');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tuto směnu?')) return;
    try {
      await api.deleteShift(Number(id));
      navigate('/shifts');
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se smazat směnu');
    }
  };

  const handleClockIn = async () => {
    try {
      await api.manualClockIn(Number(id));
      loadShift();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se zaznamenat příchod');
    }
  };

  const handleClockOut = async () => {
    try {
      await api.manualClockOut();
      loadShift();
    } catch (err: any) {
      alert(err.message || 'Nepodařilo se zaznamenat odchod');
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canManage = user?.role === UserRole.MANAGER || user?.role === UserRole.HR;
  const isAssigned = shift?.assignments?.some((a) => a.userId === user?.id);

  const now = new Date();
  const startTime = shift ? new Date(shift.startTime) : new Date();
  const endTime = shift ? new Date(shift.endTime) : new Date();
  const tenMinutesBeforeStart = new Date(startTime.getTime() - 10 * 60 * 1000);
  const tenMinutesBeforeEnd = new Date(endTime.getTime() - 10 * 60 * 1000);

  const tooEarlyToClockIn = now < tenMinutesBeforeStart;
  const tooEarlyToClockOut = now < tenMinutesBeforeEnd;

  if (isLoading) {
    return <div className="loading">Načítání...</div>;
  }

  if (!shift) {
    return <div className="empty-state"><p>Směna nenalezena</p></div>;
  }

  return (
    <div className="shift-detail">
      <header className="page-header">
        <div>
          <h1>{shift.title}</h1>
          <p>{shift.department?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isAssigned && (shift.availableSlots ?? 0) > 0 && (
            <button className="btn btn--primary" onClick={handleSignUp}>
              Přihlásit se na směnu
            </button>
          )}
          {isAssigned && (
            <>
              {!isClockedIn ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  <button 
                    className="btn btn--success" 
                    onClick={handleClockIn}
                    disabled={tooEarlyToClockIn}
                  >
                    Zaznamenat příchod
                  </button>
                  {tooEarlyToClockIn && (
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                      Příchod možný od {new Date(tenMinutesBeforeStart).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ) : (
                activeAttendance?.shiftId === Number(id) && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <button 
                      className="btn btn--warning" 
                      onClick={handleClockOut}
                      disabled={tooEarlyToClockOut}
                    >
                      Zaznamenat odchod
                    </button>
                    {tooEarlyToClockOut && (
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>
                        Odchod možný od {new Date(tenMinutesBeforeEnd).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                )
              )}
              <button className="btn btn--danger" onClick={() => handleRemoveAssignment(user!.id)}>
                Odhlásit se
              </button>
            </>
          )}
          {canManage && (
            <button className="btn btn--outline" onClick={handleDelete}>
              Smazat
            </button>
          )}
        </div>
      </header>

      <div className="card">
        <div className="card__body">
          <dl className="detail-list">
            <dt>Začátek</dt>
            <dd>{formatDateTime(shift.startTime)}</dd>
            
            <dt>Konec</dt>
            <dd>{formatDateTime(shift.endTime)}</dd>
            
            <dt>Obsazenost</dt>
            <dd>{shift.assignedCount}/{shift.requiredEmployees} zaměstnanců</dd>
            
            <dt>Typ</dt>
            <dd>{shift.isPublic ? 'Veřejná směna' : 'Interní směna'}</dd>
            
            {shift.description && (
              <>
                <dt>Popis</dt>
                <dd>{shift.description}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Přihlášení zaměstnanci</h2>
        {shift.assignments && shift.assignments.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Jméno</th>
                <th>E-mail</th>
                <th>Stav</th>
                {canManage && <th>Akce</th>}
              </tr>
            </thead>
            <tbody>
              {shift.assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.user?.firstName} {assignment.user?.lastName}</td>
                  <td>{assignment.user?.email}</td>
                  <td>
                    <span className={`badge badge--${assignment.status === 'confirmed' ? 'success' : 'warning'}`}>
                      {assignment.status}
                    </span>
                  </td>
                  {canManage && (
                    <td>
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => handleRemoveAssignment(assignment.userId)}
                      >
                        Odebrat
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Zatím není nikdo přihlášen</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ShiftDetail;
