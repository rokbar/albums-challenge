export interface PriceFilterOptionMap {
  [priceInterval: string] : FilterOption;
}

export interface YearFilterOptionMap {
  [year: string]: FilterOption ;
}

export default class FilterOption {
  length: number;
  sortKey: number | string;

  constructor(length: number, sortKey: number | string) {
    this.length = length;
    this.sortKey = sortKey;
  }
}
