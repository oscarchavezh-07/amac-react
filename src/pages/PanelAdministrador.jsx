// Extra RF-054: panel para que AMAC apruebe candidatos sin entrar a Supabase
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(fecha))
}

// Cuenta filas sin descargarlas (head: true)
async function contar(tabla, filtros) {
  let consulta = supabase.from(tabla).select('id', { count: 'exact', head: true })
  Object.entries(filtros).forEach(([columna, valor]) => { consulta = consulta.eq(columna, valor) })
  const { count } = await consulta
  return count ?? 0
}

function TarjetaCandidato({ candidato, aprobar, procesando, onCambiar }) {
  return (
    <article className="admin-tarjeta">
      <h3> {candidato.nombre} </h3>
      <dl className="admin-datos">
        <div> <dt>Edad</dt> <dd>{candidato.edad ?? 'No especificada'}</dd> </div>
        <div> <dt>Colonia</dt> <dd>{candidato.colonia || 'No especificada'}</dd> </div>
        <div> <dt>Teléfono</dt> <dd>{candidato.telefono || 'No especificado'}</dd> </div>
        <div> <dt>Se registró el</dt> <dd>{formatearFecha(candidato.creado_en)}</dd> </div>
        <div className="admin-dato-completo"> <dt>Experiencia</dt> <dd>{candidato.experiencia || 'Sin información registrada.'}</dd> </div>
      </dl>
      <div className="admin-acciones">
        <button type="button" className={aprobar ? 'boton admin-aprobar' : 'boton admin-rechazar'} onClick={() => onCambiar(candidato, aprobar)} disabled={procesando} >
          {procesando ? 'Guardando...' : aprobar ? 'Aprobar' : 'Quitar aprobación'}
          <span className="solo-lectores"> a {candidato.nombre}</span>
        </button>
      </div>
    </article>
  )
}

export default function PanelAdministrador() {
  const [resumen, setResumen] = useState(null)
  const [candidatos, setCandidatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [procesando, setProcesando] = useState(null)
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    let vigente = true

    async function cargar() {
      const [totalCandidatos, totalEmpresas, vacantesActivas, lista] = await Promise.all([
        contar('perfiles', { rol: 'candidato' }),
        contar('perfiles', { rol: 'empresa' }),
        contar('vacantes', { estado: 'activa' }),
        supabase
          .from('perfiles')
          .select('id, nombre, edad, colonia, telefono, experiencia, aprobado, creado_en')
          .eq('rol', 'candidato')
          .order('creado_en', { ascending: true })
      ])

      if (!vigente) return
      if (lista.error) {
        console.error('Error al cargar candidatos:', lista.error)
        setError('No fue posible cargar los candidatos.')
      } else {
        setCandidatos(lista.data || [])
        setResumen({ totalCandidatos, totalEmpresas, vacantesActivas })
      }
      setCargando(false)
    }

    cargar()
    return () => { vigente = false }
  }, [recargar])

  async function cambiarAprobacion(candidato, valor) {
    setProcesando(candidato.id)
    setAviso('')
    setError('')

    // La función de la BD verifica que quien la llama sea administrador
    const { error } = await supabase.rpc('cambiar_aprobacion', { cid: candidato.id, valor })
    setProcesando(null)

    if (error) {
      console.error('Error al cambiar aprobación:', error)
      setError('No fue posible actualizar al candidato. Intenta de nuevo.')
      return
    }

    setCandidatos(actuales => actuales.map(c => c.id === candidato.id ? { ...c, aprobado: valor } : c))
    setAviso(valor
      ? `${candidato.nombre} fue aprobado y ya puede postularse a vacantes.`
      : `Se quitó la aprobación a ${candidato.nombre}.`)
  }

  if (cargando) {
    return <section className="pagina-solicitudes"><p role="status">Cargando panel...</p></section>
  }

  const porValidar = candidatos.filter(c => !c.aprobado)
  const aprobados = candidatos.filter(c => c.aprobado)

  return (
    <section className="pagina-solicitudes">
      <div className="solicitudes-contenedor">
        <h1> Panel de Administrador </h1>
        <p> Administra el registro de candidatos. </p>
        <hr className="separador" />

        {error && (
          <div className="aviso-error" role="alert">
            <p> {error} </p>
            <button type="button" className="boton boton-secundario" onClick={() => { setCargando(true); setRecargar(n => n + 1) }}> Reintentar </button>
          </div>
        )}
        <p className="aviso-exito" role="status">{aviso}</p>

        {resumen && (
          <article className="admin-tarjeta">
            <h2> Resumen </h2>
            <hr className="admin-linea" />
            <dl className="admin-datos">
              <div> <dt>Candidatos</dt> <dd>{resumen.totalCandidatos}</dd> </div>
              <div> <dt>Empresas</dt> <dd>{resumen.totalEmpresas}</dd> </div>
              <div> <dt>Vacantes activas</dt> <dd>{resumen.vacantesActivas}</dd> </div>
              <div> <dt>Por validar</dt> <dd>{porValidar.length}</dd> </div>
            </dl>
          </article>
        )}

        <h2 className="admin-seccion"> Candidatos por Validar </h2>
        <hr className="separador" />
        {porValidar.length === 0 && <p> No hay candidatos pendientes de aprobación. </p>}
        <div className="admin-listado">
          {porValidar.map(c => (
            <TarjetaCandidato key={c.id} candidato={c} aprobar procesando={procesando === c.id} onCambiar={cambiarAprobacion} />
          ))}
        </div>

        <h2 className="admin-seccion"> Candidatos Aprobados </h2>
        <hr className="separador" />
        {aprobados.length === 0 && <p> Todavía no hay candidatos aprobados. </p>}
        <div className="admin-listado">
          {aprobados.map(c => (
            <TarjetaCandidato key={c.id} candidato={c} aprobar={false} procesando={procesando === c.id} onCambiar={cambiarAprobacion} />
          ))}
        </div>
      </div>
    </section>
  )
}
