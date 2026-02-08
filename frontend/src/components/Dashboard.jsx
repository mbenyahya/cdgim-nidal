import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { api } from '../api';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard({ data, onRefresh }) {
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => { setRefreshing(true); onRefresh().finally(() => setRefreshing(false)); };
  const settings = data?.settings || {};
  const tjmGrids = data?.tjm?.grids || { profile: {}, level: {} };
  const profiles = data?.profiles || [];
  const resources = data?.resources || [];
  const clients = data?.clients || [];
  const charges = data?.charges || [];

  useEffect(() => {
    let cancelled = false;
    api('/dashboard').then((res) => { if (!cancelled) setDashboard(res); }).catch(() => {});
    return () => { cancelled = true; };
  }, [data?.resources?.length, data?.charges?.length, data?.profiles?.length, data?.clients?.length]);

  if (!dashboard) return <div className="info-box">Chargement du dashboard...</div>;

  const { kpis, profileBreakdown, topClients, plGroupe, plHorsGroupe, settings: dashSettings } = dashboard;
  const labels = Object.keys(profileBreakdown || {});
  const values = Object.values(profileBreakdown || {});

  const chartProfile = {
    labels,
    datasets: [{ data: values, backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'], borderWidth: 0 }],
  };
  const chartClients = {
    labels: (topClients || []).map((c) => c.name),
    datasets: [{ label: 'CA (€)', data: (topClients || []).map((c) => c.ca), backgroundColor: '#3b82f6', borderRadius: 6 }],
  };
  const chartKpi = {
    labels: ['CA Total', 'Charges Directes', 'Charges Indirectes', 'Marge'],
    datasets: [{
      label: '€',
      data: [kpis?.totalCa || 0, kpis?.directCosts || 0, kpis?.indirectCosts || 0, kpis?.margin || 0],
      backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'],
      borderRadius: 6,
    }],
  };

  return (
    <>
      <div className="info-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="info-box-title">📌 Vue d'ensemble Financière</div>
        <div className="info-box-content">
          Modèle : <strong>{(dashSettings?.tjmModel || settings.tjmModel) === 'profile' ? 'Par Profil (2026)' : 'Par Niveau (2027+)'}</strong> |
          Jours productifs/an : <strong>{dashSettings?.productiveDaysBudget ?? settings.productiveDaysBudget ?? 229}</strong> |
          Taux budget : <strong>{(dashSettings?.exchangeRateBudget ?? settings.exchangeRateBudget ?? 10.8).toFixed(2)} MAD/EUR</strong>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleRefresh} disabled={refreshing}>{refreshing ? 'Rafraîchissement…' : '🔄 Rafraîchir'}</button>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Effectifs Productifs</div>
          <div className="kpi-value">{kpis?.productive ?? 0}</div>
          <div className="kpi-subtitle">Ressources facturables</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Effectifs Non-Productifs</div>
          <div className="kpi-value">{kpis?.nonProductive ?? 0}</div>
          <div className="kpi-subtitle">Admin, RH, Finance</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">CA Mensuel Total</div>
          <div className="kpi-value">{(kpis?.totalCa ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</div>
          <div className="kpi-subtitle">TJM + Refacturables + Marge</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Charges Directes</div>
          <div className="kpi-value">{(kpis?.directCosts ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</div>
          <div className="kpi-subtitle">Salaires + Refacturables</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Charges Indirectes</div>
          <div className="kpi-value">{(kpis?.indirectCosts ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</div>
          <div className="kpi-subtitle">Non-productifs + Frais gén.</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Marge d'Exploitation</div>
          <div className="kpi-value">{(kpis?.margin ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</div>
          <div className="kpi-subtitle">CA - Charges totales</div>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📊 Répartition CA par profil</h3>
          <div style={{ height: 240 }}>{labels.length ? <Doughnut data={chartProfile} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /> : <p>Aucune donnée</p>}</div>
        </div>
        <div className="chart-card">
          <h3>🏢 CA par client (Top 5)</h3>
          <div style={{ height: 240 }}>{(topClients?.length) ? <Bar data={chartClients} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }} /> : <p>Aucune donnée</p>}</div>
        </div>
        <div className="chart-card">
          <h3>💰 Synthèse financière</h3>
          <div style={{ height: 240 }}><Bar data={chartKpi} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
        </div>
      </div>
      <div className="grid-2col">
        <div className="table-container">
          <div className="table-header"><div className="table-title">📊 Répartition par Profil</div></div>
          <table>
            <thead><tr><th>Profil</th><th>CA Mensuel</th></tr></thead>
            <tbody>{labels.map((name, i) => <tr key={name}><td>{name}</td><td><strong>{Number(values[i]).toLocaleString('fr-FR')} €</strong></td></tr>)}</tbody>
          </table>
          {!labels.length && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucune donnée</div>}
        </div>
        <div className="table-container">
          <div className="table-header"><div className="table-title">🏢 Top 5 Clients par CA</div></div>
          <table>
            <thead><tr><th>Client</th><th>CA Mensuel</th></tr></thead>
            <tbody>{(topClients || []).map((c) => <tr key={c.name}><td>{c.name}</td><td><strong>{c.ca.toLocaleString('fr-FR')} €</strong></td></tr>)}</tbody>
          </table>
          {!topClients?.length && <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucune donnée</div>}
        </div>
      </div>
      {(plGroupe || plHorsGroupe) && (
        <div className="grid-2col" style={{ marginTop: 24 }}>
          <div className="table-container" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="table-header"><div className="table-title">📊 P&amp;L Intra-groupe</div></div>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 12 }}>Refacturation intra-groupe — marge {plGroupe?.marginPct ?? dashSettings?.marginCgdim ?? 8} %</p>
            <table>
              <thead><tr><th>Indicateur</th><th>Valeur</th></tr></thead>
              <tbody>
                <tr><td>Effectifs productifs</td><td>{plGroupe?.productive ?? 0}</td></tr>
                <tr><td>CA (€)</td><td><strong>{(plGroupe?.totalCa ?? 0).toLocaleString('fr-FR')} €</strong></td></tr>
                <tr><td>Charges directes (€)</td><td>{(plGroupe?.directCosts ?? 0).toLocaleString('fr-FR')} €</td></tr>
                <tr><td>Charges indirectes (€)</td><td>{(plGroupe?.indirectCosts ?? 0).toLocaleString('fr-FR')} €</td></tr>
                <tr><td><strong>Marge (€)</strong></td><td><strong>{(plGroupe?.margin ?? 0).toLocaleString('fr-FR')} €</strong></td></tr>
              </tbody>
            </table>
          </div>
          <div className="table-container" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="table-header"><div className="table-title">📊 P&amp;L Hors-groupe</div></div>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 12 }}>Marché local / activité commerciale — marge {plHorsGroupe?.marginPct ?? dashSettings?.marginHorsGroupe ?? 10} %</p>
            <table>
              <thead><tr><th>Indicateur</th><th>Valeur</th></tr></thead>
              <tbody>
                <tr><td>Effectifs productifs</td><td>{plHorsGroupe?.productive ?? 0}</td></tr>
                <tr><td>CA (€)</td><td><strong>{(plHorsGroupe?.totalCa ?? 0).toLocaleString('fr-FR')} €</strong></td></tr>
                <tr><td>Charges directes (€)</td><td>{(plHorsGroupe?.directCosts ?? 0).toLocaleString('fr-FR')} €</td></tr>
                <tr><td>Charges indirectes (€)</td><td>{(plHorsGroupe?.indirectCosts ?? 0).toLocaleString('fr-FR')} €</td></tr>
                <tr><td><strong>Marge (€)</strong></td><td><strong>{(plHorsGroupe?.margin ?? 0).toLocaleString('fr-FR')} €</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
