import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Image as ImageIcon, Save, Plus, Trash2, Video, MessageCircle, Sparkles } from 'lucide-react';
import AdminTipsTab from './AdminTipsTab';

const ALLOWED_EMAILS = ['rosty503@gmail.com', 'nextor.salinas@gmail.com', 'nestybarranco@gmail.com'];
const API_URL = import.meta.env.VITE_API_URL || 'https://api.glam.alexandrapink.online';
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-CAMBIAME.r2.dev';

const ImageCropperModal: React.FC<{
  imageSrc: string;
  onCrop: (croppedFile: File) => void;
  onClose: () => void;
  fileName: string;
}> = ({ imageSrc, onCrop, onClose, fileName }) => {
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc);
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [currentImageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentImageSrc(reader.result as string);
      setCurrentFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!imgRef.current || !containerRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      const size = 600; // 600x600 square crop
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = imgRef.current;
      const container = containerRef.current;
      
      const vWidth = container.clientWidth;
      const iWidth = img.clientWidth;
      const iHeight = img.clientHeight;
      
      const canvasScale = size / vWidth;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.scale(scale * canvasScale, scale * canvasScale);
      ctx.translate(offset.x / scale, offset.y / scale);
      
      ctx.drawImage(
        img, 
        -iWidth / 2, 
        -iHeight / 2, 
        iWidth, 
        iHeight
      );
      ctx.restore();
      
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], currentFileName, { type: 'image/jpeg' });
          onCrop(croppedFile);
        }
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error(err);
      alert('Error de seguridad (CORS) al intentar recortar la imagen actual. Por favor, haz clic en "Reemplazar Imagen" para subir una desde tu equipo y poder recortarla sin problemas.');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5 text-white flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold">Recortar Imagen</h3>
          <button onClick={onClose} type="button" className="text-white hover:text-pink-100 text-2xl font-bold">&times;</button>
        </div>
        
        {/* Viewport */}
        <div className="p-6 flex flex-col items-center gap-4">
          <p className="text-xs text-slate-500 text-center">Arrastra para mover la imagen y usa el deslizador para hacer zoom</p>
          
          <div 
            ref={containerRef}
            className="w-[280px] h-[280px] rounded-2xl border-4 border-pink-500/20 overflow-hidden relative cursor-move bg-slate-100 select-none flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={currentImageSrc}
              crossOrigin="anonymous"
              alt="To crop"
              className="max-w-none pointer-events-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onLoad={() => {
                setOffset({ x: 0, y: 0 });
              }}
            />
            <div className="absolute inset-0 border border-white/40 pointer-events-none rounded-xl"></div>
          </div>
          
          {/* Zoom Slider */}
          <div className="w-full flex items-center gap-3 px-2">
            <span className="text-xs font-semibold text-slate-500">Zoom</span>
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="0.05"
              value={scale} 
              onChange={(e) => setScale(Number(e.target.value))}
              className="flex-1 accent-pink-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
            />
            <span className="text-xs font-bold text-slate-700">{Math.round(scale * 100)}%</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-5 border-t border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
          <div>
            <label className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors inline-block">
              Reemplazar Imagen
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-colors text-xs font-semibold"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={handleSave} 
              className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all text-xs font-bold shadow-lg shadow-pink-500/25"
            >
              Recortar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Reservation {
  id: string;
  userName: string;
  userEmail: string;
  phone: string;
  date: string;
  time: string;
  hairstyleName: string;
  price: number;
  status: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  tiktokText?: string;
  price: number;
  duration: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hostname.includes('alexandrapink.online')) {
      window.location.href = 'https://alexandra-styles.web.app/admin';
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'reservations' | 'services' | 'whatsapp' | 'tips'>('reservations');
  const [loading, setLoading] = useState(true);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [newDuration, setNewDuration] = useState(60);
  const [newDescription, setNewDescription] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Cropper state
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [cropperFileName, setCropperFileName] = useState('');
  const [cropperCallback, setCropperCallback] = useState<((croppedFile: File) => void) | null>(null);

  // WhatsApp State
  const [waPhone, setWaPhone] = useState<string>('');
  const [waLoading, setWaLoading] = useState(false);

  const fetchWaPhone = async () => {
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/status`);
      const data = await res.json();
      if (data.phone) {
        setWaPhone(data.phone);
      }
    } catch (err) {
      console.error('Error fetching WA phone', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'whatsapp') {
      fetchWaPhone();
    }
  }, [activeTab]);

  const handleSavePhone = async (phoneToSave: string) => {
    setWaLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneToSave })
      });
      const data = await res.json();
      if (data.success) {
        alert('Número de WhatsApp guardado con éxito');
        fetchWaPhone();
      } else {
        alert('Error al guardar: ' + data.error);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error de conexión: ' + err.message);
    } finally {
      setWaLoading(false);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setCropperImageSrc(reader.result as string);
      setCropperFileName(file.name);
      setCropperCallback(() => (croppedFile: File) => {
        setNewImageFile(croppedFile);
        setCropperImageSrc(null);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setCropperImageSrc(reader.result as string);
      setCropperFileName(file.name);
      setCropperCallback(() => async (croppedFile: File) => {
        const fakeEvent = {
          target: {
            files: [croppedFile]
          }
        } as any;
        await handleFileUpload(fakeEvent, serviceId, 'image');
        setCropperImageSrc(null);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropExistingImage = (service: Service) => {
    if (!service.imageUrl) {
      document.getElementById(`file-input-image-${service.id}`)?.click();
      return;
    }
    setCropperImageSrc(service.imageUrl);
    setCropperFileName(`${service.name || 'peinado'}_cropped.jpg`);
    setCropperCallback(() => async (croppedFile: File) => {
      const fakeEvent = {
        target: {
          files: [croppedFile]
        }
      } as any;
      await handleFileUpload(fakeEvent, service.id, 'image');
      setCropperImageSrc(null);
    });
  };

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (!ALLOWED_EMAILS.includes(user.email || '')) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resSnapshot = await getDocs(collection(db, 'reservations'));
      setReservations(resSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reservation)));
    } catch (err) {
      console.error("Error fetching reservations:", err);
    }
    
    try {
      const servSnapshot = await getDocs(collection(db, 'services'));
      const allServices = servSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Service));
      setServices(allServices.filter(s => !s.videoUrl));
    } catch (err) {
      console.error("Error fetching services:", err);
    }
    setLoading(false);
  };

  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reservations', id), { status: newStatus });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    }
  };

  const saveService = async (service: Service) => {
    try {
      const { id, ...data } = service;
      await updateDoc(doc(db, 'services', id), data as any);
      alert('Servicio guardado exitosamente');
    } catch (err) {
      console.error(err);
      alert('Error al guardar el servicio');
    }
  };

  const deleteService = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este peinado?")) return;
    try {
      await deleteDoc(doc(db, 'services', id));
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  };

  const addNewService = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('Por favor escribe un nombre para el peinado.');
      return;
    }
    setIsSavingNew(true);
    try {
      const serviceData = {
        name: newName,
        price: newPrice,
        duration: newDuration,
        description: newDescription,
        tiktokText: newDescription,
        category: 'peinado'
      };
      
      const docRef = await addDoc(collection(db, 'services'), serviceData);
      let imageUrl = 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/chongo_bajo_pulido.webp';
      
      if (newImageFile) {
        const response = await fetch(`${API_URL}/api/upload/presigned`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: newImageFile.name, contentType: newImageFile.type })
        });
        if (!response.ok) throw new Error("Error al obtener URL de subida");
        const { presignedUrl, key } = await response.json();

        const uploadRes = await fetch(presignedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': newImageFile.type },
          body: newImageFile
        });
        if (!uploadRes.ok) throw new Error("Error subiendo imagen a Cloudflare R2");

        imageUrl = `${R2_PUBLIC_URL}/${key}`;
        await updateDoc(docRef, { imageUrl });
      } else {
        await updateDoc(docRef, { imageUrl });
      }
      
      setServices([{ id: docRef.id, ...serviceData, imageUrl }, ...services]);
      
      setIsCreateModalOpen(false);
      setNewName('');
      setNewPrice(0);
      setNewDuration(60);
      setNewDescription('');
      setNewImageFile(null);
      alert('¡Nuevo peinado creado exitosamente!');
    } catch (err) {
      console.error(err);
      alert('Error al crear el peinado.');
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, serviceId: string, type: 'video' | 'image' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      alert(`Subiendo ${type}... Por favor espera.`);
      
      const response = await fetch(`${API_URL}/api/upload/presigned`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });
      if (!response.ok) throw new Error("Error al obtener URL de subida");
      const { presignedUrl, key } = await response.json();

      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      if (!uploadRes.ok) throw new Error("Error subiendo archivo a Cloudflare R2");

      const url = `${R2_PUBLIC_URL}/${key}`;
      
      const updateData = type === 'video' ? { videoUrl: url } : type === 'thumbnail' ? { thumbnailUrl: url } : { imageUrl: url };
      await updateDoc(doc(db, 'services', serviceId), updateData);
      
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...updateData } : s));
      alert(`${type} subido exitosamente!`);
    } catch (err) {
      console.error("Error upload:", err);
      alert('Error al subir archivo');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-100">Cargando panel...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-pink-500">Glam Admin</h1>
          <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'reservations' ? 'bg-pink-600' : 'hover:bg-slate-800'}`}
          >
            <Calendar size={20} /> Reservaciones
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'services' ? 'bg-pink-600' : 'hover:bg-slate-800'}`}
          >
            <ImageIcon size={20} /> Catálogo
          </button>
          <button 
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'whatsapp' ? 'bg-pink-600' : 'hover:bg-slate-800'}`}
          >
            <MessageCircle size={20} /> Asistente Glamy
          </button>
          <button 
            onClick={() => setActiveTab('tips')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'tips' ? 'bg-pink-600' : 'hover:bg-slate-800'}`}
          >
            <Sparkles size={20} /> Tips y Blog
          </button>
        </nav>
        <div className="p-4">
          <button onClick={() => navigate('/')} className="w-full mb-2 py-2 text-sm text-slate-400 hover:text-white">Volver a la App</button>
          <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
            <LogOut size={18} /> Salir
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        
        {activeTab === 'reservations' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Reservaciones</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold text-slate-600">Cliente</th>
                      <th className="p-4 font-semibold text-slate-600">Contacto</th>
                      <th className="p-4 font-semibold text-slate-600">Servicio</th>
                      <th className="p-4 font-semibold text-slate-600">Fecha/Hora</th>
                      <th className="p-4 font-semibold text-slate-600">Estado</th>
                      <th className="p-4 font-semibold text-slate-600">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(res => (
                      <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-medium">{res.userName}</p>
                          <p className="text-xs text-slate-500">{res.userEmail}</p>
                        </td>
                        <td className="p-4">{res.phone}</td>
                        <td className="p-4">
                          <p className="font-medium text-pink-600">{res.hairstyleName}</p>
                          <p className="text-xs text-slate-500">${res.price}</p>
                        </td>
                        <td className="p-4">
                          <p>{res.date}</p>
                          <p className="text-sm font-medium">{res.time}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${res.status === 'Completada' ? 'bg-green-100 text-green-700' : res.status === 'Cancelada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select 
                            value={res.status}
                            onChange={(e) => updateReservationStatus(res.id, e.target.value)}
                            className="bg-slate-100 border-none rounded p-1 text-sm outline-none cursor-pointer"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Completada">Completada</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {reservations.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay reservaciones aún.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Catálogo de Servicios</h2>
              <button onClick={addNewService} className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 transition-colors">
                <Plus size={18} /> Nuevo Peinado
              </button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
                  {editingServiceId === service.id ? (
                    /* MODO EDICIÓN */
                    <>
                      <div className="flex gap-4">
                        <div 
                          onClick={() => handleCropExistingImage(service)}
                          className="w-32 h-40 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative group cursor-pointer border border-pink-500/10 hover:border-pink-500/30 transition-all"
                          title="Haz clic para cambiar o recortar la imagen"
                        >
                          {service.imageUrl || service.thumbnailUrl ? (
                            <img src={service.thumbnailUrl || service.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>
                          )}
                          {service.videoUrl && (
                            <div className="absolute top-2 right-2 bg-black/50 p-1 rounded text-white"><Video size={16}/></div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-3">
                          <input 
                            type="text" 
                            value={service.name} 
                            onChange={e => setServices(prev => prev.map(s => s.id === service.id ? { ...s, name: e.target.value } : s))}
                            className="font-bold text-lg border-b border-slate-200 outline-none pb-1 focus:border-pink-500" 
                            placeholder="Nombre del peinado"
                          />
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-xs text-slate-500 uppercase font-bold">Precio ($)</label>
                              <input 
                                type="number" 
                                value={service.price} 
                                onChange={e => setServices(prev => prev.map(s => s.id === service.id ? { ...s, price: Number(e.target.value) } : s))}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm mt-1 outline-none focus:border-pink-500" 
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-slate-500 uppercase font-bold">Duración (min)</label>
                              <input 
                                type="number" 
                                value={service.duration} 
                                onChange={e => setServices(prev => prev.map(s => s.id === service.id ? { ...s, duration: Number(e.target.value) } : s))}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm mt-1 outline-none focus:border-pink-500" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">Texto / Descripción TikTok</label>
                        <textarea 
                          value={service.tiktokText || service.description} 
                          onChange={e => setServices(prev => prev.map(s => s.id === service.id ? { ...s, tiktokText: e.target.value, description: e.target.value } : s))}
                          className="w-full h-20 bg-slate-50 border border-slate-200 rounded p-2 text-sm mt-1 outline-none focus:border-pink-500 resize-none" 
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1">Subir Imagen</label>
                          <input 
                            id={`file-input-image-${service.id}`}
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleEditImageChange(e, service.id)} 
                            className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-pink-100 file:text-pink-700 w-full" 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1">Subir Video (Reel)</label>
                          <input type="file" accept="video/mp4,video/quicktime" onChange={(e) => handleFileUpload(e, service.id, 'video')} className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-100 file:text-purple-700 w-full" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1">Miniatura Video</label>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, service.id, 'thumbnail')} className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 w-full" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-slate-100">
                        <button onClick={() => deleteService(service.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={20}/></button>
                        <button onClick={() => { setEditingServiceId(null); fetchData(); }} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                          Cancelar
                        </button>
                        <button onClick={() => { saveService(service); setEditingServiceId(null); }} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                          <Save size={18}/> Guardar Cambios
                        </button>
                      </div>
                    </>
                  ) : (
                    /* MODO LECTURA */
                    <div className="flex gap-4">
                      <div 
                        onClick={() => handleCropExistingImage(service)}
                        className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative cursor-pointer group hover:opacity-90 transition-opacity border border-slate-100 rounded-xl"
                        title="Haz clic para recortar/editar la imagen"
                      >
                        {service.imageUrl || service.thumbnailUrl ? (
                          <img src={service.thumbnailUrl || service.imageUrl} className="w-full h-full object-cover" alt={service.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>
                        )}
                        {service.videoUrl && (
                          <div className="absolute top-1 right-1 bg-black/50 p-1 rounded text-white"><Video size={12}/></div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{service.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2">{service.tiktokText || service.description}</p>
                        </div>
                        
                        <div className="flex items-end justify-between mt-2">
                          <div className="flex gap-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Precio</span>
                              <span className="font-semibold text-pink-600">${service.price}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tiempo</span>
                              <span className="font-semibold text-slate-700">{service.duration} min</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => setEditingServiceId(service.id)} 
                            className="px-4 py-1.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL CREAR PEINADO */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Nuevo Peinado</h3>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-white/80 hover:text-white text-2xl font-bold"
                  disabled={isSavingNew}
                  type="button"
                >
                  &times;
                </button>
              </div>
              
              {/* Form */}
              <form onSubmit={handleCreateService} className="p-6 flex flex-col gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del Peinado</label>
                  <input 
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm text-slate-800"
                    placeholder="Ej. Ondas Hollywood"
                    disabled={isSavingNew}
                  />
                </div>
                
                {/* Precio y Duración */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Precio ($)</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      value={newPrice}
                      onChange={e => setNewPrice(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm text-slate-800"
                      disabled={isSavingNew}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Duración (min)</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      value={newDuration}
                      onChange={e => setNewDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm text-slate-800"
                      disabled={isSavingNew}
                    />
                  </div>
                </div>
                
                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción / Texto TikTok</label>
                  <textarea 
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm text-slate-800 resize-none"
                    placeholder="Describe el estilo, tags, etc."
                    disabled={isSavingNew}
                  />
                </div>
                
                {/* Subir Imagen */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 font-bold">Subir Imagen del Peinado</label>
                  <input 
                    id="new-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleNewImageChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 transition-all cursor-pointer"
                    disabled={isSavingNew}
                  />
                  {newImageFile && (
                    <div className="mt-3 flex items-center gap-3 bg-pink-50 p-2.5 rounded-2xl border border-pink-100">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white border border-pink-200">
                        <img src={URL.createObjectURL(newImageFile)} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{newImageFile.name}</p>
                        <p className="text-[10px] text-pink-600 font-medium">✓ Imagen recortada lista</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => document.getElementById('new-image-input')?.click()}
                        className="text-xs bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium"
                      >
                        Recortar otra
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Botones de acción */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
                    disabled={isSavingNew}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingNew}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-medium disabled:opacity-75 min-w-[120px]"
                  >
                    {isSavingNew ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>Crear Peinado</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- PESTAÑA ASISTENTE GLAMY IA --- */}
        {activeTab === 'whatsapp' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Asistente Virtual (Glamy IA)</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto animate-in fade-in duration-200">
              {/* Tarjeta de Información General */}
              <div className="lg:col-span-2 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-white p-6 md:p-8 rounded-3xl border border-pink-100 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-pink-500/20">
                    🌸
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Glamy IA Asistente Activa</h3>
                    <p className="text-xs text-slate-500">Impulsada por Google Gemini 2.5 Flash</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Glamy es la asistente inteligente integrada en el catálogo de cara al cliente. Ayuda a tus clientas de forma autónoma respondiendo preguntas y asesorando sobre estilos, precios y duración de tus peinados.
                </p>

                <div className="bg-white/80 backdrop-blur-sm p-4.5 rounded-2xl border border-slate-100 flex flex-col gap-2.5 text-xs text-slate-600">
                  <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                    ✨ Características del Chat:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Lectura en tiempo real:</strong> Cada cambio que hagas en la pestaña <strong>Catálogo</strong> (precios, descripciones, nombres) es leído por Glamy al instante.</li>
                    <li><strong>Respuestas directas:</strong> Ideal para agilizar dudas comunes sin que tengas que contestar manualmente.</li>
                    <li><strong>Redirección de WhatsApp:</strong> Si la clienta prefiere hablar contigo o quiere agendar la cita definitiva, el chat incluye accesos directos para escribirte a tu número.</li>
                  </ul>
                </div>
              </div>

              {/* Tarjeta de Ajustes de WhatsApp */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-base text-slate-800 mb-1">Redirección Directa</h3>
                  <p className="text-xs text-slate-500">Configura a qué número se enviará a las clientas cuando pulsen el botón de WhatsApp en el chat.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase">
                    Número de Celular Receptor:
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 525513176307"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Ingresa el número con código de país sin espacios, símbolos ni el signo + (Ej: 525513176307 para México).
                  </p>
                </div>

                <button
                  onClick={() => handleSavePhone(waPhone)}
                  disabled={waLoading}
                  className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-xl transition active:scale-95 disabled:opacity-50 shadow-md shadow-pink-600/20"
                >
                  {waLoading ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <AdminTipsTab />
        )}

        {/* MODAL RECORTAR IMAGEN */}
        {cropperImageSrc && cropperCallback && (
          <ImageCropperModal
            imageSrc={cropperImageSrc}
            fileName={cropperFileName}
            onCrop={cropperCallback}
            onClose={() => setCropperImageSrc(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
