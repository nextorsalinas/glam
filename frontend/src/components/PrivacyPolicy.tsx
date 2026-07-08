import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
          Política de Privacidad
        </h1>
        
        <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
          <p>Última actualización: 4 de Julio de 2026</p>
          
          <h2 className="text-xl font-semibold text-white mt-8">1. Información que recopilamos</h2>
          <p>
            Recopilamos información cuando te registras en nuestro sitio, realizas una reserva o te suscribes a nuestro boletín. 
            La información recopilada incluye tu nombre, dirección de correo electrónico, y datos de tu perfil de Google si inicias sesión mediante este método.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Uso de la información</h2>
          <p>
            Toda la información que recopilamos de ti puede ser utilizada para:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Personalizar tu experiencia y responder a tus necesidades individuales</li>
            <li>Proporcionar contenido publicitario personalizado</li>
            <li>Mejorar nuestro sitio web</li>
            <li>Mejorar el servicio al cliente y tus necesidades de soporte</li>
            <li>Contactarte a través de correo electrónico o WhatsApp para temas de reservas</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Privacidad de los niños</h2>
          <p>
            No recopilamos intencionalmente información de identificación personal de niños menores de 13 años. Nuestro contenido, especialmente en la sección de Tips y Belleza, está dirigido al público en general.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Uso de Cookies y Publicidad (Google AdSense)</h2>
          <p>
            Utilizamos proveedores externos, incluido Google, que utilizan cookies para publicar anuncios basándose en las visitas anteriores de un usuario a nuestro sitio web o a otros sitios web.
          </p>
          <p>
            El uso de cookies de publicidad (como la cookie de DoubleClick) permite a Google y a sus socios publicar anuncios basados en las visitas realizadas a nuestros sitios y/o a otros sitios de Internet.
          </p>
          <p>
            Los usuarios pueden inhabilitar la publicidad personalizada visitando la página de <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">Configuración de Anuncios de Google</a>.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Divulgación a terceros</h2>
          <p>
            No vendemos, intercambiamos, ni transferimos de ninguna otra manera a terceros externos tu información de identificación personal. 
            Esto no incluye a terceros de confianza que nos asisten en operar nuestro sitio web o llevar a cabo nuestro negocio, 
            siempre y cuando esas partes acuerden mantener esta información confidencial.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Consentimiento</h2>
          <p>
            Al utilizar nuestro sitio, aceptas nuestra política de privacidad en línea.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
