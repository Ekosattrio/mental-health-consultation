import {StrictMode} from 'react';
import type {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import {createInertiaApp} from '@inertiajs/react';
import '../css/app.css';

const pages = import.meta.glob<{default: ComponentType}>('./pages/**/*.tsx');

void createInertiaApp({
  title: (title) => title ? `${title} — JiwaSehat` : 'JiwaSehat',
  resolve: async (name) => {
    const load = pages[`./pages/${name}.tsx`];
    if (!load) throw new Error(`Halaman Inertia tidak ditemukan: ${name}`);
    return (await load()).default;
  },
  setup({el, App, props}) {
    createRoot(el).render(<StrictMode><App {...props} /></StrictMode>);
  },
});
