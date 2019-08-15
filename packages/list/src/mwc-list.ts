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
  customElement,
  query,
  html,
  classMap,
  property,
  findAssignedElements,
  PropertyValues,
  observer,
  emit
} from '@authentic/mwc-base/base-element';
import { closest, matches } from '@material/dom/ponyfill';
import { MDCListAdapter } from '@material/list/adapter';
import { MDCListFoundation } from '@material/list/foundation';
import { MDCListIndex } from '@material/list/types';
import { cssClasses, strings } from '@material/list/constants';
import { ListItem as MWCListItem } from './mwc-list-item';
import { ListDivider as MWCListDivider } from './mwc-list-divider';

import { style } from './mwc-list-css';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-list': List;
  }
}

@customElement('mwc-list' as any)
export class List extends BaseElement {

  @query('.mdc-list')
  protected mdcRoot!: HTMLElement;

  @query('slot')
  protected slotEl!: HTMLSlotElement;

  @property({ type: Boolean })
  public group = false;

  @property({ type: Boolean })
  public content = false;

  @property({ type: String, reflect: true })
  public type = 'single-line';

  @property({ type: Boolean })
  public nonInteractive = false;

  @property({ type: Boolean })
  public avatarList = false;

  @property({ type: Boolean })
  public offsetContent = false;

  @property({ type: Boolean })
  @observer(function (this: List, value: boolean) {
    if (!value) {
      this.removeAttribute(strings.ARIA_ORIENTATION);
    } else {
      this.setAttribute(
        strings.ARIA_ORIENTATION,
        strings.ARIA_ORIENTATION_HORIZONTAL
      );
    }

    this.mdcFoundation.setVerticalOrientation(!value);
  })
  public horizontal = false;

  @property({ type: Boolean })
  @observer(function (this: List, value: boolean) {
    this.mdcFoundation.setWrapFocus(value);
  })
  public wrapFocus = false;

  @property({ type: Boolean })
  @observer(function (this: List, value: boolean) {
    this.mdcFoundation.setSingleSelection(value);
    this.setAttribute('role', value ? 'listbox' : 'list');
  })
  public singleSelection = false;

  get selectedIndex(): MDCListIndex {
    return this.mdcFoundation.getSelectedIndex();
  }

  set selectedIndex(value: MDCListIndex) {
    this.mdcFoundation.setSelectedIndex(value);
    emit(this, 'action', { index: value }, true);
  }

  public get listElements(): MWCListItem[] {
    return this.slotEl && findAssignedElements(this.slotEl, 'mwc-list-item') as MWCListItem[];
  }

  protected get listDividers(): MWCListDivider[] {
    return this.slotEl && findAssignedElements(this.slotEl, 'mwc-list-divider') as MWCListDivider[];
  }

  protected get selectors() {
    return {
      checkbox: 'mwc-checkbox',
      radio: 'mwc-radio',
      checkboxRadio: 'mwc-checkbox:not([disabled]), mwc-radio:not([disabled])',
      focusableChildElements: 'mwc-button:not([disabled]), mwc-radio:not([disabled]), mwc-checkbox:not([disabled]), a',
      childElementsToToggleTabIndex: 'mwc-button:not([disabled]), a'
    }
  }

  protected _handleKeyDown = this._onKeyDown.bind(this) as EventListenerOrEventListenerObject;

  protected _handleClick = this._onClick.bind(this) as EventListenerOrEventListenerObject;

  protected _handleFocusIn = this._onFocusIn.bind(this) as EventListenerOrEventListenerObject;
  
  protected _handleFocusOut = this._onFocusOut.bind(this) as EventListenerOrEventListenerObject;

  protected mdcFoundation!: MDCListFoundation;

  protected readonly mdcFoundationClass = MDCListFoundation;

  static styles = style;

