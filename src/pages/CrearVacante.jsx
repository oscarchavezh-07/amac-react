
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CampoRegistro from '../components/CampoRegistro'

export default function CrearVacante() {
  const { sesion } = useAuth()
  const navigate = useNavigate()

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function registrarVacante(e) {
    e.preventDefault()
    // Mismo rollo que con los registros, pero ahora con datos de la vacante.
    const elementoFormulario = e.currentTarget
    const formulario = new FormData(elementoFormulario)

    setCargando(true)
    setError('')

    const titulo = formulario.get('titulo').trim()
    const sueldo = Number(formulario.get('sueldo'))
    const ubicacion = formulario.get('ubicacion').trim()
    const horario = formulario.get('horario')
    const categoria = formulario.get('categoria').trim()
    const descripcion = formulario.get('descripcion').trim()
    const requisitos = formulario.get('requisitos').trim()
    const prestaciones = formulario.get('prestaciones').trim()
    const telefono = formulario.get('telefono').trim()

    if (!sueldo || sueldo <= 0) {
      setError('Ingresa un sueldo válido.')
      setCargando(false)
      return
    }
    try {
      const { error } = await supabase
        .from('vacantes')
        .insert({
          empresa_id: sesion.user.id,
          titulo,
          sueldo,
          ubicacion,
          horario,
          categoria,
          descripcion,
          requisitos,
          prestaciones,
          telefono_contacto: telefono || null
        })

      if (error) throw error

      navigate('/vacantes-empresa', {
        replace: true,
        state: { mensaje: 'La vacante se publicó correctamente.' }
      })
    } catch (err) {
      console.error('Error al publicar vacante:', err)
      setError('No fue posible publicar la vacante. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="pagina-registro">
      <div className="login-contenedor">

        <section className="registro-encabezado">
          <h1 className="registro-titulo">Publicar Vacante</h1>

          <hr className="login-separador" />

          <p> Completa la información para publicar una nueva oportunidad de empleo. </p>
        </section>

        <form className="registro-formulario" onSubmit={registrarVacante} >
          <fieldset className="registro-seccion">
            <legend className="registro-legend"> Información general </legend>

            <hr className="login-separador-discontinuo" />

            <div className="registro-campos-contacto">
              <CampoRegistro id="titulo" name="titulo" label="Título de la vacante" type="text" placeholder="Ej. Guardia de Seguridad" required />
              <CampoRegistro id="sueldo" name="sueldo" label="Sueldo mensual (MXN)" type="number" placeholder="Ej. 9999" min="0.01" step="0.01" required />
              <CampoRegistro id="ubicacion" name="ubicacion" label="Ubicación" type="text" placeholder="Ej. Monterrey, Nuevo León" required />
              <div className="campo-registro">
                <label htmlFor="horario">Horario</label>

                <select id="horario" name="horario" required defaultValue="" >
                  <option value="" disabled>
                    Selecciona un horario
                  </option>
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Fines de semana">Fines de semana</option>
                </select>
              </div>

              <CampoRegistro id="categoria" name="categoria" label="Categoría" type="text" placeholder="Ej. Seguridad, Ventas, Administración" required />
            </div>
          </fieldset>

          <fieldset className="registro-seccion">
            <legend className="registro-legend"> Descripción del empleo </legend>

            <hr className="login-separador-discontinuo" />

            <div className="registro-campos-contacto">
              <div className="campo-registro">
                <label htmlFor="descripcion">Descripción</label>
                <textarea id="descripcion" name="descripcion" rows="5" placeholder="Describe las actividades y responsabilidades del puesto." required />
              </div>

              <div className="campo-registro">
                <label htmlFor="requisitos">Requisitos</label>
                <textarea id="requisitos" name="requisitos" rows="4" placeholder="Indica los conocimientos, habilidades y experiencia necesarios." required />
              </div>

              <div className="campo-registro">
                <label htmlFor="prestaciones">Prestaciones</label>
                <textarea id="prestaciones" name="prestaciones" rows="4" placeholder="Describe las prestaciones ofrecidas." required />
              </div>
            </div>
          </fieldset>

          <fieldset className="registro-seccion">
            <legend className="registro-legend"> Información de contacto </legend>

            <hr className="login-separador-discontinuo" />

            <div className="registro-campos-contacto">
              <CampoRegistro id="telefono" name="telefono" label="Teléfono de contacto (opcional)" type="tel" placeholder="Número de teléfono" autoComplete="tel" />
            </div>
          </fieldset>
          <br/>
          {error && (
            <p className="registro-error" role="alert"> {error} </p>
          )}
          <button type="submit" className="boton boton-principal" disabled={cargando} >
            {cargando ? 'Publicando...' : 'Publicar Vacante'}
          </button>
          <Link to="/vacantes-empresa" className="boton boton-secundario" >
            Cancelar
          </Link>

        </form>
      </div>
    </main>
  )
}
