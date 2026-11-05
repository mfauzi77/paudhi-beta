import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <>
      <main className="min-h-[65vh] flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-blue-600 font-bold text-lg">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-3">Halaman tidak ditemukan</h1>
        <p className="text-gray-600 mt-4">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p>
        <Link to="/" className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">Kembali ke Beranda</Link>
      </main>
      <Footer />
    </>
  );
}
