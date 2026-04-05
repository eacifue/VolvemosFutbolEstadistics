# Volvemos al Fútbol - Sistema de Gestión de Estadísticas

Aplicación web moderna para gestionar estadísticas de fútbol, jugadores y partidos. Construida con .NET 10 backend y React TypeScript frontend.

## ⚽ Características Principales

### Gestión Unificada de Partidos
- **Match Manager**: Interfaz unificada para gestión completa de partidos
- Crear partidos con fecha y hora
- Asignar jugadores a equipos Blanco/Negro desde base de datos
- Registrar eventos de partido (goles y asistencias)
- Validación de integridad: jugadores deben estar asignados al partido
- Persistencia completa en MySQL

### Gestión de Jugadores
- Crear, editar y eliminar jugadores
- Asignar posiciones (Portero, Defensa, Mediocampista, Delantero)
- Auto-generación de números de camiseta
- Estadísticas en tiempo real (goles, asistencias, partidos jugados)
- Búsqueda y filtrado avanzado

### Sistema de Notificaciones
- Mensajes profesionales para todas las acciones
- Auto-cierre configurable por tipo
- Confirmaciones para operaciones críticas
- Notificaciones de error con opción de reintentar

### Interfaz Responsiva
- Diseño mobile-first
- Funciona en desktop, tablet y móvil
- Animaciones suaves
- Navegación intuitiva

## 🏗️ Arquitectura Técnica

### Backend (.NET 10)
```
Backend Stack:
├── ASP.NET Core Web API
├── Entity Framework Core
├── MySQL Database
├── Pomelo MySQL Provider
└── CORS Middleware
```

**Componentes Principales:**
- `Controllers/`: MatchesController, PlayersController, MatchEventsController, MatchPlayersController
- `Services/`: Lógica de negocio (PlayerService, MatchService, MatchEventService, MatchPlayerService)
- `Models/`: Entidades (Player, Match, MatchEvent, MatchPlayer, Team)
- `Data/`: ApplicationDbContext para acceso a datos

### Frontend (React 17 + TypeScript 4.9)
```
Frontend Stack:
├── React 17 with Hooks
├── TypeScript 4.9
├── React Router v6
├── Axios for API calls
└── CSS3 with Animations
```

**Estructura de Componentes:**
- `Header.tsx`: Navegación principal
- `MatchManager.tsx`: Gestión unificada de partidos
- `MatchCreator.tsx`: Creación de partidos
- `PlayerSearch.tsx`: Búsqueda y asignación de jugadores
- `TeamRoster.tsx`: Visualización de equipos
- `EventForm.tsx`: Registro de eventos
- `EventList.tsx`: Lista de eventos
- `ManagePlayers.tsx`: CRUD de jugadores
- `Players.tsx`: Galería de jugadores
- `Home.tsx`: Página principal
- `Notification.tsx`: Sistema de notificaciones
- `Admin.tsx`: Panel administrativo

## 📋 Requisitos

- Node.js 16+ y npm
- .NET 10 SDK
- MySQL 8.0
- Docker y Docker Compose (opcional)

## 🚀 Inicio Rápido

### Usar Docker (Recomendado)

```bash
# Clonar o descargar el proyecto
cd my-dotnet-react-app

# Compilar imágenes y levantar servicios
docker-compose up --build

# Aplicación disponible en:
# Frontend: http://localhost:3000
# API: http://localhost:5001
```

### Instalación Local

#### Backend
```bash
cd backend/MyApi

# Restaurar dependencias
dotnet restore

# Ejecutar
dotnet run
# o con hot-reload
dotnet watch run

# API ejecutándose en: https://localhost:5001
```

#### Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Desarrollo con hot-reload
npm start

# App ejecutándose en: http://localhost:3000

