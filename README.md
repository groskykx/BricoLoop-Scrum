# BricoLoop

API Node.js + Express de prêt d'outils entre voisins : chacun publie les outils qu'il possède, les autres peuvent les consulter et les emprunter.

Projet réalisé dans le cadre de l'atelier Scrum EPSI B3.

**Product Goal :** un voisin peut emprunter un outil disponible près de chez lui en quelques clics, et le propriétaire garde la main sur ses prêts.

## Équipe Bricoloop

| Lettre | Membre |
|---|---|
| A | Kylian Vesanes |
| B | Valentin Broennec |
| C | Ayoub Eshaiti |

## Rotation des rôles

Le PO du sprint ne code pas ; PO et SM sont deux personnes différentes.

| Sprint | Product Owner | Scrum Master | Developers |
|---|---|---|---|
| Lancement / Sprint 0 | Kylian (A) | — | Valentin, Ayoub |
| Sprint 1 | Kylian (A) | Valentin (B) | Valentin, Ayoub |
| Sprint 2 | Valentin (B) | Ayoub (C) | Kylian, Ayoub |
| Sprint 3 | Ayoub (C) | Kylian (A) | Kylian, Valentin |

## Démarrage

Prérequis : Node.js 22.12 ou plus récent (Vitest 5 et ESLint 10 l'exigent ; la CI tourne sur Node 24).

```bash
npm install      # installe les dépendances
npm start        # lance l'API sur http://localhost:3000 (port modifiable via PORT)
npm run check    # lint (0 warning toléré) + tests vitest
```

Vérification rapide : `GET http://localhost:3000/health` doit répondre `{ "status": "ok" }`.

L'utilisateur courant est choisi avec l'en-tête HTTP `X-User-Id` : `u1` (Camille), `u2` (Yanis), `u3` (Léa) ou `u4` (Hugo) dans les données de démo.

**Interface web :** après `npm start`, ouvrir **http://localhost:3000/**. On choisit son profil en haut de la page, on clique sur un outil du panneau pour voir sa fiche et le demander, puis on prend le profil du propriétaire pour accepter, refuser ou déclarer le retour. Les erreurs de l'API s'affichent dans le bandeau.

**Démo par requêtes :** le fichier [`demo.http`](demo.http) rejoue tout le parcours, requête par requête, avec l'extension VS Code « REST Client » (bouton *Send Request* au-dessus de chaque requête).

## API

| Méthode et route | Story | Rôle | Codes |
|---|---|---|---|
| `GET /` | US-09 | Interface web | 200 |
| `GET /api/users` | US-09 | Profils des voisins, pour l'interface | 200 |
| `GET /health` | T-02 | Santé de l'API | 200 |
| `GET /api/tools` | US-01 | Catalogue, outils disponibles en premier | 200 |
| `GET /api/tools/:id` | US-03 | Fiche d'un outil et de son propriétaire | 200, 404 |
| `POST /api/tools` | US-02 | Proposer un outil `{ name, category, description? }` | 201, 400, 401 |
| `POST /api/loans` | US-04, US-06 | Demander un outil `{ toolId, startDate, endDate }` | 201, 400, 401, 404, 409 |
| `POST /api/loans/:id/accept` | US-05, US-06 | Le propriétaire accepte une demande | 200, 401, 403, 404, 409 |
| `POST /api/loans/:id/refuse` | US-05 | Le propriétaire refuse une demande | 200, 401, 403, 404, 409 |
| `POST /api/loans/:id/return` | US-07 | Le propriétaire déclare le retour | 200, 401, 403, 404, 409 |

Les dates sont au format `AAAA-MM-JJ`. Catégories : Perçage, Jardinage, Peinture, Nettoyage, Mesure, Autre.

## Règles de travail

- Une branche par story, créée depuis `main` à jour : `chore/T-02-outillage`, `feature/US-01-catalogue`…
- Commits préfixés : `feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`. Les tests d'une story sont commités avant son code.
- `npm run check` doit passer avant chaque push. La CI GitHub Actions le relance sur chaque pull request : une PR rouge ne se merge pas.
- Personne ne pousse sur `main` : chaque branche part en pull request, relue puis mergée.

## Stories Done

| Story | Description | PR |
|---|---|---|
| T-01 | Dépôt Git de l'équipe et README | #1 |
| T-02 | Outillage qualité : lint, tests, `npm run check`, `GET /health` | #2 |
| T-03 | Données de démo : 4 voisins, 8 outils chargés au démarrage | #3 |
| T-04 | Intégration continue GitHub Actions (`npm run check` sur chaque PR) | #5 |
| US-01 | Consulter le catalogue des outils, disponibles en premier | #4 |
| T-05 | Revert de US-02 et US-03, mergées sans relecture au Sprint 1 | #11 |
| US-03 | Voir le détail d'un outil et de son propriétaire (relivraison) | #12 |
| US-04 | Demander l'emprunt d'un outil pour des dates précises | #13 |
| US-05 | Accepter ou refuser une demande | #15 |
| US-02 | Proposer un outil au prêt, avec validation des champs (relivraison) | #14 |
| US-06 | Empêcher les prêts qui se chevauchent | #16 |
| US-07 | Déclarer le retour d'un outil | #17 |

| US-09 | Interface web du parcours d'emprunt | #19 |

Non réalisées (Product Backlog) : US-08 et US-10 à US-14.

## Livrables

- Vidéo fonctionnelle : _lien à ajouter_
- Carnet de bord : [CARNET_DE_BORD.md](CARNET_DE_BORD.md)
