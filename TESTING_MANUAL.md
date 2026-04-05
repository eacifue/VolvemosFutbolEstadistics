# 🧪 Guía Rápida de Testing - Sistema de Gestión de Partidos

## ⚡ Quick Start - Ambiente Local

### Paso 1: Iniciar Backend

```bash
cd /Volumes/DataMac/Developer/VolvemosFutbolEstadistics/my-dotnet-react-app/backend/MyApi

# Backend se ejecutará en http://localhost:5186
dotnet run
```

**Señales de éxito:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5186
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Paso 2: Iniciar Frontend

En otra terminal:

```bash
cd /Volumes/DataMac/Developer/VolvemosFutbolEstadistics/my-dotnet-react-app/frontend

# Frontend se ejecutará en http://localhost:3000
NODE_OPTIONS="--openssl-legacy-provider" npm start
```

**Esperar a que se compile y vea:**
```
Compiled successfully!
You can now view my-app in the browser.
  Local:            http://localhost:3000
```

---

## 🧪 Manual de Testing

### Test 1: Crear Partido

**Pasos:**
1. Abrir http://localhost:3000
2. Navegar a "Gestionar Partidos"
3. Llenar formulario:
   - **Fecha:** 2026-03-20 15:30
   - **Equipo Local:** Real Madrid
   - **Equipo Visitante:** Barcelona
   - **Goles Local:** 2
   - **Goles Visitante:** 1
   - **Estado:** Programado
4. Hacer click "Crear Partido"

**Resultado Esperado:**
- ✅ Notificación verde: "Partido creado exitosamente"
- ✅ Partido aparece en la lista
- ✅ Datos correctos mostrados en tarjeta

**Si falla:**
- Revisar consola del navegador (F12)
- Revisar logs del backend: `tail -50 /tmp/backend.log`

---

### Test 2: Editar Partido

**Pasos:**
1. Hacer click botón "✏️ Editar" en partido existente
2. Modificar datos:
   - Cambiar fecha o marcador
   - Cambiar estado a "En curso"
3. Hacer click "Actualizar Partido"
4. Confirmar en diálogo de confirmación

**Resultado Esperado:**
- ✅ Notificación: "Partido actualizado"
- ✅ Cambios reflejados en tarjeta
- ✅ Campo de edición se limpia

**Validaciones:**
- No permitir equipos vacíos
- Mantener formato de fecha correcto

---

### Test 3: Eliminar Partido

**Pasos:**
1. Hacer click "🗑️ Eliminar" en partido existente
2. Confirmar en diálogo: "Sí, eliminar"

**Resultado Esperado:**
- ✅ Notificación: "Partido eliminado"
- ✅ Partido desaparece de la lista
- ✅ Contador se actualiza

**Validaciones:**
- Diálogo de confirmación aparece
- No se puede confirmar accidentalmente

---

### Test 4: Agregar Eventos (Goles, Asistencias, Tarjetas)

**Pasos:**
1. Hacer click "📈 Eventos" en partido
2. Se expande la sección con formulario
3. Seleccionar:
   - **Tipo:** Gol
   - **Jugador:** Cristiano Ronaldo
   - **Minuto:** 45
4. Hacer click "Agregar Evento"
5. Repetir con:
   - Gol para otro jugador
   - Asistencia
   - Tarjeta Amarilla

**Resultado Esperado:**
- ✅ Evento aparece en lista
- ✅ Emoji correcto: ⚽ (Gol), 🎯 (Asistencia), 🟡 (Tarjeta)
- ✅ Nombre jugador mostrado
- ✅ Minuto del evento

---

### Test 5: Buscar Partidos

**Pasos:**
1. En sección de lista, escribir en búsqueda:
   - "Real Madrid"
   - "Barcelona"
   - "Finalizado"

**Resultado Esperado:**
- ✅ Filtra partidos en tiempo real
- ✅ Contador se actualiza
- ✅ Búsqueda insensible a mayúsculas

---

## 🔍 Validaciones de Datos

### Campos Requeridos

| Campo | Requerido | Tipo | Validación |
|-------|-----------|------|-----------|
| Fecha | ✅ Sí | DateTime | Formato ISO |
| Equipo Local | ✅ Sí | Número | > 0 |
| Equipo Visitante | ✅ Sí | Número | > 0 |
| Goles Local | ❌ No | Número | >= 0 |
| Goles Visitante | ❌ No | Número | >= 0 |
| Estado | ✅ Sí | Select | Scheduled, Ongoing, Finished |

### Mensajes de Error

| Escenario | Mensaje Esperado |
|-----------|------------------|
| Falta fecha | "Completa: fecha, equipo local y visitante" |
| Falta equipo | "Completa: fecha, equipo local y visitante" |
| Error backend | Mensaje específico del error |
| Evento sin jugador | "Completa: jugador y minuto" |

