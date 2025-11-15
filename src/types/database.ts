// Extended types for the new RBAC schema
// These will match once DATABASE_SCHEMA.sql is applied

export type AppRole = 'citizen' | 'verifier' | 'partner' | 'government' | 'admin' | 'moderator';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleWithProfile extends UserRole {
  profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}
