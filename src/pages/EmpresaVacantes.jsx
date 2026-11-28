import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TarjetaVacanteEmpresa from '../components/TarjetaVacanteEmpresa'
import ModalConfirmacion from '../components/ModalConfirmacion'
import iconoBusqueda from '../assets/search-icon.png'
import iconoMaletin from '../assets/icono-maletin.svg'

const CAMBIOS = {
  pausada: {
    titulo: 'Pausar Vacante',
    texto: 'dejará de aparecer en la oferta de vacantes hasta que la reactives.',
    boton: 'Pausar',
    aviso: 'fue pausada',
  },
  activa: {
    titulo: 'Reactivar Vacante',
    texto: 'volverá a aparecer en la oferta de vacantes.',
    boton: 'Reactivar',
    aviso: 'fue reactivada',
  },
  cerrada: {
    titulo: 'Cerrar Vacante',
    texto: 'se cerrará y ya no podrás reactivarla. Esta acción no se puede deshacer.',
    boton: 'Cerrar vacante',
    aviso: 'fue cerrada',
    peligro: true,
  },
}

export default function EmpresaVacantes() {
  const { sesion } = useAuth()
  const empresaId = sesion.user.id
  const ubicacion = useLocation()

  const [vacantes, setVacantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState(ubicacion.state?.aviso ?? '')
  const [busqueda, setBusqueda] = useState('')
  const [pendiente, setPendiente] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [recargar, setRecargar] = useState(0)
  const refAviso = useRef(null)

  useEffect(() => {
    let vigente = true

    async function cargar() {
      const { data, error: errorConsulta } = await supabase
        .from('vacantes')
        .select('id, titulo, sueldo, horario, categoria, estado, creada_en, solicitudes(count)')
        .eq('empresa_id', empresaId)
        .order('creada_en', { ascending: false })

      if (!vigente) return
      if (errorConsulta) {
        setError('No fue posible cargar tus vacantes. Intenta de nuevo más tarde.')
      } else {
        setError('')
        setVacantes(data ?? [])
      }
      setCargando(false)
    }

    cargar()
    return () => { vigente = false }
  }, [empresaId, recargar])

  async function confirmarCambio() {
    const { vacante, estado } = pendiente
    setGuardando(true)
    const { data, error: errorCambio } = await supabase
      .from('vacantes')
      .update({ estado })
      .eq('id', vacante.id)
      .select('id')
    setGuardando(false)
    setPendiente(null)

    if (errorCambio || !data?.length) {
      setAviso('No fue posible actualizar la vacante. Intenta de nuevo más tarde.')
      setRecargar(n => n + 1)
    } else {
      setVacantes(lista => lista.map(v => (v.id === vacante.id ? { ...v, estado } : v)))
      setAviso(`La vacante "${vacante.titulo}" ${CAMBIOS[estado].aviso}.`)
    }
    setTimeout(() => refAviso.current?.focus(), 0)
  }

  const termino = busqueda.trim().toLowerCase()
  const visibles = termino
    ? vacantes.filter(v => v.titulo.toLowerCase().includes(termino))
    : vacantes

  const sinVacantes = !cargando && !error && vacantes.length === 0
  const cambio = pendiente && CAMBIOS[pendiente.estado]

  return (
    <section className="panel-vacantes-empresa" aria-labelledby="titulo-vacantes">
      <div className="vacantes-contenedor">
        <div className="vacantes-encabezado">
          <h1 id="titulo-vacantes">Mis Vacantes</h1>
          <p>Revisa y administra las vacantes que has publicado.</p>
        </div>

        {!sinVacantes && (
          <form className="buscador" role="search" onSubmit={e => e.preventDefault()}>
            <div className="campo-busqueda campo-busqueda--angosto">
              <input
                type="search"
                placeholder="Buscar vacantes"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                aria-label="Buscar entre mis vacantes por puesto"
              />
              <button className="boton-buscar" type="submit">
                <img src={iconoBusqueda} alt="Buscar" />
              </button>
            </div>
          </form>
        )}
        <hr className="separador" />

        <Link className="boton boton-principal" to="/empresa/publicar">Publicar Vacante</Link>
        <hr className="separador" />

        <p className="aviso-accion" role="status" ref={refAviso} tabIndex={-1}>{aviso}</p>

        {cargando && <p role="status">Cargando tus vacantes…</p>}
        {!cargando && error && <p className="mensaje-error" role="alert">{error}</p>}

        {sinVacantes && (
          <div className="estado-vacio">
            <img src={iconoMaletin} alt="" width="56" height="56" />
            <h2>Aún no has publicado vacantes</h2>
            <p>Publica tu primera vacante para empezar a recibir solicitudes.</p>
            <Link className="boton boton-principal" to="/empresa/publicar">Publicar Vacante</Link>
          </div>
        )}

        {!cargando && !error && vacantes.length > 0 && visibles.length === 0 && (
          <p>No hay vacantes que coincidan con "{busqueda.trim()}".</p>
        )}

        {!cargando && !error && visibles.length > 0 && (
          <ul className="vacantes-listado lista-limpia" role="list">
            {visibles.map(vacante => (
              <li key={vacante.id}>
                <TarjetaVacanteEmpresa
                  vacante={vacante}
                  onCambiarEstado={(v, estado) => setPendiente({ vacante: v, estado })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {pendiente && (
        <ModalConfirmacion
          titulo={cambio.titulo}
          textoConfirmar={cambio.boton}
          peligro={cambio.peligro}
          cargando={guardando}
          onConfirmar={confirmarCambio}
          onCerrar={() => setPendiente(null)}
        >
          La vacante <strong>{pendiente.vacante.titulo}</strong> {cambio.texto}
        </ModalConfirmacion>
      )}
    </section>
  )
}