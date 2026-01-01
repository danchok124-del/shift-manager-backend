export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  HR = 'hr',
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  departmentId?: number;
  department?: Department;
  isActive: boolean;
  cardId?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  userCount?: number;
  users?: User[];
}

export interface Shift {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  departmentId: number;
  department?: Department;
  isPublic: boolean;
  requiredEmployees: number;
  isActive: boolean;
  assignedCount?: number;
  availableSlots?: number;
  assignments?: ShiftAssignment[];
}

export enum AssignmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export interface ShiftAssignment {
  id: number;
  userId: number;
  shiftId: number;
  status: AssignmentStatus;
  user?: User;
  shift?: Shift;
}

export interface Attendance {
  id: number;
  userId: number;
  shiftId?: number;
  clockIn: string;
  clockOut?: string;
  cardId?: string;
  notes?: string;
  user?: User;
  shift?: Shift;
}

export interface Skill {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export enum SkillStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  status: SkillStatus;
  skill?: Skill;
}

export interface UserAvailability {
  id: number;
  userId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  reason?: string;
  isRecurring: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface WorkReport {
  userId: number;
  month: number;
  year: number;
  totalHours: number;
  records: Attendance[];
}
