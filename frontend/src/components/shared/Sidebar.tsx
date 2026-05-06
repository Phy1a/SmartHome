import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getPoints } from '../../utils/api';
import { useEffect, useState, useCallback } from 'react';
import type { Level, PointsResponse } from '../../types';

function getLevelKey(level: Level): string {
  const map: Record<Level, string> = {
    'débutant': 'debutant',
    'intermédiaire': 'intermediaire',
    'avancé': 'avance',
    expert: 'expert',
  };
  return map[level] ?? 'debutant';
}

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      {label}
    </button>
  );
}

interface XpMiniProps {
  points: number;
  level: Level;
}

function XpMini({ points, level }: XpMiniProps) {
  const thresholds: Record<Level, [number, number]> = {
    'débutant': [0, 3],
    'intermédiaire': [3, 5],
    'avancé': [5, 7],
    expert: [7, 7],
  };
  const [min, max] = thresholds[level] ?? [0, 3];
  const pct = level === 'expert' ? 100 : Math.min(((points - min) / (max - min)) * 100, 100);

  const lvlColor: Record<Level, string> = {
    'débutant': '#888',
    'intermédiaire': 'var(--secondary)',
    'avancé': 'var(--primary)',
    expert: 'var(--accent)',
  };
  const col = lvlColor[level] ?? 'var(--primary)';

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--mono)', color: col, fontWeight: 700 }}>{points.toFixed(2)} pts</span>
        {level !== 'expert' && <span>{max} pts requis</span>}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 99, transition: 'width 0.5s ease', boxShadow: `0 0 6px ${col}88` }} />
      </div>
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, logout, canAccess } = useAuth();
  const [livePoints, setLivePoints] = useState<number>(user?.points ?? 0);
  const [liveLevel, setLiveLevel] = useState<Level>((user?.level as Level) ?? 'débutant');
  const [pulse, setPulse] = useState<boolean>(false);

  const refreshPoints = useCallback(() => {
    if (!user) return;
    getPoints()
      .then((r) => {
        const data: PointsResponse = r.data;
        if (data.points !== livePoints) {
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
        }
        setLivePoints(data.points);
        setLiveLevel(data.level);
        if (setUser) {
          setUser(prev => prev ? { ...prev, points: data.points, level: data.level } : prev);
        }
      })
      .catch(() => {});
  }, [location.pathname, user]);

  useEffect(() => {
    refreshPoints();
  }, [location.pathname]);

  const go = (path: string) => navigate(path);
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🏠</div>
          <div>
            <div className="logo-text">SmartHome</div>
            <div className="logo-sub">IoT Platform</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Information</div>
        <NavItem icon="📰" label="Actualités" active={isActive('/news')} onClick={() => go('/news')} />
        <NavItem icon="👥" label="Membres" active={isActive('/members')} onClick={() => go('/members')} />

        <div className="nav-section-label">Visualisation</div>
        <NavItem icon="⬛" label="Tableau de bord" active={isActive('/dashboard')} onClick={() => go('/dashboard')} />
        <NavItem icon="🔌" label="Appareils" active={isActive('/devices')} onClick={() => go('/devices')} />
        <NavItem icon="👤" label="Mon Profil" active={isActive('/profile')} onClick={() => go('/profile')} />

        {canAccess('avancé') && (
          <>
            <div className="nav-section-label">Gestion</div>
            <NavItem icon="⚙️" label="Gérer Appareils" active={isActive('/manage-devices')} onClick={() => go('/manage-devices')} />
            <NavItem icon="📊" label="Statistiques" active={isActive('/stats')} onClick={() => go('/stats')} />
            <NavItem icon="🔔" label="Alertes" active={isActive('/alerts')} onClick={() => go('/alerts')} />
          </>
        )}

        {canAccess('expert') && (
          <>
            <div className="nav-section-label">Administration</div>
            <NavItem icon="🛡️" label="Utilisateurs" active={isActive('/admin/users')} onClick={() => go('/admin/users')} />
            <NavItem icon="🗑️" label="Suppressions" active={isActive('/admin/deletions')} onClick={() => go('/admin/deletions')} />
            <NavItem icon="📈" label="Plateforme" active={isActive('/admin/platform')} onClick={() => go('/admin/platform')} />
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="user-card-sidebar">
          <div className="user-avatar">{user.username?.[0]?.toUpperCase() ?? '?'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.username}
            </div>
            <span className={`user-level level-${getLevelKey(liveLevel)}`}>{liveLevel}</span>
          </div>
          <button
            onClick={logout}
            title="Déconnexion"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: 4, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ⇥
          </button>
        </div>
        <div style={{ opacity: pulse ? 0.6 : 1, transition: 'opacity 0.3s' }}>
          <XpMini points={livePoints} level={liveLevel} />
        </div>
        {pulse && (
          <div style={{ fontSize: 10, color: 'var(--primary)', marginTop: 4, textAlign: 'center' }}>
            +0.01 pt
          </div>
        )}
      </div>
    </aside>
  );
}
