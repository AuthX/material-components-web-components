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
import { FormElement, html, BaseElement, property, query, observer, classMap, findAssignedElement } from '@authentic/mwc-base/form-element';
import MDCFormFieldFoundation from '@material/form-field/foundation';
import { MDCFormFieldAdapter } from '@material/form-field/adapter';

import { style } from './mwc-formfield-css';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-formfield': Formfield;
  }
}

export class Formfield extends BaseElement {
  
  /**
   * Optional. Default value is false. Use this property to put the input after the label
   */
  @property({ type: Boolean })
  alignEnd = false;

  /**
   * Recommended. Indicates the element containing the formfield's text label
   */
  @property({ type: String })
  @observer(async function (this: Formfield, label: string) {
    const input = this.input;
    if (input) {
      if (input.localName === 'input') {
        input.setAttribute('aria-label', label);
      } else if (input instanceof FormElement) {
        await input.updateComplete;
        input.setAriaLabel(label);
      }
    }
  })
  label = '';

  /**
   * Root element for formfield component.
   */
  @query('.mdc-form-field')
  protected mdcRoot!: HTMLElement;

  protected mdcFoundation!: MDCFormFieldFoundation;

  protected readonly mdcFoundationClass = MDCFormFieldFoundation;

  /**
   * Create the adapter for the `mdcFoundation`.
   * Override and return an object with the Adapter's functions implemented
   */
  protected createAdapter(): MDCFormFieldAdapter {
    return {
      registerInteractionHandler: (type: string, handler: any) => {
        this.labelEl.addEventListener(type, handler);
      },
      deregisterInteractionHandler: (type: string, handler: any) => {
        this.labelEl.removeEventListener(type, handler);
      },
      activateInputRipple: () => {
        const input = this.input;
        if (input instanceof FormElement && input.ripple) {
          input.ripple.activate();
        }
      },
      deactivateInputRipple: () => {
        const input = this.input;
        if (input instanceof FormElement && input.ripple) {
          input.ripple.deactivate();
        }
      }
    }
  }

  @query('slot')
  protected slotEl!: HTMLSlotElement;

  @query('label')
  protected labelEl!: HTMLLabelElement;

  protected get input() {
    return findAssignedElement(this.slotEl, '*');
  }

  static styles = style;

  /**
   * Used to render the lit-html TemplateResult to the element's DOM
   */
  render() {
    return html`
      <div class="mdc-form-field ${classMap({ 'mdc-form-field--align-end': this.alignEnd })}">
        <slot></slot>
        <label class="mdc-label" @click="${this._labelClick}">${this.label}</label>
      </div>`;
  }

  /**
   * Handles the click event on label
   */
  protected _labelClick() {
    const input = this.input;
    if (input) {
      input.focus();
      input.click();
    }
  }
}

customElements.define('mwc-formfield', Formfield);
