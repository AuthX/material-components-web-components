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
  property,
  observer,
  query,
  customElement,
  PropertyValues,
  classMap,
  addHasRemoveClass,
  emit
} from '@authentic/mwc-base/base-element';
import MDCModalDrawerFoundation from '@material/drawer/modal/foundation';
import MDCDismissibleDrawerFoundation from '@material/drawer/dismissible/foundation';
import { MDCDrawerAdapter } from '@material/drawer/adapter';
import 'wicg-inert/dist/inert';
import 'blocking-elements/blocking-elements';

import { style } from './mwc-drawer-css';

export const EVENTS = {
  closed: 'closed',
  opened: 'opened',
}

declare global {
  interface HTMLElementTagNameMap {
    'mwc-drawer': Drawer;
  }

  interface Document {
    $blockingElements: {
      push(HTMLElement): void;
      remove(HTMLElement): Boolean;
    }
  }

  interface HTMLElement {
    inert: Boolean;
  }
}

@customElement('mwc-drawer' as any)
export class Drawer extends BaseElement {

  /**
   * Root element for drawer component.
   */
  @query('.mdc-drawer')
  protected mdcRoot!: HTMLElement;

  /**
   * Mandatory for dismissible variant only. Sibling element that is resized when the drawer opens/closes.
   */
  @query('.mdc-drawer-app-content')
  protected appContent!: HTMLElement;

  protected mdcFoundation!: MDCDismissibleDrawerFoundation;

  protected get mdcFoundationClass(): any {
    return this.type === 'modal' ? MDCModalDrawerFoundation : MDCDismissibleDrawerFoundation;
  }

  /**
   * Create the adapter for the `mdcFoundation`.
   * Override and return an object with the Adapter's functions implemented
   */
  protected createAdapter(): MDCDrawerAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      elementHasClass: (element: HTMLElement, className: string) => element.classList.contains(className),
      saveFocus: () => {
        // Note, casting to avoid cumbersome runtime check.
        this._previousFocus = (this.getRootNode() as any as DocumentOrShadowRoot).activeElement as HTMLElement | null;
      },
      restoreFocus: () => {
        const previousFocus = this._previousFocus && this._previousFocus.focus;
        if (previousFocus) {
          this._previousFocus!.focus();
        }
      },
      notifyClose: () => {
        this.open = false;
        emit(this, EVENTS.closed, {}, true);
      },
      notifyOpen: () => {
        this.open = true;
        emit(this, EVENTS.opened, {}, true);
      },
      // TODO(sorvell): Implement list focusing integration.
      focusActiveNavigationItem: () => {
      },
      trapFocus: () => {
        document.$blockingElements.push(this);
        this.appContent.inert = true;
      },
      releaseFocus: () => {
        document.$blockingElements.remove(this);
        this.appContent.inert = false;
      },
    }
  }

  protected _previousFocus: HTMLElement | null = null;

  protected _handleScrimClick() {
    if (this.mdcFoundation instanceof MDCModalDrawerFoundation) {
      this.mdcFoundation.handleScrimClick();
    }
  };

  /**
   * Optional. Default value is false. If present, indicates that the drawer is in the open position.
   */
  @observer(function (this: Drawer, value: boolean) {
    if (this.type === '') {
      return;
    }
    if (value) {
      this.mdcFoundation.open();
    } else {
      this.mdcFoundation.close();
    }
  })
  @property({ type: Boolean, reflect: true })
  open = false;

  /**
   * Optional. Default value is false. If present, indicates that a non-scrollable element exists at the top of the drawer.
   */
  @property({ type: Boolean })
  hasHeader = false;

  /**
   * Optional. Use this property to set any of the following variants: dismissible or modal
   */
  @property({ reflect: true })
  type = '';

  static styles = style;

  /**
   * Used to render the lit-html TemplateResult to the element's DOM
   */
  render() {
    const dismissible = this.type === 'dismissible' || this.type === 'modal';
    const modal = this.type === 'modal';
    const header = this.hasHeader ? html`
      <div class="mdc-drawer__header">
        <h3 class="mdc-drawer__title">
          <slot name="title"></slot>
        </h3>
        <h6 class="mdc-drawer__subtitle">
          <slot name="subtitle"></slot>
        </h6>
        <slot name="header"></slot>
      </div>
      ` : '';
    return html`
      <aside class="mdc-drawer
                ${classMap({ 'mdc-drawer--dismissible': dismissible, 'mdc-drawer--modal': modal })}">
        ${header}
        <div class="mdc-drawer__content">
          <slot></slot>
        </div>
      </aside>
      ${modal ? html`<div class="mdc-drawer-scrim" @click="${this._handleScrimClick}"></div>` : ''}
      <div class="mdc-drawer-app-content">
        <slot name="appContent"></slot>
      </div>
      `;
  }

  /**
   * Invoked when the element is first updated. 
   * Implement to perform one time work on the element after update.
   * Note, we avoid calling `super.firstUpdated()` to control when `createFoundation()` is called.
   */
  firstUpdated() {
    this.mdcRoot.addEventListener('keydown', (e) => this.mdcFoundation.handleKeydown(e));
    this.mdcRoot.addEventListener('transitionend', (e) => this.mdcFoundation.handleTransitionEnd(e));
  }

  /**
   * This method is invoked whenever the drawer is updated
   * @param _changedProperties Map of changed properties with old values
   */
  updated(_changedProperties: PropertyValues) {
    if (_changedProperties.has('type')) {
      this.createFoundation();
    }
  }
}
