# CGDim Frontend - React

Frontend React (Vite) pour CGDim - Pilotage Financier. Consomme l'API **Spring Boot** (ou Node.js).

## Démarrage

```bash
cd frontend
npm install
npm run dev
```

Ouvre http://localhost:5173. Le proxy Vite envoie les requêtes `/api` vers le backend (port **8080** par défaut pour Spring Boot).

## Backend requis

Démarrer d'abord le backend **Spring Boot** :

```bash
cd ../backend-spring
mvn spring-boot:run
```

(Alternative : backend Node.js sur port 8000 — dans ce cas modifier `vite.config.js` pour cibler `http://localhost:8000`.)

## Build

```bash
npm run build
npm run preview
```