---

## 🚀 API Endpoints Disponibles

### Matches

```bash
# Obtener todos los partidos
GET http://localhost:5186/api/matches

# Obtener un partido específico
GET http://localhost:5186/api/matches/1

# Crear partido
POST http://localhost:5186/api/matches
Content-Type: application/json
{
  "matchDate": "2026-03-15T15:00:00",
  "homeTeamId": 1,
  "awayTeamId": 2,
  "homeTeamScore": 0,
  "awayTeamScore": 0,
  "status": "Scheduled"
}

# Actualizar partido
PUT http://localhost:5186/api/matches/1
Content-Type: application/json
{...}

# Eliminar partido
DELETE http://localhost:5186/api/matches/1

# Partidos por equipo
GET http://localhost:5186/api/matches/team/1
```

### Equipos

```bash
# Obtener todos los equipos
GET http://localhost:5186/api/teams

# Equipos disponibles:
# 1 - Real Madrid
# 2 - Barcelona
# 3 - Atletico Madrid
# 4 - Valencia
```

### Jugadores

```bash
# Obtener todos los jugadores
GET http://localhost:5186/api/players

# Jugadores por equipo (5 por equipo):
# Real Madrid (ID: 1):
#   - Cristiano Ronaldo (#7)
#   - Sergio Ramos (#4)
#   - Andriy Lunin (#1)
# ... y más
```

---

## 📱 Datos de Prueba Inicializados

### Equipos (4)
- **Real Madrid** - White
- **Barcelona** - Blue
- **Atletico Madrid** - Red
- **Valencia** - Orange

### Jugadores (9)
- 3 en Real Madrid
- 3 en Barcelona
- 2 en Atletico Madrid
- 1 en Valencia

---

## 🐛 Troubleshooting

### "No puede conectar a http://localhost:5186"

**Solución:**
```bash
# Vérifique que backend está corriendo
lsof -i :5186

# Si no está, inicie:
cd backend/MyApi && dotnet run
```

### "API devuelve 400 Bad Request"

**Causa común:** Formato de fecha incorrecto

**Solución:** Frontend automáticamente ajusta formato, pero en testing manual use:
```json
{
  "matchDate": "2026-03-15T15:00:00"
}
```

### "Equipos no aparecen en dropdown"

**Solución:**
1. Abrir DevTools (F12)
2. Consola → ver errores
3. Verificar que `GET /api/teams` retorna datos:
```bash
curl http://localhost:5186/api/teams
```

### "Notificaciones no aparecen"

**Verificar:**
- Búsquese componente `Notification` en DevTools
- Verificar estilos CSS no están siendo bloqueados
- Abrir http://localhost:3000 (no usar HTTPS)

---

## 📊 Checklist de Testing Completo

- [ ] Backend inicia sin errores
- [ ] Frontend compila sin errores
- [ ] Datos de prueba se cargan (equipos, jugadores)
- [ ] GET /api/matches retorna datos
- [ ] Formulario de creación visible y funcionando
- [ ] Crear partido exitosamente
- [ ] Notificación de éxito aparece
- [ ] Partido aparece en lista
- [ ] Editar partido funcionando
- [ ] Notificación de actualización aparece
- [ ] Eliminar partido con confirmación
- [ ] Notificación de eliminación aparece
- [ ] Expandir partido muestra eventos
- [ ] Agregar evento (gol, asistencia, tarjeta)
- [ ] Eventos se muestran con emoji correcto
- [ ] Búsqueda de partidos funciona
- [ ] Contador de partidos actualiza
- [ ] Errores se muestran apropiadamente
- [ ] Formulario se limpia después de crear
- [ ] Estado del partido cambia correctamente

---

## 🎬 Usando postman/curl para Testing Avanzado

### Crear Partido con curl

```bash
curl -X POST "http://localhost:5186/api/matches" \
  -H "Content-Type: application/json" \
  -d '{
    "matchDate": "2026-03-25T19:00:00",
    "homeTeamId": 1,
    "awayTeamId": 3,
    "homeTeamScore": 3,
    "awayTeamScore": 2,
    "status": "Finished"
  }'
```

### Agregar Evento a Partido

```bash
curl -X POST "http://localhost:5186/api/matchevents" \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": 1,
    "playerId": 1,
    "eventType": "Goal",
    "minute": 15,
    "description": "Gol hermoso"
  }'
```

---

## ✅ Conclusión

Todos los sistemas estén funcionando correctamente. Si algún test falla, revisar los logs y el mensaje de error específico. El sistema está listo para uso en desarrollo.

**Tiempo estimado de testing:** 10-15 minutos para todos los casos.

¡Buen testing! 🚀
