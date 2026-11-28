// Extra RF-041: vacantes favoritas del candidato
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

import TarjetaVacante from '../components/TarjetaVacante'

export default function VacantesGuardadas() {
  const { sesion } = useAuth()
  const usuarioId = sesion?.user?.id

  const [favoritas, setFavoritas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [quitando, setQuitando] = useState(null)

  useEffect(() => {
    if (!usuarioId) return
    let vigente = true

    async function cargarFavoritas() {
      const { data, error } = await supabase
        .from('favoritos')
        .select(`
          vacante_id,
          creado_en,
          vacante:vacantes (
            id,
            titulo,
            sueldo,
            ubicacion,
            horario,
            categoria,
            descripcion,
            estado,
            empresa:perfiles!vacantes_empresa_id_fkey ( nombre )
          )
        `)
        .eq('candidato_id', usuarioId)
        .order('creado_en', { ascending: false })

      if (!vigente) return
      if (error) {
        console.error('Error al consultar favoritas:', error)
        setError('No fue posible cargar tus vacantes guardadas.')
      } else {
        setFavoritas(data || [])
      }
      setCargando(false)
    }

    cargarFavoritas()
    return () => { vigente = false }
  }, [usuarioId])

  async function quitar(vacanteId) {
    setQuitando(vacanteId)
    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('vacante_id', vacanteId)
      .eq('candidato_id', usuarioId)
    setQuitando(null)

    if (error) {
      setError('No fue posible quitar la vacante. Intenta de nuevo.')
      return
    }
    setFavoritas(actuales => actuales.filter(f => f.vacante_id !== vacanteId))
  }

  if (cargando) {
    return (
      <section className="pagina-solicitudes">
        <p role="status">Cargando tus vacantes guardadas...</p>
      </section>
    )
  }

  return (
    <section className="pagina-solicitudes">
      <div className="solicitudes-contenedor">
        <div className="solicitudes-encabezado">
          <h1 className="solicitudes-titulo"> Vacantes Guardadas </h1>
          <p className="solicitudes-descripcion"> Las vacantes que guardaste para revisarlas después. </p>
        </div>
        <hr className="separador" />

        {error && <p className="aviso-error" role="alert"> {error} </p>}

        {!error && favoritas.length === 0 && (
          <div className="estado-vacio">
            <h2> Aún no guardas vacantes </h2>
            <p> Usa el botón "Guardar vacante" en el detalle de una vacante para verla aquí. </p>
            <Link to="/" className="boton boton-principal"> Buscar vacantes </Link>
          </div>
        )}

        <div className="guardadas-listado">
          {favoritas.map(favorita => (
            <div className="guardada" key={favorita.vacante_id}>
              {/* Si la empresa pausó o cerró la vacante, RLS ya no la devuelve */}
              {favorita.vacante && favorita.vacante.estado === 'activa' ? (
                <TarjetaVacante vacante={favorita.vacante} />
              ) : (
                <p className="guardada-no-disponible"> Esta vacante ya no está disponible. </p>
              )}
              <button type="button" className="boton-cancelar" onClick={() => quitar(favorita.vacante_id)} disabled={quitando === favorita.vacante_id} >
                {quitando === favorita.vacante_id ? 'Quitando...' : 'Quitar de guardadas'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
