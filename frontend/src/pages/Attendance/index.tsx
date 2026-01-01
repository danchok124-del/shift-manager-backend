import { useEffect, useState } from 'react';
import { AttendanceList } from '../../components/attendance/AttendanceList';
import { AttendanceStats } from '../../components/attendance/AttendanceStats';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { api } from '../../services/api';
import { Attendance } from '../../types';

function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAttendance();
  }, [month, year]);

  const loadAttendance = async () => {
    try {
      const response = await api.getMyAttendance({ month, year });
      setAttendance(response.data);
      setTotalHours(response.meta.totalHours || 0);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const months = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
  ];

  if (isLoading) {
    return <div className="loading">Načítání...</div>;
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header className="page-header no-print" style={{ marginBottom: '2rem' }}>
        <h1>Docházka</h1>
        <p>Přehled odpracovaných hodin</p>
      </header>

      <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
        <div style={{ flex: '0 0 150px' }}>
          <Select
            label="Měsíc"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </Select>
        </div>
        <div style={{ flex: '0 0 120px' }}>
          <Select
            label="Rok"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>
        <div style={{ paddingBottom: '1rem' }}>
          <Button variant="outline" onClick={() => window.print()}>
            🖨️ Tisk
          </Button>
        </div>
      </div>

      <AttendanceStats
        monthName={months[month - 1]}
        year={year}
        totalHours={totalHours}
      />

      <AttendanceList records={attendance} />
    </div>
  );
}

export default AttendancePage;
