export type PriceFilterOptionMap = {
  [priceInterval: string] : FilterOption;
}

export type YearFilterOptionMap = {
  [year: string]: FilterOption;
}

export type FilterOptions = {
  priceOptions: PriceFilterOptionMap[];
  yearOptions: YearFilterOptionMap[];
}

export default class FilterOption {
  length: number;
  sortKey: number | string;

  constructor(length: number, sortKey: number | string) {
    this.length = length;
    this.sortKey = sortKey;
  }
}
