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
  html,
  property,
  query,
  customElement,
  classMap,
} from '@authentic/mwc-base/base-element.js';
import { List as MWCList } from './mwc-list';

import { style } from './mwc-list-item-css';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-list-item': ListItem;
  }
}

@customElement('mwc-list-item' as any)
export class ListItem extends LitElement {

  @query('.mdc-list-item')
  protected mdcRoot!: HTMLElement;

  @property({ type: String })
  public variant = 'single-line';

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: String })
  public value = "";

  @property({ type: Boolean })
  public focused = false;

  @property({ type: Boolean })
  public selected = false;

  @property({ type: Boolean })
  public activated = false;

  @property({ type: Boolean })
  public checkbox = false;

  @property({ type: Boolean })
  public radio = false;

  @property({ type: Boolean })
  public trailingInput = false;

  @property({ type: Number })
  public tabindex = -1;

  @property({ type: Boolean })
  public expandable = false;

  @property({ type: Boolean })
  public expanded = false;

  @property({ type: Boolean })
  public indent = false;

  protected _lines = 1;
  protected _ripple = false;
  protected _avatarList = false;
  protected _nonInteractive = false;
  protected _inputType = 'none';
  protected _inputAction = '';
  protected _slot_graphic = true;
  protected _slot_content = true;
  protected _slot_meta = true;
  protected _slot_secondary = true;

  static styles = style;

  render() {
    let inactive = this._nonInteractive || this.disabled;
    const classes = {
      "mdc-list-item": true,
      "mdc-list-item__avatar-list": this._avatarList,
      "mdc-list-item--two-line": this._lines === 2,
      "mdc-list-item--disabled": this.disabled,
      "mdc-list-item--non-interactive": this._nonInteractive,
      "mdc-list-item--selected": this.selected && !inactive,
      "mdc-list-item--activated": this.activated && !inactive,
      "mdc-list-item--expanded": this.expanded,
      "mdc-list-item--expandable": this.expandable,
      "mdc-list-item--indented": this.indent,
      "mdc-ripple-upgraded": this._ripple,
      "mdc-ripple-upgraded--background-focused": this._ripple && this.focused && !inactive,
      "mdc-list-item--background-focused": !this._ripple && this.focused && !inactive,
      "mdc-list-item--background-focused-disabled": !this._ripple && this.focused && this.disabled,
    };

    return html`
      <li class="${classMap(classes)}" tabindex="${this.tabindex}" aria-current="${this.focused}" aria-selected="${this.selected}">
        ${this.renderGraphic()}
        <span class="mdc-list-item__text">
          ${this._lines === 1 ? this.renderSingleLine() : this.renderDoubleLine()}
        </span>
        ${this.renderMeta()}
      </li>
      ${this.renderContent()}
    `;
  }

  public firstUpdated(changed) {
    super.firstUpdated(changed);

    this.updateComplete
      .then(() => {
        this.setParentType();
        this.removeEmptySlots();
      });
  }

  public toggle(): void {
    this.expanded = this.expandable
      ? !this.expanded
      : false;
    this.requestUpdate();
  }

  public updated() {
    this.focused = this.tabindex >= 0;
  }

  public renderSingleLine() {
    return html`
      <slot></slot>
    `;
  }

  public renderDoubleLine() {
    return html`
      <span class="mdc-list-item__primary-text">
        <slot></slot>
      </span>
      <span class="mdc-list-item__secondary-text">
        <slot name='secondary'></slot>
      </span>
    `;
  }

  public renderGraphic() {
    const orNot = this._slot_graphic ? '' : '-empty';
    return html`
      <slot class="mdc-list-item__graphic${orNot}" name='graphic'></slot>
    `
  }

  public renderMeta() {
    let moreorless = this.expanded ? "expand_less" : "expand_more";
    const orNot = this._slot_meta ? '' : '-empty';
    return this.expandable
      ? html`
        <span class="mdc-list-item__meta${orNot}">
          <mwc-icon>${moreorless}</mwc-icon>
        </span>
      `: html`
        <span class="mdc-list-item__meta${orNot}">
          <slot name='meta'></slot>
        </span>
      `;
  }

  public renderContent() {
    const classes = {
      "mdc-list-item__content": true,
      "mdc-list-item__content--expanded": this.expanded,
    }
    return html`
      <div class="${classMap(classes)}">
        <slot name='content'></slot>
      </div>
    `;
  }


  public addClass(className) {
    this.mdcRoot.classList.add(className)
  }

  public removeClass(className) {
    this.mdcRoot.classList.remove(className)
  }

  public getAttribute(attr) {
    return this[attr];
  }

  public setAttribute(attr, value) {
    this[attr] = value;
  }

  public setFocused(focus: boolean) {
    if (focus) {
      this.focused = true;
      this.tabindex = 0;
    } else {
      this.tabindex = -1;
      this.focused = false;
    }
  }

  public setParentType(parentElement = this.parentElement) {
    if (parentElement instanceof MWCList) {
      this._lines = parentElement.lines;
      this._ripple = parentElement.ripple;
      this._avatarList = parentElement.avatarList;
      this._nonInteractive = parentElement.nonInteractive;
      this._inputType = parentElement.inputType;
      this._inputAction = parentElement.inputAction;
      this.requestUpdate();
    }
  }

  public removeEmptySlots() {
    Array
      .from( this.shadowRoot!.querySelectorAll( "slot" ) )
      .forEach( ( slot ) => {
        let nodes = slot.assignedNodes();
        if (nodes.length) {
        } else {
          this[ `_slot_${slot.name}` ] = false;
          this.requestUpdate()
        }
      } );
  }

  public focus() {
    this.mdcRoot.focus();
    this.setFocused(true);
  }

  public blur() {
    this.mdcRoot.blur();
    this.setFocused(false);
  }

}
