// User data interface
export interface UserData {
  name: string;
  communityName?: string;
  email: string;
  phone?: string;
  country?: string;
  region: string;
  community?: string;
  tribe?: string;
  accountStatus: 'active' | 'pending';
  password: string; // In production, this should be hashed
}

// Storage keys
const USER_DATA_KEY = 'user_data';
const CURRENT_USER_KEY = 'current_user';
const IS_AUTHENTICATED_KEY = 'is_authenticated';

// Get all registered users
export const getRegisteredUsers = (): UserData[] => {
  if (typeof window === 'undefined') return [];
  const usersJson = localStorage.getItem(USER_DATA_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Save registered user
export const saveRegisteredUser = (userData: UserData): void => {
  if (typeof window === 'undefined') return;
  const users = getRegisteredUsers();
  users.push(userData);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(users));
};

// Find user by email
export const findUserByEmail = (email: string): UserData | null => {
  const users = getRegisteredUsers();
  return users.find(user => user.email === email) || null;
};

// Authenticate user (login)
export const authenticateUser = (email: string, password: string): UserData | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    // Set current user and authentication status
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem(IS_AUTHENTICATED_KEY, 'true');
    }
    return user;
  }
  return null;
};

// Get current authenticated user
export const getCurrentUser = (): UserData | null => {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(IS_AUTHENTICATED_KEY) === 'true';
};

// Logout user
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(IS_AUTHENTICATED_KEY);
  }
};

// Update user data
export const updateUserData = (updatedData: Partial<UserData>): void => {
  if (typeof window === 'undefined') return;
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const updatedUser = { ...currentUser, ...updatedData };
  
  // Update in current user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  
  // Update in registered users list
  const users = getRegisteredUsers();
  const userIndex = users.findIndex(user => user.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(users));
  }
};

// Update password
export const updatePassword = (email: string, newPassword: string): boolean => {
  if (typeof window === 'undefined') return false;
  const users = getRegisteredUsers();
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(users));
    
    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email === email) {
      currentUser.password = newPassword;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
    return true;
  }
  return false;
};

// ==================== ADMIN AUTHENTICATION ====================

// Admin data interface
export interface AdminData {
  name: string;
  email: string;
  password: string; // In production, this should be hashed
  adminRole: 'super_admin' | 'validator_admin';
  country: string;
  accountStatus: 'active' | 'pending';
  createdAt?: string;
}

// Storage keys for admin
const ADMIN_DATA_KEY = 'admin_data';
const CURRENT_ADMIN_KEY = 'current_admin';
const IS_ADMIN_AUTHENTICATED_KEY = 'is_admin_authenticated';

// Get all registered admins
export const getRegisteredAdmins = (): AdminData[] => {
  if (typeof window === 'undefined') return [];
  const adminsJson = localStorage.getItem(ADMIN_DATA_KEY);
  return adminsJson ? JSON.parse(adminsJson) : [];
};

// Save registered admin
export const saveRegisteredAdmin = (adminData: AdminData): void => {
  if (typeof window === 'undefined') return;
  const admins = getRegisteredAdmins();
  admins.push(adminData);
  localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(admins));
};

// Find admin by email
export const findAdminByEmail = (email: string): AdminData | null => {
  const admins = getRegisteredAdmins();
  return admins.find(admin => admin.email === email) || null;
};

// Authenticate admin (login)
export const authenticateAdmin = (email: string, password: string): AdminData | null => {
  const admin = findAdminByEmail(email);
  if (admin && admin.password === password) {
    // For development: Allow pending admins to login and auto-activate them
    // In production, you may want to keep the pending check
    if (admin.accountStatus === 'pending') {
      // Auto-activate pending admin on first login (for development)
      const updatedAdmin = { ...admin, accountStatus: 'active' as const };
      const admins = getRegisteredAdmins();
      const adminIndex = admins.findIndex(a => a.email === email);
      if (adminIndex !== -1) {
        admins[adminIndex] = updatedAdmin;
        if (typeof window !== 'undefined') {
          localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(admins));
        }
      }
      // Set current admin and authentication status
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(updatedAdmin));
        localStorage.setItem(IS_ADMIN_AUTHENTICATED_KEY, 'true');
      }
      return updatedAdmin;
    }
    // Set current admin and authentication status
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(admin));
      localStorage.setItem(IS_ADMIN_AUTHENTICATED_KEY, 'true');
    }
    return admin;
  }
  return null;
};

// Get current authenticated admin
export const getCurrentAdmin = (): AdminData | null => {
  if (typeof window === 'undefined') return null;
  const adminJson = localStorage.getItem(CURRENT_ADMIN_KEY);
  return adminJson ? JSON.parse(adminJson) : null;
};

// Check if admin is authenticated
export const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(IS_ADMIN_AUTHENTICATED_KEY) === 'true';
};

// Logout admin
export const logoutAdmin = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_ADMIN_KEY);
    localStorage.removeItem(IS_ADMIN_AUTHENTICATED_KEY);
  }
};

// Update admin data
export const updateAdminData = (updatedData: Partial<AdminData>): void => {
  if (typeof window === 'undefined') return;
  const currentAdmin = getCurrentAdmin();
  if (!currentAdmin) return;

  const updatedAdmin = { ...currentAdmin, ...updatedData };
  
  // Update in current admin
  localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(updatedAdmin));
  
  // Update in registered admins list
  const admins = getRegisteredAdmins();
  const adminIndex = admins.findIndex(admin => admin.email === currentAdmin.email);
  if (adminIndex !== -1) {
    admins[adminIndex] = updatedAdmin;
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(admins));
  }
};