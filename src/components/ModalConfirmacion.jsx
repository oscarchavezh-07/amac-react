import Modal from './Modal'

export default function ModalConfirmacion({
  titulo,
  children,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Volver',
  peligro = false,
  cargando = false,
  onConfirmar,
  onCerrar,
}) {
  const claseConfirmar = peligro ? 'boton boton-peligro' : 'boton boton-principal'

  return (
    <Modal titulo={titulo} ancho="angosto" bloqueado={cargando} onCerrar={onCerrar}>
      <p className="modal-texto">{children}</p>
      <div className="modal-acciones">
        <button className={claseConfirmar} type="button" onClick={onConfirmar} disabled={cargando}>
          {cargando ? 'Guardando…' : textoConfirmar}
        </button>
        <button className="boton-secundario" type="button" onClick={onCerrar} disabled={cargando}>
          {textoCancelar}
        </button>
      </div>
    </Modal>
  )
}