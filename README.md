[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/lmmHya3U)
# Starter Kit (kit de démarrage) pour le projet MarsAI

## Prérequis

- Node.js 24+ (nvm)
- Express
- MySQL 8+
- React.js avec Vite

## Avoir la dernière version LTS de Node.js

```sh
nvm install 24.13.0

nvm use 24.13.0
```

## Installer les dépendences front et back

```sh
npm install
```

## Lancer le serveur back

```sh
npm run back
```

## Lancer le serveur front

```sh
npm run front
```

## Assets

Les assets du projet (images, icônes, etc.) sont stockés dans les répertoires suivants :

- **`front/src/assets/Image/`** - Images utilisées dans les pages du front
  - Utilisé pour les pages de test
  - Accessible via les composants React
  
Pour ajouter de nouveaux assets :
1. Placez vos fichiers dans le dossier `front/src/assets/Image/`
2. Importez-les dans vos composants : `import imageName from '../assets/Image/filename.ext'`
3. Utilisez-les dans votre JSX

### Intégrer les assets dans main.jsx

Pour combiner et utiliser les assets dans le point d'entrée principal (`front/src/main.jsx`) :

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// Importez vos assets
import logo from './assets/Image/logo.png'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Ensuite, utilisez les assets importés dans vos composants ou layouts.
