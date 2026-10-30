import type {ComponentType} from 'react';

type PageLoaders = Record<string, () => Promise<{default: ComponentType}>>;

export function PageLoadFailure() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <div role="alert" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h1 className="text-lg font-bold text-slate-900">Halaman belum berhasil dimuat</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">Sambungan ke file halaman terputus. Muat ulang halaman untuk mencoba kembali.</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-5 min-h-11 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800">Muat ulang halaman</button>
    </div>
  </main>;
}

export async function resolveInertiaPage(pages: PageLoaders, name: string): Promise<ComponentType> {
  const load = pages[`./pages/${name}.tsx`];
  if (!load) throw new Error(`Halaman Inertia tidak ditemukan: ${name}`);
  try {
    return (await load()).default;
  } catch (error) {
    // Sesi login sudah dapat terbentuk; jangan mengulang POST atau reload otomatis.
    console.error(`Gagal memuat halaman ${name}`, error);
    return PageLoadFailure;
  }
}
