// Opciones compartidas entre los filtros del listado y "Publicar vacante".
// Si la empresa elige de esta misma lista, el filtro del candidato encuentra la vacante.

// Deben coincidir con el check de vacantes.horario en la BD
export const HORARIOS = [
  { valor: 'Matutino', texto: 'Matutino' },
  { valor: 'Vespertino', texto: 'Vespertino' },
  { valor: 'Medio tiempo', texto: 'Medio tiempo' },
  { valor: 'Fines de semana', texto: 'Fines de semana' }
]

export const CATEGORIAS = [
  { valor: 'Operativo', texto: 'Operativo' },
  { valor: 'Administrativo', texto: 'Administrativo' },
  { valor: 'Seguridad', texto: 'Seguridad' },
  { valor: 'Ventas', texto: 'Ventas' },
  { valor: 'Atencion al cliente', texto: 'Atención al cliente' }
]
