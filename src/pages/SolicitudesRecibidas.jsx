
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TarjetaSolicitudEmpresa from '../components/TarjetaSolicitudEmpresa'

import iconoBusqueda from '../assets/search-icon.png'

export default function SolicitudesRecibidas() {
  const { sesion } = useAuth()

  const [solicitudes, setSolicitudes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [solicitudProcesando, setSolicitudProcesando] = useState(null)

  async function cargarSolicitudes() {
    if (!sesion?.user?.id) return

    setCargando(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select(`
          id,
          vacante_id,
          candidato_id,
          estatus,
          creada_en,
          candidato:perfiles!solicitudes_candidato_id_fkey (
            id,
            nombre,
            edad,
            colonia,
            experiencia
          ),
          vacante:vacantes!inner (
            id,
            titulo,
            empresa_id
          )
        `)
        .eq('vacante.empresa_id', sesion.user.id)
        .order('creada_en', { ascending: false })

      if (error) throw error

      setSolicitudes(data || [])
    } catch (err) {
      console.error('Error al cargar solicitudes:', err)
      setError('No fue posible cargar las solicitudes recibidas.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarSolicitudes()
  }, [sesion?.user?.id])

  async function cambiarEstatus(solicitud, nuevoEstatus) {
    if (solicitudProcesando !== null) return

    const estatusPermitidos = [
      'En revisión',
      'Aceptada',
      'Rechazada'
    ]

    if (!estatusPermitidos.includes(nuevoEstatus)) {
      setError('El estatus seleccionado no es válido.')
      return
    }

    if (!['Enviada', 'En revisión'].includes(solicitud.estatus)) {
      setError('Esta solicitud ya no puede modificarse.')
      return
    }

    setSolicitudProcesando(solicitud.id)
    setError('')
    setMensaje('')

    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .update({ estatus: nuevoEstatus })
        .eq('id', solicitud.id)
        .eq('vacante_id', solicitud.vacante_id)
        .in('estatus', ['Enviada', 'En revisión'])
        .select('id, estatus')
        .single()

      if (error) throw error

      setSolicitudes(actuales =>
        actuales.map(item =>
          item.id === data.id
            ? { ...item, estatus: data.estatus }
            : item
        )
      )

      setMensaje('El estatus de la solicitud se actualizó correctamente.')
    } catch (err) {
      console.error('Error al actualizar solicitud:', err)
      setError('No fue posible actualizar el estatus. Verifica los permisos e intenta nuevamente.')
    } finally {
      setSolicitudProcesando(null)
    }
  }

  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const nombre = solicitud.candidato?.nombre || ''
    const titulo = solicitud.vacante?.titulo || ''

    const texto = `${nombre} ${titulo}`.toLowerCase()

    return texto.includes(busqueda.trim().toLowerCase())
  })

  return (
    <main className="pagina-solicitudes">
      <div className="solicitudes-contenedor">

        <div className="solicitudes-encabezado">
          <h1 className="solicitudes-titulo"> Solicitudes Recibidas </h1>

          <p className="solicitudes-descripcion"> Revisa los candidatos que se han postulado a tus vacantes. </p>

          <form className="buscador" onSubmit={e => e.preventDefault()} >
            <div className="campo-busqueda">
              <input type="search" id="busca" placeholder="Buscar candidato o vacante" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              <button className="boton-buscar" type="submit" aria-label="Buscar solicitudes" >
                <img src={iconoBusqueda} alt="" />
              </button>
            </div>
          </form>
        </div>

        {error && (
          <p className="registro-error" role="alert"> {error} </p>
        )}

        {mensaje && (
          <p className="registro-exito" role="status"> {mensaje} </p>
        )}

        {cargando ? (
          <p role="status">Cargando solicitudes recibidas...</p>
        ) : solicitudesFiltradas.length === 0 ? (
          <p className="solicitudes-vacio"> {busqueda ? 'No se encontraron solicitudes con esa búsqueda.' : 'Todavía no has recibido solicitudes.'} </p>
        ) : (
          <div className="solicitudes-listado">
            {solicitudesFiltradas.map(solicitud => (
              <TarjetaSolicitudEmpresa key={solicitud.id} solicitud={solicitud} onCambiarEstatus={cambiarEstatus} procesando={solicitudProcesando === solicitud.id} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
