# Architecture Backend – Plateforme marsAI

Document de référence aligné sur le **Cahier des Charges Lyon NERD** (festival marsAI – courts-métrages 1 min générés par IA).

---

## 1. Stack technique

| Composant   | Technologie     |
|------------|-----------------|
| API        | Node.js (Express) |
| Base de données | MariaDB / MySQL |
| ORM        | Sequelize       |
| Auth       | JWT + bcrypt    |

---

## 2. Rôles utilisateurs (CdC §3)

| Rôle         | Code BDD     | Droits principaux |
|-------------|--------------|-------------------|
| Administrateur | `ADMIN`   | Dashboard, modération films (validation/refus + motif), gestion utilisateurs |
| Jury        | `JURY`        | Accès 50 finalistes, notation 1–10, commentaires internes |
| Réalisateur | `REALISATEUR` | Compte, profil public, soumission de films, suivi statut |
| Public      | —             | Galerie en lecture seule, filtres, newsletter (sans compte) |

---

## 3. Modèles de données

### 3.1 User (`users`)

- **Authentification** : `email`, `username`, `password` (bcrypt)
- **Rôle** : `role` (ADMIN | JURY | REALISATEUR)
- **Profil public** (réalisateur) : `biography`, `country` (ISO), `socialLinks` (JSON)
- **Préférences** : `newsletter`, `preferredLanguage` (fr | en)

### 3.2 Film (`films`)

- **Contenu** : `title`, `description`, `duration` (1–60 s), `youtubeId`, `posterPath`, `country`
- **Workflow** : `status` (PENDING → APPROVED | REJECTED → SELECTION_OFFICIELLE | HORS_COMPETITION)
- **Modération** : `rejectionReason` (obligatoire si refus)
- **Fiche IA** (CdC §4.2) : `aiIdentity` (JSON : scenario, image, video, sound, postProduction)
- **Lien** : `userId` → Réalisateur

### 3.3 JuryRating (`jury_ratings`)

- **Notation** : `filmId`, `userId` (jury), `score` (1–10), `internalComment` (non public)
- Contrainte unique `(film_id, user_id)`.

### 3.4 NewsletterSubscriber (`newsletter_subscribers`)

- `email`, `userId` (optionnel), `language`, `subscribedAt`.

### 3.5 Event / EventRegistration (bonus – CdC §11)

- **Event** : agenda physique (workshop, conference, projection, closing), dates, `maxParticipants`, lieu.
- **EventRegistration** : réservation (eventId, userId), jauge gérée côté métier.

### 3.6 Notification (bonus – CdC §10)

- Alertes (WebSockets) : `userId`, `type` (FILM_VALIDATED, FILM_REJECTED, SELECTION_OFFICIELLE, etc.), `message`, `read`.

### 3.7 SubmissionConfig (`submission_config`)

- Verrouillage temporel (CdC §4.1) : clés type `submission_opens_at`, `submission_closes_at` (période 2 mois). Vérification côté API avant toute soumission.

---

## 4. Associations (Sequelize)

- **User** → hasMany **Film** (réalisateur)
- **User** ↔ **JuryRating** ↔ **Film** (jury note les films)
- **User** → hasOne **NewsletterSubscriber**
- **Event** ↔ **EventRegistration** ↔ **User**
- **User** → hasMany **Notification**

---

## 5. Workflows principaux

1. **Soumission film** : Connexion réalisateur → formulaire → upload (YouTube ID + poster) → statut PENDING → modération admin (APPROVED + motif si refus) → mise en galerie ou sélection officielle.
2. **Jury** : Connexion → liste des films en SELECTION_OFFICIELLE (50 max) → notation 1–10 + commentaire interne.
3. **Galerie publique** : Liste des films APPROVED / SELECTION_OFFICIELLE / HORS_COMPETITION, pagination 20, filtres (type IA, pays, statut).

---

## 6. Sécurité (CdC §6)

- Requêtes préparées (Sequelize)
- Mots de passe hashés (bcrypt)
- Validation des entrées côté serveur
- Middleware d’auth JWT + contrôle des rôles sur les routes sensibles
- Vérification période de soumission côté serveur (SubmissionConfig)

---

## 7. Fichiers modèles

```
back/src/models/
├── index.js              # Associations + exports
├── User.js
├── Film.js
├── Video.js              # Legacy (à migrer vers Film si besoin)
├── JuryRating.js
├── NewsletterSubscriber.js
├── Event.js
├── EventRegistration.js
├── Notification.js
└── SubmissionConfig.js
```

L’application charge `./src/models/index.js` au démarrage pour enregistrer les associations, puis appelle `sequelize.sync()` (voir `back/index.js`).