# Build para producción
npm run build
```

## 🗂️ Estructura de Carpetas

```
my-dotnet-react-app/
├── backend/
│   ├── MyApi/
│   │   ├── Controllers/
│   │   │   ├── MatchesController.cs
│   │   │   ├── MatchEventsController.cs
│   │   │   ├── MatchPlayersController.cs
│   │   │   ├── PlayersController.cs
│   │   │   ├── TeamsController.cs
│   │   │   └── StatisticsController.cs
│   │   ├── Services/
│   │   │   ├── IMatchService.cs / MatchService.cs
│   │   │   ├── IMatchEventService.cs / MatchEventService.cs
│   │   │   ├── IMatchPlayerService.cs / MatchPlayerService.cs
│   │   │   ├── IPlayerService.cs / PlayerService.cs
│   │   │   ├── IStatisticsService.cs / StatisticsService.cs
│   │   │   └── ExampleService.cs
│   │   ├── Models/
│   │   │   ├── Match.cs
│   │   │   ├── MatchEvent.cs
│   │   │   ├── MatchPlayer.cs
│   │   │   ├── Player.cs
│   │   │   ├── Team.cs
│   │   │   └── WeatherForecast.cs
│   │   ├── Data/
│   │   │   └── ApplicationDbContext.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── MyApi.csproj
│   ├── DbInit.sql
│   ├── db/Dockerfile
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Admin.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── ManagePlayers.tsx
│   │   │   ├── MatchManager.tsx
│   │   │   └── Players.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── MatchCreator.tsx
│   │   │   ├── PlayerSearch.tsx
│   │   │   ├── TeamRoster.tsx
│   │   │   ├── EventForm.tsx
│   │   │   ├── EventList.tsx
│   │   │   ├── Notification.tsx
│   │   │   ├── ExampleComponent.tsx
│   │   │   └── NotificationDemo.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── styles/
│   │   │   ├── main.css
│   │   │   ├── Header.css
│   │   │   ├── MatchManager.css
│   │   │   ├── ManagePlayers.css
│   │   │   └── Players.css
│   │   ├── types/
│   │   │   └── index.d.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── MATCH_MANAGEMENT.md        # Guía completa del sistema de partidos
├── QUICK_START.md
├── README.md                   # Este archivo
└── Test.http                   # Endpoints para testing
```

## 🔌 API Endpoints

### Matches
- `GET /api/matches` - Listar todos los partidos
- `GET /api/matches/{id}` - Obtener partido específico
- `POST /api/matches` - Crear nuevo partido
- `PUT /api/matches/{id}` - Actualizar partido
- `DELETE /api/matches/{id}` - Eliminar partido

### Match Players
- `GET /api/matchplayers/match/{matchId}` - Jugadores asignados a un partido
- `POST /api/matchplayers` - Asignar jugador a equipo
- `DELETE /api/matchplayers/{matchId}/{playerId}` - Remover jugador del partido

### Match Events
- `GET /api/matchevents/match/{matchId}` - Eventos de un partido
- `POST /api/matchevents` - Crear evento
- `PUT /api/matchevents/{id}` - Actualizar evento
- `DELETE /api/matchevents/{id}` - Eliminar evento

### Players
- `GET /api/players` - Listar jugadores
- `GET /api/players/{id}` - Obtener jugador
- `POST /api/players` - Crear jugador
- `PUT /api/players/{id}` - Actualizar jugador
- `DELETE /api/players/{id}` - Eliminar jugador

### Teams
- `GET /api/teams` - Listar equipos
- `GET /api/teams/{id}` - Obtener equipo

### Statistics
- `GET /api/statistics/goals` - Top goleadores
- `GET /api/statistics/assists` - Top asistentes

Ver [Test.http](Test.http) para ejemplos completos de requests.

## 🗄️ Base de Datos

**Tablas principales:**
- `Teams`: Equipos
- `Players`: Jugadores
- `Matches`: Partidos
- `MatchPlayers`: Asociación jugador-equipo por partido
- `MatchEvents`: Eventos de partidos (goles, asistencias)

**Datos Iniciales:**
- 4 equipos (Tigres, Leones, Águilas, Dragones)
- 12 jugadores (3 por equipo)
- 1 partido inicial para testing

## 📚 Documentación

- [MATCH_MANAGEMENT.md](MATCH_MANAGEMENT.md) - Guía completa del sistema de gestión de partidos
- [QUICK_START.md](QUICK_START.md) - Guía rápida de inicio
- [BACKEND_SUMMARY.md](BACKEND_SUMMARY.md) - Resumen de servicios backend
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Descripción detallada de la estructura
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Resumen técnico de implementación

## 🎨 Interfaz de Usuario

### Páginas Principales
- **Inicio**: Página de bienvenida
- **Jugadores**: Galería de todos los jugadores
- **Gestionar Jugadores**: CRUD completo de jugadores
- **Gestionar Partidos**: Match Manager unificado para gestión completa
- **Admin**: Panel administrativo

### Componentes Reutilizables
- **MatchCreator**: Creación de partidos con fecha
- **PlayerSearch**: Búsqueda y asignación de jugadores
- **TeamRoster**: Visualización de equipos Blanco/Negro
- **EventForm**: Registro de eventos
- **EventList**: Historial de eventos
- **Notification System**: Mensajes tipo toast con auto-cierre
- **Header**: Navegación principal con menú mobile
- **Search Bars**: Búsqueda en tiempo real
- **Confirmation Dialogs**: Confirmación para operaciones críticas

## 🎯 Casos de Uso

### Para Administradores
1. Crear y gestionar equipos
2. Registrar jugadores con sus datos
3. Crear partidos con fecha
4. Asignar jugadores a equipos Blanco/Negro
5. Registrar eventos (goles/asistencias) en tiempo real

### Para Usuarios
1. Ver lista completa de jugadores
2. Consultar estadísticas de partidos
3. Ver historial de eventos por partido

## 🔐 Consideraciones de Seguridad

- CORS configurado para aceptar solo `http://localhost:3000`
- Validaciones en frontend y backend
- Manejo de errores robusto
- Transacciones en base de datos
- Validación de integridad referencial

