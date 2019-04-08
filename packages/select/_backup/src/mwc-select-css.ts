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
import {css} from '@material/mwc-base/base-element';

export const style = css`/**
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
.mdc-floating-label {
  font-family: Roboto, sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-size: 1rem;
  line-height: 1.75rem;
  font-weight: 400;
  letter-spacing: 0.009375em;
  text-decoration: inherit;
  text-transform: inherit;
  position: absolute;
  /* @noflip */
  left: 0;
  /* @noflip */
  transform-origin: left top;
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  /* @alternate */
  line-height: 1.15rem;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: text;
  overflow: hidden;
  will-change: transform;
}
[dir=rtl] .mdc-floating-label, .mdc-floating-label[dir=rtl] {
  /* @noflip */
  right: 0;
  /* @noflip */
  left: auto;
  /* @noflip */
  transform-origin: right top;
  /* @noflip */
  text-align: right;
}

.mdc-floating-label--float-above {
  cursor: auto;
}

.mdc-floating-label--float-above {
  transform: translateY(-50%) scale(0.75);
}

.mdc-floating-label--shake {
  animation: mdc-floating-label-shake-float-above-standard 250ms 1;
}

@keyframes mdc-floating-label-shake-float-above-standard {
  0% {
    transform: translateX(calc(0 - 0%)) translateY(-50%) scale(0.75);
  }
  33% {
    animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
    transform: translateX(calc(4% - 0%)) translateY(-50%) scale(0.75);
  }
  66% {
    animation-timing-function: cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
    transform: translateX(calc(-4% - 0%)) translateY(-50%) scale(0.75);
  }
  100% {
    transform: translateX(calc(0 - 0%)) translateY(-50%) scale(0.75);
  }
}
.mdc-line-ripple {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  transform: scaleX(0);
  transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  z-index: 2;
}

.mdc-line-ripple--active {
  transform: scaleX(1);
  opacity: 1;
}

.mdc-line-ripple--deactivating {
  opacity: 0;
}

.mdc-notched-outline {
  display: flex;
  position: absolute;
  right: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  height: 100%;
  /* @noflip */
  text-align: left;
  pointer-events: none;
}
[dir=rtl] .mdc-notched-outline, .mdc-notched-outline[dir=rtl] {
  /* @noflip */
  text-align: right;
}
.mdc-notched-outline__leading, .mdc-notched-outline__notch, .mdc-notched-outline__trailing {
  box-sizing: border-box;
  height: 100%;
  transition: border 150ms cubic-bezier(0.4, 0, 0.2, 1);
  border-top: 1px solid;
  border-bottom: 1px solid;
  pointer-events: none;
}
.mdc-notched-outline__leading {
  /* @noflip */
  border-left: 1px solid;
  /* @noflip */
  border-right: none;
  width: 12px;
}
[dir=rtl] .mdc-notched-outline__leading, .mdc-notched-outline__leading[dir=rtl] {
  /* @noflip */
  border-left: none;
  /* @noflip */
  border-right: 1px solid;
}
.mdc-notched-outline__trailing {
  /* @noflip */
  border-left: none;
  /* @noflip */
  border-right: 1px solid;
  flex-grow: 1;
}
[dir=rtl] .mdc-notched-outline__trailing, .mdc-notched-outline__trailing[dir=rtl] {
  /* @noflip */
  border-left: 1px solid;
  /* @noflip */
  border-right: none;
}
.mdc-notched-outline__notch {
  flex: 0 0 auto;
  width: auto;
  max-width: calc(100% - 12px * 2);
}
.mdc-notched-outline .mdc-floating-label {
  display: inline-block;
  position: relative;
  top: 17px;
  bottom: auto;
  max-width: 100%;
}
.mdc-notched-outline .mdc-floating-label--float-above {
  text-overflow: clip;
}
.mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  max-width: calc(100% / .75);
}

.mdc-notched-outline--notched .mdc-notched-outline__notch {
  /* @noflip */
  padding-left: 0;
  /* @noflip */
  padding-right: 8px;
  border-top: none;
}
[dir=rtl] .mdc-notched-outline--notched .mdc-notched-outline__notch, .mdc-notched-outline--notched .mdc-notched-outline__notch[dir=rtl] {
  /* @noflip */
  padding-left: 8px;
  /* @noflip */
  padding-right: 0;
}

.mdc-notched-outline--no-label .mdc-notched-outline__notch {
  padding: 0;
}

@keyframes mdc-ripple-fg-radius-in {
  from {
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transform: translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1);
  }
  to {
    transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));
  }
}
@keyframes mdc-ripple-fg-opacity-in {
  from {
    animation-timing-function: linear;
    opacity: 0;
  }
  to {
    opacity: var(--mdc-ripple-fg-opacity, 0);
  }
}
@keyframes mdc-ripple-fg-opacity-out {
  from {
    animation-timing-function: linear;
    opacity: var(--mdc-ripple-fg-opacity, 0);
  }
  to {
    opacity: 0;
  }
}
.mdc-ripple-surface--test-edge-var-bug {
  --mdc-ripple-surface-test-edge-var: 1px solid #000;
  visibility: hidden;
}
.mdc-ripple-surface--test-edge-var-bug::before {
  border: var(--mdc-ripple-surface-test-edge-var);
}

:host {
  display: block;
  outline: none;
}

:host(:not([fullwidth])) {
  display: inline-block;
}

.mdc-select {
  --mdc-ripple-fg-size: 0;
  --mdc-ripple-left: 0;
  --mdc-ripple-top: 0;
  --mdc-ripple-fg-scale: 1;
  --mdc-ripple-fg-translate-end: 0;
  --mdc-ripple-fg-translate-start: 0;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  will-change: transform, opacity;
  border-radius: 4px 4px 0 0;
  background-image: url("data:image/svg+xml,%3Csvg%20width%3D%2210px%22%20height%3D%225px%22%20viewBox%3D%227%2010%2010%205%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cpolygon%20id%3D%22Shape%22%20stroke%3D%22none%22%20fill%3D%22%230%22%20fill-rule%3D%22evenodd%22%20opacity%3D%220.54%22%20points%3D%227%2010%2012%2015%2017%2010%22%3E%3C%2Fpolygon%3E%0A%3C%2Fsvg%3E");
  display: inline-flex;
  position: relative;
  box-sizing: border-box;
  height: 56px;
  overflow: hidden;
  will-change: opacity, transform, color;
  background-repeat: no-repeat;
  background-position: right 16px center;
}
.mdc-select::before, .mdc-select::after {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  content: "";
}
.mdc-select::before {
  transition: opacity 15ms linear, background-color 15ms linear;
  z-index: 1;
}
.mdc-select.mdc-ripple-upgraded::before {
  transform: scale(var(--mdc-ripple-fg-scale, 1));
}
.mdc-select.mdc-ripple-upgraded::after {
  top: 0;
  /* @noflip */
  left: 0;
  transform: scale(0);
  transform-origin: center center;
}
.mdc-select.mdc-ripple-upgraded--unbounded::after {
  top: var(--mdc-ripple-top, 0);
  /* @noflip */
  left: var(--mdc-ripple-left, 0);
}
.mdc-select.mdc-ripple-upgraded--foreground-activation::after {
  animation: mdc-ripple-fg-radius-in 225ms forwards, mdc-ripple-fg-opacity-in 75ms forwards;
}
.mdc-select.mdc-ripple-upgraded--foreground-deactivation::after {
  animation: mdc-ripple-fg-opacity-out 150ms;
  transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));
}
.mdc-select::before, .mdc-select::after {
  background-color: rgba(0, 0, 0, 0.87);
}
.mdc-select:hover::before {
  opacity: 0.04;
}
.mdc-select:not(.mdc-ripple-upgraded):focus::before, .mdc-select.mdc-ripple-upgraded--background-focused::before {
  transition-duration: 75ms;
  opacity: 0.12;
}
.mdc-select::before, .mdc-select::after {
  top: calc(50% - 100%);
  /* @noflip */
  left: calc(50% - 100%);
  width: 200%;
  height: 200%;
}
.mdc-select.mdc-ripple-upgraded::after {
  width: var(--mdc-ripple-fg-size, 100%);
  height: var(--mdc-ripple-fg-size, 100%);
}
.mdc-select:not(.mdc-select--disabled) .mdc-floating-label {
  color: rgba(0, 0, 0, 0.6);
}
.mdc-select:not(.mdc-select--disabled) ::slotted(.mdc-select__native-control),
.mdc-select:not(.mdc-select--disabled) .mdc-select__selected-text {
  color: rgba(0, 0, 0, 0.87);
}
.mdc-select ::slotted(.mdc-select__native-control),
.mdc-select .mdc-select__selected-text {
  caret-color: #6200ee;
  /* @alternate */
  caret-color: var(--mdc-theme-primary, #6200ee);
}
.mdc-select:not(.mdc-select--disabled):not(.mdc-select--outlined) ::slotted(.mdc-select__native-control),
.mdc-select:not(.mdc-select--disabled):not(.mdc-select--outlined) .mdc-select__selected-text {
  border-bottom-color: rgba(0, 0, 0, 0.42);
}
.mdc-select:not(.mdc-select--disabled):not(.mdc-select--outlined) ::slotted(.mdc-select__native-control:hover),
.mdc-select:not(.mdc-select--disabled):not(.mdc-select--outlined) .mdc-select__selected-text:hover {
  border-bottom-color: rgba(0, 0, 0, 0.87);
}
.mdc-select .mdc-line-ripple {
  background-color: #6200ee;
  /* @alternate */
  background-color: var(--mdc-theme-primary, #6200ee);
}
.mdc-select:not(.mdc-select--disabled) {
  border-bottom-color: rgba(0, 0, 0, 0.12);
}
.mdc-select:not(.mdc-select--disabled) {
  background-color: whitesmoke;
}
.mdc-select .mdc-floating-label {
  /* @noflip */
  left: 16px;
  /* @noflip */
  right: initial;
  bottom: 18px;
}
[dir=rtl] .mdc-select .mdc-floating-label, .mdc-select .mdc-floating-label[dir=rtl] {
  /* @noflip */
  left: initial;
  /* @noflip */
  right: 16px;
}
.mdc-select:not(.mdc-select--outlined) .mdc-floating-label {
  max-width: calc(100% - 60px);
}
.mdc-select.mdc-select--outlined .mdc-floating-label {
  max-width: calc(100% - 64px);
}
.mdc-select .mdc-floating-label--float-above {
  transform: translateY(-50%) scale(0.75);
}
.mdc-select .mdc-floating-label--shake {
  animation: mdc-floating-label-shake-float-above-select-box 250ms 1;
}
@keyframes mdc-floating-label-shake-float-above-select-box {
  0% {
    transform: translateX(calc(0 - 0%)) translateY(-50%) scale(0.75);
  }
  33% {
    animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
    transform: translateX(calc(4% - 0%)) translateY(-50%) scale(0.75);
  }
  66% {
    animation-timing-function: cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
    transform: translateX(calc(-4% - 0%)) translateY(-50%) scale(0.75);
  }
  100% {
    transform: translateX(calc(0 - 0%)) translateY(-50%) scale(0.75);
  }
}
.mdc-select:not(.mdc-select--disabled) + .mdc-select-helper-text {
  color: rgba(0, 0, 0, 0.6);
}
[dir=rtl] .mdc-select, .mdc-select[dir=rtl] {
  background-position: left 16px center;
}
.mdc-select .mdc-floating-label {
  /* @noflip */
  left: 12px;
  /* @noflip */
  right: initial;
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
[dir=rtl] .mdc-select .mdc-floating-label, .mdc-select .mdc-floating-label[dir=rtl] {
  /* @noflip */
  left: initial;
  /* @noflip */
  right: 12px;
}

::slotted(.mdc-select__native-control),
.mdc-select__selected-text {
  font-family: Roboto, sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-size: 1rem;
  line-height: 1.75rem;
  font-weight: 400;
  letter-spacing: 0.009375em;
  text-decoration: inherit;
  text-transform: inherit;
  align-self: flex-end;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 20px 48px 6px 12px;
  transition: opacity 180ms cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  border-bottom: 1px solid;
  border-radius: 0;
  background: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  text-align: left;
  cursor: default;
  -webkit-ser-select: none;
  -moz-ser-select: none;
  user-select: none;
}

::slotted(.mdc-select__native-control:focus),
.mdc-select__selected-text:focus {
  outline: none;
}

::slotted(.mdc-select__native-control:invalid),
.mdc-select__selected-text:invalid {
  box-shadow: none;
}

::slotted(.mdc-select__native-control:-webkit-autofill + .mdc-floating-label),
.mdc-select__selected-text:-webkit-autofill + .mdc-floating-label {
  transform: translateY(-50%) scale(0.75);
  cursor: auto;
}

.mdc-select--outlined {
  border: none;
  overflow: visible;
}
.mdc-select--outlined:not(.mdc-select--disabled) .mdc-notched-outline__leading,
.mdc-select--outlined:not(.mdc-select--disabled) .mdc-notched-outline__notch,
.mdc-select--outlined:not(.mdc-select--disabled) .mdc-notched-outline__trailing {
  border-color: rgba(0, 0, 0, 0.24);
}
.mdc-select--outlined:not(.mdc-select--disabled):not(.mdc-select--focused):hover .mdc-notched-outline .mdc-notched-outline__leading,
.mdc-select--outlined:not(.mdc-select--disabled):not(.mdc-select--focused):hover .mdc-notched-outline .mdc-notched-outline__notch,
.mdc-select--outlined:not(.mdc-select--disabled):not(.mdc-select--focused):hover .mdc-notched-outline .mdc-notched-outline__trailing {
  border-color: rgba(0, 0, 0, 0.87);
}
.mdc-select--outlined:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline__leading,
.mdc-select--outlined:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline__notch,
.mdc-select--outlined:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline__trailing {
  border-color: #6200ee;
  /* @alternate */
  border-color: var(--mdc-theme-primary, #6200ee);
}
.mdc-select--outlined .mdc-floating-label--float-above {
  transform: translateY(-130%) scale(0.75);
}
.mdc-select--outlined .mdc-floating-label--shake {
  animation: mdc-floating-label-shake-float-above-select-outlined 250ms 1;
}
.mdc-select--outlined .mdc-notched-outline {
  border-radius: 4px;
}
.mdc-select--outlined .mdc-notched-outline__idle {
  border-radius: 4px;
}
.mdc-select--outlined::before, .mdc-select--outlined::after {
  content: none;
}
.mdc-select--outlined:not(.mdc-select--disabled) {
  background-color: transparent;
}
.mdc-select--outlined ::slotted(.mdc-select__native-control),
.mdc-select--outlined .mdc-select__selected-text {
  display: flex;
  padding: 14px 48px 14px 16px;
  border: none !important;
  background-color: transparent;
  z-index: 1;
}
.mdc-select--outlined .mdc-floating-label {
  /* @noflip */
  left: 16px;
  /* @noflip */
  right: initial;
  width: auto;
}
[dir=rtl] .mdc-select--outlined .mdc-floating-label, .mdc-select--outlined .mdc-floating-label[dir=rtl] {
  /* @noflip */
  left: initial;
  /* @noflip */
  right: 16px;
}

.mdc-select--outlined.mdc-select--focused .mdc-notched-outline__leading,
.mdc-select--outlined.mdc-select--focused .mdc-notched-outline__notch,
.mdc-select--outlined.mdc-select--focused .mdc-notched-outline__trailing {
  border-width: 2px;
}
.mdc-select--outlined.mdc-select--focused + .mdc-select-helper-text:not(.mdc-select-helper-text--validation-msg) {
  opacity: 1;
}

.mdc-select--outlined.mdc-select--disabled {
  background-color: transparent;
}
.mdc-select--outlined.mdc-select--disabled .mdc-notched-outline__leading,
.mdc-select--outlined.mdc-select--disabled .mdc-notched-outline__notch,
.mdc-select--outlined.mdc-select--disabled .mdc-notched-outline__trailing {
  border-color: rgba(0, 0, 0, 0.06);
}
.mdc-select--outlined.mdc-select--disabled + .mdc-select-helper-text {
  color: rgba(0, 0, 0, 0.37);
}
.mdc-select--outlined.mdc-select--disabled ::slotted(.mdc-select__native-control),
.mdc-select--outlined.mdc-select--disabled .mdc-select__selected-text {
  border-bottom: none;
}

.mdc-select--outlined.mdc-select--dense {
  height: 48px;
}
.mdc-select--outlined.mdc-select--dense .mdc-floating-label--float-above {
  transform: translateY(-110%) scale(0.923);
}
.mdc-select--outlined.mdc-select--dense .mdc-floating-label--shake {
  animation: mdc-floating-label-shake-float-above-select-outlined-dense 250ms 1;
}
.mdc-select--outlined.mdc-select--dense ::slotted(.mdc-select__native-control),
.mdc-select--outlined.mdc-select--dense .mdc-select__selected-text {
  padding: 8px 48px 7px 12px;
}
.mdc-select--outlined.mdc-select--dense .mdc-floating-label {
  bottom: 16px;
}

.mdc-select--dense {
  height: 40px;
}
.mdc-select--dense .mdc-floating-label--float-above {
  transform: translateY(-70%) scale(0.923);
}
.mdc-select--dense .mdc-floating-label--shake {
  animation: mdc-floating-label-shake-float-above-select-dense 250ms 1;
}
.mdc-select--dense ::slotted(.mdc-select__native-control),
.mdc-select--dense .mdc-select__selected-text {
  padding: 12px 48px 12px 12px;
}
.mdc-select--dense .mdc-floating-label {
  font-size: 0.813rem;
  bottom: 14px;
}
.mdc-select--dense .mdc-floating-label.mdc-floating-label--float-above {
  display: none;
}

:host([required]) .mdc-floating-label::after {
  margin-left: 1px;
  content: "*";
}

.mdc-select--fullwidth {
  display: block;
  width: 100%;
}
.mdc-select--fullwidth::before, .mdc-select--fullwidth::after {
  content: none;
}
.mdc-select--fullwidth:not(.mdc-select--disabled) {
  background-color: transparent;
}
.mdc-select--fullwidth ::slotted(.mdc-select__native-control),
.mdc-select--fullwidth .mdc-select__selected-text {
  padding: 0;
}

.mdc-select--fullwidth.mdc-select--invalid:not(.mdc-select--disabled) {
  border-bottom-color: #b00020;
}

.mdc-form-field > .mdc-select + label {
  align-self: flex-start;
}

.mdc-select--focused:not(.mdc-select--disabled) .mdc-floating-label {
  color: rgba(98, 0, 238, 0.87);
}
:host([required]) .mdc-floating-label::after {
  color: #b00020;
}

.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--outlined) ::slotted(.mdc-select__native-control),
.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--outlined) .mdc-select__selected-text {
  border-bottom-color: #b00020;
}
.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--outlined) ::slotted(.mdc-select__native-control:hover),
.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--outlined) .mdc-select__selected-text:hover {
  border-bottom-color: #b00020;
}
.mdc-select--invalid:not(.mdc-select--disabled) .mdc-line-ripple {
  background-color: #b00020;
}
.mdc-select--invalid:not(.mdc-select--disabled) .mdc-floating-label {
  color: #b00020;
}
.mdc-select--invalid ::slotted(.mdc-select__native-control),
.mdc-select--invalid .mdc-select__selected-text {
  caret-color: #b00020;
}
.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--invalid + .mdc-select-helper-text--validation-msg {
  color: #b00020;
}

.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled) .mdc-notched-outline__leading,
.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled) .mdc-notched-outline__notch,
.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled) .mdc-notched-outline__trailing {
  border-color: #b00020;
}
.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--focused):hover .mdc-notched-outline .mdc-notched-outline__leading,
.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--focused):hover .mdc-notched-outline .mdc-notched-outline__notch,
.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--focused):hover .mdc-notched-outline .mdc-notched-outline__trailing {
  border-color: #b00020;
}
.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline__leading,
.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline__notch,
.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline__trailing {
  border-color: #b00020;
}
.mdc-select--outlined.mdc-select--invalid + .mdc-select-helper-text--validation-msg {
  opacity: 1;
}

.mdc-select--disabled {
  border-bottom: none;
  pointer-events: none;
}
.mdc-select--disabled .mdc-floating-label {
  cursor: default;
}

@keyframes mdc-floating-label-shake-float-above-select-dense {
  0% {
    transform: translateX(calc(0 - 0%)) translateY(-70%) scale(0.923);
  }
  33% {
    animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
    transform: translateX(calc(4% - 0%)) translateY(-70%) scale(0.923);
  }
  66% {
    animation-timing-function: cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
    transform: translateX(calc(-4% - 0%)) translateY(-70%) scale(0.923);
  }
  100% {
    transform: translateX(calc(0 - 0%)) translateY(-70%) scale(0.923);
  }
}
@keyframes mdc-floating-label-shake-float-above-select-outlined {
  0% {
    transform: translateX(calc(0 - 0%)) translateY(-130%) scale(0.75);
  }
  33% {
    animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
    transform: translateX(calc(4% - 0%)) translateY(-130%) scale(0.75);
  }
  66% {
    animation-timing-function: cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
    transform: translateX(calc(-4% - 0%)) translateY(-130%) scale(0.75);
  }
  100% {
    transform: translateX(calc(0 - 0%)) translateY(-130%) scale(0.75);
  }
}
@keyframes mdc-floating-label-shake-float-above-select-outlined-dense {
  0% {
    transform: translateX(calc(0 - 0%)) translateY(-110%) scale(0.923);
  }
  33% {
    animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
    transform: translateX(calc(4% - 0%)) translateY(-110%) scale(0.923);
  }
  66% {
    animation-timing-function: cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
    transform: translateX(calc(-4% - 0%)) translateY(-110%) scale(0.923);
  }
  100% {
    transform: translateX(calc(0 - 0%)) translateY(-110%) scale(0.923);
  }
}
.mdc-select-helper-text {
  font-family: Roboto, sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-size: 0.75rem;
  line-height: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.0333333333em;
  text-decoration: inherit;
  text-transform: inherit;
  display: block;
  margin-top: 0;
  /* @alternate */
  line-height: normal;
  margin: 0;
  transition: opacity 180ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  will-change: opacity;
}
.mdc-select-helper-text::before {
  display: inline-block;
  width: 0;
  height: 16px;
  content: "";
  vertical-align: 0;
}
.mdc-select--dense + .mdc-select-helper-text {
  margin-bottom: 4px;
}
.mdc-select + .mdc-select-helper-text {
  margin-right: 12px;
  margin-left: 12px;
}
.mdc-select--outlined + .mdc-select-helper-text {
  margin-right: 16px;
  margin-left: 16px;
}

.mdc-select-helper-text--persistent {
  transition: none;
  opacity: 1;
  will-change: initial;
}`;
