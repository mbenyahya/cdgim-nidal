import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../ToastContext';

export default function Tjm({ data, onRefresh, canEdit }) {
  const { addToast } = useToast();
  const [profileId, setProfileId] = useState('');
  const [profileValue, setProfileValue] = useState('');
  const [levelId, setLevelId] = useState('');
  const [levelValue, setLevelValue] = useState('');
  const [loading, setLoading] = useState(false);
  const profiles = data?.profiles || [];
  const levels = data?.levels || [];
  const tjm = data?.tjm || {};
  const grids = tjm.grids || { profile: {}, level: {} };
  const model = tjm.tjmModel || data?.settings?.tjmModel || 'profile';

  const setModel = async (val) => {
    try { await api('/tjm/model', { method: 'PUT', body: JSON.stringify({ tjmModel: val }) }); await onRefresh(); addToast('Modèle TJM mis à jour'); } catch (e) { addToast(e.message || 'Erreur', 'error'); }
  };
  const submitProfile = async (e) => {
    e.preventDefault();
    if (!profileId) return;
    setLoading(true);
    try { await api(`/tjm/profile/${profileId}`, { method: 'POST', body: JSON.stringify({ value: parseFloat(profileValue), date: new Date().toISOString().slice(0, 10) }) }); setProfileId(''); setProfileValue(''); await onRefresh(); addToast('TJM profil enregistré'); } catch (err) { addToast(err.message || 'Erreur', 'error'); } finally { setLoading(false); }
  };
  const submitLevel = async (e) => {
    e.preventDefault();
    if (!levelId) return;
    setLoading(true);
    try { await api(`/tjm/level/${levelId}`, { method: 'POST', body: JSON.stringify({ value: parseFloat(levelValue), date: new Date().toISOString().slice(0, 10) }) }); setLevelId(''); setLevelValue(''); await onRefresh(); addToast('TJM niveau enregistré'); } catch (err) { addToast(err.message || 'Erreur', 'error'); } finally { setLoading(false); }
  };

  return (
    <>
      <div className="info-box"><div className="info-box-title">📋 Grilles TJM</div><div className="info-box-content">Par Profil (2026) ou par Niveau (2027+).</div></div>
      {canEdit && (
        <div className="form-card">
          <h2 className="form-title">Modèle actif</h2>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="profile">Par Profil (2026)</option>
            <option value="level">Par Niveau (2027+)</option>
          </select>
        </div>
      )}
      {model === 'profile' && (
        <>
          {canEdit && (
            <div className="form-card">
              <h2 className="form-title">💰 TJM par Profil</h2>
              <form onSubmit={submitProfile}>
                <div className="form-grid">
                  <div className="form-group"><label>Profil</label><select value={profileId} onChange={(e) => setProfileId(e.target.value)} required><option value="">Sélectionner...</option>{profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                  <div className="form-group"><label>TJM (EUR)</label><input type="number" value={profileValue} onChange={(e) => setProfileValue(e.target.value)} min={0} step={10} required /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>Définir</button>
              </form>
            </div>
          )}
          <div className="table-container">
            <div className="table-header"><div className="table-title">Grille TJM par Profil</div></div>
            <table><thead><tr><th>Profil</th><th>TJM (EUR)</th></tr></thead>
              <tbody>{Object.entries(grids.profile || {}).map(([id, v]) => { const p = profiles.find((x) => String(x.id) === id); return p ? <tr key={id}><td>{p.name}</td><td><strong>{v.value} €</strong></td></tr> : null; })}</tbody>
            </table>
          </div>
        </>
      )}
      {model === 'level' && (
        <>
          {canEdit && (
            <div className="form-card">
              <h2 className="form-title">💰 TJM par Niveau</h2>
              <form onSubmit={submitLevel}>
                <div className="form-grid">
                  <div className="form-group"><label>Niveau</label><select value={levelId} onChange={(e) => setLevelId(e.target.value)} required><option value="">Sélectionner...</option>{levels.map((l) => <option key={l.id} value={l.id}>Niveau {l.number}</option>)}</select></div>
                  <div className="form-group"><label>TJM (EUR)</label><input type="number" value={levelValue} onChange={(e) => setLevelValue(e.target.value)} min={0} step={10} required /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>Définir</button>
              </form>
            </div>
          )}
          <div className="table-container">
            <div className="table-header"><div className="table-title">Grille TJM par Niveau</div></div>
            <table><thead><tr><th>Niveau</th><th>TJM (EUR)</th></tr></thead>
              <tbody>{Object.entries(grids.level || {}).map(([id, v]) => { const l = levels.find((x) => String(x.id) === id); return l ? <tr key={id}><td>Niveau {l.number}</td><td><strong>{v.value} €</strong></td></tr> : null; })}</tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
