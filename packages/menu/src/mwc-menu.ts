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
  property,
  observer
} from '@authentic/mwc-base/base-element.js';
import { ListItem } from '@authentic/mwc-list';
import { MDCList } from '@material/list';
import { MDCMenuFoundation, Corner } from '@material/menu';
import { MDCMenuSurface } from '@material/menu-surface';
import { AnchorMargin } from '@material/menu-surface/foundation';
import { emit, addHasRemoveClass } from '@authentic/mwc-base/utils';

import { style } from './mwc-menu-css.js';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-menu': Menu;
  }
}

@customElement('mwc-menu' as any)
export class Menu extends BaseElement {

  @query('.mdc-menu')
  protected mdcRoot!: HTMLElement;

  @query('.mdc-list')
  protected list!: HTMLElement;

  @query('.mdc-menu__selection-group')
  protected _selectionGroup!: HTMLElement;

  @property({ type: Boolean })
  selectionGroup = false;

  @property({ type: Boolean })
  @observer(function (this: Menu, value: Boolean) {
    if (value !== this._menuSurface.open) {
      this._menuSurface.open = value;
    }
  })
  open = false;

  @property({ type: Boolean })
  multiselect = false;

  @property({ type: Boolean })
  autofocus = false;

  @property({ type: Boolean })
  autoclose = false;

  @property({ type: Boolean })
  noWrapFocus = false;

  protected _selectedIndex: number = -1;
  get selectedIndex() {
    return this._selectedIndex;
  }
  set selectedIndex(value: number) {
    this._selectedIndex = value;
    const selectedElement = this.items[this._selectedIndex];
    this._list.selectedIndex = this.enabledItems.indexOf(selectedElement);
  }

  get Corner() {
    return Corner;
  }

  get items(): ListItem[] {
    return this.shadowRoot!
      .querySelector('slot')!
      .assignedNodes({ flatten: true })
      .filter(el => el instanceof ListItem)
      .map(el => el as ListItem)
  }

  get enabledItems(): ListItem[] {
    return this.items.filter( el => el.getAttribute('aria-disabled') === 'false' );
  }

  get selectedItems(): ListItem[] {
    return this.items.filter( el => el.getAttribute('aria-selected') === 'true' );
  }

  protected _menuSurfaceInstance!: MDCMenuSurface;
  protected get _menuSurface(): MDCMenuSurface {
    if (!this._menuSurfaceInstance) {
      let previousFocus_;

      this._menuSurfaceInstance = new MDCMenuSurface(this.mdcRoot);

      this._menuSurfaceInstance.foundation_.adapter_.isFocused = () => {
        return document.activeElement === this.mdcRoot;
      };

      this._menuSurfaceInstance.foundation_.adapter_.saveFocus = () => {
        if (document.activeElement) {
          previousFocus_ = document.activeElement.shadowRoot
            ? document.activeElement.shadowRoot.activeElement
            : document.activeElement;
        }
      };

      this._menuSurfaceInstance.foundation_.adapter_.restoreFocus = () => {
        if (this.mdcRoot.contains(document.activeElement)) {
          if (previousFocus_ && previousFocus_.focus) {
            previousFocus_.focus();
          }
        }
      };

      this._menuSurfaceInstance.foundation_.adapter_.isElementInContainer = el => {
        return this === el || this.contains(el as Node) || !this.autoclose;
      };
    }

    return this._menuSurfaceInstance;
  }

