// Extra RF-029: pedir un enlace para recuperar la contraseña
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function RecuperarContrasena() {
    const [cargando, setCargando] = useState(false);
    const [enviado, setEnviado] = useState('');
    const [mensaje, setMensaje] = useState('');

    async function enviarEnlace(e) {
        e.preventDefault();
        setMensaje('');

        const correo = new FormData(e.currentTarget).get('correo').trim();
        setCargando(true);

        // Supabase manda un correo con un enlace hacia /nueva-contrasena
        const { error } = await supabase.auth.resetPasswordForEmail(correo, {
            redirectTo: `${window.location.origin}/nueva-contrasena`
        });

        setCargando(false);

        // Nunca decimos si el correo existe o no (igual que en el login)
        if (error?.status === 429) {
            setMensaje('Hiciste demasiados intentos. Espera unos minutos y vuelve a intentarlo.');
            return;
        }
        setEnviado(correo);
    }

    return (
        <div className="pagina-login">
            <div className="login-contenedor login-contenedor--estrecho">
                <header className="login-encabezado">
                    <h1>Recuperar Contraseña</h1>
                    <hr className="login-separador" />
                </header>

                {enviado ? (
                    <div className="login-formulario" role="status">
                        <p> Si el correo <strong>{enviado}</strong> está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa también tu carpeta de spam. </p>
                        <Link to="/" className="boton boton-principal"> Volver al Inicio de Sesión </Link>
                    </div>
                ) : (
                    <form className="login-formulario" onSubmit={enviarEnlace}>
                        <p> Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva contraseña. </p>

                        <div className="login-campo">
                            <label htmlFor="correo" className="login-etiqueta"> Correo Electrónico </label>
                            <input type="email" id="correo" name="correo" className="input" placeholder="Escribe una respuesta" autoComplete="email" required />
                        </div>

                        {mensaje && <p className="aviso-error" role="alert"> {mensaje} </p>}

                        <button type="submit" className="boton boton-principal" disabled={cargando}>
                            {cargando ? 'Enviando...' : 'Enviar enlace'}
                        </button>
                        <Link to="/" className="login-recuperar"> Volver al Inicio de Sesión </Link>
                    </form>
                )}
            </div>
        </div>
    );
}
