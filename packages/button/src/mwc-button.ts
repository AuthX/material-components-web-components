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
import { LitElement, html, property, customElement, classMap } from '@authentic/mwc-base/base-element';
import { ripple } from '@authentic/mwc-ripple/ripple-directive';

import { style } from './mwc-button-css';

import '@authentic/mwc-icon/mwc-icon-font';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-button': Button;
  }
}

@customElement('mwc-button' as any)
export class Button extends LitElement {

  @property({ type: Boolean })
  raised = false;

  @property({ type: Boolean })
  unelevated = false;

  @property({ type: Boolean })
  outlined = false;

  @property({ type: Boolean })
  dense = false;

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({ type: Boolean })
  trailingIcon = false;

  @property()
  icon = '';

  @property()
  label = '';

  @property({ type: String, reflect: true })
  href = '';

  @property({ type: String, reflect: true })
  target = '_self';

  createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  static styles = style;

  render() {
    const classes = {
      'mdc-button': true,
      'mdc-button--raised': this.raised,
      'mdc-button--unelevated': this.unelevated,
      'mdc-button--outlined': this.outlined,
      'mdc-button--dense': this.dense,
    };
    
    const mdcButtonIcon = html`
      <i class="material-icons mdc-button__icon" aria-hidden="true">${this.icon}</i>
    `;

    return html`
      ${this.href
        ? html`
          <a
            .ripple="${ripple({ unbounded: false })}"
            class="${classMap(classes)}"
            ?disabled="${this.disabled}"
            aria-label="${this.label || this.icon}"
            href="${this.href}"
            target="${this.target}"
          >
            ${this.icon && !this.trailingIcon ? mdcButtonIcon : ''}
            <span class="mdc-button__label">${this.label}</span>
            ${this.icon && this.trailingIcon ? mdcButtonIcon : ''}
            <slot></slot>
          </a>
        `
        : html`
          <button
            .ripple="${ripple({ unbounded: false })}"
            class="${classMap(classes)}"
            ?disabled="${this.disabled}"
            aria-label="${this.label || this.icon}"
          >
            ${this.icon && !this.trailingIcon ? mdcButtonIcon : ''}
            <span class="mdc-button__label">${this.label}</span>
            ${this.icon && this.trailingIcon ? mdcButtonIcon : ''}
            <slot></slot>
          </button>
        `
      }
    `;
  }
}
