export type AccountRole = 'PATIENT' | 'ADMIN' | 'PSYCHOLOGIST';

export interface WebPageProps {
  [key: string]: unknown;
  google_signin?:{enabled:boolean;client_id:string|null;nonce:string|null;auto_select:boolean;profile_import:boolean};
  app: { name: string; preview_url: string | null;logo_url?:string|null;footer_text?:string|null };
  auth: { user: { id: string; name: string; email: string; role: AccountRole } | null };
  routes: { home: string; login: string; logout: string; dashboard: string };
  flash: { status: string | null };
}

export interface PublicLandingData {
  tutorials?:{id:string;version:number;title:string;steps:string[];video_url:string|null}[];
  booking_enabled?:boolean;
  preview?:{version:number;status:string}|null;
  cms?:Partial<import('./index').LandingPageCmsConfig>;
  practice: {
    name: string; title: string; bio: string; str_number: string; sip_number: string;
    clinic_name: string; clinic_address: string; clinic_hours: string;
    clinic_phone: string; clinic_whatsapp: string; clinic_email: string;
  };
  packages: Array<{
    service_code: string; name: string; category: 'COUNSELING' | 'ASSESSMENT' | 'PSYCHOTHERAPY';
    duration_minutes: number | null; description: string; benefits: string[]; is_bookable: boolean; normal_price?:number;final_price?:number;
  }>;
  reviews: Array<{ display_name: string; rating: number; comment: string; published_on: string }>;
}
