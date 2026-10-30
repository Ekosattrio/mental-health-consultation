import {useApp} from '../../context/AppContextCore';
import {LandingPageView} from './LandingPageView';

// Adapter khusus pratinjau prototype; halaman web memakai props dari Laravel.
export const LandingPage = ({onSelectBooking}: {onSelectBooking: (psychologistId?: string, packageId?: string) => void}) => (
  <LandingPageView data={useApp()} onSelectBooking={onSelectBooking} />
);
