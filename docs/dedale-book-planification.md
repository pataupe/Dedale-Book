# Dédale-Book — Document de planification

Ce document récapitule l'intégralité des décisions prises lors de la planification du projet. Il est destiné à être utilisé comme base de connaissance (Project Knowledge) pour toute nouvelle conversation Claude sur ce projet.

---

## Étape 1 — Le besoin (en une phrase)

> Un simulateur en ligne qui permet aux joueurs de Dofus Touch de choisir un équipement complet pour leur personnage et de calculer les dégâts qu'il produirait, pour préparer leur run du Dédale.

Le mot-clé "tester" signifie concrètement : choisir des équipements → obtenir le calcul de dégâts qui en résulte. Ce n'est pas deux fonctionnalités séparées mais un seul flux.

---

## Étape 2 — Le problème utilisateur

- Le Dédale (Dofus Touch) vient de sortir très récemment.
- Il n'existe **aucun outil** aujourd'hui pour simuler un stuff Dédale.
- DofusBook existe mais **ne prend pas en charge** les équipements du Dédale.
- Conséquence : les joueurs ne peuvent pas tester/comparer différentes combinaisons d'équipements pour prévoir et gérer ce qu'ils vont porter en run.
- **Point stratégique important** : le porteur du projet est actuellement seul sur ce créneau, pas de concurrent direct sur le Dédale spécifiquement. Cela justifie de privilégier la rapidité de sortie du MVP.

---

## Étape 3 — Le MVP (périmètre minimal)

Trois blocs fonctionnels indispensables au lancement :

1. **Liste complète des équipements du Dédale** (fondation du site)
2. **Comptes utilisateurs** permettant de créer un personnage et d'enregistrer des stuffs
3. **Calculateur de dégâts** appliqué à ces stuffs

**Décision sur l'authentification** : le site est bénévole, sans données bancaires à protéger. Au pire un email pourrait être exposé en cas de piratage — risque jugé acceptable. Un système d'authentification standard (pas un niveau de sécurité bancaire) suffit donc largement.

**Explicitement repoussé après le MVP** : liste des mobs, articles tuto, comparateur d'items avancé, système de communauté.

---

## Étape 4 — Fonctionnalités détaillées

### Bloc 1 — Liste des équipements du Dédale

Fonctionnalités :
- Voir tous les équipements du Dédale sous forme de liste/grille
- Chercher un équipement par son nom
- Filtrer par type d'équipement (coiffe, cape, arme, anneau, etc.)
- **Pas de filtre par niveau** : il n'y a pas de niveau en Dédale
- Cliquer sur un équipement pour voir le détail de ses stats

Trois catégories d'équipements existent :

#### Les Cubes
- Donnent des stats (ex : "200 Intelligence", "150 Agilité")
- Ont un **élément** parmi 6 possibles
- Ont un **niveau d'évolution** parmi 5 : Commun, Rare, Épique, Mythique, Exalté
- Pour une combinaison élément + niveau d'évolution donnée, **les stats sont fixes** (pas d'aléatoire/fourchette, contrairement aux items Dofus classiques)
- Il existe **420 cubes** au total
- Un personnage équipe **9 cubes**

#### Les Breloques
- Équipement supplémentaire, **7 emplacements** par personnage
- Peuvent avoir un impact visuel/informatif sur les dégâts (ex : "x1.2", "x1.3") mais cet effet est **affiché uniquement à titre indicatif**, pas pris en compte dans le calcul automatique
- Objectif : purement informatif — si un joueur partage son stuff, celui qui le consulte voit "il conseille d'équiper telle breloque"
- **Exception unique** : il existe une seule breloque qui donne un vrai bonus chiffré, **pris en compte dans le calcul** (à traiter comme cas particulier dans le modèle de données, via un indicateur type "is_calculated")

#### Les Sorts
- Un personnage équipe **9 sorts**
- Les sorts sont une **liste fermée indépendante de toute classe** (pas de notion de classe Iop/Cra/etc. à modéliser)
- Chaque sort a un **élément** et des **dégâts de base fixes** (ex : 19 à 23, une fourchette min-max fixe, pas aléatoire selon le stuff)
- Les dégâts de base sont **modifiés uniquement par les stats du personnage liées à l'élément correspondant au sort**

### Logique de calcul (validée)

Chaque stat donnée par un cube est liée à un élément (ex : Intelligence → Feu, Agilité → Air). Cette stat vient booster uniquement les dégâts des sorts dont l'élément correspond.

