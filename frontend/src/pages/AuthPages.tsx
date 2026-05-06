import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi, register as registerApi } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import type { LoginForm, RegisterForm } from '../types';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse at 30% 40%, rgba(0,212,255,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(168,85,247,0.04) 0%, transparent 50%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🏠</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', padding: '4px 14px', borderRadius: 99, marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)', display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>SmartHome System</span>
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>{title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{subtitle}</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 12, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.05)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await loginApi(form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Identifiants incorrects');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Authentification" subtitle="Accès sécurisé à la plateforme">
      {error && (
        <div style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.25)', borderLeft: '3px solid var(--danger)', borderRadius: 6, padding: '9px 12px', marginBottom: 16, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠ {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Identifiant ou email</label>
          <input className="form-input" placeholder="admin" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 6, justifyContent: 'center' }}>
          {loading ? '...' : '→ Se connecter'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'var(--text-muted)' }}>
        Pas de compte ? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>S'inscrire</Link>
      </div>
      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(0,212,255,0.03)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Comptes de test</div>
        admin / Admin123! &nbsp;·&nbsp; marie / Password123!<br />
        lucas / Password123! &nbsp;·&nbsp; emma / Password123!
      </div>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({ username: '', email: '', password: '', firstName: '', lastName: '', memberType: 'membre', age: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await registerApi(form);
      setSuccess('Inscription réussie ! Un administrateur doit valider votre compte.');
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Erreur d'inscription");
    } finally { setLoading(false); }
  };

  if (success) return (
    <AuthLayout title="Inscription" subtitle="Demande envoyée">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
        <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--secondary)' }}>Demande soumise</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>{success}</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>→ Se connecter</button>
      </div>
    </AuthLayout>
  );

  return (
    <AuthLayout title="Créer un accès" subtitle="Demande d'inscription à la plateforme">
      {error && (
        <div style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.25)', borderLeft: '3px solid var(--danger)', borderRadius: 6, padding: '9px 12px', marginBottom: 16, fontSize: 13, color: 'var(--danger)' }}>
          ⚠ {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" placeholder="Marie" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Nom</label><input className="form-input" placeholder="Dupont" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label className="form-label">Identifiant *</label><input className="form-input" placeholder="marie_d" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div>
        <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="marie@maison.fr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
        <div className="form-group"><label className="form-label">Mot de passe * (8 min.)</label><input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Type</label>
            <select className="form-select" value={form.memberType} onChange={e => setForm(f => ({ ...f, memberType: e.target.value }))}>
              <option value="père">Père</option><option value="mère">Mère</option><option value="enfant">Enfant</option><option value="membre">Autre</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Âge</label><input className="form-input" type="number" min="1" max="120" placeholder="30" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} /></div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? '...' : '→ Soumettre la demande'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Se connecter</Link>
      </div>
    </AuthLayout>
  );
}
