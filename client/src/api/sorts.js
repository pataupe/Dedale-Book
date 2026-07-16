const BASE_URL = 'http://localhost:3001/api';

export async function listerSorts({ nom = '', limite = 24, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (nom) params.set('nom', nom);
  params.set('limit', limite);
  params.set('offset', offset);

  const reponse = await fetch(`${BASE_URL}/sorts?${params}`);
  if (!reponse.ok) throw new Error('Erreur lors du chargement des sorts');
  return reponse.json();
}
