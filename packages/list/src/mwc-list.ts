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
  observer,
  property,
  query,
  customElement,
  classMap,
  addHasRemoveClass,
  findAssignedElements,
} from '@authentic/mwc-base/base-element.js';
import { emit } from '@authentic/mwc-base/utils';
import { closest, matches } from '@material/dom/ponyfill';
// import { ripple } from '@authentic/mwc-ripple/ripple-directive';
import MDCListFoundation from './_foundation';
import { MDCListAdapter } from './_adapter';
import { strings } from './_constants';
import { style } from './mwc-list-css';
import { ListItem } from './mwc-list-item';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-list': List;
  }
}

@customElement('mwc-list' as any)
export class List extends BaseElement {

  @query('.mdc-list')
  protected mdcRoot!: HTMLElement;

  @query("slot")
  protected slotEl!: HTMLSlotElement;

  @property({ type: Number })
  lines = 1;

  @property({ type: Boolean })
  ripple = false;

  @property({ type: Boolean })
  avatarList = false;

  @property({ type: Boolean })
  nonInteractive = false;

  @property({ type: Boolean })
  useActivated = false;

  @property({ type: String })
  inputType = 'none';

  @property({ type: String })
  inputAction = 'primary';

  @observer(function (this: List, value: boolean) {
    this.mdcFoundation && this.mdcFoundation.setVerticalOrientation(!value);
  })
  @property({ type: Boolean })
  horizontal = false;

  @observer(function (this: List, value: boolean) {
    this.mdcFoundation && this.mdcFoundation.setWrapFocus(value);
  })
  @property({ type: Boolean })
  wrapFocus = true;

  @observer(function (this: List, value: boolean) {
    this.mdcFoundation && this.mdcFoundation.setSingleSelection(value);
  })
  @property({ type: Boolean })
  singleSelection = true;

  @observer(function (this: List, value: number) {
    this.mdcFoundation && this.mdcFoundation.setSelectedIndex(value);
  })
  @property({ type: Number })
  selectedIndex = -1;

  protected mdcFoundation!: MDCListFoundation;
  protected readonly mdcFoundationClass = MDCListFoundation;

  firstUpdated() {
    super.firstUpdated();
    this.layout();
    this.initializeListType();
  }

  static styles = style;

  render() {
    const classes = {
    };
    return html`
      <ul class="mdc-list ${classMap(classes)}" @keydown=${this.handleKeydownEvent_} @click=${this.handleClickEvent_}
        @focusin=${this.handleFocusInEvent_} @focusout=${this.handleFocusOutEvent_}>
        <slot></slot>
      </ul>
    `;
  }

  createAdapter(): MDCListAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      getListItemCount: () => this.listElements.length,
      inputType: () => this.inputType,
      setSelectedAtIndex: (index) => {
        this.listElements.forEach(ele => {
          ele.selected = false;
        })
        this.listElements[index].selected = true;
      },
      toggleItemAtIndex: (index) => { this.listElements[index].toggle() },
      getFocusedElementIndex: () => {
        return this.listElements.map((ele, index) => {
          return (ele && Number(ele.getAttribute('tabindex')) >= 0) ? index : -1;
        }).filter(e => e !== -1)[0];
      },
      getAttributeForElementIndex: (index, attr) => {
        const ele = this.listElements[index] as ListItem;
        if (ele) return ele.getAttribute(attr); //temporary
      },
      setAttributeForElementIndex: (index, attr, value) => {
        const ele = this.listElements[index] as ListItem;
        if (ele) ele.setAttribute(attr, value); // temporary
      },
      addClassForElementIndex: (index, className) => {
        const ele = this.listElements[index] as ListItem;
        if (ele) ele.addClass(className); // temp solution
      },
      removeClassForElementIndex: (index, className) => {
        const ele = this.listElements[index] as ListItem;
        if (ele) ele.removeClass(className); // temp solution
      },
      focusItemAtIndex: (index: number) => {
        const ele = this.listElements[index] as ListItem;
        if (ele) ele.setFocused(true);
      },
      setTabIndexForListItemChildren: (listItemIndex: number, tabIndexValue: string) => {
        return `${listItemIndex} , ${tabIndexValue}`; // TODO
      },
      hasRadioAtIndex: (index: number) => {
        const ele = this.listElements[index] as ListItem;
        return ele ? ele.radio : false;
      },
      hasCheckboxAtIndex: (index: number) => {
        const ele = this.listElements[index] as ListItem;
        return ele ? ele.checkbox : false;
      },
      isCheckboxCheckedAtIndex: (index: number) => {
        const ele = this.listElements[index] as ListItem;
        return ele ? ele.selected : false;
      },
      setCheckedCheckboxOrRadioAtIndex: (index: number) => {
        const ele = this.listElements[index] as ListItem;
        if (ele) ele.selected = true;
      },
      notifyAction: (index: number) => { emit(this, strings.ACTION_EVENT, { listIndex: index }, true) },
      isFocusInsideList: (): boolean => (this.mdcRoot.querySelectorAll(":focus").length > 0),
    }
  }

  public layout() {
    this.mdcFoundation.layout();
  }

  public getFound() {
    return this.mdcFoundation
  }

  /**
   * Initialize selectedIndex value based on pre-selected checkbox list items, single selection or radio.
   */
  public initializeListType() {
    this.selectedIndex = this.listElements.indexOf(this.listElements.filter(e => e.selected)[0]);
  }

  get listElements(): ListItem[] {
    return findAssignedElements(this.slotEl, 'mwc-list-item') as ListItem[];
  }

  private getListItemIndex_(evt: Event): number {
    return this.getIndex(this.getListItem_(evt))
  }

  private getListItem_(evt: Event): ListItem | null {
    const eventTarget = evt.target as Element;
    return closest(eventTarget, `mwc-list-item`) as ListItem || null;
  }

  private getIndex(item): number {
    return item ? this.listElements.indexOf(item) : -1
  }
  /**
   * Used to figure out which element was clicked before sending the event to the foundation.
   */
  private handleFocusInEvent_(evt: FocusEvent) {
    const index = this.getListItemIndex_(evt);
    this.mdcFoundation!.handleFocusIn(evt, index);
  }

  /**
 * Used to figure out which element was clicked before sending the event to the foundation.
 */
  private handleFocusOutEvent_(evt: FocusEvent) {
    const index = this.getListItemIndex_(evt);
    this.mdcFoundation!.handleFocusOut(evt, index);
  }

  /**
   * Used to figure out which element was focused when keydown event occurred before sending the event to the
   * foundation.
   */
  private handleKeydownEvent_(evt: KeyboardEvent) {
    const index = this.getListItemIndex_(evt);
    const target = evt.target as Element;

    if (index >= 0 && !this.nonInteractive) {
      this.mdcFoundation!.handleKeydown(evt, target instanceof ListItem, index);
    }
  }

  /**
   * Used to figure out which element was clicked before sending the event to the foundation.
   */
  private handleClickEvent_(evt: MouseEvent) {
    const index = this.getListItemIndex_(evt);
    const target = evt.target as Element;
    if (this.nonInteractive) return;

    // Toggle the checkbox only if it's not the target of the event, or the checkbox will have 2 change events.
    const toggleCheckbox = !matches(target, strings.CHECKBOX_RADIO_SELECTOR);
    this.mdcFoundation!.handleClick(index, toggleCheckbox);
  }

  // NOTE: needed only for ShadyDOM where delegatesFocus is not implemented
  public focus() {
    this.mdcRoot.focus();
  }

}
