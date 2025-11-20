/**
 * Domain Entity: Authentication
 * Clean Architecture - Domain Layer
 */

export enum UserRole {
  ADMIN = "Admin",
  EMPLOYEE = "Employee",
  STAFF = "Staff",
  DRIVER = "Driver",
  CUSTOMER = "Customer",
}

export interface AuthUser {
  userID: string;
  username: string;
  email: string;
  phoneNumber: string;
  stationName: string | null;
  roleName: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
}

/**
 * Utility to get route path based on user role
 */
export const getRouteByRole = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "/dashboard";
    case UserRole.EMPLOYEE:
    case UserRole.STAFF:
      return "/dashboardstaff";
    case UserRole.DRIVER:
    case UserRole.CUSTOMER:
      return "/home";
    default:
      return "/home";
  }
};

/**
 * Normalize role name from backend response
 */
export const normalizeRole = (role: string): UserRole => {
  const roleUpper = role.toUpperCase();

  switch (roleUpper) {
    case "ADMIN":
    case "ADMINISTRATOR":
      return UserRole.ADMIN;
    case "EMPLOYEE":
    case "STAFF":
      return UserRole.EMPLOYEE;
    case "DRIVER":
      return UserRole.DRIVER;
    case "CUSTOMER":
    case "CLIENT":
      return UserRole.CUSTOMER;
    default:
      return UserRole.CUSTOMER; // Default fallback
  }
};