  protected createAdapter(): MDCListAdapter {
    return {
      addClassForElementIndex: (index, className) => {
        const element = this.listElements[index];

        if (element) {
          switch (className) {
            case cssClasses.LIST_ITEM_SELECTED_CLASS:
              element.selected = true;
              break;
            case cssClasses.LIST_ITEM_ACTIVATED_CLASS:
              element.activated = true;
              break;
            case cssClasses.LIST_ITEM_DISABLED_CLASS:
              element.disabled = true;
              break;
            default:
              element.classList.add(className);
              break;
          }
        }
      },
      focusItemAtIndex: (index) => {
        const element = this.listElements[index] as HTMLElement | undefined;
        if (element) {
          element.focus();
        }
      },
      getAttributeForElementIndex: (index, attr) => this.listElements[index].getAttribute(attr),
      getFocusedElementIndex: () => {
        return this.listElements.indexOf(document.activeElement! as MWCListItem);
      },
      getListItemCount: () => this.listElements.length,
      hasCheckboxAtIndex: (index) => {
        const listItem = this.listElements[index];
        return !!listItem.querySelector(this.selectors.checkbox);
      },
      hasRadioAtIndex: (index) => {
        const listItem = this.listElements[index];
        return !!listItem.shadowRoot!.querySelector(this.selectors.radio);
      },
      isCheckboxCheckedAtIndex: (index) => {
        const listItem = this.listElements[index];
        const toggleEl = listItem.querySelector<HTMLInputElement>(this.selectors.checkbox);
        return toggleEl && toggleEl.parentElement === listItem
          ? toggleEl.checked
          : false;
      },
      isFocusInsideList: () => this.mdcRoot.contains(document.activeElement),
      isRootFocused: () => document.activeElement === this,
      notifyAction: (index) => emit(this, 'action', { index }, true),
      removeClassForElementIndex: (index, className) => {
        const element = this.listElements[index];

        if (element) {
          switch (className) {
            case cssClasses.LIST_ITEM_SELECTED_CLASS:
              element.selected = false;
              break;
            case cssClasses.LIST_ITEM_ACTIVATED_CLASS:
              element.activated = false;
              break;
            case cssClasses.LIST_ITEM_DISABLED_CLASS:
              element.disabled = false;
              break;
            default:
              element.classList.remove(className);
              break;
          }
        }
      },
      setAttributeForElementIndex: (index, attr, value) => {
        const element = this.listElements[index];
        if (element) {
          element.setAttribute(attr, value);
        }
      },
      setCheckedCheckboxOrRadioAtIndex: (index, isChecked) => {
        const listItem = this.listElements[index];
        const toggleEl = listItem.querySelector<HTMLInputElement>(this.selectors.checkboxRadio);
        if (toggleEl && toggleEl.parentElement === listItem) {
          toggleEl.checked = isChecked;
          emit(toggleEl, 'change', {}, true);
        }
      },
      setTabIndexForListItemChildren: (listItemIndex, tabIndexValue) => {
        const element = this.listElements[listItemIndex];
        const listItemChildren = [ ...element.querySelectorAll(this.selectors.childElementsToToggleTabIndex) ];
        listItemChildren.forEach((el) => el.setAttribute('tabindex', tabIndexValue));
      },
    }
  }

  protected render() {
    const classes = {
      'mdc-list': true,
      'mdc-list--group': this.group,
      'mdc-list--content': this.content,
      'mdc-list--two-line': this.type === 'two-line',
      'mdc-list--non-interactive': this.nonInteractive,
      'mdc-list--avatar-list': this.avatarList
    }

    return html`
      <div class="${classMap(classes)}">
        <slot></slot>
      </div>
    `;
  }

  public firstUpdated() {
    this.listDividers.forEach(item => item.setAttribute('role', 'separator'));
    if (this.listElements[0]) this.listElements[0].setAttribute('tabindex', '0');

    super.firstUpdated();
    
    this.addEventListener('keydown', this._handleKeyDown);
    this.addEventListener('click', this._handleClick);
    this.addEventListener('focusin', this._handleFocusIn);
    this.addEventListener('focusout', this._handleFocusOut);
    
    setTimeout(() => {
      this.layout();
      this.initializeListType();
    })
  }

  protected updated(_changedProperties: PropertyValues) {
    if (_changedProperties.has('type')) {
      this.listElements.forEach(item => item.type = this.type);
    }

    if (_changedProperties.has('nonInteractive')) {
      this.listElements.forEach(item => item.nonInteractive = this.nonInteractive);
    }

    if (_changedProperties.has('avatarList')) {
      this.listElements.forEach(item => item.avatarList = this.avatarList);
    }

    if (_changedProperties.has('offsetContent')) {
      this.listElements.forEach(item => item.offsetContent = this.offsetContent);
    }
  }

