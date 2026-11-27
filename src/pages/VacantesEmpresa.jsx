
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TarjetaVacanteEmpresa from '../components/TarjetaVacanteEmpresa'

import iconoBusqueda from '../assets/search-icon.png'

export default function VacantesEmpresa() {
  const { sesion } = useAuth()

  const [vacantes, setVacantes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [procesando, setProcesando] = useState(false)

  async function cargarVacantes() {
    if (!sesion?.user?.id) return

    setCargando(true)
    setError('')
    // obtiene info como la de candidato
    try {
      const { data, error } = await supabase
        .from('vacantes')
        .select(`
          id,
          titulo,
          sueldo,
          ubicacion,
          horario,
          categoria,
          estado,
          creada_en,
          solicitudes(count)
        `)
        .eq('empresa_id', sesion.user.id)
        .order('creada_en', { ascending: false })

      if (error) throw error

      setVacantes(data || [])
    } catch (err) {
      console.error('Error al cargar vacantes:', err)
      setError('No fue posible cargar las vacantes.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarVacantes()
  }, [sesion?.user?.id])

  async function cambiarEstado(vacante, nuevoEstado) {
    if (procesando) return

    if (nuevoEstado === 'cerrada') {
      const confirmar = window.confirm(
        `¿Estás seguro de que deseas cerrar la vacante "${vacante.titulo}"? Esta acción no podrá revertirse desde el panel.`
      )

      if (!confirmar) return
    }

    setProcesando(true)
    setError('')
    setMensaje('')

    try {
      const { data, error } = await supabase
        .from('vacantes')
        .update({ estado: nuevoEstado })
        .eq('id', vacante.id)
        .eq('empresa_id', sesion.user.id)
        .select('id, estado')
        .single()

      if (error) throw error

      setVacantes(actuales =>
        actuales.map(item => item.id === data.id ? { ...item, estado: data.estado } : item)
      )

      setMensaje( nuevoEstado === 'activa' ? 'La vacante se reactivó correctamente.' : nuevoEstado === 'pausada' ? 'La vacante se pausó correctamente.' : 'La vacante se cerró correctamente.')
    } catch (err) {
      console.error('Error al cambiar estado:', err)
      setError('No fue posible actualizar el estado de la vacante.')
    } finally {
      setProcesando(false)
    }
  }

  const vacantesFiltradas = vacantes.filter(vacante =>
    vacante.titulo .toLowerCase() .includes(busqueda.toLowerCase().trim())
  )

  return (
    <main className="panel-vacantes-empresa">
      <div className="vacantes-contenedor">

        <div className="vacantes-encabezado">
          <h1 className="vacantes-titulo"> Panel de Vacantes </h1>
          <p className="vacantes-descripcion"> Revisa y administra las vacantes que has publicado. </p>
        </div>

        <form className="buscador" onSubmit={e => e.preventDefault()} >
          <div className="campo-busqueda">
            <input type="search" id="busca" placeholder="Buscar vacante" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <button className="boton-buscar" type="submit" aria-label="Buscar vacante" >
              <img src={iconoBusqueda} alt="" />
            </button>
          </div>
        </form>

        <hr className="separador" />

        <Link to="/crear-vacante" className="boton boton-principal" >
          <span>Publicar Vacante</span>
        </Link>

        <hr className="separador" />

        {error && (
          <p className="registro-error" role="alert"> {error} </p>
        )}
        {mensaje && (
          <p className="registro-exito" role="status"> {mensaje} </p>
        )}

        {cargando ? (
          <p role="status">Cargando vacantes...</p>
        ) : vacantesFiltradas.length === 0 ? (
          <p className="vacantes-vacio"> {busqueda ? 'No se encontraron vacantes con ese nombre.' : 'Todavía no has publicado ninguna vacante.'}
          </p>
        ) : (
          <div className="vacantes-listado">
            {vacantesFiltradas.map(vacante => (
              <TarjetaVacanteEmpresa key={vacante.id} vacante={vacante} onCambiarEstado={cambiarEstado} procesando={procesando} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
