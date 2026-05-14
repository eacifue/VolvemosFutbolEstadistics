# CONTEXTO COMPLETO DE LA APP - VOLVEMOS FUTBOL ESTADISTICS

## 1) Resumen Ejecutivo
Volvemos Futbol Estadistics es una plataforma de gestion de estadisticas y operacion de partidos de futbol con arquitectura multi-cliente:
- Backend API en ASP.NET Core (net10.0) con Entity Framework Core.
- Frontend web principal en React + TypeScript + Vite (ubicado en frontend/vite-temp).
- Cliente mobile en Flutter (App-mobile).
- Soporte de despliegue local, Docker y escenarios Railway.

El sistema incluye:
- Gestion de jugadores, partidos, eventos de partido y asignaciones de jugadores por partido.
- Dashboard y estadisticas.
- Autenticacion JWT con rol Admin.
- Control de CORS por variable de entorno FRONTEND_URL.

## 2) Estructura de Alto Nivel del Repo
- backend/MyApi: API principal .NET.
- frontend/vite-temp: frontend web activo actual (Vite).
- frontend: carpeta legacy/contenedora (sin package.json en raiz).
- App-mobile: app Flutter.
- Documentacion operativa e historica en la raiz (README, IMPLEMENTATION_SUMMARY, SYSTEM_FIXED, etc.).

## 3) Stack Tecnologico Actual
### Backend
- .NET: net10.0
- ASP.NET Core Web API
- EF Core 9
- Pomelo.EntityFrameworkCore.MySql 9
- JWT Bearer Auth
- BCrypt para hash de passwords
- AutoMapper
- OpenAPI
- Fallback a InMemoryDatabase en ausencia de configuracion DB

### Frontend Web (activo)
- React 19.2.x
- TypeScript 5.9.x
- Vite 8
- React Router DOM 7
- Axios
- Serve (para servir dist en produccion)

### Mobile
- Flutter (SDK >=3.0.0 <4.0.0)
- Provider
- Dio
- intl

## 4) Backend: Arquitectura y Flujo de Arranque
Archivo clave: backend/MyApi/Program.cs

### 4.1 Registro de servicios
- AddControllers
- AddOpenApi
- AddAuthentication + JWT Bearer
- AddAuthorization
- Registro de servicios de dominio:
  - IPlayerService/PlayerService
  - IMatchService/MatchService
  - IMatchEventService/MatchEventService
  - IMatchPlayerService/MatchPlayerService
  - IStatisticsService/StatisticsService
  - IPositionService/PositionService
  - IEventTypeService/EventTypeService
  - IDashboardService/DashboardService

### 4.2 Seleccion de base de datos (orden de prioridad)
1. MYSQL_URL (env var) -> parsea URL tipo Railway y arma connection string MySQL.
2. ConnectionStrings:DefaultConnection (appsettings).
3. Fallback InMemoryDatabase (VolvemosFutbol).

### 4.3 CORS
- Lee FRONTEND_URL desde env var.
- Soporta multiples origenes separados por coma.
- Normaliza origenes (schema+host+port, sin slash final).
- Desarrollo: permite origenes cuyo host sea localhost.
- Produccion:
  - Si FRONTEND_URL esta definido: solo permite esos origenes.
  - Si no esta definido: fallback controlado a *.up.railway.app.

### 4.4 Pipeline
- OpenAPI solo en Development.
- HTTPS redirection.
- UseCors("CorsPolicy").
- UseAuthentication + UseAuthorization.
- MapControllers.
- Seeder de auth al inicio (AuthSeeder.EnsureAdminUserAsync).

## 5) Backend: Modulos Funcionales
### 5.1 Controllers presentes
- AuthController
- DashboardController
- EventTypesController
- MatchEventsController
- MatchPlayersController
- MatchesController
- PlayersController
- PositionsController
- StatisticsController
- TeamsController

### 5.2 Capas y carpetas
- Controllers/: entrada HTTP.
- Services/: logica de negocio.
- Data/: DbContext, seeders, inicializacion.
- Models/: entidades.
- DTOs/: contratos de API.
- Mappers/: mapeos (AutoMapper).

## 6) Seguridad y Autenticacion
### 6.1 JWT
- Claims principales: Name y Role.
- Emisor/audiencia/key en appsettings o variables.
- Expiracion: 12 horas.

### 6.2 Login
- Endpoint: POST /api/auth/login.
- Valida credenciales contra tabla Users.
- Passwords hasheadas con BCrypt.

### 6.3 Usuario admin bootstrap
AuthSeeder garantiza existencia de admin:
- Username: admin
- Password: admin123
- Role: Admin

Nota: Estas credenciales son de bootstrap/desarrollo y deben rotarse en produccion.

## 7) Configuracion y Entorno
### 7.1 appsettings
- appsettings.Development.json apunta a MySQL localhost:3306.
- appsettings.json contiene un DefaultConnection de despliegue (host remoto).

### 7.2 Variables de entorno relevantes
- MYSQL_URL: fuerza conexion MySQL estilo URL (Railway).
- FRONTEND_URL: lista de origenes permitidos para CORS.
- Jwt:Key, Jwt:Issuer, Jwt:Audience (desde config).
- VITE_API_URL: frontend web, para resolver base URL del backend.

