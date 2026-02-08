import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../ToastContext';

export default function Clients({ data, onRefresh, canEdit }) {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scope, setScope] = useState('GROUPE');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', description: '', scope: 'GROUPE' });
  const clients = data?.clients || [];
  const resources = data?.resources || [];

  const filtered = searchQ.trim()
    ? clients.filter((c) =>
        [c.name, c.code, c.description].some((v) => v && String(v).toLowerCase().includes(searchQ.trim().toLowerCase()))
      )
    : clients;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/clients', { method: 'POST', body: JSON.stringify({ name, code, description, scope }) });
      setName(''); setCode(''); setDescription(''); setScope('GROUPE');
      await onRefresh();
      addToast('Client créé');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setEditForm({ name: c.name || '', code: c.code || '', description: c.description || '', scope: c.scope || 'GROUPE' });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/clients/${editing}`, { method: 'PUT', body: JSON.stringify(editForm) });
      setEditing(null);
      await onRefresh();
      addToast('Client modifié');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    if (!confirm('Supprimer ce client ?')) return;
    try {
      await api(`/clients/${id}`, { method: 'DELETE' });
      await onRefresh();
      addToast('Client supprimé');
    } catch (e) {
      addToast(e.message || 'Erreur', 'error');
    }
  };

  return (
    <>
      {canEdit && (
        <div className="form-card">
          <h2 className="form-title">➕ Ajouter un Client/BU</h2>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group"><label>Nom *</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="form-group"><label>Code *</label><input value={code} onChange={(e) => setCode(e.target.value)} required /></div>
              <div className="form-group"><label>Périmètre</label><select value={scope} onChange={(e) => setScope(e.target.value)}><option value="GROUPE">Intra-groupe</option><option value="HORS_GROUPE">Hors-groupe (marché local)</option></select></div>
              <div className="form-group"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
          </form>
        </div>
      )}
      <div className="search-filters">
        <input type="search" placeholder="Rechercher (nom, code, description)…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
      </div>
      <div className="table-container">
        <div className="table-header"><div className="table-title">🏢 Clients/BU</div></div>
        <table>
          <thead><tr><th>Nom</th><th>Code</th><th>Périmètre</th><th>Ressources</th><th>Description</th>{canEdit && <th>Actions</th>}</tr></thead>
          <tbody>{filtered.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td><span className="badge badge-profile">{c.code}</span></td>
              <td>{c.scope === 'HORS_GROUPE' ? 'Hors-groupe' : 'Intra-groupe'}</td>
              <td>{resources.filter((r) => String(r.clientId) === String(c.id)).length}</td>
              <td>{c.description || '-'}</td>
              {canEdit && (
                <td>
                  <button type="button" className="btn btn-secondary btn-small" onClick={() => openEdit(c)}>Modifier</button>
                  {' '}
                  <button type="button" className="btn btn-danger btn-small" onClick={() => deleteClient(c.id)}>Supprimer</button>
                </td>
              )}
            </tr>
          ))}</tbody>
        </table>
        {!filtered.length && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>{searchQ ? 'Aucun résultat' : 'Aucun client'}</div>}
      </div>
      {editing != null && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Modifier le client</h3>
            <form onSubmit={saveEdit}>
              <div className="form-grid">
                <div className="form-group"><label>Nom *</label><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required /></div>
                <div className="form-group"><label>Code *</label><input value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} required /></div>
                <div className="form-group"><label>Périmètre</label><select value={editForm.scope} onChange={(e) => setEditForm({ ...editForm, scope: e.target.value })}><option value="GROUPE">Intra-groupe</option><option value="HORS_GROUPE">Hors-groupe (marché local)</option></select></div>
                <div className="form-group"><label>Description</label><textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} /></div>
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
