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

Prérequis : Node.js 20 ou plus.

```bash
npm install      # installe les dépendances
npm start        # lance l'API sur http://localhost:3000 (port modifiable via PORT)
npm run check    # lint (0 warning toléré) + tests vitest
```

Vérification rapide : `GET http://localhost:3000/health` doit répondre `{ "status": "ok" }`.

## Règles de travail

- Une branche par story, créée depuis `main` à jour : `chore/T-02-outillage`, `feature/US-01-catalogue`…
- Commits préfixés : `feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`.
- `npm run check` doit passer avant chaque push.
- Personne ne pousse sur `main` : chaque branche part en pull request, relue, approuvée et mergée par un autre membre.

## Stories Done

| Story | Description | PR |
|---|---|---|
| T-01 | Dépôt Git de l'équipe et README | #1 |

## Vidéo

Lien de la vidéo fonctionnelle : _à ajouter en fin de journée_.
