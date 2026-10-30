import {StrictMode} from 'react';
import type {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import {createInertiaApp} from '@inertiajs/react';
import {resolveInertiaPage} from './integration/resolveInertiaPage';
import '../css/app.css';

const pages = import.meta.glob<{default: ComponentType}>('./pages/**/*.tsx');

void createInertiaApp({
  title: (title) => title ? `${title} — JiwaSehat` : 'JiwaSehat',
  resolve: (name) => resolveInertiaPage(pages, name),
  setup({el, App, props}) {
    createRoot(el).render(<StrictMode><App {...props} /></StrictMode>);
  },
});
