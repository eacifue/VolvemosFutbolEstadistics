# 🚀 Quick Start Guide - Backend

## ⚡ Inicio Rápido (5 minutos)

### 1. **Preparar el Entorno**

```bash
# Abre una terminal en la raíz del proyecto
cd backend/src/MyApi
```

### 2. **Restaurar Dependencias**

```bash
dotnet restore
```

### 3. **Ejecutar la Aplicación**

```bash
dotnet run
```

**Salida esperada:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

### 4. **Verificar que funciona**

Abre en tu navegador:
- **Swagger UI:** http://localhost:5000/swagger
- **API Base:** http://localhost:5000/api

---

## 📡 Primeros Endpoints para Probar

### Test 1: Obtener todos los jugadores
```bash
curl http://localhost:5000/api/players
```

**Respuesta esperada:** Array de 12 jugadores

### Test 2: Obtener equipos
```bash
curl http://localhost:5000/api/teams
```

**Respuesta esperada:** Array de 2 equipos (Blanco y Negro)

### Test 3: Obtener partidos
```bash
curl http://localhost:5000/api/matches
```

**Respuesta esperada:** Array de 2 partidos

### Test 4: Obtener top goleadores
```bash
curl http://localhost:5000/api/statistics/goals
```

**Respuesta esperada:** Top 10 goleadores (Juan García en primer lugar)

### Test 5: Obtener top asistidores
```bash
curl http://localhost:5000/api/statistics/assists
```

**Respuesta esperada:** Top 10 asistidores (Javier Moreno en primer lugar)

---

## 🎮 Operaciones Comunes

### Crear un nuevo jugador
```bash
curl -X POST http://localhost:5000/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marco",
    "lastName": "Venturo",
    "number": 14,
    "position": "Extremo",
    "height": "1.78m",
    "weight": "71kg",
    "nationality": "Italia",
    "goals": 3,
    "assists": 2,
    "matches": 8,
    "teamId": 1
  }'
```

### Actualizar un jugador
```bash
curl -X PUT http://localhost:5000/api/players/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "García",
    "number": 9,
    "position": "Delantero",
    "height": "1.82m",
    "weight": "78kg",
    "nationality": "España",
    "goals": 20,
    "assists": 5,
    "matches": 25,
    "teamId": 1
  }'
```

### Eliminar un jugador
```bash
curl -X DELETE http://localhost:5000/api/players/12
```

### Crear un nuevo partido
```bash
curl -X POST http://localhost:5000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "matchDate": "2026-03-15T19:00:00Z",
    "homeTeamId": 1,
    "awayTeamId": 2,
    "status": "Scheduled"
  }'
```

---

## 🛠️ Troubleshooting

### Error: "Connection refused"
- ✅ Verifica que estés en el directorio correcto: `backend/src/MyApi`
- ✅ Ejecuta `dotnet run`

### Error: "Port 5000 already in use"
```bash
# Usa un puerto diferente
dotnet run --urls "http://localhost:5002"
```

### Error: "No database"
- ✅ La BD se crea automáticamente en la primera ejecución
- ✅ Se llama `futbol_estadistics.db` en el directorio de la app

### Swagger no carga
- ✅ Espera a que diga "Now listening on http://localhost:5000"
- ✅ Abre http://localhost:5000/swagger (con swagger al final)

---

## 📱 Conectar desde Frontend

En `frontend/src/services/api.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ejemplo de uso
export const getPlayers = async () => {
    const response = await apiClient.get('/players');
    return response.data;
};

export const getTeams = async () => {
    const response = await apiClient.get('/teams');
    return response.data;
};
```

---

## 📚 Documentación

Para documentación completa de endpoints, ver:
- `API_DOCUMENTATION.md` - Especificación técnica completa
- `BACKEND_SUMMARY.md` - Resumen de implementación
- `PROJECT_STRUCTURE.md` - Estructura del proyecto

---

## ✅ Checklist de Verificación

- [ ] Backend ejecutándose en http://localhost:5000
- [ ] Swagger accesible en http://localhost:5000/swagger
- [ ] BD `futbol_estadistics.db` creada
- [ ] Datos iniciales cargados (12 jugadores, 2 equipos, 2 partidos)
- [ ] Frontend conectado a http://localhost:5000/api
- [ ] Endpoints de CRUD funcionando
- [ ] Endpoints de estadísticas funcionando

---

**¡El backend está listo para usar! 🎉**

Para más información, consulta la documentación completa.
