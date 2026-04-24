# Entorno de prototipado web con Claude

Guía para montar un entorno de trabajo donde Claude construye prototipos web funcionales a partir de descripciones e ideas de diseño.

---

## Lo que vas a tener al final

- Un proyecto Next.js listo para arrancar en segundos
- Claude Code (CLI) con skills de diseño instalados
- MCP de Figma para extraer tokens y estilos de tus diseños directamente
- MCP de 21st.dev para generar componentes UI desde lenguaje natural
- MCP de Puppeteer para que Claude vea la UI en el navegador y ajuste lo que no le gusta

---

## Paso 1 — Instalar las herramientas base

### 1a. Node.js

Descarga e instala Node.js v22 (LTS) desde [nodejs.org](https://nodejs.org).

Verifica que funciona:
```bash
node --version   # debe mostrar v22.x.x
npm --version    # debe mostrar 10.x.x
```

### 1b. Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

Inicia sesión con tu cuenta de Anthropic:
```bash
claude
```

---

## Paso 2 — Crear el proyecto Next.js

```bash
npx create-next-app@latest mi-prototipo \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd mi-prototipo
```

### Instalar shadcn/ui (librería de componentes)

```bash
npx shadcn@latest init
```

Cuando pregunte el tema, elige el que prefieras. Para un look limpio y moderno elige `default` o `new-york`.

Instala algunos componentes de partida:
```bash
npx shadcn@latest add button card input label dialog sheet tabs
```

---

## Paso 3 — Instalar los skills de diseño para Claude

Los skills le enseñan a Claude cómo trabajar: cómo pensar en diseño, cómo usar Tailwind, cómo estructurar componentes. Sin ellos Claude es bueno; con ellos es excepcional para UI.

Dentro del proyecto, abre Claude Code:
```bash
claude
```

Y dentro de Claude Code, ejecuta estos comandos de instalación (son `/find-skills` seguido de `/install`):

```
/find-skills impeccable
/find-skills frontend-design
/find-skills shadcn
/find-skills tailwind-v4-shadcn
/find-skills shape
/find-skills layout
/find-skills animate
/find-skills accessibility
/find-skills vercel-react-best-practices
/find-skills next-best-practices
```

> Si algún `/find-skills` no existe, prueba directamente:
> ```bash
> npx claude-skills install pbakaus/impeccable
> ```

---

## Paso 4 — Configurar los MCP servers

Los MCP son herramientas externas que Claude puede usar: el de Figma lee tus diseños, el de 21st.dev genera componentes, el de Puppeteer ve la pantalla.

Abre la configuración de Claude Code:
```bash
claude config edit
```

Agrega esto en la sección `mcpServers`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key", "TU_API_KEY_DE_FIGMA"],
      "type": "stdio"
    },
    "magic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest"],
      "env": {
        "API_KEY": "TU_API_KEY_DE_21ST_DEV"
      },
      "type": "stdio"
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "type": "stdio"
    }
  }
}
```

### Obtener las API keys

**Figma:**
1. Ve a figma.com → tu perfil → Settings → Security
2. Desplázate hasta "Personal access tokens" → Create token
3. Ponle nombre (ej: "Claude MCP") y copia el token

**21st.dev (Magic):**
1. Ve a [21st.dev](https://21st.dev) y crea una cuenta
2. Dashboard → API Keys → Create key
3. Copia la key

---

## Paso 5 — Crear el CLAUDE.md del proyecto

Este archivo le dice a Claude las reglas del proyecto. Créalo en la raíz:

```bash
touch CLAUDE.md
```

Contenido sugerido para `CLAUDE.md`:

```markdown
# Mi proyecto de prototipos

Stack: Next.js (App Router) + Tailwind CSS + shadcn/ui + TypeScript

## Reglas
- Los componentes van en `src/components/`
- Las páginas en `src/app/`
- Usa siempre shadcn/ui antes de crear componentes desde cero
- Los datos de prueba van hardcodeados o en `src/data/` — no hay base de datos
- Tailwind v4: usa variables CSS, no clases de color hardcodeadas

## Estilo
- Diseño moderno, limpio, con buen espacio en blanco
- Mobile-first
- Animaciones sutiles, no exageradas
```

---

## Paso 6 — Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Flujo de trabajo diario

### Desde Figma → código
```
"Tengo este diseño en Figma [URL]. Extrae los colores, tipografía y espaciados y aplícalos al proyecto"
```

### Construir una pantalla
```
"Crea una página de perfil de usuario con: foto, nombre, bio, grid de proyectos recientes. Moderna, con buena jerarquía visual"
```

### Refinar un componente
```
"Esta card me parece demasiado densa. Simplifícala, más espacio en blanco, jerarquía más clara"
```

### Ver cómo quedó
Claude puede abrir el navegador, tomar un screenshot y ajustar lo que no le gusta automáticamente gracias al MCP de Puppeteer.

### Pedir animaciones
```
"Añade una animación de entrada suave a las cards y un hover state más expresivo"
```

---

## Comandos útiles dentro de Claude Code

| Comando | Para qué sirve |
|---------|----------------|
| `/shape` | Planificar el UX de una feature antes de codearla |
| `/impeccable` | Construir algo con máxima calidad de diseño |
| `/animate` | Añadir animaciones y micro-interacciones |
| `/critique` | Que Claude critique el diseño actual |
| `/polish` | Pulido final antes de mostrar o entregar |
| `/distill` | Simplificar algo que quedó demasiado cargado |

---

## Troubleshooting rápido

**"Cannot find module" al arrancar**
```bash
npm install
```

**El MCP de Figma no conecta**
- Verifica que el API key de Figma tenga permisos de lectura de archivos
- Reinicia Claude Code después de cambiar la config

**Los estilos de shadcn no se ven bien**
```bash
npx shadcn@latest init  # vuelve a inicializar si actualizaste Next.js
```

**Quiero empezar un prototipo desde cero (sin el proyecto actual)**
```bash
npx create-next-app@latest nuevo-prototipo --typescript --tailwind --app --src-dir
cd nuevo-prototipo
npx shadcn@latest init
claude
```
