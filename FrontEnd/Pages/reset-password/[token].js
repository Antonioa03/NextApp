import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword, user } = useAuth();
  const router = useRouter();
  const { token } = router.query;

  // Redireccionar si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      if (!token) {
        setError('Token inválido');
        return;
      }

      const success = await resetPassword(password, token);
      
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      }
    } catch (err) {
      setError('Error al restablecer la contraseña');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Si no hay token, mostrar mensaje de error
  if (!token && typeof window !== 'undefined') {
    return (
      <div className="auth-container">
        <div className="form-container">
          <div className="form-background"></div>
          <div className="auth-form">
            <h2 className="form-title">Error</h2>
            <p className="error-message">Token inválido o expirado</p>
            <button 
              className="submit-button" 
              onClick={() => router.push('/')}
            >
              Volver al inicio
            </button>
          </div>
        </div>
        <style jsx>{`
          /* Estilos similares a los de Login.js */
          .auth-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .form-container {
            position: relative;
            width: 100%;
            max-width: 420px;
            min-height: 380px;
            overflow: hidden;
            border-radius: 16px;
            box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
            background-color: white;
          }
          
          .form-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 120px;
            background: linear-gradient(120deg, #6a11cb 0%, #2575fc 100%);
            border-radius: 16px 16px 0 0;
            z-index: 0;
          }
          
          .auth-form {
            position: relative;
            display: flex;
            flex-direction: column;
            padding: 35px 30px;
            background-color: white;
            border-radius: 16px;
            margin-top: 60px;
            z-index: 1;
          }
          
          .form-title {
            margin-bottom: 30px;
            color: #333;
            font-size: 28px;
            font-weight: 700;
            text-align: center;
          }
          
          .error-message {
            text-align: center;
            color: #e53e3e;
            margin-bottom: 20px;
          }
          
          .submit-button {
            padding: 12px 24px;
            margin-top: 10px;
            border: none;
            border-radius: 8px;
            background: linear-gradient(120deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 48px;
          }
          
          .submit-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className={`form-container ${isLoading ? 'loading' : ''}`}>
        <div className="form-background"></div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="form-title">Restablecer Contraseña</h2>
          
          {isSuccess ? (
            <div className="success-message">
              Contraseña restablecida con éxito. Redirigiendo...
            </div>
          ) : (
            <>
              {error && <p className="error-message">{error}</p>}
              
              <div className="input-group">
                <label htmlFor="password">Nueva Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="submit-button">
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  'Restablecer Contraseña'
                )}
              </button>
              
              <div className="form-footer">
                <p onClick={() => router.push('/')} className="back-to-login">
                  Volver al inicio de sesión
                </p>
              </div>
            </>
          )}
        </form>
        
        {isLoading && <div className="loading-overlay"></div>}
      </div>
      
      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .form-container {
          position: relative;
          width: 100%;
          max-width: 420px;
          min-height: 480px;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
          background-color: white;
          transition: all 0.3s ease;
        }
        
        .form-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(120deg, #6a11cb 0%, #2575fc 100%);
          border-radius: 16px 16px 0 0;
          z-index: 0;
        }
        
        .auth-form {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 35px 30px;
          background-color: white;
          border-radius: 16px;
          margin-top: 60px;
          z-index: 1;
          transition: all 0.5s ease;
        }
        
        .form-title {
          margin-bottom: 30px;
          color: #333;
          font-size: 28px;
          font-weight: 700;
          text-align: center;
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          color: #555;
          font-weight: 500;
        }
        
        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          color: #333;
          transition: all 0.3s;
          background-color: #f9fafc;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #2575fc;
          box-shadow: 0 0 0 2px rgba(37, 117, 252, 0.1);
        }
        
        .error-message {
          color: #e53e3e;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .success-message {
          color: #38a169;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .submit-button {
          padding: 12px 24px;
          margin-top: 10px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(120deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 48px;
        }
        
        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        
        .form-footer {
          margin-top: 20px;
          text-align: center;
        }
        
        .back-to-login {
          color: #2575fc;
          font-size: 14px;
          margin: 10px 0;
          cursor: pointer;
          transition: color 0.3s;
        }
        
        .back-to-login:hover {
          color: #6a11cb;
          text-decoration: underline;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2;
          animation: fadeIn 0.3s forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .form-container.loading {
          transform: scale(0.98);
        }
        
        /* Responsive design */
        @media (max-width: 480px) {
          .form-container {
            max-width: 100%;
          }
          
          .auth-form {
            padding: 30px 20px;
          }
          
          .form-title {
            font-size: 24px;
          }
          
          .input-group input {
            padding: 10px 14px;
          }
        }
      `}</style>T
    </div>
  );
}