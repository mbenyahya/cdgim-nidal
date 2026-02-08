import React, { useState } from 'react';

const SECTIONS = [
  { id: 'intro', title: 'Introduction', icon: '📖' },
  { id: 'auth', title: 'Connexion et rôles', icon: '🔐' },
  { id: 'dashboard', title: 'Dashboard', icon: '📊' },
  { id: 'profiles', title: 'Profils et Niveaux', icon: '👤' },
  { id: 'tjm', title: 'Grilles TJM', icon: '📋' },
  { id: 'resources', title: 'Ressources', icon: '👥' },
  { id: 'clients', title: 'Clients / BU et périmètres', icon: '🏢' },
  { id: 'projects', title: 'Projets', icon: '📁' },
  { id: 'assignments', title: 'Assignations', icon: '🔗' },
  { id: 'charges', title: 'Charges refacturables', icon: '💳' },
  { id: 'billing', title: 'Facturation et P&L', icon: '💰' },
  { id: 'settings', title: 'Paramètres', icon: '⚙️' },
];

export default function UserGuide() {
  const [section, setSection] = useState('intro');

  return (
    <div className="user-guide">
      <div className="guide-nav">
        <h2 style={{ marginBottom: 16 }}>📘 Guide utilisateur CGDim</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`guide-nav-btn ${section === s.id ? 'active' : ''}`}
              onClick={() => setSection(s.id)}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </nav>
      </div>
      <div className="guide-content">
        {section === 'intro' && (
          <>
            <h3>Introduction</h3>
            <p>CGDim est un outil de pilotage financier permettant de gérer les ressources, les clients, les projets, les grilles TJM et la facturation (intra-groupe et marché local).</p>
            <p><strong>Fonctionnalités principales :</strong></p>
            <ul>
              <li>Pilotage des effectifs productifs et non productifs</li>
              <li>Grilles TJM par profil ou par niveau</li>
              <li>Distinction <strong>Intra-groupe</strong> (refacturation interne) et <strong>Hors-groupe</strong> (marché local / activité commerciale)</li>
              <li>Deux P&L (Profit &amp; Loss) avec marges et règles de gestion différentes</li>
              <li>Refacturation au TJM, à l’acte ou au forfait</li>
              <li>Assignations ressources ↔ projets</li>
            </ul>
          </>
        )}

        {section === 'auth' && (
          <>
            <h3>Connexion et rôles</h3>
            <p>L’authentification se fait par <strong>nom d’utilisateur</strong> et <strong>mot de passe</strong>. Le rôle est déterminé par le serveur (utilisateur en base).</p>
            <p><strong>Compte par défaut :</strong> <code>admin</code> / <code>admin</code> (à modifier en production).</p>
            <p><strong>Rôles :</strong></p>
            <ul>
              <li><strong>Administrateur</strong> : accès complet (paramètres, import/export, réinitialisation)</li>
              <li><strong>Expert</strong> : saisie et modification des données (clients, ressources, projets, etc.)</li>
              <li><strong>Utilisateur</strong> : consultation uniquement</li>
            </ul>
            <p>Seuls les rôles Admin et Expert peuvent créer, modifier ou supprimer des enregistrements.</p>
          </>
        )}

        {section === 'dashboard' && (
          <>
            <h3>Dashboard</h3>
            <p>Vue d’ensemble financière avec KPIs et graphiques.</p>
            <p><strong>Indicateurs affichés :</strong></p>
            <ul>
              <li>Effectifs productifs / non productifs</li>
              <li>CA mensuel total (TJM + refacturables + marge)</li>
              <li>Charges directes (salaires + refacturables)</li>
              <li>Charges indirectes (non-productifs + frais généraux)</li>
              <li>Marge d’exploitation</li>
            </ul>
            <p><strong>P&L Intra-groupe et P&L Hors-groupe :</strong> deux tableaux distincts selon le périmètre des clients (Intra-groupe vs Hors-groupe). Les coûts indirects sont répartis au prorata des coûts directs. Chaque P&L utilise sa marge configurée (Paramètres).</p>
            <p>Le bouton <strong>Rafraîchir</strong> recharge les données du dashboard.</p>
          </>
        )}

        {section === 'profiles' && (
          <>
            <h3>Profils et Niveaux</h3>
            <p><strong>Profils</strong> : catégories métiers (ex. Développeur, Chef de projet) avec un salaire moyen de référence. Ils servent de base au modèle TJM « Par profil ».</p>
            <p><strong>Niveaux</strong> : grille hiérarchique (ex. 1 à 8) avec salaire moyen. Utilisés par le modèle TJM « Par niveau ».</p>
            <p><strong>Règle :</strong> le paramètre <em>Modèle TJM</em> (Paramètres) choisit si les grilles TJM et le CA sont calculés par profil ou par niveau.</p>
          </>
        )}

        {section === 'tjm' && (
          <>
            <h3>Grilles TJM</h3>
            <p>Les grilles TJM définissent le <strong>taux journalier moyen (€)</strong> par profil ou par niveau. Ce taux est utilisé pour calculer le CA des ressources productives (nombre de jours × TJM).</p>
            <p><strong>Règle :</strong> selon le modèle choisi (Paramètres), on édite soit la grille Profil, soit la grille Niveau. Une date peut être associée à chaque valeur pour tracer les évolutions.</p>
          </>
        )}

        {section === 'resources' && (
          <>
            <h3>Ressources</h3>
            <p>Les ressources sont les effectifs (personnes). Chaque ressource a :</p>
            <ul>
              <li><strong>Type</strong> : productif (facturable) ou non productif (admin, RH, etc.)</li>
              <li><strong>Profil</strong> et <strong>Niveau</strong> : pour le calcul du TJM</li>
              <li><strong>Client/BU</strong> : rattachement pour le CA et la facturation</li>
              <li>Salaire, prime, département, entité, date de début</li>
            </ul>
            <p>Seules les ressources <strong>productives</strong> génèrent du CA (TJM × jours). Les non productives entrent dans les charges indirectes.</p>
          </>
        )}

        {section === 'clients' && (
          <>
            <h3>Clients / BU et périmètres</h3>
            <p>Les clients (ou BU) sont les entités facturées. Chaque client a un <strong>périmètre</strong> :</p>
            <ul>
              <li><strong>Intra-groupe</strong> : refacturation interne (marge « intra-groupe »)</li>
              <li><strong>Hors-groupe</strong> : marché local / activité commerciale (marge « hors-groupe »)</li>
            </ul>
            <p>Ce périmètre détermine dans quel P&L (Dashboard et Facturation) le client apparaît et quelle marge lui est appliquée. Les équipes et projets rattachés à un client héritent de ce périmètre pour les calculs.</p>
          </>
        )}

        {section === 'projects' && (
          <>
            <h3>Projets</h3>
            <p>Les projets sont rattachés à un client et ont un <strong>type de facturation</strong> :</p>
            <ul>
              <li><strong>TJM</strong> : facturation au taux journalier (jours × TJM)</li>
              <li><strong>À l’acte</strong> : facturation à l’unité / au livrable</li>
              <li><strong>Forfait</strong> : facturation au forfait (marché local)</li>
            </ul>
            <p>Champs : nom, code, client, dates de début/fin, statut (Actif / Clôturé). Le périmètre (groupe / hors-groupe) est celui du client.</p>
          </>
        )}

        {section === 'assignments' && (
          <>
            <h3>Assignations</h3>
            <p>Les assignations lient une <strong>ressource</strong> à un <strong>projet</strong> sur une période, avec un taux d’allocation (%).</p>
            <p>Champs : ressource, projet, date de début, date de fin, taux d’allocation (1–100), utilisateur ayant assigné. Utilisé pour le suivi de l’imputation et du pilotage par projet.</p>
          </>
        )}

        {section === 'charges' && (
          <>
            <h3>Charges refacturables</h3>
            <p>Les charges refacturables sont des coûts (MAD) imputés à un client et convertis en € au taux de change pour le CA. Ex. : frais, prestations externes.</p>
            <p>Champs : type, client, ressource (optionnel), montant, date, description. Elles s’ajoutent au CA base (TJM) pour le calcul du total facturable puis de la marge.</p>
          </>
        )}

        {section === 'billing' && (
          <>
            <h3>Facturation et P&L</h3>
            <p>L’onglet Facturation permet de générer une facturation mensuelle (mois, nombre de jours, taux MAD/EUR).</p>
            <p><strong>Règles :</strong></p>
            <ul>
              <li>CA base = somme (TJM × jours) des ressources productives du client + charges refacturables converties en €</li>
              <li>Marge = CA base × marge du périmètre (intra-groupe ou hors-groupe)</li>
              <li>Total client = CA base + Marge</li>
            </ul>
            <p>Deux tableaux P&L sont affichés : <strong>P&L Intra-groupe</strong> (clients en intra-groupe) et <strong>P&L Hors-groupe</strong> (clients hors-groupe), avec totaux distincts. L’export CSV reprend toutes les lignes avec le périmètre.</p>
          </>
        )}

        {section === 'settings' && (
          <>
            <h3>Paramètres</h3>
            <p><strong>Paramètres généraux :</strong></p>
            <ul>
              <li><strong>Modèle TJM</strong> : Par profil ou Par niveau</li>
              <li><strong>Marge intra-groupe (%)</strong> : appliquée aux clients en périmètre Intra-groupe</li>
              <li><strong>Marge hors-groupe (%)</strong> : appliquée aux clients Hors-groupe (marché local)</li>
              <li>Marge Outsourcing, Jours productifs/an, Taux change budget (MAD/EUR)</li>
            </ul>
            <p><strong>Frais généraux</strong> : postes (loyers, maintenance, etc.) en MAD, intégrés dans les charges indirectes.</p>
            <p><strong>Données :</strong> Export backup (JSON), Import backup (remplace les données), Réinitialisation (réservée aux administrateurs).</p>
          </>
        )}
      </div>
    </div>
  );
}
