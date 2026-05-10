# 🤖 Documentación del Proyecto: PWA Mundial 2026

Este proyecto es una Progressive Web App (PWA) diseñada para el seguimiento en tiempo real del **Mundial de la FIFA 2026**. Ha sido construida con un enfoque "Mobile-First" y una arquitectura preparada para la evolución de los datos durante el torneo.

---

## 🏗️ Arquitectura Técnica

- **Framework:** [Astro](https://astro.build/) (SSR habilitado para datos dinámicos).
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño Mobile-First estricto).
- **Lenguaje:** TypeScript para una capa de datos robusta.
- **PWA:** [@vite-pwa/astro](https://vite-pwa-org.netlify.app/frameworks/astro) para capacidades offline e instalación en dispositivos.

---

## 📊 Estrategia de Datos

La aplicación consume datos en tiempo real de fuentes abiertas y los procesa para ofrecer una experiencia fluida y localizada.

### 1. Fuentes de Datos
- **JSON Oficial (2026):** `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`. Contiene la programación de los 104 partidos, 12 grupos y sedes.
- **Referencia de Esquema (2022):** Se utiliza el modelo de `worldcup2022.json` para prever cómo se recibirán los goles, marcadores finales (`ft`), tiempos extra (`et`) y penales (`p`).

### 2. Normalización y Localización
- **Zonas Horarias:** Los partidos se programan originalmente en UTC-4 a UTC-7. El sistema normaliza automáticamente estas horas a la hora local del usuario final.
- **Traducción:** Capa de traducción interna (`src/lib/worldcup.ts`) que mapea nombres de países, ciudades y fases del torneo (ej: "Round of 32" → "Dieciséisavos") al español.
- **Banderas:** Integración dinámica con `https://flagcdn.com/` usando códigos ISO.

---

## 🎨 Branding y Personalización (Sponsor)

Toda la identidad visual y metadata SEO está centralizada en `src/data/sponsor.json`. Esto permite cambiar el patrocinador o la estética de la app sin tocar el código fuente.

- **Colores:** Variables CSS dinámicas para fondo, navegación y elementos activos.
- **SEO:** Títulos, descripciones y Open Graph configurables.
- **Assets:** Logo del patrocinador visible en Splash Screen y Header persistente.

---

## 📱 Funcionalidades Principales

### 1. Inicio (Home)
- **Hero:** Muestra automáticamente el partido más próximo a la hora actual (detectado mediante `Date.now()`).
- **Carrusel Diario:** Lista los partidos programados para el día actual según la fecha del sistema.

### 2. Grupos
- **Tablas Dinámicas:** Posiciones calculadas en tiempo real procesando los resultados (PG=3 pts, PE=1 pt, PP=0 pts).
- **Desempate:** Aplica lógica de diferencia de goles (GD) y goles a favor (GF).

### 3. Estadios (Sedes)
- Directorio de las 16 sedes con fotos reales (`public/stadiums/`).
- Capacidad y ubicación detallada.
- Listado de partidos específicos que se jugarán en cada estadio.

### 4. Calendario
- Lista completa de partidos agrupados cronológicamente por día.
- **Estado Visual Inteligente:** 
  - Si hay un `score` presente, muestra el marcador final.
  - Si es un partido futuro, muestra la hora local y el estadio.

---

## 📁 Estructura del Proyecto

- `src/data/sponsor.json`: Configuración de marca y SEO.
- `src/lib/worldcup.ts`: El "corazón" de la app. Fetching, tipos, traducciones y cálculos de tablas.
- `src/pages/`: Rutas de la aplicación (`index.astro`, `grupos.astro`, `calendario.astro`, `estadios.astro`).
- `src/layouts/Layout.astro`: Estructura base con Header, Nav y configuración de PWA.
- `public/stadiums/`: Galería de imágenes de las sedes.

---

## 🛠️ Desarrollo y Despliegue

### Comandos Clave
```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar construcción local
npm run preview
```

### Lógica Defensiva
El código está preparado para la transición de "Programado" a "En Vivo" mediante comprobaciones constantes:
```typescript
if (match.score?.ft) {
  renderResult(); // Muestra marcador
} else {
  renderSchedule(); // Muestra hora
}
```

---

*Proyecto desarrollado con ❤️ para el Mundial 2026.*
