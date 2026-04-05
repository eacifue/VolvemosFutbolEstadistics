# Sistema de Gestión de Partidos - Documentación

## 📋 Visión General

Se ha implementado un sistema completo de gestión de partidos de fútbol con las siguientes funcionalidades:

### Características Principales
- ✅ **Crear Partidos**: Agregar nuevos partidos con equipos, fechas y horarios
- ✅ **Editar Partidos**: Modificar información del partido (fecha, estado, marcador)
- ✅ **Eliminar Partidos**: Remover partidos con confirmación
- ✅ **Gestionar Eventos**: Agregar goles, asistencias y tarjetas por jugador
- ✅ **Notificaciones**: Mensajes profesionales para crear, editar y eliminar
- ✅ **Interfaz Responsiva**: Funciona en desktop, tablet y mobile

## 🏗️ Arquitectura

### Backend (.NET 10)
**Nuevos Servicios Creados:**
- `IMatchEventService` / `MatchEventService`: Gestión de eventos de partidos
- `MatchEventsController`: API endpoints para eventos

**Endpoints API Implementados:**

**Partidos:**
- `GET /api/matches` - Obtener todos los partidos
- `GET /api/matches/{id}` - Obtener un partido específico
- `POST /api/matches` - Crear nuevo partido
- `PUT /api/matches/{id}` - Actualizar partido
- `DELETE /api/matches/{id}` - Eliminar partido

**Eventos de Partidos:**
- `GET /api/matchevents/match/{matchId}` - Obtener eventos de un partido
- `POST /api/matchevents` - Crear evento (gol, asistencia, etc.)
- `PUT /api/matchevents/{id}` - Actualizar evento
- `DELETE /api/matchevents/{id}` - Eliminar evento
- `DELETE /api/matchevents/match/{matchId}` - Eliminar todos los eventos de un partido

### Frontend (React + TypeScript)
**Nuevos Componentes:**
- `ManageMatches.tsx`: Página completa de gestión de partidos
- `ManageMatches.css`: Estilos profesionales con animaciones

**Actualizaciones Existentes:**
- `api.ts`: Nuevas funciones para llamadas a API de partidos
- `App.tsx`: Ruta agregada `/gestionar-partidos`
- `Header.tsx`: Enlace nuevo en navegación

## 🎮 Cómo Usar

### 1. Crear un Nuevo Partido
1. Ir a "Gestionar Partidos" en la navegación
2. Completar el formulario:
   - **Fecha**: Seleccionar fecha y hora
   - **Equipo Local**: Seleccionar equipo local
   - **Equipo Visitante**: Seleccionar equipo visitante
   - **Estado**: Cambiar a "En curso" si es necesario
3. Hacer clic en "Crear Partido"
4. Se mostrará notificación de éxito: "Partido creado exitosamente"

### 2. Agregar Goles y Asistencias
1. Una vez creado el partido, hacer clic en btn "📈 Eventos"
2. Expandido el partido, aparecerá sección "Goles y Asistencias"
3. Seleccionar:
   - **Tipo de Evento**: Gol, Asistencia, Tarjeta Amarilla, Tarjeta Roja
   - **Jugador**: Seleccionar jugador del equipo
   - **Minuto**: Ingresar minuto donde ocurrió el evento
4. Hacer clic en "Agregar Evento"
5. El evento aparecerá en la lista con:
   - ⚽ Emoji para goles
   - 🎯 Emoji para asistencias
   - 🟡 Emoji para tarjetas

### 3. Editar un Partido
1. Hacer clic en btn "✏️ Editar" en la tarjeta del partido
2. Modificar los datos necesarios
3. Hacer clic en "Actualizar Partido"
4. Confirmar en el diálogo: "Sí, guardar"
5. Se mostrará: "Partido actualizado"

### 4. Eliminar un Partido
1. Hacer clic en btn "🗑️ Eliminar" en la tarjeta del partido
2. Confirmar en el diálogo: "Sí, eliminar"
3. Se mostrará: "Partido eliminado"

### 5. Eliminar Eventos
1. Expandir el partido (btn "📈 Eventos")
2. En la lista de eventos, hacer clic en "✕" para eliminar
3. Se mostrará: "Evento eliminado"

## 🎨 Interfaz de Usuario

### Componentes Principales

**Match Card (Tarjeta de Partido)**
```
┌─────────────────────────────────────┐
│   Tigres 0 VS 2 Leones              │
├─────────────────────────────────────┤
│ Fecha: 11/03/2026 14:30             │
│ Estado: 🟢 Programado               │
├─────────────────────────────────────┤
│ [📈 Eventos] [✏️ Editar] [🗑️ Elim.] │
└─────────────────────────────────────┘
```

**Expanded Events View**
```
┌─────────────────────────────────────┐
│ 🎯 Goles y Asistencias              │
│ ⚽ Carlos Perez - Gol (min 15)      │
│ 🎯 Miguel Gomez - Asistencia (min 20)│
│ [Agregar Evento...]                 │
└─────────────────────────────────────┘
```

**Estados de Partido**
- 🟡 Programado (Scheduled)
- 🔵 En curso (Ongoing)
- 🟢 Finalizado (Finished)

## 📱 Notificaciones

### Tipos de Notificación

**Éxito (Verde)**
- "Partido creado exitosamente"
- "Partido actualizado"
- "Partido eliminado"
- "Gol registrado"
- "Asistencia registrada"
- "Evento eliminado"

**Error (Rojo)**
- "No pudimos guardar. Intenta de nuevo"
- "No se pudo eliminar. Intenta de nuevo"
- "No pudimos registrar el evento"
- "Error cargando partidos"

