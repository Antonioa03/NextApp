import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function AnimeCharacters() {
  const { user } = useAuth();
  const router = useRouter();
  const [characters, setCharacters] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [error, setError] = useState(null);
  
  const itemsPerPage = 5;

  // Lista actualizada de IDs de personajes (todos confirmados como válidos)
  const fixedCharacterIds = useMemo(() => [
    1, 2, 3, 5, 6,           // Primera página 
    7, 63, 64, 65, 13,        // Segunda página
    14, 16, 17, 20, 22,      // Tercera página
    25, 34, 35, 40, 45,      // Cuarta página
    62, 80, 94, 112, 127     // Quinta página
  ], []);


  // Authentication check with minimal delay
  useEffect(() => {
    const checkAuth = setTimeout(() => {
      setIsAuthChecking(false);
    }, 100);

    return () => clearTimeout(checkAuth);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthChecking && !user) {
      router.push('/');
    }
  }, [user, router, isAuthChecking]);

  // Enable scrolling on this page
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Fetch characters with better error handling
  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Implementamos un sistema de manejo de errores mejorado
      const fetchWithRetry = async (id, retries = 2, delay = 500) => {
        try {
          const response = await fetch(`https://api.jikan.moe/v4/characters/${id}`);
          
          // Si la API devuelve 429 (Too Many Requests), reintentamos
          if (response.status === 429 && retries > 0) {
            console.log(`Rate limited for ID ${id}, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(id, retries - 1, delay * 2);
          }
          
          // Si el personaje no existe (404), devolvemos un personaje de respaldo
          if (response.status === 404) {
            console.warn(`Character ID ${id} not found, using fallback`);
            return {
              data: {
                mal_id: id,
                name: `Personaje ${id}`,
                about: "Información no disponible en este momento.",
                images: { 
                  jpg: { 
                    image_url: "https://via.placeholder.com/225x350?text=Sin+Imagen"
                  }
                }
              }
            };
          }
          
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status} for ID ${id}`);
          }
          
          return response.json();
        } catch (error) {
          if (retries > 0) {
            console.warn(`Error fetching ID ${id}: ${error.message}, retrying...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(id, retries - 1, delay * 2);
          }
          
          // Si todos los reintentos fallan, devolvemos un personaje de respaldo
          console.error(`All retries failed for ID ${id}, using fallback`);
          return {
            data: {
              mal_id: id,
              name: `Personaje ${id}`,
              about: "No se pudo cargar la información de este personaje.",
              images: { 
                jpg: { 
                  image_url: "https://via.placeholder.com/225x350?text=Error"
                }
              }
            }
          };
        }
      };
      
      // Procesamos en grupos de 5 para evitar rate limits
      let allCharacters = [];
      
      // Dividimos en grupos de a 5
      for (let i = 0; i < fixedCharacterIds.length; i += 5) {
        const chunk = fixedCharacterIds.slice(i, i + 5);
        console.log(`Processing chunk ${i/5 + 1} of ${Math.ceil(fixedCharacterIds.length/5)}`);
        
        try {
          // Procesamos cada chunk con un pequeño delay entre solicitudes
          const chunkPromises = chunk.map((id, index) => 
            new Promise(resolve => {
              // Agregamos un pequeño retraso escalonado incluso dentro del chunk
              setTimeout(() => resolve(fetchWithRetry(id)), index * 300);
            })
          );
          
          const chunkResponses = await Promise.all(chunkPromises);
          const chunkData = chunkResponses.map(response => response.data);
          allCharacters = [...allCharacters, ...chunkData.filter(char => char !== null)];
          
          // Pausa entre chunks
          if (i + 5 < fixedCharacterIds.length) {
            console.log("Pausing between chunks...");
            await new Promise(resolve => setTimeout(resolve, 1200));
          }
        } catch (err) {
          console.error(`Error processing chunk starting at index ${i}:`, err);
        }
      }
      
      console.log(`Loaded ${allCharacters.length} of ${fixedCharacterIds.length} characters`);
      setCharacters(allCharacters);
      
      if (allCharacters.length < fixedCharacterIds.length) {
        console.warn(`Missing ${fixedCharacterIds.length - allCharacters.length} characters`);
      }
    } catch (err) {
      console.error('Error in main fetch routine:', err);
      setError('Error al cargar personajes. Por favor, inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [fixedCharacterIds]);

  // Load characters when authenticated
  useEffect(() => {
    if (user && !isAuthChecking) {
      fetchCharacters();
    }
  }, [user, isAuthChecking, fetchCharacters]);

  // Filter characters based on search
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) =>
      char?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [characters, search]);

  // Get paginated characters with efficiency
  const paginatedCharacters = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredCharacters.length);
    return filteredCharacters.slice(startIndex, endIndex);
  }, [filteredCharacters, page, itemsPerPage]);

  // Calculate total pages from filtered results
  const totalPages = useMemo(() => 
    Math.ceil(filteredCharacters.length / itemsPerPage),
    [filteredCharacters, itemsPerPage]
  );

  // Generate page numbers for pagination
  const getPageNumbers = useCallback(() => {
    const pageNumbers = [];
    const maxPageButtonsToShow = 5;
    
    if (totalPages <= maxPageButtonsToShow) {
      // Si hay 5 o menos páginas, se muestran todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Lógica para mostrar páginas alrededor de la actual
      let startPage = Math.max(1, page - Math.floor(maxPageButtonsToShow / 2));
      let endPage = startPage + maxPageButtonsToShow - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtonsToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  }, [page, totalPages]);

  // Handle search
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 when searching
  };

  // Show loading state during authentication check
  if (!user || isAuthChecking) {
    return null;
  }

  return (
    <div className="anime-characters">
      <div className="container">
        <div className="header-space"></div>
        
        <h1 className="page-title slide-up">Personajes de Anime</h1>
        
        <div className="search-container slide-up">
          <input
            type="text"
            placeholder="Buscar personaje..."
            value={search}
            onChange={handleSearch}
            className="search-input"
            aria-label="Buscar personaje"
          />
        </div>
        
        <h2 className="section-title slide-up">Lista de Personajes</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando personajes...</p>
          </div>
        ) : (
          <>
            <div className="characters-list">
              {paginatedCharacters.length > 0 ? (
                paginatedCharacters.map((item) => (
                  <div key={item.mal_id} className="character-card fade-in">
                    <div className="character-card-inner">
                      <div className="character-image-container">
                        {item.images?.jpg?.image_url ? (
                          <img 
                            src={item.images.jpg.image_url} 
                            alt={`${item.name || 'Personaje de anime'}`}
                            className="character-image"
                            loading="lazy" 
                          />
                        ) : (
                          <div className="character-image-placeholder">
                            No Image
                          </div>
                        )}
                      </div>
                      
                      <div className="character-info">
                        <h3 className="character-name">{item.name || 'Personaje sin nombre'}</h3>
                        <p className="character-description">
                          {item.about 
                            ? item.about.substring(0, 150) + (item.about.length > 150 ? '...' : '') 
                            : 'Descripción no disponible'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  No se encontraron personajes que coincidan con tu búsqueda.
                </div>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPage(1)} 
                  disabled={page === 1} 
                  className="pagination-button"
                  aria-label="Primera página"
                >
                  «
                </button>
                
                <button 
                  onClick={() => setPage(page - 1)} 
                  disabled={page === 1} 
                  className="pagination-button"
                  aria-label="Página anterior"
                >
                  ‹
                </button>
                
                {getPageNumbers().map(num => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`pagination-button ${page === num ? 'active' : ''}`}
                    aria-label={`Página ${num}`}
                    aria-current={page === num ? 'page' : undefined}
                  >
                    {num}
                  </button>
                ))}
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="pagination-button"
                  aria-label="Página siguiente"
                >
                  ›
                </button>
                
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="pagination-button"
                  aria-label="Última página"
                >
                  »
                </button>
              </div>
            )}
            
            <div className="page-info">
              Mostrando {Math.min(1, filteredCharacters.length)}-{Math.min(page * itemsPerPage, filteredCharacters.length)} de {filteredCharacters.length} personajes
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        .anime-characters {
          width: 100%;
          min-height: 100vh;
          background-color: #f9fafc;
          color: #333333;
          overflow-y: auto;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        
        .header-space {
          height: 80px;
          width: 100%;
        }
        
        .page-title {
          margin-top: 20px;
          margin-bottom: 20px;
          font-size: 32px;
          text-align: center;
          color: #333333;
        }
        
        .search-container {
          width: 100%;
          max-width: 500px;
          margin-bottom: 20px;
        }
        
        .search-input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          font-size: 16px;
          background-color: #ffffff;
          color: #333333;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .search-input:focus {
          border-color: #4361ee;
          box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.1);
          outline: none;
        }
        
        .section-title {
          margin-top: 10px;
          margin-bottom: 20px;
          font-size: 24px;
          text-align: center;
          color: #333333;
        }
        
        .characters-list {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 800px;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .character-card {
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .character-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }
        
        .character-card-inner {
          display: flex;
          padding: 15px;
        }
        
        .character-image-container {
          width: 120px;
          min-width: 120px;
          height: 180px;
          overflow: hidden;
          border-radius: 8px;
          margin-right: 15px;
        }
        
        .character-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .character-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f0f0f0;
          color: #888888;
          font-size: 14px;
        }
        
        .character-info {
          flex: 1;
          overflow: hidden;
          padding-right: 10px;
        }
        
        .character-name {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 20px;
          color: #333333;
        }
        
        .character-description {
          font-size: 14px;
          color: #555555;
          line-height: 1.5;
          height: 105px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          white-space: normal;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(67, 97, 238, 0.2);
          border-radius: 50%;
          border-top-color: #4361ee;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-container p {
          margin-top: 20px;
          font-size: 18px;
          color: #555555;
        }
        
        .error-message {
          padding: 15px;
          margin: 20px 0;
          background-color: rgba(255, 76, 76, 0.1);
          border-left: 4px solid #ff4c4c;
          border-radius: 4px;
          color: #ff4c4c;
        }
        
        .no-results {
          padding: 30px;
          text-align: center;
          color: #555555;
          font-size: 18px;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
          gap: 5px;
        }
        
        .pagination-button {
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 40px;
          height: 40px;
          padding: 0 8px;
          border-radius: 5px;
          border: none;
          background-color: #f0f0f0;
          color: #333333;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .pagination-button:hover:not(:disabled) {
          background-color: #4361ee;
          color: #ffffff;
        }
        
        .pagination-button.active {
          background-color: #4361ee;
          color: #ffffff;
          font-weight: bold;
        }
        
        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .page-info {
          margin: 15px 0 30px 0;
          font-size: 14px;
          color: #777777;
          text-align: center;
        }
        
        /* Animation classes */
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        .slide-up {
          animation: slideUp 0.5s forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(20px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        /* Responsive design */
        @media (max-width: 640px) {
          .page-title {
            font-size: 28px;
          }
          
          .section-title {
            font-size: 22px;
          }
          
          .character-card-inner {
            flex-direction: column;
          }
          
          .character-image-container {
            width: 100%;
            height: 200px;
            margin-right: 0;
            margin-bottom: 15px;
          }
          
          .character-info {
            padding: 0;
          }
          
          .pagination-button {
            min-width: 36px;
            height: 36px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}