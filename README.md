# CGDim (appli-nidal)

Application de **pilotage financier** : grilles TJM, ressources, clients, projets, assignations, facturation intra-groupe et hors-groupe (marché local), P&L dual.

## Structure du projet

| Dossier | Description |
|--------|-------------|
| **backend-spring** | API Spring Boot 3 (Java 17), JWT, PostgreSQL, JPA |
| **frontend** | Interface React (Vite), Dashboard, Facturation, Guide utilisateur |


**Stack utilisée** : backend-spring + frontend (Vite/React).

## Prérequis

- **Java 17+** et **Maven**
- **Node.js** (LTS)
- **PostgreSQL** (installé et démarré)

## Démarrage rapide

1. **Créer la base PostgreSQL** (une fois)  
   Exécuter `backend-spring/creer-base-cgdim.sql` dans pgAdmin (voir `COMMENT-DEMARRER.txt`).

2. **Lancer le backend**  
   Double-clic sur `1-DEMARRER-BACKEND.bat` (ou `cd backend-spring && mvn spring-boot:run`).

3. **Lancer le frontend**  
   Double-clic sur `2-DEMARRER-FRONTEND.bat` (ou `cd frontend && npm install && npm run dev`).

4. **Ouvrir** [http://localhost:5173](http://localhost:5173)  
   Connexion par défaut : **admin** / **admin**.

## Documentation

- **COMMENT-DEMARRER.txt** – Instructions de démarrage et dépannage
- **backend-spring/POSTGRESQL.md** – Configuration PostgreSQL
- **AMELIORATIONS-FONCTIONNELLES.md** – Liste des améliorations
- **FONCTIONNALITE-IMPUTATION-TEMPS.md** – Spécification imputation temps
- **Guide utilisateur** – Dans l’application (onglet 📘 Guide utilisateur)

## Licence

Usage interne / projet CGDim.
