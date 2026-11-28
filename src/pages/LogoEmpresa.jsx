// Extra RF-016: la empresa sube su logo a Supabase Storage (bucket "logos")
import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import iconoArchivo from '../assets/icono-archivo.svg'

const TIPOS = ['image/png', 'image/jpeg', 'image/webp']
const MAXIMO = 2 * 1024 * 1024 // 2 MB, igual que el límite del bucket

export default function LogoEmpresa() {
  const { sesion, perfil } = useAuth()
  const usuarioId = sesion?.user?.id

  // El logo recién subido tiene prioridad sobre el que venía en el perfil
  const [logoSubido, setLogoSubido] = useState(null)
  const logoActual = logoSubido || perfil?.logo_url || null
  const [archivo, setArchivo] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  // Libera la URL temporal de la vista previa
  useEffect(() => {
    return () => { if (vistaPrevia) URL.revokeObjectURL(vistaPrevia) }
  }, [vistaPrevia])

  function elegirArchivo(e) {
    setMensaje('')
    setError('')
    const elegido = e.target.files?.[0]
    if (!elegido) return

    if (!TIPOS.includes(elegido.type)) {
      setError('El logo debe ser una imagen PNG, JPG o WEBP.')
      e.target.value = ''
      return
    }
    if (elegido.size > MAXIMO) {
      setError('El logo no puede pesar más de 2 MB.')
      e.target.value = ''
      return
    }
    setArchivo(elegido)
    setVistaPrevia(URL.createObjectURL(elegido))
  }

  async function subirLogo(e) {
    e.preventDefault()
    if (!archivo || !usuarioId) return

    setSubiendo(true)
    setError('')

    // Cada empresa solo puede escribir en su carpeta: logos/<su id>/...
    const extension = archivo.name.split('.').pop().toLowerCase()
    const ruta = `${usuarioId}/logo-${Date.now()}.${extension}`

    const { error: errorSubida } = await supabase.storage
      .from('logos')
      .upload(ruta, archivo, { contentType: archivo.type })

    if (errorSubida) {
      console.error('Error al subir logo:', errorSubida)
      setError('No fue posible subir el logo. Intenta de nuevo.')
      setSubiendo(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(ruta)

    const { error: errorPerfil } = await supabase
      .from('perfiles')
      .update({ logo_url: publicUrl })
      .eq('id', usuarioId)

    setSubiendo(false)

    if (errorPerfil) {
      console.error('Error al guardar logo en el perfil:', errorPerfil)
      setError('El logo se subió, pero no se pudo guardar en tu perfil.')
      return
    }

    setLogoSubido(publicUrl)
    setArchivo(null)
    setVistaPrevia('')
    e.target.reset()
    setMensaje('Tu logo se actualizó. Ahora aparece en tus vacantes.')
  }

  return (
    <section className="pagina-registro">
      <div className="login-contenedor">
        <h1> Logo de la Empresa </h1>
        <p> Tu logo aparece junto a tus vacantes para que los candidatos reconozcan tu empresa. </p>
        <hr className="login-separador" />

        <div className="logo-empresa">
          <div className="logo-empresa-actual">
            <p className="login-etiqueta"> Logo actual </p>
            {logoActual
              ? <img src={logoActual} alt={`Logo de ${perfil?.nombre || 'la empresa'}`} />
              : <p> Aún no has subido un logo. </p>}
          </div>

          <form className="logo-empresa-formulario" onSubmit={subirLogo}>
            <label htmlFor="logo" className="login-etiqueta"> Adjuntar nuevo logo </label>
            <p id="logo-ayuda"> PNG, JPG o WEBP de máximo 2 MB. </p>
            <div className="campo-archivo">
              <input type="file" id="logo" name="logo" accept={TIPOS.join(',')} onChange={elegirArchivo} aria-describedby="logo-ayuda" />
              <img src={iconoArchivo} alt="" aria-hidden="true" />
            </div>

            {vistaPrevia && (
              <div className="logo-empresa-actual">
                <p className="login-etiqueta"> Vista previa </p>
                <img src={vistaPrevia} alt="Vista previa del nuevo logo" />
              </div>
            )}

            {error && <p className="aviso-error" role="alert"> {error} </p>}
            {mensaje && <p className="aviso-exito" role="status"> {mensaje} </p>}

            <button type="submit" className="boton boton-principal" disabled={!archivo || subiendo} >
              {subiendo ? 'Subiendo...' : 'Guardar logo'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
