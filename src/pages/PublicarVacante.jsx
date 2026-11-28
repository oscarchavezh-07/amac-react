import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { HORARIOS, CATEGORIAS } from '../lib/catalogos'
import AlertaError from '../components/AlertaError'
import CampoFormulario from '../components/CampoFormulario'
import ModalMensaje from '../components/ModalMensaje'

const VACIO = {
  titulo: '',
  sueldo: '',
  ubicacion: '',
  horario: '',
  categoria: '',
  descripcion: '',
  requisitos: '',
  prestaciones: '',
  medio: 'plataforma',
  telefono_contacto: '',
}

function validar(datos) {
  const errores = {}
  if (!datos.titulo.trim()) errores.titulo = 'Escribe el nombre del puesto.'
  if (!(Number(datos.sueldo) > 0)) errores.sueldo = 'Escribe un sueldo mayor a 0.'
  if (!datos.ubicacion.trim()) errores.ubicacion = 'Escribe la ubicación del trabajo.'
  if (!HORARIOS.includes(datos.horario)) errores.horario = 'Elige un horario.'
  if (!CATEGORIAS.includes(datos.categoria)) errores.categoria = 'Elige una categoría.'
  if (!datos.descripcion.trim()) errores.descripcion = 'Describe el puesto.'
  if (!datos.requisitos.trim()) errores.requisitos = 'Escribe los requisitos.'
  if (!datos.prestaciones.trim()) errores.prestaciones = 'Escribe las prestaciones.'
  if (datos.medio === 'telefono' && datos.telefono_contacto.replace(/\D/g, '').length !== 10) {
    errores.telefono_contacto = 'El teléfono debe tener 10 dígitos.'
  }
  return errores
}

