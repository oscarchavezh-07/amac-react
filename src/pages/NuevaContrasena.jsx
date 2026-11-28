// Extra RF-029: crear una nueva contraseña desde el enlace del correo.
// Al abrir el enlace, Supabase inicia una sesión temporal de recuperación.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function NuevaContrasena() {
    const { sesion } = useAuth();
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [listo, setListo] = useState(false);

    async function guardar(e) {
        e.preventDefault();
        setMensaje('');

        const formulario = new FormData(e.currentTarget);
        const contrasena = formulario.get('contrasena');
        const confirmar = formulario.get('confirmar');

        if (contrasena.length < 8) {
            setMensaje('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (contrasena !== confirmar) {
            setMensaje('Las contraseñas no coinciden.');
            return;
        }

        setCargando(true);
        const { error } = await supabase.auth.updateUser({ password: contrasena });
        setCargando(false);

        if (error) {
            setMensaje(error.code === 'same_password'
                ? 'La nueva contraseña debe ser distinta a la anterior.'
                : 'No fue posible cambiar la contraseña. Pide un enlace nuevo e inténtalo otra vez.');
            return;
        }
        setListo(true);
    }

    // undefined = todavía se está leyendo la sesión del enlace
    if (sesion === undefined) return <p role="status">Cargando...</p>;

    return (
        <div className="pagina-login">
            <div className="login-contenedor login-contenedor--estrecho">
                <header className="login-encabezado">
                    <h1>Nueva Contraseña</h1>
                    <hr className="login-separador" />
                </header>

                {!sesion && (
                    <div className="login-formulario" role="alert">
                        <p> El enlace no es válido o ya expiró. Pide uno nuevo para recuperar tu contraseña. </p>
                        <Link to="/recuperar" className="boton boton-principal"> Pedir otro enlace </Link>
                    </div>
                )}

                {sesion && listo && (
                    <div className="login-formulario" role="status">
                        <p> Tu contraseña se cambió correctamente. </p>
                        <button type="button" className="boton boton-principal" onClick={() => navigate('/', { replace: true })}>
                            Ir a Vacantes
                        </button>
                    </div>
                )}

                {sesion && !listo && (
                    <form className="login-formulario" onSubmit={guardar}>
                        <div className="login-campo">
                            <label htmlFor="contrasena" className="login-etiqueta"> Nueva contraseña (mínimo 8 caracteres) </label>
                            <input type="password" id="contrasena" name="contrasena" className="input" autoComplete="new-password" minLength="8" required />
                        </div>
                        <div className="login-campo">
                            <label htmlFor="confirmar" className="login-etiqueta"> Confirmar contraseña </label>
                            <input type="password" id="confirmar" name="confirmar" className="input" autoComplete="new-password" minLength="8" required />
                        </div>

                        {mensaje && <p className="aviso-error" role="alert"> {mensaje} </p>}

                        <button type="submit" className="boton boton-principal" disabled={cargando}>
                            {cargando ? 'Guardando...' : 'Guardar contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
