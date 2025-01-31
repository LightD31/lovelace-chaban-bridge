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
    return document.createElement("chaban-bridge-card-editor");
  }

  static get properties() {
    return {
      _config: { type: Object },
      hass: { type: Object },
      _stateObj: { type: Object }
    };
  }

  static get styles() {
    return css`
      ha-card {
        padding: 16px;
      }
      .current-state {
        display: flex;
        align-items: center;
        font-size: 1.2em;
        margin-bottom: 16px;
      }
      .state-icon {
        margin-right: 8px;
        color: var(--primary-color);
      }
      .state-open {
        color: var(--success-color);
      }
      .state-closed {
        color: var(--error-color);
      }
      .last-update {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-left: auto;
      }
      .closures {
        display: grid;
        gap: 12px;
      }
      .closure {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px;
        padding: 12px;
        border-radius: 8px;
        background: var(--card-background-color);
        box-shadow: var(--ha-card-box-shadow, none);
      }
      .closure-icon {
        grid-row: span 2;
        display: flex;
        align-items: center;
        color: var(--primary-color);
      }
      .reason {
        font-weight: bold;
      }
      .date {
        color: var(--secondary-text-color);
      }
      .type {
        font-size: 0.9em;
        color: var(--primary-color);
      }
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Veuillez spécifier une entité sensor');
    }
    this._config = config;
  }

  render() {
    if (!this._stateObj) return html``;
    
    const isOpen = this._stateObj.state === "0_OUVERT";
    const closures = this._stateObj.attributes.closures || [];
    const maxItems = 5;

    return html`
      <ha-card>
        <div class="card-content">
          <div class="current-state">
            <ha-icon
              class="state-icon"
              icon="${isOpen ? 'mdi:gate-open' : 'mdi:gate'}"
            ></ha-icon>
            <span class="${isOpen ? 'state-open' : 'state-closed'}">
              ${isOpen ? 'Pont Ouvert' : 'Pont Fermé'}
            </span>
            <div class="last-update">
              Mise à jour: ${new Date(this._stateObj.attributes.last_update).toLocaleTimeString()}
            </div>
          </div>
          <div class="closures">
            ${closures.slice(0, maxItems).map(closure => html`
              <div class="closure">
                <div class="closure-icon">
                  <ha-icon icon="${closure.reason === 'MAINTENANCE' ? 'mdi:wrench' : 'mdi:ferry'}"></ha-icon>
                </div>
                <div class="reason">${closure.reason}</div>
                <div class="date">
                  ${new Date(closure.start_date).toLocaleDateString()} 
                  ${new Date(closure.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  -
                  ${new Date(closure.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div class="type">${closure.closure_type}</div>
              </div>
            `)}
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define('chaban-bridge-card', ChabanBridgeCard);

// Add card to picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "chaban-bridge",
  name: "Fermetures Pont Chaban",
  description: "Carte affichant les prochaines fermetures du Pont Chaban"
});