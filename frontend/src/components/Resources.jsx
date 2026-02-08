import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../ToastContext';

const defaultForm = { type: 'productive', name: '', profileId: '', levelId: '', entity: 'cgdim', clientId: '', department: 'admin', salary: '', bonus: '0', startDate: '' };

export default function Resources({ data, onRefresh, canEdit }) {
  const { addToast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const profiles = data?.profiles || [];
  const levels = data?.levels || [];
  const clients = data?.clients || [];
  const resources = data?.resources || [];
  const tjmGrids = data?.tjm?.grids || { profile: {}, level: {} };
  const model = data?.settings?.tjmModel || 'profile';

  let filtered = resources;
  if (searchQ.trim()) {
    const q = searchQ.trim().toLowerCase();
    filtered = filtered.filter((r) => r.name && String(r.name).toLowerCase().includes(q));
  }
  if (filterClientId) filtered = filtered.filter((r) => String(r.clientId) === String(filterClientId));
  if (filterType) filtered = filtered.filter((r) => r.type === filterType);

  const getTjm = (r) => {
    if (model === 'profile' && r.profileId != null) { const t = tjmGrids.profile?.[String(r.profileId)]; return t?.value ?? 0; }
    if (model === 'level' && r.levelId != null) { const t = tjmGrids.level?.[String(r.levelId)]; return t?.value ?? 0; }
    return 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/resources', {
        method: 'POST',
        body: JSON.stringify({
          type: form.type,
          name: form.name,
          profileId: form.profileId || null,
          levelId: form.levelId || null,
          entity: form.entity,
          clientId: form.clientId || null,
          department: form.department || null,
          salary: parseFloat(form.salary),
          bonus: parseFloat(form.bonus) || 0,
          startDate: form.startDate || '',
        }),
      });
      setForm({ ...defaultForm, type: form.type, entity: form.entity, department: form.department });
      await onRefresh();
      addToast('Ressource créée');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (r) => {
    setEditing(r.id);
    setEditForm({
      type: r.type || 'productive',
      name: r.name || '',
      profileId: r.profileId ?? '',
      levelId: r.levelId ?? '',
      entity: r.entity || 'cgdim',
      clientId: r.clientId ?? '',
      department: r.department || 'admin',
      salary: r.salary ?? '',
      bonus: r.bonus ?? '0',
      startDate: r.startDate || '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/resources/${editing}`, {
        method: 'PUT',
        body: JSON.stringify({
          type: editForm.type,
          name: editForm.name,
          profileId: editForm.profileId || null,
          levelId: editForm.levelId || null,
          entity: editForm.entity,
          clientId: editForm.clientId || null,
          department: editForm.department || null,
          salary: parseFloat(editForm.salary),
          bonus: parseFloat(editForm.bonus) || 0,
          startDate: editForm.startDate || '',
        }),
      });
      setEditing(null);
      await onRefresh();
      addToast('Ressource modifiée');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteRes = async (id) => {
    if (!confirm('Supprimer cette ressource ?')) return;
    try {
      await api(`/resources/${id}`, { method: 'DELETE' });
      await onRefresh();
      addToast('Ressource supprimée');
    } catch (e) {
      addToast(e.message || 'Erreur', 'error');
    }
  };

  return (
    <>
      {canEdit && (
        <div className="form-card">
          <h2 className="form-title">➕ Ajouter une Ressource</h2>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group"><label>Type *</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="productive">Productif</option><option value="non-productive">Non-Productif</option></select></div>
              <div className="form-group"><label>Nom *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              {form.type === 'productive' && <div className="form-group"><label>Profil</label><select value={form.profileId} onChange={(e) => setForm({ ...form, profileId: e.target.value })}><option value="">—</option>{profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>}
              <div className="form-group"><label>Entité *</label><select value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })}><option value="cgdim">CGDim Maroc</option><option value="outsourcing">CGDim Outsourcing</option></select></div>
              {form.type === 'productive' && <div className="form-group"><label>Client</label><select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">—</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
              {form.type === 'non-productive' && <div className="form-group"><label>Département</label><select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}><option value="admin">Administration</option><option value="rh">RH</option><option value="finance">Finance</option><option value="it">IT</option></select></div>}
              <div className="form-group"><label>Salaire (MAD) *</label><input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} min={0} required /></div>
              <div className="form-group"><label>Primes (MAD)</label><input type="number" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} min={0} /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
          </form>
        </div>
      )}
      <div className="search-filters">
        <input type="search" placeholder="Rechercher par nom…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
        <select value={filterClientId} onChange={(e) => setFilterClientId(e.target.value)}>
          <option value="">Tous les clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Tous les types</option>
          <option value="productive">Productif</option>
          <option value="non-productive">Non-Productif</option>
        </select>
      </div>
      <div className="table-container">
        <div className="table-header"><div className="table-title">👥 Ressources</div></div>
        <table>
          <thead><tr><th>Nom</th><th>Type</th><th>Profil/Niveau</th><th>Client/Dept</th><th>Salaire+Primes (MAD)</th><th>TJM (EUR)</th>{canEdit && <th>Actions</th>}</tr></thead>
          <tbody>{filtered.map((r) => {
            const p = profiles.find((x) => String(x.id) === String(r.profileId));
            const c = clients.find((x) => String(x.id) === String(r.clientId));
            return (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.type === 'productive' ? 'Productif' : 'Non-Productif'}</td>
                <td>{p?.name ?? (r.levelId ? 'N' + levels.find((l) => String(l.id) === String(r.levelId))?.number : '')}</td>
                <td>{c?.name ?? r.department ?? '-'}</td>
                <td>{(Number(r.salary) + Number(r.bonus || 0)).toLocaleString('fr-FR')}</td>
                <td><strong>{getTjm(r)} €</strong></td>
                {canEdit && (
                  <td>
                    <button type="button" className="btn btn-secondary btn-small" onClick={() => openEdit(r)}>Modifier</button>
                    {' '}
                    <button type="button" className="btn btn-danger btn-small" onClick={() => deleteRes(r.id)}>Suppr.</button>
                  </td>
                )}
              </tr>
            );
          })}</tbody>
        </table>
        {!filtered.length && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>{searchQ || filterClientId || filterType ? 'Aucun résultat' : 'Aucune ressource'}</div>}
      </div>
      {editing != null && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Modifier la ressource</h3>
            <form onSubmit={saveEdit}>
              <div className="form-grid">
                <div className="form-group"><label>Type *</label><select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}><option value="productive">Productif</option><option value="non-productive">Non-Productif</option></select></div>
                <div className="form-group"><label>Nom *</label><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required /></div>
                {editForm.type === 'productive' && <div className="form-group"><label>Profil</label><select value={editForm.profileId} onChange={(e) => setEditForm({ ...editForm, profileId: e.target.value })}><option value="">—</option>{profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>}
                <div className="form-group"><label>Entité *</label><select value={editForm.entity} onChange={(e) => setEditForm({ ...editForm, entity: e.target.value })}><option value="cgdim">CGDim Maroc</option><option value="outsourcing">CGDim Outsourcing</option></select></div>
                {editForm.type === 'productive' && <div className="form-group"><label>Client</label><select value={editForm.clientId} onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}><option value="">—</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
                {editForm.type === 'non-productive' && <div className="form-group"><label>Département</label><select value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}><option value="admin">Administration</option><option value="rh">RH</option><option value="finance">Finance</option><option value="it">IT</option></select></div>}
                <div className="form-group"><label>Salaire (MAD) *</label><input type="number" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} min={0} required /></div>
                <div className="form-group"><label>Primes (MAD)</label><input type="number" value={editForm.bonus} onChange={(e) => setEditForm({ ...editForm, bonus: e.target.value })} min={0} /></div>
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
