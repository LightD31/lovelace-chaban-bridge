# Chaban Bridge Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/LightD31/lovelace-chaban-bridge)](https://github.com/LightD31/lovelace-chaban-bridge/releases)
[![GitHub](https://img.shields.io/github/license/LightD31/lovelace-chaban-bridge)](https://github.com/LightD31/lovelace-chaban-bridge/blob/main/LICENSE)

Une carte personnalisée Home Assistant pour visualiser l'état actuel et les prochaines fermetures du Pont Chaban-Delmas à Bordeaux.

## À propos du Pont Chaban-Delmas

Le Pont Jacques Chaban-Delmas est un pont levant qui enjambe la Garonne à Bordeaux. Inauguré en 2013, il se lève régulièrement pour permettre le passage des navires de croisière et des bateaux de commerce remontant vers le port de Bordeaux.

## Fonctionnalités

- ✅ Affichage de l'état actuel du pont en temps réel
- ✅ Visualisation des prochaines fermetures programmées
- ✅ Nombre configurable de fermetures à afficher (1-10)
- ✅ Indicateurs visuels distincts selon le type de fermeture
- ✅ Informations détaillées sur chaque fermeture (durée, raison, dates)
- ✅ Design adaptatif et intégration native Home Assistant
- ✅ Animation visuelle pendant les fermetures
- ✅ Compatible HACS

## Prérequis

Cette carte est conçue pour fonctionner avec l'intégration [Chaban](https://github.com/LightD31/Chaban) qui fournit le capteur Home Assistant nécessaire pour les données de fermeture du pont.

**Important :** Assurez-vous d'avoir installé et configuré l'intégration Chaban avant d'utiliser cette carte.

## Installation

### Via HACS (Recommandé)

1. Ouvrez HACS dans Home Assistant
2. Allez dans "Frontend"
3. Cliquez sur les trois points en haut à droite
4. Sélectionnez "Dépôts personnalisés"
5. Ajoutez `https://github.com/LightD31/lovelace-chaban-bridge` comme dépôt frontend
6. Recherchez "Chaban Bridge Card" et installez-la

### Installation manuelle

1. Téléchargez le fichier `chaban-bridge.js` depuis GitHub
2. Copiez `chaban-bridge.js` dans le dossier `<config>/www/`
3. Ajoutez dans `configuration.yaml` :

   ```yaml
   lovelace:
     resources:
       - url: /local/chaban-bridge.js
         type: module
   ```

## Configuration

### Via l'interface utilisateur

1. Allez dans Tableau de bord → Modifier le tableau de bord
2. Cliquez sur "+ Ajouter une carte"
3. Recherchez "Chaban Bridge Card"
4. Configurez les paramètres :
   - **Entité** : Sélectionnez votre capteur pont Chaban
   - **Nombre de fermetures** : Nombre de fermetures futures à afficher (optionnel)

### Configuration YAML

```yaml
type: custom:chaban-bridge-card
entity: sensor.pont_chaban_delmas  # requis
max_items: 5                       # optionnel, défaut: 5
```

### Paramètres de configuration

| Paramètre | Type | Requis | Défaut | Description |
|-----------|------|--------|--------|-------------|
| `entity` | string | Oui | - | L'entité du capteur pont Chaban |
| `max_items` | number | Non | 5 | Nombre de fermetures futures à afficher (1-10) |

## Utilisation

Une fois configurée, la carte affichera :

### État actuel du pont

- **Statut visuel** : Indicateur coloré de l'état actuel
- **Icône** : Icône dynamique selon l'état
- **Dernière mise à jour** : Horodatage de la dernière synchronisation

### Prochaines fermetures

- **Raison** : Nom du navire ou motif de fermeture
- **Type** : Fermeture totale ou partielle
- **Dates** : Heure de début et de fin
- **Durée** : Temps de fermeture en heures et minutes

### Exemple Lovelace

```yaml
type: custom:chaban-bridge-card
entity: sensor.pont_chaban_delmas
max_items: 3
```

## Structure des données

Cette carte est compatible avec les capteurs ayant la structure suivante :

```yaml
attributes:
  device_class: enum
  icon: mdi:bridge
  friendly_name: Pont Chaban Delmas
  current_state:
    state: "0"
    is_closed: false
    name: Pont Jacques Chaban-Delmas
    last_update: "2025-07-20T21:25:52+02:00"
  is_closed: false
  last_update: "2025-07-20T21:25:52+02:00"
  bridge_name: Pont Jacques Chaban-Delmas
  closures_count: 5
  closures:
    - reason: BALMORAL
      start_date: "2025-07-24T07:04:00"
      end_date: "2025-07-24T08:27:00"
      closure_type: Totale
      duration_minutes: 83
```

### États du pont supportés

| État | Valeur numérique | Description |
|------|------------------|-------------|
| 🟢 | `"open"` | Circulation normale |
| 🟡 | `"closure_scheduled"` | Fermeture programmée |
| 🔴 | `"closing"` | Fermeture en cours |
| 🔴 | `"closed"` | Pont fermé |

La carte supporte automatiquement les formats d'état anciens et nouveaux pour assurer la compatibilité.

## Support

- 🐛 Problèmes : [GitHub Issues](https://github.com/LightD31/lovelace-chaban-bridge/issues)

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une pull request ou une issue pour discuter d'améliorations.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](https://github.com/LightD31/lovelace-chaban-bridge/blob/main/LICENSE) pour plus de détails.

## Remerciements

- Données fournies par l'intégration [Chaban](https://github.com/LightD31/Chaban)
- Inspiré par la communauté Home Assistant
- Merci à tous les contributeurs et utilisateurs

⭐ Si cette carte vous est utile, n'hésitez pas à donner une étoile au projet !
