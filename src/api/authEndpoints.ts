import { ApiClient, ApiResponse, ApiError } from './apiClient';
import { User, UserRole, PsychologistProfile } from '../types';

export interface LoginRequest {
  role: UserRole;
  userId?: string;
  email?: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
}

export interface AuthSessionResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export class AuthEndpoints {
  public static readonly BASE_URL = '/api/v1/auth';

  /**
   * POST /api/v1/auth/login
   */
  public static async login(
    request: LoginRequest,
    allUsers: User[]
  ): Promise<ApiResponse<AuthSessionResponse>> {
    return ApiClient.post(
      `${this.BASE_URL}/login`,
      request,
      () => {
        let user: User | undefined;
        if (request.userId) {
          user = allUsers.find(u => u.id === request.userId);
        } else if (request.email) {
          user = allUsers.find(u => u.email.toLowerCase() === request.email?.toLowerCase().trim());
        } else {
          user = allUsers.find(u => u.role === request.role);
        }

        if (!user) {
          throw new ApiError('Pengguna tidak ditemukan dalam sistem.', 404);
        }

        if (user.role !== request.role) {
          throw new ApiError('Role login tidak sesuai dengan akun pengguna.', 403);
        }

        if (user.status === 'BLOCKED') {
          throw new ApiError('Akun Anda ditangguhkan. Silakan hubungi admin.', 403);
        }

        return {
          user,
          token: `jwt_mock_${user.id}_${Date.now()}`,
          expiresIn: 86400
        };
      }
    );
  }

  /**
   * POST /api/v1/auth/register
   */
  public static async register(
    request: RegisterRequest,
    existingUsers: User[]
  ): Promise<ApiResponse<{ user: User; profile?: PsychologistProfile }>> {
    return ApiClient.post(
      `${this.BASE_URL}/register`,
      request,
      () => {
        if (request.role !== 'PATIENT') {
          throw new ApiError('Registrasi publik hanya tersedia untuk akun pasien.', 403);
        }

        const emailExists = existingUsers.some(
          u => u.email.toLowerCase() === request.email.toLowerCase().trim()
        );
        if (emailExists) {
          throw new ApiError('Alamat email sudah terdaftar. Silakan gunakan email lain.', 409);
        }

        const newId = `user-${request.role.toLowerCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
        const avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

        const newUser: User = {
          id: newId,
          email: request.email.trim(),
          name: request.name.trim(),
          role: request.role,
          avatar,
          status: 'ACTIVE',
          phone: request.phone.trim(),
          isVerified: true,
          createdAt: new Date().toISOString().slice(0, 10)
        };

        return { user: newUser, profile: undefined };
      }
    );
  }

  /**
   * GET /api/v1/auth/me
   */
  public static async getProfile(userId: string, users: User[]): Promise<ApiResponse<User>> {
    return ApiClient.get(`${this.BASE_URL}/me?userId=${userId}`, () => {
      const user = users.find(u => u.id === userId);
      if (!user) throw new ApiError('Pengguna tidak ditemukan', 404);
      return user;
    });
  }
}

