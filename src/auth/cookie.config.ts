import { CookieOptions } from 'express';

const isHttps = process.env.APP_URL?.startsWith('https://');

export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
