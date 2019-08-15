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
  query,
  html,
  classMap,
  property
} from '@authentic/mwc-base/base-element';

import { style } from './mwc-list-item-css';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-list-divider': ListDivider;
  }
}

@customElement('mwc-list-divider' as any)
export class ListDivider extends LitElement {

  @query('.mdc-list-divider')
  protected mdcRoot!: HTMLElement;

  @property({ type: Boolean })
  public inset = false;

  @property({ type: Boolean })
  public padded = false;

  static styles = style;

  render() {
    const classes = {
      'mdc-list-divider': true,
      'mdc-list-divider--inset': this.inset,
      'mdc-list-divider--padded': this.padded
    };

    return html`
      <div class="${classMap(classes)}"></div>
    `;
  }
}
