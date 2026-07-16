// Les 6 éléments de cubes, avec la couleur associée (variables CSS définies dans index.css).
export const ELEMENTS = [
  { valeur: 'Air', couleur: 'var(--couleur-air)' },
  { valeur: 'Feu', couleur: 'var(--couleur-feu)' },
  { valeur: 'Terre', couleur: 'var(--couleur-terre)' },
  { valeur: 'Eau', couleur: 'var(--couleur-eau)' },
  { valeur: 'Chaos', couleur: 'var(--couleur-chaos)' },
  { valeur: 'Lumière', couleur: 'var(--couleur-lumiere)' },
];

export function couleurElement(element) {
  return ELEMENTS.find((e) => e.valeur === element)?.couleur || 'var(--texte-attenue)';
}
