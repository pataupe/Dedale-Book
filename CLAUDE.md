# CLAUDE.md — Dédale-Book

Fichier de contexte projet pour Claude Code. À placer à la racine du repo (`Dedalofus/`).

## Profil du développeur

- Solo dev, ~2 ans d'expérience en Git, React, terminal, JavaScript, HTML, CSS, Node.js, Express, SQL.
- Pas de sur-explication du jargon de base nécessaire. Reste concret et direct.
- MySQL : niveau à confirmer/vérifier en début de session si besoin, pas encore pratiqué en profondeur sur ce projet.

## Le projet en une phrase

Un simulateur en ligne permettant aux joueurs de Dofus Touch de choisir un équipement complet (Dédale) pour leur personnage et de calculer les dégâts obtenus, en prévision d'un run du donjon "Dédale". Aucun outil équivalent n'existe actuellement (DofusBook ne couvre pas le Dédale) — le porteur de projet est seul sur ce créneau, d'où une priorité forte sur la rapidité de sortie du MVP.

## Stack technique

- **Frontend** : React (Vite, JavaScript, ESLint)
- **Backend** : Node.js + Express
- **Base de données** : MySQL — pas d'ORM, requêtes SQL écrites à la main
- **Pas de Next.js** : aucun bénéfice décisif, coût d'apprentissage non justifié
- Express + React n'imposent pas MongoDB ("MERN" est une convention de tutoriel, pas une contrainte) : MySQL est choisi car le modèle de données est fortement relationnel (utilisateur → personnages → stuffs → emplacements référençant cubes/breloques/sorts).

## Structure du repo (mono-repo)

```
Dedalofus/
  client/     → React (Vite)
  server/     → Express
```

- `server/index.js` : point d'entrée Express (CORS + `express.json()`), monte tous les routers + middleware d'erreur global
- `server/.env` : `PORT=3001` + `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=dedalofus` (connexion MySQL locale) + `JWT_SECRET`
- `server/scripts/` : scripts d'import Node (`import-cubes.js`, `import-breloques.js`, `import-sorts.js`), dépendent de `mysql2` et `csv-parse`
- `schema.sql` (racine du repo) : script de création de la base `dedalofus` et de ses tables (Utilisateur avec `pseudo` unique inclus), à exécuter une seule fois
- `server/config/db.js` : pool de connexions MySQL (`mysql2/promise`)
- `server/logic/calcul.js` (+ `calcul.test.js`) : module de calcul de dégâts, 2 fonctions pures (Tâche 3)
- `server/controllers/` + `server/routes/` : `cubesController`/`breloquesController`/`sortsController` (API lecture seule, Tâche 4) + `authController`/routes `auth` (inscription/connexion, Tâche 6)
- `server/middleware/verifierToken.js` : middleware JWT, prêt à protéger les futures routes personnage/stuff (Tâche 7), pas encore branché sur aucune route
- `client/src/pages/` : `HomePage`, `CubeListPage`/`CubeDetailPage`, `BreloqueListPage`, `SortListPage`, `ConnexionPage`, `InscriptionPage`, `PersonnagePage` (placeholder Tâche 7)
- `client/src/components/` : `Header` (nav + état connexion), `CubeCard`, `BreloqueCard`, `SortCard`
- `client/src/api/` : wrappers fetch (`cubes.js`, `breloques.js`, `sorts.js`, `auth.js`)
- `client/src/context/AuthContext.jsx` : session (token + utilisateur) persistée dans `localStorage`
- `client/src/constants/` : `elements.js`, `rangs.js` (cubes), `elementsSorts.js`, `rangsMaitrise.js` (Novice/Expert/Maître α/Maître ẞ, partagé breloques+sorts), `statsCubes.js` (35 stats vérifiées en base)
- `client/src/assets/logo.webp` : logo du site
- Thème sombre : fond `#4A433B`, variables couleur par élément dans `client/src/index.css`
- `.claude/launch.json` : config pour prévisualiser le client (`npm run dev`, port 5173) via l'outil de preview

## Périmètre du MVP

