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
  customElement,
  query,
  HTMLElementWithRipple,
  addHasRemoveClass,
  property,
  observer,
  RippleSurface,
  html,
  classMap,
  findAssignedElement,
  emit
} from '@authentic/mwc-base/form-element';
import { MDCSelectAdapter } from '@material/select/adapter';
import { MDCSelectFoundation } from '@material/select/foundation';
import { MDCSelectFoundationMap } from '@material/select/types';
import { strings, cssClasses } from '@material/select/constants';
import { MDCSelectIcon, MDCSelectIconFactory } from '@material/select/icon';
import { MDCSelectHelperText, MDCSelectHelperTextFactory } from '@material/select/helper-text';
import { MDCNotchedOutline, MDCNotchedOutlineFactory } from '@material/notched-outline';
import { MDCFloatingLabel, MDCFloatingLabelFactory } from '@material/floating-label';
import { MDCLineRipple, MDCLineRippleFactory } from '@material/line-ripple';
import * as menuSurfaceConstants from '@material/menu-surface/constants';
import { ripple } from '@authentic/mwc-ripple/ripple-directive';
import { Menu as MWCMenu, EVENTS as MENU_EVENTS } from '@authentic/mwc-menu/mwc-menu';
import { ListItem as MWCListItem } from '@authentic/mwc-list/mwc-list-item';
import { MDCListIndex } from '@material/list/types';

import { style } from './mwc-select-css';

const lineRippleFactory: MDCLineRippleFactory = el => new MDCLineRipple(el);
const helperTextFactory: MDCSelectHelperTextFactory = el => new MDCSelectHelperText(el);
const iconFactory: MDCSelectIconFactory = el => new MDCSelectIcon(el);
const labelFactory: MDCFloatingLabelFactory = el => new MDCFloatingLabel(el);
const outlineFactory: MDCNotchedOutlineFactory = el => new MDCNotchedOutline(el);

type PointerEventType = 'mousedown' | 'touchstart';

const POINTER_EVENTS: PointerEventType[] = [ 'mousedown', 'touchstart' ];
const VALIDATION_ATTR_WHITELIST = [ 'required', 'aria-required' ];

declare global {
  interface HTMLElementTagNameMap {
    'mwc-select': Select;
  }
}

@customElement('mwc-select' as any)
export class Select extends FormElement {
  @query('.mdc-select')
  protected mdcRoot!: HTMLElementWithRipple;
  
  @query('.mdc-floating-label')
  protected mdcLabel!: HTMLElement;

  @query(strings.HIDDEN_INPUT_SELECTOR)
  protected _hiddenInput!: HTMLInputElement;

  @query('.mdc-select__selected-text')
  protected _selectedText!: HTMLElement;

  @query('.mdc-select__selected-text-inner')
  protected _selectedTextInner!: HTMLElement;

  @query('.mdc-select__placeholder')
  protected _placeholderEl!: HTMLElement;

  @query('slot')
  protected slotEl!: HTMLSlotElement;

  @query(strings.LABEL_SELECTOR)
  protected labelElement!: HTMLLabelElement;

  @query(strings.LINE_RIPPLE_SELECTOR)
  protected lineRippleElement!: HTMLElement;

  @query(strings.OUTLINE_SELECTOR)
  protected outlineElement!: HTMLElement;

  @query(strings.LEADING_ICON_SELECTOR)
  protected leadingIconElement!: HTMLElement;

  @query('.mdc-select-helper-text')
  protected helperTextElement!: HTMLElement;

  @property({ type: String })
  public label = '';

  @property({ type: Boolean })
  public outlined = false;

  @property({ type: Boolean, reflect: true })
  @observer(function(this: Select, value: boolean) {
    if (this.slottedMenu) this.slottedMenu.singleSelection = !value;
  })
  public multiple = false;

  @property({ type: Boolean, reflect: true })
  @observer(function(this: Select, value: boolean) {
    this.mdcFoundation && this.mdcFoundation.setDisabled(value);
  })
  public disabled = false;

  @property({ type: String })
  @observer(function(this: Select, value: string) {
    this.mdcFoundation && this.mdcFoundation.setHelperTextContent(value);
  })
  public helperTextContent = '';

  @property({ type: String })
  public validationMessage = '';

