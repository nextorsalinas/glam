import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Catalog from './components/Catalog';
import AdminPanel from './components/AdminPanel';
import BottomNav from './components/BottomNav';
import ProfileView from './components/ProfileView';
import BookingsView from './components/BookingsView';
import TipsView from './components/TipsView';
import ChatWidget from './components/ChatWidget';
import CookieBanner from './components/CookieBanner';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

function MainView() {
  return (
    <div className="h-[100dvh] w-full relative overflow-hidden bg-black md:shadow-2xl">
      <div className="absolute top-0 left-0 w-full z-40 pointer-events-none">
        <div className="pointer-events-auto">
          <Header />
        </div>
      </div>

      <main className="w-full h-full relative z-10 pb-16">
        <Catalog />
        
        {/* Footer for Legal Pages in Catalog */}
        <div className="text-center pb-24 pt-12 flex justify-center gap-4 text-[10px] text-slate-500">
          <a href="/privacidad" className="hover:text-pink-500 transition-colors">Privacidad</a>
          <span>•</span>
          <a href="/terminos" className="hover:text-pink-500 transition-colors">Términos</a>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainView />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/perfil" element={<ProfileView />} />
        <Route path="/reservas" element={<BookingsView />} />
        <Route path="/tips" element={<TipsView />} />
        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="/terminos" element={<TermsOfService />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
      <BottomNav />
      <CookieBanner />
    </>
  );
}

export default App;
