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
        const emailExists = existingUsers.some(
          u => u.email.toLowerCase() === request.email.toLowerCase().trim()
        );
        if (emailExists) {
          throw new ApiError('Alamat email sudah terdaftar. Silakan gunakan email lain.', 409);
        }

        const newId = `user-${request.role.toLowerCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
        const avatar =
          request.role === 'PSYCHOLOGIST'
            ? 'https://images.unsplash.com/photo-1594824813571-638f026361a1?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

        const newUser: User = {
          id: newId,
          email: request.email.trim(),
          name: request.name.trim(),
          role: request.role,
          avatar,
          status: request.role === 'PSYCHOLOGIST' ? 'PENDING_VERIFICATION' : 'ACTIVE',
          phone: request.phone.trim(),
          isVerified: request.role !== 'PSYCHOLOGIST',
          createdAt: new Date().toISOString().slice(0, 10)
        };

        let profile: PsychologistProfile | undefined;
        if (request.role === 'PSYCHOLOGIST') {
          profile = {
            userId: newId,
            title: 'Psikolog Klinis (Pendaftar Baru)',
            strNumber: 'STR-REG-' + Date.now().toString().slice(-5),
            sipNumber: 'SIP-REG-' + Date.now().toString().slice(-5),
            experienceYears: 1,
            bio: `Profil profesional ${request.name}. Akun baru terdaftar dan siap melayani konsultasi.`,
            specialties: ['Konseling Umum', 'Manajemen Stres'],
            therapyApproaches: ['Cognitive Behavioral Therapy (CBT)'],
            rating: 5.0,
            reviewCount: 0,
            consultationFeeOnline: 200000,
            consultationFeeOffline: 300000,
            languages: ['Bahasa Indonesia'],
            clinicAddress: 'JiwaSehat Clinic Center, Lt. 3, Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
            isAvailableToday: true
          };
        }

        return { user: newUser, profile };
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

