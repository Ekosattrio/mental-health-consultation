import {usePage} from '@inertiajs/react';
import WebLayout from '../layouts/WebLayout';
import type {WebPageProps} from '../types/web';

export default function Dashboard({dashboard}: {dashboard: {title: string}}) {
  const {auth} = usePage<WebPageProps>().props;

  return <WebLayout title={dashboard.title}>
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <h1 className="text-3xl font-extrabold">{dashboard.title}</h1>
        <p className="mt-3 text-slate-600">Selamat datang, {auth.user?.name}.</p>
        <p className="mt-6 text-sm text-slate-500">Fitur layanan sedang disiapkan. Silakan hubungi administrasi praktik untuk bantuan.</p>
      </div>
    </section>
  </WebLayout>;
}
