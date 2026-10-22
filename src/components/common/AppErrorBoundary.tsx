import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main role="alert" className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
        <div className="mx-auto max-w-lg space-y-4">
          <p className="text-lg font-bold text-teal-800">JiwaSehat</p>
          <AlertCircle className="h-8 w-8 text-amber-600" />
          <h1 className="text-xl font-bold">Data aplikasi belum dapat dimuat</h1>
          <p className="text-sm leading-6 text-slate-600">Periksa koneksi dan akses penyimpanan browser. Data tidak direset otomatis. Jika sudah melakukan pembayaran, jangan transfer ulang; hubungi admin sebelum mencoba kembali.</p>
          <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">
            <RotateCcw className="h-4 w-4" />Muat ulang
          </button>
        </div>
      </main>
    );
  }
}