  protected _listInstance!: MDCList;
  protected get _list(): MDCList {
    if (!this._listInstance) {
      this._listInstance = new MDCList(this.list);
      this._listInstance.wrapFocus = !this.noWrapFocus;
      this._listInstance.selectedIndex = this.selectedIndex;

      // Prevents default listeners conflicts
      this._listInstance.destroy();

      this._listInstance.getListItemIndex_ = evt => {
        return evt.target instanceof ListItem ? this.enabledItems.indexOf(evt.target) : -1;
      }

      this._listInstance.handleKeydown_ = evt => {
        const index = this._listInstance.getListItemIndex_(evt);
    
        if (index >= 0) {
          this._listInstance.foundation_.handleKeydown(evt, evt.target instanceof ListItem, index);
        }
      }

      this._listInstance.foundation_.focusNextElement = index => {
        const count = this._listInstance.foundation_.adapter_.getListItemCount();
        let nextIndex = index + 1;
        if (nextIndex >= count) {
          if (this._listInstance.foundation_.wrapFocus_) {
            nextIndex = 0;
          } else {
            emit(this, 'MDCList:afterLastFocusNext');
            // Return early because last item is already focused.
            return;
          }
        }
        this._listInstance.foundation_.adapter_.focusItemAtIndex(nextIndex);
      }

      this._listInstance.foundation_.focusPrevElement = index => {
        let prevIndex = index - 1;
        if (prevIndex < 0) {
          if (this._listInstance.foundation_.wrapFocus_) {
            prevIndex = this._listInstance.foundation_.adapter_.getListItemCount() - 1;
          } else {
            emit(this, 'MDCList:afterLastFocusPrev');
            // Return early because first item is already focused.
            return;
          }
        }
        this._listInstance.foundation_.adapter_.focusItemAtIndex(prevIndex);
      }

      this._listInstance.foundation_.adapter_ = {
        ...this._listInstance.foundation_.adapter_,
        getListItemCount: () => this.enabledItems.length,
        getFocusedElementIndex: () => {
          return this.enabledItems.indexOf(document.activeElement as ListItem)
        },
        setAttributeForElementIndex: (index, attr, value) => {
          const element = this.enabledItems[index];
          if (element) {
            element.setAttribute(attr, value);
          }
        },
        removeAttributeForElementIndex: (index, attr) => {
          const element = this.enabledItems[index];
          if (element) {
            element.removeAttribute(attr);
          }
        },
        addClassForElementIndex: (index, className) => {
          const element = this.enabledItems[index];
          if (element) {
            element.classList.add(className);
          }
        },
        removeClassForElementIndex: (index, className) => {
          const element = this.enabledItems[index];
          if (element) {
            element.classList.remove(className);
          }
        },
        focusItemAtIndex: (index) => {
          const element = this.enabledItems[index];
          if (element) {
            element.focus();
          }
        },
        setTabIndexForListItemChildren: (listItemIndex, tabIndexValue) => {
          const element = this.enabledItems[listItemIndex] as ListItem;
          element.setAttribute('tabindex', tabIndexValue);
        },
        followHref: (index) => {
          const listItem = this.enabledItems[index];
          if (listItem && listItem['href']) {
            listItem.click();
          }
        },
        toggleCheckbox: (/* index */) => {
          // let checkboxOrRadioExists = false;
          // const listItem = this.enabledItems[index];
          // const elementsToToggle =
          //   [].slice.call(listItem.querySelectorAll(strings.CHECKBOX_RADIO_SELECTOR));
          // elementsToToggle.forEach((element) => {
          //   const event = document.createEvent('Event');
          //   event.initEvent('change', true, true);

          //   if (!element.checked || element.type !== 'radio') {
          //     element.checked = !element.checked;
          //     element.dispatchEvent(event);
          //   }
          //   checkboxOrRadioExists = true;
          // });
          // return checkboxOrRadioExists;
          return false;
        },
      }
    }

    return this._listInstance;
  }

  protected readonly mdcFoundationClass = MDCMenuFoundation;

  protected mdcFoundation!: MDCMenuFoundation;

  protected _preventClose = false;

  static styles = style;

