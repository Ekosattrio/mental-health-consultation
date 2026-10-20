import {useState} from 'react';
import {router, usePage} from '@inertiajs/react';
import {LandingPageView, type LandingViewData} from '../components/landing/LandingPageView';
import WebLayout from '../layouts/WebLayout';
import type {PublicLandingData, WebPageProps} from '../types/web';

export default function Home({public_landing}: {public_landing: PublicLandingData}) {
  const {auth, routes} = usePage<WebPageProps>().props;
  const [notice, setNotice] = useState('');
  const practice = public_landing.practice;
  const openPortal = () => router.visit(auth.user ? routes.dashboard : routes.login);

  // Adapter eksplisit DTO snake_case ke view model camelCase komponen Eko.
  const data: LandingViewData = {
    currentUser: auth.user,
    currentRole: auth.user?.role ?? 'GUEST',
    openAuthModal: openPortal,
    showToast: (_title, message) => setNotice(message),
    users: [{id: 'practice', name: practice.name, role: 'PSYCHOLOGIST', avatar: ''}],
    psychologists: [{
      userId: 'practice', title: practice.title, strNumber: practice.str_number, sipNumber: practice.sip_number,
      experienceYears: 0, bio: practice.bio, specialties: [], therapyApproaches: [], rating: 0,
      reviewCount: 0, languages: ['Bahasa Indonesia'], clinicAddress: practice.clinic_address, isAvailableToday: false,
    }],
    packages: public_landing.packages.map(item => ({
      id: item.service_code, name: item.name,
      category: ({COUNSELING: 'KONSELING', ASSESSMENT: 'ASESMEN', PSYCHOTHERAPY: 'PSIKOTERAPI'} as const)[item.category],
      type: item.category === 'ASSESSMENT' ? 'BUNDLING_ASSESSMENT' : item.category === 'PSYCHOTHERAPY' ? 'PSYCHOTHERAPY' : 'OFFLINE_CLINIC',
      durationMinutes: item.duration_minutes ?? 0, description: item.description, benefits: item.benefits,
      isActive: true, iconName: '',
      // Tidak menambahkan price=0 atau harga mock ke data publik.
    })),
    reviews: public_landing.reviews.map((item, index) => ({
      id: `public-review-${index}`, patientName: item.display_name, isAnonymous: false, rating: item.rating,
      comment: item.comment, createdAt: item.published_on, isApproved: true,
    })),
    landingCms: {
      heroBadge: 'Konseling, Asesmen dan Psikoterapi',
      heroTitle: 'Ruang Aman untuk Mendengar dan Bertumbuh.',
      heroSubtitle: 'Layanan psikologi terjadwal sesuai kebutuhan dan ketersediaan praktisi.',
      sliderTitle: 'Layanan Praktik', sliderSubtitle: 'Informasi layanan JiwaSehat.',
      sliderIntervalSeconds: 4, sliderAutoPlay: false,
      clinicName: practice.clinic_name, clinicAddress: practice.clinic_address, clinicHours: practice.clinic_hours,
      clinicPhone: practice.clinic_phone, clinicWhatsapp: practice.clinic_whatsapp, clinicEmail: practice.clinic_email,
    },
  };

  return <WebLayout title="Beranda">
    <p role="status" className="bg-teal-50 px-4 py-3 text-center text-sm text-teal-900">Informasi praktik sedang dilengkapi. Pemesanan online belum diaktifkan.</p>
    {notice && <p role="status" className="max-w-7xl mx-auto p-4 text-sm text-teal-800">{notice}</p>}
    <LandingPageView data={data} onSelectBooking={openPortal} />
  </WebLayout>;
}
