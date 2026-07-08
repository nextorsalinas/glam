import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2, Image as ImageIcon, Edit2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.glam.alexandrapink.online';
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-CAMBIAME.r2.dev';

const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas ctx not found'));
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const webpFile = new File([blob], newFileName, { type: 'image/webp' });
          resolve(webpFile);
        }, 'image/webp', 0.85);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export interface Tip {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt?: any;
}

const AdminTipsTab = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTipId, setEditingTipId] = useState<string | null>(null);

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingTipId(null);
    setNewTitle('');
    setNewContent('');
    setNewImageFile(null);
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tips'));
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Tip));
      // Ordenar por fecha descendente
      fetched.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });
      setTips(fetched);
    } catch (err) {
      console.error("Error fetching tips", err);
    }
    setLoading(false);
  };

  const handleDeleteTip = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este Tip?")) return;
    try {
      await deleteDoc(doc(db, 'tips', id));
      setTips(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  };

  const handleCreateTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Por favor escribe un título y contenido.');
      return;
    }
    setIsSaving(true);
    try {
      let imageUrl = '';
      let currentDocId = editingTipId;
      
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
      }
      
      if (currentDocId) {
        const updateData: any = { title: newTitle, content: newContent };
        if (imageUrl) updateData.imageUrl = imageUrl;
        await updateDoc(doc(db, 'tips', currentDocId), updateData);
        setTips(tips.map(t => t.id === currentDocId ? { ...t, ...updateData } : t));
        alert('Tip actualizado exitosamente');
      } else {
        const tipData: any = { title: newTitle, content: newContent, createdAt: serverTimestamp() };
        if (imageUrl) tipData.imageUrl = imageUrl;
        const docRef = await addDoc(collection(db, 'tips'), tipData);
        setTips([{ id: docRef.id, ...tipData, imageUrl } as Tip, ...tips]);
        alert('Tip creado exitosamente');
      }
      
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Error al guardar tip');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const webpFile = await convertToWebP(e.target.files[0]);
        setNewImageFile(webpFile);
      } catch (err) {
        console.error("Error al convertir imagen a WebP", err);
        setNewImageFile(e.target.files[0]);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tips y Blog</h2>
        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 transition-colors">
          <Plus size={18} /> Nuevo Tip
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-500">Cargando tips...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tips.map(tip => (
            <div key={tip.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-100 shrink-0 relative">
                {tip.imageUrl ? (
                  <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={40} />
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-slate-800 mb-2">{tip.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{tip.content}</p>
                
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button onClick={() => {
                    setEditingTipId(tip.id);
                    setNewTitle(tip.title);
                    setNewContent(tip.content);
                    setIsCreateModalOpen(true);
                  }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors mr-2" title="Editar Tip">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteTip(tip.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Tip">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {tips.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              No has publicado ningún Tip todavía.
            </div>
          )}
        </div>
      )}

      {/* MODAL CREAR TIP */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5 text-white flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold">{editingTipId ? 'Editar Tip' : 'Publicar Nuevo Tip'}</h3>
              <button 
                onClick={closeModal}
                className="text-white/80 hover:text-white text-2xl font-bold"
                disabled={isSaving}
                type="button"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateTip} className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700">Título o Tema para la IA</label>
                </div>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm text-slate-800"
                  placeholder="Ej. Escribe un título o tema y presiona 'Generar con IA'"
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Contenido / Texto</label>
                <textarea 
                  required
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full h-40 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm text-slate-800 resize-none"
                  placeholder="Escribe todo el contenido aquí..."
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subir Imagen Destacada</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 transition-all cursor-pointer"
                  disabled={isSaving}
                />
                {newImageFile && (
                  <div className="mt-3 w-32 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={URL.createObjectURL(newImageFile)} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-2 pt-5 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={async () => {
                    setIsGenerating(true);
                    try {
                      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
                      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
                      
                      let prompt = "Eres un experto en belleza. Escribe un tip o artículo para un blog de belleza (aprox 300-400 palabras) sobre cuidado del cabello, maquillaje, uñas o tendencias actuales.";
                      if (newTitle.trim()) {
                        prompt = `Eres un experto en belleza. Escribe un artículo para un blog de belleza (aprox 300-400 palabras) que trate sobre el siguiente tema: "${newTitle.trim()}".`;
                      }
                      prompt += " Devuelve estrictamente un JSON válido con dos propiedades: 'title' (un título atractivo) y 'content' (el contenido del artículo en formato de texto con saltos de línea y emojis si quieres, sin HTML complejo). No devuelvas Markdown rodeando el JSON.";
                      
                      const result = await model.generateContent(prompt);
                      const responseText = result.response.text();
                      let parsed = { title: '', content: '' };
                      try {
                        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                          parsed = JSON.parse(jsonMatch[0]);
                        } else {
                          parsed = JSON.parse(responseText);
                        }
                      } catch (e) {
                        console.error("JSON parse error, raw response:", responseText);
                        throw new Error("No se pudo extraer el JSON");
                      }
                      setNewTitle(parsed.title || '');
                      setNewContent(parsed.content || '');
                    } catch (error) {
                      console.error(error);
                      alert('Hubo un error al generar con IA. Revisa la consola.');
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-semibold border border-indigo-100"
                  disabled={isSaving || isGenerating}
                >
                  {isGenerating ? '✨ Pensando...' : '✨ Generar con IA'}
                </button>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
                    disabled={isSaving || isGenerating}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving || isGenerating}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-medium disabled:opacity-75 min-w-[120px]"
                  >
                    {isSaving ? 'Guardando...' : (editingTipId ? 'Guardar Cambios' : 'Publicar Tip')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTipsTab;
