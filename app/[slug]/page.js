// Clean student URLs: yoursite.vercel.app/<student-name>
// Reuses the portfolio page; old /p/<slug> links keep working too.
export { default, generateMetadata } from '../p/[slug]/page';
export const dynamic = 'force-dynamic';
