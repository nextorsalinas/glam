import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-32">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <div className="max-w-3xl mx-auto space-y-8 prose prose-invert">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
          Términos y Condiciones
        </h1>
        
        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>Última actualización: 4 de Julio de 2026</p>
          
          <h2 className="text-xl font-semibold text-white mt-8">1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar el sitio web de Glam Beauty (alexandrapink.online), aceptas estar sujeto a estos 
            Términos y Condiciones, a todas las leyes y regulaciones aplicables, y eres responsable del cumplimiento 
            de cualquier ley local aplicable. Si no estás de acuerdo con alguno de estos términos, tienes prohibido 
            usar o acceder a este sitio.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Licencia de Uso</h2>
          <p>
            Se concede permiso para descargar temporalmente una copia de los materiales (información, tips o software) 
            en el sitio web de Glam Beauty únicamente para visualización transitoria personal y no comercial. 
            Bajo esta licencia no puedes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Modificar o copiar los materiales;</li>
            <li>Usar los materiales para cualquier propósito comercial, o para cualquier exhibición pública;</li>
            <li>Intentar descompilar o aplicar ingeniería inversa a cualquier software en la app de Glam Beauty;</li>
            <li>Eliminar derechos de autor u otras anotaciones de propiedad de los materiales.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Reservas y Cancelaciones</h2>
          <p>
            Al realizar una reserva a través de nuestra plataforma, aceptas proporcionar información verídica y 
            precisa. Nos reservamos el derecho de cancelar cualquier reserva si detectamos comportamiento anómalo 
            o por disponibilidad de horario. Las políticas de cancelación específicas pueden aplicar y se coordinan 
            vía WhatsApp con nuestro equipo.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Enlaces (Links) a Terceros</h2>
          <p>
            Glam Beauty no ha revisado todos los sitios vinculados a su sitio web y no es responsable del contenido 
            de dicho sitio vinculado. La inclusión de cualquier enlace no implica el respaldo por parte de Glam Beauty. 
            El uso de cualquier sitio web vinculado es bajo el propio riesgo del usuario.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Modificaciones de los Términos</h2>
          <p>
            Glam Beauty puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. 
            Al utilizar este sitio web, aceptas estar sujeto a la versión actual de estos Términos y Condiciones.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
