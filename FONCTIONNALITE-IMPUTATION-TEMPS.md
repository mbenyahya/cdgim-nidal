# Imputation du temps – Spécification fonctionnelle

## 1. Objectif

Permettre aux **collaborateurs** d’imputer directement leur temps (jours/heures) sur des **projets** et **clients**, afin d’alimenter les données de facturation (volume) en **TJM** ou **à l’acte**. Les saisies sont **validées par le manager**. L’outil s’**interface avec le SIRH** pour récupérer les jours d’absence validés.

---

## 2. Acteurs et rôles

| Rôle | Description |
|------|-------------|
| **Collaborateur** | Saisit son temps sur les projets qui lui sont assignés ; consulte l’historique de ses imputations. |
| **Manager** | Assigne les collaborateurs aux projets ; valide ou rejette les imputations de son équipe. |
| **Administrateur** | Gère projets, assignations, paramètres ; accès complet. |

*(Les rôles existants « Expert » / « User » peuvent être alignés ou étendus.)*

---

## 3. Authentification

- **Compte entreprise** : chaque collaborateur se connecte avec son **compte entreprise** (SSO / annuaier).
- À prévoir selon votre environnement :
  - **LDAP / Active Directory** : connexion avec identifiant et mot de passe entreprise.
  - **OAuth2 / SAML** (Azure AD, Okta, etc.) : authentification déléguée.
- En attendant une SSO réelle : **comptes utilisateurs en base** (login/mot de passe) avec champs « compte entreprise » ou « email » pour une future liaison SSO.

---

## 4. Données métier

### 4.1 Projets

- Un **projet** est rattaché à un **client** (ou à une BU).
- Champs utiles : nom, code, client, date début/fin, type de facturation (TJM / à l’acte), statut (actif, clôturé).
- Seuls les projets **actifs** et **assignés** au collaborateur apparaissent dans sa liste de saisie.

### 4.2 Assignation collaborateur ↔ projet

- Le **manager** (ou l’admin) assigne des **collaborateurs** à des **projets**.
- Une assignation peut avoir : date début/fin, taux d’allocation (%), rôle sur le projet (optionnel).
- Le collaborateur ne voit que les projets pour lesquels il a une assignation **en cours** (période courante).

### 4.3 Imputations (saisie de temps)

- **Qui** : collaborateur (ressource).
- **Sur quoi** : projet (donc client implicite).
- **Quand** : date (jour).
- **Volume** : nombre de jours (ex. 0,5 ; 1) ou heures selon le mode (TJM / à l’acte).
- **Type** : TJM (journée) ou à l’acte (unité, livrable, etc.) si le projet le permet.
- **Statut** : brouillon → soumis → validé / rejeté (par le manager).
- **Commentaire** (optionnel) : détail de l’activité.

Contraintes possibles :

- Pas d’imputation sur un jour d’**absence validée** (SIRH) sauf règle métier contraire.
- Plafond par projet / par mois selon paramétrage (optionnel).

### 4.4 Jours d’absence (SIRH)

- Données à récupérer depuis le **SIRH** : jours d’absence **validés** (congés, RTT, maladie, etc.) par collaborateur et par date.
- Usage dans CGDim :
  - **Facturation / volume** : ne pas compter ces jours comme productifs (ou les traiter selon les règles métier).
  - **Saisie** : avertissement ou blocage si le collaborateur impute sur un jour déclaré absent dans le SIRH (selon règle choisie).

---

## 5. Interface collaborateur (saisie)

- **Authentification** : connexion avec **compte entreprise** (SSO ou compte CGDim lié).
- **Page « Mes imputations »** :
  - Filtres : période (semaine / mois), projet, statut.
  - Liste des imputations (date, projet, volume, type TJM/acte, statut).
  - Actions : créer, modifier (brouillon uniquement), soumettre, annuler.
- **Saisie d’une imputation** :
  - Choix du **projet** dans la liste des projets **assignés** au collaborateur.
  - Date, volume (jours ou heures), type (TJM / à l’acte si applicable), commentaire.
  - Enregistrement en brouillon ou envoi en validation.
- **Historique** : consultation des imputations soumises, validées ou rejetées (avec motif de rejet si présent).

---

## 6. Interface manager (validation)

- **Page « Validations »** (ou « Imputations à valider ») :
  - Filtres : période, collaborateur, projet, statut (soumis, validé, rejeté).
  - Liste des imputations **soumises** par les collaborateurs de son équipe.
- **Actions** :
  - **Valider** : passage au statut « validé » ; les données sont alors utilisables pour le CA / facturation.
  - **Rejeter** : passage au statut « rejeté » avec motif (optionnel) ; le collaborateur peut corriger et resoumettre.
- Option : **validation en lot** (plusieurs imputations en une fois).

---

## 7. Lien avec la facturation (CA / volume)

