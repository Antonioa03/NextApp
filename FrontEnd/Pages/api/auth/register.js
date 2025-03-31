// Proxy para redirigir solicitudes de registro al backend
export default async function handler(req, res) {
    // Solo permitir POST para registro
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        message: 'Método no permitido' 
      });
    }
  
    try {
      // Obtener la URL del backend del entorno o usar la predeterminada
      const API_URL = process.env.API_URL || 'http://localhost:5000';
      
      // Extraer todos los campos incluido confirmPassword
      const { username, email, password, confirmPassword } = req.body;
      
      console.log('API proxy: redirigiendo solicitud a', `${API_URL}/api/auth/register`);
      console.log('Datos de solicitud:', JSON.stringify({
        username,
        email,
        password: "********", // Ocultar contraseña en logs
        confirmPassword: confirmPassword ? "********" : undefined
      }));
      
      // Construir objeto de datos para enviar al backend
      const requestData = {
        username,
        email,
        password
      };
      
      // Añadir confirmPassword solo si está presente
      if (confirmPassword) {
        requestData.confirmPassword = confirmPassword;
      }
      
      // Reenviar la solicitud al backend
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
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
      console.error('Error en proxy de registro:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al comunicarse con el servidor backend', 
        error: error.message
      });
    }
  }