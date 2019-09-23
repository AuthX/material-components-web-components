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
  LitElement,
  customElement,
  query,
  property,
  html,
  TemplateResult
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { findAssignedElement, emit } from '@authentic/mwc-base/utils';
import { observer } from '@authentic/mwc-base/observer';

import { style } from './mwc-table-css';

// elements to be registered ahead of time
import '@authentic/mwc-circular-progress';
import '@authentic/mwc-icon/mwc-icon-font';
import '@authentic/mwc-tooltip';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-table': Table;
  }
}

export interface IDataItem {
  [name: string]: any;
}

export interface IColumnItem {
  title: string;
  field: string;
  description?: string;
  align?: string;
}

export interface ICellItem {
  field: string;
  value: string;
  description?: string;
  align?: string;
}

export interface ITableElements {
  head: TemplateResult|undefined,
  body: TemplateResult|undefined,
  columnsCount: number
}

@customElement('mwc-table')
export class Table extends LitElement {

  @query('.mwc-table')
  protected mdcRoot!: HTMLElement;

  @query('slot[name=""]')
  protected slotEl!: HTMLSlotElement;

  @query('mwc-circular-progress')
  protected progressEl!: HTMLElement;

  @property({ type: Number })
  public progressSize = 32;

  @property({ type: Boolean })
  public header = true;

  @property({ type: String })
  public emptyDataMessage = 'No records to display';

  @property({ type: Array })
  @observer(function(this: Table, value: IColumnItem[]) {
    this._parsedColumns = this._parseData(value);
  })
  public columns;

  @property({ type: Array })
  @observer(async function(this: Table, value: IDataItem[]) {
    this._parsedData = value instanceof Function
      ? await this._loadData(value)
      : this._parseData(value);
  })
  public data;

  protected get templateEl() {
    return this.slotEl && findAssignedElement(this.slotEl, '*') as HTMLScriptElement;
  }

  protected get _bodyRows(): HTMLTableRowElement[] {
    const rows = this.mdcRoot && this.mdcRoot.querySelectorAll('tbody tr');
    return rows
      ? [...rows] as HTMLTableRowElement[]
      : [];
  }

  protected get _headerRow(): HTMLTableRowElement|null {
    return this.mdcRoot.querySelector('thead tr');
  }

  protected get _shouldDisplayHeader() {
    return this.header;
  }

  protected _isLoading!: boolean;
  protected _parsedColumns!: IColumnItem[];
  protected _parsedData!: ICellItem[];

  static styles = style;

  firstUpdated() {
    this.updateComplete
      .then(() => {
        this.requestUpdate();
      });
  }

  render() {
    const classes = {
      'mwc-table': true
    };

    return html`
      <div class="${classMap(classes)}">
        <div class="mwc-table__content">
          ${this._createTable()}
          <slot name=""></slot>
        </div>
        ${this._isLoading ? this._renderProgress() : undefined}
      </div>
    `;
  }

  _renderProgress(): TemplateResult {
    return html`<div class="mwc-table__loader">
      <mwc-circular-progress size="${this.progressSize}"></mwc-circular-progress>
    </div>`;
  }

  _renderTooltip(ref: string, text: string): TemplateResult {
    return html`<mwc-tooltip for="${ref}" text="${text}" offset="${-2}" showDelay="${500}"></mwc-tooltip>`;
  }

  /**
   * Parses data if is an instance of string
   */
  protected _parseData(data: any): any[] {
    return typeof data === 'string'
      ? JSON.parse(data)
      : data;
  }

  /**
   * Loads data
   * @param value Function that returns a promise
   */
  protected _loadData(value: Function): Promise<ICellItem[]> {
    this._isLoading = true;
    this.requestUpdate();
    emit(this, 'beforeload');

    return value()
      .then(response => {
        setTimeout(() => {
          this._isLoading = false;
          this.requestUpdate();
          emit(this, 'load');
        }, 0);

        return response;
      });
  }

  protected _createTable(): TemplateResult {
    const templateElements = this._getElementsFromTemplate();
    const dataElements = this._getElementsFromData();

    const head = dataElements.head || templateElements.head;
    const body = dataElements.body || templateElements.body;
    const columnsCount = dataElements.columnsCount || templateElements.columnsCount;
    
    return html`
      <table>
        ${head}
        <tbody>${body || this._getEmptyBody(columnsCount)}</tbody>
      </table>
    `;
  }

  _getTemplateContent(templateEl: HTMLScriptElement) {
    const content = templateEl.text; 
    const target = document.createElement("TABLE")
    target.innerHTML = content
    return target
  }

