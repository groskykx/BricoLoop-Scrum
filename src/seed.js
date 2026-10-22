// Données de démo chargées au démarrage (T-03) : 4 voisins, 8 outils, 5 catégories.

export const seed = {
  users: [
    { id: 'u1', firstName: 'Camille', district: 'Centre' },
    { id: 'u2', firstName: 'Yanis', district: 'Gare' },
    { id: 'u3', firstName: 'Léa', district: 'Centre' },
    { id: 'u4', firstName: 'Hugo', district: 'Port' },
  ],
  tools: [
    { id: 't1', ownerId: 'u1', name: 'Perceuse à percussion', category: 'Perçage', description: 'Bosch 750 W, coffret de forets inclus.', status: 'available' },
    { id: 't2', ownerId: 'u2', name: 'Taille-haie électrique', category: 'Jardinage', description: 'Lame de 50 cm, en réparation.', status: 'unavailable' },
    { id: 't3', ownerId: 'u2', name: 'Ponceuse orbitale', category: 'Peinture', description: 'Avec 10 disques grain 120.', status: 'available' },
    { id: 't4', ownerId: 'u3', name: 'Tondeuse thermique', category: 'Jardinage', description: 'Coupe 46 cm, bac de ramassage.', status: 'available' },
    { id: 't5', ownerId: 'u3', name: 'Nettoyeur haute pression', category: 'Nettoyage', description: 'Kärcher 130 bars.', status: 'available' },
    { id: 't6', ownerId: 'u4', name: 'Niveau laser', category: 'Mesure', description: 'Lignes croisées, trépied fourni.', status: 'available' },
    { id: 't7', ownerId: 'u4', name: 'Visseuse sans fil', category: 'Perçage', description: '18 V, deux batteries.', status: 'available' },
    { id: 't8', ownerId: 'u1', name: 'Escabeau 5 marches', category: 'Autre', description: '', status: 'available' },
  ],
  loans: [],
};