Trois blocs indispensables :

1. **Liste des équipements du Dédale** — consultable sans compte, recherche par nom, filtre par type (pas de filtre par niveau, ça n'existe pas en Dédale)
2. **Comptes utilisateurs** — création de personnage (pas de classe, pas de niveau, juste un stuff équipé) et sauvegarde de stuffs
3. **Calculateur de dégâts** appliqué aux stuffs

**Explicitement repoussé après le MVP** : liste des mobs, articles tuto, comparateur d'items avancé, système de communauté, images réelles des équipements (visuel générique par type/élément en V1).

**Authentification** : site bénévole, pas de données bancaires. Un JWT simple + bcrypt suffit, pas de niveau de sécurité bancaire nécessaire.

## Les 3 types d'équipements

### Cubes
- Donnent des stats (ex: Intelligence, Agilité, Force, Chance, Vitalité, Puissance...)
- 6 éléments possibles, 5 rangs d'évolution : Commun, Rare, Épique, Mythique, Éxalté
- Pour une combinaison élément + rang donnée, les stats sont **fixes** (pas de fourchette aléatoire)
- 420 cubes au total, données déjà disponibles dans `cubes_v2.json`
- **9 cubes équipés** par personnage

### Breloques
- **7 emplacements** par personnage
- Effet **purement informatif** dans l'immense majorité des cas (ex: "x1.2", "x1.3" affiché mais non calculé) — sert juste à indiquer au joueur qui consulte un stuff partagé quelle breloque équiper
- **Exception unique** : une seule breloque a un vrai effet chiffré pris en compte dans le calcul → à traiter comme cas particulier (champ `is_calculated` ou équivalent)
- Données dans `DEDALE BRELOQUES.csv` — 3 colonnes exactement : `Nom`, `Rang`, `Effet`. Ces 3 colonnes sont validées comme suffisantes, pas de nouvelle colonne nécessaire pour l'instant.

### Sorts
- **9 sorts équipés** par personnage
- Liste fermée indépendante de toute classe (pas de notion Iop/Cra/etc.)
- Chaque sort a un élément et des dégâts de base fixes (ex: 19 à 23), modifiés uniquement par la stat du personnage liée à cet élément
- Colonnes définitives validées (différentes du CSV source d'origine) :
  `Nom du sort` · `Description` · `Coût en PA` · `Portée min` · `Portée max` · `Portée modifiable` · `Ligne de vue requise` · `Zone d'effet` · `Lancers par tour` · `Lancers par combat` · `Lancers par cible` · `Portée diagonale/ligne` · `Intervalle de relance (CD)` · `Durée de l'effet` · `Cumul des effets` · `Rang d'évolution` · `Dégâts min` · `Dégâts max` · `Élément` · `Dégâts critique min` · `Dégâts critique max` · `Chance de critique`
  (le CSV `DEDALE SORTS.csv` a des colonnes légèrement différentes — se référer à la liste ci-dessus comme version définitive)

## Logique de calcul de dégâts (validée)

Chaque stat d'un cube est liée à un élément (ex: Intelligence → Feu, Agilité → Air). Cette stat ne booste que les dégâts des sorts du même élément.

Exemple : un sort Terre à 20 dégâts de base tape toujours 20 s'il n'y a pas de stat Terre équipée. Un sort Feu à 20 dégâts de base peut taper 60 si le joueur a de l'Intelligence équipée.

**Taux de conversion stat → % de dégâts** : jugé simple par le porteur de projet, pas encore formalisé, à écrire noir sur blanc au moment du développement du module de calcul (Tâche 3).

Le calcul se décompose en **deux fonctions pures**, sans dépendance à Express ni MySQL, testables unitairement (`server/logic/calcul.js`) :

```js
// Étape 1 : agréger les stats du personnage à partir des cubes équipés
calculerStatsPersonnage(cubesEquipes) → { intelligence, agilite, force, chance, vitalite, ... }

// Étape 2 : calculer les dégâts de chaque sort à partir des stats du personnage
calculerDegats(statsPersonnage, sortsEquipes) → { sortId, degatsMin, degatsMax }[]
```

## Stats dérivées et bonus de panoplie (validés, implémentés dans `calculerStatsPersonnage`)

Au-delà des stats brutes sommées telles quelles depuis les cubes, certaines stats affichées sur la fiche personnage se calculent différemment :

- **Vitalité** = base **1050** + somme des bonus Vitalité des cubes
- **PA** = base **7** + cubes + bonus panoplie
- **PM** = base **3** + cubes + bonus panoplie
- **Invocation** = base **1** + cubes
- **PO**, **Sagesse**, **Soins**, **Puissance**, toutes les **Résistances**, **Dommages critique** (`DO_CRIT`), **Dommages poussée** (`DO_POU`) : base 0, simple somme des cubes (déjà géré génériquement, rien de spécial à coder)
- **Tacle** = 1 par tranche entière de 10 Agilité (troncature, pas d'arrondi)
- **Fuite** = 1 par tranche entière de 10 Chance (troncature) + bonus Fuite direct des cubes
- **Retrait PA / Retrait PM** = 1 par tranche entière de 10 Sagesse (troncature). Pas de stat cube équivalente ; seules les **breloques** pourront l'augmenter (non géré pour l'instant, calcul limité aux cubes).
- **Esquive PA / Esquive PM** = même palier Sagesse (10 → 1) **+ bonus direct des cubes** (stat `ESQUIVE_PA`/`ESQUIVE_PM`, confirmée présente sur certains cubes) — contrairement au Retrait, les cubes peuvent bien booster l'Esquive.
- **Dommages élémentaires affichés** (Terre/Eau/Feu/Air) = stat `DOMMAGES` (globale, jamais affichée seule) + `DO_<ELEMENT>` (propre à l'élément)
- **Dommages critique** (`DO_CRIT`) : s'ajoute aux dommages uniquement sur un coup critique (hors crit, aucun effet). **Pas encore intégré à `calculerDegats`** (qui ne modélise pas encore les jets critiques) — valeur brute disponible dans les stats, calcul du coup critique lui-même à faire plus tard.
- **Dommages poussée** (`DO_POU`) : formule `(132 + DO_POU) / 4 × NombreDeCasesPoussées` — **pas implémenté**, le nombre de cases de poussée n'est pour l'instant que du texte libre dans les données sorts. Pas urgent (dixit porteur de projet).
- **Critique** (`%_COUP_CRITIQUE`) : base 0 + somme des cubes. Le % final d'un sort = `%_COUP_CRITIQUE` du sort + celui du personnage. **Pas encore intégré à `calculerDegats`**.

### Bonus de panoplie

Équiper **au moins 2 cubes** d'une même famille (élément, ou Lumière) donne un bonus de stats. Le bonus au palier atteint **remplace** celui du palier précédent (pas cumulatif entre paliers). Plusieurs panoplies de familles différentes équipées en même temps se cumulent entre elles. Un cube **Chaos** compte comme 1 cube de **chaque** famille (Air/Feu/Terre/Eau/Lumière) pour le calcul des paliers, mais n'a pas de panoplie propre.

Valeurs connues à ce jour (config `PANOPLIES` dans `calcul.js`, facilement modifiable) :

| Cubes Lumière | Bonus |
|---|---|
| 2 | +1 PM |
| 3 | +1 PM, +1 PA |
| 4 | +1 PM, +1 PA, +1 PO |
| 5-9 | ⚠️ valeurs **fictives**, à corriger |

| Cubes Air | Bonus |
|---|---|
| 2 | +50 Vita, +50 Agilité, +10 DO_AIR |
| 3 | +100 Vita, +100 Agilité, +20 DO_AIR |
| 4 | +150 Vita, +150 Agilité, +30 DO_AIR, +25 Puissance, +5 Dommages |
| 5 | +200 Vita, +150 Agilité, +30 DO_AIR, +50 Puissance, +10 Dommages |
| 6 | +250 Vita, +150 Agilité, +30 DO_AIR, +75 Puissance, +15 Dommages |
| 7-9 | ⚠️ valeurs **fictives**, à corriger |

**Terre, Eau, Feu : pas encore fournis** — à ajouter dans `PANOPLIES` (`calcul.js`) dès que connus.

(Une version à une seule fonction `calculerDegats(cubesEquipes, sortsEquipes)` avait été proposée puis corrigée — l'étape intermédiaire d'agrégation des stats est centrale et doit rester séparée.)

## Modèle de données MySQL (schéma validé et implémenté)

**Nom de la base : `dedalofus`** (et non `dedale_book`, renommée en cours de Tâche 2).

⚠️ **`Cube` est un mot réservé en MySQL 8.0** (lié à `GROUP BY ... WITH CUBE`). Toute requête SQL qui référence cette table doit l'entourer de backticks : `` `Cube` ``. C'est déjà fait dans `schema.sql` et `import-cubes.js` — à reproduire dans tout futur code SQL touchant cette table (API Express, etc.).

```
Utilisateur
 - id, email, pseudo (UNIQUE, 3-32 caractères), mot_de_passe_hash, cree_le

Personnage
 - id, utilisateur_id (FK), nom, cree_le
 (pas de classe, pas de niveau)

Cube (référentiel, 420 entrées, lecture seule)
 - id, nom, element, rang, numero, image_url (nullable)

StatCube (une ligne par stat, car leur nombre varie selon le cube)
 - id, cube_id (FK), cle_stat (ex: FORCE, PUISSANCE, CHANCE, DO_AIR...), valeur, libelle

Breloque (référentiel)
 - id, nom, rang, effet
 (correspond exactement aux 3 colonnes du CSV)

Sort (référentiel — colonnes définitives listées ci-dessus)
 - id, nom, description, cout_pa, portee_min, portee_max, portee_modifiable,
   ligne_de_vue_requise, zone_effet, lancers_par_tour, lancers_par_combat,
   lancers_par_cible, portee_diagonale_ligne, intervalle_relance_cd,
   duree_effet, cumul_effets, rang_evolution, degats_min, degats_max,
   element, degats_critique_min, degats_critique_max, chance_critique

Equipement (= le "stuff" sauvegardé d'un personnage)
 - id, personnage_id (FK), lien_partage (identifiant unique pour partage public), mis_a_jour_le

EquipementCube (9 lignes par équipement)
 - equipement_id (FK), emplacement (1-9), cube_id (FK, nullable si vide)

EquipementBreloque (7 lignes par équipement)
 - equipement_id (FK), emplacement (1-7), breloque_id (FK, nullable si vide)

EquipementSort (9 lignes par équipement)
 - equipement_id (FK), emplacement (1-9), sort_id (FK, nullable si vide)
```

Index utiles à prévoir au minimum : `element`, `rang`/`evolution` sur `Cube` (filtres).

## Format des données sources

- **Cubes** (`cubes_v2.json`) : tableau d'objets `{ id, nom, element, rang, numero, stats: [{ key, value, label }] }`. Le nombre de stats varie par cube (d'où la table `StatCube` séparée plutôt que des colonnes fixes).
- **Breloques** (`DEDALE BRELOQUES.csv`) : `Nom`, `Rang`, `Effet` — 116 lignes.
- **Sorts** (`DEDALE SORTS NOVICE DEDALE.csv`) : 115 lignes, colonnes à retraiter vers la liste définitive ci-dessus lors de l'import (pas un mapping 1:1 direct).

## Parcours utilisateur cible

**Sans compte** : les 3 types d'équipement (cubes, breloques, sorts) restent consultables librement avec recherche/filtres via le menu du header, sans compte nécessaire. La page d'accueil elle-même ne pousse plus que vers la création de compte — bouton unique "Créer mon équipement" (mis en valeur), pas de bouton "Voir les équipements" sur l'accueil (implémenté différemment de l'intention initiale de ce document, sur demande du porteur de projet).

**Avec compte** : connexion → fiche personnage avec emplacements vides (9 cubes, 7 breloques, 9 sorts) → clic sur un emplacement vide → liste filtrée par type → sélection → retour fiche personnage remplie → onglet "Sorts" affichant les dégâts calculés → sauvegarde automatique à chaque changement → partage via lien unique consultable sans compte → gestion (voir/modifier/supprimer) des stuffs enregistrés.

## Plan de développement (tâches séquentielles)

1. **Mise en place du projet** ✅ FAIT (Jour 1) — voir "État d'avancement" ci-dessous
2. **Tables MySQL + import cubes/breloques/sorts** ✅ FAIT (Jour 3) — voir "État d'avancement" ci-dessous
3. **Module de calcul (2 fonctions pures) + tests unitaires** ✅ FAIT (Jour 3) — voir "État d'avancement" ci-dessous
4. **API Express pour exposer les équipements** ✅ FAIT (Jour 3) — routes 100% en français, cohérent avec le reste du code
5. **Pages React liste + détail équipement** ✅ FAIT — voir "État d'avancement" ci-dessous
6. **Authentification (inscription/connexion, bcrypt, JWT)** ✅ FAIT — voir "État d'avancement" ci-dessous
7. **Création de personnage + emplacements d'équipement** ← PROCHAINE ÉTAPE
8. Branchement du calculateur sur la fiche perso (onglet Sorts)
9. Sauvegarde automatique du stuff
10. Partage par lien unique (`share_token`, route publique sans auth)
11. Déploiement (hébergeur à choisir — doit supporter Node.js + Express + MySQL, **Vercel exclu** car pensé pour Next.js/serverless)

Règles d'enchaînement :
- Tâches 1 à 4 : strictement séquentielles
- Tâche 5 (liste/détail) et tâche 6 (auth) : peuvent démarrer en parallèle, dépendent seulement de la tâche 4
- Tâches 7 à 10 : séquentielles entre elles
- Tâche 11 : préparable en amont (choix hébergeur), exécution en dernier

## État d'avancement

### ✅ Jour 1 — Tâche 1 terminée
- Mono-repo `Dedalofus/client` + `Dedalofus/server`
- Backend Express + cors + dotenv, route `GET /api/ping` → `{ message: "pong" }`, testée OK
- Frontend Vite (React/JS/ESLint), fetch vers `/api/ping`, "pong" affiché dans le navigateur → CORS fonctionnel confirmé
- Git/GitHub lié, premier commit fait : "Setup initial: backend Express + frontend React connectés (test /api/ping)"
- Reporté volontairement : sous-dossiers `routes/`/`controllers/`/`models/`/`config/` (Tâche 4), script `concurrently` (optionnel)

### ✅ Jour 3 — Tâche 2 terminée
- MySQL 8.0 installé en local (MySQL Installer, config "Development Computer", "Full", port 3306)
- Base `dedalofus` créée via `schema.sql` (10 tables : Utilisateur, Personnage, Cube, StatCube, Breloque, Sort, Equipement, EquipementCube, EquipementBreloque, EquipementSort)
- Bug corrigé : `Cube` est un mot réservé MySQL → backticks ajoutés dans `schema.sql` et `import-cubes.js` (voir section "Modèle de données" ci-dessus)
- `scripts/` déplacé à la racine → `server/scripts/` (partage le `package.json`/`node_modules` du serveur, cohérent avec le mono-repo)
- Dépendances `mysql2` et `csv-parse` ajoutées à `server/package.json`
- Noms de fichiers CSV corrigés dans les scripts d'import (`DEDALE - BRELOQUES.csv`, `DEDALE - SORTS.csv` — espaces, pas underscores)
- Les 3 imports exécutés avec succès : **420 cubes** (+ 1755 lignes StatCube), **116 breloques**, **115 sorts**
- Vérifié : `SELECT * FROM `Cube` WHERE element = 'Feu'` renvoie 75 résultats → critère "fini" de la Tâche 2 rempli
- Commit : "Ajout des tables MySQL et scripts d'import (cubes, breloques, sorts)"

### ✅ Jour 3 (suite) — Tâche 3 terminée
- `server/logic/calcul.js` créé avec les 2 fonctions pures `calculerStatsPersonnage` et `calculerDegats`
- Formule de conversion validée et implémentée : `dégâts = base × (1 + 0,01 × stat_efficace) + bonus_dommages`
  - `stat_efficace` (élément du sort) = caractéristique liée à l'élément (Force→Terre, Intelligence→Feu, Chance→Eau, Agilité→Air) **+ Puissance** (1 Puissance = 1 stat dans tous les éléments)
  - `bonus_dommages` = stat `DOMMAGES` (globale, tous éléments) + stat `DO_<ELEMENT>` (propre à l'élément, ex: `DO_FEU`)
  - Chaos et Lumière ne sont **pas** des éléments de frappe (juste des familles de cubes) ; les sorts Chaos/Lumière tapent soit dans le "meilleur élément" (le plus avantageux des 4 pour le perso), soit dans 2 éléments à la fois (2 calculs séparés), soit pas de dégâts
  - Arrondi à l'entier le plus proche **uniquement à l'affichage final** (jamais pendant le calcul, ni dans les calculs intermédiaires)
- `calculerStatsPersonnage` agrège génériquement toutes les stats brutes des cubes équipés (pas de liste figée), + calcule l'Initiative dérivée (Force + Intelligence + Chance + Agilité + bonus Initiative des cubes Lumière)
- Vitest installé en version **2.x** (la 4 nécessite Node 20+, incompatible avec le Node 18 installé) ; 15 tests unitaires écrits et tous verts, dont les 2 exemples chiffrés validés par le porteur de projet (250 stat + 11 dommages sur base 20 → 81 ; 450 Intel + 170 Puissance sur sort Feu 20-22 → 144 à 158)
- Bonus découvert au passage : `server/node_modules/` et `server/.env` étaient suivis par git depuis le tout premier commit (pas de `.gitignore` racine) → `.gitignore` créé, fichiers désinscrits du suivi (sans suppression locale)
- Commit : "Ajout du module de calcul de degats (Tache 3) + gitignore"

### ✅ Jour 3 (suite 2) — Stats dérivées + bonus de panoplie ajoutés
- Toutes les formules de stats dérivées (Vitalité, PA, PM, Invocation, Tacle, Fuite, Retrait/Esquive PA/PM, Dommages élémentaires affichés) intégrées dans `calculerStatsPersonnage` — détail complet dans la section "Stats dérivées et bonus de panoplie" ci-dessus
- Bonus de panoplie implémentés (config `PANOPLIES` dans `calcul.js`, facilement éditable), avec gestion du comptage des cubes Chaos (comptent comme 1 cube de chaque famille)
- Esquive PA/PM confirmée boostable directement par certains cubes (stat `ESQUIVE_PA`/`ESQUIVE_PM`), en plus du palier Sagesse — contrairement au Retrait PA/PM qui n'a pas d'équivalent cube
- 29 tests unitaires au total, tous verts
- Commit : "Ajout des stats derivees et bonus de panoplie au calcul (Tache 3)", pushé sur GitHub

### ✅ Jour 3 (suite 3) — Tâche 4 terminée
- Nommage des routes tranché : **100% français** (`/api/cubes`, `/api/breloques`, `/api/sorts`), pas d'anglais, cohérent avec le reste du code
- `server/config/db.js` : pool de connexions MySQL (`mysql2/promise`), réutilisé par tous les contrôleurs
- `server/controllers/` : `cubesController.js`, `breloquesController.js`, `sortsController.js` — logique des routes
- `server/routes/` : `cubes.js`, `breloques.js`, `sorts.js` — déclaration des routes Express
- Routes implémentées :
  - `GET /api/cubes` — filtres `nom` (recherche partielle), `element`, `rang`, pagination `limit`/`offset` (max 500)
  - `GET /api/cubes/:id` — détail d'un cube avec ses stats jointes (format identique à `cubes_v2.json` : `{ ...cube, stats: [{ key, value, label }] }`), 404 si introuvable
  - `GET /api/breloques` — filtres `nom`, `rang`, pagination
  - `GET /api/sorts` — filtres `nom`, `element`, `rang` (mappé sur `rang_evolution`), pagination
- `server/index.js` monte les 3 routers + middleware d'erreur global (Express 5 route automatiquement les rejets de promesses des handlers async, pas besoin de try/catch dans les contrôleurs)
- Testé en conditions réelles avec `curl` : filtres, détail, 404, recherche — tout fonctionne
- Bug de session résolu : une ancienne instance du serveur (lancée plus tôt) squattait le port 3001 et masquait les nouvelles routes → tuée avant de retester

### ✅ Tâche 5 terminée — Pages React liste/détail + filtres avancés
- `react-router-dom` ajouté ; Vite downgradé 8→5 et `@vitejs/plugin-react` 6→4 côté client (même incompatibilité Node 18 que Vitest, cf. Tâche 3)
- Thème sombre créé (fond `#4A433B`, choisi par le porteur de projet façon DofusBook), couleur dédiée par élément, logo intégré (`client/src/assets/logo.webp`)
- Cartes `CubeCard`/`BreloqueCard`/`SortCard` suivant la maquette fournie (entête + image/placeholder à gauche + stats à droite, format stat affiché `valeur libellé` ex: "6% Résistance Feu", espace prévu pour une future icône par stat)
- 3 pages liste (Cubes/Breloques/Sorts) + détail Cube, toutes consultables sans compte, navigation commune dans le header
- Page d'accueil : uniquement **"Créer mon équipement"** (gros bouton mis en valeur) si déconnecté ; **+ "Voir mes équipements"** si connecté (les deux pointent vers `/personnage`, placeholder Tâche 7) — le bouton "Voir les équipements" a été retiré de l'accueil (les 3 listes restent accessibles via le header)
- Bug corrigé : le champ `nom` des cubes vaut toujours littéralement "Cube" (aucune valeur distinctive) → la recherche libre porte aussi sur `element`, `rang` et `numero` côté API
- Filtres : cubes = élément + rang (sélection unique, reclique pour décocher) ; breloques + sorts = **multi-sélection** (plusieurs valeurs actives à la fois, OR entre elles) ; sorts ont aussi un filtre rang de maîtrise (Novice/Expert/Maître α/Maître ẞ, liste partagée avec les breloques via `rangsMaitrise.js`)
- Filtres avancés cubes : bouton "+ de filtres" (transition CSS `grid-template-rows` 0fr→1fr, fluide sans hauteur fixe), une case à cocher par stat **réellement présente** sur au moins un cube (35 stats vérifiées via `SELECT DISTINCT` en base, `client/src/constants/statsCubes.js`), clic sur le texte ou la case fonctionne (label HTML natif), **combinées en ET** (le cube doit avoir toutes les stats cochées, pas une seule)
- **Décision : mobile-first à partir de maintenant** (Tâche 7 incluse) pour tout nouveau code — les pages déjà construites ci-dessus n'ont pas été retouchées, aucune media query pour l'instant, passe dédiée à faire plus tard (voir "Points encore en suspens")
- Catégories de filtres breloques (Dégâts/Mobilité/Soin.../Boss) demandées mais **pas encore décidées** par le porteur de projet, reportées à plus tard (plus de breloques à venir)

### ✅ Tâche 6 terminée — Authentification
- `bcryptjs` (plutôt que `bcrypt`, pas de compilation native à gérer sous Windows) + `jsonwebtoken`, token valide 30 jours
- Routes `POST /api/auth/inscription` et `POST /api/auth/connexion` ; middleware `verifierToken.js` prêt pour protéger les routes personnage/stuff (Tâche 7), pas encore utilisé
- Colonne `pseudo` ajoutée à `Utilisateur` (UNIQUE, 3 à 32 caractères) — un joueur ne doit pas être identifié juste par son email ; le header affiche le pseudo (pas l'email) une fois connecté
- Anti-doublon : vérification email+pseudo avant insertion, **et** filet de sécurité contre une race condition (contrainte `UNIQUE` en base + catch propre de l'erreur `ER_DUP_ENTRY`, réponse 409 au lieu d'une 500)
- Regex email stricte (norme HTML5, domaine avec point obligatoire) pour rejeter les faux emails type `0@0`, qui passaient auparavant sans aucune validation de format
- `AuthContext` React : session (token + utilisateur) persistée dans `localStorage`, survit aux rafraîchissements
- Redirections : un utilisateur déjà connecté qui visite `/connexion` ou `/inscription` est redirigé automatiquement (plus de formulaire réaffiché inutilement)
- Google OAuth demandé puis **repoussé** après plus tard : complexité de config externe (Google Cloud, redirect URI) non justifiée pour le MVP d'un site bénévole
- Repo GitHub : ancienne branche `master` (vieux prototype statique sans rapport, un seul commit) renommée en `archive` ; remote local mis à jour vers la nouvelle URL `pataupe/Dedalofus` (le repo avait été renommé côté GitHub, ancien nom `Dedale-Book`)

### 🔜 Prochaine étape — Tâche 7
Création de personnage + emplacements d'équipement (9 cubes, 7 breloques, 9 sorts), protégée par le token JWT (middleware `verifierToken.js` déjà prêt). Coder en **mobile-first** (décision prise en Tâche 5).

Détail du travail à faire :
- **Backend** : tables `Personnage`, `Equipement`, `EquipementCube`, `EquipementBreloque`, `EquipementSort` déjà créées en base depuis la Tâche 2 mais jamais encore utilisées par aucune route. Il faut : routes protégées (créer un personnage, créer un "stuff" avec ses emplacements vides), routes pour remplir un emplacement (associer un cube/breloque/sort à un emplacement).
- **Frontend** : remplacer la page `/personnage` (placeholder actuel "Bientôt disponible") par la vraie fiche — liste des personnages du joueur + bouton "créer un personnage", fiche avec les emplacements vides, clic sur un emplacement vide → réutilise les listes déjà construites (Cubes/Breloques/Sorts, Tâche 5) pour choisir → retour sur la fiche remplie.
- **Question encore ouverte (pas tranchée)** : démarrer par un premier bout simple et testable (juste la création de personnage, nom seul, sans équipement) puis itérer, ou construire personnage + emplacements + sélection d'un coup ? À décider en début de Tâche 7.

## Points encore en suspens

- **Responsive mobile-first sur les pages déjà construites** (Tâche 5 : accueil, Cubes/Breloques/Sorts, Connexion/Inscription) : aucune media query pour l'instant, pas testé sur petit écran. La convention mobile-first ne s'applique qu'au code écrit *à partir de* la Tâche 7 — une passe dédiée reste à faire sur l'existant.
- **Vulnérabilités npm (Dependabot)** : 9 signalées sur GitHub, dues au downgrade de Vite (8→5) et Vitest (4→2) pour compatibilité Node 18. Dépendances de développement uniquement (pas exposées en prod) — disparaîtront si le projet passe un jour à Node 20+.
- **Hébergeur** : pas encore choisi (doit supporter Node + Express + MySQL)
- **Bonus de panoplie Terre/Eau/Feu** : pas encore fournis (seuls Lumière et Air sont connus) — à ajouter dans `PANOPLIES` (`calcul.js`) dès que disponibles
- **Paliers 5-9 (Lumière) et 7-9 (Air) des panoplies** : valeurs actuellement fictives en attendant les vraies (voir section "Stats dérivées et bonus de panoplie")
- **Dommages critique et dommages poussée** : formules connues mais pas encore intégrées à `calculerDegats` (pas de modélisation du jet critique ni du nombre de cases de poussée pour l'instant) — pas urgent
- **Sourcing des images** des équipements : prévu après le MVP
- **Catégories de filtres pour les breloques** (Dégâts, Mobilité, Soin/Protection, Entrave, Bonus PA/PO, Bonus divers, Breloques boss) : catégories **pas encore décidées définitivement**, et de nouvelles breloques seront ajoutées plus tard. Reporté à plus tard dans le développement plutôt que de classer les 116 breloques actuelles maintenant (risque de tout refaire).
