
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');

    async function iniciarSesion(e) {
        e.preventDefault();

        setCargando(true);
        setMensaje('');
        // el truquillo de registro de nuevo
        const formulario = new FormData(e.currentTarget);

        const correo = formulario.get('correo').trim();
        const contrasena = formulario.get('contrasena');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: correo,
                password: contrasena
            });

            if (error) {
                setMensaje('Correo o contraseña incorrectos.');
                return;
            }

            // usará AuthContext
            navigate('/', { replace: true });

        } catch (err) {
            console.error('Error al iniciar sesión:', err);
            setMensaje('Ocurrió un error al intentar iniciar sesión.');
        } finally {
            setCargando(false);
        }
    }
    // mayormente igual al html
    return (
        <div className="pagina-login">
            <div className="login-contenedor">

                <header className="login-encabezado">
                    <h1>Iniciar Sesión</h1>
                    <hr className="login-separador" />
                </header>

                <div className="login-contenido">

                    <form className="login-formulario" onSubmit={iniciarSesion} >

                        <div className="login-campo">
                            <label htmlFor="correo" className="login-etiqueta" >
                                Correo Electrónico
                            </label>

                            <input type="email" id="correo" name="correo" className="input" placeholder="Escribe una respuesta" autoComplete="email" required />
                        </div>

                        <div className="login-campo">
                            <label htmlFor="contrasena" className="login-etiqueta" >
                                Contraseña
                            </label>

                            <input type="password" id="contrasena" name="contrasena" className="input" placeholder="Escribe una respuesta" autoComplete="current-password" required />
                        </div>

                        <Link to="/recuperar" className="login-recuperar"> ¿Olvidaste tu contraseña? </Link>
                        <hr className="login-separador-discontinuo" />
                        <p className="login-terminos"> Al iniciar sesión aceptas los {' '} <Link to="/terminos-servicio"> términos de Servicio y Privacidad de AMAC. </Link> </p>
                        {mensaje && (
                            <p className="login-error" role="alert"> {mensaje} </p>
                        )}

                        <button type="submit" className="boton boton-principal" disabled={cargando} > {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'} </button>

                        <div className="login-registro">

                            <p className="login-registro-texto"> ¿No tienes cuenta? Regístrate</p>

                            <div className="login-registro-opciones">
                                <Link to="/registro-candidato" className="boton boton-secundario" >
                                    Registrarse como Candidato
                                </Link>
                                <Link to="/registro-empresa" className="boton boton-secundario" >
                                    Registrarse como Empresa
                                </Link>

                            </div>
                        </div>
                    </form>

                    <aside className="login-imagen">
                        <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" alt="Imagen ilustrativa de inicio de sesión" />
                    </aside>

                </div>
            </div>
        </div>
    );
}
