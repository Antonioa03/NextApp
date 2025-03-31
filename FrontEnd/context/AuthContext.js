import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Cambiado para usar rutas API internas
  const API_URL = '/api';

  // Verificar si el usuario ya está autenticado al cargar la página
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Registrar usuario - modificado para incluir confirmPassword
  const register = async (username, email, password, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Enviando solicitud de registro a: ${API_URL}/auth/register`);
      
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword // Añadido para resolver problema de validación
        }),
      });

      // Intentar leer la respuesta como texto primero para depurar
      const responseText = await res.text();
      console.log('Respuesta del servidor (texto):', responseText);
      
      // Convertir la respuesta a JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear JSON:', e);
        setError('La respuesta del servidor no es un JSON válido');
        return;
      }

      if (res.ok) {
        setUser(data.user);
        setError(null);
        localStorage.setItem('token', data.token);
        router.push('/home');
      } else {
        setError(data.message || 'Error en el registro');
        setUser(null);
      }
    } catch (error) {
      setError('Algo salió mal. Inténtalo de nuevo.');
      console.error('Error durante el registro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Enviando solicitud de login a: ${API_URL}/auth/login`);
      
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      // Intentar leer la respuesta como texto primero para depurar
      const responseText = await res.text();
      console.log('Respuesta del servidor (texto):', responseText);
      
      // Convertir la respuesta a JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear JSON:', e);
        setError('La respuesta del servidor no es un JSON válido');
        return;
      }

      if (res.ok) {
        setUser(data.user);
        setError(null);
        localStorage.setItem('token', data.token);
        router.push('/home');
      } else {
        setError(data.message || 'Credenciales inválidas');
        setUser(null);
      }
    } catch (error) {
      setError('Algo salió mal. Inténtalo de nuevo.');
      console.error('Error durante el inicio de sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Hacer solicitud al API route para logout
      await fetch(`${API_URL}/auth/logout`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      localStorage.removeItem('token');
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Solicitar restablecimiento de contraseña
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Intentar leer la respuesta como texto primero para depurar
      const responseText = await res.text();
      console.log('Respuesta del servidor (texto):', responseText);
      
      // Convertir la respuesta a JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear JSON:', e);
        setError('La respuesta del servidor no es un JSON válido');
        return false;
      }

      if (res.ok) {
        setError(null);
        return true;
      } else {
        setError(data.message || 'Error al solicitar cambio de contraseña');
        return false;
      }
    } catch (error) {
      setError('Algo salió mal. Inténtalo de nuevo.');
      console.error('Error al solicitar restablecimiento:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Restablecer contraseña
  const resetPassword = async (password, token) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      // Intentar leer la respuesta como texto primero para depurar
      const responseText = await res.text();
      console.log('Respuesta del servidor (texto):', responseText);
      
      // Convertir la respuesta a JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear JSON:', e);
        setError('La respuesta del servidor no es un JSON válido');
        return false;
      }

      if (res.ok) {
        setUser(data.user);
        setError(null);
        localStorage.setItem('token', data.token);
        router.push('/home');
        return true;
      } else {
        setError(data.message || 'Error al restablecer contraseña');
        return false;
      }
    } catch (error) {
      setError('Algo salió mal. Inténtalo de nuevo.');
      console.error('Error al restablecer contraseña:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario ya está autenticado
  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        const res = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Intentar leer la respuesta como texto primero para depurar
        const responseText = await res.text();
        
        // Si la respuesta está vacía o no es JSON válido, asumimos que no hay usuario autenticado
        if (!responseText.trim()) {
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('Respuesta del servidor (verificación):', responseText);
        
        // Convertir la respuesta a JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Error al parsear JSON:', e);
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }

        if (res.ok) {
          setUser(data.data);
          setError(null);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);