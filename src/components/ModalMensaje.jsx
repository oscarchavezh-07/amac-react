import Modal from './Modal'
import iconoExito from '../assets/icono-exito.svg'
import iconoAlerta from '../assets/icono-alerta.svg'

const TIPOS = {
  exito: { icono: iconoExito, claseTitulo: 'modal-titulo--exito', rol: 'status' },
  error: { icono: iconoAlerta, claseTitulo: 'modal-titulo--error', rol: 'alert' },
}

export default function ModalMensaje({
  tipo = 'exito',
  titulo,
  children,
  textoBoton = 'Aceptar',
  onCerrar,
  acciones,
}) {
  const { icono, claseTitulo, rol } = TIPOS[tipo]

  return (
    <Modal titulo={titulo} claseTitulo={claseTitulo} ancho="angosto" onCerrar={onCerrar}>
      <img className="modal-icono" src={icono} alt="" width="48" height="48" />
      <p className="modal-texto" role={rol}>{children}</p>
      <div className="modal-acciones">
        <button className="boton boton-principal" type="button" onClick={onCerrar}>
          {textoBoton}
        </button>
        {acciones}
      </div>
    </Modal>
  )
}