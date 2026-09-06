// El panel no se indexa. La cabecera `X-Robots-Tag` de `netlify.toml` dice lo
// mismo; esto es lo que mira un crawler que ni siquiera pide la página.
export const prerender = false;

export function GET() {
  return new Response('User-agent: *\nDisallow: /\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
