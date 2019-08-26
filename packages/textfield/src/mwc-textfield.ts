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
  addHasRemoveClass,
  html,
  RippleSurface,
  HTMLElementWithRipple,
  queryAll,
  classMap,
  property,
  observer
} from '@authentic/mwc-base/form-element';
import { MDCFloatingLabel, MDCFloatingLabelFactory } from '@material/floating-label';
import { cssClasses as floatingLabelCssClasses } from '@material/floating-label/constants';
import { MDCLineRipple, MDCLineRippleFactory } from '@material/line-ripple';
import { MDCNotchedOutline, MDCNotchedOutlineFactory } from '@material/notched-outline';
import {
  MDCTextFieldAdapter,
  MDCTextFieldInputAdapter,
  MDCTextFieldLabelAdapter,
  MDCTextFieldLineRippleAdapter,
  MDCTextFieldOutlineAdapter,
  MDCTextFieldRootAdapter
} from '@material/textfield/adapter';
import {
  MDCTextFieldCharacterCounter,
  MDCTextFieldCharacterCounterFactory,
  MDCTextFieldCharacterCounterFoundation,
} from '@material/textfield/character-counter';
import { cssClasses, strings } from '@material/textfield/constants';
import { MDCTextFieldFoundation } from '@material/textfield/foundation';
import {
  MDCTextFieldHelperText,
  MDCTextFieldHelperTextFactory,
  MDCTextFieldHelperTextFoundation,
} from '@material/textfield/helper-text';
import { MDCTextFieldIcon, MDCTextFieldIconFactory } from '@material/textfield/icon';
import { MDCTextFieldFoundationMap } from '@material/textfield/types';
import { ripple } from '@authentic/mwc-ripple/ripple-directive';
import { emit } from '@authentic/mwc-base/utils';

import { style } from './mwc-textfield-css';

const lineRippleFactory: MDCLineRippleFactory = el => new MDCLineRipple(el);
const helperTextFactory: MDCTextFieldHelperTextFactory = el => new MDCTextFieldHelperText(el);
const characterCounterFactory: MDCTextFieldCharacterCounterFactory = el => new MDCTextFieldCharacterCounter(el);
const iconFactory: MDCTextFieldIconFactory = el => new MDCTextFieldIcon(el);
const labelFactory: MDCFloatingLabelFactory = el => new MDCFloatingLabel(el);
const outlineFactory: MDCNotchedOutlineFactory = el => new MDCNotchedOutline(el);

const INPUT_PROPS = [
  'pattern',
  'minLength',
  'maxLength',
  'min',
  'max',
  'step',
  'cols',
  'rows',
  'wrap'
];

export const EVENTS = {
  trailingIconInteraction: 'trailingiconinteraction'
}

declare global {
  interface HTMLElementTagNameMap {
    'mwc-textfield': TextField;
  }
}

@customElement('mwc-textfield' as any)
export class TextField extends FormElement {

  @query('.mdc-text-field')
  protected mdcRoot!: HTMLElementWithRipple;

  @query(strings.INPUT_SELECTOR)
  protected formElement!: HTMLInputElement;

  @query(strings.LABEL_SELECTOR)
  protected labelElement!: HTMLLabelElement;

  @query(strings.LINE_RIPPLE_SELECTOR)
  protected lineRippleElement!: HTMLElement;

  @query(strings.OUTLINE_SELECTOR)
  protected outlineElement!: HTMLElement;

  @query(`.${cssClasses.HELPER_LINE}`)
  protected helperLine!: HTMLElement;

  @queryAll(strings.ICON_SELECTOR)
  protected iconElements!: HTMLElement[];

  @property({ type: String, reflect: true })
  @observer(function(this: TextField, value: string) {
    this.mdcFoundation && this.mdcFoundation.setValue(value);
  })
  public value = '';

  @property({ type: Boolean, reflect: true })
  @observer(function(this: TextField, value: boolean) {
    this.mdcFoundation && this.mdcFoundation.setDisabled(value);
  })
  public disabled = false;

  @property({ type: String, reflect: true })
  public type = 'text';

  @property({ type: String })
  public label = '';

  @property({ type: String })
  public placeholder = '';

  @property({ type: Boolean })
  public fullWidth = false;

