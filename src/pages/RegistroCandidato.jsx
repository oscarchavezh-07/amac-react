
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

import CampoRegistro from '../components/CampoRegistro';
import SeccionDatosCandidato from '../components/SeccionDatosCandidato';
import TerminosRegistro from '../components/TerminosRegistro';

export default function RegistroCandidato() {
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    async function registrarCandidato(e) {
        e.preventDefault();

        setCargando(true);
        setMensaje('');
        setError('');

        const formulario = new FormData(e.currentTarget);
        // formulario para ahorrar crear varios useState; gracias internet °^° 
        const nombre = formulario.get('nombre').trim();
        const correo = formulario.get('correo').trim();
        const contrasena = formulario.get('contrasena');
        const telefono = formulario.get('telefono').trim();
        const edad = Number(formulario.get('edad'));
        const colonia = formulario.get('colonia').trim();
        const experiencia = formulario.get('experiencia').trim();

        if (edad < 18 || edad > 120 || !Number.isInteger(edad)) {
            setError('La edad debe ser un número entero entre 18 y 120.');
            setCargando(false);
            return;
        }

        try {
            // lo del docs
            const { data, error } = await supabase.auth.signUp({
                email: correo,
                password: contrasena,
                options: {
                    data: {
                        rol: 'candidato',
                        nombre,
                        telefono,
                        edad,
                        colonia,
                        experiencia
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (data.session) {
                setMensaje('Tu registro se realizó correctamente. Ya puedes acceder a tu cuenta.');
            } else {
                setMensaje('Tu registro se realizó correctamente. Revisa tu correo para confirmar tu cuenta.');
            }

            e.currentTarget.reset();

        } catch (err) {
            console.error('Error al registrar candidato:', err);
            if (err.code === 'user_already_exists') {
                setError('Este correo ya se encuentra registrado.');
            } else {
                setError(err.message || 'No fue posible completar el registro.');
            }
        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="pagina-registro">
            <div className="login-contenedor">

                <section className="registro-encabezado">
                    <h1 className="registro-titulo"> Registrarse como Candidato </h1>
                    <hr className="login-separador" />
                </section>

                <form className="registro-formulario" onSubmit={registrarCandidato} >
                    <SeccionDatosCandidato />

                    <fieldset className="registro-seccion registro-contacto">
                        <legend className="registro-legend"> Contacto y acceso </legend>
                        <hr className="login-separador-discontinuo" />
                        <div className="registro-campos-contacto">
                            <CampoRegistro id="correo" name="correo" label="Correo electrónico" type="email" autoComplete="email" />
                            <CampoRegistro id="telefono" name="telefono" label="Teléfono" type="tel" autoComplete="tel" />
                            <CampoRegistro id="contrasena" name="contrasena" label="Contraseña" type="password" placeholder="Crea una contraseña" minLength="8" autoComplete="new-password" />
                        </div>
                    </fieldset>

                    <TerminosRegistro />

                    {error && (
                        <p className="registro-error" role="alert">
                            {error}
                        </p>
                    )}

                    {mensaje && (
                        <p className="registro-exito" role="status">
                            {mensaje}
                        </p>
                    )}

                    <button type="submit" className="boton boton-principal" disabled={cargando} >
                        {cargando ? 'Registrando...' : 'Registrarse'}
                    </button>
                    <Link to="/" className='boton boton-secundario'> Volver al Inicio de Sesión </Link>
                </form>
            </div>
        </main>
    );
}
