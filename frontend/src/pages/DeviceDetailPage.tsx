import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDevice, toggleDevice, updateDevice } from '../utils/api';
import { getDeviceIcon, formatDate } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { useToast, ToastContainer } from '../hooks/useToast';
import type { Device } from '../types';

interface DeviceControlsProps {
  device: Device;
  onUpdate: () => void;
  canControl: boolean;
}

function DeviceControls({ device, onUpdate, canControl }: DeviceControlsProps) {
  const [attrs, setAttrs] = useState<Record<string, string>>({ ...device.attributes });
  const [saving, setSaving] = useState<boolean>(false);
  const { toast } = useToast();

  if (!canControl) return null;

  const save = async () => {
    setSaving(true);
    try {
      await updateDevice(device.id, {
        name: device.name, description: device.description,
        type: device.type, brand: device.brand, room: device.room,
        status: device.status, energyConsumption: device.energyConsumption,
        attributes: attrs,
      });
      toast.success('Paramètres mis à jour !');
      onUpdate();
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour');
    } finally { setSaving(false); }
  };

  const type = device.type?.toLowerCase();

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-title" style={{ marginBottom: 16 }}>🎛️ Contrôles</div>

      {type === 'thermostat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">🌡️ Température cible</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setAttrs((a: Record<string, string>) => ({ ...a, temperature_cible: String(parseInt(a.temperature_cible || '20') - 1) }))}>−</button>
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', minWidth: 60, textAlign: 'center' }}>
                {attrs.temperature_cible || '20'}°C
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setAttrs((a: Record<string, string>) => ({ ...a, temperature_cible: String(parseInt(a.temperature_cible || '20') + 1) }))}>+</button>
            </div>
          </div>
          <div>
            <label className="form-label">Mode</label>
            <select className="form-select" value={attrs.mode || 'Automatique'} onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, mode: e.target.value }))}>
              <option>Automatique</option><option>Manuel</option><option>Éco</option><option>Confort</option>
            </select>
          </div>
        </div>
      )}

      {type === 'lumière' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">💡 Luminosité ({attrs.luminosite || 100}%)</label>
            <input type="range" min="0" max="100" value={attrs.luminosite || 100}
              onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, luminosite: e.target.value }))}
              style={{ width: '100%', accentColor: 'var(--primary)' }} />
          </div>
          <div>
            <label className="form-label">🎨 Couleur</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={attrs.couleur || '#FFFFFF'}
                onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, couleur: e.target.value }))}
                style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{attrs.couleur || '#FFFFFF'}</span>
            </div>
          </div>
          <div>
            <label className="form-label">Mode</label>
            <select className="form-select" value={attrs.mode || 'Normal'} onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, mode: e.target.value }))}>
              <option>Normal</option><option>Nuit</option><option>Lecture</option><option>Cinéma</option><option>Fête</option>
            </select>
          </div>
        </div>
      )}

      {type === 'caméra' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>🎯 Détection de mouvement</span>
            <label className="toggle">
              <input type="checkbox" checked={attrs.detection_mouvement === 'activée'}
                onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, detection_mouvement: e.target.checked ? 'activée' : 'désactivée' }))} />
              <span className="toggle-slider" />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>🌙 Vision nocturne</span>
            <label className="toggle">
              <input type="checkbox" checked={attrs.vision_nocturne === 'activée'}
                onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, vision_nocturne: e.target.checked ? 'activée' : 'désactivée' }))} />
              <span className="toggle-slider" />
            </label>
          </div>
          <div>
            <label className="form-label">Résolution</label>
            <select className="form-select" value={attrs.resolution || '1080p'} onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, resolution: e.target.value }))}>
              <option>720p</option><option>1080p</option><option>4K</option>
            </select>
          </div>
        </div>
      )}

      {type === 'électroménager' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Programme</label>
            <select className="form-select" value={attrs.programme || 'Standard'}
              onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, programme: e.target.value }))}>
              <option>Cotton 60°</option><option>Synthétique 40°</option><option>Délicat 30°</option>
              <option>Rapide 15min</option><option>Éco</option><option>Standard</option>
            </select>
          </div>
        </div>
      )}

      {type === 'robot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Mode de nettoyage</label>
            <select className="form-select" value={attrs.mode || 'Auto'}
              onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, mode: e.target.value }))}>
              <option>Auto</option><option>Turbo</option><option>Silencieux</option><option>Spot</option><option>Retour base</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,212,255,0.04)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13 }}>🗺️ Carte activée</span>
            <label className="toggle">
              <input type="checkbox" checked={attrs.carte === 'Activée'}
                onChange={e => setAttrs((a: Record<string, string>) => ({ ...a, carte: e.target.checked ? 'Activée' : 'Désactivée' }))} />
              <span className="toggle-slider" />
            </label>
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(0,212,255,0.04)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>SUPERFICIE NETTOYÉE</div>
            <div style={{ color: 'var(--primary)', fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700 }}>{attrs.superficie_nettoyee || '0 m²'}</div>
          </div>
        </div>
      )}

      {type === 'prise' && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>
          Contrôlez l'alimentation via le bouton Actif/Inactif ci-dessus.
        </div>
      )}

      {type !== 'prise' && (
        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={save} disabled={saving}>
          {saving ? '...' : '💾 Appliquer les paramètres'}
        </button>
      )}
    </div>
  );
}

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const { toasts, toast } = useToast();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

  const canControl = canAccess('avancé');

  const load = () => {
    setLoading(true);
    getDevice(id!)
      .then(r => setDevice(r.data))
      .catch(() => navigate('/devices'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await toggleDevice(id!);
      toast.success(`Appareil ${res.data.status}`);
      load();
    } catch { toast.error('Erreur lors du changement de statut'); }
    finally { setToggling(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Chargement...</span></div>;
  if (!device) return null;

  const chartData = device.history?.slice(0, 20).reverse().map((h, i) => ({
    time: i + 1, value: h.value, unit: h.unit,
  }));

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>← Retour</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="device-type-icon" style={{ width: 60, height: 60, fontSize: 30 }}>{getDeviceIcon(device.type)}</div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>{device.name}</h2>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{device.uniqueId}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: device.status === 'actif' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{device.status === 'actif' ? '🟢' : '🔴'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{device.status === 'actif' ? 'Actif' : 'Inactif'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dernière activité: {formatDate(device.lastInteraction)}</div>
                </div>
              </div>
              {canControl && (
                <button className={`btn btn-sm ${device.status === 'actif' ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={handleToggle} disabled={toggling}>
                  {toggling ? '...' : device.status === 'actif' ? '⛔ Désactiver' : '✅ Activer'}
                </button>
              )}
            </div>

            {device.description && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{device.description}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([
                ['Type', device.type],
                ['Marque', device.brand ?? 'N/A'],
                ['Pièce', device.room ?? 'Non assigné'],
                ['Connectivité', device.connectivity ?? '—'],
                ['Signal', device.signalStrength ?? '—'],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} style={{ background: 'var(--bg-input, rgba(0,212,255,0.04))', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>📊 Métriques</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span>🔋 Batterie</span>
                  <strong>{device.batteryLevel}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${device.batteryLevel}%`,
                    background: device.batteryLevel > 50 ? 'var(--secondary)' : device.batteryLevel > 20 ? 'var(--accent)' : 'var(--danger)'
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-input, rgba(0,212,255,0.04))', borderRadius: 8, padding: 12 }}>
                <span style={{ fontSize: 13 }}>⚡ Consommation</span>
                <strong style={{ color: 'var(--accent)' }}>{device.energyConsumption?.toFixed(2)} kWh</strong>
              </div>
            </div>
          </div>
        </div>

        <div>
          <DeviceControls device={device} onUpdate={load} canControl={canControl} />
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>⚙️ Attributs actuels</div>
            {Object.keys(device.attributes || {}).length === 0 ? (
              <p className="text-muted text-small">Aucun attribut configuré</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(device.attributes).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-input, rgba(0,212,255,0.04))', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                    <strong style={{ fontSize: 13 }}>{v}</strong>
                  </div>
                ))}
              </div>
            )}
            {!canControl && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                🔒 Niveau avancé requis pour contrôler cet appareil
              </div>
            )}
          </div>
        </div>
      </div>

      {chartData && chartData.length > 0 && (
        <div className="chart-container">
          <div className="card-title" style={{ marginBottom: 16 }}>⚡ Historique de consommation</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: any, _: any, p: any) => [`${v} ${p.payload.unit}`, 'Consommation']} />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
