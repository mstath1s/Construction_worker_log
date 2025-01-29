import { User as FirebaseUser } from 'firebase/auth';

export const UserRoles = {
  ADMIN: 'admin',
  SITE_SUPERVISOR: 'site_supervisor',
  WORKER: 'worker',
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

export interface UserProfile extends Omit<FirebaseUser, 'role'> {
  role: UserRole;
  displayName: string | null;
  email: string | null;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
} 