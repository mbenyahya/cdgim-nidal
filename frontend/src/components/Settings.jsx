import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../ToastContext';

export default function Settings({ data, onRefresh, canEdit, isAdmin }) {
  const { addToast } = useToast();
  const s = data?.settings || {};
  const [marginCgdim, setMarginCgdim] = useState(s.marginCgdim ?? 8);
  const [marginOutsourcing, setMarginOutsourcing] = useState(s.marginOutsourcing ?? 5);
  const [marginHorsGroupe, setMarginHorsGroupe] = useState(s.marginHorsGroupe ?? 10);
  const [productiveDaysBudget, setProductiveDaysBudget] = useState(s.productiveDaysBudget ?? 229);
  const [exchangeRateBudget, setExchangeRateBudget] = useState(s.exchangeRateBudget ?? 10.8);
  const [tjmModel, setTjmModel] = useState(s.tjmModel ?? 'profile');
  const [overhead, setOverhead] = useState(s.overhead || { rent: 0, maintenance: 0, cleaning: 0, telecoms: 0, depreciation: 0, other: 0 });
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  React.useEffect(() => {
    setMarginCgdim(s.marginCgdim ?? 8);
    setMarginOutsourcing(s.marginOutsourcing ?? 5);
    setMarginHorsGroupe(s.marginHorsGroupe ?? 10);
    setProductiveDaysBudget(s.productiveDaysBudget ?? 229);
    setExchangeRateBudget(s.exchangeRateBudget ?? 10.8);
    setTjmModel(s.tjmModel ?? 'profile');
    setOverhead(s.overhead || { rent: 0, maintenance: 0, cleaning: 0, telecoms: 0, depreciation: 0, other: 0 });
  }, [s.marginCgdim, s.marginOutsourcing, s.marginHorsGroupe, s.productiveDaysBudget, s.exchangeRateBudget, s.tjmModel, s.overhead]);

  const saveSettings = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await api('/settings', { method: 'PUT', body: JSON.stringify({ marginCgdim, marginOutsourcing, marginHorsGroupe, productiveDaysBudget, exchangeRateBudget, tjmModel }) });
      await onRefresh();
      addToast('Paramètres enregistrés');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveOverhead = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await api('/settings/overhead', { method: 'PUT', body: JSON.stringify(overhead) });
      await onRefresh();
      addToast('Frais généraux enregistrés');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const data = await api('/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `cgdim_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      addToast('Backup exporté');
    } catch (e) {
      addToast(e.message || 'Erreur', 'error');
    }
  };

  const importData = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const body = JSON.parse(reader.result);
        api('/settings/import', { method: 'POST', body: JSON.stringify(body) })
          .then(() => { onRefresh(); addToast('Données importées'); })
          .catch((err) => addToast(err.message || 'Erreur import', 'error'))
          .finally(() => { setImporting(false); e.target.value = ''; });
      } catch (err) {
        addToast('Fichier JSON invalide', 'error');
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => { addToast('Lecture du fichier impossible', 'error'); setImporting(false); e.target.value = ''; };
    reader.readAsText(file);
  };

  const resetData = async () => {
    if (!confirm('⚠️ Réinitialiser TOUTES les données ?')) return;
    try {
      await api('/settings/reset', { method: 'POST' });
      await onRefresh();
      addToast('Données réinitialisées');
    } catch (e) {
      addToast(e.message || 'Erreur', 'error');
    }
  };

  return (
    <>
      {canEdit && (
        <>
          <div className="form-card">
            <h2 className="form-title">⚙️ Paramètres généraux</h2>
            <form onSubmit={saveSettings}>
              <div className="form-grid">
                <div className="form-group"><label>Modèle TJM</label><select value={tjmModel} onChange={(e) => setTjmModel(e.target.value)}><option value="profile">Par Profil (2026)</option><option value="level">Par Niveau (2027+)</option></select></div>
                <div className="form-group"><label>Marge intra-groupe (%)</label><input type="number" value={marginCgdim} onChange={(e) => setMarginCgdim(e.target.value)} min={0} step={0.1} title="Marge pour refacturation intra-groupe" /></div>
                <div className="form-group"><label>Marge hors-groupe (%)</label><input type="number" value={marginHorsGroupe} onChange={(e) => setMarginHorsGroupe(e.target.value)} min={0} step={0.1} title="Marge pour activité marché local" /></div>
                <div className="form-group"><label>Marge Outsourcing (%)</label><input type="number" value={marginOutsourcing} onChange={(e) => setMarginOutsourcing(e.target.value)} min={0} step={0.1} /></div>
                <div className="form-group"><label>Jours productifs/an</label><input type="number" value={productiveDaysBudget} onChange={(e) => setProductiveDaysBudget(e.target.value)} min={1} /></div>
                <div className="form-group"><label>Taux change budget (MAD/EUR)</label><input type="number" value={exchangeRateBudget} onChange={(e) => setExchangeRateBudget(e.target.value)} step={0.01} /></div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>Sauvegarder</button>
            </form>
          </div>
          <div className="form-card">
            <h2 className="form-title">💰 Frais généraux (MAD)</h2>
            <form onSubmit={saveOverhead}>
              <div className="form-grid">
                {['rent', 'maintenance', 'cleaning', 'telecoms', 'depreciation', 'other'].map((k) => (
                  <div key={k} className="form-group">
                    <label>{k === 'rent' ? 'Loyers' : k === 'other' ? 'Autres' : k.charAt(0).toUpperCase() + k.slice(1)}</label>
                    <input type="number" value={overhead[k] ?? 0} onChange={(e) => setOverhead({ ...overhead, [k]: parseFloat(e.target.value) || 0 })} min={0} />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>Sauvegarder</button>
            </form>
          </div>
        </>
      )}
      <div className="form-card">
        <h2 className="form-title">💾 Données</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {canEdit && <button type="button" className="btn btn-primary" onClick={exportData}>📤 Exporter backup</button>}
          {isAdmin && (
            <>
              <label className="btn btn-secondary" style={{ margin: 0, cursor: 'pointer' }}>
                📥 Importer backup
                <input type="file" accept=".json" onChange={importData} disabled={importing} style={{ display: 'none' }} />
              </label>
              <button type="button" className="btn btn-danger" onClick={resetData}>🗑️ Réinitialiser</button>
            </>
          )}
        </div>
        {isAdmin && <p style={{ marginTop: 10, fontSize: '0.85em', color: '#666' }}>L’import remplace les données par le contenu du fichier JSON (backup exporté).</p>}
      </div>
    </>
  );
}
