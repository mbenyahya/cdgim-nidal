import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from '../ToastContext';

export default function Billing({ data }) {
  const { addToast } = useToast();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [days, setDays] = useState(20);
  const [exchangeRate, setExchangeRate] = useState(10.8);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const exportCsv = () => {
    if (!result?.lines?.length) { addToast('Aucune donnée à exporter', 'error'); return; }
    const headers = ['Client', 'Ressources', 'CA Base (€)', 'Charges Refact. (€)', 'Marge (€)', 'Total (€)'];
    const rows = result.lines.map((line) => [
      line.client?.name ?? '',
      line.resources ?? 0,
      (line.baseCa ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
      ((line.charges ?? 0) / exchangeRate).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
      (line.margin ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
      (line.total ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    ]);
    const totalRow = ['TOTAL', '', '', '', '', (result.grandTotal ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })];
    const csv = [headers.join(';'), ...rows.map((r) => r.join(';')), totalRow.join(';')].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `facturation_${month}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    addToast('Export CSV téléchargé');
  };

  useEffect(() => {
    const s = data?.settings;
    if (s?.exchangeRateBudget) setExchangeRate(Number(s.exchangeRateBudget));
  }, [data?.settings?.exchangeRateBudget]);

  useEffect(() => {
    if (!month) return;
    let cancelled = false;
    setLoading(true);
    api(`/billing?month=${encodeURIComponent(month)}&days=${days}&exchange_rate=${exchangeRate}`)
      .then((res) => { if (!cancelled) setResult(res); })
      .catch(() => { if (!cancelled) setResult(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [month, days, exchangeRate]);

  return (
    <>
      <div className="form-card">
        <h2 className="form-title">📅 Paramètres de facturation</h2>
        <div className="form-grid">
          <div className="form-group"><label>Mois</label><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
          <div className="form-group"><label>Jours ouvrés</label><input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} min={1} max={31} /></div>
          <div className="form-group"><label>Taux (MAD/EUR)</label><input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} step={0.01} /></div>
        </div>
      </div>
      {loading && <p>Chargement...</p>}
      {result && !loading && (
        <>
          <div className="table-container">
            <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div className="table-title">💰 Facturation {new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
              <button type="button" className="btn btn-primary btn-small" onClick={exportCsv}>📥 Télécharger CSV</button>
            </div>
            <table>
              <thead><tr><th>Client</th><th>Périmètre</th><th>Ressources</th><th>CA Base (€)</th><th>Charges Refact.</th><th>Marge</th><th>Total (€)</th></tr></thead>
              <tbody>
                {(result.lines || []).map((line, i) => (
                  <tr key={i}>
                    <td>{line.client?.name}</td>
                    <td>{line.scope === 'HORS_GROUPE' ? 'Hors-groupe' : 'Intra-groupe'}</td>
                    <td>{line.resources}</td>
                    <td>{line.baseCa?.toLocaleString('fr-FR')}</td>
                    <td>{(line.charges / exchangeRate).toLocaleString('fr-FR')}</td>
                    <td>{line.margin?.toLocaleString('fr-FR')}</td>
                    <td><strong>{line.total?.toLocaleString('fr-FR')}</strong></td>
                  </tr>
                ))}
                <tr style={{ background: '#f0f9ff', fontWeight: 'bold' }}><td colSpan={6}>TOTAL</td><td>{(result.grandTotal ?? 0).toLocaleString('fr-FR')} €</td></tr>
              </tbody>
            </table>
          </div>
          <div className="grid-2col" style={{ marginTop: 24 }}>
            <div className="table-container" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="table-header"><div className="table-title">📊 P&amp;L Intra-groupe</div></div>
              <table>
                <thead><tr><th>Client</th><th>Ress.</th><th>Total (€)</th></tr></thead>
                <tbody>
                  {(result.linesGroupe || []).map((line, i) => (
                    <tr key={i}><td>{line.client?.name}</td><td>{line.resources}</td><td><strong>{line.total?.toLocaleString('fr-FR')}</strong></td></tr>
                  ))}
                  <tr style={{ background: '#f0f9ff', fontWeight: 'bold' }}><td colSpan={2}>Total intra-groupe</td><td>{(result.grandTotalGroupe ?? 0).toLocaleString('fr-FR')} €</td></tr>
                </tbody>
              </table>
            </div>
            <div className="table-container" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="table-header"><div className="table-title">📊 P&amp;L Hors-groupe</div></div>
              <table>
                <thead><tr><th>Client</th><th>Ress.</th><th>Total (€)</th></tr></thead>
                <tbody>
                  {(result.linesHorsGroupe || []).map((line, i) => (
                    <tr key={i}><td>{line.client?.name}</td><td>{line.resources}</td><td><strong>{line.total?.toLocaleString('fr-FR')}</strong></td></tr>
                  ))}
                  <tr style={{ background: '#f0fdf4', fontWeight: 'bold' }}><td colSpan={2}>Total hors-groupe</td><td>{(result.grandTotalHorsGroupe ?? 0).toLocaleString('fr-FR')} €</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