export default function PublicarVacante() {
  const { sesion } = useAuth()
  const navigate = useNavigate()

  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [publicada, setPublicada] = useState(null)

  function cambiar(evento) {
    const { name, value } = evento.target
    setDatos(previos => ({ ...previos, [name]: value }))
  }

  function propsDe(nombre) {
    return {
      id: nombre,
      name: nombre,
      value: datos[nombre],
      onChange: cambiar,
      'aria-invalid': errores[nombre] ? true : undefined,
      'aria-describedby': errores[nombre] ? `${nombre}-error` : undefined,
    }
  }

  async function publicar(evento) {
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
    const { data, error } = await supabase
      .from('vacantes')
      .insert({
        empresa_id: sesion.user.id,
        titulo: datos.titulo.trim(),
        sueldo: Number(datos.sueldo),
        ubicacion: datos.ubicacion.trim(),
        horario: datos.horario,
        categoria: datos.categoria,
        descripcion: datos.descripcion.trim(),
        requisitos: datos.requisitos.trim(),
        prestaciones: datos.prestaciones.trim(),
        telefono_contacto: datos.medio === 'telefono' ? datos.telefono_contacto.replace(/\D/g, '') : null,
      })
      .select('id, titulo')
      .single()
    setEnviando(false)

    if (error) {
      setMensaje(
        error.code === '42501'
          ? 'Tu cuenta no tiene permiso para publicar vacantes.'
          : 'No fue posible publicar la vacante. Intenta de nuevo más tarde.'
      )
      return
    }

    setPublicada(data)
  }

  function publicarOtra() {
    setPublicada(null)
    setDatos(VACIO)
    setErrores({})
  }

  return (
    <section className="pagina-registro" aria-labelledby="titulo-publicar">
      <div className="login-contenedor">
        <h1 id="titulo-publicar">Publicar Vacante</h1>
        <p>Los campos con * son obligatorios.</p>
        <hr className="login-separador" />

        {mensaje && <AlertaError>{mensaje}</AlertaError>}

        <form className="registro-form" onSubmit={publicar} noValidate>
          <div className="registro-columna">
            <fieldset className="registro-grupo">
              <legend className="registro-subtitulo">Datos del puesto</legend>

              <CampoFormulario id="titulo" etiqueta="Puesto*" error={errores.titulo}>
                <input className="input" type="text" {...propsDe('titulo')} placeholder="Ej. Cajero de medio tiempo" />
              </CampoFormulario>

              <CampoFormulario id="sueldo" etiqueta="Sueldo mensual (MXN)*" error={errores.sueldo}>
                <input className="input input--corto" type="number" inputMode="decimal" min="1" step="0.01" {...propsDe('sueldo')} placeholder="Ej. 8000" />
              </CampoFormulario>

              <CampoFormulario id="ubicacion" etiqueta="Ubicación*" error={errores.ubicacion}>
                <input className="input" type="text" {...propsDe('ubicacion')} placeholder="Ej. Monterrey, Av. Constitución #100" />
              </CampoFormulario>

              <CampoFormulario id="horario" etiqueta="Horario*" error={errores.horario}>
                <select className="input" {...propsDe('horario')}>
                  <option value="" disabled>Elige una respuesta</option>
                  {HORARIOS.map(horario => <option key={horario}>{horario}</option>)}
                </select>
              </CampoFormulario>

              <CampoFormulario id="categoria" etiqueta="Categoría*" error={errores.categoria}>
                <select className="input" {...propsDe('categoria')}>
                  <option value="" disabled>Elige una respuesta</option>
                  {CATEGORIAS.map(categoria => <option key={categoria}>{categoria}</option>)}
                </select>
              </CampoFormulario>
            </fieldset>

            <fieldset className="registro-grupo">
              <legend className="registro-subtitulo">¿Cómo quieres recibir postulaciones?</legend>
              <div className="registro-opcion">
                <label className="casilla">
                  <input type="radio" name="medio" value="plataforma" checked={datos.medio === 'plataforma'} onChange={cambiar} />
                  <span>Solo por la plataforma</span>
                </label>
                <label className="casilla">
                  <input type="radio" name="medio" value="telefono" checked={datos.medio === 'telefono'} onChange={cambiar} />
                  <span>También por teléfono</span>
                </label>
              </div>
              {datos.medio === 'telefono' && (
                <CampoFormulario id="telefono_contacto" etiqueta="Teléfono de contacto* (10 dígitos)" error={errores.telefono_contacto}>
                  <input className="input" type="tel" inputMode="tel" {...propsDe('telefono_contacto')} placeholder="Escribe una respuesta" />
                </CampoFormulario>
              )}
            </fieldset>
          </div>

          <div className="registro-columna">
            <fieldset className="registro-grupo">
              <legend className="registro-subtitulo">Descripción</legend>

              <CampoFormulario id="descripcion" etiqueta="Descripción del puesto*" error={errores.descripcion}>
                <textarea className="input" rows="4" {...propsDe('descripcion')} placeholder="¿Qué hará la persona en este puesto?" />
              </CampoFormulario>

              <CampoFormulario id="requisitos" etiqueta="Requisitos*" error={errores.requisitos}>
                <textarea className="input" rows="3" {...propsDe('requisitos')} placeholder="Ej. Secundaria terminada" />
              </CampoFormulario>

              <CampoFormulario id="prestaciones" etiqueta="Prestaciones*" error={errores.prestaciones}>
                <textarea className="input" rows="3" {...propsDe('prestaciones')} placeholder="Ej. Prestaciones de ley, vales de despensa" />
              </CampoFormulario>
            </fieldset>
          </div>

          <hr className="registro-linea" />

          <div className="registro-enviar">
            <button className="boton boton-principal" type="submit" disabled={enviando}>
              {enviando ? 'Publicando…' : 'Publicar Vacante'}
            </button>
            <Link className="boton-secundario" to="/empresa/vacantes">Cancelar</Link>
          </div>
        </form>
      </div>

      {publicada && (
        <ModalMensaje
          titulo="Vacante Publicada"
          textoBoton="Ver mis vacantes"
          onCerrar={() => navigate('/empresa/vacantes')}
          acciones={
            <button className="boton-secundario" type="button" onClick={publicarOtra}>
              Publicar otra
            </button>
          }
        >
          <strong>{publicada.titulo}</strong> ya aparece en la oferta de vacantes.
        </ModalMensaje>
      )}
    </section>
  )
}