  @property({ type: Boolean })
  public outlined = false;

  @property({ type: String })
  public helperTextContent = '';

  @property({ type: String })
  public validationMessage = '';

  @property({ type: Boolean })
  @observer(function(this: TextField, value: boolean) {
    this._helperText && this._helperText.foundation.setPersistent(value);
  })
  public persistentHelperText = false;

  @property({ type: String })
  @observer(function(this: TextField, value: string) {
    this.mdcFoundation && this.mdcFoundation.setLeadingIconAriaLabel(value);
  })
  public leadingIconAriaLabel = '';

  @property({ type: String })
  @observer(function(this: TextField, value: string) {
    this.mdcFoundation && this.mdcFoundation.setTrailingIconAriaLabel(value);
  })
  public trailingIconAriaLabel = '';

  @property({ type: String })
  public leadingIconContent = '';

  @property({ type: String })
  public trailingIconContent = '';

  @property({ type: Boolean })
  public trailingIconInteraction = false;

  @property({ type: Boolean })
  @observer(function(this: TextField, value: boolean) {
    if (!this.formElement) return;
    this.formElement.required = value;
  })
  public required = false;

  @property({ type: String })
  @observer(function(this: TextField, value: string) {
    if (!this.formElement) return;
    this.formElement.pattern = value;
  })
  public pattern;

  @property({ type: Number })
  @observer(function(this: TextField, value: number) {
    if (!this.formElement) return;
    this.formElement.minLength = value;
  })
  public minLength;

  @property({ type: Number })
  @observer(function(this: TextField, value: number) {
    if (!this.formElement) return;

    if (!value || value < 0) {
      this.formElement.removeAttribute('maxLength');
    } else {
      this.formElement.maxLength = value;
    }
  })
  public maxLength;

  @property({ type: String })
  @observer(function(this: TextField, value: string) {
    if (!this.formElement) return;
    this.formElement.min = value;
  })
  public min;

  @property({ type: String })
  @observer(function(this: TextField, value: string) {
    if (!this.formElement) return;
    this.formElement.max = value;
  })
  public max;

  @property({ type: String })
  @observer(function(this: TextField, value: string) {
    if (!this.formElement) return;
    this.formElement.step = value;
  })
  public step;

  @property({ type: Number })
  @observer(function(this: TextField, value: number) {
    if (!this.formElement) return;
    (this.formElement as Partial<HTMLTextAreaElement>).cols = value;
  })
  public cols;

  @property({ type: Number })
  @observer(function(this: TextField, value: number) {
    if (!this.formElement) return;
    (this.formElement as Partial<HTMLTextAreaElement>).rows = value;
  })
  public rows;

  @property({ type: String })
  @observer(function(this: TextField, value: string) {
    if (!this.formElement) return;
    (this.formElement as Partial<HTMLTextAreaElement>).wrap = value;
  })
  public wrap;

  @property({ type: Boolean })
  public floatLabel = false;

  public get valid(): boolean {
    return this.mdcFoundation && this.mdcFoundation.isValid();
  }

  public set valid(valid: boolean) {
    this.mdcFoundation && this.mdcFoundation.setValid(valid);

    this._setValidity(valid);
  }

  public get ripple(): RippleSurface | undefined {
    return this.mdcRoot.ripple;
  }

  /**
   * Enables or disables the use of native validation. Use this for custom validation.
   */
  public set useNativeValidation(value: boolean) {
    this.mdcFoundation.setUseNativeValidation(value);
  }

  protected _formElementId = `_${Math.random().toString(36).substr(2, 9)}`;

  protected _characterCounter!: MDCTextFieldCharacterCounter | null;

  protected _helperText!: MDCTextFieldHelperText | null;

  protected _label!: MDCFloatingLabel | null;

  protected _leadingIcon!: MDCTextFieldIcon | null;

  protected _lineRipple!: MDCLineRipple | null;

  protected _outline!: MDCNotchedOutline | null;

  protected _trailingIcon!: MDCTextFieldIcon | null;

  protected _handleInput = this._onInput.bind(this) as EventListenerOrEventListenerObject;

  protected _handleBlur = this._onBlur.bind(this) as EventListenerOrEventListenerObject;

  protected mdcFoundation!: MDCTextFieldFoundation;

