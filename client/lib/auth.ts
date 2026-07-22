const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}`;

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  user_type: 'admin' | 'client';
  role: string;
  can_edit_content: boolean;
  client_id?: number;
  admin_id?: number;
  permissions: {
    [key: string]: boolean;
  };
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          this.user = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('user_data');
        }
      }
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login failed:', response.status, errorText);
      throw new Error(`Login failed: ${response.status}`);
    }

    const responseData = await response.json();
    const data: AuthResponse = responseData.data || responseData;
    this.token = data.access;
    this.user = data.user;

    // Console log the user details
    console.log('🔐 User Login Successful');
    console.log('👤 Username:', data.user.username);
    console.log('👥 User Type:', data.user.user_type);
    console.log('🎭 Role:', data.user.role);
    console.log('✏️ Can Edit Content:', data.user.can_edit_content);
    console.log('🛡️ Is Superuser:', data.user.is_superuser);
    console.log('📝 Is Staff:', data.user.is_staff);
    console.log('🔑 Permissions:', data.user.permissions);

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }

    return data;
  }

  logout(): void {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user_data');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  canEdit(): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }
    
    // Only allow super_admin and content_editor roles
    const allowedRoles = ['super_admin', 'content_editor'];
    const canEdit = this.user?.is_superuser || allowedRoles.includes(this.user?.role || '');
    
    return canEdit;
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && this.user?.user_type === 'admin';
  }

  isClient(): boolean {
    return this.isAuthenticated() && this.user?.user_type === 'client';
  }

  hasPermission(permission: string): boolean {
    return this.isAuthenticated() && (this.user?.permissions[permission] || false);
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401, try to refresh the token
    if (response.status === 401 && this.token) {
      console.log('Token expired, attempting refresh...');
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the request with new token
        headers['Authorization'] = `Bearer ${this.token}`;
        return fetch(url, {
          ...options,
          headers,
        });
      } else {
        // Refresh failed, logout user
        this.logout();
        window.location.href = "/login/";
      }
    }

    return response;
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.access;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.access);
        }
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }
}