  @property({ type: Boolean })
  @observer(function(this: Select, value: boolean) {
    this._helperText && this._helperText.foundation.setPersistent(value);
  })
  public persistentHelperText = false;

  @property({ type: String })
  @observer(function(this: Select, value: string) {
    this.mdcFoundation && this.mdcFoundation.setLeadingIconAriaLabel(value);
  })
  public leadingIconAriaLabel = '';

  @property({ type: String })
  @observer(function(this: Select, value: string) {
    this.mdcFoundation && this.mdcFoundation.setLeadingIconContent(value);
  })
  public leadingIconContent = '';

  @property({ type: Boolean })
  @observer(function(this: Select, value: boolean) {
    if (this._nativeControl) {
      this._nativeControl.required = value;
    } else if (this._selectedText) {
      if (value) {
        this._selectedText!.setAttribute('aria-required', value.toString());
      } else {
        this._selectedText!.removeAttribute('aria-required');
      }
    }
  })
  public required = false;

  @property({ type: Boolean })
  public floatLabel = false;

  @property({ type: String })
  public placeholder = '';

  public get valid(): boolean {
    return this.mdcFoundation && this.mdcFoundation.isValid();
  }

  public set valid(valid: boolean) {
    this.mdcFoundation && this.mdcFoundation.setValid(valid);
  }

  public get ripple(): RippleSurface | undefined {
    return this.mdcRoot.ripple;
  }

  public get value() {
    return this.mdcFoundation.getValue();
  }

  public set value(value) {
    if (this.value !== value) {
      this.mdcFoundation.setValue(value);
    }
  }

  public get selectedIndex() {
    return this._getSelectedIndex();
  }

  public set selectedIndex(value: MDCListIndex) {
    if (JSON.stringify(this.selectedIndex) !== JSON.stringify(value)) {
      this._setSelectedIndex(value);
    }
  }

  /**
   * Enables or disables the use of native validation. Use this for custom validation.
   */
  protected _useNativeValidation = true;
  public set useNativeValidation(value: boolean) {
    this._useNativeValidation = value;
  }

  public get slottedSelect(): HTMLSelectElement | null {
    return this.slotEl && findAssignedElement(this.slotEl, 'select') as HTMLSelectElement;
  }

  public get slottedMenu(): MWCMenu | null {
    return this.slotEl && findAssignedElement(this.slotEl, 'mwc-menu') as MWCMenu;
  }

  protected get formElement(): HTMLElement {
    return (this._nativeControl || this._selectedText) as HTMLElement;
  }

  protected _formElementId = `_${Math.random().toString(36).substr(2, 9)}`;

  protected _selectedItem!: MWCListItem;
  
  protected _isMenuOpen: boolean = false;

  protected _nativeControl!: HTMLSelectElement | null;

  protected _leadingIcon!: MDCSelectIcon;

  protected _helperText!: MDCSelectHelperText | null;

  protected _lineRipple!: MDCLineRipple | null;

  protected _label!: MDCFloatingLabel | null;

  protected _outline!: MDCNotchedOutline | null;

  protected _validationObserver!: MutationObserver;

  protected _handleChange = this._onChange.bind(this) as EventListenerOrEventListenerObject;

  protected _handleFocus = this._onFocus.bind(this) as EventListenerOrEventListenerObject;

  protected _handleBlur = this._onBlur.bind(this) as EventListenerOrEventListenerObject;

  protected _handleClick = this._onClick.bind(this) as EventListenerOrEventListenerObject;

  protected _handleKeydown = this._onKeydown.bind(this) as EventListenerOrEventListenerObject;

  protected _handleMenuOpened = this._onMenuOpened.bind(this) as EventListenerOrEventListenerObject;

  protected _handleMenuClosed = this._onMenuClosed.bind(this) as EventListenerOrEventListenerObject;

  protected _handleMenuSelected = this._onMenuSelected.bind(this) as EventListenerOrEventListenerObject;

  protected _handleMenuChange = this._onMenuChange.bind(this) as EventListenerOrEventListenerObject;

  protected mdcFoundation!: MDCSelectFoundation;

  protected readonly mdcFoundationClass = MDCSelectFoundation;

