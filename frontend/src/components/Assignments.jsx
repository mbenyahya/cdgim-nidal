import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../ToastContext';

export default function Assignments({ data, onRefresh, canEdit }) {
  const { addToast } = useToast();
  const [resourceId, setResourceId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedByUserId, setAssignedByUserId] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allocationRate, setAllocationRate] = useState(100);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ resourceId: '', projectId: '', assignedByUserId: '1', startDate: '', endDate: '', allocationRate: 100 });
  const assignments = data?.assignments || [];
  const resources = data?.resources || [];
  const projects = data?.projects || [];

  const resourceName = (id) => resources.find((r) => String(r.id) === String(id))?.name || id;
  const projectName = (id) => projects.find((p) => String(p.id) === String(id))?.name || id;

  const submit = async (e) => {
    e.preventDefault();
    if (!resourceId || !projectId || !startDate) {
      addToast('Ressource, projet et date de début requis', 'error');
      return;
    }
    setLoading(true);
    try {
      await api('/assignments', {
        method: 'POST',
        body: JSON.stringify({
          resourceId: Number(resourceId),
          projectId: Number(projectId),
          assignedByUserId: Number(assignedByUserId) || 1,
          startDate,
          endDate: endDate || null,
          allocationRate: allocationRate || 100,
        }),
      });
      setResourceId(''); setProjectId(''); setStartDate(''); setEndDate(''); setAllocationRate(100);
      await onRefresh();
      addToast('Assignation créée');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (a) => {
    setEditing(a.id);
    setEditForm({
      resourceId: String(a.resourceId || ''),
      projectId: String(a.projectId || ''),
      assignedByUserId: String(a.assignedByUserId || '1'),
      startDate: a.startDate || '',
      endDate: a.endDate || '',
      allocationRate: a.allocationRate ?? 100,
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/assignments/${editing}`, {
        method: 'PUT',
        body: JSON.stringify({
          resourceId: editForm.resourceId ? Number(editForm.resourceId) : null,
          projectId: editForm.projectId ? Number(editForm.projectId) : null,
          assignedByUserId: editForm.assignedByUserId ? Number(editForm.assignedByUserId) : null,
          startDate: editForm.startDate || null,
          endDate: editForm.endDate || null,
          allocationRate: editForm.allocationRate ?? 100,
        }),
      });
      setEditing(null);
      await onRefresh();
      addToast('Assignation modifiée');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id) => {
    if (!confirm('Supprimer cette assignation ?')) return;
    try {
      await api(`/assignments/${id}`, { method: 'DELETE' });
      await onRefresh();
      addToast('Assignation supprimée');
    } catch (e) {
      addToast(e.message || 'Erreur', 'error');
    }
  };

  return (
    <>
      {canEdit && (
        <div className="form-card">
          <h2 className="form-title">➕ Ajouter une Assignation</h2>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Ressource *</label>
                <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} required>
                  <option value="">— Choisir —</option>
                  {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Projet *</label>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                  <option value="">— Choisir —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Date début *</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></div>
              <div className="form-group"><label>Date fin</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              <div className="form-group"><label>Taux (%)</label><input type="number" min={1} max={100} value={allocationRate} onChange={(e) => setAllocationRate(Number(e.target.value) || 100)} /></div>
              <div className="form-group"><label>Assigné par (user id)</label><input type="number" min={1} value={assignedByUserId} onChange={(e) => setAssignedByUserId(e.target.value)} /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>Enregistrer</button>
          </form>
        </div>
      )}
      <div className="table-container">
        <div className="table-header"><div className="table-title">🔗 Assignations</div></div>
        <table>
          <thead><tr><th>Ressource</th><th>Projet</th><th>Début</th><th>Fin</th><th>Taux %</th>{canEdit && <th>Actions</th>}</tr></thead>
          <tbody>{assignments.map((a) => (
            <tr key={a.id}>
              <td>{resourceName(a.resourceId)}</td>
              <td>{projectName(a.projectId)}</td>
              <td>{a.startDate || '-'}</td>
              <td>{a.endDate || '-'}</td>
              <td>{a.allocationRate ?? 100} %</td>
              {canEdit && (
                <td>
                  <button type="button" className="btn btn-secondary btn-small" onClick={() => openEdit(a)}>Modifier</button>
                  {' '}
                  <button type="button" className="btn btn-danger btn-small" onClick={() => deleteAssignment(a.id)}>Supprimer</button>
                </td>
              )}
            </tr>
          ))}</tbody>
        </table>
        {!assignments.length && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucune assignation</div>}
      </div>
      {editing != null && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Modifier l'assignation</h3>
            <form onSubmit={saveEdit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Ressource *</label>
                  <select value={editForm.resourceId} onChange={(e) => setEditForm({ ...editForm, resourceId: e.target.value })} required>
                    <option value="">— Choisir —</option>
                    {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Projet *</label>
                  <select value={editForm.projectId} onChange={(e) => setEditForm({ ...editForm, projectId: e.target.value })} required>
                    <option value="">— Choisir —</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Date début *</label><input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} required /></div>
                <div className="form-group"><label>Date fin</label><input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} /></div>
                <div className="form-group"><label>Taux (%)</label><input type="number" min={1} max={100} value={editForm.allocationRate} onChange={(e) => setEditForm({ ...editForm, allocationRate: Number(e.target.value) || 100 })} /></div>
                <div className="form-group"><label>Assigné par (user id)</label><input type="number" min={1} value={editForm.assignedByUserId} onChange={(e) => setEditForm({ ...editForm, assignedByUserId: e.target.value })} /></div>
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
