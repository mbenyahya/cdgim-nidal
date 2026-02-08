# PostgreSQL - CGDim

L'application utilise **PostgreSQL** comme base de données (remplacement du fichier JSON).

## 1. Installer PostgreSQL

- Téléchargez PostgreSQL : https://www.postgresql.org/download/windows/
- Installez et notez le mot de passe de l'utilisateur `postgres`.

## 2. Créer la base et l'utilisateur

Dans **pgAdmin** ou en ligne de commande (`psql -U postgres`) :

```sql
CREATE USER cgdim WITH PASSWORD 'cgdim';
CREATE DATABASE cgdim OWNER cgdim;
```

(Changez le mot de passe en production.)

## 3. Configuration

Par défaut, l'application utilise :

- **URL** : `jdbc:postgresql://localhost:5432/cgdim`
- **Utilisateur** : `cgdim`
- **Mot de passe** : `cgdim`

Pour changer (variables d'environnement ou `application.properties`) :

- `SPRING_DATASOURCE_URL` (ex. `jdbc:postgresql://localhost:5432/cgdim`)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

## 4. Schéma

Au premier démarrage, **Hibernate** crée les tables automatiquement (`spring.jpa.hibernate.ddl-auto=update`) :

- `profiles` – profils métiers
- `levels` – niveaux (1–8)
- `clients` – clients / BU
- `resources` – ressources (productives / non productives)
- `charges` – charges refacturables
- `app_settings` – paramètres (marges, taux, TJM, frais généraux)
- `tjm_entries` – grilles TJM (profil / niveau)
- `users` – utilisateurs (login, rôle, lien ressource)
- `projects` – projets (client, facturation TJM/ACTE)
- `assignments` – assignations ressource ↔ projet

## 5. Démarrer l'application

1. Démarrer PostgreSQL.
2. Lancer le backend : `mvn spring-boot:run` ou le script `1-DEMARRER-BACKEND.bat`.

Si la base ou l'utilisateur n'existent pas, vous verrez une erreur de connexion ; créez-les puis relancez.
