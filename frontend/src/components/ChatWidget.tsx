import { useState, useEffect, useRef } from 'react';
import { Send, X, Phone } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: '¡Hola! Soy Glamy, tu asistente virtual de Alexandra Pink Salón. 💖\n\nTe puedo ayudar a resolver dudas sobre nuestros peinados, precios, duración y todo lo relacionado con tu graduación. ¿En qué estilo o servicio estás interesada?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'https://api.glam.alexandrapink.online';

  useEffect(() => {
    // Cargar número de WhatsApp para redirección directa
    fetch(`${API_URL}/api/whatsapp/status`)
      .then(res => res.json())
      .then(data => {
        if (data.phone) {
          setWaPhone(data.phone);
        }
      })
      .catch(err => console.error('Error fetching WA status:', err));
  }, [API_URL]);

  useEffect(() => {
    // Auto scroll al último mensaje
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleToggleChat = () => {
      setIsOpen(prev => !prev);
    };
    
    window.addEventListener('toggle-chat', handleToggleChat);
    return () => window.removeEventListener('toggle-chat', handleToggleChat);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    
    // Agregar mensaje de usuario al chat
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userText,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.response || 'Lo siento, no he podido procesar tu respuesta en este momento.',
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: '¡Ups! Parece que tengo problemas de conexión. Si lo deseas, puedes contactarnos directamente por WhatsApp pulsando el botón verde arriba.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const phone = waPhone || '525513176307';
    const text = '¡Hola! Vi tu catálogo web y me gustaría programar una cita para peinado...';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-24 right-4 md:right-6 z-[60] flex flex-col items-end">
      {/* Ventana de Chat */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[calc(100dvh-120px)] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl shadow-pink-500/15 border border-pink-100 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Cabecera del Chat */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white flex justify-between items-center shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg backdrop-blur-sm">
                🌸
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Glamy</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-pink-100 font-medium hidden sm:inline">Asistente de IA activa</span>
                  <span className="text-[10px] text-pink-100 font-medium sm:hidden">IA activa</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Botón de WhatsApp Directo dentro del Chat */}
              <button
                onClick={handleWhatsAppRedirect}
                title="Hablar directo por WhatsApp"
                className="p-1.5 hover:bg-white/10 rounded-lg text-green-300 transition-colors flex items-center gap-1"
              >
                <Phone size={16} className="fill-current" />
                <span className="text-[10px] font-bold text-white hidden sm:inline">WhatsApp</span>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Banner de Contacto Rápido */}
          <div className="bg-pink-50 border-b border-pink-100/60 px-4 py-2 flex justify-between items-center text-xs shrink-0">
            <span className="text-slate-600 font-medium">¿Prefieres atención humana?</span>
            <button
              onClick={handleWhatsAppRedirect}
              className="flex items-center gap-1 px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold transition-colors shadow-sm shadow-green-500/20"
            >
              <Phone size={11} className="fill-current" />
              Chat Directo
            </button>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Animación "Escribiendo..." */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3.5 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white shrink-0 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregúntale a Glamy..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 focus:bg-white transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-10 h-10 bg-pink-500 hover:bg-pink-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-pink-500/20"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}


    </div>
  );
};

export default ChatWidget;
