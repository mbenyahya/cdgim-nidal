import React, { useState, useEffect, useCallback } from 'react';
import { api, ROLES_LABELS, setToken } from './api';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider, useToast } from './ToastContext';
import Dashboard from './components/Dashboard';
import Profiles from './components/Profiles';
import Tjm from './components/Tjm';
import Resources from './components/Resources';
import Clients from './components/Clients';
import Charges from './components/Charges';
import Settings from './components/Settings';
import Billing from './components/Billing';
import Projects from './components/Projects';
import Assignments from './components/Assignments';
import UserGuide from './components/UserGuide';

const TABS = [
  { id: 'dashboard', label: '📊 Dashboard', icon: 'dashboard' },
  { id: 'profiles', label: '👤 Profils & Niveaux', icon: 'profiles' },
  { id: 'tjm', label: '📋 Grilles TJM', icon: 'tjm' },
  { id: 'resources', label: '👥 Ressources', icon: 'resources' },
  { id: 'clients', label: '🏢 Clients/BU', icon: 'clients' },
  { id: 'projects', label: '📁 Projets', icon: 'projects' },
  { id: 'assignments', label: '🔗 Assignations', icon: 'assignments' },
  { id: 'charges', label: '💳 Charges Refacturables', icon: 'charges' },
  { id: 'billing', label: '💰 Facturation', icon: 'billing' },
  { id: 'settings', label: '⚙️ Paramètres', icon: 'settings' },
  { id: 'guide', label: '📘 Guide utilisateur', icon: 'guide' },
];

function LoginScreen() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username: username.trim(), password }) });
      setToken(res.access_token);
      login({ username: res.username, role: res.role, resourceId: res.resourceId }, res.access_token);
      addToast('Connexion réussie');
    } catch (err) {
      const msg = err.message || 'Identifiants incorrects ou backend indisponible (port 8080).';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen">
      <div id="login-box">
        <h2>🔐 Connexion CGDim</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Votre nom" required />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" required />
          </div>
          {error && <p style={{ color: '#ef4444', marginBottom: 12, fontSize: 14 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
        </form>
        <p style={{ fontSize: 12, color: '#888', marginTop: 12 }}>Par défaut : admin / admin</p>
      </div>
    </div>
  );
}

function MainApp() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({ profiles: [], levels: [], tjm: { grids: { profile: {}, level: {} } }, resources: [], clients: [], projects: [], assignments: [], charges: [], settings: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [profiles, levels, tjm, resources, clients, projects, assignments, charges, settings] = await Promise.all([
        api('/profiles'), api('/levels'), api('/tjm'), api('/resources'), api('/clients'), api('/projects'), api('/assignments'), api('/charges'), api('/settings'),
      ]);
      setData({
        profiles: profiles || [],
        levels: (levels || []).sort((a, b) => a.number - b.number),
        tjm: tjm || { grids: { profile: {}, level: {} } },
        resources: resources || [],
        clients: clients || [],
        projects: projects || [],
        assignments: assignments || [],
        charges: charges || [],
        settings: settings || {},
      });
    } catch (err) {
      setError(err.message || 'Erreur chargement');
      if (err.message === 'Session expirée') logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const showSettings = user?.role !== 'user';
  const canEdit = user?.role === 'admin' || user?.role === 'expert';

  return (
    <>
      <div className="header">
        <div>
          <h1>💼 CGDim - Système Complet de Pilotage Financier</h1>
          <p>Grilles TJM modulables, charges refacturables, répartition indirecte</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="user-badge">{user?.username} • {ROLES_LABELS[user?.role] || user?.role}</span>
          <button type="button" className="btn btn-logout" onClick={logout}>Déconnexion</button>
        </div>
      </div>
      <div className="container">
        <div className="nav-tabs">
          {TABS.filter(t => t.id !== 'settings' || showSettings).map((t) => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        {loading && <p style={{ padding: 20 }}>Chargement...</p>}
        {error && !loading && <div className="info-box" style={{ borderColor: '#ef4444' }}>{error}</div>}
        {!loading && !error && (
          <>
            {tab === 'dashboard' && <Dashboard data={data} onRefresh={loadData} />}
            {tab === 'profiles' && <Profiles data={data} onRefresh={loadData} canEdit={canEdit} />}
            {tab === 'tjm' && <Tjm data={data} onRefresh={loadData} canEdit={canEdit} />}
            {tab === 'resources' && <Resources data={data} onRefresh={loadData} canEdit={canEdit} />}
            {tab === 'clients' && <Clients data={data} onRefresh={loadData} canEdit={canEdit} />}
            {tab === 'projects' && <Projects data={data} onRefresh={loadData} canEdit={canEdit} />}
            {tab === 'assignments' && <Assignments data={data} onRefresh={loadData} canEdit={canEdit} />}
            {tab === 'charges' && <Charges data={data} onRefresh={loadData} canEdit={canEdit} />}
            {tab === 'billing' && <Billing data={data} />}
            {tab === 'settings' && <Settings data={data} onRefresh={loadData} canEdit={canEdit} isAdmin={user?.role === 'admin'} />}
            {tab === 'guide' && <UserGuide />}
          </>
        )}
      </div>
    </>
  );
}

function AppRoot() {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;
  return <MainApp />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoot />
      </AuthProvider>
    </ToastProvider>
  );
}
