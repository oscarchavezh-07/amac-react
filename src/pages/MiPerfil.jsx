import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import '../styles/perfil.css';

export default function MiPerfil() {
    const { sesion, perfil, cargando } = useAuth();

    const [datos, setDatos] = useState(null);
    const [original, setOriginal] = useState(null);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setDatos(perfil);
        setOriginal(perfil);
    }, [perfil]);

    function cambiarCampo(e) {
        const { name, value } = e.target;

        setDatos(anterior => ({
            ...anterior,
            [name]: value
        }));
    }

    function cancelarEdicion() {
        setDatos(original);
        setEditando(false);
        setError('');
        setMensaje('');
    }

    async function guardarPerfil(e) {
        e.preventDefault();

        if (!editando || guardando) return;

        setMensaje('');
        setError('');

        const cambios = {
            nombre: (datos.nombre ?? '').trim(),
            telefono: (datos.telefono ?? '').trim()
        };

        if (datos.rol === 'candidato') {
            cambios.edad = Number(datos.edad);
            cambios.colonia = (datos.colonia ?? '').trim();
            cambios.experiencia = (datos.experiencia ?? '').trim();

            if (
                !Number.isInteger(cambios.edad) ||
                cambios.edad < 18 ||
                cambios.edad > 120
            ) {
                setError('Ingresa una edad válida.');
                return;
            }
        } else {
            cambios.giro = (datos.giro ?? '').trim();
        }

        if (Object.values(cambios).some(valor => valor === '')) {
            setError('Completa todos los campos.');
            return;
        }

        setGuardando(true);

        try {
            const { data, error } = await supabase
                .from('perfiles')
                .update(cambios)
                .eq('id', sesion.user.id)
                .select()
                .single();

            if (error) throw error;

            setDatos(data);
            setOriginal(data);
            setEditando(false);
            setMensaje('Tu perfil se actualizó correctamente.');

        } catch (err) {
            console.error(err);
            setError('No fue posible actualizar tu perfil.');

        } finally {
            setGuardando(false);
        }
    }

    if (cargando) {
        return <p role="status">Cargando perfil...</p>;
    }

    if (!datos || !sesion) {
        return <p>No se encontró tu perfil.</p>;
    }

    if (!['candidato', 'empresa'].includes(datos.rol)) {
        return <p>No tienes acceso a esta página.</p>;
    }

    const esCandidato = datos.rol === 'candidato';

    return (
        <section className="mi-perfil">
            <h1>Mi perfil</h1>

            <p>
                {esCandidato
                    ? 'Perfil de candidato'
                    : 'Perfil de empresa'}
            </p>

            <form
                className="perfil-formulario"
                onSubmit={guardarPerfil}
            >

                {/* Nombre */}
                <div className="registro-campo">
                    <label
                        htmlFor="nombre"
                        className="login-etiqueta"
                    >
                        {esCandidato
                            ? 'Nombre completo'
                            : 'Nombre de la empresa'}*
                    </label>

                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        className="input"
                        value={datos.nombre ?? ''}
                        onChange={cambiarCampo}
                        readOnly={!editando || guardando}
                        required
                    />
                </div>

                {/* Correo electrónico */}
                <div className="registro-campo">
                    <label
                        htmlFor="correo"
                        className="login-etiqueta"
                    >
                        Correo electrónico
                    </label>

                    <input
                        id="correo"
                        name="correo"
                        type="email"
                        className="input"
                        value={sesion.user.email ?? ''}
                        readOnly
                    />
                </div>

                {/* Teléfono */}
                <div className="registro-campo">
                    <label
                        htmlFor="telefono"
                        className="login-etiqueta"
                    >
                        Teléfono*
                    </label>

                    <input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        className="input"
                        value={datos.telefono ?? ''}
                        onChange={cambiarCampo}
                        readOnly={!editando || guardando}
                        required
                    />
                </div>

                {/* Campos exclusivos del candidato */}
                {esCandidato ? (
                    <>
                        <div className="registro-campo">
                            <label
                                htmlFor="edad"
                                className="login-etiqueta"
                            >
                                Edad*
                            </label>

                            <input
                                id="edad"
                                name="edad"
                                type="number"
                                className="input"
                                min="18"
                                max="120"
                                value={datos.edad ?? ''}
                                onChange={cambiarCampo}
                                readOnly={!editando || guardando}
                                required
                            />
                        </div>

                        <div className="registro-campo">
                            <label
                                htmlFor="colonia"
                                className="login-etiqueta"
                            >
                                Colonia*
                            </label>

                            <input
                                id="colonia"
                                name="colonia"
                                type="text"
                                className="input"
                                value={datos.colonia ?? ''}
                                onChange={cambiarCampo}
                                readOnly={!editando || guardando}
                                required
                            />
                        </div>

                        <div className="registro-campo">
                            <label
                                htmlFor="experiencia"
                                className="login-etiqueta"
                            >
                                Experiencia laboral*
                            </label>

                            <textarea
                                id="experiencia"
                                name="experiencia"
                                className="input"
                                rows="5"
                                value={datos.experiencia ?? ''}
                                onChange={cambiarCampo}
                                readOnly={!editando || guardando}
                                required
                            />
                        </div>
                    </>

                ) : (

                    /* Campos exclusivos de la empresa */
                    <div className="registro-campo">
                        <label
                            htmlFor="giro"
                            className="login-etiqueta"
                        >
                            Giro de la empresa*
                        </label>

                        <input
                            id="giro"
                            name="giro"
                            type="text"
                            className="input"
                            value={datos.giro ?? ''}
                            onChange={cambiarCampo}
                            readOnly={!editando || guardando}
                            required
                        />
                    </div>
                )}

                {/* Mensajes de confirmación y error */}
                {mensaje && (
                    <p role="status">{mensaje}</p>
                )}

                {error && (
                    <p role="alert">{error}</p>
                )}

                {/* Botones */}
                <div className="perfil-acciones">
                    {!editando ? (
                        <button
                            key="editar"
                            type="button"
                            className="perfil-boton"
                            onClick={(e) => {
                                e.preventDefault();
                                setMensaje('');
                                setError('');
                                setEditando(true);
                            }}
                        >
                            Editar perfil
                        </button>
                    ) : (
                        <>
                            <button
                                key="guardar"
                                type="submit"
                                className="perfil-boton"
                                disabled={guardando}
                            >
                                {guardando
                                    ? 'Guardando...'
                                    : 'Guardar cambios'}
                            </button>

                            <button
                                key="cancelar"
                                type="button"
                                className="perfil-cancelar"
                                onClick={cancelarEdicion}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </form>
        </section>
    );
}