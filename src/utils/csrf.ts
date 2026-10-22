export const readXsrfCookie = (cookies: string): string | undefined => {
  const cookie = cookies.split(';').map(part => part.trim()).find(part => part.startsWith('XSRF-TOKEN='));
  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : undefined;
};
