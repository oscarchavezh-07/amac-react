import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import { supabase } from '../lib/supabase'

import ResumenVacante from '../components/ResumenVacante'
import InformacionAdicionalVacante from '../components/InformacionAdicionalVacante'
import AccionesVacante from '../components/AccionesVacante'
import ConfirmacionPostulacion from '../components/ConfirmacionPostulacion'

export default function DetalleVacante() {
  const { id } = useParams()

  const [vacante, setVacante] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [usuario, setUsuario] = useState(null)

  const [yaPostulado, setYaPostulado] = useState(false)

  const [cargando, setCargando] = useState(true)
  const [cargandoAccion, setCargandoAccion] = useState(false)
  const [error, setError] = useState('')

  const [modal, setModal] = useState(null)

  useEffect(() => {
    let vigente = true

    async function cargarDetalle() {
      setCargando(true)
      setError('')

      // Consultar vacante y empresa
      const { data: datosVacante, error: errorVacante } =
        await supabase
          .from('vacantes')
          .select(`
            *,
            empresa:perfiles!vacantes_empresa_id_fkey(nombre)
          `)
          .eq('id', id)
          .maybeSingle()

      if (errorVacante) {
        if (vigente) {
          setError('No fue posible cargar la información de la vacante.')
          setCargando(false)
        }
        return
      }

      if (!datosVacante) {
        if (vigente) {
          setError('La vacante solicitada no existe o no está disponible.')
          setCargando(false)
        }
        return
      }

      // Consultar usuario autenticado
      const { data: datosSesion, error: errorSesion } =
        await supabase.auth.getUser()

      if (!vigente) return

      if (errorSesion && errorSesion.name !== 'AuthSessionMissingError') {
        setError('No fue posible verificar la sesión.')
        setCargando(false)
        return
      }

      const usuarioActual = datosSesion?.user || null

      let perfilActual = null
      let solicitudExistente = false

      if (usuarioActual) {
        // Consultar perfil
        const { data: datosPerfil, error: errorPerfil } =
          await supabase
            .from('perfiles')
            .select('id, rol, nombre, aprobado')
            .eq('id', usuarioActual.id)
            .maybeSingle()

        if (errorPerfil) {
          setError('No fue posible consultar tu perfil.')
          setCargando(false)
          return
        }
        

        perfilActual = datosPerfil

        // Verificar si ya existe una solicitud
        const { data: solicitud, error: errorSolicitud } =
          await supabase
            .from('solicitudes')
            .select('id')
            .eq('vacante_id', datosVacante.id)
            .eq('candidato_id', usuarioActual.id)
            .maybeSingle()

        if (errorSolicitud) {
          setError('No fue posible verificar tu postulación.')
          setCargando(false)
          return
        }

        solicitudExistente = Boolean(solicitud)
      }

      if (vigente) {
        setVacante(datosVacante)
        setUsuario(usuarioActual)
        setPerfil(perfilActual)
        setYaPostulado(solicitudExistente)
        setCargando(false)
      }
    }

    cargarDetalle()

    return () => {
      vigente = false
    }
  }, [id])

  // Abrir confirmación o mostrar una restricción
  function solicitarPostulacion() {
    if (!usuario) {
      setModal({
        tipo: 'error',
        mensaje: 'Debes iniciar sesión para postularte a una vacante.'
      })
      return
    }

    if (!perfil || perfil.rol !== 'candidato') {
      setModal({
        tipo: 'error',
        mensaje: 'Solo los perfiles de candidato pueden postularse.'
      })
      return
    }

    if (!perfil.aprobado) {
      setModal({
        tipo: 'error',
        mensaje: 'Tu registro aún no ha sido aprobado por AMAC. Por favor, espera la aprobación de tu perfil.'
      })
      return
    }

    if (yaPostulado) {
      setModal({
        tipo: 'error',
        mensaje: 'Ya te postulaste a esta vacante.'
      })
      return
    }

    if (vacante.estado !== 'activa') {
      setModal({
        tipo: 'error',
        mensaje: 'Esta vacante ya no está disponible para nuevas postulaciones.'
      })
      return
    }

    setModal({
      tipo: 'confirmacion'
    })
  }

  // Registrar postulación
  async function confirmarPostulacion() {
    if (!usuario || !vacante) return

    setCargandoAccion(true)

    const { error: errorSolicitud } = await supabase
      .from('solicitudes')
      .insert({
        vacante_id: vacante.id,
        candidato_id: usuario.id
      })

    setCargandoAccion(false)

    if (errorSolicitud) {
      if (errorSolicitud.code === '23505') {
        setYaPostulado(true)
        setModal({
          tipo: 'error',
          mensaje: 'Ya te postulaste a esta vacante. No puedes enviar otra solicitud.'
        })

      } else {
        setModal({
          tipo: 'error',
          mensaje: 'Tu registro aún no ha sido aprobado por AMAC. Por favor espera.'
        })
      }

      return
    }

    setYaPostulado(true)

    setModal({
      tipo: 'exito',
      mensaje: 'Tu solicitud se registró correctamente. Ahora la empresa podrá revisar tu postulación.'
    })
  }

  function cerrarModal() {
    setModal(null)
  }

  if (cargando) {
    return (
      <main className="pagina-detalle-vacante">
        <p role="status">Cargando información de la vacante...</p>
      </main>
    )
  }

  if (error || !vacante) {
    return (
      <main className="pagina-detalle-vacante">
        <h1>Detalles de la vacante</h1>
        <p role="alert">{error || 'Vacante no encontrada.'}</p>
        <Link className="boton boton-secundario" to="/vacantes">
          Regresar
        </Link>
      </main>
    )
  }

  return (
    <main className="pagina-detalle-vacante">

      <div className="contenedor-detalle">

        <h1>Detalles de la vacante</h1>
        <br />

        <ResumenVacante vacante={vacante} />
        <InformacionAdicionalVacante vacante={vacante} />
        <AccionesVacante vacante={vacante} yaPostulado={yaPostulado} onPostular={solicitarPostulacion} />

      </div>

      {modal && (
        <ConfirmacionPostulacion tipo={modal.tipo} mensaje={modal.mensaje} cargando={cargandoAccion} onConfirmar={confirmarPostulacion} onCerrar={cerrarModal} />
      )}

    </main>
  )
}