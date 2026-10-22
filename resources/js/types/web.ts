export type AccountRole = 'PATIENT' | 'ADMIN' | 'PSYCHOLOGIST';

export interface WebPageProps {
  [key: string]: unknown;
  app: { name: string; preview_url: string | null };
  auth: { user: { id: string; name: string; email: string; role: AccountRole } | null };
  routes: { home: string; login: string; logout: string; dashboard: string };
  flash: { status: string | null };
}

export interface PublicLandingData {
  practice: {
    name: string; title: string; bio: string; str_number: string; sip_number: string;
    clinic_name: string; clinic_address: string; clinic_hours: string;
    clinic_phone: string; clinic_whatsapp: string; clinic_email: string;
  };
  packages: Array<{
    service_code: string; name: string; category: 'COUNSELING' | 'ASSESSMENT' | 'PSYCHOTHERAPY';
    duration_minutes: number | null; description: string; benefits: string[]; is_bookable: boolean;
  }>;
  reviews: Array<{ display_name: string; rating: number; comment: string; published_on: string }>;
}
