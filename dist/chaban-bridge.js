// Home Assistant already provides these imports from their frontend
// No need to include external dependencies
const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

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
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static styles = css`
    :host {
      --closure-border-radius: var(--ha-card-border-radius, 4px);
    }
    .closure {
      padding: 12px;
      margin-bottom: 12px;
      border-radius: var(--closure-border-radius);
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
    .card-content {
      padding: 16px;
    }
  `;

  static getConfigElement() {
    return document.createElement("chaban-bridge-editor");
  }

  static getStubConfig() {
    return {
      entity: "sensor.chaban_bridge_next_5_closures",
      max_items: 5
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Veuillez définir une entité');
    }
    this.config = config;
  }

  _formatDate(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateStr;
    }
  }

  _formatTime(dateStr) {
    try {
      return new Date(dateStr).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting time:', e);
      return dateStr;
    }
  }

  _renderClosure(closure) {
    return html`
      <div class="closure ${closure.fermeture_totale ? 'total-closure' : 'partial-closure'}">
        <div class="closure-header">
          <div>${closure.bateau}</div>
          <div class="closure-time">${this._formatDate(closure.date_passage)}</div>
        </div>
        <div class="closure-details">
          <span class="closure-label">Type:</span>
          <span>${closure.type_de_fermeture}</span>
          <span class="closure-label">Fermeture:</span>
          <span>${this._formatTime(closure.fermeture_a_la_circulation)}</span>
          <span class="closure-label">Réouverture:</span>
          <span>${this._formatTime(closure.re_ouverture_a_la_circulation)}</span>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const entityId = this.config.entity;
    const state = this.hass.states[entityId];
    const maxItems = this.config.max_items || 5;

    if (!state) {
      return html`
        <ha-card header="Fermetures du Pont Chaban">
          <div class="card-content">
            <div class="no-closures">
              Aucune donnée disponible
            </div>
          </div>
        </ha-card>
      `;
    }

    let closures = state.attributes.closures || [];
    
    if (closures.length === 0) {
      return html`
        <ha-card header="Fermetures du Pont Chaban">
          <div class="card-content">
            <div class="no-closures">
              Aucune fermeture prévue
            </div>
          </div>
        </ha-card>
      `;
    }

    // Sort closures by date and limit to max_items
    closures = [...closures]
      .sort((a, b) => new Date(a.date_passage).getTime() - new Date(b.date_passage).getTime())
      .slice(0, maxItems);

    return html`
      <ha-card header="Fermetures du Pont Chaban">
        <div class="card-content">
          ${closures.map(closure => this._renderClosure(closure))}
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return Math.min(this.config?.max_items || 5, 7);
  }
}

customElements.define('chaban-bridge', ChabanBridgeCard);

// Add card to picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "chaban-bridge",
  name: "Fermetures Pont Chaban",
  description: "Carte affichant les prochaines fermetures du Pont Chaban"
});