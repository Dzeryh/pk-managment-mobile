# pk-managment-mobile

Application **Android** de **P&K Business Manager** (gestion commerciale mono-boutique
P&K Fashion and Tech) — React Native avec **Expo SDK 58**, TypeScript strict.

Sprint 1 : fondations (navigation, thème, client HTTP, connectivité, i18n) et
authentification complète (connexion, session persistée, refresh automatique,
déconnexion).

## Prérequis

- Node.js 22+
- **Expo Go** sur un téléphone Android, ou un émulateur Android (Android Studio)
- L'API démarrée : dépôt `pk-managment-backend`, `npm run db:setup` puis
  `npm run start:dev` (écoute sur le port 3000)

## Installation

```bash
npm install
cp .env.example .env     # facultatif : seulement pour changer l'URL de l'API
```

## Lancer l'application

```bash
npm start        # serveur Expo : « a » pour l'émulateur Android, QR code pour un téléphone
npm run android  # démarre directement sur l'émulateur
```

### URL de l'API

L'URL est lue au démarrage depuis `app.config.ts`, qui utilise
`EXPO_PUBLIC_API_URL` (fichier `.env`, non versionné) et retombe sur
`http://10.0.2.2:3000/api`.

| Cible | Valeur de `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Émulateur Android | `http://10.0.2.2:3000/api` (défaut) |
| Téléphone physique, même Wi-Fi | `http://<IP-DU-POSTE>:3000/api` |
| Simulateur iOS | `http://localhost:3000/api` |

Pour un téléphone physique : l'API doit être joignable depuis le réseau local
(le backend écoute sur toutes les interfaces avec `npm run start:dev`), le
pare-feu du poste doit autoriser le port 3000, et le téléphone doit être sur le
même réseau. Redémarrer `npx expo start` après toute modification du `.env`.

Le compte de développement vient du seed backend : `admin@pk.local` / `Admin1234`.

## Scripts

| Script | Effet |
| --- | --- |
| `npm start` | Serveur de développement Expo |
| `npm run android` | Démarre sur l'émulateur Android |
| `npm run typecheck` | `tsc --noEmit`, TypeScript strict |
| `npm run lint` | ESLint (preset Expo) |
| `npm test` | Jest + React Native Testing Library |
| `npm run test:watch` | Tests en continu |
| `npm run web` | Version navigateur (dépannage uniquement) |

## Structure (feature-first)

```
App.tsx                        providers (requête, zone sûre) + restauration de session
index.ts                       point d'entrée Expo
app.config.ts                  configuration Expo, EXPO_PUBLIC_API_URL -> expo.extra.apiUrl
src/
  core/
    api/                       client fetch unique, rotation du refresh, erreurs du contrat
    config/                    URL de l'API, délai, clés SecureStore
    connectivity/              hook NetInfo (En ligne / Hors ligne)
    format/                    formatMGA() identique au frontend
    i18n/                      dictionnaire français, structure prête pour le malgache
    query/                     QueryClient TanStack Query
    security/                  SecureStore, paire de jetons, deviceId / deviceName
    theme/                     couleurs, typographie, espacements, cible tactile 44 px
  features/
    auth/
      api/                     login, restauration, /me, logout
      screens/                 LoginScreen
      store/                   store Zustand (statut, utilisateur, erreur)
    home/ articles/ stock/ sales/ more/   écrans (accueil + placeholders métier)
  navigation/                  aiguillage racine, pile d'auth, onglets principaux
  shared/
    components/                AppScreen, AppHeader, Button, TextField, bandeaux…
    types/                     objets du contrat d'API (User, AuthResponse, erreurs)
```

Règle de dépendance : `features` → `core` / `shared`, jamais l'inverse ;
`core` ne dépend d'aucune feature.

## Navigation

