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
  customElement,
  query,
  html,
  property,
  observer
} from "@authentic/mwc-base/base-element.js";
import { LitElement } from "lit-element";
import "@authentic/mwc-icon/mwc-icon-font";
import "@authentic/mwc-ripple/mwc-ripple";

import { style } from "./mwc-list-item-css.js";
import { TemplateResult } from "lit-html";

declare global {
  interface HTMLElementTagNameMap {
    "mwc-list-item": ListItem;
  }
}

@customElement("mwc-list-item" as any)
export class ListItem extends LitElement {
  protected mdcRootPosition: any;

  @property({ type: Boolean })
  protected accordionIsOpen = false;

  @query(".mdc-list-item__modal-content")
  protected modalContent!: HTMLElement;

  @query(".mdc-list-item__modal-wrapper")
  protected wrapper!: HTMLElement;

  @query(".mdc-list-item__invisible-block")
  protected invisibleBlock!: HTMLElement;

  @query(".mdc-list-item")
  protected mdcRoot!: HTMLElement;

  @property({ type: Boolean })
  public accordion = false;

  @property({ type: Boolean })
  public modal = false;

  @property({ type: String })
  public value = "";

  @property({ type: String })
  public label = "";

  @property({ type: String })
  public icon = "";

  @property({ type: Number })
  public tabindex = 0;

  @property({ type: Boolean })
  public leading = 0;

  @property({ type: Boolean })
  @observer(function(this: ListItem, value: Boolean) {
    this.setAttribute("aria-disabled", String(value));
  })
  disabled = false;

  get classList() {
    return this.mdcRoot.classList;
  }

  get setAttribute() {
    return this.mdcRoot ? this.mdcRoot.setAttribute : () => {};
  }

  static styles = style;

  protected closeModal(e): void {
    if (this.modal) {
      this.wrapper.classList.remove("mdc-list-item__modal-wrapper--open");
      this.modalContent.style.transform = "translateY(0)";

      setTimeout(() => {
        this.modalContent.style.top = "0";

        this.mdcRoot.classList.remove("mdc-list-item--modal");
        this.invisibleBlock.classList.remove(
          "mdc-list-item__invisible-block--modal"
        );
        this.lockScrollFor("body", false);
      }, 400);
    }

    e.stopPropagation();
  }

  firstUpdated() {
    this.mdcRootPosition = this.mdcRoot.getBoundingClientRect();
  }

  focus() {
    this.mdcRoot.focus();
  }

  protected lockScrollFor(element: string, status: boolean): void {
    const el: HTMLElement | null = document.querySelector(element);

    if (el) {
      el.style.height = status ? "100%" : "auto";
      el.style.overflow = status ? "hidden" : "auto";
    }
  }

  protected openModal(): void {
    if (this.modal) {
      this.lockScrollFor("body", true);

      setTimeout(() => {
        this.mdcRoot.classList.add("mdc-list-item--modal");
        this.wrapper.classList.add("mdc-list-item__modal-wrapper--open");
        this.invisibleBlock.classList.add(
          "mdc-list-item__invisible-block--modal"
        );

        this.modalContent.style.top = `${this.mdcRootPosition.top}px`;
        this.modalContent.style.transform = `translateY(-${
          this.mdcRootPosition.top
        }px)`;
      }, 170);
    }
  }

  render() {
    const { disabled, tabindex } = this;

    return html`
      <span class="mdc-list-item__invisible-block"></span>
      <div
        class="mdc-list-item "
        role="menuitem"
        @click="${this.openModal}"
        tabindex="${tabindex}"
        aria-disabled="${this.modal ? true : disabled}"
      >
        ${this.accordion
          ? html`
              <span
                class="material-icons mdc-chip__icon mdc-list-item__btn-expand"
                @click="${this.toggleList}"
              >
                ${this.accordionIsOpen ? "expand_less" : "expand_more"}
              </span>
            `
          : null}
        ${this._renderLeading()} ${this.label || ""}
        <slot name="text"></slot>
        <span class="mdc-list-item__text" @click="${this.toggleList}">
          <span class="mdc-list-item__primary-text">
            <slot name="primary-text"></slot>
          </span>
          <span class="mdc-list-item__secondary-text">
            <slot name="secondary-text"></slot>
          </span>
        </span>
        <span class="mdc-list-item__meta">
          <slot name="meta"></slot>
        </span>

        ${this.modal
          ? html`
              <div class="mdc-list-item__modal-wrapper">
                <div class="mdc-list-item__modal-content">
                  <div>
                    <span
                      class="mdc-list-item__modal-close"
                      @click="${this.closeModal}"
                    ></span>
                    <slot name="content"></slot>
                  </div>
                </div>
              </div>
            `
          : null}
        ${this.accordion
          ? html`
              <div class="mdc-list-item__accordion-content">
                <div
                  class="mdc-list-item__accordion-content-wrapper ${this.leading
                    ? "mdc-list-item__accordion-content-wrapper--aligned"
                    : ""}"
                >
                  <slot name="content"></slot>
                </div>
              </div>
            `
          : null}

        <slot></slot>
        ${this.modal
          ? null
          : html`<mwc-ripple></mwc-ripple>`
        }
      </div>
    `;
  }

  _renderLeading(): TemplateResult | string {
    if (this.leading) {
      return html`
        <span class="mdc-list-item__graphic">
          <slot name="graphic"></slot>
        </span>
      `;
    }

    if (this.icon) {
      return html`
        <span class="mdc-list-item__graphic material-icons">
          ${this.icon}
        </span>
      `;
    }

    return "";
  }

  protected toggleList() {
    if (this.accordion) {
      this.accordionIsOpen = !this.accordionIsOpen;
      this.mdcRoot.classList.toggle("mdc-list-item--accordion");
    }
  }
}
