import React, { useState } from 'react';
import { X, Calendar, Clock, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHairstyle?: {
    id: string;
    name: string;
    price: number;
  };
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, selectedHairstyle }) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState(user?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const reservationData = {
        userId: user.uid,
        userName: name || 'Sin nombre',
        userEmail: user.email || '',
        phone,
        date,
        time,
        hairstyleId: selectedHairstyle?.id || 'No seleccionado',
        hairstyleName: selectedHairstyle?.name || 'No seleccionado',
        price: selectedHairstyle?.price || 0,
        status: 'Pendiente',
        createdAt: serverTimestamp()
      };

      const addPromise = addDoc(collection(db, 'reservations'), reservationData);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('La conexión tardó demasiado (¿Problemas de internet?)')), 8000);
      });

      await Promise.race([addPromise, timeoutPromise]);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setDate('');
        setTime('');
        setPhone('');
      }, 3000);
    } catch (err: any) {
      console.error("Error saving reservation:", err);
      setError(err.message || 'Error al guardar la reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full md:w-[400px] rounded-t-3xl md:rounded-3xl overflow-hidden animate-slide-up shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Confirma tu Reserva</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">¡Reserva Solicitada!</h3>
              <p className="text-slate-600">Hemos recibido tu solicitud. Nos contactaremos pronto para confirmarla.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Resumen del Servicio */}
              {selectedHairstyle && (
                <div className="bg-pink-50 p-4 rounded-2xl mb-2">
                  <p className="text-xs text-pink-600 font-semibold uppercase tracking-wider mb-1">Servicio Seleccionado</p>
                  <p className="font-bold text-slate-800">{selectedHairstyle.name}</p>
                  <p className="text-sm text-slate-600">Precio estimado: ${selectedHairstyle.price}</p>
                </div>
              )}

              {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono / WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none"
                    placeholder="Ej. 55 1234 5678"
                  />
                </div>
              </div>

              {/* Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={18} />
                    </div>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Clock size={18} />
                    </div>
                    <input 
                      type="time" 
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-4 w-full py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:from-pink-500 hover:to-purple-500 active:scale-95 transition-all disabled:opacity-70 flex justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Confirmar Solicitud'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
