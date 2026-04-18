const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAYS_FULL_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MONTHS_FULL_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/** "2026-04-14" → Date sin drift de zona horaria */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "2026-04-14" → "Mar 14 Abr" */
export function formatShortDate(iso: string): { day: string; dayNum: number; month: string } {
  const date = parseISODate(iso);
  return {
    day: DAYS_ES[date.getDay()],
    dayNum: date.getDate(),
    month: MONTHS_ES[date.getMonth()],
  };
}

/** "2026-04-14" → "Martes 14 de Abril" */
export function formatLongDate(iso: string): string {
  const date = parseISODate(iso);
  return `${DAYS_FULL_ES[date.getDay()]} ${date.getDate()} de ${MONTHS_FULL_ES[date.getMonth()]}`;
}

/** Lunes de la semana que contiene `date` */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Etiqueta de semana relativa a hoy: "Esta semana", "La semana pasada", "14–20 Abr"... */
export function weekLabel(iso: string, today: Date): string {
  const date = parseISODate(iso);
  const thisMonday = getMonday(today);
  const nextMonday = new Date(thisMonday); nextMonday.setDate(thisMonday.getDate() + 7);
  const prevMonday = new Date(thisMonday); prevMonday.setDate(thisMonday.getDate() - 7);
  const workoutMonday = getMonday(date);

  if (workoutMonday.getTime() === thisMonday.getTime()) return "Esta semana";
  if (workoutMonday.getTime() === nextMonday.getTime()) return "Próxima semana";
  if (workoutMonday.getTime() === prevMonday.getTime()) return "La semana pasada";

  const sunday = new Date(workoutMonday); sunday.setDate(workoutMonday.getDate() + 6);
  return `${workoutMonday.getDate()}–${sunday.getDate()} ${MONTHS_ES[sunday.getMonth()]}`;
}

/** true si el ISO date es hoy */
export function isToday(iso: string, today: Date): boolean {
  const date = parseISODate(iso);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}
