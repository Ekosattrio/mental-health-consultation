import type {FormEvent} from 'react';
import {useForm, usePage, Link} from '@inertiajs/react';
import WebLayout from '../../layouts/WebLayout';
import GoogleSignIn from '../../components/GoogleSignIn';
import type {WebPageProps} from '../../types/web';

export default function Login() {
  const {routes} = usePage<WebPageProps>().props;
  const form = useForm({email: '', password: ''});

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.post(routes.login, {onFinish: () => form.reset('password')});
  };

  return <WebLayout title="Masuk">
    <section className="max-w-md mx-auto px-4 py-16">
      <form onSubmit={submit} className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-5">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Masuk ke JiwaSehat</h1><p className="text-sm text-slate-500 mt-2">Gunakan email dan kata sandi akun Anda.</p></div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-2">Email atau username</label>
          <input id="email" name="email" type="text" autoComplete="username" autoFocus required maxLength={254} value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-3" aria-invalid={Boolean(form.errors.email)} aria-describedby={form.errors.email ? 'email-error' : undefined} />
          {form.errors.email && <p id="email-error" role="alert" className="text-sm text-red-700 mt-2">{form.errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold mb-2">Kata sandi</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={255} value={form.data.password} onChange={e => form.setData('password', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-3" aria-invalid={Boolean(form.errors.password)} aria-describedby={form.errors.password ? 'password-error' : undefined} />
          {form.errors.password && <p id="password-error" role="alert" className="text-sm text-red-700 mt-2">{form.errors.password}</p>}
        </div>
        <button type="submit" disabled={form.processing} className="w-full rounded-xl bg-teal-700 py-3 text-white font-bold disabled:opacity-60">{form.processing ? 'Memproses…' : 'Masuk'}</button>
        <div className="flex justify-between text-sm text-teal-800"><Link href="/register">Buat akun pasien</Link><Link href="/forgot-password">Lupa kata sandi?</Link></div>
        <GoogleSignIn/>
      </form>
    </section>
  </WebLayout>;
}
