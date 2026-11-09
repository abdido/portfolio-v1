const base = process.env.PRODUCTION_URL || 'https://portfolio-apps.abdillah-portfolio.workers.dev';
const paths = [
  '/',
  '/api/auth/session',
  '/api/data',
  '/api/admin/data',
  '/uploads/images/logo-ahe-dan-beyza-education-1787467436118-3535.png',
];
for (const pathname of paths) {
  try {
    let response;
    let protocol = 'https';
    try {
      response = await fetch(base + pathname);
    } catch {
      protocol = 'http-fallback';
      response = await fetch(base.replace(/^https:/, 'http:') + pathname);
    }
    const body = await response.arrayBuffer();
    console.log(JSON.stringify({ pathname, protocol, status: response.status, type: response.headers.get('content-type'), bytes: body.byteLength }));
  } catch (error) {
    console.log(JSON.stringify({ pathname, error: error instanceof Error ? error.message : String(error) }));
  }
}
