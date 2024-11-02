# Chaban Bridge Card for Home Assistant

The Chaban Bridge Card is a custom card for Home Assistant that displays upcoming closures of the Chaban-Delmas Bridge in Bordeaux, France. This card provides an easy-to-read interface for viewing scheduled bridge closures, helping residents and travelers plan their routes accordingly.

## Features

- Displays upcoming bridge closures with detailed information
- Configurable number of closures to display
- Color-coded indicators for total and partial closures
- Responsive design that adapts to your Home Assistant theme

## Installation

### HACS (Home Assistant Community Store)

1. Ensure that [HACS](https://hacs.xyz/) is installed in your Home Assistant instance.
2. In the HACS panel, go to "Frontend" and click the "+" button.
3. Search for "Chaban Bridge Card" and install it.
4. Restart Home Assistant.

### Manual Installation

1. Download the `chaban-bridge-card.js` file from the `dist` folder in this repository.
2. Copy the file to your `<config>/www/` directory.
3. Add the following to your `configuration.yaml` file:

   ```yaml
   lovelace:
     resources:
       - url: /local/chaban-bridge-card.js
         type: module
    ```
4. Restart Home Assistant

# Configuration
## Add the card to your Lovelace UI:
```yaml
type: custom:chaban-bridge-card
entity: sensor.chaban_bridge_next_5_closures
max_items: 5
```

## Options

| Name      | Type   | Default     | Description                                      |
|-----------|--------|-------------|--------------------------------------------------|
| entity    | string | **Required**| The entity ID of your Chaban Bridge sensor       |
| max_items | number | 5           | Maximum number of closures to display (1-10)     |
# Usage
The card will automatically display the upcoming bridge closures based on the data provided by the specified entity. Each closure will show:

- Ship name

- Closure date

- Closure type (total or partial)

- Closure start time

- Reopening time

# Contributing
Contributions to the Chaban Bridge Card are welcome! Please feel free to submit pull requests or open issues on the GitHub repository.

# License
This project is licensed under the MIT License - see the LICENSE file for details.