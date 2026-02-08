# CGDim (appli-nidal) – Améliorations fonctionnelles

Document d’analyse et de pistes pour enrichir l’application d’un point de vue fonctionnel.

---

## 1. Ce qui existe déjà

- **Authentification** : login par nom + rôle (admin / expert / user).
- **Dashboard** : KPIs (effectifs, CA, charges, marge), graphiques (répartition par profil, top 5 clients, synthèse).
- **Profils & Niveaux** : création/suppression de profils et niveaux (1–8).
- **Grilles TJM** : TJM par profil et par niveau.
- **Ressources** : productifs / non productifs, liaison client/profil, salaire, primes.
- **Clients/BU** : liste, ajout, suppression.
- **Charges refacturables** : liste, ajout, suppression (type, client, montant MAD, date).
- **Facturation** : simulation par mois, jours ouvrés, taux MAD/EUR, lignes par client.
- **Paramètres** : marges, jours productifs, taux, frais généraux (overhead), export JSON, reset (admin).

---

## 2. Améliorations rapides (impact fort, effort modéré)

### 2.1 Édition des données existantes
- **Problème** : on peut seulement ajouter/supprimer, pas modifier.
- **À faire** :
  - **Clients** : formulaire ou ligne éditable (nom, code, description).
  - **Charges** : éditer type, client, montant, date, description.
  - **Ressources** : éditer nom, type, profil, client, salaire, primes, date début.
  - **Profils / Niveaux** : éditer nom, code, salaire moyen (ou libellé/niveau).
- **Bénéfice** : moins de suppressions/re-créations, moins d’erreurs.

### 2.2 Recherche et filtres
- **Tables concernées** : Ressources, Clients, Charges.
- **À faire** :
  - Champ de recherche texte (nom, code, etc.).
  - Filtres : par client, par type (productif / non productif), par profil, par période (charges).
- **Bénéfice** : navigation plus rapide dès que les volumes augmentent.

### 2.3 Rafraîchissement et feedback
- **Dashboard** : bouton « Rafraîchir » visible (déjà `onRefresh`, à mettre en avant).
- **Messages** : toasts ou bandeaux de succès après sauvegarde / suppression (au lieu de simples `alert`).
- **Chargement** : indicateurs clairs (spinner ou désactivation des boutons) sur toutes les actions longues.

### 2.4 Facturation
- **Export** : bouton « Exporter en Excel » ou « CSV » pour la grille de facturation du mois.
- **Impression** : vue « imprimable » ou PDF simple (même basique) pour partager avec le client.

### 2.5 Paramètres
- **Modèle TJM** : choix explicite dans l’UI (Profil vs Niveau), synchronisé avec les paramètres existants.
- **Import** : restauration d’un backup JSON (fichier choisi → appel API import → rechargement).

---

## 3. Enrichissements à moyen terme

### 3.1 Authentification et utilisateurs
- **Vrais utilisateurs** : mot de passe (hashé), email, nom/prénom.
- **Gestion des comptes** (admin) : liste des utilisateurs, création/désactivation, attribution des rôles.
- **Session** : « Se souvenir de moi », durée de session configurable, déconnexion automatique après inactivité.
- **Mot de passe oublié** : flux simple (lien ou code par email si SMTP configuré).

### 3.2 Ressources
- **Date de fin** : pour gérer départs et historisation.
- **Historique** : garder les anciennes valeurs (salaire, client, profil) pour les rapports passés.
- **Import en masse** : CSV/Excel (nom, type, profil, client, salaire, etc.) avec mapping des colonnes et rapport d’erreurs.

### 3.3 Dashboard
- **Période** : choix mois ou année pour les indicateurs (au lieu d’un calcul figé).
- **Comparaison** : même mois année N-1, ou mois précédent.
- **Drill-down** : clic sur un segment (ex. profil) → détail des ressources ou des lignes de CA.
- **Export** : dashboard en PDF ou Excel (tableaux + graphiques en image).

