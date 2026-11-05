import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const pages = {
  '/': ['SISMONEV CERIA', 'Akses data, capaian program, dan informasi layanan PAUD Holistik Integratif untuk mendukung tumbuh kembang anak Indonesia.'],
  '/about': ['SISMONEV CERIA', 'Kenali tujuan dan kolaborasi lintas sektor PAUD Holistik Integratif.'],
  '/faq': ['SISMONEV CERIA', 'Temukan jawaban mengenai layanan dan pelaksanaan PAUD Holistik Integratif.'],
  '/education': ['SISMONEV CERIA', 'Panduan dan materi pembelajaran PAUD Holistik Integratif.'],
  '/ran-paud-dashboard': ['SISMONEV CERIA', 'Jelajahi capaian dan pelaporan program RAN PAUDHI.'],
  '/peta-daycare': ['SISMONEV CERIA', 'Jelajahi peta wilayah Indonesia untuk sebaran daycare.'],
  '/essential-services': ['SISMONEV CERIA', 'Informasi layanan esensial untuk tumbuh kembang anak usia dini.'],
  '/layanan-paud-hi': ['SISMONEV CERIA', 'Data dan informasi layanan PAUD Holistik Integratif.'],
  '/maknalogo': ['SISMONEV CERIA', 'Makna dan filosofi logo PAUD Holistik Integratif.'],
};
export function setPageMetadata(title, description, pathname, image = '/logo.png', type = 'website') {
  document.title = title;
  const set = (key, content, property = false) => {
    const attr = property ? 'property' : 'name';
    let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attr, key); document.head.appendChild(tag); }
    tag.content = content;
  };
  const url = new URL(pathname, 'https://paudhi.kemenkopmk.go.id').href;
  set('description', description);
  for (const [key,value] of Object.entries({ title, description, url, image: new URL(image || '/logo.png', 'https://paudhi.kemenkopmk.go.id').href, type })) set(`og:${key}`, value, true);
  for (const [key,value] of Object.entries({ title, description, url, image: new URL(image || '/logo.png', 'https://paudhi.kemenkopmk.go.id').href })) set(`twitter:${key}`, value, true);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = url;
}
export default function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const isNews = pathname.startsWith('/news/');
    const page = pages[pathname];
    const privatePage = /^\/(admin|login)(\/|$)/.test(pathname);
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = privatePage || (!page && !isNews && !pathname.startsWith('/ceria')) ? 'noindex, follow' : 'index, follow';
    if (!isNews) setPageMetadata(...(page || ['SISMONEV CERIA', 'Sistem monitoring dan evaluasi layanan PAUD Holistik Integratif.']), pathname);
  }, [pathname]);
  return null;
}
