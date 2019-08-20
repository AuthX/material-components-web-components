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
import { query, property, LitElement, customElement, html, svg, PropertyValues } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { observer } from '@material/mwc-base/observer';
import { cssClasses } from './constants';
import MDCCircularProgressFoundation from './foundation';

import { style } from './mwc-circular-progress-css';

export const getRelativeValue = (value, min, max) => {
  const clampedValue = Math.min(Math.max(min, value), max);
  return (clampedValue - min) / (max - min);
}

export const easeOut = t => {
  t = getRelativeValue(t, 0, 1);
  // https://gist.github.com/gre/1650294
  t = (t -= 1) * t * t + 1;

  return t;
}

export const easeIn = t => {
  return t * t;
}

declare global {
  interface HTMLElementTagNameMap {
    'mwc-circular-progress': CircularProgress;
  }
}

@customElement('mwc-circular-progress' as any)
export class CircularProgress extends LitElement {
  protected mdcFoundation!: MDCCircularProgressFoundation;
  protected SIZE = 44;

  /**
   * Root element for circular-progress component.
   */
  @query('.mwc-circular-progress')
  protected mdcRoot!: HTMLElement;

  @query('circle#progress')
  protected circleEl!: HTMLElement;

  @query('.mdc-circular-progress__bar')
  protected bar!: HTMLElement;

  /**
   * Optional. This property customizes that instance of the component, overriding the theme color
   */
  @property({ type: String })
  @observer(function (this: CircularProgress, value: String) {
    this.mdcFoundation.setColor(value);
  })
  color;

  /**
   * Optional. Default value sets to false. This property is use to applies the "Theme Secondary" color to the indicator
   */
  @property({ type: Boolean })
  secondary = false;

  /**
   * Optional. Default value is 44. A number representing the size of the circle
   */
  @property({ type: Number })
  size = 44;

  /**
   * Optional. Default value is 3.6. A number representing thickness of the circle
   */
  @property({ type: Number })
  thickness = 4;

  /**
   * Optional. Default value sets to false. Allows the indicator to be set to a defined state of progress, from 0 to 100%
   */
  @property({ type: Boolean })
  fixed = false;

  /**
   * Optional. Default value sets to false. It disables the shrink animation of the indicator. This only works if the variant is indeterminate.
   */
  @property({ type: Boolean })
  disableShrink = false;

  /**
   * Optional. Default value sets to false. Use along with progress property to define how long a process will take
   */
  @property({ type: Boolean, reflect: true })
  @observer(function (this: CircularProgress, value: boolean) {
    this.mdcFoundation.setDeterminate(value || this.fixed);
  })
  determinate = false;

  /**
   * Optional. Default value is 0. Sets the progress indicator with values between 0 and 100
   */
  @property({ type: Number })
  @observer(function (this: CircularProgress, value: number) {
    this.mdcFoundation.setProgress(value);

    if (this.determinate) {
      this.setAttribute('aria-valuenow', Math.round(value).toString());
    }
  })
  progress = 0;

  /**
   * Optional. Default value sets to false. Use to hides the circular progress indicator.
   */
  @property({ type: Boolean, reflect: true })
  @observer(function (this: CircularProgress, value: boolean) {
    if (value) {
      this.mdcFoundation.close();
    } else {
      this.mdcFoundation.open();
    }
  })
  closed = false;

  static styles = style;

  /**
   * Used to render the lit-html TemplateResult to the element's DOM
   */
  render() {
    const { fixed, determinate, closed, SIZE, thickness, disableShrink } = this;

    const classes = {
      'mwc-circular-progress': true,
      [cssClasses.FIXED_CLASS]: fixed,
      [cssClasses.DETERMINATE_CLASS]: determinate && !fixed,
      [cssClasses.INDETERMINATE_CLASS]: !determinate && !fixed,
      [cssClasses.DISABLE_SHRINK_CLASS]: disableShrink,
      [cssClasses.CLOSED_CLASS]: closed,
      'mwc-circular-progress--primary': !this.secondary && !this.color,
      'mwc-circular-progress--secondary': this.secondary && !this.color,
    };

    return html`
      <div role="progressbar" class="${classMap(classes)}">
        ${svg`
          <svg viewBox="${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}">
            <circle class="mwc-circular-progress__bg" color="#efefed" cx="${SIZE}" cy="${SIZE}" r="${(SIZE - thickness) / 2}" fill="none" stroke-width="${thickness}" />
            <circle id="progress" cx="${SIZE}" cy="${SIZE}" r="${(SIZE - thickness) / 2}" fill="none" stroke-width="${thickness}" />
          </svg>
        `}
      </div>`;
  }

  /**
   * Create the adapter for the `mdcFoundation`.
   *
   * To extend, spread the super class version into you class:
   * `{...super.createAdapter(), foo() => {}}`
   */
  protected createAdapter() {
    return {
      addClass: (className: string) => {
        this.mdcRoot.classList.add(className);
      },
      removeClass: (className: string) => {
        this.mdcRoot.classList.remove(className);
      },
      hasClass: (className: string) => {
        return this.mdcRoot.classList.contains(className);
      },
      setStyle: (el: HTMLElement, property: string, value: string) => {
        if (el) {
          el.style[property] = value;
        }
      },
      getElement: () => {
        return this.mdcRoot
      },
      getColor: () => {
        return this.color
      }
    };
  }

  /**
   * Create and attach the MDC Foundation to the instance
   */
  protected createFoundation() {
    if (this.mdcFoundation) {
      this.mdcFoundation.destroy();
    }
    this.mdcFoundation = new MDCCircularProgressFoundation(this.createAdapter());
    this.mdcFoundation.init();
  }

  /**
   * Invoked when the element is first updated. 
   * Implement to perform one time work on the element after update.
   */
  firstUpdated() {
    this.createFoundation();
  }

  /**
   * This method is invoked whenever the circular-progress is updated
   * @param _changedProperties Map of changed properties with old values
   */
  updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);

    const { fixed, determinate, SIZE, size, thickness, progress } = this;

    if (determinate || fixed) {
        const circumference = 2 * Math.PI * ((SIZE - thickness) / 2);
        const strokeDasharray = circumference.toFixed(3);
        const strokeDashoffset = fixed
          ? `${(((100 - progress) / 100) * circumference).toFixed(3)}px`
          : `${(easeIn((100 - progress) / 100) * circumference).toFixed(3)}px`;
        const transform = fixed
          ? 'rotate(-90deg)'
          : `rotate(${(easeOut(progress / 70) * 270).toFixed(3)}deg)`;

        this.mdcRoot.style.transform = transform;
        this.circleEl.style.strokeDasharray = strokeDasharray;
        this.circleEl.style.strokeDashoffset = strokeDashoffset;
    }

    this.mdcRoot.style.width = `${size}px`;
    this.mdcRoot.style.height = `${size}px`;
  }

  /**
   * Puts the component in the open state.
   */
  open() {
    this.closed = false;
  }

  /**
   * Puts the component in the closed state.
   */
  close() {
    this.closed = true;
  }
}
