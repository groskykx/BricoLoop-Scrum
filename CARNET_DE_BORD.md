# Carnet de bord · Équipe Bricoloop

**Membres :** Kylian Vesanes (A) · Valentin Broennec (B) · Ayoub Eshaiti (C)
**Dépôt :** https://github.com/groskykx/BricoLoop-Scrum · **Tableau :** Trello « BricoLoop · Atelier Scrum EPSI B3 »
**Vidéo :** _lien à ajouter_

| Sprint | PO | SM | Developers |
|---|---|---|---|
| Lancement / Sprint 0 | Kylian | — | Valentin, Ayoub |
| Sprint 1 | Kylian | Valentin | Valentin, Ayoub |
| Sprint 2 | Valentin | Ayoub | Kylian, Ayoub |
| Sprint 3 | Ayoub | Kylian | Kylian, Valentin |

Le travail s'est fait en deux temps : l'atelier du 22/10, puis la reprise du 23/11 pour terminer les sprints. Les dates ci-dessous viennent de l'historique GitHub et du Trello.

---

## Lancement et Sprint 0 (PO Kylian)

- **Estimation :** le Planning Poker n'a pas été fait. Aucune story n'a de points, ce qui nous a privés de vélocité et de burndown pour toute la suite.
- **État à 11:15 :** Sprint 0 non terminé. T-01 (dépôt, README), T-02 (outillage lint et tests) et T-03 (données de démo) ont été mergés entre 12:28 et 12:57 (PR #1 à #3), sur le temps du Sprint 1.
- **Obstacle :** sur le poste de Valentin, l'installeur Node.js (MSI) a échoué. Contournement : version ZIP de Node ajoutée au PATH.
- **T-04 (CI GitHub Actions)**, prévu en bonus, a été livré au Sprint 1 (PR #5) sur Node 24 : Vitest 5 demande au minimum Node 22.12.

## Sprint 1 (PO Kylian · SM Valentin)

**Sprint Goal :** « Un voisin peut consulter le catalogue, ouvrir la fiche d'un outil et proposer le sien. »

| Story | PR | Résultat en Sprint Review |
|---|---|---|
| US-01 · Catalogue | #4 | ✅ Acceptée |
| US-03 · Fiche outil | #7 | ❌ Refusée : PR mergée sans approbation visible (DoD point 6) |
| US-02 · Proposer un outil | #8 | ❌ Non Done en fin de sprint, puis mergée par erreur sans relecture |

**Ce qui s'est passé :**
- La PR #4 (US-01), ouverte le 22/10, n'a été relue et mergée que le 23/11 : un mois d'attente.
- `main` n'était pas protégée, ce qui a permis les merges sans approbation.
- La PR #8 a été mergée après la décision du PO, par Claude Code depuis le compte de Valentin.
- **Décision du PO :** application stricte de la DoD. Une case manquante veut dire que la story n'est pas Done, même si le code fonctionne.

**Rétro :** Start, protéger `main` · Stop, merger sans approbation et laisser une PR attendre · Continue, tests avant le code, une branche par story.
**Action :** activer la protection de `main` (responsable : Kylian).

## Sprint 2 (PO Valentin · SM Ayoub)

**Sprint Goal :** « Rétablir un incrément conforme à la DoD, puis permettre à un voisin de demander un outil et au propriétaire d'y répondre. »

**Décisions du PO (notées sur les cartes avant le développement) :**
- US-04 : outil inconnu → 404 · indisponible → 409 · outil prêté demandable pour des dates futures · date passée ou mal formée → 400.
- US-05 : demande inconnue → 404 · les autres demandes en attente restent en attente · chevauchement reporté à US-06.

| Story | Dev | PR |
|---|---|---|
| T-05 · Revert de US-02 et US-03 | Kylian | #11 |
| US-03 · Fiche outil (relivraison) | Ayoub | #12 |
| US-04 · Demander un outil | Kylian | #13 |
| US-05 · Accepter / refuser | Ayoub | #15 |
| US-02 · Proposer un outil (relivraison) | Kylian | #14 |

**Ce qui s'est passé :**
- Le revert a d'abord remis `main` dans l'état de US-01 + T-04. Ensuite, chaque story a été relivrée sur sa propre branche, tests commités avant le code.
- La protection de `main` a été activée, mais le contournement administrateur restait possible. Les PR ont été mergées sans approbation « Approve », et les relectures de la #15 ont été envoyées en « Comment ».
- L'équipe travaillait sur un seul ordinateur. Les PR étant toutes ouvertes depuis le compte de Valentin, l'approbation devait venir d'un autre compte.
- **Consigne du formateur :** les relectures se font entre Valentin et Kylian uniquement.
- **Bug trouvé pendant le développement de US-04 :** le test « outil indisponible → 409 » faisait la demande avec le propriétaire de l'outil. C'est la règle « pas son propre outil » qui répondait. Le test a été corrigé.

**Sprint Review :** les critères de toutes les stories sont démontrés sur `main` (39 tests, parcours complet rejoué sur l'API). Le PO a refusé un nouveau revert : le code était intégré et testé, et l'écart venait d'un réglage, pas de la qualité.
**Rétro :** Stop, le contournement administrateur et les relectures en « Comment » · Continue, les décisions du PO écrites sur les cartes.

## Sprint 3 (PO Ayoub · SM Kylian)

**Sprint Goal :** « Le propriétaire garde la main : pas de prêts qui se chevauchent, et il peut déclarer le retour de son outil. »
**Choix du PO :** US-06 + US-07 plutôt que US-09 (interface web). Elles complètent le parcours métier ; la démo se fait avec `demo.http`.

| Story | Dev | PR | Règles |
|---|---|---|---|
| US-06 · Pas de chevauchement | Valentin | #16 | Seuls les prêts acceptés bloquent ; contrôle à la demande et à l'acceptation ; dates limites incluses ; fonction pure `overlaps()` testée seule |
| US-07 · Retour d'un outil | Kylian | #17 | 403 si pas propriétaire · 409 si le prêt n'est pas accepté · l'outil redevient disponible |

US-06 et US-07 ont été développées en parallèle. Le merge simulé des deux branches n'a donné aucun conflit (60 tests verts ensemble).

**Sprint Review :** _à compléter par le PO (Ayoub)_
**Rétro :** _à compléter par l'équipe_

---

## Bilan

**Incrément final :** 7 stories (US-01 à US-07) et 5 tâches techniques sur `main`. 60 tests automatisés, 0 warning de lint, CI verte. Les 20 requêtes du parcours de démo renvoient le code attendu.

**Ce qui a bien marché :**
- Les tests écrits avant le code, sur toutes les stories.
- La CI, qui a montré à chaque PR que le code tenait.
- Les règles du PO écrites sur les cartes avant de coder, qui ont évité les allers-retours.
- Une branche par story, avec peu de conflits.

**Ce qui a coincé :**
- Pas d'estimation : ni vélocité, ni burndown.
- Le point 6 de la DoD (relecture approuvée), qui a coûté un refus, un revert et une relivraison. La cause était technique (protection de `main` absente, puis contournable) et l'ordinateur était partagé.

**Outils :** Claude Code a été utilisé pour écrire le code et les tests, ouvrir les PR et tenir le Trello. Les commits le mentionnent en co-auteur.

**Retours des PO et apprentissages individuels :** _à compléter par chaque membre (3 à 4 lignes)._
