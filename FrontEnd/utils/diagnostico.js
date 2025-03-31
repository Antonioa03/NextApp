// Esta utilidad te permitirá diagnosticar problemas de conexión con el backend

// Función para verificar si el backend está en línea
export const checkBackendStatus = async () => {
    try {
      console.log('Verificando estado del backend...');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Intentar acceder a la ruta base para comprobar si el servidor está en línea
      const response = await fetch(`${API_URL}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const responseText = await response.text();
      console.log('Respuesta de estado del backend (texto):', responseText);
      
      return {
        isOnline: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseText
      };
    } catch (error) {
      console.error('Error al verificar el backend:', error);
      return {
        isOnline: false,
        error: error.message
      };
    }
  };
  
  export const checkCORSConfiguration = async () => {
    try {
      console.log('Verificando configuración CORS...');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      console.log(`Intentando conectar a: ${API_URL}/test`);
      
      // Usar un timeout para evitar que la solicitud se quede esperando indefinidamente
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      try {
        // Hacer una solicitud GET simple en lugar de OPTIONS
        const response = await fetch(`${API_URL}/test`, {
          method: 'GET',
          headers: {
            'Origin': window.location.origin
          },
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        // Verificar los encabezados CORS
        const corsHeaders = {
          'Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
          'Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
          'Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        };
        
        console.log('Respuesta recibida:', response.status, response.statusText);
        console.log('Encabezados CORS:', corsHeaders);
        
        return {
          isConfigured: !!corsHeaders['Allow-Origin'],
          status: response.status,
          statusText: response.statusText,
          headers: corsHeaders
        };
      } catch (fetchError) {
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
          console.error('La solicitud de verificación CORS excedió el tiempo de espera');
          return {
            isConfigured: false,
            error: 'Timeout - La solicitud excedió el tiempo de espera (5s)'
          };
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error al verificar CORS:', error);
      
      // Intentar una verificación alternativa
      try {
        console.log('Intentando verificación alternativa...');
        const response = await fetch(`${API_URL}`, {
          method: 'GET'
        });
        
        return {
          isConfigured: false,
          alternativeCheck: {
            success: true,
            status: response.status,
            statusText: response.statusText
          },
          error: error.message
        };
      } catch (altError) {
        return {
          isConfigured: false,
          error: error.message,
          alternativeError: altError.message,
          possibleIssues: [
            "El servidor no está ejecutándose",
            "La URL del backend es incorrecta",
            "Hay un firewall bloqueando las conexiones",
            "Hay un problema de red"
          ]
        };
      }
    }
  };
  
  // Función para probar credenciales específicas
  export const testCredentials = async (username, password) => {
    try {
      console.log(`Probando credenciales: ${username}`);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const responseText = await response.text();
      console.log('Respuesta de prueba de credenciales (texto):', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return {
          success: false,
          message: 'Respuesta no es JSON válido',
          responseText
        };
      }
      
      return {
        success: response.ok,
        status: response.status,
        data
      };
    } catch (error) {
      console.error('Error al probar credenciales:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Función para registrar un usuario de prueba
  export const registerTestUser = async () => {
    try {
      console.log('Registrando usuario de prueba...');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Generar un nombre de usuario aleatorio para evitar conflictos
      const randomSuffix = Math.floor(Math.random() * 10000);
      const password = 'Test123456';
      const testUser = {
        username: `test_user_${randomSuffix}`,
        email: `test${randomSuffix}@example.com`,
        password: password,
        confirmPassword: password  // Añadir confirmPassword con el mismo valor
      };
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser),
      });
      
      const responseText = await response.text();
      console.log('Respuesta de registro de usuario de prueba (texto):', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return {
          success: false,
          message: 'Respuesta no es JSON válido',
          responseText,
          testUser
        };
      }
      
      return {
        success: response.ok,
        status: response.status,
        data,
        testUser
      };
    } catch (error) {
      console.error('Error al registrar usuario de prueba:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Ejecutar diagnóstico completo
  export const runFullDiagnostic = async () => {
    console.log('Iniciando diagnóstico completo del sistema de autenticación...');
    
    // Comprobar variables de entorno
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    
    // 1. Verificar estado del backend
    const backendStatus = await checkBackendStatus();
    
    // Si el backend no está disponible, no continuar
    if (!backendStatus.isOnline) {
      return {
        success: false,
        backendStatus,
        message: 'El backend no está disponible. Verifica que esté en ejecución.'
      };
    }
    
    // 2. Verificar configuración CORS
    const corsConfig = await checkCORSConfiguration();
    
    // 3. Intentar registrar un usuario de prueba
    const registrationTest = await registerTestUser();
    
    // 4. Intentar iniciar sesión con ese usuario
    let loginTest = { success: false, message: 'No se pudo completar la prueba de inicio de sesión' };
    
    if (registrationTest.success) {
      loginTest = await testCredentials(
        registrationTest.testUser.username, 
        registrationTest.testUser.password
      );
    }
    
    return {
      success: registrationTest.success && loginTest.success,
      backendStatus,
      corsConfig,
      registrationTest,
      loginTest,
      timestamp: new Date().toISOString()
    };
  };