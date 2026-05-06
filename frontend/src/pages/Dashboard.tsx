import { useState, useEffect } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDeviceStats, getAlerts, getDevices, toggleDevice } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { getDeviceIcon } from '../utils/helpers';
import { useToast, ToastContainer } from '../hooks/useToast';
import type { User, Device, DeviceStats, Alert } from '../types';

interface LvlInfo {
  color: string;
  next: string | null;
  needed: number | null;
  icon: string;
}

interface SimpleDashboardProps {
  user: User;
  stats: DeviceStats | null;
  alerts: Alert[];
}

function SimpleDashboard({ user, stats, alerts }: SimpleDashboardProps) {
  const navigate = useNavigate();
  const lvlInfo: Record<string, LvlInfo> = {
    'débutant':      { color: '#9ca3af',          next: 'intermédiaire', needed: 3,    icon: '🌱' },
    'intermédiaire': { color: 'var(--secondary)', next: 'avancé',        needed: 5,    icon: '📗' },
    'avancé':        { color: 'var(--primary)',   next: 'expert',        needed: 7,    icon: '⚡' },
    'expert':        { color: 'var(--accent)',    next: null,            needed: null, icon: '👑' },
  };
  const lvl: LvlInfo = lvlInfo[user?.level] ?? lvlInfo['débutant'];
  const progress = lvl.needed ? Math.min(((user?.points ?? 0) / lvl.needed) * 100, 100) : 100;

  return (
    <div>
      <div className="xp-bar" style={{ marginBottom: 24 }}>
        <div className="xp-header">
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Bienvenue, {user?.firstName || user?.username} {lvl.icon}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="xp-points">{user?.points?.toFixed(2)} pts</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Niveau: <strong style={{ color: 'white' }}>{user?.level}</strong></span>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {lvl.next ? <>Prochain: <strong style={{ color: lvl.color }}>{lvl.next}</strong> ({lvl.needed} pts)</> : '🏆 Niveau maximum'}
          </div>
        </div>
        <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="progress-fill" style={{ width: `${progress}%`, background: lvl.color }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, fontSize: 11 }}>
          {([['débutant', 1], ['intermédiaire', 3], ['avancé', 5], ['expert', 7]] as [string, number][]).map(([l, pts]) => (
            <span key={l} style={{
              padding: '3px 10px', borderRadius: 99, border: '1px solid',
              borderColor: user?.level === l ? lvl.color : 'rgba(255,255,255,0.15)',
              color: user?.level === l ? lvl.color : 'rgba(255,255,255,0.3)',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>{l} ({pts}pt)</span>
          ))}
        </div>
      </div>

      {stats && (
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card"><div className="stat-icon purple">🔌</div><div><div className="stat-value">{stats.total}</div><div className="stat-label">Appareils</div></div></div>
          <div className="stat-card"><div className="stat-icon green">✅</div><div><div className="stat-value" style={{ color: 'var(--secondary)' }}>{stats.active}</div><div className="stat-label">Actifs</div></div></div>
          <div className="stat-card"><div className="stat-icon red">⛔</div><div><div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.inactive}</div><div className="stat-label">Inactifs</div></div></div>
          <div className="stat-card"><div className="stat-icon amber">⚡</div><div><div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.totalEnergy} kWh</div><div className="stat-label">Consommation</div></div></div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🔔 Dernières alertes</div>
          {alerts.length === 0
            ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>✅ Aucune alerte</div>
            : alerts.slice(0, 4).map((a: Alert) => (
                <div key={a.id} className={`alert-item ${a.severity}`} style={{ marginBottom: 8 }}>
                  <div className={`alert-dot ${a.severity}`} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.deviceName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.message}</div>
                  </div>
                </div>
              ))
          }
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🚀 Accès rapide</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {([
              { icon: '🔌', label: 'Voir les appareils', path: '/devices' },
              { icon: '📰', label: 'Actualités',         path: '/news' },
              { icon: '👥', label: 'Membres',            path: '/members' },
              { icon: '👤', label: 'Mon profil',         path: '/profile' },
            ]).map(item => (
              <button key={item.path} className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => navigate(item.path)}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AdvancedDashboardProps {
  user: User;
  stats: DeviceStats | null;
  alerts: Alert[];
  navigate: NavigateFunction;
  toast: { success: (m: string) => void; error: (m: string) => void };
}

function AdvancedDashboard({ user, stats, alerts, navigate, toast }: AdvancedDashboardProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    getDevices({}).then(r => setDevices(r.data.slice(0, 8))).catch(() => {});
  }, []);

  const handleToggle = async (device: Device) => {
    setToggling(device.id);
    try {
      const res = await toggleDevice(device.id);
      setDevices(prev => prev.map(d =>
        d.id === device.id ? { ...d, status: res.data.status as 'actif' | 'inactif' } : d
      ));
      toast.success(`${device.name} : ${res.data.status}`);
    } catch { toast.error('Erreur'); }
    finally { setToggling(null); }
  };

  const lvlColor: Record<string, string> = { 'avancé': 'var(--primary)', 'expert': 'var(--accent)' };
  const col = lvlColor[user?.level] ?? 'var(--primary)';
  const icon = user?.level === 'expert' ? '👑' : '⚡';

  return (
    <div>
      <div style={{ background: 'var(--night, #1a1a2e)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>Tableau de bord — {user?.level?.toUpperCase()} {icon}</div>
          <div style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Bonjour, {user?.firstName || user?.username} 👋</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: col, fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)' }}>{user?.points?.toFixed(2)} pts</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{user?.loginCount} connexions · {user?.actionCount} actions</div>
        </div>
      </div>

      {stats && (
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card"><div className="stat-icon purple">🔌</div><div><div className="stat-value">{stats.total}</div><div className="stat-label">Appareils total</div></div></div>
          <div className="stat-card"><div className="stat-icon green">✅</div><div><div className="stat-value" style={{ color: 'var(--secondary)' }}>{stats.active}</div><div className="stat-label">Actifs</div></div></div>
          <div className="stat-card"><div className="stat-icon red">⛔</div><div><div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.inactive}</div><div className="stat-label">Inactifs</div></div></div>
          <div className="stat-card"><div className="stat-icon amber">⚡</div><div><div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.totalEnergy} kWh</div><div className="stat-label">Consommation</div></div></div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {stats?.energyTrend && (
          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="card-title">⚡ Énergie — 7 jours</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/stats')}>Voir plus →</button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats.energyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="card-title">🔔 Alertes</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>Voir tout →</button>
          </div>
          {alerts.length === 0
            ? <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>✅ Aucune alerte</div>
            : alerts.slice(0, 5).map((a: Alert) => (
                <div key={a.id} className={`alert-item ${a.severity}`} style={{ marginBottom: 6 }}>
                  <div className={`alert-dot ${a.severity}`} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.deviceName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{a.message}</div>
                  </div>
                </div>
              ))
          }
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="card-title">⚡ Contrôle rapide des appareils</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/devices')}>Voir tout →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {devices.map((d: Device) => (
            <div key={d.id} style={{
              background: d.status === 'actif' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.04)',
              border: `1px solid ${d.status === 'actif' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
              borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{getDeviceIcon(d.type)}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.room || d.type}</div>
                </div>
              </div>
              <label className="toggle" title={d.status === 'actif' ? 'Désactiver' : 'Activer'}>
                <input type="checkbox" checked={d.status === 'actif'} disabled={toggling === d.id} onChange={() => handleToggle(d)} />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, canAccess } = useAuth();
  const navigate = useNavigate();
  const { toasts, toast } = useToast();
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isAdvanced = canAccess('avancé');

  useEffect(() => {
    Promise.all([
      getDeviceStats(),
      isAdvanced ? getAlerts() : Promise.resolve({ data: [] as Alert[] })
    ]).then(([s, a]) => {
      setStats(s.data);
      setAlerts((a.data as Alert[]).slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Chargement...</span></div>;
  if (!user) return null;

  return (
    <div>
      <ToastContainer toasts={toasts} />
      {isAdvanced
        ? <AdvancedDashboard user={user} stats={stats} alerts={alerts} navigate={navigate} toast={toast} />
        : <SimpleDashboard user={user} stats={stats} alerts={alerts} />
      }
    </div>
  );
}
