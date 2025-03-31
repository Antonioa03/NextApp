// Proxy para redirigir solicitudes de información de usuario al backend
export default async function handler(req, res) {
    // Solo permitir GET para obtener información del usuario
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
      
      console.log('API proxy: redirigiendo solicitud a', `${API_URL}/api/auth/me`);
      
      // Reenviar la solicitud al backend
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });
  
      // Leer la respuesta como texto para depuración
      const responseText = await response.text();
      if (!responseText.trim()) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      console.log('Respuesta del backend:', responseText);
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear la respuesta como JSON:', e);
        return res.status(500).json({ 
          success: false, 
          message: 'Respuesta inválida del servidor backend'
        });
      }
      
      // Devolver la misma respuesta y status que el servidor backend
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Error en proxy de info de usuario:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al comunicarse con el servidor backend', 
        error: error.message
      });
    }
  }