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
  LitElement,
  customElement,
  html,
  property,
  classMap
} from "@authentic/mwc-base/base-element";
import { ripple } from  "@authentic/mwc-ripple/ripple-directive";

import { style } from "./mwc-card-css.js";

import "@authentic/mwc-icon/mwc-icon-font";

declare global {
  interface HTMLElementTagNameMap {
    "mwc-card": Card;
  }
}

@customElement("mwc-card" as any)
export class Card extends LitElement {
  @property({ type: Boolean })
  stroke = false;

  @property({ type: String })
  aspectRatio =  '';

  static styles = style;

  render() {
    const mediaStyles = this.aspectRatio ? 'mdc-card__media--' + this.aspectRatio : '';

    return html`
      <div class="mdc-card ${classMap({ "mdc-card--stroked": this.stroke })}">
        <div class="mdc-card__primary-action" tabindex="0" .ripple="${ripple({ unbounded: false })}">
          <div class="mdc-card__media ${mediaStyles}">
            <div class="mdc-card__media-content">
              <slot name="media"></slot>
            </div>
          </div>

          <slot name="content"></slot>
        </div>

        <div class="mdc-card__actions">
          <div class="mdc-card__action-buttons">
            <slot name="action-buttons"></slot>
          </div>

          <div class="mdc-card__action-icons">
            <slot name="action-icons"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
