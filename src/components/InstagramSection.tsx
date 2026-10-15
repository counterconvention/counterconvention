import React from 'react';
import { useStore } from '../context/StoreContext';
import { instagramFeedPosts } from '../data/initialData';
import { Heart, MessageCircle, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export const InstagramSection: React.FC = () => {
  const { settings, products, setSelectedProduct } = useStore();

  // If Instagram module is disabled in settings, do not render
  if (settings.instagramEnabled === false) {
    return null;
  }

  const handlePostClick = (productId?: string) => {
    if (!productId) {
      if (settings.instagramUrl) window.open(settings.instagramUrl, '_blank');
      return;
    }
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setSelectedProduct(prod);
    } else if (settings.instagramUrl) {
      window.open(settings.instagramUrl, '_blank');
    }
  };

  return (
    <section className="py-8 sm:py-10 bg-white border-t border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Profile Showcase Bar */}
        <div className="bg-neutral-50/90 rounded-2xl p-3.5 sm:p-4 border border-neutral-200/80 shadow-2xs mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              {/* Compact Avatar with Instagram ring */}
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center overflow-hidden">
                  <span className="font-sans text-base sm:text-lg font-bold text-rose-200">
                    {(settings.storeName || 'R').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-sans text-sm sm:text-base font-bold text-neutral-900">
                    @{settings.instagramUser || 'replace'}
                  </h3>
                  <CheckCircle2 className="w-4 h-4 text-rose-600 fill-rose-100" />
                  <span className="text-neutral-300 hidden sm:inline">•</span>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-600">
                    <span>
                      <strong className="text-neutral-900 font-semibold">{settings.instagramPostsCount || 0}</strong> posts
                    </span>
                    <span>
                      <strong className="text-neutral-900 font-semibold">{settings.instagramFollowers || '0k'}</strong> seguidores
                    </span>
                  </div>
                </div>

                {/* Mobile stats line */}
                <div className="flex sm:hidden items-center justify-center gap-3 text-[11px] text-neutral-600">
                  <span>
                    <strong className="text-neutral-900 font-semibold">{settings.instagramPostsCount || 0}</strong> posts
                  </span>
                  <span>
                    <strong className="text-neutral-900 font-semibold">{settings.instagramFollowers || '0k'}</strong> seguidores
                  </span>
                </div>

                <p className="text-xs text-neutral-600 max-w-xl whitespace-pre-line leading-relaxed">
                  {settings.instagramBio || 'replace here bio'}
                </p>
              </div>
            </div>

            {/* Compact Follow on Instagram Button */}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-instagram-follow"
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs transition-all active:scale-98 shrink-0 w-full sm:w-auto"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Seguir</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}
          </div>
        </div>

        {/* Gallery Feed Grid Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
              <h2 className="font-sans text-base sm:text-lg font-bold text-neutral-900">
                Galeria & Comunidade
              </h2>
            </div>
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              >
                <span>Ver perfil</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {instagramFeedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post.productId)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 shadow-2xs hover:shadow-md cursor-pointer transition-all border border-neutral-200/80"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Hover overlay with likes and direct link */}
                <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/20 rounded-md backdrop-blur-xs self-start">
                    Ver Produto
                  </span>

                  <div className="space-y-1">
                    <p className="text-[11px] line-clamp-2 text-neutral-200 font-medium">
                      {post.caption}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-300 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-neutral-300" /> {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
