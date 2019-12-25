import { SR5 } from '../config.js';
import { Helpers } from '../helpers.js';
/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export class SR5ItemSheet extends ItemSheet {
  constructor(...args) {
    super(...args);

    this._sheetTab = null;
  }

  /**
   * Extend and override the default options used by the Simple Item Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
          classes: ["sr5", "sheet", "item"],
          width: 700,
          height: 400,
      });
  }

  get template() {
    const path = 'systems/shadowrun5e/templates/item/';
    return `${path}${this.item.data.type}.html`;
  }

  /* -------------------------------------------- */

  /**
   * Prepare data for rendering the Item sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const data = super.getData();
    const itemData = this.item.prepareData(data.data);

    if (itemData.range && itemData.range.ammo) {
      try {
        const ammo = itemData.range.ammo;
        ammo.available.forEach(a => {
          if (a.damage === 0) delete a.damage;
          if (a.ap === 0) delete a.ap;
          if (a.blast.radius === 0) delete a.blast.radius;
          if (a.blast.dropoff === 0) delete a.blast.dropoff;
        });
      } catch (e) {
        console.error(e)
      }
    }

    if (itemData.action) {
      try {
        const action = itemData.action;
        if (action.mod === 0) delete action.mod;
        if (action.limit === 0) delete action.limit;
        if (action.damage) {
          if (action.damage.mod === 0) delete action.damage.mod;
          if (action.damage.ap.mod === 0) delete action.damage.ap.mod;
        }
        if (action.limit) {
          if (action.limit.mod === 0) delete action.limit.mod;
        }
      } catch (e) {
        console.error(e)
      }
    }

    data.config = CONFIG.SR5;
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.add-new-ammo').click(this._onAddNewAmmo.bind(this));
    html.find('.ammo-equip').click(this._onAmmoEquip.bind(this));
    html.find('.ammo-delete').click(this._onAmmoRemove.bind(this));
    html.find('.ammo-reload').click(this._onAmmoReload.bind(this));

    // Activate tabs
    let tabs = html.find('.tabs');
    let initial = this._sheetTab;
    new Tabs(tabs, {
      initial: initial,
      callback: clicked => this._sheetTab = clicked.data('tab')
    });
  }

  async _onAmmoReload(event) {
    event.preventDefault();
    this.item.reloadAmmo();
  }

  async _onAmmoRemove(event) {
    event.preventDefault();
    this.item.removeAmmo(parseInt(event.currentTarget.dataset.index));
  }

  async _onAmmoEquip(event) {
    event.preventDefault();
    this.item.equipAmmo(parseInt(event.currentTarget.dataset.index));
  }

  async _onAddNewAmmo(event) {
    event.preventDefault();
    this.item.addNewAmmo();
  }

}
