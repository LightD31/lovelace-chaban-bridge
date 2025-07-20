const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;
const nothing = LitElement.prototype.nothing;

class ChabanBridgeCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
    };
  }

  static styles = css`
    .side-by-side {
      display: flex;
      flex-direction: column;
      margin: 8px 0;
    }
    ha-entity-picker {
      width: 100%;
    }
  `;

  setConfig(config) {
    this._config = config;
  }

  render() {
    if (!this._config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="side-by-side">
          <ha-entity-picker
            .label=${"Entité"}
            .hass=${this.hass}
            .value=${this._config.entity}
            .configValue=${"entity"}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
        </div>
        <div class="side-by-side">
          <ha-textfield
            label="Nombre de fermetures à afficher"
            .value=${this._config.max_items || 5}
            .configValue=${"max_items"}
            type="number"
            min="1"
            max="10"
            @input=${this._valueChanged}
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;

    const target = ev.target;
    const value = ev.detail?.value || target.value;
    const configValue = target.configValue;

    if (configValue) {
      const newConfig = {
        ...this._config,
        [configValue]: target.type === 'number' ? parseInt(value) : value,
      };

      if (value === '') {
        delete newConfig[configValue];
      }

      const event = new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }
}

customElements.define('chaban-bridge-editor', ChabanBridgeCardEditor);

class ChabanBridgeCard extends LitElement {
  static getConfigElement() {
    // Corriger le nom pour correspondre à celui défini dans customElements.define
    return document.createElement("chaban-bridge-editor");
  }

  static getStubConfig() {
    return {
      entity: "sensor.pont_chaban_delmas",
      max_items: 5
    };
  }

  // Méthode recommandée pour l'affichage en mode aperçu dans l'éditeur
  static getPreviewModeHint() {
    return "Le pont Chaban-Delmas affiche les prochaines fermetures";
  }

  static get properties() {
    return {
      _config: { type: Object },
      hass: { type: Object },
      _stateObj: { type: Object }
    };
  }

  static styles = css`
    :host {
      --closure-border-radius: var(--ha-card-border-radius, 4px);
      --maintenance-color: #ff9800;
      --boat-color: #2196f3;
      --grid-cell-height: 56px;
    }
    .bridge-status {
      height: 48px; /* 48px + 8px margin = 56px total */
      padding: 8px 16px;
      margin-bottom: 8px;
      text-align: center;
      border-radius: var(--closure-border-radius);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
    .bridge-status.open {
      background: var(--success-color);
    }
    .bridge-status.closed {
      background: var(--error-color);
    }
    .bridge-status.closure-scheduled {
      background: var(--warning-color);
    }
    .bridge-status.closing {
      background: var(--error-color);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    .current-state {
      height: 48px; /* 48px + 8px margin = 56px total */
      margin-bottom: 8px;
      padding: 6px 16px;
      background: var(--card-background-color);
      border-radius: var(--closure-border-radius);
      border: 1px solid var(--divider-color);
      display: flex;
      align-items: center;
      gap: 12px;
      box-sizing: border-box;
    }
    .current-state ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }
    .current-state-info {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      font-size: 0.9em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .closures-title {
      height: 48px; /* 48px + 8px margin = 56px total */
      margin: 0 0 8px 0;
      font-size: 1.1em;
      font-weight: bold;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }
    .closure {
      height: 48px; /* 48px + 8px margin = 56px total */
      padding: 6px 16px;
      margin-bottom: 8px;
      border-radius: var(--closure-border-radius);
      background: var(--primary-background-color);
      border-left: 4px solid var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    }
    .closure[data-reason="MAINTENANCE"] {
      border-left-color: var(--maintenance-color);
    }
    .closure:not([data-reason="MAINTENANCE"]) {
      border-left-color: var(--boat-color);
    }
    .closure-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: bold;
      font-size: 0.9em;
      min-width: 0;
      flex: 1;
    }
    .closure-reason {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .closure-dates {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .closure-type {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      background: var(--primary-color);
      color: var(--text-primary-color);
      white-space: nowrap;
    }
    .no-closures {
      height: 48px; /* 48px + 8px margin = 56px total */
      text-align: center;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-style: italic;
      box-sizing: border-box;
    }
  `

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Veuillez spécifier une entité sensor');
    }
    this._config = config;
  }

  // Fonction pour formater les dates au format JJ MMM HH:MM
  _formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString();
    const month = date.toLocaleDateString('fr-FR', { month: 'short' });
    const hours = date.getHours().toString();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${hours}:${minutes}`;
  }

  render() {
    if (!this._config || !this.hass) return html``;
    this._stateObj = this.hass.states[this._config.entity];
    if (!this._stateObj) return html`Entity not found`;

    const maxItems = this._config.max_items || 5;
    const closures = this._stateObj.attributes.closures || [];
    
    // Support pour les nouvelles données du capteur
    const currentState = this._stateObj.attributes.current_state || {};
    const state = currentState.state || this._stateObj.state;
    
    // Détection de l'état fermé selon les nouveaux formats
    let isClosed = false;
    if (this._stateObj.attributes.is_closed === true || currentState.is_closed === true) {
      isClosed = true;
    } else if (state === '3' || state === 'closed' || state === '3_FERME') {
      isClosed = true;
    }
    
    const bridgeName = this._stateObj.attributes.bridge_name || this._stateObj.attributes.friendly_name || 'Pont Chaban-Delmas';
    const lastUpdate = this._stateObj.attributes.last_update || currentState.last_update;
    
    const stateIcons = {
      'open': 'mdi:bridge',
      'closure_scheduled': 'mdi:clock-alert',
      'closing': 'mdi:bridge-lock',
      'closed': 'mdi:bridge-lock'
    };

    const stateLabels = {
      'open': 'Circulation normale',
      'closure_scheduled': 'Fermeture programmée',
      'closing': 'Fermeture en cours',
      'closed': 'Pont fermé'
    };

    // Déterminer la classe CSS pour le statut du pont
    let statusClass = 'open';
    let statusText = 'Ouvert';
    
    if (state === 'closed') {
      statusClass = 'closed';
      statusText = 'Fermé';
    } else if (state === 'closing') {
      statusClass = 'closing';
      statusText = 'Fermeture en cours';
    } else if (state === 'closure_scheduled') {
      statusClass = 'closure-scheduled';
      statusText = 'Fermeture programmée';
    }

    return html`
      <ha-card header="${bridgeName}">
        <div class="card-content">
          <div class="bridge-status ${statusClass}">
            Pont ${statusText}
          </div>
          <div class="current-state">
            <ha-icon icon="${stateIcons[state] || 'mdi:bridge'}"></ha-icon>
            <div class="current-state-info">
              <strong>${stateLabels[state] || (isClosed ? 'Pont fermé' : 'Circulation normale')}</strong>
              ${lastUpdate ? html` • ${this._formatDate(lastUpdate)}` : ''}
            </div>
          </div>
          <div class="closures">
            ${closures.length > 0 ? html`
              <div class="closures-title">Prochaines fermetures</div>
              ${closures.slice(0, maxItems).map(closure => html`
                <div class="closure" data-reason="${closure.reason}">
                  <div class="closure-header">
                    <span class="closure-reason">${closure.reason}</span>
                    <span class="closure-type">${closure.closure_type}</span>
                  </div>
                  <div class="closure-dates">
                    ${this._formatDate(closure.start_date)} - ${this._formatDate(closure.end_date)}
                    ${closure.duration_minutes > 0 ? html` (${Math.floor(closure.duration_minutes / 60)}h${closure.duration_minutes % 60 > 0 ? `${closure.duration_minutes % 60}min` : ''})` : ''}
                  </div>
                </div>
              `)}
            ` : html`
              <div class="no-closures">
                Aucune fermeture programmée
              </div>
            `}
          </div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    // Utilise la même logique que getGridOptions() pour la cohérence
    const gridOptions = this.getGridOptions();
    return gridOptions.rows;
  }

  getGridOptions() {
    const maxItems = this._config?.max_items || 5;
    const closures = this.hass?.states[this._config?.entity]?.attributes?.closures || [];
    const actualItems = Math.min(maxItems, closures.length);
    
    // Calcul précis basé sur les hauteurs CSS fixes (chaque cellule = 56px)
    // - Statut du pont : 1 ligne (56px)
    // - État actuel : 1 ligne (56px)  
    // - Titre "Prochaines fermetures" : 1 ligne (56px) si il y a des fermetures
    // - Chaque fermeture : 1 ligne (56px)
    // - "Aucune fermeture" : 1 ligne (56px) si pas de fermetures
    
    let totalRows = 2; // statut (1) + état actuel (1)
    
    if (actualItems > 0) {
      totalRows += 1; // titre
      totalRows += actualItems; // chaque fermeture prend 1 ligne
    } else {
      totalRows += 1; // message "aucune fermeture"
    }
    
    // Recommandation officielle : utiliser des multiples de 3 pour les colonnes
    // Cette carte contient beaucoup d'informations, donc on privilégie une largeur importante
    return {
      columns: 12, // Prend toute la largeur par défaut (carte d'information)
      min_columns: 6, // Minimum : moitié de largeur pour rester lisible
      max_columns: 12, // Maximum : toute la largeur
      rows: totalRows,
      min_rows: 3, // Minimum : statut + état + message vide
      max_rows: 15, // Maximum pour beaucoup de fermetures (1 + 1 + 1 + 10 + marge)
    };
  }

  // Méthode obsolète mais conservée pour compatibilité
  getLayoutOptions() {
    const gridOptions = this.getGridOptions();
    return {
      grid_rows: gridOptions.rows,
      grid_columns: gridOptions.columns,
      grid_min_rows: gridOptions.min_rows,
      grid_max_rows: gridOptions.max_rows,
    };
  }
}

customElements.define('chaban-bridge-card', ChabanBridgeCard);

// Add card to picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "chaban-bridge-card",
  name: "Pont Chaban",
  description: "Affiche les prochaines fermetures du Pont Chaban",
  preview: false,
  documentationURL: "https://github.com/LightD31/lovelace-chaban-bridge"
});