**Advertencia (Naranja)**
- "Completa: fecha, equipo local y visitante"
- "Completa: jugador y minuto"

**Confirmación (Amarilla)**
- "¿Guardar cambios en el partido?"
- "¿Eliminar este partido?"

## 🗄️ Base de Datos

### Tabla: Matches
```sql
- Id: INT AUTO_INCREMENT
- MatchDate: DATETIME
- HomeTeamId: INT (FK)
- AwayTeamId: INT (FK)
- HomeTeamScore: INT (NULL)
- AwayTeamScore: INT (NULL)
- Status: VARCHAR (Scheduled, Ongoing, Finished)
- CreatedAt: DATETIME
- UpdatedAt: DATETIME
```

### Tabla: MatchEvents
```sql
- Id: INT AUTO_INCREMENT
- MatchId: INT (FK)
- PlayerId: INT (FK)
- EventType: VARCHAR (Goal, Assist, YellowCard, RedCard)
- Minute: INT (NULL)
- Description: VARCHAR (NULL)
- CreatedAt: DATETIME
```

### Datos Iniciales
- **Equipos**: Tigres, Leones, Águilas, Dragones (4 equipos)
- **Jugadores**: 3 jugadores por equipo (12 totalles)
- **Partidos**: 1 partido inicial Tigres vs Leones

## 🔧 Configuración Backend

### Program.cs - Registración de Servicios
```csharp
// Agregado:
builder.Services.AddScoped<IMatchEventService, MatchEventService>();
```

### ApplicationDbContext
Las entidades `Match` y `MatchEvent` se cargan automáticamente mediante Entity Framework Core.

## 📊 Modelos de Datos

### Match Model
```csharp
public class Match
{
    public int Id { get; set; }
    public DateTime MatchDate { get; set; }
    public int HomeTeamId { get; set; }
    public Team HomeTeam { get; set; }
    public int AwayTeamId { get; set; }
    public Team AwayTeam { get; set; }
    public int? HomeTeamScore { get; set; }
    public int? AwayTeamScore { get; set; }
    public string Status { get; set; }
    public ICollection<MatchEvent> Events { get; set; }
}
```

### MatchEvent Model
```csharp
public class MatchEvent
{
    public int Id { get; set; }
    public int MatchId { get; set; }
    public Match Match { get; set; }
    public int PlayerId { get; set; }
    public Player Player { get; set; }
    public string EventType { get; set; }
    public int? Minute { get; set; }
    public string Description { get; set; }
}
```

## 🌐 Endpoints de API Completos

### GET /api/matches
Retorna lista de todos los partidos con información de equipos.

**Response:**
```json
[
  {
    "id": 1,
    "matchDate": "2026-03-11T14:30:00",
    "homeTeamId": 1,
    "homeTeam": {
      "id": 1,
      "name": "Tigres"
    },
    "awayTeamId": 2,
    "awayTeam": {
      "id": 2,
      "name": "Leones"
    },
    "homeTeamScore": 2,
    "awayTeamScore": 1,
    "status": "Finished"
  }
]
```

### POST /api/matches
Crea un nuevo partido.

**Request:**
```json
{
  "matchDate": "2026-03-12T15:00:00",
  "homeTeamId": 1,
  "awayTeamId": 3,
  "homeTeamScore": 0,
  "awayTeamScore": 0,
  "status": "Scheduled"
}
```

### POST /api/matchevents
Crea un evento de partido (gol, asistencia, tarjeta).

**Request:**
```json
{
  "matchId": 1,
  "playerId": 1,
  "eventType": "Goal",
  "minute": 25,
  "description": "Carlos Perez tira directo"
}
```

## 💻 Compilación y Ejecución

### Backend
```bash
cd backend/MyApi
dotnet build
dotnet run
```

### Frontend
```bash
cd frontend
npm install  # Si es necesario
npm run build  # Para producción
npm start  # Para desarrollo
```

### Docker
```bash
docker-compose up --build
```

## ✅ Validaciones

### Validaciones de Formulario
- ✓ Fecha requerida
- ✓ Equipo local requerido
- ✓ Equipo visitante requerido
- ✓ Equipos diferentes obligatorios
- ✓ Minuto entre 0-120

### Validaciones de Eventos
- ✓ Jugador requerido
- ✓ Evento requiere minuto válido
- ✓ Tipos de evento permitidos: Goal, Assist, YellowCard, RedCard

## 🎯 Casos de Uso

### Caso 1: Registro de Partido en Vivo
1. Crear partido con estado "En curso"
2. A medida que ocurren eventos, agregarlos con minuto
3. Al finalizar, cambiar estado a "Finalizado"

### Caso 2: Registro Posterior
1. Crear partido con estado "Programado"
2. Cambiar a "Finalizado" después
3. Agregar todos los eventos manualmente

### Caso 3: Seguimiento Completo
1. Crear partido
2. Registrar todos los goles
3. Registrar todas las asistencias
4. Registrar tarjetas si ocurren
5. Visualizar resumido en tarjeta

## 📈 Estadísticas Futuras
Los datos de eventos pueden usarse para:
- Calcular goles a favor/en contra por equipo
- Identificar jugadores con más goles del torneo
- Crear rankings de asistencias
- Analizar rendimiento por jugador

## 🐛 Solución de Problemas

**Problema**: No veo los equipos en el dropdown
**Solución**: Asegurar que existan equipos en la tabla Teams

**Problema**: Error al agregar evento
**Solución**: Verificar que el jugador pertenezca a uno de los equipos del partido

**Problema**: Notificaciones no aparecen
**Solución**: Verificar que el componente Notification esté correctamente importado

---

**Versión**: 1.0
**Última actualización**: 11 de marzo de 2026