  protected readonly mdcFoundationClass = MDCTextFieldFoundation;
  
  createAdapter(): MDCTextFieldAdapter {
    return {
      ...this._getRootAdapterMethods(),
      ...this._getInputAdapterMethods(),
      ...this._getLabelAdapterMethods(),
      ...this._getLineRippleAdapterMethods(),
      ...this._getOutlineAdapterMethods(),
    }
  }

  protected _getRootAdapterMethods(): MDCTextFieldRootAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      registerTextFieldInteractionHandler: (evtType, handler) => this.mdcRoot.addEventListener(evtType, handler),
      deregisterTextFieldInteractionHandler: (evtType, handler) => this.mdcRoot.addEventListener(evtType, handler),
      registerValidationAttributeChangeHandler: (handler) => {
        const getAttributesList = (mutationsList: MutationRecord[]): string[] => {
          return mutationsList
            .map((mutation) => mutation.attributeName)
            .filter((attributeName) => attributeName) as string[];
        };

        const observer = new MutationObserver((mutationsList) => handler(getAttributesList(mutationsList)));
        const config = { attributes: true };

        observer.observe(this.formElement, config);

        return observer;
      },
      deregisterValidationAttributeChangeHandler: (observer) => observer.disconnect()
    };
  }

  protected _getInputAdapterMethods(): MDCTextFieldInputAdapter {
    return {
      getNativeInput: () => this.formElement,
      isFocused: () => {
        const activeElement = (this as any).getRootNode().activeElement;
        return activeElement === this.formElement;
      },
      registerInputInteractionHandler: (evtType, handler) => this.formElement.addEventListener(evtType, handler, { passive: true }),
      deregisterInputInteractionHandler: (evtType, handler) => this.formElement.removeEventListener(evtType, handler)
    };
  }

  protected _getLabelAdapterMethods(): MDCTextFieldLabelAdapter {
    return {
      floatLabel: (shouldFloat) => this._label && this._label.float(shouldFloat),
      getLabelWidth: () => this._label ? this._label.getWidth() : 0,
      hasLabel: () => Boolean(this._label) && this.floatLabel,
      shakeLabel: (shouldShake) => (
        this._label &&
        this.labelElement.classList.contains(floatingLabelCssClasses.LABEL_FLOAT_ABOVE) &&
        this._label.shake(shouldShake)
      )
    };
  }

  protected _getLineRippleAdapterMethods(): MDCTextFieldLineRippleAdapter {
    return {
      activateLineRipple: () => {
        if (this._lineRipple) {
          this._lineRipple.activate();
        }
      },
      deactivateLineRipple: () => {
        if (this._lineRipple) {
          this._lineRipple.deactivate();
        }
      },
      setLineRippleTransformOrigin: (normalizedX) => {
        if (this._lineRipple) {
          this._lineRipple.setRippleCenter(normalizedX);
        }
      }
    };
  }

  protected _getOutlineAdapterMethods(): MDCTextFieldOutlineAdapter {
    return {
      closeOutline: () => this._outline && this._outline.closeNotch(),
      hasOutline: () => Boolean(this._outline),
      notchOutline: (labelWidth) => this._outline && this._outline.notch(labelWidth),
    };
  }

  static styles = style;

  _renderInput() {
    const isTextArea = this.type === 'textarea';

    return isTextArea
      ? html`
        <textarea
          id="${this._formElementId}"
          class="mdc-text-field__input"
          placeholder="${this.placeholder}"
          aria-label="${this.label}"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          @focus="${evt => this._handleInteractionEvent(evt)}"
          @blur="${evt => this._handleInteractionEvent(evt)}"
          .value="${this.value}"
        ></textarea>
      `
      : html`
        <input
          id="${this._formElementId}"
          class="mdc-text-field__input"
          type="${this.type}"
          placeholder="${this.placeholder}"
          aria-label="${this.label}"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          @focus="${evt => this._handleInteractionEvent(evt)}"
          @blur="${evt => this._handleInteractionEvent(evt)}"
          .value="${this.value}">
      `;
  }

  _renderFloatingLabel() {
    return html`
      <label class="mdc-floating-label" for="${this._formElementId}">${this.label}</label>
    `;
  }

  _renderNotchedOutline(showAdjacentLabel: boolean | string) {
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

  _renderLineRipple() {
    return html`
      <div class="mdc-line-ripple"></div> 
    `;
  }

  _renderIcon(variant: string) {
    const isTrailingIcon = variant === 'trailing';
    const isTrailingIconInteraction = isTrailingIcon && this.trailingIconInteraction;
    const iconContent = isTrailingIcon ? this.trailingIconContent : this.leadingIconContent;

    return html`
      <i class="material-icons mdc-text-field__icon mdc-text-field__icon--${variant}" tabindex="${isTrailingIconInteraction ? 0 : -1}">
        ${iconContent}
      </i>
    `;
  }

  _renderHelperLine() {
    const isTextarea = this.type === 'textarea';
    const hasCharacterCounter = this.maxLength && this.maxLength > 0;
    const hasHelperText = this.helperTextContent || this.validationMessage;

    return html`
      <div class="mdc-text-field-helper-line">
        ${hasHelperText ? this._renderHelperText() : ''}
        ${hasCharacterCounter && !isTextarea ? this._renderCharacterCounter() : ''}
      </div>
    `;
  }

  _renderHelperText() {
    const classes = {
      'mdc-text-field-helper-text': true,
      'mdc-text-field-helper-text--persistent': this.persistentHelperText
    };

    return html`
      <div class="${classMap(classes)}">${this.helperTextContent}</div>
    `
  }

  _renderCharacterCounter() {
    return html`
      <div class="mdc-text-field-character-counter"></div>
    `;
  }

  _renderAdjacentLabel() {
    const classes = {
      'mdc-floating-label--adjacent': true
    };

    return html`
        <div class="${classMap(classes)}" for="${this._formElementId}">${this.label}</div>
    `;
  }

  render() {
    const isTextarea = this.type === 'textarea';
    const hasOutline = this.outlined || isTextarea;
    const hasLabel = this.label && (!this.fullWidth || isTextarea);
    const hasLabelAndIsNotOutlined = hasLabel && !hasOutline;
    const hasLeadingIcon = this.leadingIconContent;
    const hasTrailingIcon = this.trailingIconContent;
    const hasCharacterCounter = this.maxLength && this.maxLength > 0;
    const showAdjacentLabel = hasLabel && !this.floatLabel;
    const classes = {
      'mdc-text-field': true,
      'mdc-text-field--no-label': !hasLabel || showAdjacentLabel,
      'mdc-text-field--outlined': this.outlined,
      'mdc-text-field--textarea': this.type === 'textarea',
      'mdc-text-field--fullwidth': this.fullWidth,
      'mdc-text-field--disabled': this.disabled,
      'mdc-text-field--with-leading-icon': hasLeadingIcon,
      'mdc-text-field--with-trailing-icon': hasTrailingIcon,
      'mdc-text-field--with-trailing-icon-interaction' : this.trailingIconInteraction,
      'mdc-text-field--with-adjacent-label': showAdjacentLabel
    };

    return html`
      <div class="${classMap(classes)}" .ripple="${!hasOutline && ripple({ unbounded: false })}">
        ${hasCharacterCounter && isTextarea ? this._renderCharacterCounter() : ''}
        ${hasLeadingIcon ? this._renderIcon('leading') : ''}
        ${this._renderInput()}
        ${!showAdjacentLabel && hasLabelAndIsNotOutlined ? this._renderFloatingLabel() : ''}
        ${hasTrailingIcon ? this._renderIcon('trailing') : ''}
        ${hasOutline ? this._renderNotchedOutline(showAdjacentLabel) : this._renderLineRipple()}
      </div>
      ${this._renderHelperLine()}
      ${showAdjacentLabel ? this._renderAdjacentLabel() : ''}
    `;
  }

  firstUpdated() {
    this._label = this.labelElement ? labelFactory(this.labelElement) : null;
    this._lineRipple = this.lineRippleElement ? lineRippleFactory(this.lineRippleElement) : null;
    this._outline = this.outlineElement ? outlineFactory(this.outlineElement) : null;
    
    // Helper text
    const helperTextStrings = MDCTextFieldHelperTextFoundation.strings;
    const helperTextEl = this.helperLine
      ? this.helperLine.querySelector(helperTextStrings.ROOT_SELECTOR)
      : null;
    this._helperText = helperTextEl ? helperTextFactory(helperTextEl) : null;

    // Character counter
    const characterCounterStrings = MDCTextFieldCharacterCounterFoundation.strings;
    let characterCounterEl = this.mdcRoot.querySelector(characterCounterStrings.ROOT_SELECTOR);
    // If character counter is not found in root element search in sibling element.
    if (!characterCounterEl && this.helperLine) {
      characterCounterEl = this.helperLine.querySelector(characterCounterStrings.ROOT_SELECTOR);
    }
    this._characterCounter = characterCounterEl ? characterCounterFactory(characterCounterEl) : null;

    this._leadingIcon = null;
    this._trailingIcon = null;

    if (this.iconElements.length > 0) {
      if (this.iconElements.length > 1) { // Has both icons.
        this._leadingIcon = iconFactory(this.iconElements[0]);
        this._trailingIcon = iconFactory(this.iconElements[1]);
      } else {
        if (this.mdcRoot.classList.contains(cssClasses.WITH_LEADING_ICON)) {
          this._leadingIcon = iconFactory(this.iconElements[0]);
        } else {
          this._trailingIcon = iconFactory(this.iconElements[0]);
        }
      }
    }

    // // set intial input props
    INPUT_PROPS.forEach(prop => {
      const value = this[prop];

      switch(prop) {
        case 'maxLength':
          if (value && value > 0) this.formElement[prop] = value;
          break;
        default:
          if (value) this.formElement[prop] = value;
          break;
      }
    });

    super.firstUpdated();

    this.formElement.addEventListener('input', this._handleInput);
    this.formElement.addEventListener('blur', this._handleBlur);

    if (this._trailingIcon) {
      this._trailingIcon.listen('click', evt => this._onTrailingIconAction(evt));
      this._trailingIcon.listen('keydown', evt => this._onTrailingIconAction(evt));
    }
  }

  createFoundation() {
    if (this.mdcFoundation !== undefined) {
      this.mdcFoundation.destroy();
    }

    this.mdcFoundation = new this.mdcFoundationClass(this.createAdapter(), this._getFoundationMap());
    this.mdcFoundation.init();
  }

  /**
   * Handle input event
   */
  protected _onInput() {
    this.value = this.formElement.value;
    this._setValidity(this.valid);
  }

  /**
   * Handle blur event
   */
  protected _onBlur() {
    this._setValidity(this.valid);
  }

  /**
   * Handle trailing icon action event
   */
  protected _onTrailingIconAction(evt) {
    if (evt.type === 'keydown') {
      const isSpace = evt.key === 'Space' || evt.keyCode === 32;
      const isEnter = evt.key === 'Enter' || evt.keyCode === 13;

      if (!isSpace && !isEnter) return;

      if (isSpace) evt.preventDefault();
    }

    emit(this, EVENTS.trailingIconInteraction, {}, true);
  }

  /**
   * Handle formElement interaction event
   */
  protected _handleInteractionEvent(evt) {
    emit(this.mdcRoot, evt.type, {}, false);
  }

  protected _setValidity(isValid: boolean) {
    if (this._helperText && this.validationMessage) {
      this.mdcFoundation && this.mdcFoundation.setHelperTextContent(isValid ? this.helperTextContent : this.validationMessage);
      this._helperText.foundation.setValidation(!isValid);
      this.requestUpdate();
    }
  }

  /**
   * @return A map of all subcomponents to subfoundations.
   */
  protected _getFoundationMap(): Partial<MDCTextFieldFoundationMap> {
    return {
      characterCounter: this._characterCounter ? this._characterCounter.foundation : undefined,
      helperText: this._helperText ? this._helperText.foundation : undefined,
      leadingIcon: this._leadingIcon ? this._leadingIcon.foundation : undefined,
      trailingIcon: this._trailingIcon ? this._trailingIcon.foundation : undefined,
    };
  }

  /**
   * Focuses the input element.
   */
  public focus() {
    this.formElement.focus();
  }

  /**
   * Recomputes the outline SVG path for the outline element.
   */
  public layout() {
    const openNotch = this.mdcFoundation.shouldFloat;
    this.mdcFoundation.notchOutline(openNotch);
  }

}
