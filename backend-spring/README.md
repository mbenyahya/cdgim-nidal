# CGDim API - Spring Boot

Backend **Spring Boot 3** (Java 17) - API First, Security by design. JWT, CORS, rôles (admin, expert, user).

## Prérequis

- **JDK 17+**
- **Maven 3.8+** (ou exécuter depuis votre IDE : Run `CgdimApplication`)

## Utiliser back + front ensemble

1. **Démarrer le backend en premier** (port 8080) :
   ```bash
   cd backend-spring
   mvn spring-boot:run
   ```
   Ou depuis l’IDE : lancer la classe `com.cgdim.CgdimApplication`.

2. **Vérifier que le port 8080 est libre**  
   Si un autre logiciel utilise déjà le port 8080, Spring ne démarrera pas ou vous aurez des erreurs. Fermez l’autre application ou changez `server.port` dans `application.properties`.

3. **Démarrer le frontend** (port 5173) :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Ouvrir** http://localhost:5173  
   Le front envoie les appels API vers `/api/v1/...` ; Vite les redirige vers `http://localhost:8080/api/v1/...`. Vous n’avez rien à configurer côté CORS si vous utilisez ce proxy.

## API

- Base : **http://localhost:8080/api/v1**
- Login (sans token) : `POST /api/v1/auth/login` avec `{"username":"...","role":"admin|expert|user"}`
- Toutes les autres routes nécessitent le header : `Authorization: Bearer <token>`

## Configuration (application.properties)

- `server.port` : 8080 (défaut)
- `cgdim.jwt.secret` : clé JWT (en production utiliser une variable d'environnement)
- `cgdim.cors.origins` : origines CORS (défaut localhost:5173 pour le frontend React)
- `cgdim.data.file` : fichier JSON des données (défaut `data/cgdim_data.json`)

## Dépannage

- **« Connexion impossible » au login** : le backend n’est pas démarré ou n’écoute pas sur 8080. Vérifiez la console backend et que rien d’autre n’utilise le port 8080.
- **401 sur les requêtes après login** : le token n’est pas envoyé ou est invalide ; vérifiez que le front envoie bien `Authorization: Bearer <token>` (voir `frontend/src/api.js`).
- **CORS** : avec le proxy Vite, les requêtes partent de `localhost:5173` vers le même domaine (proxy) ; CORS n’intervient que si vous appelez directement `http://localhost:8080` depuis le navigateur.
