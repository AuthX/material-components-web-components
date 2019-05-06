import {
  BaseElement,
  customElement,
  html,
  query,
  property,
  queryAll,
  classMap,
  observer,
  TemplateResult
} from '@authentic/mwc-base/base-element'
import { emit, findAssignedElements, addHasRemoveClass } from '@authentic/mwc-base/utils'
import { MDCDialogFoundation } from '@material/dialog/foundation'
import { MDCDialogAdapter } from '@material/dialog/adapter'
import { Button as MWCButton } from '@authentic/mwc-button'
import { ripple } from '@authentic/mwc-ripple/ripple-directive'
import { closest, matches } from '@material/dom/ponyfill'
import { strings } from '@material/dialog/constants'
import { styleMap } from 'lit-html/directives/style-map'

// Temporal solution due to focus-trap incompatibility
import { areTopsMisaligned, isScrollable } from './util'

import { style } from './mwc-dialog-css'

const LAYOUT_EVENTS = ['resize', 'orientationchange']

declare global {
  interface HTMLElementTagNameMap {
    'mwc-dialog': Dialog;
  }

  interface Document {
    $blockingElements: {
      push(HTMLElement): void;
      remove(HTMLElement): Boolean;
    }
  }
}

@customElement('mwc-dialog' as any)
export class Dialog extends BaseElement {
  @query('.mdc-dialog')
  protected mdcRoot!: HTMLElement;

  @query('.mdc-dialog__container')
  protected containerEl!: HTMLElement;

  @query('.mdc-dialog__content')
  protected contentEl!: HTMLElement;

  @query('.mdc-dialog__scrim')
  protected scrimEl!: HTMLElement;

  @queryAll('[data-mdc-dialog-action]')
  protected buttons!: MWCButton[];

  @query('slot[name="footer"]')
  protected footerSlot!: HTMLSlotElement;

  @property({ type: String })
  public headerLabel = '';

  @property({ type: String })
  public acceptLabel = 'accept';

  @property({ type: String })
  public declineLabel = 'cancel';

  @property({ type: String })
  public defaultAction = 'accept';

  @property({ type: Boolean })
  public scrollable = false;

  @property({ type: Boolean })
  public popover = false;

  @property({ type: String })
  public popoverSize = 'large';

  @property({ type: String })
  protected popoverStyles = {};

  @property({ type: String })
  @observer(function (this: Dialog, value: string) {
    if (this.mdcFoundation) {
      this.mdcFoundation.setEscapeKeyAction(value)
    }
  })
  public escapeKeyAction = strings.CLOSE_ACTION;

  @property({ type: String })
  @observer(function (this: Dialog, value: string) {
    if (this.mdcFoundation) {
      this.mdcFoundation.setScrimClickAction(value)
    }
  })
  public scrimClickAction = strings.CLOSE_ACTION;

  @property({ type: Boolean })
  @observer(function (this: Dialog, value: boolean) {
    if (this.mdcFoundation) {
      this.mdcFoundation.setAutoStackButtons(value)
    }
  })
  public autoStackButtons = true;

  @property({ type: String })
  protected for = '';

  @property({ type: Boolean })
  protected openingPopover = false;

  protected controller_: HTMLElement | null = this.mdcRoot;

  public get isOpen(): boolean {
    return this.mdcFoundation.isOpen()
  }

  protected get _buttons(): MWCButton[] {
    const actionButtons = [...this.buttons] || []
    const slottedButtons = this.footerSlot
      ? findAssignedElements(this.footerSlot, '*')
        .filter(node => node instanceof MWCButton)
      : []

    return [
      ...actionButtons,
      ...slottedButtons
    ] as MWCButton[]
  }

  protected get _defaultButton() {
    return this._buttons.find(item => item.hasAttribute('data-mdc-dialog-default-action'))
  }

  // Commented due to focus-trap incompatibility
  // protected _focusTrap!: FocusTrap;

  protected _handleInteraction = this._onInteraction.bind(this) as EventListenerOrEventListenerObject;

