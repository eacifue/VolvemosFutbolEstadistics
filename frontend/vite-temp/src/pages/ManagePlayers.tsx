import React, { useState, useEffect } from 'react';
import '../styles/ManagePlayers.css';
import type { Player } from '../types';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../services/api';

const ManagePlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const data = await getPlayers();
      setPlayers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPlayer = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) return;
    try {
      if (editingId !== null) {
        await updatePlayer(editingId, formData);
        setEditingId(null);
      } else {
        await createPlayer(formData);
      }
      setFormData({ firstName: '', lastName: '' });
      loadPlayers();
    } catch (err) {
      console.error('Error saving player:', err);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setFormData({ firstName: player.firstName, lastName: player.lastName });
    setEditingId(player.id);
  };

  const handleDeletePlayer = async (id: number) => {
    try {
      await deletePlayer(id);
      loadPlayers();
    } catch (err) {
      console.error('Error deleting player:', err);
    }
  };

  const handleCancel = () => {
    setFormData({ firstName: '', lastName: '' });
    setEditingId(null);
  };

  const filteredPlayers = players.filter(p =>
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Cargando...</div>;
  if (error) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div className="manage-players-page">
      <section className="players-header">
        <div className="container">
          <h1>Gestión de Jugadores</h1>
          <p>Administra el registro de jugadores</p>
        </div>
      </section>

      <section className="form-section">
        <div className="container">
          <div className="form-card">
            <h2>{editingId ? 'Editar Jugador' : 'Agregar Nuevo Jugador'}</h2>
            <form className="player-form" onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }}>
              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Ingresa el nombre"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Ingresa el apellido"
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar Jugador' : 'Agregar Jugador'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="players-list-section">
        <div className="container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-count">{filteredPlayers.length} jugadores</span>
          </div>

          <div className="table-wrapper">
            <table className="players-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map(player => (
                    <tr key={player.id}>
                      <td><span className="player-id">{player.id}</span></td>
                      <td className="player-name">{player.firstName}</td>
                      <td className="player-lastname">{player.lastName}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditPlayer(player)}
                            title="Editar"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeletePlayer(player.id)}
                            title="Eliminar"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-message">
                      No hay jugadores que coincidan con la búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ManagePlayers;