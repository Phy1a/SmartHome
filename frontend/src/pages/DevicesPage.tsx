import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDevices, getRooms } from '../utils/api';
import { getDeviceIcon } from '../utils/helpers';
import type { Device, Room, DeviceFilters } from '../types';

export default function DevicesPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', type: '', status: '', room: '', brand: '' });

  const TYPES = ['thermostat', 'lumière', 'caméra', 'électroménager', 'robot', 'sécurité', 'capteur', 'prise', 'autre'];

  useEffect(() => { getRooms().then(r => setRooms(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    getDevices(params).then(r => setDevices(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  const reset = () => setFilters({ keyword: '', type: '', status: '', room: '', brand: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, id: number) => {
    // Empêche la navigation si on clique sur un bouton ou select enfant
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) return;
    navigate(`/devices/${id}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🔌 Appareils connectés</h2>
        <p className="text-muted">Cliquez sur un appareil pour voir ses détails et le contrôler</p>
      </div>

      {/* SEARCH */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div className="search-field" style={{ gridColumn: 'span 2' }}>
            <label>🔍 Mot-clé (nom, description, ID)</label>
            <input className="form-input" placeholder="ex: Thermostat Salon..." value={filters.keyword}
              onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))} />
          </div>
          <div className="search-field">
            <label>Type</label>
            <select className="form-select" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
              <option value="">Tous les types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="search-field">
            <label>Statut</label>
            <select className="form-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">Tous</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div className="search-field">
            <label>Pièce</label>
            <select className="form-select" value={filters.room} onChange={e => setFilters(f => ({ ...f, room: e.target.value }))}>
              <option value="">Toutes les pièces</option>
              {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="search-field">
            <label>Marque</label>
            <input className="form-input" placeholder="ex: Philips..." value={filters.brand}
              onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))} />
          </div>
        </div>
        {hasFilters && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="text-muted text-small">{devices.length} résultat(s)</span>
            <button className="btn btn-ghost btn-sm" onClick={reset}>✕ Réinitialiser</button>
          </div>
        )}
      </div>

      {/* RESULTS */}
      {loading ? (
        <div className="loading-screen"><div className="spinner" /><span>Recherche...</span></div>
      ) : devices.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔌</div>
          <h3>Aucun appareil trouvé</h3>
          <p>Essayez de modifier vos filtres de recherche</p>
        </div>
      ) : (
        <div className="device-grid">
          {devices.map(d => (
            <div
              key={d.id}
              className={`device-card ${d.status === 'inactif' ? 'inactive' : ''}`}
              onClick={(e) => handleCardClick(e, d.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="device-card-header">
                <div className="device-type-icon">{getDeviceIcon(d.type)}</div>
                <span className={`badge ${d.status === 'actif' ? 'badge-green' : 'badge-red'}`}>
                  {d.status === 'actif' ? '● Actif' : '○ Inactif'}
                </span>
              </div>
              <div className="device-name">{d.name}</div>
              <div className="device-id">{d.uniqueId}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                {d.brand && <span>🏷️ {d.brand}</span>}
                {d.room && <span style={{ marginLeft: 8 }}>📍 {d.room}</span>}
              </div>
              <div className="device-attrs">
                {Object.entries(d.attributes || {}).slice(0, 3).map(([k, v]) => (
                  <span key={k} className="device-attr"><strong>{k}:</strong> {v}</span>
                ))}
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>🔋 {d.batteryLevel}%</span>
                <span>⚡ {d.energyConsumption?.toFixed(2)} kWh</span>
                <span>📶 {d.signalStrength}</span>
              </div>
              <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                Cliquer pour les détails →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
