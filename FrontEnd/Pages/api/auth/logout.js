// Proxy para redirigir solicitudes de cierre de sesión al backend
export default async function handler(req, res) {
    // Solo permitir GET para cierre de sesión
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false,
        message: 'Método no permitido' 
      });
    }
  
    try {
      // Obtener token de autorización
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'No se proporcionó token de autorización'
        });
      }
  
      // Obtener la URL del backend del entorno o usar la predeterminada
      const API_URL = process.env.API_URL || 'http://localhost:5000';
      
      console.log('API proxy: redirigiendo solicitud a', `${API_URL}/api/auth/logout`);
      
      // Reenviar la solicitud al backend
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });
  
      // Leer la respuesta como texto para depuración
      const responseText = await response.text();
      console.log('Respuesta del backend:', responseText);
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear la respuesta como JSON:', e);
        // Para logout, incluso si hay un error, consideramos exitoso el cierre de sesión
        return res.status(200).json({ 
          success: true, 
          message: 'Sesión cerrada correctamente'
        });
      }
      
      // Devolver la misma respuesta y status que el servidor backend
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Error en proxy de logout:', error);
      // Para logout, incluso si hay un error, consideramos exitoso el cierre de sesión
      return res.status(200).json({ 
        success: true, 
        message: 'Sesión cerrada correctamente' 
      });
    }
  }