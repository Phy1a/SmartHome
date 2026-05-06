import { useState, useEffect, useCallback } from 'react';
import { getDevices, getRooms, addDevice, updateDevice, toggleDevice, requestDeletion, deleteDevice } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { getDeviceIcon, formatDate } from '../utils/helpers';
import { useToast, ToastContainer } from '../hooks/useToast';
import type { Device, Room } from '../types';

const TYPES = ['thermostat', 'lumière', 'caméra', 'électroménager', 'robot', 'sécurité', 'capteur', 'prise', 'autre'];

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; device: Device }
  | { type: 'delete'; device: Device }
  | null;

interface ToastAPI {
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
}

interface DeviceModalProps {
  device?: Device;
  rooms: Room[];
  onClose: () => void;
  onSaved: () => void;
  toast: ToastAPI;
}

function DeviceModal({ device, rooms, onClose, onSaved, toast }: DeviceModalProps) {
  const isNew = !device?.id;
  const [form, setForm] = useState({
    name: device?.name ?? '',
    description: device?.description ?? '',
    type: device?.type ?? 'autre',
    brand: device?.brand ?? '',
    room: device?.room ?? '',
    status: device?.status ?? 'actif',
    energyConsumption: device?.energyConsumption ?? 0,
  });
  const [saving, setSaving] = useState<boolean>(false);

  const save = async () => {
    if (!form.name) { toast.error('Le nom est requis'); return; }
    setSaving(true);
    try {
      if (isNew) await addDevice(form);
      else await updateDevice(device!.id, form);
      toast.success(isNew ? 'Appareil ajouté !' : 'Appareil mis à jour !');
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Erreur');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{isNew ? '➕ Ajouter un appareil' : `✏️ Modifier — ${device?.name}`}</div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Nom *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Marque</label>
            <input className="form-input" placeholder="Philips, Nest..." value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Pièce</label>
            <select className="form-select" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}>
              <option value="">Non assigné</option>
              {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Statut</label>
            <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'actif' | 'inactif' }))}>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Consommation (kWh)</label>
            <input className="form-input" type="number" step="0.01" value={form.energyConsumption}
              onChange={e => setForm(f => ({ ...f, energyConsumption: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description de l'appareil..." />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? '...' : (isNew ? 'Ajouter' : 'Enregistrer')}</button>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  device: Device;
  isAdmin: boolean;
  onClose: () => void;
  onDone: () => void;
  toast: ToastAPI;
}

function DeleteModal({ device, isAdmin, onClose, onDone, toast }: DeleteModalProps) {
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handle = async () => {
    setLoading(true);
    try {
      if (isAdmin) await deleteDevice(device.id);
      else await requestDeletion(device.id, { reason });
      toast.success(isAdmin ? 'Appareil supprimé.' : "Demande envoyée à l'administrateur.");
      onDone();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">🗑️ Supprimer — {device.name}</div>
        {isAdmin ? (
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Voulez-vous vraiment supprimer cet appareil ? Cette action est irréversible.</p>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>En tant qu'utilisateur avancé, vous pouvez soumettre une demande de suppression. L'administrateur devra l'approuver.</p>
            <div className="form-group">
              <label className="form-label">Raison (optionnel)</label>
              <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Pourquoi supprimer cet appareil ?" />
            </div>
          </>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-danger" onClick={handle} disabled={loading}>{loading ? '...' : (isAdmin ? 'Supprimer' : 'Envoyer la demande')}</button>
        </div>
      </div>
    </div>
  );
}

export default function ManageDevicesPage() {
  const { canAccess } = useAuth();
  const { toasts, toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [filters, setFilters] = useState({ keyword: '', type: '', status: '' });

  const isAdmin = canAccess('expert');

  const load = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    Promise.all([getDevices(params), getRooms()])
      .then(([d, r]) => { setDevices(d.data); setRooms(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [filters]);

  const handleToggle = async (device: Device) => {
    try {
      const res = await toggleDevice(device.id);
      toast.success(`Appareil ${res.data.status}`);
      load();
    } catch (err: any) { toast.error(err.response?.data?.error ?? 'Erreur'); }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} />

      {modal?.type === 'add' && (
        <DeviceModal rooms={rooms} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} toast={toast} />
      )}
      {modal?.type === 'edit' && (
        <DeviceModal device={modal.device} rooms={rooms} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} toast={toast} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal device={modal.device} isAdmin={isAdmin} onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} toast={toast} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>⚙️ Gestion des appareils</h2>
          <p className="text-muted">Administrer les appareils connectés de la maison</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>➕ Ajouter un appareil</button>
      </div>

      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="search-field" style={{ flex: 2, minWidth: 200 }}>
          <label>Rechercher</label>
          <input className="form-input" placeholder="Nom, description..." value={filters.keyword} onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))} />
        </div>
        <div className="search-field">
          <label>Type</label>
          <select className="form-select" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">Tous</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="search-field">
          <label>Statut</label>
          <select className="form-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Tous</option><option value="actif">Actif</option><option value="inactif">Inactif</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /><span>Chargement...</span></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Appareil</th><th>Type</th><th>Pièce</th><th>Marque</th><th>Statut</th><th>Énergie</th><th>Dernière activité</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Aucun appareil</td></tr>
                )}
                {devices.map((d: Device) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{getDeviceIcon(d.type)}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{d.uniqueId}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-purple">{d.type}</span></td>
                    <td style={{ fontSize: 13 }}>{d.room || '—'}</td>
                    <td style={{ fontSize: 13 }}>{d.brand || '—'}</td>
                    <td>
                      <label className="toggle" title={d.status === 'actif' ? 'Désactiver' : 'Activer'}>
                        <input type="checkbox" checked={d.status === 'actif'} onChange={() => handleToggle(d)} />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td style={{ fontSize: 13, fontFamily: 'var(--mono)' }}>{d.energyConsumption?.toFixed(2)} kWh</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(d.lastInteraction)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'edit', device: d })}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setModal({ type: 'delete', device: d })}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
