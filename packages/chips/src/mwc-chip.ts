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
  html,
  property,
  classMap,
  query,
  observer,
  emit,
  addHasRemoveClass
} from '@authentic/mwc-base/base-element';
import { MDCChipFoundation } from '@material/chips/chip/foundation';
import { MDCChipAdapter } from '@material/chips/chip/adapter';
import { ChipSet as MWCChipSet } from './mwc-chip-set';
import { styleMap } from 'lit-html/directives/style-map';
import { strings } from '@material/chips/chip/constants';
import { ripple } from '@authentic/mwc-ripple/ripple-directive';
import { style } from './mwc-chip-css';

import "@authentic/mwc-icon/mwc-icon-font";

const INTERACTION_EVENTS = [ 'click', 'keydown' ];
const IMAGE_FORMATS_REGEX = new RegExp(/(http(s?):\/\/)|(.(gif|jp(e?)g|png|svg))$/);
const COLOR_REGEX = new RegExp(/^#([0-9a-zA-Z]{3}|[0-9a-zA-Z]{6})$/);

@customElement('mwc-chip' as any)
export class Chip extends BaseElement {

  @query(".mdc-chip")
  protected mdcRoot!: HTMLElement;

  @query(".mdc-chip__icon--leading")
  protected leadingIconEl!: HTMLElement;

  @query(".mdc-chip__icon--trailing")
  protected trailingIconEl!: HTMLElement;

  @query(".mdc-chip__checkmark")
  protected checkmarkEl!: HTMLElement;

  @property({ type: String })
  public label = '';

  @property({ type: String })
  public avatar = '';

  @property({ type: String })
  public leadingIcon = '';

  @property({ type: String })
  public trailingIcon = '';

  @property({ type: Boolean })
  public checkmark = false;

  @property({ type: Boolean })
  public outlined = false;

  @property({ type: Number })
  public tabIndex = -1;

  @property({ type: Boolean })
  public preventRipple = false;

  @property({ type: Boolean })
  @observer(function (this: Chip, value: boolean ) {
    this.mdcFoundation.setSelected(value);
  })
  public selected = false;

  @property({ type: Boolean })
  @observer(function (this: Chip, value: boolean ) {
    this.mdcFoundation.setShouldRemoveOnTrailingIconClick(!value);
  })
  public preventRemoveOnTrailingIconClick = false;

  protected get _shouldDisplayLeadingIcon() {
    return this.leadingIcon && !this.avatar;
  }

  protected get _shouldDisplayCheckmark() {
    return this.checkmark;
  }

  protected get _shouldDisplayAvatar() {
    return this.avatar && !this.leadingIcon;
  }

  public get ripple() {
    if (this.preventRipple) return undefined;

    if (!this._ripple) {
      this._ripple = ripple({
        adapter: { computeBoundingRect: () => this.mdcFoundation.getDimensions() },
        unbounded: false
      });
    }
    
    return this._ripple;
  }

  protected _ripple;

  protected _isChoice = false;

  protected _isFilter = false;

  protected _isInput = false;

  protected _isDefault = false;

  protected _handleInteraction = this._onInteraction.bind(this) as EventListenerOrEventListenerObject;

  protected _handleTrailingIconInteraction = this._onTrailingIconInteraction.bind(this) as EventListenerOrEventListenerObject;
  
  protected _handleTransitionEnd = this._onTransitionEnd.bind(this) as EventListenerOrEventListenerObject;

  protected mdcFoundation!: MDCChipFoundation;

  protected readonly mdcFoundationClass = MDCChipFoundation;

  protected createAdapter(): MDCChipAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      addClassToLeadingIcon: className => {
        if (this.leadingIconEl) {
          this.leadingIconEl.classList.add(className);
        }
      },
      eventTargetHasClass: (target: HTMLElement, className) => target ? target.classList.contains(className) : false,
      getCheckmarkBoundingClientRect: () => this.checkmarkEl ? this.checkmarkEl.getBoundingClientRect() : null,
      getComputedStyleValue: propertyName => window.getComputedStyle(this.mdcRoot).getPropertyValue(propertyName),
      getRootBoundingClientRect: () => this.mdcRoot.getBoundingClientRect(),
      hasLeadingIcon: () => Boolean(this.leadingIconEl),
      notifyInteraction: () => this._onNotifyInteraction(),
      notifyRemoval: () => {
        this.destroy();
        this._onNotifyRemoval();
      },
      notifySelection: selected => this._onNotifySelection(selected),
      notifyTrailingIconInteraction: () => emit(this, strings.TRAILING_ICON_INTERACTION_EVENT, { chipId: this.id }, true),
      removeClassFromLeadingIcon: className => {
        if (this.leadingIconEl) {
          this.leadingIconEl.classList.remove(className);
        }
      },
      setStyleProperty: (propertyName, value) => this.mdcRoot.style.setProperty(propertyName, value),
    }
  }

  static styles = style;

  protected _renderLeadingIcon() {
    const classes = {
      'material-icons': true,
      'mdc-chip__icon': true,
      'mdc-chip__icon--leading': true,
      'mdc-chip__icon--leading-hidden': this.selected,
    };

    return html`
      <i class="${classMap(classes)}">${this.leadingIcon}</i>
    `;
  }

  protected _renderAvatar() {
    const isImage = IMAGE_FORMATS_REGEX.test(this.avatar);
    const isColor = !isImage && COLOR_REGEX.test(this.avatar);
    const isText = !isImage && !isColor && this.avatar.length === 1;
    const isIcon = !isImage && !isText && !isColor;
    const classes = {
      'mdc-chip__avatar': true,
      [`mdc-chip__avatar--${isColor ? this._getAvatarTextColor(this.avatar) : 'default'}`]: true
    };
    const styles = {
      backgroundColor: isColor ? this.avatar : ''
    };

    return html`
      <div class="${classMap(classes)}" style="${styleMap(styles)}">
        ${isImage ? this._renderAvatarImage() : ''}
        ${isText ? this._renderAvatarText() : ''}
        ${isIcon ? this._renderAvatarIcon() : ''}
      </div>
    `;
  }

  protected _getAvatarTextColor(color: string) {
    const CODE = color.substring(1);
    const RGB = parseInt(CODE, 16);
    const RED = (RGB >> 16) & 0xff;
    const GREEN = (RGB >>  8) & 0xff;
    const BLUE = (RGB >>  0) & 0xff;

    const luma = 0.2126 * RED + 0.7152 * GREEN + 0.0722 * BLUE; // per ITU-R BT.709

    return luma > 40 ? 'dark' : 'light';
  }

  protected _renderAvatarImage() {
    return html`
      <img class="mdc-chip__avatar-graphic" src="${this.avatar}" alt="${this.label}">
    `;
  }

  protected _renderAvatarText() {
    return html`
      <span class="mdc-chip__avatar-text">${this.avatar}</span>
    `;
  }

  protected _renderAvatarIcon() {
    return html`
      <i class="material-icons mdc-chip__avatar-icon">${this.avatar}</i>
    `;
  }

  protected _renderCheckmark() {
    return html`
      <div class="mdc-chip__checkmark">
        <svg class="mdc-chip__checkmark-svg" viewBox="-2 -3 30 30">
          <path
            class="mdc-chip__checkmark-path"
            fill="none"
            d="M1.73 12.91 8.1 19.28 22.79 4.59"
          />
        </svg>
      </div>
    `;
  }

  protected _renderTrailingIcon() {
    const classes = {
      'material-icons': true,
      'mdc-chip__icon': true,
      'mdc-chip__icon--trailing': true
    };

    return html`
      <i class="${classMap(classes)}" tabindex="0" role="button">${this.trailingIcon}</i>
    `;
  }

  render() {
    const classes = {
      'mdc-chip': true,
      'mdc-chip--outlined': this.outlined,
      'mdc-chip--selected': this.selected,
      'mdc-chip--choice': this._isChoice,
      'mdc-chip--filter': this._isFilter,
      'mdc-chip--input': this._isInput,
      'mdc-chip--default': this._isDefault
    };

    return html`
      <div class="${classMap(classes)}" tabindex="${this.tabIndex}" .ripple="${this.ripple}">
        ${this._shouldDisplayLeadingIcon ? this._renderLeadingIcon() : ''}
        ${this._shouldDisplayAvatar ? this._renderAvatar() : ''}
        ${this._shouldDisplayCheckmark ? this._renderCheckmark() : ''}
        <span class="mdc-chip__text">${this.label}</span>
        ${this.trailingIcon ? this._renderTrailingIcon() : ''}
        <slot></slot>
      </div>
    `;
  }

  firstUpdated() {
    super.firstUpdated();

    this.updateComplete
      .then(() => {
        this._initialize();
        this.setParentType();
      });
  }

  protected _initialize() {
    INTERACTION_EVENTS.forEach(evtType => {
      this.addEventListener(evtType, this._handleInteraction);
    });

    this.mdcRoot.addEventListener('transitionend', this._handleTransitionEnd);

    if (this.trailingIcon) {
      INTERACTION_EVENTS.forEach(evtType => {
        this.trailingIconEl.addEventListener(evtType, this._handleTrailingIconInteraction);
      });
    }
  }

  public destroy() {
    INTERACTION_EVENTS.forEach(evtType => {
      this.removeEventListener(evtType, this._handleInteraction);
    });

    this.mdcRoot.removeEventListener('transitionend', this._handleTransitionEnd);

    if (this.trailingIcon) {
      INTERACTION_EVENTS.forEach(evtType => {
        this.trailingIconEl.removeEventListener(evtType, this._handleTrailingIconInteraction);
      });
    }
  }

  public setParentType(parentElement = this.parentElement) {
    if (parentElement instanceof MWCChipSet) {
      this._isChoice = parentElement.choice;
      this._isFilter = parentElement.filter;
      this._isInput = parentElement.input;
      this._isDefault = !this._isChoice && !this._isFilter && !this._isInput;

      this.requestUpdate();
    }
  }

  protected _onNotifyRemoval() {
    emit(this, strings.REMOVAL_EVENT, { chipId: this.id, root: this.mdcRoot }, true);
  }

  protected _onNotifyInteraction() {
    emit(this, strings.INTERACTION_EVENT, { chipId: this.id }, true);
  }

  protected _onNotifySelection(selected) {
    emit(this, strings.SELECTION_EVENT, { chipId: this.id, selected: selected }, true)
  }

  /**
   * Handles a transition end event on the root element.
   */
  protected _onTransitionEnd(evt: TransitionEvent) {
    return this.mdcFoundation.handleTransitionEnd(evt);
  }

  /**
   * Handles an interaction event on the root element.
   */
  protected _onInteraction(evt: MouseEvent | KeyboardEvent) {
    return this.mdcFoundation.handleInteraction(evt);
  }

  /**
   * Handles an interaction event on the trailing icon element.
   * This is used to prevent the ripple from activating on interaction
   * with the trailing icon.
   */
  protected _onTrailingIconInteraction(evt: MouseEvent | KeyboardEvent) {
    return this.mdcFoundation.handleTrailingIconInteraction(evt);
  }

  /**
   * Begins the exit animation which leads to removal of the chip.
   */
  public beginExit() {
    this.mdcFoundation.beginExit();
  }

  remove() {
    this.destroy();
    super.remove();
  }
}
