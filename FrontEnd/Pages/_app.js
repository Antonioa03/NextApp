import { useEffect, useState } from 'react';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate app initialization (you can replace with real logic)
  useEffect(() => {
    const appInitTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(appInitTimeout);
  }, []);
  
  // Apply theme based on user preference
  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply the theme attribute to the document
    document.documentElement.setAttribute('data-theme', prefersDarkMode ? 'dark' : 'light');
    
    // Listen for changes in the color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <AuthProvider>
      <Head>
        <title>Mi Aplicación de Anime</title>
        <meta name="description" content="Explora personajes de anime y más" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {isLoading ? (
        <div className="app-loading">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Cargando aplicación...</p>
          </div>
        </div>
      ) : (
        <>
          <Header />
          <Component {...pageProps} />
        </>
      )}
      
      <style jsx>{`
        .app-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: var(--background);
          color: var(--text);
        }
        
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .loading-content p {
          margin-top: 20px;
          font-size: 18px;
          color: var(--text-secondary);
        }
      `}</style>
    </AuthProvider>
  );
}