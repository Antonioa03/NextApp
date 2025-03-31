import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirigir a la página de inicio de sesión si no hay usuario
    }
  }, [user, router]);

  const navigateTo = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null; // No renderizar nada mientras rediriges
  }

  return (
    <div className="home-page">
      <div className="container">
        <div className="welcome-section">
          <h1 className="welcome-title">Bienvenido, {user ? user.username : 'Usuario'}</h1>
          <p className="welcome-subtitle">Explora y disfruta de nuestras características sorprendentes.</p>
        </div>
        
        <div className="menu">
          <div className="menu-item" onClick={() => navigateTo('/AnimeCharacters')}>
            <h2 className="menu-title">Personajes de Anime</h2>
            <p className="menu-description">Descubre y explora personajes de tus animes favoritos.</p>
          </div>
          {/* Agrega más elementos de menú según sea necesario */}
        </div>
        
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
      
      <footer className="footer">
        <p className="footer-text">© 2025 Nuestra Aplicación. Todos los derechos reservados.</p>
      </footer>
      
      <style jsx>{`
        .home-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f9fafc;
          color: #333333;
        }
        
        .container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .welcome-section {
          text-align: center;
          margin-top: 50px;
          margin-bottom: 40px;
          animation: fadeIn 0.8s ease;
        }
        
        .welcome-title {
          font-size: 36px;
          margin-bottom: 10px;
          color: #333333;
          background: linear-gradient(120deg, #4361ee 0%, #4cc9f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .welcome-subtitle {
          font-size: 18px;
          color: #555555;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .menu {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 800px;
          margin-bottom: 40px;
          animation: slideUp 0.6s ease;
        }
        
        .menu-item {
          width: 100%;
          padding: 25px;
          margin-bottom: 20px;
          border-radius: 12px;
          background-color: #ffffff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .menu-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
          background-color: #f8f9ff;
        }
        
        .menu-title {
          font-size: 24px;
          margin-bottom: 10px;
          color: #333333;
        }
        
        .menu-description {
          font-size: 16px;
          color: #555555;
          line-height: 1.5;
        }
        
        .logout-button {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(120deg, #4361ee 0%, #4cc9f0 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .logout-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
          background: linear-gradient(120deg, #3a56e5 0%, #3ebbef 100%);
        }
        
        .footer {
          padding: 25px 20px;
          background-color: #ffffff;
          width: 100%;
          text-align: center;
          margin-top: auto;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
        }
        
        .footer-text {
          color: #777777;
          font-size: 14px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(30px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        /* For small mobile screens */
        @media (max-width: 480px) {
          .welcome-title {
            font-size: 28px;
          }
          
          .welcome-subtitle {
            font-size: 16px;
          }
          
          .menu-item {
            padding: 20px;
          }
          
          .menu-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}