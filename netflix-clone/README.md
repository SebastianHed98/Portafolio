# 🎬 Netflix Clone - Proyecto de Portafolio

Un clon completo de Netflix construido con React, Vite y Tailwind CSS, con funcionalidades avanzadas de streaming y gestión de contenido.

## ✨ **Características Implementadas**

### 🎯 **Funcionalidades Principales**
- ✅ **Reproducción de contenido** con VideoPlayer modal
- ✅ **Sistema de favoritos** con persistencia en localStorage
- ✅ **Búsqueda avanzada** con filtros múltiples
- ✅ **Listas personalizadas** para organizar contenido
- ✅ **Sistema de recomendaciones** basado en preferencias
- ✅ **Notificaciones en tiempo real** para feedback del usuario
- ✅ **Navegación completa** entre páginas
- ✅ **Responsividad móvil** optimizada

### 🔍 **Búsqueda Avanzada**
- **Búsqueda múltiple** (películas, series, actores)
- **Filtros por tipo** (películas, series, todo)
- **Filtros por género** (todos los géneros disponibles)
- **Filtros por año** (desde 1900 hasta actualidad)
- **Filtros por calificación** (5+, 6+, 7+, 8+, 9+)
- **Ordenamiento** (relevancia, rating, año, popularidad)
- **Resultados en tiempo real** con interfaz intuitiva

### 📋 **Listas Personalizadas**
- **Crear listas personalizadas** con nombres únicos
- **Agregar contenido** desde cualquier card de película/serie
- **Editar nombres** de listas existentes
- **Eliminar listas** y contenido individual
- **Estadísticas** de cada lista (películas, series, rating promedio)
- **Persistencia** en localStorage del navegador

### 🎭 **Sistema de Recomendaciones**
- **Análisis de géneros favoritos** basado en favoritos del usuario
- **Recomendaciones por género** más frecuente
- **Contenido mejor valorado** de la plataforma
- **Tendencias del momento** actualizadas
- **Contenido similar** a favoritos existentes
- **Regeneración manual** de recomendaciones

### 🎬 **Gestión de Contenido**
- **Hero section** con película destacada
- **Carruseles horizontales** para diferentes categorías
- **Cards interactivas** con overlay siempre visible
- **Botones de acción** (Reproducir, Favoritos, Listas, Info)
- **Información detallada** (rating, año, género, tipo)
- **Efectos visuales** y animaciones suaves

### 🎨 **Interfaz de Usuario**
- **Diseño Netflix-inspired** con colores y tipografía auténticos
- **Glassmorphism** y efectos de blur modernos
- **Animaciones CSS** y transiciones suaves
- **Hover effects** interactivos en todos los elementos
- **Iconos Lucide React** para consistencia visual
- **Scrollbars personalizadas** con tema Netflix

### 📱 **Responsividad Móvil**
- **Navegación adaptativa** para dispositivos móviles
- **Grid responsivo** que se adapta a diferentes pantallas
- **Menú hamburguesa** para dispositivos pequeños
- **Touch-friendly** con botones optimizados para móvil
- **Breakpoints consistentes** (sm, md, lg, xl)
- **Optimización de performance** en dispositivos móviles

## 🛠️ **Stack Tecnológico**

### **Frontend**
- **React 18** con hooks modernos
- **Vite** para build y desarrollo rápido
- **React Router v6** para navegación SPA
- **Tailwind CSS v3** para estilos utilitarios
- **PostCSS** y **Autoprefixer** para compatibilidad

### **Estado y Datos**
- **React Context API** para estado global
- **useReducer** para lógica de estado compleja
- **localStorage** para persistencia de datos
- **Custom hooks** para lógica reutilizable

### **APIs y Servicios**
- **TMDB API** para datos de películas y series
- **Fetch API** para requests HTTP
- **Async/await** para manejo de promesas
- **Error handling** robusto con fallbacks

### **UI/UX**
- **Lucide React** para iconografía consistente
- **CSS Grid y Flexbox** para layouts modernos
- **CSS Custom Properties** para variables dinámicas
- **Animaciones CSS** para micro-interacciones

## 🚀 **Instalación y Uso**

### **Prerrequisitos**
- Node.js 16+ 
- npm o yarn

### **Instalación**
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd netflix-clone

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API key de TMDB