- Les imputations **validées** alimentent :
  - Le **volume** (jours ou unités) par projet / client / ressource.
  - Le calcul du **CA** : volume × TJM (ou tarif à l’acte) selon le paramétrage du projet.
- Les écrans existants (Dashboard, Facturation, Billing) peuvent être alimentés par :
  - Les **ressources** + **grilles TJM** (comportement actuel), et/ou
  - Les **imputations validées** (source de vérité pour le volume réel).

À définir : soit les imputations remplacent le calcul « théorique » (effectifs × TJM), soit elles coexistent (prévision vs réalisé).

---

## 8. Interface SIRH

- **Objectif** : récupérer les **jours d’absence validés** (congés, RTT, arrêt maladie, etc.) par collaborateur et par date.
- **Modalités** à définir avec votre SIRH :
  - **API REST** (recommandé) : appel périodique ou en temps réel (collaborateur, période, type d’absence, statut « validé »).
  - **Fichier** (CSV/Excel) : export SIRH puis import dans CGDim (planifié ou manuel).
  - **Connecteur** : si le SIRH propose un connecteur (ex. SFTP, API spécifique), l’adapter côté CGDim.
- **Données minimales** :
  - Identifiant collaborateur (ou matricule, email) pour faire le lien avec la **ressource** CGDim.
  - Date début, date fin (ou liste de dates).
  - Type d’absence (congés, RTT, maladie, etc.).
  - Statut (validé / refusé) – ne garder que « validé ».
- **Fréquence** : quotidienne ou hebdomadaire selon besoin et capacité du SIRH.

En l’absence du détail du SIRH, on prévoit un **modèle de données « Absence »** et un **service d’intégration** (appel API ou lecture de fichier) à brancher ensuite.

---

## 9. Modèle de données proposé (résumé)

| Entité | Rôle |
|--------|------|
| **Project** | Projet (nom, code, client, type facturation TJM/acte, dates, statut). |
| **Assignment** | Assignation ressource ↔ projet (manager, dates, taux, rôle). |
| **TimeEntry** | Imputation (ressource, projet, date, volume, type TJM/acte, statut, validé par, date validation). |
| **Absence** | Jours d’absence (ressource, date début, date fin, type, source SIRH, statut). |
| **User** (étendu) | Compte utilisateur (login, lien ressource, rôle, compte entreprise / email pour SSO). |

---

## 10. Plan de mise en œuvre proposé

### Phase 1 – Fondations
1. **Utilisateurs et authentification**  
   Comptes utilisateurs (login / mot de passe) liés à une **ressource** et un **rôle** (collaborateur, manager, admin). Prévoir champs pour liaison SSO (email, identifiant entreprise).
2. **Projets**  
   CRUD Projets (nom, code, client, type facturation, dates, statut).
3. **Assignations**  
   CRUD Assignations (ressource, projet, manager, période, taux).

### Phase 2 – Imputations et workflow
4. **Imputations (time entries)**  
   CRUD Imputations avec statuts : brouillon, soumis, validé, rejeté.
5. **Interface collaborateur**  
   « Mes projets », « Mes imputations », formulaire de saisie, envoi en validation.
6. **Interface manager**  
   Liste des imputations à valider, actions Valider / Rejeter (avec motif).

### Phase 3 – Données et facturation
7. **Utilisation des imputations validées**  
   Alimentation du volume et du CA (Dashboard / Facturation) à partir des imputations validées (en complément ou remplacement du calcul actuel).
8. **Absences**  
   Modèle Absence + écran ou API d’import (fichier ou API SIRH).
9. **Règles métier**  
   Contrôles (absence SIRH, plafonds, doublons) et alertes dans l’interface.

### Phase 4 – SSO et SIRH
10. **Authentification entreprise**  
    Connexion SSO (LDAP/OAuth2/SAML) selon votre environnement.
11. **Connecteur SIRH**  
    Appel API ou lecture de fichier pour synchroniser les absences validées.

---

## 11. Points à clarifier avec vous

1. **SIRH** : quel produit (nom, version) ? API disponible (doc, sandbox) ou uniquement export fichier ?
2. **SSO** : annuaier utilisé (Active Directory, Azure AD, autre) ? Souhaitez-vous SSO en phase 1 ou après les imputations ?
3. **Manager** : un collaborateur est-il manager d’une **liste fixe de ressources** (équipe) ou manager **par projet** ?
4. **À l’acte** : unité de saisie (heures, lots, livrables) et règle de facturation (tarif unitaire par type d’acte).
5. **Période de saisie** : fenêtre autorisée (ex. saisie du mois N jusqu’au 5 du mois N+1) et règles de clôture.

Dès que vous précisez ces points (même partiellement), on peut détailler les écrans, les APIs et l’implémentation technique (backend Spring, frontend React, base PostgreSQL déjà prévus).