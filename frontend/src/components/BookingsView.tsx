import { useEffect, useState } from 'react';
import { Calendar, Clock, Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import LoginModal from './LoginModal';

const BookingsView = () => {
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchReservations = async () => {
        try {
          const q = query(collection(db, 'reservations'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const resData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort by date descending
          resData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setReservations(resData);
        } catch (error) {
          console.error("Error fetching reservations:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchReservations();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-black text-white p-6 pb-24 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-6">
          <Calendar size={40} className="text-pink-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Tus Reservas</h1>
        <p className="text-slate-400 text-center mb-8 max-w-xs">
          Inicia sesión para ver tus citas programadas y tu historial.
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
      <h1 className="text-3xl font-bold mb-6">Mis Reservas</h1>
      
      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <Calendar size={48} className="text-white/20 mb-4" />
          <p className="text-slate-400">Aún no tienes reservas próximas.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 text-pink-500 underline font-medium"
          >
            Explorar peinados
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div key={res.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-pink-500/20 text-pink-400 text-xs font-bold rounded-bl-xl border-b border-l border-pink-500/20">
                {res.status || 'Pendiente'}
              </div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Scissors size={16} className="text-pink-500" />
                {res.hairstyleName}
              </h3>
              <p className="text-pink-400 font-semibold mb-3">${res.price}</p>
              
              <div className="flex flex-col gap-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-500" />
                  <span>{res.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" />
                  <span>{res.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsView;
