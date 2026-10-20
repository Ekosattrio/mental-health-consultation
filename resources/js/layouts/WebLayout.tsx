import type {ReactNode} from 'react';
import {Head, Link, usePage} from '@inertiajs/react';
import {HeartHandshake} from 'lucide-react';
import type {WebPageProps} from '../types/web';

export default function WebLayout({title, children}: {title: string; children: ReactNode}) {
  const {app, auth, routes, flash} = usePage<WebPageProps>().props;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Head title={title} />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href={routes.home} className="flex items-center gap-2 text-xl font-extrabold text-teal-800">
            <HeartHandshake className="w-7 h-7" />{app.name}
          </Link>
          <nav aria-label="Navigasi utama" className="flex gap-3 items-center text-sm">
            <Link href={routes.home} className="text-slate-600 hover:text-teal-700">Beranda</Link>
            {auth.user ? <>
              <Link href={routes.dashboard} className="font-semibold text-teal-700">Dashboard</Link>
              <Link href={routes.logout} method="post" as="button" className="rounded-xl px-4 py-2 border border-slate-300">Keluar</Link>
            </> : <Link href={routes.login} className="rounded-xl px-4 py-2 bg-teal-700 text-white font-semibold">Masuk</Link>}
          </nav>
        </div>
      </header>
      {flash.status && <p role="status" className="max-w-7xl w-full mx-auto p-4 text-teal-800">{flash.status}</p>}
      <main className="flex-1">{children}</main>
      <footer className="bg-slate-900 text-slate-300 px-4 py-8 text-center text-sm">
        <p>{app.name} · Konseling, asesmen dan psikoterapi</p>
        {app.preview_url && <Link href={app.preview_url} className="inline-block mt-3 underline">Pratinjau desain Eko (data demo lokal)</Link>}
      </footer>
    </div>
  );
}
