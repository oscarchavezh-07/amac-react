// Extra RF-055: muestra al candidato en qué etapa del proceso va su solicitud
import { ETAPAS } from '../lib/etapas'

export default function ProgresoEtapas({ estatus, etapa }) {
  // Solo tiene sentido mientras la solicitud sigue viva o ya se resolvió
  if (estatus === 'Cancelada') return null

  // Índice de la etapa actual:
  // - Enviada: aún no empieza (-1)
  // - En revisión sin etapa: primera etapa
  // - Aceptada / Rechazada: todas completas
  let actual = -1
  if (estatus === 'En revisión') actual = Math.max(ETAPAS.indexOf(etapa), 0)
  if (estatus === 'Aceptada' || estatus === 'Rechazada') actual = ETAPAS.length

  return (
    <div className="progreso-etapas">
      <p className="progreso-etapas-titulo">Proceso de selección</p>
      <ol>
        {ETAPAS.map((nombre, i) => {
          const estado = i < actual ? 'completa' : i === actual ? 'actual' : 'pendiente'
          return (
            <li key={nombre} className={`etapa etapa-${estado}`} aria-current={estado === 'actual' ? 'step' : undefined} >
              <span className="etapa-marca" aria-hidden="true">{estado === 'completa' ? '✓' : i + 1}</span>
              <span>
                {nombre}
                <span className="solo-lectores">
                  {estado === 'completa' ? ' (completada)' : estado === 'actual' ? ' (etapa actual)' : ' (pendiente)'}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
