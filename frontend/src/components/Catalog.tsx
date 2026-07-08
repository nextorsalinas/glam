import { useEffect, useState, useRef } from 'react';
import { Video, Camera } from 'lucide-react';
import BookingModal from './BookingModal';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';

interface Hairstyle {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  imageUrl?: string;
  videoUrl?: string;
  tiktokText?: string;
  thumbnailUrl?: string;
  tags?: string[];
}

const LazyVideo = ({ src, poster, className }: { src: string, poster?: string, className?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(e => console.log('Auto-play prevented:', e));
        } else {
          videoRef.current?.pause();
        }
      });
    }, { threshold: 0.5 }); // Requiere 50% de visibilidad para reproducir

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      loop
      playsInline
      preload="none"
      className={className}
    />
  );
};

const ImageWithFade = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-white/5 ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto object-cover transition-all duration-500 ease-out group-hover:scale-105 ${loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'}`}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse min-h-[150px]" />
      )}
    </div>
  );
};

const Catalog = () => {
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<'all' | 'clips' | 'pics'>('pics');
  const [selectedPic, setSelectedPic] = useState<Hairstyle | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingHairstyleToBook, setPendingHairstyleToBook] = useState<Hairstyle | null>(null);

  // Booking state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHairstyleToBook, setSelectedHairstyleToBook] = useState<{id: string, name: string, price: number} | undefined>(undefined);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    fetch(`${API_URL}/api/services?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setHairstyles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching catalog:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (viewFilter === 'pics' && !selectedPic) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('fs-', '');
          const index = filteredHairstyles.findIndex(s => s.id === id);
          if (index !== -1) {
            setActiveIndex(index);
          }
        }
      });
    }, { threshold: 0.5 });

    const slides = document.querySelectorAll('.slide-item');
    slides.forEach(slide => observer.observe(slide));

    return () => {
      slides.forEach(slide => observer.unobserve(slide));
    };
  }, [viewFilter, selectedPic, hairstyles]);

  const handleBookClick = (style: Hairstyle) => {
    if (!user) {
      setPendingHairstyleToBook(style);
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedHairstyleToBook({ id: style.id, name: style.name, price: style.price });
    setIsBookingModalOpen(true);
  };

  const handleLoginSuccess = () => {
    if (pendingHairstyleToBook) {
      setSelectedHairstyleToBook({ 
        id: pendingHairstyleToBook.id, 
        name: pendingHairstyleToBook.name, 
        price: pendingHairstyleToBook.price 
      });
      setIsBookingModalOpen(true);
      setPendingHairstyleToBook(null);
    }
  };

  if (loading) {
    return (
      <div className="relative h-[100dvh] w-full bg-black overflow-hidden">
        <div className="h-full w-full p-4 pt-24 overflow-y-auto pb-20 scrollbar-hide">
          <div className="columns-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="relative break-inside-avoid mb-3 inline-block w-full rounded-2xl overflow-hidden shadow-lg bg-white/10 animate-pulse"
                style={{ height: i % 2 === 0 ? '250px' : '180px' }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (hairstyles.length === 0) {
    return (
      <div className="text-center py-20 bg-white/50 rounded-3xl backdrop-blur-sm border border-white/20">
        <p className="text-slate-500">No hay peinados disponibles en este momento.</p>
      </div>
    );
  }

  const filteredHairstyles = hairstyles.filter(style => {
    if (viewFilter === 'clips') return style.videoUrl && style.videoUrl.trim() !== '';
    if (viewFilter === 'pics') return !style.videoUrl || style.videoUrl.trim() === '';
    return true;
  });

  // Render para la vista Pinterest (cuadrícula de 2 columnas)
  if (viewFilter === 'pics' && !selectedPic) {
    return (
      <div className="relative h-[100dvh] w-full bg-black overflow-hidden">
        <div className="h-full w-full p-4 pt-24 overflow-y-auto pb-20 scrollbar-hide">
          <div className="columns-2 lg:columns-4 xl:columns-5 gap-4">
          {filteredHairstyles.map(style => (
            <div 
              key={style.id} 
              className="relative break-inside-avoid mb-3 inline-block w-full rounded-2xl overflow-hidden cursor-pointer shadow-lg bg-white/5 group"
              onClick={() => {
                setSelectedPic(style);
                setTimeout(() => {
                  document.getElementById(`fs-${style.id}`)?.scrollIntoView({ behavior: 'auto' });
                }, 50);
              }}
            >
              <ImageWithFade 
                src={style.thumbnailUrl || style.imageUrl || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/chongo_bajo_pulido.webp'} 
                alt={style.name} 
                className="w-full"
              />
            </div>
          ))}
        </div>
        {filteredHairstyles.length === 0 && (
          <div className="text-center mt-20 text-white/50">No hay imágenes disponibles.</div>
        )}
        </div>

        {/* Global Floating Menu */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-5">
            <button 
              onClick={() => setViewFilter('clips')}
              className="flex flex-col items-center gap-1 group transition-opacity opacity-80 text-white hover:opacity-100"
            >
              <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <Video size={26} />
              </div>
            </button>
            <button 
              onClick={() => setViewFilter('all')}
              className="flex flex-col items-center gap-1 group transition-opacity opacity-100 text-pink-400"
            >
              <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-pink-500/50">
                <Camera size={26} />
              </div>
            </button>
        </div>
      </div>
    );
  }

  // Lista a renderizar
  const itemsToRender = filteredHairstyles;

  return (
    <>
      <div className="relative h-[100dvh] w-full bg-black overflow-hidden">
        <div className="flex flex-col snap-y snap-mandatory h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hide relative">
          {!selectedPic && filteredHairstyles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50">
              <p>No hay contenido para este filtro.</p>
              <button onClick={() => setViewFilter('all')} className="mt-4 text-pink-500 underline">Ver todo</button>
            </div>
          ) : null}
          
          {itemsToRender.map((style, index) => (
          <div 
            key={style.id} 
            id={`fs-${style.id}`}
            className="slide-item relative w-full h-[100dvh] snap-start snap-always shrink-0 flex items-center justify-center bg-black overflow-hidden"
          >
            {/* Fondo difuminado detrás del video (por si no tiene la misma proporción) - Solo para videos */}
            {style.videoUrl && Math.abs(index - activeIndex) <= 1 && (
              <div 
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${style.imageUrl || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/chongo_bajo_pulido.webp'})` }}
              />
            )}

            {style.videoUrl ? (
              <>
                {Math.abs(index - activeIndex) <= 1 ? (
                  <LazyVideo 
                    src={style.videoUrl} 
                    poster={style.thumbnailUrl || style.imageUrl}
                    className="absolute inset-0 w-full h-full object-cover md:object-contain z-0"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 animate-pulse flex items-center justify-center">
                    <Video size={36} className="text-white/20" />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute top-20 left-0 right-0 bottom-0 z-0 flex items-center justify-center w-full h-full">
                {Math.abs(index - activeIndex) <= 1 ? (
                  <img 
                    src={style.imageUrl || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/chongo_bajo_pulido.webp'} 
                    alt={style.name} 
                    loading="lazy"
                    className="w-full h-full object-cover md:object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 animate-pulse flex items-center justify-center">
                    <Camera size={36} className="text-white/20" />
                  </div>
                )}
              </div>
            )}

            {/* Gradiente oscuro inferior para legibilidad del texto */}
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none"></div>

            {/* Interfaz tipo TikTok sobre el video */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 md:p-6 md:pb-24 z-20 flex flex-col items-start gap-2.5 pr-16 md:pr-20">
              <div className="flex flex-col gap-1 w-full">
                <h3 className="text-base md:text-xl font-normal text-white drop-shadow-lg leading-tight">
                  {style.name}
                </h3>
                {style.tiktokText && (
                  <p className="text-[11px] md:text-sm text-white/90 drop-shadow-md whitespace-pre-wrap leading-snug line-clamp-4">
                    {style.tiktokText}
                  </p>
                )}
              </div>
            </div>

          </div>
        ))}
        </div>

        {/* Global Floating Menu (Homologado) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-5">
          <button 
            onClick={() => setViewFilter(viewFilter === 'clips' ? 'all' : 'clips')}
            className={`flex flex-col items-center gap-1 group transition-opacity ${viewFilter === 'clips' ? 'opacity-100 text-pink-400' : 'opacity-80 text-white hover:opacity-100'}`}
          >
            <div className={`p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 ${viewFilter === 'clips' ? 'border-pink-500/50' : ''}`}>
              <Video size={26} />
            </div>
          </button>
          
          <button 
            onClick={() => {
              if (selectedPic) setSelectedPic(null);
              else setViewFilter(viewFilter === 'pics' ? 'all' : 'pics');
            }}
            className={`flex flex-col items-center gap-1 group transition-opacity ${viewFilter === 'pics' || selectedPic ? 'opacity-100 text-pink-400' : 'opacity-80 text-white hover:opacity-100'}`}
          >
            <div className={`p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 ${viewFilter === 'pics' || selectedPic ? 'border-pink-500/50' : ''}`}>
              <Camera size={26} />
            </div>
          </button>
        </div>
      </div>

      {/* Conditionally render Reservar button ONLY if current slide is NOT a video */}
      {itemsToRender[activeIndex] && !itemsToRender[activeIndex].videoUrl && (
        <div className="fixed bottom-24 left-6 z-[60]">
          <button 
            onClick={() => handleBookClick(itemsToRender[activeIndex])}
            className="py-2.5 px-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm rounded-full shadow-lg shadow-pink-500/40 active:scale-95 transition-all"
          >
            Reservar ahora
          </button>
        </div>
      )}
      
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        selectedHairstyle={selectedHairstyleToBook}
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Catalog;
