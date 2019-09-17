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
  FormElement,
  query,
  customElement,
  property,
  html,
  observer,
  HTMLElementWithRipple,
  addHasRemoveClass
} from '@authentic/mwc-base/form-element';
import { ripple } from '@authentic/mwc-ripple/ripple-directive';
import MDCRadioFoundation from '@material/radio/foundation';
import { MDCRadioAdapter } from '@material/radio/adapter';
import { SelectionController } from './selection-controller';

import { style } from './mwc-radio-css';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-radio': Radio;
  }
}

@customElement('mwc-radio' as any)
export class Radio extends FormElement {

  /**
   * Root element for Radio component. This root element is use for MDC Foundation usage
   */
  @query('.mdc-radio')
  protected mdcRoot!: HTMLElementWithRipple;

  /**
   * Provides special properties and methods for manipulating the options, layout, and presentation of <input> elements.
   */
  @query('input')
  protected formElement!: HTMLInputElement

  /**
   * Optional. Default value is false. Setter/getter for the radio's checked state
   */
  @property({ type: Boolean })
  @observer(function (this: Radio, checked: boolean) {
    this.formElement.checked = checked;
  })
  checked = false;

  /**
   * Optional. Default value is false. Setter/getter for the radio's disabled state
   */
  @property({ type: Boolean })
  @observer(function (this: Radio, disabled: boolean) {
    this.mdcFoundation.setDisabled(disabled);
  })
  disabled = false;

  /**
   * Optional. Setter/getter for the radio's value
   */
  @property({ type: String })
  @observer(function (this: Radio, value: string) {
    this.formElement.value = value;
  })
  value = '';

  /**
   * Optional. Setter/getter for the radio's name
   */
  @property({ type: String })
  name = '';

  /**
   * Optional. Setter/getter for the radio's label
   */
  @property({ type: String })
  label = '';

  protected mdcFoundationClass = MDCRadioFoundation;

  protected mdcFoundation!: MDCRadioFoundation;

  protected _selectionController: SelectionController | null = null;

  /**
   * An instance method use to set the initial values for Radio
   */
  constructor() {
    super();
    // Selection Controller is only needed for native ShadowDOM
    if (!window['ShadyDOM'] || !window['ShadyDOM']['inUse']) {
      this._selectionController = SelectionController.getController(this);
    }
  }

  /**
   * Invoked each time the custom element is appended into the DOM. 
   * This will happen each time the node is moved, and may happen before the element's contents have been fully parsed
   */
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Invoked each time the custom element is disconnected from the document's DOM.
   */
  disconnectedCallback() {
    if (this._selectionController) {
      this._selectionController.unregister(this);
    }
  }

  /**
   * Used to sets the formElement's focus
   */
  focusNative() {
    this.formElement.focus();
  }

  static styles = style;

  /**
   * Ripple getter for Ripple integration
   */
  get ripple() {
    return this.mdcRoot.ripple;
  }

  /**
   * Create the adapter for the `mdcFoundation`.
   * Override and return an object with the Adapter's functions implemented
   */
  protected createAdapter(): MDCRadioAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      setNativeControlDisabled: (disabled: boolean) => {
        this.formElement.disabled = disabled;
      }
    };
  }

  /**
   * Handles the change event for the radio
   */
  protected _changeHandler() {
    this.checked = this.formElement.checked;
    if (this._selectionController) {
      this._selectionController.update(this);
    }
  }

  /**
   * Handles the focus event for the radio
   */
  protected _focusHandler() {
    if (this._selectionController) {
      this._selectionController.focus(this);
    }
  }

  /**
   * Handles the click event for the radio
   */
  protected _clickHandler() {
    // Firefox has weird behavior with radios if they are not focused
    this.formElement.focus();
  }

  /**
   * Used to render the lit-html TemplateResult to the element's DOM
   */
  render() {
    return html`
      <div class="mdc-radio" .ripple="${ripple()}">
        <input class="mdc-radio__native-control" type="radio" name="${this.name}" aria-label="${this.label}" .checked="${this.checked}" .value="${this.value}"
          @change="${this._changeHandler}" @focus="${this._focusHandler}" @click="${this._clickHandler}">
        <div class="mdc-radio__background">
          <div class="mdc-radio__outer-circle"></div>
          <div class="mdc-radio__inner-circle"></div>
        </div>
      </div>`;
  }

  /**
   * Invoked when the element is first updated. Implement to perform one time
   * work on the element after update.
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * @param _changedProperties Map of changed properties with old values
   */
  firstUpdated() {
    super.firstUpdated();
    if (this._selectionController) {
      this._selectionController.register(this);
      this._selectionController.update(this);
    }
  }
}
