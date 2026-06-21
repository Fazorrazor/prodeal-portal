export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_VALUES = Object.values(USER_ROLES) as [string, ...string[]];