  /**
   * Creates a table from slotted template
   */
  protected _getElementsFromTemplate(): ITableElements {
    const headEl = this.templateEl
      ? this._getTemplateContent(this.templateEl).querySelector('thead')
      : undefined;
    const columns = headEl ? headEl.querySelectorAll('tr') : [];
    const bodyEl = this.templateEl ? this._getTemplateContent(this.templateEl).querySelector('tbody') : undefined;

    const head = this._shouldDisplayHeader && headEl && columns
      ? this._getHeadFromElement(headEl)
      : undefined;
    const body = bodyEl
      ? this._getBodyFromElement(bodyEl)
      : undefined;

    return { head, body, columnsCount: columns.length };
  }

  /**
   * Creates a table from data
   */
  protected _getElementsFromData(): ITableElements {
    const head = this._shouldDisplayHeader && this._parsedColumns
      ? this._getHead(this._parsedColumns)
      : undefined;
    const body = this._parsedData && this._parsedData.length > 0
      ? this._getBody(this._parsedData)
      : undefined;
    const columns = this._parsedColumns || [];
      
    return { head, body, columnsCount: columns.length };
  }

  /**
   * Returns a table head with one row and all its cells
   * 
   * @param element HTMLTableSectionElement
   */
  protected _getHeadFromElement(element: HTMLTableSectionElement): TemplateResult {
    const row = element.querySelector('tr');

    return html`
      <thead>
        <tr>
          ${unsafeHTML(row!.innerHTML)}
        </tr>
      </thead>
    `;
  }

  /**
   * Returns a table head with one row and all its cells
   * 
   * @param data Array of IColumnItem
   */
  protected _getHead(data: IColumnItem[]): TemplateResult {
    const row = data.map(item => ({
      field: item.field,
      value: item.title,
      description: item.description,
      align: item.align
    }));

    return html`
      <thead>
        <tr>
          ${this._getCells(row, true)}
        </tr>
      </thead>
    `;
  }

  /**
   * Returns a table body with all its rows and cells
   * 
   * @param element HTMLTableSectionElement
   */
  protected _getBodyFromElement(element: HTMLTableSectionElement): TemplateResult {
    const rows = [...element.querySelectorAll('tr')];

    return html`
      ${rows.map(item => {
        return html`
          <tr tabindex="-1">
            ${unsafeHTML(item!.innerHTML)}
          </tr>
        `;
      })}
    `;
  }

  /**
   * Returns a table body with all its rows and cells
   * 
   * @param data Array of IDataItem
   */
  protected _getBody(data: IDataItem[]): TemplateResult {
    return html`
      ${data.map(item => {
        const row = this._parsedColumns
          ? this._parsedColumns
            .map(col => ({
                field: col.field,
                value: item[col.field],
                align: col.align
            }))
          : Object.keys(item)
            .map(key => ({
              field: key,
              value: item[key]
            }))
        return html`
          <tr tabindex="-1">
            ${this._getCells(row)}
          </tr>
        `;
      })}
    `;
  }

  /**
   * Returns a table body with a single row and an no data message
   * 
   * @param cols columns count
   */
  protected _getEmptyBody(cols: number) {
    return html`
      <tr>
        <td align="center" colspan="${cols}">
          ${this._getEmptyDataMessage()}
        </td>
      </tr>
    `;
  }

  protected _getEmptyDataMessage() {
    return !this._isLoading ? this.emptyDataMessage : '';
  }

  /**
   * 
   * @param data Array of ICellItem
   * @param header determines if uses <th> tag
   */
  protected _getCells(data: ICellItem[], header?): TemplateResult {
    return html`
      ${data.map((item, index) => {
        const id = `cell_${index}`;
        const align = item.align || 'left';
        const value = item.value || '';
        const tooltip = item.description
          ? this._renderTooltip(id, item.description)
          : undefined;

        return header
          ? html`<th align="${align}" value="${value}">
            <span id="${id}">${value}</span>
            ${tooltip}
          </th>`
          : html`<td align="${align}" value="${value}">
            <span>${value}</span>
          </td>`;
      })}
    `;
  }

  /**
   * If table was created using data then returns, the row data
   * otherwise returns the row element
   * 
   * @param row HTMLTableRowElement
   */
  protected _getRowData(row): IDataItem|HTMLTableRowElement {
    return this._parsedData
      ? this._parsedData[this._getRowIndex(row)]
      : row;
  }

  /**
   * Returns the index of the element in its parent element
   * 
   * @param row HTMLTableRowElement
   */
  protected _getRowIndex(row: HTMLTableRowElement): number {
    return [...row.parentElement!.children].indexOf(row);
  }
}
