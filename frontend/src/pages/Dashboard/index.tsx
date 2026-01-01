import { useEffect, useState } from 'react';
import './Dashboard.scss';

import { AttendanceWidget } from '../../components/dashboard/AttendanceWidget';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { ScheduleView } from '../../components/dashboard/ScheduleView';
import { WorkOverview } from '../../components/dashboard/WorkOverview';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Shift } from '../../types';

function Dashboard() {
  const { user } = useAuth();
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [stats, setStats] = useState({ totalHours: 0, shiftsThisWeek: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Get user's upcoming shifts
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const schedule = await api.getUserSchedule(
        user.id,
        today.toISOString(),
        nextWeek.toISOString()
      );
      
      setUpcomingShifts(schedule.map((a: any) => a.shift).filter(Boolean));
      
      // Get monthly report
      const report = await api.getUserReport(user.id, today.getMonth() + 1, today.getFullYear());
      setStats({
        totalHours: report.totalHours || 0,
        shiftsThisWeek: schedule.length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Načítání...</div>; // TODO: Common Loading component
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1>Vítejte, {user?.firstName}!</h1>
        <p>Přehled vašich směn a docházky</p>
      </header>

      <AttendanceWidget onUpdate={loadData} />
      <WorkOverview stats={stats} />
      
      <ScheduleView shifts={upcomingShifts} />

      <QuickActions userRole={user?.role} />
    </div>
  );
}

export default Dashboard;
