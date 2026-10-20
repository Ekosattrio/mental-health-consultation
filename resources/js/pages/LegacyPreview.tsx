import {Head, Link, usePage} from '@inertiajs/react';
import LegacyApp from '../App';
import type {WebPageProps} from '../types/web';

export default function LegacyPreview() {
  const {routes} = usePage<WebPageProps>().props;

  return <>
    <Head title="Pratinjau desain Eko" />
    <aside className="bg-amber-100 border-b border-amber-300 px-4 py-3 text-sm text-amber-950">
      Pratinjau lokal Eko memakai data demo/LocalStorage. Aksi di sini tidak masuk ke database praktik.
      {' '}<Link href={routes.home} className="underline font-bold">Kembali ke web</Link>
    </aside>
    <LegacyApp />
  </>;
}
