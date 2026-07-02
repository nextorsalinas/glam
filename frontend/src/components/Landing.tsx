import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import glamLogo from '../assets/glam.svg';

const Landing = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // Si ya está logueado, lo mandamos directo al catálogo
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithGoogle();
      // El useEffect de arriba se encargará de redirigir a /app
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError(err?.message || 'Error al iniciar sesión. Intenta nuevamente.');
    }
  };

  return (
    <div className="relative h-[100dvh] w-full mx-auto overflow-hidden bg-black flex items-center justify-center">
      {/* Fondo de Masonry / Galería animada o estática */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="columns-2 lg:columns-4 xl:columns-5 gap-2 p-2">
          {/* Imágenes de ejemplo simulando un grid de Pinterest */}
          {[
            'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/jardin_de_lavanda_imperial.webp',
            'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/cascada_imperial_de_cristales.webp',
            'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/recogido_perla_romantica.webp',
            'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/ponytail_glam.webp',
            'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/coletas_de_burbuja.webp',
            'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/chongo_bajo_pulido.webp'
          ].map((src, i) => (
            <img 
              key={i} 
              src={src} 
              alt="Background hairstyle" 
              className="w-full mb-2 rounded-xl object-cover" 
              style={{ height: i % 2 === 0 ? '200px' : '300px' }}
            />
          ))}
        </div>
      </div>

      {/* Gradiente de oscurecimiento */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20 z-10" />

      {/* Contenido Central (Modal de Login) */}
      <div className="relative z-20 w-[90%] bg-black/40 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 flex flex-col items-center text-center shadow-2xl">
        <img src={glamLogo} alt="Glam Logo" className="h-20 w-auto mb-4 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
        
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenida a <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">Glam</span>
        </h1>
        <p className="text-white/80 text-sm mb-8 leading-relaxed">
          Descubre e inspírate con los mejores peinados. Inicia sesión para ver nuestro catálogo exclusivo y reservar tu cita.
        </p>

        {error && (
          <div className="w-full bg-red-500/20 text-red-200 text-xs p-3 rounded-xl mb-4 border border-red-500/30">
            {error}
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)]"
          >
            Únete a Glam gratis
          </button>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 border border-white/10 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Ya tengo cuenta
          </button>

          <button 
            onClick={() => navigate('/app')}
            className="w-full flex items-center justify-center gap-2 py-4 bg-transparent text-pink-400 font-semibold rounded-2xl hover:bg-white/5 border border-pink-500/30 active:scale-95 transition-all mt-1"
          >
            Explorar catálogo sin registro
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
