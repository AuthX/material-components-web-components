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
  html,
  property,
  observer,
  query,
  customElement,
  classMap,
  SpecificEventListener,
  addHasRemoveClass,
  emit
} from '@authentic/mwc-base/form-element';
import { repeat } from 'lit-html/directives/repeat';
import MDCSliderFoundation from '@material/slider/foundation';
import { MDCSliderAdapter } from '@material/slider/adapter';
// TODO(walterrojas): Needs reevaluation in order to move the polyfills externally
import ResizeObserver from 'resize-observer-polyfill';

import { style } from './mwc-slider-css';

export const EVENTS = {
  change: 'change',
  input: 'input',
};

declare global {
  interface HTMLElementTagNameMap {
    'mwc-slider': Slider;
  }
}

@customElement('mwc-slider' as any)
export class Slider extends FormElement {
  protected mdcFoundation!: MDCSliderFoundation;

  protected readonly mdcFoundationClass = MDCSliderFoundation;

  @query('.mdc-slider')
  protected mdcRoot!: HTMLElement

  @query('.mdc-slider')
  protected formElement!: HTMLElement;

  @query('.mdc-slider__thumb-container')
  protected thumbContainer!: HTMLElement;

  @query('.mdc-slider__track')
  protected trackElement!: HTMLElement;

  @query('.mdc-slider__pin-value-marker')
  protected pinMarker!: HTMLElement;

  @query('.mdc-slider__track-marker-container')
  protected trackMarkerContainer!: HTMLElement;

  /**
   * Optional. Setter/getter for the slider's name
   */
  @property({ type: String })
  name = ''

  /**
   * Optional. Default value is 0. The current value of the slider. 
   * Changing this will update the slider's value.
   */
  @property({ type: Number })
  @observer(function (this: Slider, value: number) {
    this.mdcFoundation.setValue(value);
  })
  value = 0;

  /**
   * Optional. Default value is 0. The minimum value a slider can have. 
   * Values set programmatically will be clamped to this minimum value. 
   * Changing this property will update the slider's value if it is lower than the new minimum
   */
  @property({ type: Number })
  @observer(function (this: Slider, value: number) {
    this.mdcFoundation.setMin(value);
  })
  min = 0;

  /**
   * Optional. Default value is 100. The maximum value a slider can have. 
   * Values set programmatically will be clamped to this maximum value. 
   * Changing this property will update the slider's value if it is greater than the new maximum
   */
  @property({ type: Number })
  @observer(function (this: Slider, value: number) {
    this.mdcFoundation.setMax(value);
  })
  max = 100;

  /**
   * Optional. Default value is 0. 
   * Specifies the increments at which a slider value can be set. 
   * Can be any positive number, or 0 for no step. 
   * Changing this property will update the slider's value to be quantized along the new step increments
   */
  @property({ type: Number })
  @observer(function (this: Slider, value: number) {
    this.mdcFoundation.setStep(value);
  })
  step = 0;

  /**
   * Optional. Default value is false. Used to sets the slider's disabled state
   */
  @property({ type: Boolean, reflect: true })
  @observer(function (this: Slider, value: boolean) {
    this.mdcFoundation.setDisabled(value);
  })
  disabled = false;

  
  /**
   * Optional. Default value is false. Discrete sliders are required to have a positive step value other than 0. 
   * If a step value of 0 is provided, or no value is provided, the step value will default to 1.
   */
  @property({ type: Boolean, reflect: true })
  discrete = false;

  /**
   * Optional. Default value is false. Use it along with 'discrete' property to displays the value in a container above the pin when the slider is active.
   */
  @property({ type: Boolean, reflect: true })
  @observer(function (this: Slider) {
    this.mdcFoundation.setupTrackMarker();
  })
  markers = false;

  /**
   * Optional. Default value is 0. Use to set up the number of markers on a discrete slider
   */
  @property({ type: Number })
  protected _numMarkers = 0;

  static styles = style;

  /**
   * Used to render the lit-html TemplateResult for a discrete pin
   */
  discretePin() {
    return html`
      <div class="mdc-slider__pin">
        <span class="mdc-slider__pin-value-marker"></span>
      </div>
    `;
  }

  /**
   * Used to render the lit-html TemplateResult for discrete markers
   */
  discreteMarkers(count) {
    return html`
      <div class="mdc-slider__track-marker-container">
        ${repeat(new Array(count), () => html`<div class="mdc-slider__track-marker"></div>`)}
      </div>
    `;
  }

  /**
   * Used to define de Slider's list of classes 
   */
  sliderClass() {
    return classMap({
      'mdc-slider--discrete': this.discrete,
      'mdc-slider--display-markers': this.markers && this.discrete,
    });
  }