## 8) Frontend Web Activo (frontend/vite-temp)
### 8.1 API client
Archivo: src/services/api.ts
- Base URL:
  - si VITE_API_URL existe: {VITE_API_URL}/api
  - fallback: http://localhost:5186/api
- Interceptor request: agrega Authorization Bearer desde localStorage(auth_token).
- Interceptor response: logging centralizado de errores.

### 8.2 Funcionalidades API integradas
- Dashboard
- Players (lista, detalle, CRUD, stats)
- Teams
- Positions
- EventTypes
- Matches (CRUD)
- MatchEvents (CRUD + delete masivo por match)
- MatchPlayers (listar por match, agregar, remover)

### 8.3 Rutas actuales en App.tsx
- / -> Home
- /partidos -> MatchDetailScreen
- /jugadores -> Players
- /admin -> Admin (protegida)
- /gestionar-jugadores -> ManagePlayers (protegida)

Nota importante:
- Existe pagina MatchManager.tsx en src/pages, pero actualmente no aparece en el routing principal de App.tsx.

### 8.4 Control de acceso
- AuthContext maneja user/token con localStorage.
- AdminRoute redirige a / cuando isAdmin es false.
- authService centraliza login/logout/getToken/getUser.

## 9) App Mobile (Flutter)
- Tema visual verde/dorado.
- Navegacion inferior con 3 tabs: Home, Players, Admin.
- Usa Provider para estado (DataProvider).
- Objetivo: replicar capacidades clave del frontend React.

## 10) Docker y Operacion
Archivo: docker-compose.yml
Servicios:
- db (MySQL)
- api (.NET)

Observaciones:
- Compose actual expone DB 3306 y API 5186.
- No se declara servicio frontend en el compose mostrado.
- start-local.sh parece orientado a una estructura legacy del frontend (usa frontend en vez de frontend/vite-temp), por lo que puede requerir actualizacion antes de usarlo como script principal.

## 11) Estado de la Documentacion del Repo
Hay documentacion abundante, pero parte de ella mezcla etapas distintas (legacy y estado actual). Ejemplos:
- Varias guias mencionan React 17/CRA y frontend en frontend/.
- El frontend activo real hoy es Vite en frontend/vite-temp con React 19.
- Existen documentos historicos de bugs y fixes que describen estados anteriores.

Recomendacion:
- Tomar Program.cs, api.ts, App.tsx, docker-compose.yml y estructura real de carpetas como fuente de verdad operativa.

## 12) Riesgos Tecnicos y Operativos Detectados
1. Credenciales sensibles hardcodeadas en appsettings.json (connection string productivo).
2. Credenciales bootstrap admin conocidas (admin/admin123).
3. Divergencia entre scripts/documentacion y estructura real del frontend.
4. FRONTEND_URL no configurado en produccion activa fallback a dominio railway generico.

## 13) Prioridades Recomendadas (Enterprise Grade)
1. Secret management:
- Mover JWT key y connection strings a secret manager/env vars.
- Eliminar secretos del repo.

2. Hardening de auth:
- Forzar cambio de password inicial admin.
- Rotacion de claves JWT.
- Politicas de lockout y password.

3. Alineacion operativa:
- Unificar README/QuickStart con frontend/vite-temp.
- Corregir start-local.sh a scripts reales de Vite.

4. Observabilidad:
- Logging estructurado.
- Correlation IDs.
- Health checks para DB/API.

5. Calidad:
- Pruebas de integracion para auth, CORS, MatchEvents y MatchPlayers.
- Contract tests API-frontend.

## 14) Comandos de Ejecucion Recomendados (estado actual)
### Backend
- cd backend/MyApi
- dotnet restore
- dotnet run

### Frontend web activo
- cd frontend/vite-temp
- npm install
- npm run dev

### Produccion frontend web (estatico)
- npm run build
- npm run start

## 15) Contexto de Rama de Trabajo Actual
Rama activa creada para desarrollo:
- feature-add-autogoles

## 16) Fuentes Consultadas para este Contexto
- README.md
- PROJECT_STRUCTURE.md
- BACKEND_SUMMARY.md
- IMPLEMENTATION_SUMMARY.md
- QUICK_START.md
- ROADMAP.md
- BUG_FIXES_APPLIED.md
- SYSTEM_FIXED.md
- backend/MyApi/Program.cs
- backend/MyApi/MyApi.csproj
- backend/MyApi/appsettings.json
- backend/MyApi/appsettings.Development.json
- backend/MyApi/Controllers/*
- backend/MyApi/Services/*
- backend/MyApi/Controllers/AuthController.cs
- backend/MyApi/Data/AuthSeeder.cs
- backend/MyApi/Models/User.cs
- frontend/vite-temp/package.json
- frontend/vite-temp/src/App.tsx
- frontend/vite-temp/src/services/api.ts
- frontend/vite-temp/src/context/AuthContext.tsx
- frontend/vite-temp/src/components/AdminRoute.tsx
- frontend/vite-temp/src/services/authService.ts
- App-mobile/pubspec.yaml
- App-mobile/lib/main.dart
- docker-compose.yml
- start-local.sh

---
Documento generado el 2026-05-13 para consolidar el estado real y operativo del sistema.
