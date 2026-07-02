import { Menu, Settings } from 'lucide-react';
import glamLogo from '../assets/glam.svg';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ALLOWED_EMAILS = ['rosty503@gmail.com', 'nextor.salinas@gmail.com'];

const Header = () => {
  const { user } = useAuth();
  const isAdmin = user && ALLOWED_EMAILS.includes(user.email || '');

  return (
    <header className="bg-transparent sticky top-0 z-50 transition-all duration-300">
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
            <Link to="/admin" className="p-2.5 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 transition-colors">
              <Settings size={24} />
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
