
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

import CampoRegistro from '../components/CampoRegistro'
import TerminosRegistro from '../components/TerminosRegistro'

export default function RegistroEmpresa() {

  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  // Mucho la misma lógica que con el candidato juasjuas
  async function registrarEmpresa(e) {
    e.preventDefault()

    const elementoFormulario = e.currentTarget
    const formulario = new FormData(elementoFormulario)

    setCargando(true)
    setMensaje('')
    setError('')

    const nombre = formulario.get('nombre').trim()
    const giro = formulario.get('giro').trim()
    const telefono = formulario.get('telefono').trim()
    const correo = formulario.get('correo').trim()
    const contrasena = formulario.get('contrasena')
    const terminos = formulario.get('terminos')

    if (!terminos) {
      setError('Debes aceptar los términos y condiciones.')
      setCargando(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: correo,
        password: contrasena,
        options: {
          data: {
            rol: 'empresa',
            nombre,
            giro,
            telefono
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.session) {
        setMensaje( 'Tu registro se realizó correctamente. Ya puedes acceder a tu cuenta.' )
      } else {
        setMensaje( 'Tu registro se realizó correctamente. Revisa tu correo para confirmar tu cuenta.' )
      }

      elementoFormulario.reset()

    } catch (err) {
      console.error('Error al registrar empresa:', err)
      if (err.code === 'user_already_exists') {
        setError('Este correo ya se encuentra registrado.')
      } else {
        setError(err.message || 'No fue posible completar el registro.')
      }

    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="pagina-registro">
      <div className="login-contenedor">
        <section className="registro-encabezado">
          <h1 className="registro-titulo"> Registrarse como Empresa </h1>
          <hr className="login-separador" />
        </section>

        <form className="registro-formulario" onSubmit={registrarEmpresa} >
          <fieldset className="registro-seccion">
            <legend className="registro-legend"> Datos de la empresa </legend>
            <hr className="login-separador-discontinuo" />
            <div className="registro-campos-contacto">
              <CampoRegistro id="nombre" name="nombre" label="Nombre de la empresa" type="text" placeholder="Nombre de tu empresa" autoComplete="organization" required />
              <CampoRegistro id="giro" name="giro" label="Giro de la empresa" type="text" placeholder="Ej. Comercio, Tecnología, Construcción" required />
              <CampoRegistro id="telefono" name="telefono" label="Teléfono de contacto" type="tel" autoComplete="tel" placeholder="Número de teléfono" required />
            </div>
          </fieldset>

          <fieldset className="registro-seccion registro-contacto">
            <legend className="registro-legend"> Contacto y acceso </legend>
            <hr className="login-separador-discontinuo" />
            <div className="registro-campos-contacto">
              <CampoRegistro id="correo" name="correo" label="Correo electrónico" type="email" autoComplete="email" required />
              <CampoRegistro id="contrasena" name="contrasena" label="Contraseña" type="password" placeholder="Crea una contraseña" minLength="8" autoComplete="new-password" required />
            </div>
          </fieldset>

          <TerminosRegistro />

          {error && (
            <p className="registro-error" role="alert"> {error} </p>
          )}
          {mensaje && (
            <p className="registro-exito" role="status">{mensaje}</p>
          )}

          <button type="submit" className="boton boton-principal" disabled={cargando} >
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
          <Link to="/" className="boton boton-secundario" >
            Volver al Inicio de Sesión
          </Link>
        </form>
      </div>
    </main>
  )
}
