import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

import TarjetaVacante from '../components/TarjetaVacante'
import FiltrosVacantes from '../components/FiltrosVacante'

import iconoBusqueda from '../assets/search-icon.png'

/* async function probarConexion() {
    const { data, error } = await supabase
        .from('vacantes')
        .select('*');

    if (error) {
        console.error('Error de conexión:', error);
    } else {
        console.log('Conexión correcta:', data);
    }
} */

export default function ListadoVacantes() {
  const [vacantes, setVacantes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [horarios, setHorarios] = useState([])
  const [categorias, setCategorias] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

    let vigente = true

    async function cargarVacantes() {
      setCargando(true)
      setError('')

      let consulta = supabase
        .from('vacantes')
        .select(`
          id,
          titulo,
          sueldo,
          ubicacion,
          horario,
          categoria,
          descripcion,
          empresa:perfiles(nombre, logo_url)
        `)
        .eq('estado', 'activa')
        .order('creada_en', { ascending: false })

      // Búsquedas
      if (busqueda.trim()) {
        const termino = busqueda.trim()

        consulta = consulta.or(
          `titulo.ilike.%${termino}%,ubicacion.ilike.%${termino}%`
        )
      }

      // Filtros
      if (horarios.length > 0) {
        consulta = consulta.in('horario', horarios)
      }
      if (categorias.length > 0) {
        consulta = consulta.in('categoria', categorias)
      }

      const { data, error } = await consulta
      // para debugear, of course. Con solo una página basta, ¿no? :p
      if (vigente) {
        if (error) {
        console.error('Error al cargar vacantes:', error);

        console.log('Código:', error.code);
        console.log('Mensaje:', error.message);
        console.log('Detalles:', error.details);
        console.log('Hint:', error.hint);
        console.log('Estado HTTP:', error.status);

        setError('No fue posible cargar las vacantes.')
        setVacantes([])
      } else {
        setCargando(false);
        console.log('Vacantes cargadas:', data);
        setVacantes(data || [])
      }
      }
    }

    cargarVacantes()

    return () => {
      vigente = false
    }
  }, [busqueda, horarios, categorias])

  return (
    <main className="pagina-listado-vacantes">

      <section className="intro">
        <h1>Vacantes disponibles</h1>
        <p>Aplica a una oferta hoy mismo.</p>
        <p>Busca por palabras clave o aplica filtros a la búsqueda.</p>
      </section>

      <form className="buscador" role="search" onSubmit={e => e.preventDefault()} >
        <div className="campo-busqueda">
          <input type="search" placeholder="Buscar vacante" id="busca" value={busqueda} onChange={e => setBusqueda(e.target.value)} aria-label="Buscar vacantes por título o ubicación" />

          <button className="boton-buscar" type="submit">
            <img src={iconoBusqueda} alt="Buscar" />
          </button>
        </div>
      </form>

      <hr className="separador" />

      <div className="zona-vacantes">

        <FiltrosVacantes horarios={horarios} setHorarios={setHorarios} categorias={categorias} setCategorias={setCategorias} />

        <section className="resultados-vacantes">

          {cargando && (
            <p role="status">Cargando vacantes...</p>
          )}

          {!cargando && error && (
            <p role="alert">{error}</p>
          )}

          {!cargando && !error && vacantes.length === 0 && (
            <p>No hay vacantes para mostrar.</p>
          )}

          {!cargando && !error && vacantes.map(vacante => (
            <TarjetaVacante
              key={vacante.id}
              vacante={vacante}
            />
          ))}

        </section>
      </div>

    </main>
  )
}