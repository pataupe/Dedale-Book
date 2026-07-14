# Dédale-Book — Plan de développement détaillé

Complément au document de planification fonctionnelle. Ce document découpe le point 3 ("développement") en tâches concrètes, ordonnées, avec sous-étapes et critères de "fini".

---

## 1. Mise en place du projet

- Créer le repo Git (mono-repo avec `/client` et `/server`, ou deux repos séparés — choix libre, mono-repo plus simple pour un solo dev)
- Initialiser le backend : `npm init`, Express, structure de dossiers (`routes/`, `controllers/`, `models/`, `config/`)
- Initialiser le frontend : React (Vite recommandé, plus léger que CRA pour démarrer vite)
- Configurer les variables d'environnement (`.env` : port, credentials MySQL)
- Mettre en place un script de démarrage commun (concurrently, ou deux terminaux)
- Configurer CORS entre le frontend et le backend

**Fini quand** : `npm run dev` sur les deux côtés affiche une page React qui appelle une route Express de test (`/api/ping`) et reçoit une réponse.

---

## 2. Tables MySQL + import cubes/breloques/sorts

- Créer la base MySQL et les tables selon le schéma déjà validé (`Cube`, `Charm`, `Spell`, `User`, `Character`, `Stuff`, `StuffCubeSlot`, `StuffCharmSlot`, `StuffSpellSlot`)
- Écrire les scripts SQL de création (fichier `schema.sql` versionné dans le repo)
- Écrire un script d'import Node (`scripts/import-cubes.js` etc.) qui lit le JSON des 420 cubes et l'insère
- Une fois breloques/sorts extraits du Gdoc (chantier parallèle), écrire les scripts d'import correspondants
- Vérifier les contraintes de clé étrangère et les index (au minimum sur `element`, `evolution` pour les cubes, utile pour les filtres)

**Fini quand** : les 3 tables référentiel sont peuplées et une requête SQL simple (`SELECT * FROM Cube WHERE element = 'Feu'`) renvoie des résultats cohérents.

---

## 3. Module de calcul (2 fonctions pures) + tests

- Créer un module isolé, sans dépendance à Express ni MySQL (ex: `server/logic/calcul.js`)
- Implémenter `calculerStatsPersonnage(cubesEquipes)`
- Implémenter `calculerDegats(statsPersonnage, sortsEquipes)`
- Écrire les tests unitaires (Jest ou Vitest) avec des cas simples : aucun cube équipé, un seul élément, plusieurs éléments, sort sans stat correspondante
- Formaliser à ce moment précis le taux de conversion stat → % de dégâts (point encore en suspens)

**Fini quand** : les tests passent et la formule de conversion est écrite noir sur blanc quelque part (commentaire ou doc courte).

---

## 4. API Express pour exposer les équipements

- Routes en lecture seule : `GET /api/cubes`, `GET /api/charms`, `GET /api/spells`
- Paramètres de requête pour la recherche par nom et le filtre par type/élément
- Route de détail : `GET /api/cubes/:id`
- Pagination si nécessaire (420 cubes reste gérable sans pagination stricte, mais prévoir un `limit`/`offset` par prudence)

**Fini quand** : Postman/Insomnia (ou simple appel `curl`) renvoie les bonnes données pour chaque route, avec filtres fonctionnels.

---

## 5. Pages React : liste + fiche détail équipement

- Page "Voir les équipements" : grille/liste, champ de recherche, filtres par type
- Page de détail au clic sur un équipement
- Ces pages doivent être accessibles **sans compte** (cf. parcours utilisateur)
- Prévoir dès maintenant un visuel générique par type/élément (les vraies images arrivent après le MVP)

**Fini quand** : un visiteur non connecté peut chercher, filtrer et consulter le détail d'un cube ou d'une breloque.

---

## 6. Authentification (inscription/connexion)