- **Splash** pendant la restauration de session.
- **Pile d'authentification** (`Login`) tant que la session est absente.
- **Onglets principaux** une fois connecté : Accueil, Articles, Stock, Ventes, Plus.
  Les quatre modules métier affichent un écran d'attente explicite (aucun faux
  contenu) ; l'onglet Plus contient le compte et la déconnexion.

L'aiguillage se fait par l'état du store, pas par navigation manuelle : un jeton
invalide ramène automatiquement à l'écran de connexion.

## Sécurité des jetons

- **Access token et refresh token** : `expo-secure-store` uniquement (Keystore
  Android / Keychain iOS, lisibles appareil déverrouillé, non sauvegardés dans le
  cloud). Jamais `AsyncStorage`, jamais dans un fichier, jamais dans un log.
- L'access token est gardé en cache mémoire pour construire l'en-tête
  `Authorization` ; la source de vérité reste SecureStore.
- **deviceId** : UUID v4 généré au premier lancement et conservé dans SecureStore.
- **deviceName** : modèle de l'appareil (`expo-device`), tronqué à 120 caractères.
- Aucun secret n'est embarqué dans l'application : seule l'URL de l'API est
  configurée, et ce n'est pas un secret.

## Authentification

1. `POST /api/auth/login` avec `X-Client-Type: mobile`,
   `{ identifier, password, deviceId, deviceName }`.
2. Réponse `{ accessToken, refreshToken, expiresIn, user }` : les deux jetons
   partent dans SecureStore.
3. Au démarrage, si des jetons existent : `POST /api/auth/refresh` avec
   `{ refreshToken, deviceId }` dans le corps, puis `GET /api/me`.
4. Sur un `401` d'une requête authentifiée : **une seule** rotation est lancée,
   même si plusieurs requêtes échouent en parallèle (« single flight »). Le
   nouveau couple remplace l'ancien, puis la requête est rejouée une fois.
5. Refresh rejeté (4xx) : jetons effacés et retour à l'écran de connexion.
   Panne réseau, délai dépassé, `5xx` ou `429` : les jetons sont conservés, car
   le serveur n'a pas invalidé la session.
6. `POST /api/auth/logout` avec le refresh token dans le corps, puis effacement
   local — même si le serveur est injoignable.

## Erreurs

Toutes les erreurs passent par `ApiError` (`src/core/api/errors.ts`) :

| Situation | Message affiché |
| --- | --- |
| Identifiants refusés (401) | message français du backend (« Identifiants invalides. ») |
| Trop de tentatives (429) | « Trop de tentatives. Patientez un instant avant de réessayer. » |
| Validation (400) | premier message du backend |
| Panne réseau | « Impossible de contacter le serveur. Vérifiez votre connexion. » |
| Délai dépassé (15 s) | « Le serveur met trop de temps à répondre. Réessayez. » |
| 5xx | « Une erreur est survenue. Réessayez plus tard. » |

Aucun message technique brut n'est affiché.

## Vérifier

```bash
npm run typecheck
npm run lint
npm test
```

Les tests couvrent : en-têtes et délai du client, single flight et rotation du
refresh, rejet/expiration, service d'authentification (login, restauration,
logout), store Zustand, et écran de connexion (validation, succès, 401, 429).

## Limites connues (sprint 1)

- Mode hors ligne **non implémenté** (sprints 6 à 8) : l'indicateur NetInfo est
  informatif et l'accueil n'interroge pas l'API hors ligne. Le stockage local et
  la file de synchronisation se brancheront sur `src/core/api/client.ts`.
- `TODO(S7)` dans `src/features/auth/api/auth-api.ts` : la déconnexion ne devra
  jamais supprimer les opérations en attente non synchronisées.
- Pas d'écran de changement de mot de passe sur mobile (le backend l'expose).
- Les modules Articles, Stock, Ventes et le tableau de bord réel arrivent aux
  sprints suivants.

## Décisions

Les choix non couverts par le contrat sont consignés dans
`../docs/decisions.md` (D20 pour le mobile).