**Exemple donné pour illustrer** (les vraies valeurs de dégâts de base varient selon les sorts) :
- Un joueur équipe des cubes donnant 200 Intelligence (Feu) et 150 Agilité (Air)
- Un sort Terre à 20 dégâts de base tape toujours 20 (pas de stat Terre équipée → pas de bonus)
- Un sort Feu à 20 dégâts de base pourrait taper 60 (boosté par l'Intelligence/Feu)
- Un sort Air à 20 dégâts de base pourrait taper 50 (boosté par l'Agilité/Air)

**Important** : la formule exacte de conversion stat → % de dégâts est jugée **simple** par le porteur du projet, ce n'est pas un point bloquant. Elle sera précisée lors du développement concret du module de calcul (pas nécessaire au niveau de la planification fonctionnelle).

### Bloc 2 — Compte, personnage et stuffs

- Créer un compte (email + mot de passe, ou connexion simplifiée)
- Se connecter / se déconnecter
- Créer un personnage : **pas de classe, pas de niveau** — un personnage est juste lié à un stuff qu'on lui équipe
- Équiper des items du Dédale sur les emplacements du personnage (9 cubes, 7 breloques, 9 sorts)
- Le stuff est **enregistré automatiquement** à chaque modification (pas de bouton "Enregistrer" explicite, pas de brouillon à valider)
- Voir la liste de ses stuffs enregistrés, en créer plusieurs, en supprimer
- **Partage d'un stuff via un lien unique** : fonctionnalité jugée **indispensable**, incluse dans le MVP. Le lien doit être consultable par n'importe qui, même sans compte.

### Bloc 3 — Calcul de dégâts

- Voir les stats totales du personnage une fois le stuff équipé (agrégation des stats de tous les cubes équipés)
- Calculer les dégâts obtenus **pour chaque sort équipé individuellement** (pas un chiffre global unique)
- Affichage via un **onglet "Sorts"** sur la fiche du personnage

---

## Étape 5 — Les données (état des lieux)

| Donnée | Statut |
|---|---|
| Cubes (420) | ✅ JSON complet déjà en possession du porteur de projet (format à vérifier mais contenu présent) |
| Breloques | 🔜 À extraire d'un Google Doc appartenant à un contact — extraction jugée pas trop difficile |
| Sorts | 🔜 Même source (Gdoc du contact) |
| Images des équipements | ⏳ Jugées indispensables à terme, mais **reportées après le MVP** pour ne pas retarder le lancement. Décision actée : V1 sans images (ou visuel générique par type/élément), ajout des vraies images dans une itération rapide après le lancement |
| Formule de dégâts / taux de conversion stat→dégâts | ✅ Jugée simple, pas un point bloquant |

---

## Étape 6 — Parcours utilisateur

### Sans compte (accès libre)

1. Le joueur arrive sur une **page d'accueil avec 2 gros boutons** : "Voir les équipements" / "Créer mon équipement"
2. S'il clique sur **"Voir les équipements"** → liste/recherche/filtre des cubes et breloques, consultable librement, **sans compte nécessaire**
3. S'il clique sur **"Créer mon équipement"** → un compte est requis à ce moment précis

### Avec compte (dès qu'on veut construire un stuff)

4. Connexion / inscription
5. Le joueur arrive sur son personnage avec ses emplacements vides (9 cubes, 7 breloques, 9 sorts)
6. Il clique sur un emplacement vide → redirigé vers la liste des équipements pour choisir celui qu'il veut équiper
7. L'équipement choisi s'ajoute à l'emplacement, retour sur la vue personnage
8. Il répète pour chaque emplacement qu'il veut remplir
9. Un onglet **"Sorts"** sur la fiche du personnage affiche les dégâts calculés pour chaque sort, en fonction du stuff équipé
10. Le stuff est **sauvegardé automatiquement** à chaque changement d'équipement
11. Il peut **partager son stuff via un lien unique**, consultable par n'importe qui (même sans compte)
12. Il peut retrouver, modifier, supprimer ses stuffs enregistrés

---

## Étape 7 — Choix techniques

### Profil du porteur de projet
- Développeur **solo**
- Connaît déjà : **JavaScript, HTML, CSS, React, Node.js, Express, SQL**
- A déjà construit un site complet en ligne avec base de données auparavant (stack exacte oubliée, mais expérience confirmée avec React + Node + Express)

### Stack technique retenue (tranchée après comparatif)

- **Frontend** : React
- **Backend** : Node.js + Express
- **Base de données** : MySQL (SQL relationnel)
- **Pas d'ORM** : requêtes SQL écrites directement (le porteur de projet connaît déjà le SQL, pas besoin d'un outil de traduction supplémentaire)
- **Pas de Next.js** : aucun bénéfice technique décisif par rapport à React + Express que le porteur de projet maîtrise déjà ; Next.js aurait ajouté un coût d'apprentissage non justifié pour ce projet

### Pourquoi SQL (MySQL) plutôt que MongoDB — argumentaire à conserver

Le modèle de données du projet est **fortement relationnel** : un utilisateur a des personnages, qui ont des stuffs, qui contiennent des emplacements référençant des cubes/breloques/sorts d'un référentiel commun.

Avec MongoDB :
- Pas de vraies relations natives entre collections → il faudrait soit dupliquer les données des cubes directement dans chaque stuff (risque d'incohérence si un cube est corrigé plus tard), soit faire des jointures manuelles (`$lookup`), plus lourdes qu'une jointure SQL native
- Pas de contrainte d'intégrité référentielle native (rien n'empêche nativement de référencer un cube supprimé)

Avec SQL (MySQL) :
- Les jointures entre tables (stuff → cube équipé → stats du cube) sont natives et simples
- Une modification d'un cube dans le référentiel se répercute automatiquement partout où il est référencé (pas de duplication à maintenir)

**Verdict retenu : MySQL**, adapté au modèle de données ET déjà connu du porteur de projet.

### Précision importante sur Express/React/Node

Contrairement à une idée reçue, Express + React + Node **n'imposent pas MongoDB**. L'acronyme "MERN" (Mongo + Express + React + Node) est une combinaison popularisée par les tutoriels, mais Express et React sont **indépendants du choix de base de données** — n'importe quelle base peut être branchée derrière (MongoDB, MySQL, PostgreSQL, SQLite...).

### Modèle de données (schéma relationnel MySQL) — version corrigée Jour 2

Utilisateur
 - id, email, mot_de_passe_hash, cree_le

Personnage
 - id, utilisateur_id (FK), nom, cree_le
 (pas de classe, pas de niveau)

Cube (référentiel, 420 entrées, lecture seule pour les joueurs)
 - id, nom, element, rang, numero, image_url (nullable pour l'instant)

StatCube (les stats d'un cube — une ligne par stat, car leur nombre varie selon le cube)
 - id, cube_id (FK vers Cube), cle_stat (ex: FORCE, PUISSANCE, CHANCE...), valeur, libelle

Breloque (référentiel)
 - id, nom, rang, effet
 (correspond exactement aux 3 colonnes du CSV, aucun champ numérique séparé pour l'instant)

Sort (référentiel — colonnes définitives validées Jour 2)
 - id, nom, description, cout_pa, portee_min, portee_max, portee_modifiable,
   ligne_de_vue_requise, zone_effet, lancers_par_tour, lancers_par_combat,
   lancers_par_cible, portee_diagonale_ligne, intervalle_relance_cd,
   duree_effet, cumul_effets, rang_evolution, degats_min, degats_max,
   element, degats_critique_min, degats_critique_max, chance_critique

Equipement (le "stuff" = équipement sauvegardé d'un personnage)
 - id, personnage_id (FK), lien_partage (identifiant unique pour le partage public), mis_a_jour_le

EquipementCube (9 lignes par équipement)
 - equipement_id (FK), emplacement (1-9), cube_id (FK, nullable si vide)

EquipementBreloque (7 lignes par équipement)
 - equipement_id (FK), emplacement (1-7), breloque_id (FK, nullable si vide)

EquipementSort (9 lignes par équipement)
 - equipement_id (FK), emplacement (1-9), sort_id (FK, nullable si vide)### Module de calcul de dégâts (logique validée)

Le calcul se décompose en **deux fonctions séparées et pures** (indépendantes de l'UI et de la base de données, testables unitairement) :

```
// Étape 1 : agréger les stats du personnage à partir des cubes équipés
calculerStatsPersonnage(cubesEquipes) → { intelligence, agilite, force, chance, vitalite, ... }

// Étape 2 : calculer les dégâts de chaque sort à partir des stats du personnage
calculerDegats(statsPersonnage, sortsEquipes) → { sortId, degatsMin, degatsMax }[]
```

**Point corrigé en cours de discussion** : une première version proposait une seule fonction `calculerDegats(cubesEquipes, sortsEquipes)`, ce qui était incorrect — elle ne faisait pas apparaître l'étape intermédiaire d'agrégation des stats du personnage, pourtant validée comme centrale dans la logique de jeu. La version à deux fonctions ci-dessus est la version retenue.

---

## Points en suspens / non encore tranchés

Ces sujets n'ont pas encore été abordés en détail et devront faire l'objet d'une prochaine étape de planification :

- **Hébergement** : aucun hébergeur n'a encore été choisi pour la stack React + Express + Node + MySQL (à définir : VPS, hébergement mutualisé, autre)
- **Vérification du format du JSON des 420 cubes** déjà en possession du porteur de projet, pour s'assurer qu'il est directement exploitable ou qu'il nécessite une transformation
- **Extraction concrète** des données breloques/sorts depuis le Gdoc du contact
- **Taux de conversion exact stat → % de dégâts**, à formaliser précisément au moment de coder le module de calcul (jugé simple mais pas encore écrit noir sur blanc)
- **Découpage du développement en tâches concrètes** dans un ordre de réalisation (prochaine étape logique après ce document)
- **Sourcing des images** des équipements, prévu après la sortie du MVP

---

*Document généré à l'issue de la phase de planification initiale du projet dédale-book. À utiliser comme base de connaissance de référence pour toute reprise de travail sur ce projet.*
