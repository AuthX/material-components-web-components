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
} from '@material/mwc-base/base-element';

import { style } from './mwc-list-group-header-css';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-list-group-header': ListGroupHeader;
  }
}

@customElement('mwc-list-group-header' as any)
export class ListGroupHeader extends LitElement {

  @query('.mdc-list-group-header')
  protected mdcRoot!: HTMLElement;

  @property({ type: Boolean })
  protected inset = false;

  static styles = style;

  render() {
    const classes = {
      'mdc-list-group-subheader': true,
      'mdc-list-group-subheader--inset': this.inset
    };

    return html`
      <h3 class="${classMap(classes)}">
        <slot></slot>
      </h3>
    `;
  }
}
