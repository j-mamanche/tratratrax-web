import { cabecera } from '../../../lib/sesion.mjs';

export const prerender = false;

export const POST = () =>
  new Response(null, {
    status: 303,
    headers: { Location: '/entrar', 'Set-Cookie': cabecera('') },
  });
