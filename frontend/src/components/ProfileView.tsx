import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const ProfileView = () => {
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-black text-white p-6 pb-24 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-6">
          <User size={40} className="text-pink-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Tu Perfil</h1>
        <p className="text-slate-400 text-center mb-8 max-w-xs">
          Inicia sesión para gestionar tus datos y preferencias.
        </p>
        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full max-w-xs py-3 px-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25"
        >
          Iniciar Sesión
        </button>

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          onSuccess={() => setIsLoginModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white p-6 pb-24 pt-12">
      <h1 className="text-3xl font-bold mb-6">Perfil</h1>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center">
            <User size={32} className="text-pink-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.displayName || 'Usuario'}</h2>
            <p className="text-slate-400 text-sm">{user.email || 'Usuario de Glam'}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Aquí irán las opciones de perfil como editar datos, etc. */}
          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <p className="text-slate-400 text-sm">Pronto podrás editar tus datos aquí.</p>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 mt-6 bg-white/5 hover:bg-white/10 text-red-400 hover:text-red-300 font-medium rounded-xl border border-red-500/20 transition-all"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
