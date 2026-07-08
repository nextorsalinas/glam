import { Sparkles } from 'lucide-react';

const TipsView = () => {
  return (
    <div className="min-h-[100dvh] bg-black text-white p-6 pb-24 pt-12 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Sparkles size={48} className="text-pink-500" />
      </div>
      <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
        Tips y Consejos
      </h1>
      <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
        Muy pronto compartiremos contigo los mejores consejos para cuidar tu cabello, 
        mantener tu peinado intacto y lucir espectacular en tu evento.
      </p>
      
      <div className="mt-12 w-full max-w-sm p-1 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 opacity-80">
        <div className="bg-black rounded-xl p-6">
          <p className="text-sm font-medium text-pink-200 uppercase tracking-widest mb-2">Próximamente</p>
          <p className="text-white font-bold text-lg">Sección Monetizable</p>
        </div>
      </div>
    </div>
  );
};

export default TipsView;