  createAdapter(): MDCSelectAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      ...(this._nativeControl ? this._getNativeSelectAdapterMethods() : this._getEnhancedSelectAdapterMethods()),
      ...this._getCommonAdapterMethods(),
      ...this._getOutlineAdapterMethods(),
      ...this._getLabelAdapterMethods()
    }
  }

  protected _getNativeSelectAdapterMethods() {
    return {
      getValue: () => this._nativeControl!.value,
      setValue: (value: string) => {
        this._nativeControl!.value = value;
        this._setNativeSelectedIndex(this.slottedSelect!.selectedIndex);
      },
      openMenu: () => undefined,
      closeMenu: () => undefined,
      isMenuOpen: () => false,
      setSelectedIndex: (index: number) => this._setNativeSelectedIndex(index),
      setDisabled: (isDisabled: boolean) => {
        this._nativeControl!.disabled = isDisabled;
      },
      setValid: (isValid: boolean) => {
        if (!this._useNativeValidation) return;

        if (isValid) {
          this.mdcRoot.classList.remove(cssClasses.INVALID);
        } else {
          this.mdcRoot.classList.add(cssClasses.INVALID);
        }

        this._setValidity(isValid);
      },
      checkValidity: () => {
        const classList = this.mdcRoot.classList;
        if (!classList.contains(cssClasses.DISABLED)) {
          return this.selectedIndex !== -1 && (this.selectedIndex !== 0 || Boolean(this.value));
        } else {
          return true;
        }
      },
    };
  }

  protected _getEnhancedSelectAdapterMethods() {
    return {
      getValue: () => {
        if (!this.slottedMenu!.items) return '';

        if (!this.multiple) {
          const selectedItem = this.slottedMenu!.items[this.selectedIndex as number];
          return selectedItem ? selectedItem.value : '';
        }
        
        return Array.isArray(this.selectedIndex)
          ? this.selectedIndex.map(
            index => this.slottedMenu!.items[index].value
          ).join(', ')
          : '';
      },
      setValue: (value: string) => {
        if (!this.slottedMenu!.items) return;

        if (!this.multiple) {
          const element = this.slottedMenu!.items.find(item => item['value'] === value);
          // const element = this.slottedMenu!.querySelector(`[${strings.ENHANCED_VALUE_ATTR}="${value}"]`);
          this._setEnhancedSelectedIndex(element ? this.slottedMenu!.items.indexOf(element) : -1);
        } else {
          const values = value.trim().split(',');

          const selectedIndex = this.slottedMenu!.items
            .filter(item => values.includes(item.value))
            .map(item => this.slottedMenu!.items.indexOf(item));

          this._setEnhancedSelectedIndex(selectedIndex);
        }
      },
      openMenu: () => {
        if (this.slottedMenu && !this.slottedMenu.open) {
          this.slottedMenu.setDefaultFocusState(2);
          this.slottedMenu.open = true;
          this._isMenuOpen = true;
          this._selectedText!.setAttribute('aria-expanded', 'true');
        }
      },
      closeMenu: () => {
        if (this.slottedMenu && this.slottedMenu.open) {
          this.slottedMenu.open = false;
        }
      },
      isMenuOpen: () => Boolean(this.slottedMenu) && this._isMenuOpen,
      setSelectedIndex: (index: number) => {
        this._setEnhancedSelectedIndex(index)
      },
      setDisabled: (isDisabled: boolean) => {
        this._selectedText!.setAttribute('tabindex', isDisabled ? '-1' : '0');
        this._selectedText!.setAttribute('aria-disabled', isDisabled.toString());
        if (this._hiddenInput) {
          this._hiddenInput.disabled = isDisabled;
        }
      },
      checkValidity: () => {
        const classList = this.mdcRoot.classList;
        if (!classList.contains(cssClasses.DISABLED)) {
          // See notes for required attribute under https://www.w3.org/TR/html52/sec-forms.html#the-select-element
          // TL;DR: Invalid if no index is selected, or if the first index is selected and has an empty value.
          return this.selectedIndex !== -1 && (this.selectedIndex !== 0 || Boolean(this.value));
        } else {
          return true;
        }
      },
      setValid: (isValid: boolean) => {
        this._selectedText!.setAttribute('aria-invalid', (!isValid).toString());

        if (isValid) {
          this.mdcRoot.classList.remove(cssClasses.INVALID);
        } else {
          this.mdcRoot.classList.add(cssClasses.INVALID);
        }

        this._setValidity(isValid);
      },
    };
  }

  protected _getCommonAdapterMethods() {
    return {
      addClass: className => this.mdcRoot.classList.add(className),
      removeClass: className => this.mdcRoot.classList.remove(className),
      hasClass: className => this.mdcRoot.classList.contains(className),
      setRippleCenter: normalizedX => this._lineRipple && this._lineRipple.setRippleCenter(normalizedX),
      activateBottomLine: () => this._lineRipple && this._lineRipple.activate(),
      deactivateBottomLine: () => this._lineRipple && this._lineRipple.deactivate(),
      notifyChange: value => {
        if (value) {
          const index = this.selectedIndex;
          emit(this, 'change', { value, index }, true);
        }
      },
    };
  }

  protected _getOutlineAdapterMethods() {
    return {
      hasOutline: () => Boolean(this._outline),
      notchOutline: labelWidth => this._outline && this._outline.notch(labelWidth),
      closeOutline: () => this._outline && this._outline.closeNotch(),
    };
  }

  protected _getLabelAdapterMethods() {
    return {
      floatLabel: shouldFloat => this._label && this._label.float(shouldFloat),
      getLabelWidth: () => this._label ? this._label.getWidth() : 0,
    };
  }

  static styles = style;

  protected _renderFloatingLabel() {
    return html`
      <label class="mdc-floating-label" for="${this._formElementId}">${this.label}</label>
    `;
  }

  protected _renderNotchedOutline(showAdjacentLabel: boolean | string) {
    return html`
      <div class="mdc-notched-outline">
        <div class="mdc-notched-outline__leading"></div>
        <div class="mdc-notched-outline__notch">
        ${!showAdjacentLabel ? this._renderFloatingLabel() : ''}
        </div>
        <div class="mdc-notched-outline__trailing"></div>
      </div>
    `;
  }

  protected _renderLineRipple() {
    return html`
      <div class="mdc-line-ripple"></div> 
    `;
  }

  protected _renderHelperText() {
    return this.helperTextContent || this.validationMessage
      ? html`
        <div class="mdc-select-helper-text"></div>
      `
      : '';
  }

  protected _renderLeadingIcon() {
    return html`
      <i class="material-icons mdc-select__icon">${this.leadingIconContent}</i>
    `;
  }

  protected _renderDropdownIcon() {
    return html`
      <i class="mdc-select__dropdown-icon"></i>
    `;
  }

  protected _renderPlaceholder() {
    return html`
      <span class="mdc-select__placeholder">${this.placeholder}</span>
    `;
  }

  protected _renderSelectedText() {
    return html`
      <div class="mdc-select__selected-text">
        <span class="mdc-select__selected-text-inner">${!this.placeholder ? html`&nbsp;` : ''}</span>
        ${this.placeholder ? this._renderPlaceholder() : ''}
      </div>
    `;
  }

  protected _renderAdjacentLabel() {
    const classes = {
      'mdc-floating-label--adjacent': true,
    };

    return html`
      <div class="${classMap(classes)}" for="${this._formElementId}">${this.label}</div>
    `;
  }

  render() {
    const hasOutline = this.outlined;
    const hasLabel = this.label;
    const hasLabelAndIsNotOutlined = hasLabel && !hasOutline;
    const hasLeadingIcon = this.leadingIconContent;
    const showAdjacentLabel = hasLabel && !this.floatLabel;
    const classes = {
      'mdc-select': true,
      'mdc-select--outlined': hasOutline,
      'mdc-select--with-adjacent-label': showAdjacentLabel,
    }

    return html`
      <div class="${classMap(classes)}" .ripple="${!hasOutline && ripple({ unbounded: false })}">
        <input type="hidden" name="enhanced-select">
        ${hasLeadingIcon ? this._renderLeadingIcon() : ''}
        ${this._renderDropdownIcon()}
        ${this._renderSelectedText()}
        <slot></slot>
        ${!showAdjacentLabel && hasLabelAndIsNotOutlined ? this._renderFloatingLabel() : ''}
        ${hasOutline ? this._renderNotchedOutline(showAdjacentLabel) : this._renderLineRipple()}
      </div>
      ${this._renderHelperText()}
      ${showAdjacentLabel ? this._renderAdjacentLabel() : ''}
    `;
  }

  firstUpdated() {
    if (this.slottedSelect) {
      this._nativeControl = this.slottedSelect;
    }

    this.formElement.id = this._formElementId;

    this._label = this.labelElement ? labelFactory(this.labelElement) : null;
    this._lineRipple = this.lineRippleElement ? lineRippleFactory(this.lineRippleElement) : null;
    this._outline = this.outlineElement ? outlineFactory(this.outlineElement) : null;
    this._helperText = this.helperTextElement ? helperTextFactory(this.helperTextElement) : null;

    if (this.leadingIconElement) {
      this.mdcRoot.classList.add(cssClasses.WITH_LEADING_ICON);
      this._leadingIcon = iconFactory(this.leadingIconElement);
    }

    // The required state needs to be sync'd before the mutation observer is added.
    this._initialSyncRequiredState();
    this._addMutationObserverForRequired();

    super.firstUpdated();

    this.formElement.addEventListener('focus', this._handleFocus);
    this.formElement.addEventListener('blur', this._handleBlur);

    POINTER_EVENTS.forEach((evtType) => {
      this.formElement.addEventListener(evtType, this._handleClick);
    });

    if (this.slottedMenu) {
      this._selectedText!.addEventListener('keydown', this._handleKeydown);
      this.slottedMenu.addEventListener(menuSurfaceConstants.strings.CLOSED_EVENT, this._handleMenuClosed);
      this.slottedMenu.addEventListener(menuSurfaceConstants.strings.OPENED_EVENT, this._handleMenuOpened);

      if (!this.multiple) {
        this.slottedMenu.addEventListener(MENU_EVENTS.selected, this._handleMenuSelected);
      } else {
        this.slottedMenu.addEventListener('change', this._handleMenuChange);
      }

      this.slottedMenu.updateComplete
        .then(
          () => {
            this._enhancedSelectSetup();
          }
        );

      if (this.leadingIconElement) {
        this.slottedMenu.classList.add(cssClasses.WITH_LEADING_ICON);
      }

      if (this._hiddenInput && this._hiddenInput.value) {
        // If the hidden input already has a value, use it to restore the select's value.
        // This can happen e.g. if the user goes back or (in some browsers) refreshes the page.
        const enhancedAdapterMethods = this._getEnhancedSelectAdapterMethods();
        enhancedAdapterMethods.setValue(this._hiddenInput.value);
      } else if (this.slottedMenu.querySelector(strings.SELECTED_ITEM_SELECTOR)) {
        // If an element is selected, the select should set the initial selected text.
        const enhancedAdapterMethods = this._getEnhancedSelectAdapterMethods();
        enhancedAdapterMethods.setValue(enhancedAdapterMethods.getValue());
      }
    }

    if (this.slottedSelect) {
      this.slottedSelect.addEventListener('change', this._handleChange);

      this._nativeSelectSetup();
    }

    if (
      this.mdcRoot.classList.contains(cssClasses.DISABLED) ||
      (this._nativeControl && this._nativeControl.disabled)
    ) {
      this.disabled = true;
    }

    setTimeout(() => this.layout());
  }

  createFoundation() {
    if (this.mdcFoundation !== undefined) {
      this.mdcFoundation.destroy();
    }

    this.mdcFoundation = new this.mdcFoundationClass(this.createAdapter(), this._getFoundationMap());
    this.mdcFoundation.init();
  }

  /**
   * Handle change event
   */
  protected _onChange(e) {
    e.stopImmediatePropagation();

    setTimeout(() => {
      this._setNativeSelectedIndex(this.selectedIndex as number);
      window && window.focus(); // Fixes IE11 selection

      this.mdcFoundation.handleChange(true);
    });
  }
  
  /**
   * Handle focus event
   */
  protected _onFocus(evt) {
    this.mdcFoundation.handleFocus();
    emit(this.mdcRoot, evt.type, {}, true);
  }

  /**
   * Handle blur event
   */
  protected _onBlur(evt) {
    this.mdcFoundation.handleBlur();
    emit(this.mdcRoot, evt.type, {}, true);
  }

  /**
   * Handle click event
   */
  protected _onClick(evt) {
    if (this._selectedText) {
      this._selectedText.focus();
    }

    this.mdcFoundation.handleClick(this._getNormalizedXCoordinate(evt));
  }

  /**
   * Handle keydown event
   */
  protected _onKeydown(evt) {
    this.mdcFoundation.handleKeydown(evt)
  }

  /**
   * Handle menu opened event
   */
  protected _onMenuOpened() {
    this.menuLayout();

    if (this.slottedMenu!.items.length === 0 || Array.isArray(this.selectedIndex)) {
      return;
    }

    this.menuLayout();

    // Menu should open to the last selected element, should open to first menu item otherwise.
    const focusItemIndex = this.selectedIndex >= 0 ? this.selectedIndex : 0;
    const focusItemEl = this.slottedMenu!.items[focusItemIndex as number] as HTMLElement;
    focusItemEl.focus();
  }

  /**
   * Handle menu closed event
   */
  protected _onMenuClosed() {
    const activeElement = (this as any).getRootNode().activeElement;

    // _isMenuOpen is used to track the state of the menu opening or closing since the menu.open function
    // will return false if the menu is still closing and this method listens to the closed event which
    // occurs after the menu is already closed.
    this._isMenuOpen = false;
    this._selectedText!.removeAttribute('aria-expanded');

    if (activeElement !== this) {
      this.mdcFoundation.handleBlur();
    }
  }

  /**
   * Handle menu selected event
   */
  protected _onMenuSelected() {
    const selectedItem = this.slottedMenu!.items[this.selectedIndex as number];
    this._setTextContent(selectedItem.textContent!.trim());

    this.mdcFoundation.handleChange(true);
  }

  /**
   * Handle menu change event
   */
  protected _onMenuChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.preventDefault();

    setTimeout(() => {
      const nextTextContent = (this.selectedIndex as number[])
        .sort()
        .map(i => this.slottedMenu!.items[i].textContent!.trim())
        .join(', ');

      if (nextTextContent !== this._selectedTextInner!.textContent) {
        this._setTextContent(nextTextContent);
        this.mdcFoundation.handleChange(true);
      }
    })
  }

  protected _setTextContent(value: string) {
    this._selectedTextInner!.textContent = value;

    if (this._placeholderEl) {
      this._placeholderEl.classList.toggle('mdc-select__placeholder--hidden', Boolean(value));
    }
  }

  /**
   * Handles setup for the native control
   */
  protected _nativeSelectSetup() {
    this.slottedSelect!.style.height = '100%';
    this.slottedSelect!.style.left = '0';
    this.slottedSelect!.style.opacity = '0';
    this.slottedSelect!.style.position = 'absolute';
    this.slottedSelect!.style.top = '0';
    this.slottedSelect!.style.width = '100%';
    this.slottedSelect!.style.zIndex = '1';
    this.slottedSelect!.style.cursor = 'pointer';
    this.slottedSelect!.style.font = getComputedStyle(this._selectedText).font;
    this.slottedSelect!.style.fontSize = getComputedStyle(this._selectedText).fontSize;
    this.slottedSelect!.style.padding = getComputedStyle(this._selectedText).padding;

    this._setNativeSelectedIndex(this.selectedIndex as number);
    this.mdcFoundation.handleChange(true);
  }

  /**
   * Handles setup for the enhanced menu.
   */
  protected _enhancedSelectSetup() {
    const isDisabled = this.mdcRoot.classList.contains(cssClasses.DISABLED);
    this._selectedText!.setAttribute('tabindex', isDisabled ? '-1' : '0');
    this.slottedMenu!.setAnchorCorner(menuSurfaceConstants.Corner.BOTTOM_START);
    this.slottedMenu!.setAnchorElement(this.mdcRoot);
    this.slottedMenu!.wrapFocus = false;
    this.slottedMenu!.singleSelection = !this.multiple;

    this.shadowRoot!.appendChild(this.slotEl!);
  }

  /**
   * Calculates where the line ripple should start based on the x coordinate within the component.
   */
  protected _getNormalizedXCoordinate(evt: MouseEvent | TouchEvent): number {
    const targetClientRect = (evt.target as Element).getBoundingClientRect();
    const xCoordinate = this.isTouchEvent_(evt) ? evt.touches[0].clientX : evt.clientX;
    return xCoordinate - targetClientRect.left;
  }

  protected isTouchEvent_(evt: MouseEvent | TouchEvent): evt is TouchEvent {
    return Boolean((evt as TouchEvent).touches);
  }

  protected _setValidity(isValid: boolean) {
    if (this._helperText && this.validationMessage) {
      this.mdcFoundation && this.mdcFoundation.setHelperTextContent(isValid ? this.helperTextContent : this.validationMessage);
      this._helperText.foundation.setValidation(!isValid);
      this.requestUpdate();
    }
  }

  /**
   * Returns a map of all subcomponents to subfoundations.
   */
  protected _getFoundationMap(): Partial<MDCSelectFoundationMap> {
    return {
      helperText: this._helperText ? this._helperText.foundation : undefined,
      leadingIcon: this._leadingIcon ? this._leadingIcon.foundation : undefined,
    };
  }

  protected async _setNativeSelectedIndex(index: number) {
    if (index === -1) {
      await this.updateComplete;
      this._setTextContent('');
      this._nativeControl!.value = '';
      
      this.mdcLabel.classList.remove("mdc-floating-label--float-above")
    } else if (this.slottedSelect!.options[index]) {
      this._setTextContent(this.slottedSelect!.options[index].textContent || '');
    }
  }

  protected _setEnhancedSelectedIndex(index: MDCListIndex) {
    const listEl = this.slottedMenu!.list;
    listEl!.selectedIndex = index;
  }

  protected _initialSyncRequiredState() {
    const isRequired =
        (this.formElement as HTMLSelectElement).required
        || this.formElement.getAttribute('aria-required') === 'true'
        || this.mdcRoot.classList.contains(cssClasses.REQUIRED);
    if (isRequired) {
      if (this._nativeControl) {
        this._nativeControl.required = true;
      } else {
        this._selectedText!.setAttribute('aria-required', 'true');
      }
      this.mdcRoot.classList.add(cssClasses.REQUIRED);
    }
  }

  protected _addMutationObserverForRequired() {
    const observerHandler = (attributesList: string[]) => {
      attributesList.some((attributeName) => {
        if (VALIDATION_ATTR_WHITELIST.indexOf(attributeName) === -1) {
          return false;
        }

        if (this._selectedText) {
          if (this._selectedText.getAttribute('aria-required') === 'true') {
            this.mdcRoot.classList.add(cssClasses.REQUIRED);
          } else {
            this.mdcRoot.classList.remove(cssClasses.REQUIRED);
          }
        } else {
          if (this._nativeControl!.required) {
            this.mdcRoot.classList.add(cssClasses.REQUIRED);
          } else {
            this.mdcRoot.classList.remove(cssClasses.REQUIRED);
          }
        }

        return true;
      });
    };

    const getAttributesList = (mutationsList: MutationRecord[]): string[] => {
      return mutationsList
          .map((mutation) => mutation.attributeName)
          .filter((attributeName) => attributeName) as string[];
    };
    const observer = new MutationObserver((mutationsList) => observerHandler(getAttributesList(mutationsList)));
    observer.observe(this.formElement, {attributes: true});
    this._validationObserver = observer;
  }

  protected _getSelectedIndex() {
    if (this.slottedMenu) {
      return this.slottedMenu.list.selectedIndex;
    }

    if (this._nativeControl) {
      return this._nativeControl.selectedIndex;
    }

    return -1;
  }

  protected _setSelectedIndex(value: MDCListIndex) {
    if (!Array.isArray(value)) {
      this.mdcFoundation.setSelectedIndex(value as number);
    } else {
      this._setEnhancedSelectedIndex(value);
      this.mdcFoundation.handleChange(true);
    }
  }

  /**
   * Recomputes the outline SVG path for the outline element.
   */
  public layout() {
    this.mdcFoundation.layout();
  }

  /**
   * Recomputes Menu position
   */
  public menuLayout() {
    const menuRoot = this.slottedMenu!.shadowRoot!.querySelector('.mdc-menu')! as HTMLElement;
    const marginTop = getComputedStyle(this.mdcRoot).marginTop;
    const marginBottom = this.helperTextElement
      ? (
        this.helperTextElement.getBoundingClientRect().height +
        Number((getComputedStyle(this.helperTextElement) as any).marginTop.replace('px', ''))
      )
      : 0;
    
    menuRoot.style.marginTop = marginTop;
    menuRoot.style.marginBottom = `${marginBottom}px`;
  }
}
