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
import { html, FormElement, customElement, property, query, observer, HTMLElementWithRipple, addHasRemoveClass, RippleSurface } from '@authentic/mwc-base/form-element';
import { ripple } from '@authentic/mwc-ripple/ripple-directive';
import MDCCheckboxFoundation from '@material/checkbox/foundation';
import { MDCCheckboxAdapter } from '@material/checkbox/adapter';

import { style } from './mwc-checkbox-css';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-checkbox': Checkbox;
  }
}

@customElement('mwc-checkbox' as any)
export class Checkbox extends FormElement {

  /**
   * Root element for checkbox component. This root element is use for MDC Foundation usage
   */
  @query('.mdc-checkbox')
  protected mdcRoot!: HTMLElementWithRipple;
  
  /**
   * Provides special properties and methods for manipulating the options, layout, and presentation of <input> elements.
   */
  @query('input')
  protected formElement!: HTMLInputElement;

  /**
   * Optional. Default value is false. Setter/getter for the checkbox's checked state
   */
  @property({ type: Boolean })
  checked = false;

  /**
   * Optional. Default value is false. Setter/getter for the checkbox's indeterminate state
   * The indeterminate property will display as a marked checkbox, usually with a hyphen
   */
  @property({ type: Boolean })
  indeterminate = false;

  /**
   * Optional. Default value is false. Setter/getter for the checkbox's disabled state
   */
  @property({ type: Boolean })
  @observer(function (this: Checkbox, value: boolean) {
    this.mdcFoundation.setDisabled(value);
  })
  disabled = false;

  /**
   * Optional. Setter/getter for the checkbox's
   */
  @property({ type: String })
  value = ''

  /**
   * Optional. Setter/getter for the checkbox's
   */
  @property({ type: String })
  label = ''

  /**
   * Optional. Setter/getter for the checkbox's name
   */
  @property({ type: String })
  name = ''

  /**
   * Return the foundation class for checkbox component
   */
  protected mdcFoundationClass = MDCCheckboxFoundation;

  /**
   * An instance of the MDC Foundation class to attach to the root element
   */
  protected mdcFoundation!: MDCCheckboxFoundation;

  static styles = style;

  /**
   * Ripple getter for Ripple integration
   */
  get ripple(): RippleSurface | undefined {
    return this.mdcRoot.ripple;
  }

  /**
   * Create the adapter for the `mdcFoundation`.
   * Override and return an object with the Adapter's functions implemented
   */
  protected createAdapter(): MDCCheckboxAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      forceLayout: () => this.mdcRoot.offsetWidth,
      isAttachedToDOM: () => this.isConnected,
      isIndeterminate: () => this.indeterminate,
      isChecked: () => this.checked,
      hasNativeControl: () => Boolean(this.formElement),
      setNativeControlDisabled: (disabled: boolean) => {
        this.formElement.disabled = disabled;
      },
      setNativeControlAttr: (attr: string, value: string) => {
        this.formElement.setAttribute(attr, value);
      },
      removeNativeControlAttr: (attr: string) => {
        this.formElement.removeAttribute(attr);
      },
    }
  }

  /**
   * Used to render the lit-html TemplateResult to the element's DOM
   */
  render() {
    return html`
      <div class="mdc-checkbox" @animationend="${this._animationEndHandler}" .ripple="${ripple()}">
        <input type="checkbox" class="mdc-checkbox__native-control" aria-label="${this.label}" @change="${this._changeHandler}" .indeterminate="${this.indeterminate}"
          .checked="${this.checked}" .value="${this.value}">
        <div class="mdc-checkbox__background">
          <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
            <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
          </svg>
          <div class="mdc-checkbox__mixedmark"></div>
        </div>
      </div>`;
  }

  /**
   * Handles the change event for the checkbox
   */
  protected _changeHandler() {
    this.checked = this.formElement.checked;
    this.indeterminate = this.formElement.indeterminate;
    this.mdcFoundation.handleChange();
  }

  /**
   * Handles the animation end event for the checkbox
   */
  protected _animationEndHandler() {
    this.mdcFoundation.handleAnimationEnd();
  }
}
