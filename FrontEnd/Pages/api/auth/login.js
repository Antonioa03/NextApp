// Proxy para redirigir solicitudes de login al backend
export default async function handler(req, res) {
    // Solo permitir POST para login
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        message: 'Método no permitido' 
      });
    }
  
    try {
      // Obtener la URL del backend del entorno o usar la predeterminada
      const API_URL = process.env.API_URL || 'http://localhost:5000';
      
      console.log('API proxy: redirigiendo solicitud a', `${API_URL}/api/auth/login`);
      console.log('Datos de solicitud:', JSON.stringify(req.body));
      
      // Reenviar la solicitud al backend
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
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
        return res.status(500).json({ 
          success: false, 
          message: 'Respuesta inválida del servidor backend'
        });
      }
      
      // Devolver la misma respuesta y status que el servidor backend
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Error en proxy de login:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al comunicarse con el servidor backend', 
        error: error.message
      });
    }
  }