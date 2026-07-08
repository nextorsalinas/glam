import { Home, User, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleChatClick = () => {
    // Disparar evento para abrir el ChatWidget
    window.dispatchEvent(new CustomEvent('toggle-chat'));
  };

  const navItems = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Reservas', path: '/reservas', icon: Calendar },
    { name: 'Chat', action: handleChatClick, icon: MessageSquare },
    { name: 'Tips', path: '/tips', icon: Sparkles },
    { name: 'Perfil', path: '/perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-[72px] max-w-md md:max-w-2xl mx-auto px-2 md:px-8">
        {navItems.map((item) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const Icon = item.icon;
          
          if (item.name === 'Tips') {
            return (
              <a
                key={item.name}
                href="/tips"
                className="flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors"
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-pink-500/20 text-pink-500 scale-110' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  <Icon size={24} className={isActive ? 'fill-pink-500/20' : ''} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-pink-500' : 'text-slate-400'}`}>
                  {item.name}
                </span>
              </a>
            );
          }

          return (
            <button
              key={item.name}
              onClick={() => item.action ? item.action() : navigate(item.path!)}
              className="flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors"
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-pink-500/20 text-pink-500 scale-110' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon size={24} className={isActive ? 'fill-pink-500/20' : ''} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-pink-500' : 'text-slate-400'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