# Iniciar servidor de desarrollo
npm run dev
```

### **Variables de Entorno**
```env
VITE_TMDB_API_KEY=tu_api_key_aqui
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```

## 📁 **Estructura del Proyecto**

```
netflix-clone/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Navbar.jsx      # Navegación principal
│   │   ├── Hero.jsx        # Sección destacada
│   │   ├── MovieRow.jsx    # Carruseles de contenido
│   │   ├── VideoPlayer.jsx # Reproductor modal
│   │   ├── AdvancedSearch.jsx # Búsqueda avanzada
│   │   ├── CustomLists.jsx # Listas personalizadas
│   │   ├── Recommendations.jsx # Sistema de recomendaciones
│   │   └── Notification*.jsx # Sistema de notificaciones
│   ├── pages/              # Páginas de la aplicación
│   │   ├── Home.jsx        # Página principal
│   │   ├── Movies.jsx      # Catálogo de películas
│   │   ├── Series.jsx      # Catálogo de series
│   │   └── Favorites.jsx   # Lista de favoritos
│   ├── context/            # Contexto global
│   │   └── MovieContext.jsx # Estado de la aplicación
│   ├── services/           # Servicios y APIs
│   │   └── tmdbApi.js      # Cliente de TMDB API
│   ├── routes/             # Configuración de rutas
│   │   └── AppRoutes.jsx   # Definición de rutas
│   └── index.css           # Estilos globales y Tailwind
├── public/                 # Assets estáticos
├── package.json            # Dependencias y scripts
├── tailwind.config.js      # Configuración de Tailwind
├── postcss.config.js       # Configuración de PostCSS
└── README.md              # Documentación del proyecto
```

## 🎯 **Funcionalidades por Página**

### **🏠 Página Principal (/)**
- Hero section con película destacada
- Carruseles de contenido popular
- Navegación rápida a categorías
- Botones de acción principales

### **🎬 Películas (/movies)**
- Catálogo completo de películas
- Filtros por género y popularidad
- Sistema de paginación
- Búsqueda y ordenamiento

### **📺 Series (/series)**
- Catálogo completo de series
- Filtros por género y estado
- Información de temporadas
- Búsqueda avanzada

### **❤️ Mi Lista (/favorites)**
- Gestión de favoritos
- Filtros por tipo y ordenamiento
- Estadísticas de contenido
- Acciones rápidas

### **✨ Recomendaciones (/recommendations)**
- Contenido personalizado
- Análisis de preferencias
- Múltiples categorías de recomendaciones
- Regeneración manual

## 🔧 **Scripts Disponibles**

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting del código

# Tailwind CSS
npm run tailwind:watch  # Watch mode para CSS
npm run tailwind:build  # Build de CSS
```

## 🌟 **Características Destacadas**

### **🎨 Diseño Visual**
- **Paleta de colores Netflix** (#E50914, #141414, #333)
- **Tipografía Inter** para máxima legibilidad
- **Efectos de glassmorphism** modernos
- **Animaciones CSS** suaves y profesionales
- **Iconografía consistente** con Lucide React

### **⚡ Performance**
- **Lazy loading** de imágenes
- **Optimización de re-renders** con React.memo
- **Code splitting** automático con Vite
- **CSS purging** con Tailwind
- **Bundle optimization** para producción

### **🔒 Seguridad**
- **API keys** en variables de entorno
- **Validación de datos** en formularios
- **Sanitización** de inputs del usuario
- **Error boundaries** para manejo de errores

### **📱 Experiencia Móvil**
- **Touch gestures** optimizados
- **Responsive breakpoints** consistentes
- **Mobile-first** approach
- **Performance** optimizada para móviles

## 🚧 **Próximas Funcionalidades**

### **🔄 En Desarrollo**
- [ ] **Autenticación de usuarios** con Firebase
- [ ] **Sistema de ratings** personalizado
- [ ] **Historial de visualización** detallado
- [ ] **Sincronización** entre dispositivos
- [ ] **Modo offline** con Service Workers

### **🎯 Futuras Mejoras**
- [ ] **Chat en vivo** para comentarios
- [ ] **Sistema de amigos** y recomendaciones sociales
- [ ] **Descargas** para contenido offline
- [ ] **Subtítulos** en múltiples idiomas
- [ ] **Audio descriptivo** para accesibilidad

## 🤝 **Contribución**

Este es un proyecto de portafolio personal, pero las contribuciones son bienvenidas:

1. **Fork** el repositorio
2. **Crea** una rama para tu feature
3. **Commit** tus cambios
4. **Push** a la rama
5. **Abre** un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 **Agradecimientos**

- **TMDB** por proporcionar la API gratuita
- **Netflix** por la inspiración en el diseño
- **Comunidad React** por las herramientas y librerías
- **Tailwind CSS** por el framework de utilidades

## 📞 **Contacto**

- **GitHub**: [Tu Usuario](https://github.com/tu-usuario)
- **LinkedIn**: [Tu Perfil](https://linkedin.com/in/tu-perfil)
- **Portfolio**: [Tu Sitio Web](https://tu-sitio.com)

---

**⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!**

**🎬 ¡Disfruta explorando tu Netflix Clone personal!**
