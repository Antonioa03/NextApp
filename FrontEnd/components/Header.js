import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Track scrolling for header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link href={user ? '/home' : '/'} passHref legacyBehavior>
          <a className="logo">
            <span className="logo-text">Anime App</span>
          </a>
        </Link>
        
        {user && (
          <>
            <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <ul className="nav-list">
                <li className="nav-item">
                  <Link href="/home" passHref legacyBehavior>
                    <a className={router.pathname === '/home' ? 'active' : ''}>
                      Inicio
                    </a>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/AnimeCharacters" passHref legacyBehavior>
                    <a className={router.pathname === '/AnimeCharacters' ? 'active' : ''}>
                      Personajes
                    </a>
                  </Link>
                </li>
                {/* Se pueden agregar más elementos de navegación aquí */}
              </ul>
            </nav>
            
            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="toggle-bar"></span>
              <span className="toggle-bar"></span>
              <span className="toggle-bar"></span>
            </button>
          </>
        )}
      </div>
      
      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 70px;
          background-color: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          z-index: 1000;
          transition: all 0.3s ease;
        }
        
        .header.scrolled {
          height: 60px;
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
        }
        
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100%;
          padding: 0 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        
        .logo-text {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(120deg, #4361ee 0%, #4cc9f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
        }
        
        .main-nav {
          display: flex;
        }
        
        .nav-list {
          display: flex;
          list-style: none;
          gap: 20px;
          margin: 0;
          padding: 0;
        }
        
        .nav-item a {
          color: #333333;
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .nav-item a:hover {
          color: #4361ee;
          background-color: rgba(67, 97, 238, 0.05);
        }
        
        .nav-item a.active {
          color: #4361ee;
          background-color: rgba(67, 97, 238, 0.1);
          font-weight: 600;
        }
        
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 30px;
          height: 21px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        
        .toggle-bar {
          width: 100%;
          height: 3px;
          background-color: #333333;
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
          }
          
          .main-nav {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }
          
          .main-nav.mobile-open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }
          
          .nav-list {
            flex-direction: column;
            width: 100%;
            gap: 15px;
          }
          
          .nav-item {
            width: 100%;
          }
          
          .nav-item a {
            display: block;
            padding: 12px 15px;
            text-align: center;
          }
          
          .header.scrolled .main-nav {
            top: 60px;
          }
        }
      `}</style>
    </header>
  );
}