## 🐛 Troubleshooting

**Error: "No 'Access-Control-Allow-Origin' header"**
- Verificar CORS middleware en Program.cs

**Error: "Cannot connect to database"**
- Asegurar que MySQL esté corriendo
- Verificar connection string en appsettings.json

**Frontend no se conecta a API**
- Verificar URL base en `services/api.ts`
- Asegurar que backend está corriendo en puerto 5001

**Jugador no puede ser asignado a evento**
- Verificar que el jugador esté asignado al partido
- Revisar validaciones en MatchEventService

## 📈 Mejoras Futuras

- [ ] Autenticación y autorización
- [ ] Historial de cambios
- [ ] Exportar reportes PDF
- [ ] Análisis estadístico avanzado
- [ ] Sistema de roles (Admin, Coach, Viewer)
- [ ] Integración con redes sociales
- [ ] App móvil nativa
- [ ] Notificaciones push en tiempo real

## 👥 Equipo de Desarrollo

Desarrollado siguiendo prácticas de ingeniería senior y estándares UX modernos.

## 📄 Licencia

Este proyecto está disponible bajo licencia MIT.

## 📞 Soporte

Para reportar bugs o sugerencias, contactar al equipo de desarrollo.

---

**Versión**: 3.0 - Match Manager Unificado
**Estado**: En producción
**Última actualización**: 13 de marzo de 2026

## Getting Started

### Prerequisites

- .NET SDK
- Node.js and npm

### Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd my-dotnet-react-app
   ```

2. **Backend Setup:**
   - Navigate to the backend directory:
     ```
     cd backend
     ```
   - Restore the .NET dependencies:
     ```
     dotnet restore
     ```
   - Run the backend application:
     ```
     dotnet run --project src/MyApi/MyApi.csproj
     ```

3. **Frontend Setup:**
   - Navigate to the frontend directory:
     ```
     cd ../frontend
     ```
   - Install the frontend dependencies:
     ```
     npm install
     ```
   - Start the React application:
     ```
     npm start
     ```

## Usage

- Access the frontend application at `http://localhost:3000`.
- The backend API can be accessed at `http://localhost:5186/api`.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.