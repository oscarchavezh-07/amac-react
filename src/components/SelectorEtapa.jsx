// Extra RF-055 (lado de la empresa): avanzar al candidato de etapa.
// Se usa en TarjetaSolicitudEmpresa (Solicitudes recibidas).
// Solo aplica mientras la solicitud está "En revisión"; la política RLS
// "Empresa cambia el estatus" impide modificar solicitudes de otras empresas.
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ETAPAS } from '../lib/etapas'

export default function SelectorEtapa({ solicitud, onCambio }) {
  const [etapa, setEtapa] = useState(solicitud.etapa || '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  if (solicitud.estatus !== 'En revisión') return null

  async function guardar() {
    setGuardando(true)
    setError('')

    const { data, error } = await supabase
      .from('solicitudes')
      .update({ etapa })
      .eq('id', solicitud.id)
      .select('id, etapa')
      .maybeSingle()

    setGuardando(false)

    if (error || !data) {
      setError('No fue posible actualizar la etapa.')
      return
    }
    onCambio?.(data.etapa)
  }

  return (
    <div className="selector-etapa">
      <label htmlFor={`etapa-${solicitud.id}`} className="login-etiqueta"> Etapa del proceso </label>
      <select className="input" id={`etapa-${solicitud.id}`} value={etapa} onChange={e => setEtapa(e.target.value)} disabled={guardando} >
        <option value="" disabled> Elige una etapa </option>
        {ETAPAS.map(nombre => <option key={nombre} value={nombre}> {nombre} </option>)}
      </select>
      <button type="button" className="boton boton-principal" onClick={guardar} disabled={guardando || !etapa || etapa === solicitud.etapa} >
        {guardando ? 'Guardando...' : 'Guardar etapa'}
      </button>
      {error && <p className="aviso-error" role="alert"> {error} </p>}
    </div>
  )
}
