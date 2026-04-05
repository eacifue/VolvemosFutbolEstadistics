#!/bin/bash
# Quick Start Script para Sistema de Gestión de Partidos

echo "🚀 Iniciando Sistema de Gestión de Partidos (Ambiente Local)"
echo "=========================================="
echo ""

# Check if ports are free
echo "Verificando puertos..."
if lsof -Pi :5186 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Puerto 5186 ya está en uso. Matando proceso..."
    lsof -ti:5186 | xargs kill -9
    sleep 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Puerto 3000 ya está en uso. Matando proceso..."
    lsof -ti:3000 | xargs kill -9
    sleep 1
fi

# Start Backend
echo ""
echo "🔧 Iniciando Backend .NET (Puerto 5186)..."
cd /Volumes/DataMac/Developer/VolvemosFutbolEstadistics/my-dotnet-react-app/backend/MyApi
dotnet run > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Esperando a que backend esté listo..."
sleep 5

# Check if backend is running
if curl -s "http://localhost:5186/api/matches" > /dev/null 2>&1; then
    echo "✅ Backend iniciado correctamente"
else
    echo "❌ Error iniciando backend. Ver logs:"
    tail -50 /tmp/backend.log
    exit 1
fi

# Start Frontend
echo ""
echo "🎨 Iniciando Frontend React (Puerto 3000)..."
cd /Volumes/DataMac/Developer/VolvemosFutbolEstadistics/my-dotnet-react-app/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Start frontend
NODE_OPTIONS="--openssl-legacy-provider" npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✅ SISTEMA INICIADO"
echo "=========================================="
echo ""
echo "🌐 URLs Disponibles:"
echo "   Frontend básico: http://localhost:3000"
echo "   Frontend avanzado: http://localhost:3000/gestionar-partidos-avanzado"
echo "   Backend:   http://localhost:5186"
echo ""
echo "📊 API Endpoints:"
echo "   GET  http://localhost:5186/api/matches"
echo "   GET  http://localhost:5186/api/teams"
echo "   GET  http://localhost:5186/api/players"
echo ""
echo "📋 Datos de Prueba Inicializados:"
echo "   Equipos:   4 (Real Madrid, Barcelona, Atletico, Valencia)"
echo "   Jugadores: 9"
echo "   Partidos:  Vacío (listos para crear)"
echo ""
echo "🛑 Para detener:"
echo "   CTRL+C en esta terminal"
echo ""
echo "=========================================="

# Keep script running
wait $BACKEND_PID $FRONTEND_PID
