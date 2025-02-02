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
    }
    .bridge-status {
      padding: 12px;
      margin-bottom: 16px;
      text-align: center;
      border-radius: var(--closure-border-radius);
      color: white;
    }
    .bridge-status.open {
      background: var(--success-color);
    }
    .bridge-status.closed {
      background: var(--error-color);
    }
    .current-state {
      margin-bottom: 16px;
      padding: 16px;
      background: var(--card-background-color);
      border-radius: var(--closure-border-radius);
      border: 1px solid var(--divider-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .current-state ha-icon {
      --mdc-icon-size: 24px;
    }
    .closure {
      padding: 12px;
      margin-bottom: 12px;
      border-radius: var(--closure-border-radius);
      background: var(--primary-background-color);
      border-left: 4px solid var(--primary-color);
    }
    .closure[data-reason="MAINTENANCE"] {
      border-left-color: var(--maintenance-color);
    }
    .closure:not([data-reason="MAINTENANCE"]) {
      border-left-color: var(--boat-color);
    }
    .closure-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .closure-dates {
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    .closure-type {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.9em;
      background: var(--primary-color);
      color: var(--text-primary-color);
    }
  `

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Veuillez spécifier une entité sensor');
    }
    this._config = config;
  }

  render() {
    if (!this._config || !this.hass) return html``;
    this._stateObj = this.hass.states[this._config.entity];
    if (!this._stateObj) return html`Entity not found`;

    const maxItems = this._config.max_items || 5;
    const closures = this._stateObj.attributes.closures || [];
    const isClosed = this._stateObj.attributes.is_closed === true;
    
    const stateIcons = {
      '0_OUVERT': 'mdi:bridge',
      '1_FERMETURE_VALIDEE': 'mdi:bridge-lock',
      '2_FERMETURE_EN_COURS': 'mdi:bridge-lock',
      '3_FERME': 'mdi:bridge-lock'
    };

    const stateLabels = {
      '0_OUVERT': 'Circulation normale',
      '1_FERMETURE_VALIDEE': 'Fermeture validée',
      '2_FERMETURE_EN_COURS': 'Fermeture en cours',
      '3_FERME': 'Pont fermé'
    };

    return html`
      <ha-card header="${this._stateObj.attributes.friendly_name}">
        <div class="card-content">
          <div class="bridge-status ${isClosed ? 'closed' : 'open'}">
            Pont ${isClosed ? 'Fermé' : 'Ouvert'}
          </div>
          <div class="current-state">
            <ha-icon icon="${stateIcons[this._stateObj.state]}"></ha-icon>
            <div>
              <strong>État actuel:</strong> ${stateLabels[this._stateObj.state]}<br>
              <strong>Dernière mise à jour:</strong> ${new Date(this._stateObj.attributes.last_update).toLocaleString('fr-FR', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </div>
          </div>
          <div class="closures">
            ${closures.slice(0, maxItems).map(closure => html`
              <div class="closure" data-reason="${closure.reason}">
                <div class="closure-header">
                  <span class="closure-reason">${closure.reason}</span>
                  <span class="closure-type">${closure.closure_type}</span>
                </div>
                <div class="closure-dates">
                  Du ${new Date(closure.start_date).toLocaleString('fr-FR', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })} au
                  ${new Date(closure.end_date).toLocaleString('fr-FR', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </div>
              </div>
            `)}
          </div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    const maxItems = this._config?.max_items || 5;
    // Base size + header + status + current state + items
    return 1 + 1 + 1 + maxItems;
  }

  getLayoutOptions() {
    return {
      grid_rows: 6,
      grid_columns: 4,
      grid_min_rows: 6,
      grid_max_rows: 10,
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