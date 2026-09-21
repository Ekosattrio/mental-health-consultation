export type ToastCallback = (
  title: string,
  message: string,
  type?: 'success' | 'info' | 'error' | 'warning'
) => void;

/**
 * Base Controller (OOP)
 * Provides common notification dispatcher and error formatting across all role controllers.
 */
export abstract class BaseController {
  protected notify: ToastCallback;

  constructor(notify: ToastCallback) {
    this.notify = notify;
  }

  protected handleError(err: any, fallbackTitle = 'Terjadi Kesalahan'): void {
    const message = err?.message || 'Permintaan gagal diproses. Silakan coba lagi.';
    this.notify(fallbackTitle, message, 'error');
  }
}

