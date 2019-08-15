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
  property,
  emit,
  findAssignedElement,
  observer,
  // observer
} from '@material/mwc-base/base-element';
import { ripple } from '@material/mwc-ripple/ripple-directive';

import { style } from './mwc-list-item-css';

import '@material/mwc-icon/mwc-icon';

interface List extends HTMLElement {
  content: Boolean;
  offsetContent: Boolean;
  listElements: ListItem[];
}

declare global {
  interface HTMLElementTagNameMap {
    'mwc-list-item': ListItem;
  }
}

@customElement('mwc-list-item' as any)
export class ListItem extends LitElement {

  @query('.mdc-list-item')
  protected mdcRoot!: HTMLElement;

  @query('slot[name="graphic"]')
  protected graphicSlot!: HTMLSlotElement;

  @query('slot[name="meta"]')
  protected metaSlot!: HTMLSlotElement;

  @query('slot[name="content"]')
  protected contentSlot!: HTMLSlotElement;

  @query('.mdc-list-item-wrapper')
  protected listItemWrapper!: HTMLElement;

  @query('.mdc-list-item-content')
  protected listItemContent!: HTMLElement;

  @query('.mdc-list-item-content__inner')
  protected listItemContentInner!: HTMLElement;

  @property({ type: String, reflect: true })
  public type = 'single-line';

  @property({ type: String })
  public nonInteractive = false;

  @property({ type: Boolean })
  public selected = false;

  @property({ type: Boolean })
  public activated = false;

  @property({ type: Boolean })
  public offsetContent = false;

  @property({ type: String })
  public value = '';

  @property({ type: Boolean, reflect: true })
  @observer(function(this: ListItem, value: boolean) {
    if (this.expandable) {
      if (value) {
        if (this.expanded) {
          this.collapse();
        }

        this._removeExpandableListeners();
      } else {
        this._addExpandableListeners();
      }
    }
  })
  public disabled = false;

  @property({ type: Boolean })
  public avatarList = false;

  @property({ type: Boolean, reflect: true })
  public expandable = false;

  @property({ type: Boolean })
  @observer(function(this: ListItem, value: boolean) {
    this.expanded = value;
    this.collapsed = !value;
  })
  public startExpanded = false;

  protected get graphicElement(): HTMLElement {
    return this.graphicSlot && findAssignedElement(this.graphicSlot, '*') as HTMLElement;
  }

  protected get metaElement(): HTMLElement {
    return this.metaSlot && findAssignedElement(this.metaSlot, '*') as HTMLElement;
  }

  protected get contentElement(): List {
    return this.contentSlot && findAssignedElement(this.contentSlot, '*') as List;
  }

  protected set expanded(value: boolean) {
    this._expanded = value;

    if (value) {
      this.setAttribute('expanded', 'true');
    } else {
      this.setAttribute('expanded', 'false');
    }
  }

  protected get expanded(): boolean {
    return this._expanded;
  }

  protected set expanding(value: boolean) {
    this._expanding = value;

    if (value) {
      this.setAttribute('expanding', 'true');
    } else {
      this.setAttribute('expanding', 'false');
    }
  }

  protected get expanding(): boolean {
    return this._expanding;
  }

  protected set collapsed(value: boolean) {
    this._collapsed = value;
    
    if (value) {
      this.setAttribute('collapsed', 'true');
    } else {
      this.setAttribute('collapsed', 'false');
    }
  }

  protected get collapsed(): boolean {
    return this._collapsed;
  }

  protected set collapsing(value: boolean) {
    this._collapsing = value;

    if (value) {
      this.setAttribute('collapsing', 'true');
    } else {
      this.setAttribute('collapsing', 'false');
    }
  }

  protected get collapsing(): boolean {
    return this._collapsing;
  }

  protected _expanded!: boolean;

  protected _expanding!: boolean;

  protected _collapsing!: boolean;

  protected _collapsed = !this._expanded;
  
  protected _expandable = false;
  
  protected _withGraphic = false;
  
  protected _withMeta = false;

  protected _handleFocus = this._onFocus.bind(this);

  protected _handleBlur = this._onBlur.bind(this);

  protected _handleClick = this._onClick.bind(this);

  protected _handleKeyDown = this._onKeyDown.bind(this);

  protected _handleExpandTransitionEnd = this._onExpandTransitionEnd.bind(this);

  protected _handleCollapseTransitionEnd = this._onCollapseTransitionEnd.bind(this);

  static styles = style;

  protected _renderArrowIcon() {
    return html`
      <mwc-icon>keyboard_arrow_down</mwc-icon>
    `;
  }

  protected _renderExpandableListItem() {
    const classes = {
      'mdc-list-item-wrapper': true,
      'mdc-list-item-wrapper--collapsed': this.collapsed,
      'mdc-list-item-wrapper--expanded': this.expanded,
      'mdc-list-item-wrapper--collapsing': this.collapsing,
      'mdc-list-item-wrapper--expanding': this.expanding,
    }

    return html`
      <div class="${classMap(classes)}">
        ${this._renderListItem()}

        <div class="mdc-list-item-content">
          <div class="mdc-list-item-content__inner">
            <slot name="content"></slot>
          </div>
        </div>
      </div>
    `;
  }

