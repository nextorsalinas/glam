import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Catalog from './components/Catalog';
import AdminPanel from './components/AdminPanel';

function MainView() {
  return (
    <div className="h-[100dvh] w-full relative overflow-hidden bg-black md:shadow-2xl">
      <div className="absolute top-0 left-0 w-full z-40 pointer-events-none">
        <div className="pointer-events-auto">
          <Header />
        </div>
      </div>

      <main className="w-full h-full relative z-10">
        <Catalog />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainView />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
