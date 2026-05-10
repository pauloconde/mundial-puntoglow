# 🏆 Template: Mundial 2026 PWA (White-label)

> [!TIP]
> Para una explicación detallada de toda la información relacionada a este proyecto, consulta el archivo [DOCUMENTACION.md](file:///Users/pauloconde/Development/mundial-template/DOCUMENTACION.md).


Este repositorio funciona como un **Template (plantilla maestra)** para generar de manera automática y consistente aplicaciones móviles PWA del Mundial de la FIFA 2026 para diferentes sponsors o marcas.

La arquitectura de la aplicación es completamente *White-label*. Esto significa que la identidad visual, los metadatos SEO y la configuración de la PWA (colores, nombres, iconos) se controlan de manera centralizada sin necesidad de tocar el código fuente principal de los componentes.

## 🏗️ Arquitectura Centralizada

Todo el branding y configuración de la marca patrocinadora está centralizado en un único archivo:
👉 `src/data/sponsor.json`

Al modificar este archivo, los siguientes elementos se actualizan en cascada de forma automática:
1. **Interfaz de Usuario (UI):** Los colores de fondo, textos, headers y botones (mediante la inyección de variables CSS nativas en tiempo real).
2. **SEO y Metadatos:** Los títulos por defecto de las páginas, descripciones, y metadatos de Open Graph / Twitter Cards.
3. **PWA (Progressive Web App):** El archivo `manifest.webmanifest` tomará dinámicamente los colores del tema y los nombres de la aplicación (`name` y `short_name`) especificados para la instalación en el móvil.

## ⚙️ ¿Cómo generar la App para un nuevo Sponsor?

Sigue estos 4 sencillos pasos para crear la PWA de una nueva marca:

### Paso 1: Configurar la Identidad (JSON)
Abre el archivo `src/data/sponsor.json` y completa los datos de la marca, los colores de su paleta y sus configuraciones SEO:
```json
{
  "name": "Nombre de la Empresa",
  "website": "https://ejemplo.com",
  ...
  "colors": {
    "appBg": "#ColorDeFondoPrincipal",
    "navIconActive": "#ColorAcento"
  },
  "seo": {
    "defaultTitle": "Mundial 2026",
    ...
  }
}
```

### Paso 2: Reemplazar Assets Visuales
Dentro de la carpeta `public/`, reemplaza los siguientes archivos con los de la marca respetando los nombres y formatos:
- `favicon.svg` (Obligatorio, utilizado como base para generar los demás iconos)
- `logo.webp` (Logo en el Header de navegación)
- `logo-splash.svg` (Logo centrado que se muestra en la pantalla de carga inicial)
- `ogimage.png` (Imagen de `1200x630` px usada para redes sociales)
- Opcional: Reemplazar la imagen inferior del drawer o la firma.

### Paso 3: Generar Iconos de Instalación (PWA)
Para que la aplicación se pueda instalar en dispositivos Android/iOS y tenga los iconos en el tamaño correcto para todos los formatos, ejecuta el siguiente comando. Esto leerá tu `favicon.svg` y generará las versiones enmascarables de `192px`, `512px` y el `apple-touch-icon`:
```bash
pnpm run generate-manifest
```
*(Asegúrate de tener instaladas las dependencias primero con `pnpm install`)*

### Paso 4: Levantar y Construir
Para ver tus cambios en tiempo real en desarrollo:
```bash
pnpm dev
```

Para compilar y empaquetar para producción:
```bash
pnpm build
```

---

## 🛠️ Stack Tecnológico
- **Framework:** Astro 🚀 (SSR/SSG optimizado para máximo rendimiento)
- **Estilos:** Tailwind CSS v4
- **PWA:** `@vite-pwa/astro` y Workbox
- **Manejo de Imágenes:** Sharp (para script de generación)
- **Diseño:** Mobile-First, UI de cristal (Glassmorphism), compatible con instalación como aplicación de escritorio/móvil independiente (Standalone).
