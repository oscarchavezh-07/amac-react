// Extra RF-041: guardar / quitar una vacante de favoritas
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import iconoGuardar from '../assets/icono-guardar.svg'

export default function BotonFavorita({ vacanteId, candidatoId }) {
  const [guardada, setGuardada] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // ¿Ya está guardada?
  useEffect(() => {
    let vigente = true

    supabase
      .from('favoritos')
      .select('vacante_id')
      .eq('vacante_id', vacanteId)
      .eq('candidato_id', candidatoId)
      .maybeSingle()
      .then(({ data }) => {
        if (!vigente) return
        setGuardada(Boolean(data))
        setCargando(false)
      })

    return () => { vigente = false }
  }, [vacanteId, candidatoId])

  async function alternar() {
    setCargando(true)
    setError('')

    const { error } = guardada
      ? await supabase.from('favoritos').delete().eq('vacante_id', vacanteId).eq('candidato_id', candidatoId)
      : await supabase.from('favoritos').insert({ vacante_id: vacanteId, candidato_id: candidatoId })

    setCargando(false)

    // 23505 = ya estaba guardada (llave primaria repetida)
    if (error && error.code !== '23505') {
      setError('No fue posible guardar la vacante. Intenta de nuevo.')
      return
    }
    setGuardada(!guardada)
  }

  return (
    <>
      <button type="button" className="boton boton-secundario boton-favorita" onClick={alternar} disabled={cargando} aria-pressed={guardada} >
        <img src={iconoGuardar} alt="" aria-hidden="true" />
        {guardada ? 'Vacante guardada' : 'Guardar vacante'}
      </button>
      {error && <p className="aviso-error" role="alert"> {error} </p>}
    </>
  )
}
