import type {ReactNode} from 'react';
import {EkoShell} from '../integration/EkoShell';

// Semua halaman server memakai navbar/footer FE Eko yang sama.
export default function WebLayout({title,children}:{title:string;children:ReactNode;branding?:{logo?:string;footer?:string}}) {
  return <EkoShell title={title}>{children}</EkoShell>;
}
