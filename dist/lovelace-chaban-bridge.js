// Configuration UI element
class ChabanBridgeCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  get _max_items() {
    return this._config.max_items || 5;
  }

  configChanged(newConfig) {
    const event = new Event("config-changed", {
      bubbles: true,
      composed: true
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  render() {
    if (!this._config) {
      return '';
    }

    return `
      <div class="card-config">
        <div class="side-by-side">
          <ha-entity-picker
            .label="Entité"
            .hass=${this.hass}
            .value=${this._config.entity}
            .configValue=${"entity"}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
        </div>
        <div class="side-by-side">
          <paper-input
            label="Nombre de fermetures à afficher"
            .value=${this._max_items}
            .configValue=${"max_items"}
            type="number"
            min="1"
            max="10"
            @value-changed=${this._valueChanged}
          ></paper-input>
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
      if (value === '') {
        delete this._config[configValue];
      } else {
        this._config = {
          ...this._config,
          [configValue]: target.type === 'number' ? parseInt(value) : value,
        };
      }
      this.configChanged(this._config);
    }
  }
}

customElements.define('chaban-bridge-card-editor', ChabanBridgeCardEditor);

// Main card
class ChabanBridgeCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("chaban-bridge-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "sensor.chaban_bridge_next_5_closures",
      max_items: 5
    };
  }

  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <ha-card header="Fermetures du Pont Chaban">
          <div class="card-content">
            <style>
              .closure {
                padding: 12px;
                margin-bottom: 12px;
                border-radius: 4px;
                background: var(--primary-background-color);
              }
              .closure:last-child {
                margin-bottom: 0;
              }
              .closure-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-weight: bold;
              }
              .closure-time {
                color: var(--primary-text-color);
                opacity: 0.8;
              }
              .total-closure {
                border-left: 3px solid var(--error-color);
                padding-left: 12px;
              }
              .partial-closure {
                border-left: 3px solid var(--warning-color);
                padding-left: 12px;
              }
              .closure-details {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 8px;
                font-size: 0.9em;
              }
              .closure-label {
                color: var(--secondary-text-color);
              }
              .no-closures {
                padding: 24px;
                text-align: center;
                color: var(--secondary-text-color);
              }
            </style>
            <div class="closures"></div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector('.closures');
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const maxItems = this.config.max_items || 5;

    if (!state) {
      this.content.innerHTML = `
        <div class="no-closures">
          Aucune donnée disponible
        </div>
      `;
      return;
    }

    let closures = state.attributes.closures || [];
    
    if (closures.length === 0) {
      this.content.innerHTML = `
        <div class="no-closures">
          Aucune fermeture prévue
        </div>
      `;
      return;
    }

    // Sort closures by date
    closures.sort((a, b) => new Date(a.date_passage) - new Date(b.date_passage));
    
    // Limit to max_items
    closures = closures.slice(0, maxItems);

    this.content.innerHTML = closures.map(closure => {
      const closureClass = closure.fermeture_totale ? 'total-closure' : 'partial-closure';
      const closureDate = new Date(closure.date_passage).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const closeTime = new Date(closure.fermeture_a_la_circulation).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const reopenTime = new Date(closure.re_ouverture_a_la_circulation).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="closure ${closureClass}">
          <div class="closure-header">
            <div>${closure.bateau}</div>
            <div class="closure-time">${closureDate}</div>
          </div>
          <div class="closure-details">
            <span class="closure-label">Type:</span>
            <span>${closure.type_de_fermeture}</span>
            <span class="closure-label">Fermeture:</span>
            <span>${closeTime}</span>
            <span class="closure-label">Réouverture:</span>
            <span>${reopenTime}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Veuillez définir une entité');
    }
    this.config = config;
  }

  getCardSize() {
    return Math.min(this.config.max_items || 5, 7);
  }
}

customElements.define('chaban-bridge-card', ChabanBridgeCard);

// Add card to picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "chaban-bridge-card",
  name: "Fermetures Pont Chaban",
  description: "Carte affichant les prochaines fermetures du Pont Chaban"
});