### 3.4 Charges et facturation
- **Récurrence** : charges mensuelles récurrentes (montant fixe, date de début/fin).
- **Factures** : génération de « factures » (PDF) par client et par mois (à partir des données Billing existantes).
- **Devis** : enregistrement de devis (TJM, jours, marge) avec statut (brouillon / envoyé / gagné / perdu).

### 3.5 Données et paramètres
- **Devises** : affichage possible en MAD ou EUR (toggle ou paramètre par écran).
- **Multi-société / multi-entité** : si besoin de séparer CGDim Maroc / Outsourcing avec des jeux de données ou filtres dédiés.

---

## 4. Évolutions plus lourdes (long terme)

### 4.1 Persistance et robustesse
- **Base de données** : remplacer (ou compléter) le fichier JSON par une base (PostgreSQL, H2, etc.) avec des entités claires (Profile, Level, Resource, Client, Charge, Settings).
- **Sauvegardes** : sauvegardes automatiques (export JSON ou dump DB) et restauration depuis l’interface.

### 4.2 Audit et conformité
- **Journal d’audit** : qui a modifié quoi et quand (utilisateur, date, entité, ancienne/nouvelle valeur).
- **Traçabilité** : sur les champs sensibles (TJM, marges, salaires) pour les rapports et contrôles.

### 4.3 Reporting avancé
- **Rapports prédéfinis** : ex. « CA par client sur 12 mois », « Évolution des effectifs », « Coût par département ».
- **Planification** : envoi automatique de rapports (PDF/Excel) par email (quotidien, hebdo, mensuel).

### 4.4 UX / accessibilité
- **Responsive** : tables en cartes ou listes sur mobile, navigation adaptée.
- **Thème** : mode clair/sombre.
- **Accessibilité** : contrastes, labels, navigation clavier (WCAG basique).

### 4.5 Intégrations
- **API** : exposition d’API REST documentées (OpenAPI) pour intégration avec d’autres outils (compta, paie, CRM).
- **SSO** : connexion via annuaier d’entreprise (LDAP, OAuth2, SAML) si besoin.

---

## 5. Priorisation suggérée

| Priorité | Thème                    | Exemples d’actions                                      |
|----------|--------------------------|----------------------------------------------------------|
| P1       | Édition                  | Édition Client, Charge, Ressource, Profil/Niveau        |
| P1       | Recherche / filtres      | Recherche + filtres sur Ressources, Clients, Charges     |
| P2       | Facturation              | Export Excel/CSV, vue imprimable / PDF                    |
| P2       | Paramètres               | Choix modèle TJM, import backup JSON                     |
| P2       | UX                       | Toasts, bouton Rafraîchir, indicateurs de chargement      |
| P3       | Auth                     | Mots de passe, gestion des utilisateurs                 |
| P3       | Ressources               | Date de fin, import CSV                                  |
| P3       | Dashboard                | Période, comparaison, drill-down, export                  |
| P4       | Données                  | Base de données, sauvegardes auto                       |
| P4       | Audit / reporting        | Journal d’audit, rapports planifiés                     |

---

## 6. Par où commencer concrètement

1. **Édition** : ajouter une route `PUT` et un formulaire (ou modal) d’édition pour **Clients** (le plus simple), puis faire de même pour **Charges** et **Ressources**.
2. **Recherche** : un champ « Rechercher » au-dessus des tableaux Ressources et Clients, filtre côté front (puis optionnellement côté API).
3. **Facturation** : bouton « Télécharger CSV » sur la page Facturation qui génère un fichier à partir des `result.lines` déjà affichées.

Ces trois chantiers améliorent fortement l’usage au quotidien sans toucher à l’architecture globale. Ensuite, on peut enchaîner sur l’import/export des paramètres, puis sur l’authentification et la base de données selon vos besoins réels.
