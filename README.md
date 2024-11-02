# Carte Chaban Bridge pour Home Assistant

La Carte Chaban Bridge est une carte personnalisée pour Home Assistant qui affiche les prochaines fermetures du Pont Chaban-Delmas à Bordeaux. Cette carte fournit une interface facile à lire pour visualiser les fermetures programmées du pont, aidant ainsi les résidents et les voyageurs à planifier leurs itinéraires.

## Fonctionnalités
- Affiche les prochaines fermetures du pont avec des informations détaillées
- Nombre configurable de fermetures à afficher
- Indicateurs colorés pour les fermetures totales et partielles
- Design responsive qui s'adapte à votre thème Home Assistant

## Installation

### Installation via HACS
1. Assurez-vous que [HACS](https://hacs.xyz/) est installé dans votre instance Home Assistant
2. Allez dans HACS → Frontend
3. Cliquez sur les 3 points en haut à droite → Dépôts personnalisés
4. Ajoutez le dépôt :
   - URL : `https://github.com/LightD31/lovelace-chaban-bridge`
   - Catégorie : `Lovelace`
5. Cliquez sur "Ajouter"
6. Cliquez sur le bouton "+" pour ajouter un nouveau dépôt
7. Cherchez "Chaban Bridge Card" et installez-le
8. Redémarrez Home Assistant

### Installation manuelle
1. Téléchargez le fichier `chaban-bridge.js` depuis le dossier `dist` de ce dépôt
2. Copiez le fichier dans votre répertoire `<config>/www/`
3. Ajoutez ce qui suit à votre fichier `configuration.yaml` :
   ```yaml
   lovelace:
     resources:
       - url: /local/chaban-bridge.js
         type: module
   ```
4. Redémarrez Home Assistant

# Configuration

## Ajoutez la carte à votre interface Lovelace :
```yaml
type: custom:chaban-bridge-card
entity: sensor.chaban_bridge_next_5_closures
max_items: 5
```

## Options
| Nom       | Type    | Défaut      | Description                                           |
|-----------|---------|-------------|-------------------------------------------------------|
| entity    | string  | **Requis**  | L'ID de l'entité de votre capteur Chaban Bridge       |
| max_items | nombre  | 5           | Nombre maximum de fermetures à afficher (1-10)        |

# Utilisation
La carte affichera automatiquement les prochaines fermetures du pont en fonction des données fournies par l'entité spécifiée. Chaque fermeture affichera :
- Nom du navire
- Date de fermeture
- Type de fermeture (totale ou partielle)
- Heure de début de fermeture
- Heure de réouverture

# Contribution
Les contributions à la Carte Chaban Bridge sont les bienvenues ! N'hésitez pas à soumettre des pull requests ou à ouvrir des issues sur le dépôt GitHub.

# Licence
Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.