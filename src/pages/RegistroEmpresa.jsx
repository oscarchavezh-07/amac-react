import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import AlertaError from '../components/AlertaError'
import CampoFormulario from '../components/CampoFormulario'
import CasillaFormulario from '../components/CasillaFormulario'

const VACIO = {
  nombre: '',
  giro: '',
  telefono: '',
  correo: '',
  contrasena: '',
  confirmar: '',
  terminosServicio: false,
  terminosPrivacidad: false,
}

function validar(datos) {
  const errores = {}
  if (!datos.nombre.trim()) errores.nombre = 'Escribe el nombre de la empresa.'
  if (!datos.giro.trim()) errores.giro = 'Escribe el giro de la empresa.'

  const digitos = datos.telefono.replace(/\D/g, '')
  if (!digitos) errores.telefono = 'Escribe el teléfono de la empresa.'
  else if (digitos.length !== 10) errores.telefono = 'El teléfono debe tener 10 dígitos.'

  if (!datos.correo.trim()) errores.correo = 'Escribe el correo de la empresa.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) errores.correo = 'Escribe un correo válido, por ejemplo contacto@empresa.com.'

  if (datos.contrasena.length < 6) errores.contrasena = 'La contraseña debe tener al menos 6 caracteres.'
  if (datos.confirmar !== datos.contrasena) errores.confirmar = 'Las contraseñas no coinciden.'

  if (!datos.terminosServicio) errores.terminosServicio = 'Debes aceptar los Términos de Servicio.'
  if (!datos.terminosPrivacidad) errores.terminosPrivacidad = 'Debes aceptar los Términos de Privacidad.'
  return errores
}

export default function RegistroEmpresa() {
  const { sesion, cargando } = useAuth()
  const navigate = useNavigate()

  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [registrado, setRegistrado] = useState(false)

  if (!cargando && sesion && !enviando) return <Navigate to="/" replace />

  function cambiar(evento) {
    const { name, value, type, checked } = evento.target
    setDatos(previos => ({ ...previos, [name]: type === 'checkbox' ? checked : value }))
  }

  function propsDe(nombre) {
    return {
      id: nombre,
      name: nombre,
      value: datos[nombre],
      onChange: cambiar,
      placeholder: 'Escribe una respuesta',
      'aria-invalid': errores[nombre] ? true : undefined,
      'aria-describedby': errores[nombre] ? `${nombre}-error` : undefined,
    }
  }

  async function registrar(evento) {
    evento.preventDefault()
    setMensaje('')

    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) {
      setMensaje('Datos inválidos. Revisa los campos marcados.')
      document.getElementById(Object.keys(nuevosErrores)[0])?.focus()
      return
    }

    setEnviando(true)
    const { data, error } = await supabase.auth.signUp({
      email: datos.correo.trim(),
      password: datos.contrasena,
      options: {
        data: {
          rol: 'empresa',
          nombre: datos.nombre.trim(),
          giro: datos.giro.trim(),
          telefono: datos.telefono.replace(/\D/g, ''),
        },
      },
    })

    if (error) {
      setEnviando(false)
      if (error.code === 'user_already_exists' || /already registered/i.test(error.message)) {
        setMensaje('Ya existe una cuenta con ese correo. Inicia sesión o usa otro correo.')
      } else if (error.code === 'weak_password') {
        setMensaje('La contraseña es muy débil. Usa una más larga o con números y letras.')
      } else {
        setMensaje('No fue posible completar el registro. Intenta de nuevo más tarde.')
      }
      return
    }

    if (data.session) {
      navigate('/empresa/vacantes', {
        replace: true,
        state: { aviso: 'Tu cuenta de empresa fue creada. Ya puedes publicar vacantes.' },
      })
    } else {
      setEnviando(false)
      setRegistrado(true)
    }
  }

  if (registrado) {
    return (
      <section className="pagina-registro" aria-labelledby="titulo-registro">
        <div className="login-contenedor">
          <h1 id="titulo-registro">Verificación de Registro</h1>
          <hr className="login-separador" />
          <div className="tarjeta-aviso" role="status">
            <p>Te enviamos un correo para confirmar la cuenta de la empresa. Después podrás iniciar sesión y publicar vacantes.</p>
            <Link className="boton boton-principal" to="/login">Ir a Iniciar Sesión</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pagina-registro" aria-labelledby="titulo-registro">
      <div className="login-contenedor">
        <h1 id="titulo-registro">Registrarse como Empresa</h1>
        <p>Los campos con * son obligatorios.</p>
        <hr className="login-separador" />

        {mensaje && <AlertaError>{mensaje}</AlertaError>}

        <form className="registro-form" onSubmit={registrar} noValidate>
          <div className="registro-columna">
            <fieldset className="registro-grupo">
              <legend className="registro-subtitulo">Datos de la empresa</legend>

              <CampoFormulario id="nombre" etiqueta="Nombre de la empresa*" error={errores.nombre}>
                <input className="input" type="text" autoComplete="organization" {...propsDe('nombre')} />
              </CampoFormulario>

              <CampoFormulario id="giro" etiqueta="Giro*" error={errores.giro}>
                <input className="input" type="text" {...propsDe('giro')} placeholder="Ej. Tienda de autoservicio" />
              </CampoFormulario>

              <CampoFormulario id="telefono" etiqueta="Teléfono* (10 dígitos)" error={errores.telefono}>
                <input className="input" type="tel" inputMode="tel" autoComplete="tel-national" {...propsDe('telefono')} />
              </CampoFormulario>
            </fieldset>
          </div>

          <div className="registro-columna">
            <fieldset className="registro-grupo">
              <legend className="registro-subtitulo">Cuenta</legend>

              <CampoFormulario id="correo" etiqueta="Correo*" error={errores.correo}>
                <input className="input" type="email" autoComplete="email" {...propsDe('correo')} />
              </CampoFormulario>

              <CampoFormulario id="contrasena" etiqueta="Contraseña* (mínimo 6 caracteres)" error={errores.contrasena}>
                <input className="input" type="password" autoComplete="new-password" {...propsDe('contrasena')} />
              </CampoFormulario>

              <CampoFormulario id="confirmar" etiqueta="Confirmar contraseña*" error={errores.confirmar}>
                <input className="input" type="password" autoComplete="new-password" {...propsDe('confirmar')} />
              </CampoFormulario>
            </fieldset>
          </div>

          <hr className="registro-linea" />

          <div className="registro-terminos-fila">
            <CasillaFormulario
              id="terminosServicio"
              texto="Aceptar Términos de Servicio*"
              marcada={datos.terminosServicio}
              error={errores.terminosServicio}
              onChange={cambiar}
            />
            <CasillaFormulario
              id="terminosPrivacidad"
              texto="Aceptar Términos de Privacidad*"
              marcada={datos.terminosPrivacidad}
              error={errores.terminosPrivacidad}
              onChange={cambiar}
            />
          </div>

          <div className="registro-enviar">
            <button className="boton boton-principal" type="submit" disabled={enviando}>
              {enviando ? 'Registrando…' : 'Registrarse'}
            </button>
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
            <p>¿Buscas empleo? <Link to="/registro">Regístrate como candidato</Link></p>
          </div>
        </form>
      </div>
    </section>
  )
}