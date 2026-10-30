import {lazy,Suspense,type ReactNode} from 'react';
import {Head,usePage} from '@inertiajs/react';
import {ServerAppProvider} from './ServerAppProvider';
import {Navbar} from '../components/layout/Navbar';
import {Footer} from '../components/layout/Footer';
import {ToastContainer} from '../components/common/ToastContainer';
import {AppErrorBoundary} from '../components/common/AppErrorBoundary';
import {useApp} from '../context/AppContextCore';
import type {PublicLandingData,WebPageProps} from '../types/web';

const LoginModal=lazy(()=>import('../components/auth/LoginModal').then(module=>({default:module.LoginModal})));
function LoginDialog(){
  const {isLoginModalOpen}=useApp();
  if(!isLoginModalOpen)return null;
  return <Suspense fallback={<div role="status" className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/40 p-4"><p className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-700">Memuat formulir masuk…</p></div>}><LoginModal/></Suspense>;
}

export function EkoShell({title,children}:{title:string;children:ReactNode}) {
  const page=usePage<WebPageProps&{public_landing?:PublicLandingData}>();
  return <ServerAppProvider publicLanding={page.props.public_landing}><AppErrorBoundary><Head title={title}/><div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 w-full max-w-full"><Navbar/><ToastContainer/>{page.props.flash.status&&<p role="status" className="mx-auto w-full max-w-7xl px-4 py-3 text-sm text-teal-800">{page.props.flash.status}</p>}<main className="flex-1 min-w-0 w-full">{children}</main><Footer/><LoginDialog/></div></AppErrorBoundary></ServerAppProvider>;
}