  protected _handleDocumentKeydown = this._onDocumentKeydown.bind(this) as EventListenerOrEventListenerObject;

  protected _handleLayout = this._onLayout.bind(this) as EventListenerOrEventListenerObject;

  protected _handleOpening = this._onOpening.bind(this) as EventListenerOrEventListenerObject;

  protected _handleClosing = this._onClosing.bind(this) as EventListenerOrEventListenerObject;

  protected mdcFoundation!: MDCDialogFoundation;

  protected readonly mdcFoundationClass = MDCDialogFoundation;

  protected calcPopoverPosition(): object {
    const gap = 30;
    this.controller_ = this.for === '' ? this.parentElement : this.parentElement!.querySelector(`#${this.for}`)

    this.mdcRoot.classList.add('mdc-dialog--popover-show')
    const rootSettings = this.mdcRoot.getBoundingClientRect()
    const controllerSettings = this.controller_ != null ? this.controller_.getBoundingClientRect() : {} as DOMRect
    this.mdcRoot.classList.remove('mdc-dialog--popover-show')

    if (this.isPhone) {
      return {
        left: 0,
        bottom: 0,
        width: '100%',
        top: 'auto',
        right: 'auto',
        'max-width': '100%'
      }
    }

    const leftMargin = controllerSettings.left
    const rightMargin = window.innerWidth - leftMargin
    const topMargin = controllerSettings.top
    const bottomMargin = window.innerHeight - topMargin 

    let leftPosition = 0
    let topPosition = 0
    let transformOriginX = ''
    let transformOriginY = ''

    leftPosition = leftMargin + controllerSettings.width + gap
    transformOriginX = 'left'
    if (this.thereIsMoreSpaceOnTheLeftSide(rightMargin, leftMargin)) {
      leftPosition = +controllerSettings.left - rootSettings.width - gap
      transformOriginX = 'right'
    }

    topPosition = controllerSettings.top - rootSettings.height / 2 + controllerSettings.height / 2
    transformOriginY = 'bottom'
    if (this.halfPopoverDoesntFitOnBottom(bottomMargin, rootSettings.height, gap)) {
      topPosition = controllerSettings.bottom - rootSettings.height
    }
    if (this.halfPopoverDoesntFitOnTop(topMargin, rootSettings.height, gap)) {
      transformOriginY = 'top'
      topPosition = controllerSettings.top
    }

    return { top: topPosition + 'px', left: leftPosition + 'px', transformOrigin: `${transformOriginX} ${transformOriginY}` }
  }

