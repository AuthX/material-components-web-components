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

  @query('.mdc-radio')
  protected mdcRoot!: HTMLElementWithRipple;

  @query('input')
  protected formElement!: HTMLInputElement

  @property({ type: Boolean })
  @observer(function (this: Radio, checked: boolean) {
    this.formElement.checked = checked;
  })
  checked = false;

  @property({ type: Boolean })
  @observer(function (this: Radio, disabled: boolean) {
    this.mdcFoundation.setDisabled(disabled);
  })
  disabled = false;

  @property({ type: String })
  @observer(function (this: Radio, value: string) {
    this.formElement.value = value;
  })
  value = '';

  @property({ type: String })
  name = '';

  @property({ type: String })
  label = '';

  protected mdcFoundationClass = MDCRadioFoundation;

  protected mdcFoundation!: MDCRadioFoundation;

  protected _selectionController: SelectionController | null = null;

  constructor() {
    super();
    // Selection Controller is only needed for native ShadowDOM
    if (!window['ShadyDOM'] || !window['ShadyDOM']['inUse']) {
      this._selectionController = SelectionController.getController(this);
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    if (this._selectionController) {
      this._selectionController.unregister(this);
    }
  }

  focusNative() {
    this.formElement.focus();
  }

  static styles = style;

  get ripple() {
    return this.mdcRoot.ripple;
  }

  protected createAdapter(): MDCRadioAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      setNativeControlDisabled: (disabled: boolean) => {
        this.formElement.disabled = disabled;
      }
    };
  }

  protected _changeHandler() {
    this.checked = this.formElement.checked;
    if (this._selectionController) {
      this._selectionController.update(this);
    }
  }

  protected _focusHandler() {
    if (this._selectionController) {
      this._selectionController.focus(this);
    }
  }

  protected _clickHandler() {
    // Firefox has weird behavior with radios if they are not focused
    this.formElement.focus();
  }

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

  firstUpdated() {
    super.firstUpdated();
    if (this._selectionController) {
      this._selectionController.register(this);
      this._selectionController.update(this);
    }
  }
}
