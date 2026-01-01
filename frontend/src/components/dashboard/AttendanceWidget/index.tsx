import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Button } from '../../common/Button';
import { Card, CardBody } from '../../common/Card';
import styles from './AttendanceWidget.module.scss';

interface AttendanceWidgetProps {
    onUpdate?: () => void;
}

export const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ onUpdate }) => {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [activeAttendance, setActiveAttendance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAttendanceStatus();
    }, []);

    const loadAttendanceStatus = async () => {
        try {
            const attendanceData = await api.getMyAttendance({ page: 1, limit: 1 });
            const lastRecord = attendanceData.data[0];
            if (lastRecord && !lastRecord.clockOut) {
                setIsClockedIn(true);
                setActiveAttendance(lastRecord);
            } else {
                setIsClockedIn(false);
                setActiveAttendance(null);
            }
        } catch (err) {
            console.error('Failed to load attendance status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClockOut = async () => {
        try {
            await api.manualClockOut();
            await loadAttendanceStatus();
            onUpdate?.();
        } catch (err: any) {
            alert(err.message || 'Nepodařilo se zaznamenat odchod');
        }
    };

    if (isLoading) return null;

    if (!isClockedIn) return null; // Don't show if not clocked in (for now)

    const now = new Date();
    const endTime = activeAttendance?.shift?.endTime ? new Date(activeAttendance.shift.endTime) : null;
    const tenMinutesBeforeEnd = endTime ? new Date(endTime.getTime() - 10 * 60 * 1000) : null;
    const tooEarlyToClockOut = tenMinutesBeforeEnd ? now < tenMinutesBeforeEnd : false;

    return (
        <Card className={styles.widget}>
            <CardBody className={styles.body}>
                <div className={styles.info}>
                    <div className={styles.status}>
                        <span className={styles.pulse}></span>
                        Právě jste v práci
                    </div>
                    <div className={styles.time}>
                        Od {new Date(activeAttendance.clockIn).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={handleClockOut}
                        disabled={tooEarlyToClockOut}
                    >
                        Zaznamenat odchod
                    </Button>
                    {tooEarlyToClockOut && tenMinutesBeforeEnd && (
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>
                            Odchod možný od {tenMinutesBeforeEnd.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};
