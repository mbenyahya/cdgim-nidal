import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../ToastContext';

export default function Projects({ data, onRefresh, canEdit }) {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clientId, setClientId] = useState('');
  const [billingType, setBillingType] = useState('TJM');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', clientId: '', billingType: 'TJM', startDate: '', endDate: '', status: 'ACTIVE' });
  const projects = data?.projects || [];
  const clients = data?.clients || [];

  const filtered = searchQ.trim()
    ? projects.filter((p) =>
        [p.name, p.code].some((v) => v && String(v).toLowerCase().includes(searchQ.trim().toLowerCase()))
      )
    : projects;

  const clientName = (id) => clients.find((c) => String(c.id) === String(id))?.name || id;

  const submit = async (e) => {
    e.preventDefault();
    if (!clientId) { addToast('Choisir un client', 'error'); return; }
    setLoading(true);
    try {
      await api('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name,
          code,
          clientId: Number(clientId),
          billingType,
          startDate: startDate || null,
          endDate: endDate || null,
          status,
        }),
      });
      setName(''); setCode(''); setClientId(''); setStartDate(''); setEndDate('');
      await onRefresh();
      addToast('Projet créé');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setEditForm({
      name: p.name || '',
      code: p.code || '',
      clientId: String(p.clientId || ''),
      billingType: p.billingType || 'TJM',
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      status: p.status || 'ACTIVE',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/projects/${editing}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editForm,
          clientId: editForm.clientId ? Number(editForm.clientId) : null,
        }),
      });
      setEditing(null);
      await onRefresh();
      addToast('Projet modifié');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Supprimer ce projet ?')) return;
    try {
      await api(`/projects/${id}`, { method: 'DELETE' });
      await onRefresh();
      addToast('Projet supprimé');
    } catch (e) {
      addToast(e.message || 'Erreur', 'error');
    }
  };

  return (
    <>
      {canEdit && (
        <div className="form-card">
          <h2 className="form-title">➕ Ajouter un Projet</h2>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group"><label>Nom *</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="form-group"><label>Code *</label><input value={code} onChange={(e) => setCode(e.target.value)} required /></div>
              <div className="form-group">
                <label>Client *</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                  <option value="">— Choisir —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Facturation</label>
                <select value={billingType} onChange={(e) => setBillingType(e.target.value)}>
                  <option value="TJM">TJM</option>
                  <option value="ACTE">À l'acte</option>
                  <option value="FORFAIT">Forfait</option>
                </select>
              </div>
              <div className="form-group"><label>Début</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div className="form-group"><label>Fin</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              <div className="form-group">
                <label>Statut</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="ACTIVE">Actif</option>
                  <option value="CLOSED">Clôturé</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
          </form>
        </div>
      )}
      <div className="search-filters">
        <input type="search" placeholder="Rechercher (nom, code)…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
      </div>
      <div className="table-container">
        <div className="table-header"><div className="table-title">📁 Projets</div></div>
        <table>
          <thead><tr><th>Nom</th><th>Code</th><th>Client</th><th>Facturation</th><th>Début</th><th>Fin</th><th>Statut</th>{canEdit && <th>Actions</th>}</tr></thead>
          <tbody>{filtered.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td><span className="badge badge-profile">{p.code}</span></td>
              <td>{clientName(p.clientId)}</td>
              <td>{p.billingType || 'TJM'}</td>
              <td>{p.startDate || '-'}</td>
              <td>{p.endDate || '-'}</td>
              <td>{p.status || 'ACTIVE'}</td>
              {canEdit && (
                <td>
                  <button type="button" className="btn btn-secondary btn-small" onClick={() => openEdit(p)}>Modifier</button>
                  {' '}
                  <button type="button" className="btn btn-danger btn-small" onClick={() => deleteProject(p.id)}>Supprimer</button>
                </td>
              )}
            </tr>
          ))}</tbody>
        </table>
        {!filtered.length && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>{searchQ ? 'Aucun résultat' : 'Aucun projet'}</div>}
      </div>
      {editing != null && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Modifier le projet</h3>
            <form onSubmit={saveEdit}>
              <div className="form-grid">
                <div className="form-group"><label>Nom *</label><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required /></div>
                <div className="form-group"><label>Code *</label><input value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} required /></div>
                <div className="form-group">
                  <label>Client *</label>
                  <select value={editForm.clientId} onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })} required>
                    <option value="">— Choisir —</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Facturation</label>
                  <select value={editForm.billingType} onChange={(e) => setEditForm({ ...editForm, billingType: e.target.value })}>
                    <option value="TJM">TJM</option>
                    <option value="ACTE">À l'acte</option>
                    <option value="FORFAIT">Forfait</option>
                  </select>
                </div>
                <div className="form-group"><label>Début</label><input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} /></div>
                <div className="form-group"><label>Fin</label><input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} /></div>
                <div className="form-group">
                  <label>Statut</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="ACTIVE">Actif</option>
                    <option value="CLOSED">Clôturé</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