  protected _renderListItem() {
    const classes = {
      'mdc-list-item': true,
      'mdc-list-item--two-line': this.type === 'two-line',
      'mdc-list-item--non-interactive': this.nonInteractive && !this.expandable,
      'mdc-list-item--selected': this.selected,
      'mdc-list-item--activated': this.activated,
      'mdc-list-item--disabled': this.disabled,
      'mdc-list-item--avatar-list': this.avatarList,
      'mdc-list-item--with-graphic': this._withGraphic,
      'mdc-list-item--with-meta': this._withMeta,
      'mdc-list-item--offset-content': this.offsetContent
    }

    return html`
      <div class="${classMap(classes)}" .ripple="${ripple({ unbounded: false })}">
        <div class="mdc-list-item__graphic">
          <slot name="graphic"></slot>
        </div>
        <div class="mdc-list-item__text">
          <slot></slot>
          <div class="mdc-list-item__primary-text">
            <slot name="primary"></slot>
          </div>
          <div class="mdc-list-item__secondary-text">
            <slot name="secondary"></slot>
          </div>
        </div>
        <div class="mdc-list-item__meta">
          <slot name="meta"></slot>
          ${this.expandable ? this._renderArrowIcon() : ''}
        </div>
      </div>
    `;
  }

  protected render() {
    return this.expandable
      ? this._renderExpandableListItem()
      : this._renderListItem();
  }

  public firstUpdated() {
    this.addEventListener('focus', this._handleFocus);
    this.addEventListener('blur', this._handleBlur);

    this.updateComplete
      .then(() => {
        this._withGraphic = !!this.graphicElement;
        this._withMeta = !!this.metaElement || !!this.expandable;

        if (this.expandable) {
          if (this.contentElement) {
            this.contentElement.content = true;
            this.contentElement.offsetContent = this._withGraphic;
          }

          this._disableTabIndex();
        }
        
        this.requestUpdate();
      })
  }

  protected _onFocus(e: FocusEvent) {
    emit(this.mdcRoot, e.type, undefined, false);
  }

  protected _onBlur(e: FocusEvent) {
    emit(this.mdcRoot, e.type, undefined, false);
  }

  protected _onClick() {
    this.toggle();
  }

  protected _onKeyDown(e: KeyboardEvent) {
    const isEnter = e.code === 'Enter' || e.keyCode === 13;
    const isSpace = e.code === 'Space' || e.keyCode === 32;

    if (isEnter || isSpace) {
      if (this.contentElement) {
        this.toggle();

        if (this.expanding) {
          this.contentElement.focus();
        }
      }
    }
  }

  protected _onExpandTransitionEnd() {
    this.style.transitionProperty = '';
    this.expanding = false;
    this.expanded = true;
    this.requestUpdate();
  }

  protected _onCollapseTransitionEnd() {
    this.style.transitionProperty = '';
    this.collapsing = false;
    this.collapsed = true;
    this.requestUpdate();
  }

  protected _addExpandableListeners() {
    this.addEventListener('keydown', this._handleKeyDown);
    this.mdcRoot.addEventListener('click', this._handleClick);
  }

  protected _removeExpandableListeners() {
    this.removeEventListener('keydown', this._handleKeyDown);
    this.mdcRoot.removeEventListener('click', this._handleClick);
  }

  protected _enableTabIndex() {
    if (this.contentElement) {
      this.contentElement.listElements[0].tabIndex = 0;
    }
  }

  protected _disableTabIndex() {
    if (this.contentElement) {
      this.contentElement.listElements.forEach(item => item.tabIndex = -1);
    }
  }

  public expand() {
    if (this.collapsing) return;

    const contentHeight = this.listItemContentInner.getBoundingClientRect().height;

    this.expanding = true;
    this.collapsed = false;

    const siblings = [...this.parentElement!.children];
    const currentIndex = siblings.indexOf(this);
    if (currentIndex > 0) {
      const previousSibling: HTMLElement = siblings[currentIndex - 1] as HTMLElement;
      if (previousSibling.getAttribute('expanded') === 'true') {
        this.style.borderTop = 'none';
        this.style.marginTop = '0';
        this.style.paddingTop = '0';
      }
    }

    if (currentIndex < siblings.length - 1) {
      const nextSibling: HTMLElement = siblings[currentIndex + 1] as HTMLElement;
      if (nextSibling.getAttribute('expanded') === 'true' || nextSibling.getAttribute('expanding') === 'true') {
        this.style.transitionProperty = 'padding-top, margin-top, border-top-width';
        nextSibling.style.borderTop = '0';
        nextSibling.style.marginTop = '0';
        nextSibling.style.paddingTop = '0';
      }
    }

    this.listItemContent.style.height = `${contentHeight}px`;
    this.listItemContent.addEventListener("transitionend", this._handleExpandTransitionEnd, { once: true });

    this._enableTabIndex();
    this.requestUpdate();
  }

  public collapse() {
    if (this.expanding) return;

    this.collapsing = true;
    this.expanded = false;

    this.style.transitionProperty = '';
    this.style.borderTop = '';
    this.style.marginTop = '';
    this.style.paddingTop = '';

    const siblings = [...this.parentElement!.children];
    const currentIndex = siblings.indexOf(this);
    if (currentIndex < siblings.length - 1) {
      const nextSibling: HTMLElement = siblings[currentIndex + 1] as HTMLElement;
      if (nextSibling.getAttribute('expanded') === 'true' || nextSibling.getAttribute('expanded') === 'true') {
        this.style.transitionProperty = 'padding-top, margin-top, border-top-width';
        nextSibling.style.borderTop = '';
        nextSibling.style.marginTop = '';
        nextSibling.style.paddingTop = '';
      }
    }

    this.listItemContent.style.height = '';
    this.listItemContent.addEventListener("transitionend", this._handleCollapseTransitionEnd, { once: true });

    this._disableTabIndex();
    this.requestUpdate();
  }

  public toggle() {
    if (this.collapsed || this.collapsing) {
      this.expand();
    } else {
      this.collapse();
    }
  }
}
