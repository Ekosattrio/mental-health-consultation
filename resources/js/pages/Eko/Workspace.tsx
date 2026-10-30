import {Head} from '@inertiajs/react';
import {ServerAppProvider} from '../../integration/ServerAppProvider';
import {AppContent} from '../../components/AppContent';
import {AppErrorBoundary} from '../../components/common/AppErrorBoundary';
import type {Workspace as WorkspaceData} from '../../types/practice';

export default function Workspace({workspace}:{workspace:WorkspaceData}) {
  return <AppErrorBoundary><ServerAppProvider workspace={workspace}><Head title={workspace.role==='PATIENT'?'Ruang Pasien':workspace.role==='ADMIN'?'Administrasi Praktik':'Pengelolaan Praktik'}/><AppContent/></ServerAppProvider></AppErrorBoundary>;
}
