# Training App — Decisiones de Producto y Arquitectura

> Documento vivo. Se actualiza a medida que avanzamos en el diseño e implementación.

---

## 1. Objetivo del producto

Aplicación de uso **estrictamente personal** para gestionar entrenamientos de fuerza y acondicionamiento físico orientados a grappling / jiu-jitsu.

Reemplaza la experiencia de Harbiz (plataforma del entrenador actual) con una UX mejor, especialmente en móvil durante el entrenamiento.

**Uso principal:** consultar el entrenamiento del día, registrar lo que se hace en tiempo real (entre series), marcar como completado.

---

## 2. Usuario y contexto de uso

- Usuario único: uso personal
- Dispositivo principal: iPhone
- Conexión: internet estable en el lugar de entrenamiento
- Patrón de uso: mira la app **entre series**, no durante el ejercicio
- No necesita offline

---

## 3. Decisión: Web App Responsive (PWA) — NO React Native

### Decisión: Web App Responsive con capacidad PWA

**Razones:**
- No hay necesidad de offline
- No importa si es web o nativa (el usuario es indiferente)
- Elimina la complejidad de React Native (builds, App Store, versiones nativas)
- Se puede añadir a la pantalla de inicio del iPhone como PWA (comportamiento casi nativo)
- Mismo código sirve en móvil y desktop
- Mucho más rápido de construir y mantener

**Desventaja asumida:**
- Sin acceso a notificaciones push nativas sin Service Worker configurado (no crítico para MVP)

---

## 4. Stack Tecnológico

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Frontend | **Next.js** (App Router) | React, SSR/SSG, rutas nativas, buen ecosistema |
| Estilos | **Tailwind CSS** | Rapidez, mobile-first por defecto |
| Componentes | **shadcn/ui** | Accesible, sin opinión visual fuerte, fácil de personalizar |
| Base de datos | **Supabase** | Postgres gestionado + auth + storage, sin infra propia |
| Despliegue | **Vercel** | Zero config, preview deployments, gratis para uso personal |

> El stack prioriza: velocidad de desarrollo, bajo mantenimiento, escalabilidad si fuera necesario.

---

## 5. Estrategia de importación de datos (Harbiz)

### Situación actual
- Plataforma: **Harbiz**
- Más de 2 meses de entrenamientos completados (30+ sesiones)
- El entrenador añade semana a semana
- **No se quiere mantener sincronía** — migración única + gestión propia a partir de ahí

### Estructura observada (de pantallazos reales)

Un entrenamiento típico tiene:
- Título + descripción con notas del entrenador
- Fecha programada y fecha de ejecución
- **Secciones** nombradas: WARM UP, CONDITIONING, CORE (y sección principal sin nombre)
- **Bloques** numerados (1, 2, 3...) dentro de cada sección:
  - Tipo: ejercicio individual, superserie de N rondas, descanso entre bloques
- **Ejercicios** dentro de cada bloque:
  - Nombre (a veces bilingüe)
  - Series / reps / tiempo (string variable: "8", "8+8", "8 series x 60''")
  - Descanso en segundos
  - Notas/consejos opcionales
  - Vídeo de YouTube opcional
- Estimación: ~8-15 ejercicios por sesión, ~30 sesiones = 250-450 entradas → **manual inviable**

### Decisión: Intercepción de API (no HTML scraping)

Harbiz es una SPA que consume una API REST propia. El enfoque correcto:

1. Abrir Harbiz en el navegador (Chrome)
2. Abrir DevTools → Network → filtrar por `fetch` o `XHR`
3. Navegar por los entrenamientos — capturar las respuestas JSON de la API
4. Guardar los JSONs y transformarlos a nuestro schema con un script

**Ventajas sobre HTML scraping:**
- Datos estructurados desde el origen (no parsear HTML)
- Mucho más robusto y rápido
- Es tu propio dato — uso personal, sin problemas legales

**Riesgo principal:** que la API use tokens de sesión con expiración corta → solucionable en el momento

---

## 6. Modelo de datos

```
Workout
  id, title, description, scheduled_date, executed_date
  status (pending | completed), effort_score, duration_minutes

WorkoutSection
  id, workout_id, name (WARM UP | CONDITIONING | CORE | null), order

Block
  id, section_id, type (individual | superset | rest), rounds, order
  rest_after_seconds (descanso entre bloques)

Exercise
  id, block_id, name, order_in_block
  sets, reps (string: "8", "8+8", "8 series x 60''")
  rest_seconds, notes, video_url

ExerciseLog  ← lo que realmente hiciste
  id, exercise_id, workout_id, set_number
  reps_done, weight_kg, duration_seconds, notes
```

---

## 7. MVP — Funcionalidades incluidas

### Dentro del MVP

- [ ] Listado de entrenamientos por semana (con estado completado/pendiente)
- [ ] Vista detallada: secciones → bloques → ejercicios con video y notas
- [ ] Navegación por rondas en supersets (Ronda 1/3, 2/3...)
- [ ] Registro de lo realizado por serie (reps, peso o tiempo)
- [ ] Marcar entrenamiento como completado
- [ ] Temporizador de descanso entre series
- [ ] Embed de vídeo YouTube

### Fuera del MVP (próximas fases)

- Temporizadores EMOM (cuenta atrás con señal)
- Histórico y progresión visual (gráficas de peso/reps por ejercicio)
- Notas libres por sesión
- Modo oscuro
- Chat / comentarios del entrenador

---

## 8. Fases de implementación

- **Fase 0:** Extracción de datos de Harbiz (intercepción API) + script de transformación al schema propio
- **Fase 1:** Setup Next.js + Supabase + Vercel + schema de BD + seed con datos reales
- **Fase 2:** Vista listado de entrenamientos + vista detallada (lectura, sin logging aún)
- **Fase 3:** Registro de series reales + marcar como completado
- **Fase 4:** Temporizador de descanso + navegación por rondas de supersets
- **Fase 5:** Histórico básico + progresión por ejercicio

---

_Última actualización: 2026-04-15_
