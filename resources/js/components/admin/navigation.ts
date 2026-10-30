import { CalendarCheck, CalendarClock, Star, Users } from 'lucide-react';

export const adminNavigation = [
  { id: 'reservations', label: 'Booking & Pembayaran', icon: CalendarCheck },
  { id: 'requests', label: 'Pengajuan Reschedule', icon: CalendarClock },
  { id: 'users', label: 'Monitoring User', icon: Users },
  { id: 'reviews', label: 'Moderasi Review', icon: Star }
] as const;

export type AdminTabId = typeof adminNavigation[number]['id'];
