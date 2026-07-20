// Valeurs réelles observées dans Sort.element (certains sorts ont 2 éléments à la
// fois, stockés en texte libre type "Feu, Air" — géré côté API avec un LIKE).
// Chaos et Lumière n'apparaissent jamais comme élément de sort (ce sont des familles
// de cubes, cf. calcul.js), donc pas de case pour eux ici.
export const ELEMENTS_SORTS = ['Feu', 'Terre', 'Eau', 'Air', 'Meilleur élément'];
