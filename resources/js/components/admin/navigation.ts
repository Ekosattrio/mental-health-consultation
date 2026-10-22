import { Calendar, CalendarCheck, CalendarClock, ClipboardList, History, Layers, LayoutTemplate, Star, Users } from 'lucide-react';

export const adminNavigation = [
  { id: 'reservations', label: 'Booking & Pembayaran', icon: CalendarCheck },
  { id: 'requests', label: 'Pengajuan Reschedule', icon: CalendarClock },
  { id: 'treatmentPlans', label: 'Paket Berjalan', icon: ClipboardList },
  { id: 'operations', label: 'Operasional Sesi', icon: History },
  { id: 'schedule', label: 'Kalender Praktik', icon: Calendar },
  { id: 'packages', label: 'Layanan & Harga', icon: Layers },
  { id: 'cms', label: 'Konten Publik', icon: LayoutTemplate },
  { id: 'users', label: 'Monitoring User', icon: Users },
  { id: 'reviews', label: 'Moderasi Review', icon: Star }
] as const;

export type AdminTabId = typeof adminNavigation[number]['id'];
