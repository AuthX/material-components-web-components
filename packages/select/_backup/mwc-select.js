var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import { FormElement, customElement, query, html, classMap, property, observer } from '@material/mwc-base/form-element';
import { findAssignedElement, emit, addHasRemoveClass } from '@material/mwc-base/utils';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import MDCSelectFoundation from '@material/select/foundation';
import { MDCLineRipple } from '@material/line-ripple';
import { MDCFloatingLabel } from '@material/floating-label';
import { MDCNotchedOutline } from '@material/notched-outline';
import { ripple } from '@material/mwc-ripple/ripple-directive';
import { cssClasses, strings } from './constants';
import { style } from './mwc-select-css';
// elements to be registered ahead of time
import '@material/mwc-menu';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item-separator';
export class HTMLSelectElementProxy {
    constructor(select) {
        this.select = select;
        this.isReady = false;
        if (this.select.updateComplete) {
            this.select.updateComplete.then(() => {
                this.isReady = true;
            });
        }
    }
    get value() {
        return this.select instanceof HTMLSelectElement
            ? this.select.value
            : this.items[this.selectedIndex]
                ? this.items[this.selectedIndex].value
                : '';
    }
    set value(value) {
        if (this.select instanceof HTMLSelectElement) {
            if (this.select.value !== value) {
                this.select.value = value;
                emit(this.select, 'change');
            }
        }
        else {
            const selectedElement = this.items.filter(el => el.value === value)[0];
            this.selectedIndex = selectedElement
                ? this.items.indexOf(selectedElement)
                : -1;
        }
    }
    get selectedIndex() {
        return this.select.selectedIndex;
    }
    set selectedIndex(value) {
        if (this.select.selectedIndex !== value) {
            this.select.selectedIndex = value;
            if (this.select instanceof HTMLSelectElement) {
                emit(this.select, 'change');
            }
        }
    }
    get selectedOptions() {
        return [...this.isReady ? this.select.selectedOptions || this.select.selectedItems : []];
    }
    get items() {
        return [...this.isReady ? this.select.options || this.select.items : []];
    }
    get text() {
        return this.selectedOptions.length > 0
            ? this.selectedOptions.map(option => option.label).join(', ')
            : '';
    }
}
let Select = class Select extends FormElement {
    constructor() {
        super(...arguments);
        this.selectedIndex = -1;
        this.label = '';
        this.box = false;
        this.outlined = false;
        this.dense = false;
        this.disabled = false;
        this.fullWidth = false;
        this.required = false;
        this.value = '';
        this.name = '';
        this.helperText = '';
        this.persistentHelperText = false;
        this.validationMessage = '';
        this._valid = true;
        this.mdcFoundationClass = MDCSelectFoundation;
    }
    get valid() {
        return this._valid;
    }
    set valid(value) {
        this._valid = value;
        this.requestUpdate();
    }
    get slottedElement() {
        return findAssignedElement(this.slotSelect, '*') || findAssignedElement(this.slotMenu, '*');
    }
    get select() {
        return (this.formElement instanceof HTMLSelectElement ? this.slottedElement : undefined);
    }
    get menu() {
        return (this.formElement instanceof HTMLInputElement ? this.slottedElement : undefined);
    }
    get isMenuOpen() {
        return this.menu && this.menu.open;
    }
    get items() {
        return this.selectProxy.items;
    }
    get selectProxy() {
        if (!this._selectProxyInstance) {
            this._selectProxyInstance = new HTMLSelectElementProxy((this.select || this.menu));
        }
        return this._selectProxyInstance;
    }
    get formElement() {
        if (!this._formElementInstance) {
            this._formElementInstance = this.slottedElement instanceof HTMLSelectElement
                ? this.slottedElement
                : this.input;
        }
        return this._formElementInstance;
    }
    get _lineRipple() {
        if (!this.outlined && this.lineRippleElement) {
            this._lineRippleInstance = this._lineRippleInstance || new MDCLineRipple(this.lineRippleElement);
        }
        return this._lineRippleInstance;
    }
    get _label() {
        if (this.label && this.labelElement) {
            this._labelInstance = this._labelInstance || new MDCFloatingLabel(this.labelElement);
        }
        return this._labelInstance;
    }
    get _outline() {
        if (this.outlined && this.outlineElement) {
            this._outlineInstance = this._outlineInstance || new MDCNotchedOutline(this.outlineElement);
        }
        return this._outlineInstance;
    }
    createAdapter() {
        return Object.assign({}, addHasRemoveClass(this.mdcRoot), { floatLabel: (value) => {
                if (this.menu && this.menu.open) {
                    return;
                }
                if (this._label) {
                    this._label.float(value);
                }
            }, activateBottomLine: () => {
                if (this._lineRipple) {
                    this._lineRipple.activate();
                }
                if (this._outline) {
                    this._openNotch();
                }
            }, deactivateBottomLine: () => {
                if (this._isMouseDown)
                    return;
                if (this._lineRipple) {
                    this._lineRipple.deactivate();
                }
                if (this._outlineInstance && !this.selectProxy.value) {
                    this._outline.closeNotch();
                }
            }, setDisabled: (disabled) => {
                this.disabled = disabled;
            }, registerInteractionHandler: (type, handler) => {
                this.formElement.addEventListener(type, handler);
            }, deregisterInteractionHandler: (type, handler) => {
                this.formElement.removeEventListener(type, handler);
            }, getSelectedIndex: () => {
                return this.selectProxy.selectedIndex;
            }, setSelectedIndex: (index) => {
                this.selectProxy.selectedIndex = index;
            }, getValue: () => {
                return this.selectProxy.value;
            }, setValue: (value) => {
                this.selectProxy.value = value;
                this.input.value = this.selectProxy.text;
            } });
    }
    async firstUpdated() {
        super.firstUpdated();
        const isValid = this._isValid();
        this._setValid(isValid);
        if (this.select) {
            this.select.classList.add('mdc-select__native-control');
            this.formElement.addEventListener('change', this._handleSelection.bind(this));
            this.input.style.display = 'none';
            this.input.tabIndex = -1;
        }
        if (this.menu) {
            this.input.tabIndex = 0;
            this.menu.selectionGroup = true;
            this.menu.autofocus = true;
            this.menu.autoclose = true;
            this.formElement.addEventListener('keydown', evt => this._handleKeydown(evt));
            this.formElement.addEventListener('mousedown', () => this._handleMouseDown());
            this.menu.addEventListener('MDCMenu:closed', () => this._handleMenuClosed());
            this.menu.addEventListener('MDCMenu:selected', evt => this._handleMenuSelected(evt));
            this.menu.updateComplete.then(() => {
                this.menu.setAnchorElement(this.mdcRoot);
                this.formElement.style.minWidth = `${this.menu.getWidth() + 32}px`;
            });
        }
        this.formElement.addEventListener('focus', this._handleFocus.bind(this));
        this.formElement.addEventListener('blur', this._handleBlur.bind(this));
    }
    render() {
        const { label, disabled, box, outlined, fullWidth, value, dense, valid } = this;
        const hostClassInfo = {
            'mdc-select--box': box,
            'mdc-select--dense': dense,
            'mdc-select--outlined': outlined,
            'mdc-select--disabled': disabled,
            'mdc-select--fullwidth': fullWidth,
            'mdc-select--invalid': !valid
        };
        const labelClassInfo = {
            'mdc-floating-label--float-above': !!value
        };
        return html `
      <div class="mdc-select ${classMap(hostClassInfo)}" .ripple="${!outlined ? ripple({ unbounded: false }) : undefined}">
        <input type="text" size="1" readonly class="mdc-select__selected-text">
        <slot name="select"></slot>
        ${label ? html `<label class="mdc-floating-label ${classMap(labelClassInfo)}" for="select">${label}</label>` : ''}
        ${outlined
            ? html `
            <div class="mdc-notched-outline">
              <svg><path class="mdc-notched-outline__path"/></svg>
            </div>
            <div class="mdc-notched-outline__idle"></div>`
            : html `<div class="mdc-line-ripple"></div>`}
      </div>
      ${this._renderHelperText()}
      <slot name="menu"></slot>
    `;
    }
    _renderHelperText() {
        const isValidationMessage = !this.valid && !!this.validationMessage;
        const classes = {
            'mdc-select-helper-text': true,
            [cssClasses.HELPER_TEXT_PERSISTENT]: this.persistentHelperText,
            [cssClasses.HELPER_TEXT_VALIDATION_MSG]: isValidationMessage,
        };
        const message = isValidationMessage ? this.validationMessage : this.helperText;
        return this.helperText || isValidationMessage
            ? html `<p class="${classMap(classes)}">${message}</p>`
            : null;
    }
    _isValid() {
        return !this.required || this.value !== '';
    }
    _setValid(isValid) {
        this.valid = isValid;
        this._styleValidity(isValid);
        const shouldShake = !isValid && !this._isFocused;
        if (this._labelInstance) {
            this._labelInstance.shake(shouldShake);
        }
    }
    _styleValidity(isValid) {
        const { INVALID, HELPER_TEXT_PERSISTENT, HELPER_TEXT_VALIDATION_MSG } = cssClasses;
        if (isValid) {
            this.mdcFoundation.adapter_.removeClass(INVALID);
        }
        else {
            this.mdcFoundation.adapter_.addClass(INVALID);
        }
        if (this.helperTextElement) {
            const helperTextIsPersistent = this.helperTextElement.classList.contains(HELPER_TEXT_PERSISTENT);
            const helperTextIsValidationMsg = this.helperTextElement.classList.contains(HELPER_TEXT_VALIDATION_MSG);
            const validationMsgNeedsDisplay = helperTextIsValidationMsg && !isValid;
            if (validationMsgNeedsDisplay) {
                this.helperTextElement.setAttribute(strings.ROLE, 'alert');
            }
            else {
                this.helperTextElement.removeAttribute(strings.ROLE);
            }
            if (!helperTextIsPersistent && !validationMsgNeedsDisplay) {
                this._hideHelperText();
            }
        }
    }
    _hideHelperText() {
        this.helperTextElement.setAttribute(strings.ARIA_HIDDEN, 'true');
    }
    _showHelperTextToScreenReader() {
        this.helperTextElement.removeAttribute(strings.ARIA_HIDDEN);
    }
    _openNotch() {
        const isRtl = window.getComputedStyle(this.mdcRoot).getPropertyValue('direction') === 'rtl';
        const labelWidth = !!this._label && !this.dense ? this._label.getWidth() : -12; // due to notched outline label spacing
        this._outline.notch(labelWidth * (this.dense ? .923 : .75), isRtl);
    }
    /**
     * Updates value and selectedIndex
     */
    _handleSelection(evt) {
        evt.stopImmediatePropagation();
        const prevValue = this.value;
        this.selectedIndex = this.selectProxy.selectedIndex;
        this.value = this.selectProxy.value;
        this._notifyChange();
        if (this._outline && !this._isMouseDown) {
            if (this.selectedIndex !== -1) {
                this._openNotch();
            }
            else {
                this._outline.closeNotch();
            }
        }
        if (prevValue !== this.value) {
            emit(this, 'change', { value: this.value, selectedIndex: this.selectedIndex });
        }
    }
    /**
     * Updates select proxy selectedIndex
     */
    _handleMenuSelected(evt) {
        var detail = evt.detail;
        this.selectProxy.selectedIndex = detail.index;
        this._handleSelection(evt);
    }
    /**
     * Recover focus
     */
    _handleMenuClosed() {
        if (this._isMouseDown) {
            this._isMouseDown = false;
        }
        else {
            // Prevent focus if another select was focused
            if (document.activeElement instanceof HTMLSelectElement === false &&
                (document.activeElement instanceof ListItem === false || this.contains(document.activeElement))) {
                this.input.focus();
            }
            else {
                this._isMouseDown = false;
                this._notifyBlur();
            }
        }
    }
    /**
     * Opens menu if already focused
     */
    _handleMouseDown() {
        this._isMouseDown = true;
        if (this.isMenuOpen) {
            return;
        }
        ;
        if (this._isFocused) {
            this.openMenu();
        }
    }
    /**
     * Handle keys that open the menu
     */
    _handleKeydown(evt) {
        const { key, keyCode } = evt;
        const isSpace = key === 'Space' || keyCode === 32;
        const isEnter = key === 'Enter' || keyCode === 13;
        if (isSpace || isEnter) {
            this._isMouseDown = true;
            this.openMenu();
        }
    }
    /**
     * Adds focused class, opens menu and redirects focus even to mdcRoot
     */
    _handleFocus() {
        this.mdcRoot.classList.add('mdc-select--focused');
        this._isFocused = true;
        if (this._isMouseDown) {
            this.openMenu();
        }
        if (this.helperTextElement) {
            this._showHelperTextToScreenReader();
        }
        emit(this.mdcRoot, 'focus');
        this._notifyFocus();
    }
    /**
     * Removes focused class and redirects blur event to mdcRoot
     */
    _handleBlur(evt) {
        evt.stopImmediatePropagation();
        if (this._isMouseDown) {
            this._isMouseDown = false;
        }
        else {
            this.mdcRoot.classList.remove('mdc-select--focused');
            this._isFocused = false;
            emit(this.mdcRoot, 'blur');
            this._notifyBlur();
        }
    }
    _notifyChange() {
        emit(this, 'change', { value: this.value });
    }
    _notifyFocus() {
        emit(this, 'focus', { value: this.value });
    }
    _notifyBlur() {
        emit(this, 'blur', { value: this.value });
    }
    openMenu() {
        if (this.menu && !this.menu.open) {
            this.menu.open = true;
        }
    }
    closeMenu() {
        if (this.menu && this.menu.open) {
            this.menu.open = false;
        }
    }
};
Select.styles = style;
__decorate([
    query('.mdc-select')
], Select.prototype, "mdcRoot", void 0);
__decorate([
    query('input')
], Select.prototype, "input", void 0);
__decorate([
    query('slot[name="select"]')
], Select.prototype, "slotSelect", void 0);
__decorate([
    query('slot[name="menu"]')
], Select.prototype, "slotMenu", void 0);
__decorate([
    query('.mdc-line-ripple')
], Select.prototype, "lineRippleElement", void 0);
__decorate([
    query('.mdc-floating-label')
], Select.prototype, "labelElement", void 0);
__decorate([
    query('.mdc-notched-outline')
], Select.prototype, "outlineElement", void 0);
__decorate([
    query('gsk-one-checkbox-group-helper-text')
], Select.prototype, "helperTextElement", void 0);
__decorate([
    property({ type: Number }),
    observer(function (value) {
        this.mdcFoundation.setSelectedIndex(value);
    })
], Select.prototype, "selectedIndex", void 0);
__decorate([
    property({ type: String })
], Select.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], Select.prototype, "box", void 0);
__decorate([
    property({ type: Boolean })
], Select.prototype, "outlined", void 0);
__decorate([
    property({ type: Boolean })
], Select.prototype, "dense", void 0);
__decorate([
    property({ type: Boolean }),
    observer(function (value) {
        this.mdcFoundation.setDisabled(value);
    })
], Select.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], Select.prototype, "fullWidth", void 0);
__decorate([
    property({ type: Boolean })
], Select.prototype, "required", void 0);
__decorate([
    property({ type: String }),
    observer(function (value) {
        this.mdcFoundation.setValue(value);
        const isValid = this._isValid();
        this._setValid(isValid);
    })
], Select.prototype, "value", void 0);
__decorate([
    property({ type: String })
], Select.prototype, "name", void 0);
__decorate([
    property({ type: String })
], Select.prototype, "helperText", void 0);
__decorate([
    property({ type: Boolean })
], Select.prototype, "persistentHelperText", void 0);
__decorate([
    property({ type: String })
], Select.prototype, "validationMessage", void 0);
Select = __decorate([
    customElement('mwc-select')
], Select);
export { Select };
//# sourceMappingURL=mwc-select.js.map