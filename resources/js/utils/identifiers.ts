const createUuid = (): string => {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi) {
    throw new Error('Browser tidak mendukung pembuatan ID akun yang aman.');
  }

  if (typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  // getRandomValues tetap tersedia pada lingkungan HTTP lokal tanpa randomUUID.
  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

// Prefix mempertahankan format ID prototype; UUID membedakan setiap akun baru.
export const createPatientId = (): string => `user-pat-${createUuid()}`;
