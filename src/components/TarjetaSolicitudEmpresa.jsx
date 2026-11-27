
import { useEffect, useState } from 'react'

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
// °^°
export default function TarjetaSolicitudEmpresa({
  solicitud,
  onCambiarEstatus,
  procesando
}) {
  const [nuevoEstatus, setNuevoEstatus] = useState(
    solicitud.estatus
  )

  useEffect(() => {
    setNuevoEstatus(solicitud.estatus)
  }, [solicitud.estatus])

  const candidato = solicitud.candidato
  const vacante = solicitud.vacante

  const puedeActualizar = [
    'Enviada',
    'En revisión'
  ].includes(solicitud.estatus)

  const estatusClase = {
    'Enviada': 'estado-enviada',
    'En revisión': 'estado-proceso',
    'Aceptada': 'estado-aceptada',
    'Rechazada': 'estado-rechazada',
    'Cancelada': 'estado-cancelada'
  }

  return (
    <article className="mi-solicitud-tarjeta">
      <div className="mi-solicitud-tarjeta-encabezado">
        <h2 className="solicitud-puesto"> {candidato?.nombre || 'Candidato no disponible'} </h2>
      </div>

      <div className="mi-solicitud-tarjeta-contenido">
        <div className="solicitud-empresa-estado">
          <h3 className="solicitud-empresa"> {vacante?.titulo || 'Vacante no disponible'} </h3>
          <span className={`solicitud-estado ${estatusClase[solicitud.estatus] || ''}`}> {solicitud.estatus} </span>
        </div>
        <p> Solicitud recibida el{' '} <time dateTime={solicitud.creada_en}> {formatearFecha(solicitud.creada_en)} </time> </p>

        <hr className="divisor-filtros" />

        <div className="datos-candidato">
          <h4>Información del candidato</h4>
          <p> <strong>Edad:</strong>{' '} {candidato?.edad ?? 'No especificada'} {candidato?.edad != null ? ' años' : ''} </p>
          <p> <strong>Colonia:</strong>{' '} {candidato?.colonia || 'No especificada'} </p>
          <div>
            <strong>Experiencia:</strong>
            <p> {candidato?.experiencia || 'Sin información registrada.'} </p>
          </div>
        </div>

        {puedeActualizar && (
          <>
            <hr className="divisor-filtros" />

            <div className="solicitud-cambio-estatus">
              <label htmlFor={`estatus-${solicitud.id}`}> Actualizar estatus </label>

              <select id={`estatus-${solicitud.id}`} value={nuevoEstatus} onChange={e => setNuevoEstatus(e.target.value)} disabled={procesando} >
                <option value="Enviada" disabled> Enviada </option>
                <option value="En revisión"> En revisión </option>
                <option value="Aceptada"> Aceptada </option>
                <option value="Rechazada"> Rechazada </option>
              </select>

              <button type="button" className="boton boton-principal" disabled={ procesando || nuevoEstatus === solicitud.estatus } onClick={() => onCambiarEstatus(solicitud, nuevoEstatus) } >
                {procesando ? 'Actualizando...' : 'Guardar estatus'}
              </button>
            </div>
          </>
        )}

        {!puedeActualizar && (
          <p className="solicitud-estatus-final"> Esta solicitud ya tiene un estatus final y no puede modificarse. </p>
        )}
      </div>
    </article>
  )
}
