export const HORARIOS = ['Matutino', 'Vespertino', 'Medio tiempo', 'Fines de semana']

export const CATEGORIAS = ['Operativo', 'Administrativo', 'Seguridad', 'Ventas', 'Atención al cliente']

export function formatearSueldo(sueldo) {
  return `$${Number(sueldo).toLocaleString('es-MX')} / mes`
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}