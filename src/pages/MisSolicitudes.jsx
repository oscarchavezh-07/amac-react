
import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

import TarjetaSolicitud from '../components/TarjetaSolicitud'
import ConfirmacionCancelacion from '../components/ConfirmacionCancelacion'

import iconoBusqueda from '../assets/search-icon.png'

export default function MisSolicitudes() {

  const { sesion, cargando: cargandoAuth } = useAuth()

  const [solicitudes, setSolicitudes] = useState([])
  const [busqueda, setBusqueda] = useState('')

  const [cargando, setCargando] = useState(true)
  const [cancelando, setCancelando] = useState(false)

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)

  const [error, setError] = useState('')
  const [errorAccion, setErrorAccion] = useState('')

  const usuarioId = sesion?.user?.id

  // Consultar solicitudes del candidato
  useEffect(() => {

    if (cargandoAuth) return
    let vigente = true

    async function cargarSolicitudes() {
      setCargando(true)
      setError('')

      if (!usuarioId) {
        setSolicitudes([])
        setError('Debes iniciar sesión para consultar tus solicitudes.')
        setCargando(false)
        return
      }

      const { data, error } = await supabase
        .from('solicitudes')
        .select(`
          id,
          vacante_id,
          candidato_id,
          estatus,
          creada_en,
          estatus_actualizado_en,
          etapa,
          vacante:vacantes!inner (
            id,
            titulo,
            ubicacion,
            horario,
            estado,
            empresa:perfiles!vacantes_empresa_id_fkey (
              nombre
            )
          )
        `)
        .eq('candidato_id', usuarioId)
        .order('creada_en', { ascending: false })

      if (!vigente) return
      if (error) {
        console.error('Error al consultar solicitudes:', error)

        setError('No fue posible cargar tus solicitudes.')
        setCargando(false)
        return
      }
      setSolicitudes(data || [])
      setCargando(false)
    }

    cargarSolicitudes()

    return () => {
      vigente = false
    }

  }, [usuarioId, cargandoAuth])


  // Búsqueda
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return true
    const titulo = solicitud.vacante?.titulo || ''
    const empresa = solicitud.vacante?.empresa?.nombre || ''
    const estatus = solicitud.estatus || ''
    return ( titulo.toLowerCase().includes(texto) || empresa.toLowerCase().includes(texto) || estatus.toLowerCase().includes(texto)
    )
  })

  // Abrir confirmación
  function solicitarCancelacion(solicitud) {
    if (!['Enviada', 'En revisión'].includes(solicitud.estatus)) {
      return
    }
    setErrorAccion('')
    setSolicitudSeleccionada(solicitud)
  }

  // Cancelar solicitud
  async function confirmarCancelacion() {
    if (!solicitudSeleccionada || !usuarioId) return

    setCancelando(true)
    setErrorAccion('')

    const { data, error } = await supabase
      .from('solicitudes')
      .update({
        estatus: 'Cancelada'
      })
      .eq('id', solicitudSeleccionada.id)
      .eq('candidato_id', usuarioId)
      .in('estatus', ['Enviada', 'En revisión'])
      .select('id, estatus')
      .maybeSingle()
    setCancelando(false)

    if (error) {
      console.error('Error al cancelar solicitud:', error)

      setErrorAccion(
        'No fue posible cancelar tu solicitud. Intenta nuevamente.'
      )
      return
    }

    if (!data) {
      setErrorAccion(
        'La solicitud ya no se puede cancelar. Es posible que el estatus haya cambiado.'
      )
      return
    }

    // Actualizar la solicitud
    setSolicitudes(actuales => actuales.map(solicitud => solicitud.id === data.id ? { ...solicitud, estatus: data.estatus } : solicitud)
    )
    setSolicitudSeleccionada(null)
  }

  function cerrarConfirmacion() {
    if (!cancelando) {
      setSolicitudSeleccionada(null)
      setErrorAccion('')
    }
  }

  if (cargandoAuth || cargando) {
    return (
      <main className="pagina-solicitudes">
        <p role="status">Cargando tus solicitudes...</p>
      </main>
    )
  }

  return (
    <main className="pagina-solicitudes">
      <div className="solicitudes-contenedor">
        <div className="solicitudes-encabezado">
          <h1 className="solicitudes-titulo"> Mis Solicitudes </h1>
          <p className="solicitudes-descripcion"> Revisa las solicitudes que has hecho. </p>

          <form className="buscador" role="search" onSubmit={e => e.preventDefault()} >
            <div className="campo-busqueda">
              <input type="search" placeholder="Buscar vacante, empresa o estatus" id="busca" value={busqueda} onChange={e => setBusqueda(e.target.value)} aria-label="Buscar solicitudes" />
              <button className="boton-buscar" type="submit" aria-label="Buscar" >
                <img src={iconoBusqueda} alt="Buscar" />
              </button>
            </div>
          </form>
        </div>

        {error && (
          <p role="alert"> {error} </p>
        )}
        {errorAccion && (
          <p role="alert"> {errorAccion} </p>
        )}
        {!error && solicitudes.length === 0 && (
          <p> Todavía no has realizado ninguna solicitud. </p>
        )}
        {!error && solicitudes.length > 0 && solicitudesFiltradas.length === 0 && (
          <p> No se encontraron solicitudes que coincidan con tu búsqueda. </p>
        )}

        <div className="solicitudes-listado">
          {solicitudesFiltradas.map(solicitud => (
            <TarjetaSolicitud key={solicitud.id} solicitud={solicitud} onCancelar={solicitarCancelacion} cancelando={ cancelando && solicitudSeleccionada?.id === solicitud.id } />
          ))}
        </div>
      </div>
      {solicitudSeleccionada && (
        <ConfirmacionCancelacion solicitud={solicitudSeleccionada} cargando={cancelando} onConfirmar={confirmarCancelacion} onCerrar={cerrarConfirmacion} /> )}
    </main>
  )
}
