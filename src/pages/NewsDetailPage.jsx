import { setPageMetadata } from '../components/PageMetadata';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNewsItem } from '../hooks/useApi';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import Footer from '../components/Footer';
import NewsImage from '../components/common/NewsImage';
import LoadingSpinner from '../components/LoadingSpinner';

const NewsDetailPage = () => {
    const { id } = useParams();
    const { news: rawNews, loading, error } = useNewsItem(id);

    // Scroll to top when article changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Handle both wrapped (.data) and unwrapped response
    const article = rawNews?.success ? rawNews.data : rawNews;

    useEffect(() => {
        setPageMetadata(article?.title ? article.title + ' | PAUDHI Kemenko PMK' : 'Berita PAUDHI | Kemenko PMK',
          (article?.excerpt || article?.content || 'Informasi dan berita PAUD Holistik Integratif.').replace(/<[^>]*>/g, '').slice(0, 160),
          '/news/' + id, article?.image || '/logo.png', article ? 'article' : 'website');
        if (!loading && (error || !article)) {
          const robots = document.head.querySelector('meta[name="robots"]');
          if (robots) robots.content = 'noindex, follow';
        }
    }, [article, id, loading, error]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Memuat berita..." />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Berita Tidak Ditemukan</h2>
                        <p className="text-gray-600 mb-6">{error || 'Maaf, artikel yang Anda cari tidak tersedia atau telah dihapus.'}</p>
                        <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium transition">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Beranda
                </Link>

                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Image */}
                    {article.image && (
                        <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-gray-100">
                            <NewsImage 
                                src={article.image} 
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 sm:p-10">
                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold uppercase tracking-wider text-xs">
                                {article.category || 'Umum'}
                            </span>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5" />
                                {new Date(article.newsDate || article.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-1.5" />
                                {article.author?.klName || article.author?.fullName || 'Kemenko PMK'}
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
                            {article.title}
                        </h1>

                        {/* Content */}
                        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed border-t border-gray-100 pt-8 mt-8">
                            {/* Render content as HTML if it contains tags, otherwise text */}
                            {/<[a-z][\s\S]*>/i.test(article.content) ? (
                                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
                            ) : (
                                <p className="whitespace-pre-wrap">{article.content}</p>
                            )}
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t border-gray-100">
                                {article.tags.map((tag, idx) => (
                                    <span key={idx} className="flex items-center text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-md">
                                        <Tag className="w-3 h-3 mr-1.5" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default NewsDetailPage;
