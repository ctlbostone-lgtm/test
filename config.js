// Données des exemples de métiers
const EXEMPLES_METIERS = {
    electricien: {
        titre: 'Devis installation électrique',
        sections: [
            {
                title: 'Gainage et câblage',
                items: [
                    { description: 'Gaine ICTA 20/10', unit: 'meter', qty: 50, price: 12000 },
                    { description: 'Câble VGV 2,5 mm²', unit: 'meter', qty: 100, price: 19000 },
                    { description: 'Câble VGV 1,5 mm²', unit: 'meter', qty: 50, price: 14500 },
                    { description: 'Gaine annelée 25 mm', unit: 'meter', qty: 30, price: 8000 }
                ]
            },
            {
                title: 'Appareillage',
                items: [
                    { description: 'Interrupteur simple', unit: 'piece', qty: 10, price: 3500 },
                    { description: 'Prise de courant 2P+T', unit: 'piece', qty: 15, price: 4200 },
                    { description: 'Tableau électrique 13 modules', unit: 'piece', qty: 1, price: 45000 },
                    { description: 'Disjoncteur 16A', unit: 'piece', qty: 8, price: 6500 }
                ]
            }
        ]
    },
    plombier: {
        titre: 'Devis plomberie sanitaire',
        sections: [
            {
                title: 'Tuyauterie',
                items: [
                    { description: 'Tube PER Ø16', unit: 'meter', qty: 40, price: 2500 },
                    { description: 'Tube PER Ø20', unit: 'meter', qty: 30, price: 3200 },
                    { description: 'Tube cuivre Ø12', unit: 'meter', qty: 20, price: 8500 },
                    { description: 'Tube cuivre Ø14', unit: 'meter', qty: 15, price: 9800 }
                ]
            },
            {
                title: 'Robinetterie',
                items: [
                    { description: 'Robinet d\'arrêt 1/2"', unit: 'piece', qty: 5, price: 4500 },
                    { description: 'Mélangeur lavabo', unit: 'piece', qty: 2, price: 25000 },
                    { description: 'Flexible 40 cm', unit: 'piece', qty: 10, price: 1800 },
                    { description: 'Clapet anti-retour', unit: 'piece', qty: 2, price: 6500 }
                ]
            }
        ]
    },
    peintre: {
        titre: 'Devis travaux de peinture',
        sections: [
            {
                title: 'Préparation',
                items: [
                    { description: 'Enduit de lissage', unit: 'bag', qty: 5, price: 12000 },
                    { description: 'Bande à joint', unit: 'roll', qty: 3, price: 3500 },
                    { description: 'Papier de verre fin', unit: 'piece', qty: 10, price: 800 }
                ]
            },
            {
                title: 'Peinture',
                items: [
                    { description: 'Peinture acrylique blanc', unit: 'bucket', qty: 4, price: 18500 },
                    { description: 'Peinture satinée', unit: 'bucket', qty: 2, price: 22000 },
                    { description: 'Rouleau 25 cm', unit: 'piece', qty: 3, price: 2500 },
                    { description: 'Pinceau 50 mm', unit: 'piece', qty: 2, price: 1200 }
                ]
            }
        ]
    },
    geniecivil: {
        titre: 'Devis construction / génie civil',
        sections: [
            {
                title: 'Fondations',
                items: [
                    { description: 'Ciment (sac 50kg)', unit: 'bag', qty: 50, price: 6500 },
                    { description: 'Sable (m³)', unit: 'cbm', qty: 5, price: 25000 },
                    { description: 'Gravier (m³)', unit: 'cbm', qty: 8, price: 30000 },
                    { description: 'Fer à béton Ø10', unit: 'kg', qty: 200, price: 850 }
                ]
            },
            {
                title: 'Maçonnerie',
                items: [
                    { description: 'Parpaing 20x20x40', unit: 'piece', qty: 400, price: 850 },
                    { description: 'Mortier prêt à l\'emploi', unit: 'bag', qty: 20, price: 7500 },
                    { description: 'Treillis soudé', unit: 'piece', qty: 10, price: 12500 }
                ]
            }
        ]
    },
    mecanicien: {
        titre: 'Devis réparation automobile',
        sections: [
            {
                title: 'Moteur',
                items: [
                    { description: 'Kit distribution', unit: 'kit', qty: 1, price: 150000 },
                    { description: 'Courroie accessoires', unit: 'piece', qty: 1, price: 25000 },
                    { description: 'Filtre à huile', unit: 'piece', qty: 1, price: 5000 },
                    { description: 'Huile moteur 5W40', unit: 'liter', qty: 5, price: 8000 }
                ]
            },
            {
                title: 'Freinage',
                items: [
                    { description: 'Plaquettes de frein avant', unit: 'set', qty: 1, price: 45000 },
                    { description: 'Disques de frein', unit: 'pair', qty: 1, price: 65000 },
                    { description: 'Liquide de frein', unit: 'liter', qty: 1, price: 7000 }
                ]
            }
        ]
    },
    hydraulicien: {
        titre: 'Devis adduction d’eau potable (AEP)',
        sections: [
            {
                title: 'Canalisations',
                items: [
                    { description: 'Tube PEHD Ø63', unit: 'meter', qty: 200, price: 4200 },
                    { description: 'Tube PEHD Ø90', unit: 'meter', qty: 150, price: 6800 },
                    { description: 'Tube PEHD Ø110', unit: 'meter', qty: 100, price: 9200 },
                    { description: 'Raccord électrosoudable', unit: 'piece', qty: 30, price: 3500 }
                ]
            },
            {
                title: 'Équipements',
                items: [
                    { description: 'Vanne à opercule', unit: 'piece', qty: 4, price: 55000 },
                    { description: 'Compteur d’eau', unit: 'piece', qty: 2, price: 38000 },
                    { description: 'Clapet anti-retour', unit: 'piece', qty: 3, price: 12500 },
                    { description: 'Bride PN10', unit: 'piece', qty: 10, price: 7500 }
                ]
            }
        ]
    },
    carreleur: {
        titre: 'Devis carrelage',
        sections: [
            {
                title: 'Préparation du sol',
                items: [
                    { description: 'Ragréage sol', unit: 'bag', qty: 10, price: 9500 },
                    { description: 'Primaire d’accrochage', unit: 'bucket', qty: 2, price: 12000 }
                ]
            },
            {
                title: 'Carrelage',
                items: [
                    { description: 'Carrelage 30x30 (m²)', unit: 'sqm', qty: 25, price: 15000 },
                    { description: 'Carrelage 60x60 (m²)', unit: 'sqm', qty: 30, price: 22000 },
                    { description: 'Croisillon 2mm', unit: 'pack', qty: 2, price: 1500 },
                    { description: 'Joint epoxy', unit: 'bucket', qty: 3, price: 8500 }
                ]
            }
        ]
    }
};

// Symboles de devises
const CURRENCY_SYMBOLS = {
    'XAF': 'FCFA',
    'XOF': 'FCFA',
    'NGN': '₦',
    'GHS': '₵',
    'KES': 'KSh',
    'MAD': 'DH',
    'ZAR': 'R',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
};

// Constantes pour le compteur
const MAX_GENERATIONS = 3;
const COUNTER_DURATION = 6 * 60 * 60 * 1000; // 6 heures en ms