  protected createAdapter() {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      addClassToElementAtIndex: (index, className) => {
        const list = this.items;
        list[index].classList.add(className);
      },
      removeClassFromElementAtIndex: (index, className) => {
        const list = this.items;
        list[index].classList.remove(className);
      },
      addAttributeToElementAtIndex: (index, attr, value) => {
        const list = this.items;
        list[index].setAttribute(attr, value);
      },
      removeAttributeFromElementAtIndex: (index, attr) => {
        const list = this.items;
        list[index].removeAttribute(attr);
      },
      elementContainsClass: (element, className) => {
        return element && element.classList.contains(className);
      },
      closeSurface: () => {
        if (this._preventClose) {
          this._preventClose = false;
        } else {
          this.open = false;
        }
      },
      getElementIndex: element => this.items.indexOf(element),
      getParentElement: element => {
        if (!element) return null;

        switch (element.localName) {
          case 'mwc-list-item':
            return this._selectionGroup || this.list;
          default:
            return element.parentElement;
        }
      },
      getSelectedElementIndex: () => {
        const selectedElement = this.selectedItems[0];
        return this.items.indexOf(selectedElement);
      },
      notifySelected: (evtData) => {
        this._notifySelected(evtData);
      },
    }
  }

  protected _handleKeydown = this._onKeydown.bind(this) as EventListenerOrEventListenerObject;
  protected _handleClick = this._onClick.bind(this) as EventListenerOrEventListenerObject;

  firstUpdated() {
    super.firstUpdated();

    this._menuSurface.listen('MDCMenuSurface:opened', () => this._afterOpenedCallback());
    this._menuSurface.listen('MDCMenuSurface:closed', () => this._afterClosedCallback());
  }

  render() {
    return html`
      <div class="mdc-menu mdc-menu-surface" tabindex="-1">
        <div class="mdc-menu__items mdc-list" role="menu" aria-hidden="true">
          <div class="${this.selectionGroup ? 'mdc-menu__selection-group' : ''}">
            <slot></slot>
          </div>
        </div>
      </div>`;
  }

  _onKeydown(evt) {
    this.mdcFoundation.handleKeydown(evt);
    this._list.handleKeydown_(evt);
  }

  _onClick(evt) {
    this._preventClose = !this.autoclose;
    this.mdcFoundation.handleClick(evt);
  }

  _notifySelected(data) {
    const selectedElement = this.items[data.index];
    this._list.selectedIndex = this.enabledItems.indexOf(selectedElement);
    this.selectedIndex = data.index;
    emit(this, 'MDCMenu:selected', { index: data.index, item: this.items[data.index] });
  }

  /**
   * Default anchor corner alignment of top-left
   */
  setAnchorCorner(corner: Corner) {
    this._menuSurface.setAnchorCorner(corner);
  }

  setAnchorMargin(margin: AnchorMargin) {
    this._menuSurface.setAnchorMargin(margin);
  }

  /**
   * Return the item within the menu at the index specified.
   */
  getOptionByIndex(index: number): HTMLElement | null {
    const items = this.items;

    if (index < items.length) {
      return this.items[index];
    } else {
      return null;
    }
  }

  set quickOpen(quickOpen: boolean) {
    this._menuSurface.quickOpen = quickOpen;
  }

  setFixedPosition(isFixed: boolean) {
    this._menuSurface.setFixedPosition(isFixed);
  }

  /**
   * Return the menu width
   */
  getWidth(): number {
    this.mdcRoot.style.display = 'block';
    const width = this.mdcRoot.offsetWidth;
    this.mdcRoot.style.display = null;

    return width;
  }

  hoistMenuToBody() {
    this._menuSurface.hoistMenuToBody();
  }

  setIsHoisted(isHoisted: boolean) {
    this._menuSurface.setIsHoisted(isHoisted);
  }

  setAbsolutePosition(x: number, y: number) {
    this._menuSurface.setAbsolutePosition(x, y);
  }

  setAnchorElement(element: HTMLElement) {
    this._menuSurface.setMenuSurfaceAnchorElement(element);
  }

  _afterOpenedCallback() {
    if (this.autofocus) {
      this.setFocus();
    }

    emit(this, 'MDCMenu:opened');

    this.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('click', this._handleClick);
  }

  _afterClosedCallback() {
    this.open = false;
    emit(this, 'MDCMenu:closed');

    this.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleClick);
  }

  setFocus() {
    if (this.enabledItems.length > 0) {
      this.items[this.selectedIndex !== -1 ? this.selectedIndex : 0].focus();
    }
  }
}
