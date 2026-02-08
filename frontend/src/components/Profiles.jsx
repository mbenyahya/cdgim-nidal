import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../ToastContext';

export default function Profiles({ data, onRefresh, canEdit }) {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [avgSalary, setAvgSalary] = useState('');
  const [levelNum, setLevelNum] = useState('');
  const [levelLabel, setLevelLabel] = useState('');
  const [levelSalary, setLevelSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [editingProfile, setEditingProfile] = useState(null);
  const [editProfileForm, setEditProfileForm] = useState({ name: '', code: '', avgSalary: '' });
  const [editingLevel, setEditingLevel] = useState(null);
  const [editLevelForm, setEditLevelForm] = useState({ number: '', label: '', avgSalary: '' });

  const profiles = data?.profiles || [];
  const levels = data?.levels || [];

  const filteredProfiles = searchQ.trim()
    ? profiles.filter((p) => [p.name, p.code].some((v) => v && String(v).toLowerCase().includes(searchQ.trim().toLowerCase())))
    : profiles;

  const submitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/profiles', { method: 'POST', body: JSON.stringify({ name, code, avgSalary: parseFloat(avgSalary) || 0 }) });
      setName(''); setCode(''); setAvgSalary('');
      await onRefresh();
      addToast('Profil créé');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitLevel = async (e) => {
    e.preventDefault();
    if (!levelNum || levelNum < 1 || levelNum > 8) { addToast('Numéro 1-8 requis', 'error'); return; }
    setLoading(true);
    try {
      await api('/levels', { method: 'POST', body: JSON.stringify({ number: parseInt(levelNum), label: levelLabel, avgSalary: parseFloat(levelSalary) || 0 }) });
      setLevelNum(''); setLevelLabel(''); setLevelSalary('');
      await onRefresh();
      addToast('Niveau créé');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditProfile = (p) => {
    setEditingProfile(p.id);
    setEditProfileForm({ name: p.name || '', code: p.code || '', avgSalary: p.avgSalary ?? '' });
  };

  const saveEditProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/profiles/${editingProfile}`, { method: 'PUT', body: JSON.stringify({ name: editProfileForm.name, code: editProfileForm.code, avgSalary: parseFloat(editProfileForm.avgSalary) || 0 }) });
      setEditingProfile(null);
      await onRefresh();
      addToast('Profil modifié');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditLevel = (l) => {
    setEditingLevel(l.id);
    setEditLevelForm({ number: l.number, label: l.label || '', avgSalary: l.avgSalary ?? '' });
  };

  const saveEditLevel = async (e) => {
    e.preventDefault();
    if (!editLevelForm.number || editLevelForm.number < 1 || editLevelForm.number > 8) { addToast('Numéro 1-8 requis', 'error'); return; }
    setLoading(true);
    try {
      await api(`/levels/${editingLevel}`, { method: 'PUT', body: JSON.stringify({ number: parseInt(editLevelForm.number), label: editLevelForm.label, avgSalary: parseFloat(editLevelForm.avgSalary) || 0 }) });
      setEditingLevel(null);
      await onRefresh();
      addToast('Niveau modifié');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (id) => {
    if (!confirm('Supprimer ce profil ?')) return;
    try {
      await api(`/profiles/${id}`, { method: 'DELETE' });
      await onRefresh();
      addToast('Profil supprimé');
    } catch (e) {
      addToast(e.message || 'Erreur', 'error');
    }
  };

  const deleteLevel = async (id) => {
    if (!confirm('Supprimer ce niveau ?')) return;
    try {
      await api(`/levels/${id}`, { method: 'DELETE' });
      await onRefresh();
      addToast('Niveau supprimé');
    } catch (e) {
      addToast(e.message || 'Erreur', 'error');
    }
  };

  return (
    <>
      <div className="info-box"><div className="info-box-title">🎯 Profils et Niveaux</div><div className="info-box-content">Définissez les profils métiers et niveaux (1-8) pour les grilles TJM.</div></div>
      {canEdit && (
        <div className="grid-2col">
          <div className="form-card">
            <h2 className="form-title">➕ Ajouter un Profil</h2>
            <form onSubmit={submitProfile}>
              <div className="form-grid">
                <div className="form-group"><label>Nom *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Développeur Junior" required /></div>
                <div className="form-group"><label>Code *</label><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: DEV_JR" required /></div>
                <div className="form-group"><label>Salaire moyen (MAD)</label><input type="number" value={avgSalary} onChange={(e) => setAvgSalary(e.target.value)} min={0} step={100} /></div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
            </form>
          </div>
          <div className="form-card">
            <h2 className="form-title">➕ Ajouter un Niveau (1-8)</h2>
            <form onSubmit={submitLevel}>
              <div className="form-grid">
                <div className="form-group"><label>Numéro *</label><input type="number" value={levelNum} onChange={(e) => setLevelNum(e.target.value)} min={1} max={8} required /></div>
                <div className="form-group"><label>Libellé</label><input value={levelLabel} onChange={(e) => setLevelLabel(e.target.value)} placeholder="Ex: Expert" /></div>
                <div className="form-group"><label>Salaire moyen (MAD)</label><input type="number" value={levelSalary} onChange={(e) => setLevelSalary(e.target.value)} min={0} /></div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
            </form>
          </div>
        </div>
      )}
      <div className="search-filters">
        <input type="search" placeholder="Rechercher profils (nom, code)…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
      </div>
      <div className="grid-2col">
        <div className="table-container">
          <div className="table-header"><div className="table-title">👤 Profils</div></div>
          <table><thead><tr><th>Nom</th><th>Code</th><th>Salaire moyen (MAD)</th>{canEdit && <th>Actions</th>}</tr></thead>
            <tbody>{filteredProfiles.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td><span className="badge badge-profile">{p.code}</span></td>
                <td>{(p.avgSalary || 0).toLocaleString('fr-FR')}</td>
                {canEdit && (
                  <td>
                    <button type="button" className="btn btn-secondary btn-small" onClick={() => openEditProfile(p)}>Modifier</button>
                    {' '}
                    <button type="button" className="btn btn-danger btn-small" onClick={() => deleteProfile(p.id)}>Supprimer</button>
                  </td>
                )}
              </tr>
            ))}</tbody>
          </table>
          {!filteredProfiles.length && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>{searchQ ? 'Aucun résultat' : 'Aucun profil'}</div>}
        </div>
        <div className="table-container">
          <div className="table-header"><div className="table-title">📊 Niveaux</div></div>
          <table><thead><tr><th>Niveau</th><th>Libellé</th><th>Salaire moyen (MAD)</th>{canEdit && <th>Actions</th>}</tr></thead>
            <tbody>{levels.map((l) => (
              <tr key={l.id}>
                <td>Niveau {l.number}</td>
                <td>{l.label || '-'}</td>
                <td>{(l.avgSalary || 0).toLocaleString('fr-FR')}</td>
                {canEdit && (
                  <td>
                    <button type="button" className="btn btn-secondary btn-small" onClick={() => openEditLevel(l)}>Modifier</button>
                    {' '}
                    <button type="button" className="btn btn-danger btn-small" onClick={() => deleteLevel(l.id)}>Supprimer</button>
                  </td>
                )}
              </tr>
            ))}</tbody>
          </table>
          {!levels.length && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucun niveau</div>}
        </div>
      </div>
      {editingProfile != null && (
        <div className="modal-overlay" onClick={() => setEditingProfile(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Modifier le profil</h3>
            <form onSubmit={saveEditProfile}>
              <div className="form-grid">
                <div className="form-group"><label>Nom *</label><input value={editProfileForm.name} onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })} required /></div>
                <div className="form-group"><label>Code *</label><input value={editProfileForm.code} onChange={(e) => setEditProfileForm({ ...editProfileForm, code: e.target.value })} required /></div>
                <div className="form-group"><label>Salaire moyen (MAD)</label><input type="number" value={editProfileForm.avgSalary} onChange={(e) => setEditProfileForm({ ...editProfileForm, avgSalary: e.target.value })} min={0} /></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingProfile(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingLevel != null && (
        <div className="modal-overlay" onClick={() => setEditingLevel(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Modifier le niveau</h3>
            <form onSubmit={saveEditLevel}>
              <div className="form-grid">
                <div className="form-group"><label>Numéro *</label><input type="number" value={editLevelForm.number} onChange={(e) => setEditLevelForm({ ...editLevelForm, number: e.target.value })} min={1} max={8} required /></div>
                <div className="form-group"><label>Libellé</label><input value={editLevelForm.label} onChange={(e) => setEditLevelForm({ ...editLevelForm, label: e.target.value })} /></div>
                <div className="form-group"><label>Salaire moyen (MAD)</label><input type="number" value={editLevelForm.avgSalary} onChange={(e) => setEditLevelForm({ ...editLevelForm, avgSalary: e.target.value })} min={0} /></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingLevel(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
