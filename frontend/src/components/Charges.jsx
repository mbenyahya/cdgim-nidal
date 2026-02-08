import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../ToastContext';

const TYPES = [
  { value: 'deplacement', label: 'Déplacement' },
  { value: 'reception', label: 'Réception' },
  { value: 'formation', label: 'Formation' },
  { value: 'licenciement', label: 'Licenciement' },
  { value: 'autre', label: 'Autre' },
];

export default function Charges({ data, onRefresh, canEdit }) {
  const { addToast } = useToast();
  const [type, setType] = useState('deplacement');
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ type: 'deplacement', clientId: '', amount: '', date: '', description: '' });
  const charges = data?.charges || [];
  const clients = data?.clients || [];

  let filtered = charges;
  if (searchQ.trim()) {
    const q = searchQ.trim().toLowerCase();
    filtered = filtered.filter((c) =>
      [c.type, c.description].some((v) => v && String(v).toLowerCase().includes(q))
    );
  }
  if (filterClientId) filtered = filtered.filter((c) => String(c.clientId) === String(filterClientId));

  const submit = async (e) => {
    e.preventDefault();
    if (!clientId) { addToast('Client requis', 'error'); return; }
    setLoading(true);
    try {
      await api('/charges', { method: 'POST', body: JSON.stringify({ type, clientId, resourceId: null, amount: parseFloat(amount), date, description }) });
      setClientId(''); setAmount(''); setDescription('');
      await onRefresh();
      addToast('Charge créée');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setEditForm({
      type: c.type || 'deplacement',
      clientId: c.clientId ?? '',
      amount: c.amount ?? '',
      date: c.date || new Date().toISOString().slice(0, 10),
      description: c.description || '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/charges/${editing}`, {
        method: 'PUT',
        body: JSON.stringify({
          type: editForm.type,
          clientId: editForm.clientId,
          resourceId: null,
          amount: parseFloat(editForm.amount),
          date: editForm.date,
          description: editForm.description,
        }),
      });
      setEditing(null);
      await onRefresh();
      addToast('Charge modifiée');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteCharge = async (id) => {
    if (!confirm('Supprimer cette charge ?')) return;
    try {
      await api(`/charges/${id}`, { method: 'DELETE' });
      await onRefresh();
      addToast('Charge supprimée');
    } catch (e) {
      addToast(e.message || 'Erreur', 'error');
    }
  };

  return (
    <>
      <div className="info-box"><div className="info-box-title">💳 Charges Refacturables</div><div className="info-box-content">Déplacements, formations, etc. refacturables à un client.</div></div>
      {canEdit && (
        <div className="form-card">
          <h2 className="form-title">➕ Ajouter une Charge</h2>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group"><label>Type *</label><select value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              <div className="form-group"><label>Client *</label><select value={clientId} onChange={(e) => setClientId(e.target.value)} required><option value="">Sélectionner...</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className="form-group"><label>Montant (MAD) *</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={0} step={0.01} required /></div>
              <div className="form-group"><label>Date *</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
              <div className="form-group"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
          </form>
        </div>
      )}
      <div className="search-filters">
        <input type="search" placeholder="Rechercher (type, description)…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
        <select value={filterClientId} onChange={(e) => setFilterClientId(e.target.value)}>
          <option value="">Tous les clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="table-container">
        <div className="table-header"><div className="table-title">💳 Charges Refacturables</div></div>
        <table>
          <thead><tr><th>Type</th><th>Client</th><th>Montant (MAD)</th><th>Date</th><th>Description</th>{canEdit && <th>Actions</th>}</tr></thead>
          <tbody>{filtered.map((c) => (
            <tr key={c.id}>
              <td><span className="badge badge-profile">{c.type}</span></td>
              <td>{clients.find((x) => String(x.id) === String(c.clientId))?.name ?? '-'}</td>
              <td><strong>{Number(c.amount).toLocaleString('fr-FR')} MAD</strong></td>
              <td>{c.date}</td>
              <td>{c.description || '-'}</td>
              {canEdit && (
                <td>
                  <button type="button" className="btn btn-secondary btn-small" onClick={() => openEdit(c)}>Modifier</button>
                  {' '}
                  <button type="button" className="btn btn-danger btn-small" onClick={() => deleteCharge(c.id)}>Suppr.</button>
                </td>
              )}
            </tr>
          ))}</tbody>
        </table>
        {!filtered.length && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>{searchQ || filterClientId ? 'Aucun résultat' : 'Aucune charge'}</div>}
      </div>
      {editing != null && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Modifier la charge</h3>
            <form onSubmit={saveEdit}>
              <div className="form-grid">
                <div className="form-group"><label>Type *</label><select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div className="form-group"><label>Client *</label><select value={editForm.clientId} onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })} required><option value="">—</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="form-group"><label>Montant (MAD) *</label><input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} min={0} step={0.01} required /></div>
                <div className="form-group"><label>Date *</label><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required /></div>
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
