// Rebuilt player management as a split desktop workspace with custom delete confirmation and mobile-safe action controls.
import React, { useEffect, useState } from 'react';
import '../styles/ManagePlayers.css';
import type { Player, Position } from '../types';
import { getPlayers, createPlayer, updatePlayer, deletePlayer, getPositions } from '../services/api';

interface FormData {
  firstName: string;
  lastName: string;
  idPosition: number | '';
}

const INITIAL_FORM: FormData = { firstName: '', lastName: '', idPosition: '' };

const ManagePlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<Player | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [playersData, positionsData] = await Promise.all([getPlayers(), getPositions()]);
      setPlayers(playersData);
      setPositions(positionsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'idPosition' ? (value === '' ? '' : Number(value)) : value,
    }));
    if (formError) setFormError(null);
  };

  const handleAddPlayer = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError('El nombre y apellido son obligatorios.');
      return;
    }

    if (formData.idPosition === '') {
      setFormError('Debes seleccionar una posicion.');
      return;
    }

    setFormError(null);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        idPosition: formData.idPosition,
      };

      if (editingId !== null) {
        await updatePlayer(editingId, payload);
        setEditingId(null);
      } else {
        await createPlayer(payload);
      }

      setFormData(INITIAL_FORM);
      loadData();
    } catch (err) {
      console.error('Error saving player:', err);
      setFormError('Ocurrio un error al guardar el jugador.');
    }
  };

  const handleEditPlayer = (player: Player) => {
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      idPosition: player.positionId ?? '',
    });
    setEditingId(player.id);
    setFormError(null);
  };

  const confirmDeletePlayer = async () => {
    if (!deleteCandidate) return;
    try {
      await deletePlayer(deleteCandidate.id);
      setDeleteCandidate(null);
      loadData();
    } catch (err) {
      console.error('Error deleting player:', err);
    }
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setFormError(null);
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString().includes(searchTerm)
  );

  if (loading) return <div className="container page-feedback">Cargando jugadores...</div>;
  if (error) return <div className="container page-feedback page-feedback-error">{error}</div>;

  return (
    <div className="manage-players-page">
      {deleteCandidate && (
        <div className="confirmation-modal-overlay" onClick={() => setDeleteCandidate(null)}>
          <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar eliminacion</h3>
            <p>
              Vas a eliminar a <strong>{deleteCandidate.firstName} {deleteCandidate.lastName}</strong>. Esta accion no se puede deshacer.
            </p>
            <div className="confirmation-buttons">
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteCandidate(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDeletePlayer}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="players-header">
        <div className="container">
          <h1>Gestion de Jugadores</h1>
          <p>Registra, edita y organiza la plantilla oficial del clasico.</p>
        </div>
      </section>

      <section className="manage-layout-section form-section">
        <div className="container">
          <div className="manage-layout">
            <div className="form-card manage-form-panel">
              <h2>{editingId ? 'Editar Jugador' : 'Agregar Jugador'}</h2>
              {formError && <p className="form-error">{formError}</p>}

              <form className="player-form" onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }}>
                <div className="form-group">
                  <label htmlFor="firstName">Nombre *</label>
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
                  <label htmlFor="lastName">Apellido *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Ingresa el apellido"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="idPosition">Posicion *</label>
                  <select
                    id="idPosition"
                    name="idPosition"
                    value={formData.idPosition}
                    onChange={handleInputChange}
                    className="position-select"
                  >
                    <option value="">-- Seleccionar posicion --</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Actualizar' : 'Agregar'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="players-list-section manage-table-panel">
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
                      <th>Posicion</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player, idx) => (
                        <tr key={player.id} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                          <td><span className="player-id">{player.id}</span></td>
                          <td className="player-name ellipsis">{player.firstName}</td>
                          <td className="player-lastname ellipsis">{player.lastName}</td>
                          <td>
                            {player.position?.name
                              ? <span className="position-badge ellipsis">{player.position.name}</span>
                              : <span className="position-empty">—</span>}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-edit" onClick={() => handleEditPlayer(player)} title="Editar" type="button">
                                <span className="icon-only">✏️</span>
                                <span className="text-label">Editar</span>
                              </button>
                              <button className="btn-delete" onClick={() => setDeleteCandidate(player)} title="Eliminar" type="button">
                                <span className="icon-only">🗑️</span>
                                <span className="text-label">Eliminar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="empty-message">
                          ⚽ No hay jugadores que coincidan con la busqueda
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ManagePlayers;