  protected layout() {

    // List items need to have at least tabindex=-1 to be focusable.
    this.listElements.filter(item => !item.getAttribute('tabindex'))
      .forEach((el: Element) => {
        el.setAttribute('tabindex', '-1');
        el.setAttribute('role', 'option');
      });

    // List items with checkbox need to have role="checkbox"
    this.listElements.filter(item => item.querySelector(this.selectors.checkbox))
      .forEach((el: Element) => el.setAttribute('role', 'checkbox'));

    // List items with radio button need to have role="radio"
    this.listElements.filter(item => item.querySelector(this.selectors.radio))
      .forEach((el: Element) => el.setAttribute('role', 'radio'));

    // Child button/a elements are not tabbable until the list item is focused.
    this.listElements
      .map(
        item =>
          item.querySelectorAll(this.selectors.focusableChildElements)
      )
      .forEach(
        children =>
          children.forEach(child => child.setAttribute('tabindex', '-1'))
      );

    this.mdcFoundation.layout();
  }

  /**
   * Initialize selectedIndex value based on pre-selected checkbox list items, single selection or radio.
   */
  protected initializeListType() {
    const hasCheckboxListItems = this.listElements.filter(item => {
      return item.querySelector<HTMLInputElement>(this.selectors.checkboxRadio);
    }).length > 0;
    const singleSelectedListItem = this.listElements.find(item => item.activated || item.selected);
    const radioSelectedListItem = this.mdcRoot.querySelector(
      strings.ARIA_CHECKED_RADIO_SELECTOR
    ) as MWCListItem;

    if (hasCheckboxListItems) {
      const preselectedItems = this.mdcRoot.querySelectorAll(strings.ARIA_CHECKED_CHECKBOX_SELECTOR);
      this.mdcFoundation.setSelectedIndex(
        [...preselectedItems]
        .map(
          (listItem: Element) => this.listElements.indexOf(listItem as MWCListItem)
        )
      )
    } else if (singleSelectedListItem) {
      if (singleSelectedListItem.activated) {
        this.mdcFoundation.setUseActivatedClass(true);
      }

      this.singleSelection = true;
      this.mdcFoundation.setSelectedIndex(this.listElements.indexOf(singleSelectedListItem));
    } else if (radioSelectedListItem) {
      this.mdcFoundation.setSelectedIndex(this.listElements.indexOf(radioSelectedListItem));
    }
  }

  /**
   * Used to figure out which element was clicked
   * before sending the event to the foundation.
   */
  protected _onFocusIn(e: FocusEvent) {
    const index = this._getListItemIndex(e);
    this.mdcFoundation.handleFocusIn(e, index);
  }

  /**
   * Used to figure out which element was clicked before sending the event
   * to the foundation.
   */
  protected _onFocusOut(e: FocusEvent) {
    const index = this._getListItemIndex(e);
    this.mdcFoundation.handleFocusOut(e, index);
  }

  /**
   * Used to figure out which element was focused when keydown event occurred
   * before sending the event to the foundation.
   */
  protected _onKeyDown(e: KeyboardEvent) {
    const index = this._getListItemIndex(e);
    const target = this.listElements[index];
    const isEnter = e.key === 'Enter' || e.keyCode === 13;
    const isSpace = e.key === 'Space' || e.keyCode === 32;

    // Return earlier if target is disabled
    if (
      (isEnter || isSpace) &&
      target.disabled
    ) return;

    this.mdcFoundation.handleKeydown(e, target instanceof MWCListItem, index);
  }

  /**
   * Used to figure out which element was clicked before sending the event
   * to the foundation.
   */
  protected _onClick(e: MouseEvent) {
    const index = this._getListItemIndex(e);
    const target = this.listElements[index];

    if (!target) return;

    // Return earlier if target is disabled
    if (target.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    };

    // Toggle the checkbox only if it's not the target of the event,
    // or the checkbox will have 2 change events.
    const toggleCheckbox = !matches(target, this.selectors.checkboxRadio);
    this.mdcFoundation.handleClick(index, toggleCheckbox);
  }

  /**
   * Used to figure out which list item this event is targetting.
   * Or returns -1 if there is no list item
   */
  protected _getListItemIndex(e: Event) {
    const eventTarget = e.target as Element;
    const nearestParent = closest(eventTarget, `mwc-list-item`);

    // Get the index of the element if it is a list item.
    if (nearestParent && matches(nearestParent, `mwc-list-item`)) {
      return this.listElements.indexOf(nearestParent as MWCListItem);
    }

    return -1;
  }

}
