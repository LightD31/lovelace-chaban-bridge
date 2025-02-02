# Carte Chaban Bridge 

Une carte personnalisée Home Assistant pour visualiser les prochaines fermetures du Pont Chaban-Delmas à Bordeaux.

## Caractéristiques
- Affichage des prochaines fermetures programmées
- Nombre configurable de fermetures (1-10)
- Indicateurs visuels pour fermetures totales/partielles 
- Design adaptatif

## Installation

### Via HACS
1. Dans HACS → Frontend, ajoutez le dépôt:
   ```
   https://github.com/LightD31/lovelace-chaban-bridge
   ```
2. Installez "Chaban Bridge Card"
3. Redémarrez Home Assistant

### Manuelle
1. Copiez `chaban-bridge.js` dans `<config>/www/`
2. Ajoutez dans `configuration.yaml`:
   ```yaml
   lovelace:
     resources:
       - url: /local/chaban-bridge.js
         type: module
   ```
3. Redémarrez Home Assistant

## Configuration

```yaml
type: custom:chaban-bridge-card
entity: sensor.pont_chaban_delmas # requis
max_items: 5 # optionnel, défaut: 5
```

## Informations affichées
- Nom du navire
- Date et heure de fermeture 
- Type de fermeture
- Heure de réouverture

## Licence
MIT - voir le fichier LICENSE pour plus de détails.
