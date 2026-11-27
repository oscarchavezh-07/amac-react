import { useEffect, useRef } from 'react'
export default function Modal({ titulo, claseTitulo = '', ancho = 'normal', bloqueado = false, onCerrar, children }) {
  const refTitulo = useRef(null)

  useEffect(() => {
    const anterior = document.activeElement
    refTitulo.current?.focus()
    return () => anterior?.focus?.()
  }, [])

  useEffect(() => {
    function alPresionar(e) {
      if (e.key === 'Escape' && !bloqueado) onCerrar()
    }
    document.addEventListener('keydown', alPresionar)
    return () => document.removeEventListener('keydown', alPresionar)
  }, [bloqueado, onCerrar])

  return (
    <div className="modal-fondo">
      <section className={`modal-tarjeta modal-tarjeta--${ancho}`} role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <h2 id="modal-titulo" className={`modal-titulo ${claseTitulo}`} ref={refTitulo} tabIndex={-1}>
          {titulo}
        </h2>
        {children}
      </section>
    </div>
  )
}