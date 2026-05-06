import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminUsers, validateUser, toggleUserActive, updateUserLevel, deleteAdminUser, getDeletionRequests, approveDeletion, rejectDeletion, getPlatformStats } from '../utils/api';
import { useToast, ToastContainer } from '../hooks/useToast';
import { formatDate } from '../utils/helpers';
import type { User, DeletionRequest, PlatformStats, Level } from '../types';

const LEVELS = ['débutant', 'intermédiaire', 'avancé', 'expert'];
const levelBadge = { 'débutant': 'badge-gray', 'intermédiaire': 'badge-green', 'avancé': 'badge-purple', 'expert': 'badge-amber' };

export function AdminUsersPage() {
  const { toasts, toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => getAdminUsers().then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handle = async (fn: () => Promise<any>, successMsg: string) => {
    try { await fn(); toast.success(successMsg); load(); }
    catch (err: any) { toast.error(err?.response?.data?.error || 'Erreur'); }
  };

  const filtered = users.filter(u =>
    (!search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (!filterLevel || u.level === filterLevel) &&
    (!filterStatus || (filterStatus === 'validated' ? u.isValidated : !u.isValidated))
  );

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🛡️ Gestion des utilisateurs</h2>
        <p className="text-muted">{users.filter(u => !u.isValidated).length} compte(s) en attente de validation</p>
      </div>

      {/* Pending validation banner */}
      {users.filter(u => !u.isValidated).length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ fontSize: 14 }}><strong>{users.filter(u => !u.isValidated).length} compte(s)</strong> en attente de validation</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="form-input" style={{ maxWidth: 260 }} placeholder="🔍 Nom, email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ maxWidth: 180 }} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value="">Tous niveaux</option>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="form-select" style={{ maxWidth: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tous statuts</option>
          <option value="validated">Validés</option>
          <option value="pending">En attente</option>
        </select>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Utilisateur</th><th>Type</th><th>Niveau</th><th>Points</th><th>Connexions</th><th>Statut</th><th>Inscrit le</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Aucun utilisateur</td></tr>}
                {filtered.map(u => (
                  <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.5 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 14 }}>{u.username?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{u.memberType}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`badge ${levelBadge[u.level] || 'badge-gray'}`}>{u.level}</span>
                        <select style={{ fontSize: 11, border: '1px solid var(--border)', borderRadius: 4, padding: '2px 4px', cursor: 'pointer' }}
                          value={u.level} onChange={e => handle(() => updateUserLevel(u.id, e.target.value), 'Niveau mis à jour')}>
                          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{u.points?.toFixed(2)}</td>
                    <td style={{ fontSize: 13 }}>{u.loginCount}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {!u.isValidated && <span className="badge badge-amber">⏳ En attente</span>}
                        {u.isValidated && <span className="badge badge-green">✅ Validé</span>}
                        {!u.isActive && <span className="badge badge-red">⛔ Inactif</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {!u.isValidated && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handle(() => validateUser(u.id), '✅ Compte validé')}>Valider</button>
                        )}
                        <button className={`btn btn-sm ${u.isActive ? 'btn-ghost' : 'btn-secondary'}`}
                          onClick={() => handle(() => toggleUserActive(u.id), u.isActive ? 'Compte désactivé' : 'Compte activé')}>
                          {u.isActive ? '⛔' : '✅'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm(`Supprimer ${u.username} ?`)) handle(() => deleteAdminUser(u.id), 'Utilisateur supprimé'); }}>🗑️</button>
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

export function AdminDeletionsPage() {
  const { toasts, toast } = useToast();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => getDeletionRequests().then(r => setRequests(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handle = async (fn: () => Promise<any>, msg: string) => {
    try { await fn(); toast.success(msg); load(); }
    catch (err: any) { toast.error(err?.response?.data?.error || 'Erreur'); }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🗑️ Demandes de suppression</h2>
        <p className="text-muted">{requests.length} demande(s) en attente</p>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : requests.length === 0 ? (
        <div className="card">
          <div className="empty-state"><div className="icon">✅</div><h3>Aucune demande en attente</h3></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map(r => (
            <div key={r.id} className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>🗑️ {r.deviceName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Demandé par <strong>{r.requester}</strong> · {formatDate(r.createdAt)}
                  </div>
                  {r.reason && (
                    <div style={{ fontSize: 13, background: 'var(--bg)', borderRadius: 8, padding: '8px 12px', marginTop: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Raison : </span>{r.reason}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-danger btn-sm" onClick={() => handle(() => approveDeletion(r.id), '✅ Appareil supprimé')}>✅ Approuver</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handle(() => rejectDeletion(r.id), 'Demande rejetée')}>✕ Rejeter</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminPlatformPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!stats) return null;

  const levelData = Object.entries(stats.usersByLevel || {}).map(([level, count]) => ({ level, count }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>📈 Vue d'ensemble plateforme</h2>
        <p className="text-muted">Rapports avancés et statistiques globales</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon purple">👥</div><div><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">Utilisateurs total</div></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div><div className="stat-value" style={{ color: 'var(--secondary)' }}>{stats.validatedUsers}</div><div className="stat-label">Comptes validés</div></div></div>
        <div className="stat-card"><div className="stat-icon amber">🔌</div><div><div className="stat-value">{stats.totalDevices}</div><div className="stat-label">Appareils enregistrés</div></div></div>
        <div className="stat-card"><div className="stat-icon red">🔔</div><div><div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.unreadAlerts}</div><div className="stat-label">Alertes non lues</div></div></div>
        <div className="stat-card"><div className="stat-icon purple">🔑</div><div><div className="stat-value">{stats.loginsLastWeek}</div><div className="stat-label">Connexions (7 jours)</div></div></div>
        <div className="stat-card"><div className="stat-icon red">⏳</div><div><div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.pendingDeletions}</div><div className="stat-label">Suppressions en attente</div></div></div>
      </div>

      {levelData.length > 0 && (
        <div className="chart-container">
          <div className="card-title" style={{ marginBottom: 16 }}>Répartition des utilisateurs par niveau</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="level" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--primary)" radius={[6,6,0,0]} label={{ position: 'top', fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
