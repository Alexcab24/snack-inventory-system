// Simple authentication system using localStorage
// In a real application, you would use Supabase Auth or similar
import { ADMIN_USERS } from './config';

export interface User {
    id: string;
    username: string;
    role: 'admin' | 'viewer';
}

const AUTH_KEY = 'snack_system_auth';

export const auth = {
    // Login with configured credentials
    login: (username: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            console.log('Login attempt:', { username, password });
            console.log('Available users:', ADMIN_USERS);

            // Simulate API delay
            setTimeout(() => {
                // Check against configured admin users
                const adminUser = ADMIN_USERS.find(
                    user => user.username === username && user.password === password
                );

                console.log('Found admin user:', adminUser);

                if (adminUser) {
                    const user: User = {
                        id: adminUser.username,
                        username: adminUser.username,
                        role: adminUser.role
                    };
                    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
                    console.log('User saved to localStorage:', user);
                    resolve(user);
                } else {
                    console.log('No matching user found');
                    reject(new Error('Credenciales inválidas'));
                }
            }, 500);
        });
    },

    // Logout
    logout: (): void => {
        localStorage.removeItem(AUTH_KEY);
    },

    // Get current user
    getCurrentUser: (): User | null => {
        try {
            const userStr = localStorage.getItem(AUTH_KEY);
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return auth.getCurrentUser() !== null;
    },

    // Check if user is admin
    isAdmin: (): boolean => {
        const user = auth.getCurrentUser();
        return user?.role === 'admin';
    }
};