  protected createAdapter(): MDCDialogAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      addBodyClass: className => document.body.classList.add(className),
      areButtonsStacked: () => areTopsMisaligned(this._buttons),
      clickDefaultButton: () => this._defaultButton && this._defaultButton.click(),
      eventTargetMatches: (target, selector) => target ? matches(target as Element, selector) : false,
      getActionFromEvent: (evt: Event) => {
        if (!evt.target) {
          return ''
        }
        const element = closest(evt.target as Element, `[${strings.ACTION_ATTRIBUTE}]`)
        return element && element.getAttribute(strings.ACTION_ATTRIBUTE)
      },
      isContentScrollable: () => isScrollable(this.contentEl) && this.scrollable,
      notifyClosed: action => emit(this, strings.CLOSED_EVENT, action ? { action } : {}),
      notifyClosing: action => emit(this, strings.CLOSING_EVENT, action ? { action } : {}),
      notifyOpened: () => emit(this, strings.OPENED_EVENT, {}),
      notifyOpening: () => emit(this, strings.OPENING_EVENT, {}),
      releaseFocus: () => {
        // document.$blockingElements.remove(this)
      },
      removeBodyClass: className => document.body.classList.remove(className),
      reverseButtons: () => {
        this._buttons.reverse()
        this._buttons.forEach((button) => {
          button.parentElement!.appendChild(button)
        })
      },
      trapFocus: () => {
        // document.$blockingElements.push(this)

        if (this._defaultButton) {
          this._defaultButton.focus()
        }
      }
    }
  }

  protected thereIsMoreSpaceOnTheLeftSide(rightMargin: number, leftMargin: number): boolean {
    return rightMargin < leftMargin;
  }

  protected halfPopoverDoesntFitOnTop(topMargin: number, rootSettingsHeight: number, gap: number): boolean {
    return topMargin < ((rootSettingsHeight) / 2 + (gap * 2))
  }

  protected halfPopoverDoesntFitOnBottom(bottomMargin: number, rootSettingsHeight: number, gap: number): boolean {
    return bottomMargin < ((rootSettingsHeight / 2) + (gap * 2))
  }
  
  protected get isPhone(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 479;
  }

  static styles = style;

  protected _renderButton(label: String, action: String): TemplateResult {
    const classes = {
      'mdc-button': true,
      'mdc-dialog__button': true
    }

    return html`
      <button
        type="button"
        class="${classMap(classes)}"
        data-mdc-dialog-action="${action}"
        ?data-mdc-dialog-default-action="${this.defaultAction === action}"
        .ripple="${ripple({ unbounded: false })}"
      >
        <span class="mdc-button__label">${label}</span>
      </button>
    `
  }

  protected render(): TemplateResult {
    const { headerLabel, acceptLabel, declineLabel } = this

    return html`
      <aside
        class="mdc-dialog
          ${this.popover ? ' mdc-dialog--popover' : ''}
          ${this.popover && this.popoverSize ? ` mdc-dialog--popover-${this.popoverSize}` : ''}
          ${this.openingPopover ? ' mdc-dialog--pre-open' : ''}
        "
        style="${styleMap(this.popoverStyles)}"
        role="alertdialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-content"
      >
        <div class="mdc-dialog_container">
          <div class="mdc-dialog__surface">
            <header class="mdc-dialog__header">
              <h2 id="dialog-title" class="mdc-dialog__title">${headerLabel}</h2>
              <slot name="header"></slot>
            </header>
            <section id="dialog-content" class="mdc-dialog__content">
              <slot></slot>
            </section>
            <footer class="mdc-dialog__actions">
              <slot name="footer"></slot>
              ${this._renderButton(declineLabel, 'cancel')}
              ${this._renderButton(acceptLabel, 'accept')}
            </footer>
          </div>
        </div>
        <div class="mdc-dialog__scrim"></div>
      </aside>
    `
  }

  public firstUpdated(): void {
    super.firstUpdated()

    this.mdcRoot.addEventListener('click', this._handleInteraction)
    this.addEventListener('keydown', this._handleInteraction)
    this.addEventListener(strings.OPENING_EVENT, this._handleOpening)
    this.addEventListener(strings.CLOSING_EVENT, this._handleClosing)
  }

  protected open(): void {
    if (this.popover) {
      this.popoverStyles = this.calcPopoverPosition()
    }

    this.openingPopover = true;

    setTimeout(() => {
      this.mdcFoundation.open()
    }, 100)
  }

  protected close(action: string = ''): void {
    this.mdcFoundation.close(action)
    
    setTimeout(() => {
      this.openingPopover = false;
    }, 300)

  }

  protected _onInteraction(evt: MouseEvent | KeyboardEvent): void {
    this.mdcFoundation.handleInteraction(evt)
  }

  protected _onDocumentKeydown(evt: KeyboardEvent): void {
    this.mdcFoundation.handleDocumentKeydown(evt)
  }

  protected _onLayout(): void {
    this.mdcFoundation.layout()
  }

  protected _onOpening(): void {
    LAYOUT_EVENTS.forEach(evtType => window.addEventListener(evtType, this._handleLayout))
    document.addEventListener('keydown', this._handleDocumentKeydown)
  }

  protected _onClosing(): void {
    LAYOUT_EVENTS.forEach(evtType => window.removeEventListener(evtType, this._handleLayout))
    document.removeEventListener('keydown', this._handleDocumentKeydown)
  }
}
