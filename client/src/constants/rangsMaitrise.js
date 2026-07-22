// Rangs de maîtrise (Novice/Expert/Maître α/Maître ẞ), partagés par les breloques
// et les sorts — différents des rangs des cubes (Commun/Rare/Épique/Mythique/Éxalté).
export const RANGS_MAITRISE = ['Novice', 'Expert', 'Maître α', 'Maître ẞ'];

// Couleur de bordure par rang de maîtrise, affichée sur les emplacements équipés
// de la fiche perso (breloques et sorts partagent la même échelle de rangs).
const COULEURS_RANG_MAITRISE = {
  Expert: '#C0C0C0', // argent
  'Maître α': '#D4AF37', // or
  'Maître ẞ': '#D4AF37', // or
};

// Novice n'a pas d'entrée : reste sur la bordure par défaut (rien de spécial à ce rang).
export function couleurRangMaitrise(rang) {
  return COULEURS_RANG_MAITRISE[rang] || 'var(--bordure)';
}
