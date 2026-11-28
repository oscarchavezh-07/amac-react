import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TarjetaSolicitudRecibida from '../components/TarjetaSolicitudRecibida'
import ModalConfirmacion from '../components/ModalConfirmacion'
import iconoBusqueda from '../assets/search-icon.png'
import iconoMaletin from '../assets/icono-maletin.svg'

const ESTATUS_FILTRO = ['Enviada', 'En revisión', 'Aceptada', 'Rechazada']

const PREGUNTAS = {
  Aceptada: { titulo: 'Aceptar Candidato', boton: 'Aceptar' },
  Rechazada: { titulo: 'Rechazar Candidato', boton: 'Rechazar', peligro: true },
}

export default function SolicitudesRecibidas() {
  const [parametros, setParametros] = useSearchParams()
  const filtroVacante = parametros.get('vacante') ?? ''

  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstatus, setFiltroEstatus] = useState('')
  const [pendiente, setPendiente] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [recargar, setRecargar] = useState(0)
  const refAviso = useRef(null)

  useEffect(() => {
    let vigente = true

    async function cargar() {
      const { data, error: errorConsulta } = await supabase
        .from('solicitudes')
        .select('id, estatus, creada_en, vacante:vacantes(id, titulo), candidato:perfiles!solicitudes_candidato_id_fkey(nombre, edad, colonia, experiencia)')
        .neq('estatus', 'Cancelada')
        .order('creada_en', { ascending: false })

      if (!vigente) return
      if (errorConsulta) {
        setError('No fue posible cargar las solicitudes. Intenta de nuevo más tarde.')
      } else {
        setError('')
        setSolicitudes(data ?? [])
      }
      setCargando(false)
    }

    cargar()
    return () => { vigente = false }
  }, [recargar])

  async function guardarEstatus(solicitud, estatus) {
    setGuardando(true)
    const { data, error: errorCambio } = await supabase
      .from('solicitudes')
      .update({ estatus })
      .eq('id', solicitud.id)
      .select('id')
    setGuardando(false)
    setPendiente(null)

    const nombre = solicitud.candidato?.nombre ?? 'el candidato'
    if (errorCambio || !data?.length) {
      setAviso(`No fue posible cambiar la solicitud de ${nombre}. Es posible que la haya cancelado.`)
      setRecargar(n => n + 1)
    } else {
      setSolicitudes(lista => lista.map(s => (s.id === solicitud.id ? { ...s, estatus } : s)))
      setAviso(`La solicitud de ${nombre} ahora está "${estatus}".`)
    }
    setTimeout(() => refAviso.current?.focus(), 0)
  }

  function pedirCambio(solicitud, estatus) {
    if (PREGUNTAS[estatus]) setPendiente({ solicitud, estatus })
    else guardarEstatus(solicitud, estatus)
  }

  function cambiarVacante(evento) {
    const valor = evento.target.value
    setParametros(valor ? { vacante: valor } : {}, { replace: true })
  }

  const vacantes = [...new Map(
    solicitudes.filter(s => s.vacante).map(s => [String(s.vacante.id), s.vacante])
  ).values()]

  const termino = busqueda.trim().toLowerCase()
  const visibles = solicitudes.filter(s =>
    (!filtroVacante || String(s.vacante?.id) === filtroVacante) &&
    (!filtroEstatus || s.estatus === filtroEstatus) &&
    (!termino || `${s.candidato?.nombre ?? ''} ${s.vacante?.titulo ?? ''}`.toLowerCase().includes(termino))
  )

  const sinSolicitudes = !cargando && !error && solicitudes.length === 0
  const pregunta = pendiente && PREGUNTAS[pendiente.estatus]

  return (
    <section className="pagina-solicitudes-recibidas" aria-labelledby="titulo-recibidas">
      <h1 id="titulo-recibidas">Solicitudes Recibidas</h1>
      <p>Revisa a los candidatos que se postularon a tus vacantes.</p>
      <hr className="separador" />

      {!sinSolicitudes && (
        <form className="buscador" role="search" onSubmit={e => e.preventDefault()}>
          <div className="campo-busqueda campo-busqueda--listado">
            <input
              type="search"
              placeholder="Buscar candidato"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              aria-label="Buscar solicitudes por candidato o vacante"
            />
            <button className="boton-buscar" type="submit">
              <img src={iconoBusqueda} alt="Buscar" />
            </button>
          </div>
        </form>
      )}

      <p className="aviso-accion" role="status" ref={refAviso} tabIndex={-1}>{aviso}</p>

      {cargando && <p role="status">Cargando solicitudes…</p>}
      {!cargando && error && <p className="mensaje-error" role="alert">{error}</p>}

      {sinSolicitudes && (
        <div className="estado-vacio">
          <img src={iconoMaletin} alt="" width="56" height="56" />
          <h2>Aún no recibes solicitudes</h2>
          <p>Cuando un candidato se postule a tus vacantes, aparecerá aquí.</p>
        </div>
      )}

      {!cargando && !error && solicitudes.length > 0 && (
        <div className="zona-listado">
          <aside className="filtros-vacante" aria-labelledby="titulo-filtros">
            <h2 className="filtros-vacante__titulo" id="titulo-filtros">Filtros</h2>
            <div className="filtros-vacante__contenido">
              <div className="filtros-vacante__grupo">
                <label className="login-etiqueta" htmlFor="filtro-vacante">Vacante</label>
                <select className="input" id="filtro-vacante" value={filtroVacante} onChange={cambiarVacante}>
                  <option value="">Todas</option>
                  {vacantes.map(v => <option key={v.id} value={v.id}>{v.titulo}</option>)}
                </select>
              </div>
              <hr className="divisor divisor--punteado" />
              <div className="filtros-vacante__grupo">
                <label className="login-etiqueta" htmlFor="filtro-estatus">Estatus</label>
                <select className="input" id="filtro-estatus" value={filtroEstatus} onChange={e => setFiltroEstatus(e.target.value)}>
                  <option value="">Todos</option>
                  {ESTATUS_FILTRO.map(estatus => <option key={estatus}>{estatus}</option>)}
                </select>
              </div>
            </div>
          </aside>

          <section className="resultados-listado" aria-label="Solicitudes encontradas">
            {visibles.length === 0 ? (
              <p role="status">No hay solicitudes que coincidan con los filtros.</p>
            ) : (
              <ul className="resultados-listado lista-limpia" role="list">
                {visibles.map(solicitud => (
                  <li key={solicitud.id}>
                    <TarjetaSolicitudRecibida solicitud={solicitud} onCambiarEstatus={pedirCambio} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {pendiente && (
        <ModalConfirmacion
          titulo={pregunta.titulo}
          textoConfirmar={pregunta.boton}
          peligro={pregunta.peligro}
          cargando={guardando}
          onConfirmar={() => guardarEstatus(pendiente.solicitud, pendiente.estatus)}
          onCerrar={() => setPendiente(null)}
        >
          La solicitud de <strong>{pendiente.solicitud.candidato?.nombre}</strong> a{' '}
          <strong>{pendiente.solicitud.vacante?.titulo}</strong> cambiará a "{pendiente.estatus}".
          El candidato lo verá en Mis Solicitudes.
        </ModalConfirmacion>
      )}
    </section>
  )
}