  // TODO(sorvell) #css: needs a default width
  /**
   * Used to render the lit-html TemplateResult to the element's DOM
   */
  render() {
    const { value, min, max, step, disabled, discrete, markers, _numMarkers } = this;
    return html`
      <div class="mdc-slider ${this.sliderClass()}" tabindex="0" role="slider" aria-valuemin="${min}" aria-valuemax="${max}"
        aria-valuenow="${value}" aria-disabled="${disabled}" data-step="${step}">
        <div class="mdc-slider__track-container">
          <div class="mdc-slider__track"></div>
          ${discrete && markers ? this.discreteMarkers(_numMarkers) : ''}
        </div>
        <div class="mdc-slider__thumb-container">
          <!-- TODO: use cache() directive -->
          ${discrete ? this.discretePin() : ''}
          <svg class="mdc-slider__thumb" width="21" height="21">
            <circle cx="10.5" cy="10.5" r="7.875"></circle>
          </svg>
          <div class="mdc-slider__focus-ring"></div>
        </div>
      </div>`;
  }

  /**
   * Invoked when the element is first updated. Implement to perform one time
   * work on the element after update.
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * @param _changedProperties Map of changed properties with old values
   */
  firstUpdated() {
    super.firstUpdated();

    this.updateComplete
      .then(() => {
        const ro = new ResizeObserver(() => this._handleResizeObserver());
        ro.observe(this.mdcRoot);
      });
  }

  /**
   * Handles the resize of the Slider's mdcRoot 
   */
  protected _handleResizeObserver() {
    this.layout();
  }

  /**
   * Create the adapter for the `mdcFoundation`.
   * Override and return an object with the Adapter's functions implemented
   */
  protected createAdapter(): MDCSliderAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      getAttribute: (name: string) => this.mdcRoot.getAttribute(name),
      setAttribute: (name: string, value: string) => this.mdcRoot.setAttribute(name, value),
      removeAttribute: (name: string) => this.mdcRoot.removeAttribute(name),
      computeBoundingRect: () => this.mdcRoot.getBoundingClientRect(),
      getTabIndex: () => this.mdcRoot.tabIndex,
      registerInteractionHandler: (type: string, handler: any) =>
        this.mdcRoot.addEventListener(type, handler),
      deregisterInteractionHandler: (type: string, handler: any) =>
        this.mdcRoot.removeEventListener(type, handler),
      registerThumbContainerInteractionHandler: (type: string, handler: any) =>
        this.thumbContainer.addEventListener(type, handler),
      deregisterThumbContainerInteractionHandler: (type: string, handler: any) =>
        this.thumbContainer.removeEventListener(type, handler),
      registerBodyInteractionHandler: (type: string, handler: any) =>
        document.body.addEventListener(type, handler),
      deregisterBodyInteractionHandler: (type: string, handler: any) =>
        document.body.removeEventListener(type, handler),
      registerResizeHandler: (handler: SpecificEventListener<'resize'>) =>
        window.addEventListener('resize', handler),
      deregisterResizeHandler: (handler: SpecificEventListener<'resize'>) =>
        window.removeEventListener('resize', handler),
      notifyInput: () => {
        const value = this.mdcFoundation.getValue();
        if (value !== this.value) {
          this.value = value;
          emit(this, EVENTS.input, this, true);
        }
      },
      notifyChange: () => {
        emit(this, EVENTS.change, this, true);
      },
      setThumbContainerStyleProperty: (propertyName: string, value: string) =>
        this.thumbContainer.style.setProperty(propertyName, value),
      setTrackStyleProperty: (propertyName: string, value: string) =>
        this.trackElement.style.setProperty(propertyName, value),
      setMarkerValue: (value: number) => this.pinMarker.innerText = value.toString(),
      appendTrackMarkers: (numMarkers: number) => this._numMarkers = numMarkers,
      removeTrackMarkers: () => { },
      setLastTrackMarkersStyleProperty: (propertyName: string, value: string) =>
        // We remove and append new nodes, thus, the last track marker must be dynamically found.
        (this.mdcRoot.querySelector('.mdc-slider__track-marker:last-child') as HTMLElement).
          style.setProperty(propertyName, value),
      isRTL: () => getComputedStyle(this.mdcRoot).direction === 'rtl',
    };
  }

  /**
   * Recomputes the dimensions and re-lays out the component. 
   * This should be called if the dimensions of the slider itself or any of its parent elements change programmatically 
   * (it is called automatically on resize)
   */
  layout() {
    this.mdcFoundation.layout();
  }
}
