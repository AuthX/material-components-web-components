/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {
  BaseElement,
  html,
  property,
  query,
  observer,
  addHasRemoveClass,
  PropertyValues,
  emit
} from '@authentic/mwc-base/base-element';
import MDCIconButtonToggleFoundation from '@material/icon-button/foundation';
import { MDCIconButtonToggleAdapter } from '@material/icon-button/adapter';
import { ripple } from '@authentic/mwc-ripple/ripple-directive';

export abstract class IconButtonBase extends BaseElement {

  protected mdcFoundationClass = MDCIconButtonToggleFoundation;

  protected mdcFoundation!: MDCIconButtonToggleFoundation;

  /**
   * Root element for icon-button component.
   */
  @query('.mdc-icon-button')
  protected mdcRoot!: HTMLElement;

  /**
   * Optional. Indicates the element containing the icon-button's text label
   */
  @property({ type: String })
  label = '';

  /**
   * Optional. Default value sets to false. Removes ability to interacted with and have no visual interaction effect
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Recommended. Indicates the name of the icon to be displayed when the icon button toggle is in the "on" state.
   */
  @property({ type: String })
  icon = '';

  /**
   * Optional. Indicates the name of the icon to be displayed when the icon button toggle is in the "off" state.
   */
  @property({ type: String })
  offIcon = '';

  /**
   * Optional. Used to indicate if the icon button toggle is in the "on" state.
   */
  @property({ type: Boolean, reflect: true })
  @observer(function (this: IconButtonBase, state: boolean) {
    this.mdcFoundation.toggle(state);
  })
  on = false;

  /**
   * Create the adapter for the `mdcFoundation`.
   * Override and return an object with the Adapter's functions implemented
   */
  protected createAdapter(): MDCIconButtonToggleAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      setAttr: (name: string, value: string) => {
        this.mdcRoot.setAttribute(name, value);
      },
      notifyChange: (evtData: { isOn: boolean }) => {
        if (this.offIcon === '') {
          return;
        }
        emit(this, 'change', { detail: evtData }, true );
      }
    }
  }

  /**
   * Event handler triggered on the click event. It will toggle the icon from on/off and update aria attributes.
   */
  protected handleClick() {
    if (this.offIcon !== '') {
      this.on = !this.on;
      this.mdcFoundation.handleClick();
    }
  }

  /**
   * Handles the focus event for the icon-button
   */
  focus() {
    this.mdcRoot.focus();
  }

  /**
   * This method is invoked whenever the icon-button is updated
   * @param _changedProperties Map of changed properties with old values
   */
  updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);

    if (this.offIcon === '') {
      this.on = true;
    }
  }

  /**
   * Used to render the lit-html TemplateResult to the element's DOM
   */
  render() {
    return html`
      <button .ripple="${ripple()}" class="mdc-icon-button" @click="${this.handleClick}" aria-label="${this.label}"
        ?disabled="${this.disabled}">
        <i class="material-icons mdc-icon-button__icon" aria-hidden="true">${this.offIcon}</i>
        <i class="material-icons mdc-icon-button__icon mdc-icon-button__icon--on" aria-hidden="true">${this.icon}</i>
      </button>`;
  }
}
