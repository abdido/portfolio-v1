export const createSeoSlug = title => String(title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function resolveRoute(pathname, articles) {
  const route = pathname.replace(/^\/+|\/+$/g,'');
  if(!route || route==='home') return {page:'home'};
  if(['about','contact','admin','projects','blog'].includes(route)) return {page:route};
  if(route.startsWith('blog/')) {
    const slug=route.slice(5);
    const article=articles.find(a=>(a.slug||a.id)===slug||a.id===slug);
    if(article) return {page:'article-detail',article};
  }
  return {page:'not-found'};
}