- Route `POST /api/auth/register` (email + mot de passe, hash avec bcrypt)
- Route `POST /api/auth/login` (comparaison du hash, génération d'un token — JWT simple suffit vu le niveau de sécurité requis)
- Middleware Express de vérification du token pour protéger les routes personnage/stuff
- Pages React : formulaire d'inscription, formulaire de connexion, gestion du token côté client (stockage en mémoire ou cookie, pas de logique bancaire à prévoir)

**Fini quand** : un utilisateur peut créer un compte, se connecter, se déconnecter, et les routes protégées refusent l'accès sans token valide.

---

## 7. Création de personnage + emplacements d'équipement

- Route `POST /api/characters` (liée à l'utilisateur connecté)
- Création automatique des emplacements vides (9 cubes, 7 breloques, 9 sorts) à la création du stuff associé
- Page React "fiche personnage" affichant les emplacements vides
- Clic sur un emplacement vide → redirection vers la liste filtrée par le bon type d'équipement
- Sélection d'un équipement → retour sur la fiche personnage, emplacement rempli

**Fini quand** : le parcours complet "créer un personnage → remplir un emplacement → voir l'équipement affecté" fonctionne de bout en bout.

---

## 8. Branchement du calculateur sur la fiche perso (onglet Sorts)

- Route API qui agrège les cubes équipés d'un stuff et appelle `calculerStatsPersonnage`
- Route API qui appelle ensuite `calculerDegats` avec les sorts équipés
- Onglet "Sorts" côté React affichant, pour chaque sort équipé, les dégâts min/max calculés
- Gérer le cas d'un emplacement de sort vide (ne rien afficher ou afficher un slot vide)

**Fini quand** : remplir/changer un cube met à jour les dégâts affichés dans l'onglet Sorts sans recharger la page.

---

## 9. Sauvegarde automatique du stuff

- À chaque modification d'un emplacement (cube/breloque/sort), appel API immédiat de mise à jour (pas de bouton "Enregistrer")
- Gérer les erreurs réseau silencieusement ou avec un petit indicateur ("sauvegardé" / "erreur de sauvegarde")
- Mettre à jour `updated_at` sur le stuff à chaque modification

**Fini quand** : fermer l'onglet et rouvrir la fiche personnage affiche exactement le dernier état modifié, sans action explicite de l'utilisateur.

---

## 10. Partage par lien unique

- Génération d'un `share_token` unique à la création du stuff (UUID ou équivalent)
- Route publique `GET /api/stuff/:share_token` (aucune authentification requise)
- Page React publique affichant le stuff en lecture seule (équipements + dégâts calculés), accessible même sans compte
- Bouton "copier le lien de partage" sur la fiche personnage du propriétaire

**Fini quand** : ouvrir le lien dans une fenêtre de navigation privée (sans être connecté) affiche correctement le stuff partagé.

---

## 11. Déploiement

- Choisir l'hébergeur (point 4 du message — à trancher en parallèle, doit supporter Node.js + Express + MySQL ; Vercel est à exclure, pensé pour Next.js/serverless)
- Configurer les variables d'environnement de production
- Build du frontend React et service des fichiers statiques (soit via Express, soit via un hébergement statique séparé + API séparée)
- Migration de la base de données en production (rejouer `schema.sql` + scripts d'import)
- Nom de domaine + HTTPS

**Fini quand** : le site est accessible publiquement, le parcours complet (visite → compte → stuff → partage) fonctionne en production.

---

## Notes sur l'enchaînement

- Les tâches 1 à 4 sont strictement séquentielles (chacune dépend de la précédente).
- La tâche 5 (pages liste/détail) peut démarrer en parallèle de la tâche 6 (auth), les deux ne dépendant que de la tâche 4.
- Les tâches 7 à 10 sont séquentielles entre elles (chacune s'appuie sur la précédente).
- La tâche 11 (déploiement) peut être préparée en amont (choix d'hébergeur) mais son exécution concrète arrive logiquement en dernier.

*Document complémentaire au document de planification fonctionnelle "Dédale-Book — Document de planification". À ajouter au Project Knowledge.*
