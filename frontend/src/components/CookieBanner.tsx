import { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[80px] md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl z-[9999]">
      <div className="flex flex-col gap-3">
        <h3 className="text-white font-semibold text-sm">Uso de Cookies</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Utilizamos cookies propias y de terceros (como Google AdSense y DoubleClick) para mejorar nuestros servicios, personalizar anuncios y analizar nuestro tráfico. Al continuar navegando, aceptas su uso.
        </p>
        <div className="flex gap-2 items-center justify-end mt-2">
          <a href="/privacidad" className="text-xs text-slate-400 hover:text-white transition-colors">
            Leer más
          </a>
          <button 
            onClick={handleAccept}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
