import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicMembers } from '../utils/api';
import { formatDate } from '../utils/helpers';
import type { PublicMember, Level } from '../types';

const LEVEL_COLOR: Record<string, { badge: string; bg: string }> = {
  'débutant': { badge: 'badge-gray', bg: '#9ca3af' },
  'intermédiaire': { badge: 'badge-green', bg: 'var(--secondary)' },
  'avancé': { badge: 'badge-purple', bg: 'var(--primary)' },
  'expert': { badge: 'badge-amber', bg: 'var(--accent)' },
};

const LEVEL_POINTS: Record<string, number> = { 'débutant': 1, 'intermédiaire': 3, 'avancé': 5, 'expert': 7 };
const LEVELS = ['débutant', 'intermédiaire', 'avancé', 'expert'];

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<PublicMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicMembers().then(r => {
      const found = r.data.find(m => String(m.id) === String(id));
      setMember(found || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Chargement...</span></div>;
  if (!member) return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>← Retour</button>
      <div className="empty-state"><div className="icon">👤</div><h3>Membre introuvable</h3></div>
    </div>
  );

  const lvlIdx = LEVELS.indexOf(member.level);
  const nextLevel = LEVELS[lvlIdx + 1];
  const nextPts = nextLevel ? LEVEL_POINTS[nextLevel] : null;
  const progress = nextPts ? Math.min((member.points / nextPts) * 100, 100) : 100;
  const lvlColor = LEVEL_COLOR[member.level] || LEVEL_COLOR['débutant'];

  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>← Retour</button>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* Carte profil */}
        <div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%', background: lvlColor.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38, fontWeight: 700, color: 'white', margin: '0 auto 16px',
              boxShadow: `0 0 24px ${lvlColor.bg}44`
            }}>
              {member.username?.[0]?.toUpperCase()}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>@{member.username}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>
              {member.memberType} {member.age ? `· ${member.age} ans` : ''}
              {member.gender ? ` · ${member.gender}` : ''}
            </div>
            <span className={`badge ${lvlColor.badge}`} style={{ fontSize: 13, padding: '4px 14px' }}>{member.level}</span>
          </div>

          {/* XP */}
          <div style={{ background: 'var(--night)', borderRadius: 14, padding: '16px 20px', color: 'white' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>POINTS D'EXPÉRIENCE</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', color: lvlColor.bg }}>
              {member.points?.toFixed(2)} pts
            </div>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.1)', marginTop: 10 }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: lvlColor.bg }} />
            </div>
            {nextLevel && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                Prochain niveau : {nextLevel} ({nextPts} pts requis)
              </div>
            )}
            {!nextLevel && (
              <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6 }}>👑 Niveau maximum atteint</div>
            )}
          </div>
        </div>

        {/* Infos publiques */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>📋 Informations publiques</div>
            <div className="grid-2">
              {[
                ['Pseudonyme', `@${member.username}`],
                ['Type de membre', member.memberType],
                ['Âge', member.age ? `${member.age} ans` : 'N/A'],
                ['Genre', member.gender || 'Non précisé'],
                ['Niveau', member.level],
                ['Points XP', `${member.points?.toFixed(2)} pts`],
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progression niveaux */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>🏅 Progression</div>
            {LEVELS.map((lvl, i) => (
              <div key={lvl} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: i < LEVELS.length - 1 ? '1px solid var(--border-light)' : 'none'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  background: i <= lvlIdx ? (LEVEL_COLOR[lvl]?.bg || 'var(--primary)') : 'var(--bg)',
                  color: i <= lvlIdx ? 'white' : 'var(--text-muted)'
                }}>{i <= lvlIdx ? '✓' : i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: i === lvlIdx ? (LEVEL_COLOR[lvl]?.bg || 'var(--primary)') : 'var(--text-primary)' }}>
                    {lvl} {i === lvlIdx && '← niveau actuel'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{LEVEL_POINTS[lvl]} point(s) requis</div>
                </div>
                {i <= lvlIdx && <span style={{ fontSize: 18 }}>✅</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
