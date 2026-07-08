import { Menu } from 'lucide-react';
import glamLogo from '../assets/glam.svg';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ALLOWED_EMAILS = ['rosty503@gmail.com', 'nextor.salinas@gmail.com', 'nestybarranco@gmail.com'];

const Header = () => {
  const { user } = useAuth();
  const isAdmin = user && ALLOWED_EMAILS.includes(user.email || '');

  return (
    <header className="bg-black/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={glamLogo} alt="Glam Logo" className="h-8 sm:h-10 w-auto" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 leading-none">
              Glam <span className="text-xs sm:text-base font-normal block text-white/80 mt-0.5">by alexandra pink</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          {isAdmin ? (
            <Link to="/admin" className="flex items-center gap-2 px-3 py-1.5 bg-pink-600/20 border border-pink-500/30 rounded-full shadow-lg hover:bg-pink-600/40 transition-colors">
              <span className="font-bold text-sm tracking-wide text-pink-400">ADMIN</span>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Admin" className="w-8 h-8 rounded-full border-2 border-pink-500" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center font-bold text-white text-sm">A</div>
              )}
            </Link>
          ) : user?.photoURL ? (
            <img src={user.photoURL} alt="Perfil" className="w-11 h-11 rounded-full border-2 border-pink-500 shadow-md" />
          ) : null}
          
          <button className="lg:hidden text-white/80 hover:text-white transition-colors">
            <Menu size={32} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
