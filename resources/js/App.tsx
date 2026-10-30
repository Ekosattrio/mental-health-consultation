import {AppProvider} from './context/AppContext';
import {AppContent} from './components/AppContent';
import {AppErrorBoundary} from './components/common/AppErrorBoundary';
export {AppContent} from './components/AppContent';

export default function App() {
  return (
    <AppErrorBoundary>
    <AppProvider>
      <AppContent />
    </AppProvider>
    </AppErrorBoundary>
  );
}
