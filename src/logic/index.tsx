import _ from "lodash";
import FilterOption, { PriceFilterOptionMap, YearFilterOptionMap } from "../types/FilterOption";
import Album from "../types/Album";

const PRICE_INTERVAL_STEP = 5;

type PriceIntervalObject = {
  minIntervalValue: number;
  maxIntervalValue: number;
};

// =============================================
// Helpers
// =============================================

const _parsePriceInterval = (priceInterval: string): number[] => {
  const [minIntervalValue, maxIntervalValue]: string[] = priceInterval.split("-");
  return [_.toNumber(minIntervalValue), _.toNumber(maxIntervalValue)];
};

const _uniqFilterOptionsComparator = (
  o1: PriceFilterOptionMap | YearFilterOptionMap,
  o2: PriceFilterOptionMap | YearFilterOptionMap
): boolean => {
  const obj1: FilterOption = Object.values(o1)[0];
  const obj2: FilterOption = Object.values(o2)[0];
  if (obj1.sortKey !== obj2.sortKey) {
    return false;
  } else {
    return obj1.length < obj2.length;
  }
};

const _getPriceIntervalsArrayByMaxPrice = (maxPrice: number): object => {
  const minInterval = 0;
  const maxInterval = Math.ceil(maxPrice / PRICE_INTERVAL_STEP) * PRICE_INTERVAL_STEP;

  let intervals = {};
  for (let i = minInterval; i < maxInterval; i += PRICE_INTERVAL_STEP) {
    const intervalKey = `${i}-${i + PRICE_INTERVAL_STEP}`;
    const priceInervalObject: PriceIntervalObject = {
      minIntervalValue: i,
      maxIntervalValue: i + PRICE_INTERVAL_STEP
    };
    intervals = {
      ...intervals,
      [intervalKey]: priceInervalObject
    };
  }

  return intervals;
};

const _getMaxPrice = (albums: Album[]): number =>
  _.chain(albums)
    .maxBy(({ price: { amount = 0 } }) => Number(amount))
    .get("price.amount", 0)
    .toNumber()
    .value();

// =============================================
// Methods for filtering albums by price filters
// =============================================

const _filterAlbumsBySinglePriceFilter = (albums: Album[], priceInterval: string): Album[] => {
  const [minIntervalValue, maxIntervalValue]: number[] = _parsePriceInterval(priceInterval);
  return _.filter(albums, o => {
    const price: number = _.chain(o)
      .get("price.amount", 0)
      .toNumber()
      .value();
    return minIntervalValue <= price && price < maxIntervalValue;
  });
};

const _filterAlbumsByMultiplePriceFilters = (
  albums: Album[],
  priceIntervals: string[]
): Album[] => {
  const multipleFilterResults: Array<Array<Album>> = _.reduce(
    priceIntervals,
    (result: Array<Array<Album>>, interval: string) => {
      const filteredAlbums: Album[] = _filterAlbumsBySinglePriceFilter(albums, interval);
      result.push(filteredAlbums);
      return result;
    },
    []
  );

  // @ts-ignore
  return _.unionBy(...multipleFilterResults, "id");
};

const _getSelectedPriceFiltersOptions = (priceFilters: string[]): PriceFilterOptionMap[] => {
  const priceOptions: PriceFilterOptionMap[] = _.map(priceFilters, (priceInterval: string) =>
    _getPriceFilterOptionWithMatchingAlbumsMap([], priceInterval)
  );

  return priceOptions;
};

const _getPriceFilterOptionWithMatchingAlbumsMap = (
  albumsByPrice: Album[],
  priceInterval: string
): PriceFilterOptionMap => {
  const [minIntervalValue, maxIntervalValue]: number[] = _parsePriceInterval(priceInterval);

  return {
    [priceInterval]: new FilterOption(
      _.get(albumsByPrice, "length", 0),
      _.toNumber(maxIntervalValue)
    )
  };
};

const _getAlbumPriceInterval = (album: Album, priceIntervals: object): string => {
  let intervalLabel: string = "0-5";
  const price = _.chain(album)
    .get("price.amount", 0)
    .toNumber()
    .value();
  const matchingInterval = _.find(priceIntervals, (o: PriceIntervalObject, key: string) => {
    if (o.minIntervalValue <= price && price < o.maxIntervalValue) {
      intervalLabel = key;
      return true;
    }
    return false;
  });

  return intervalLabel;
};

// ============================================
// Methods for filtering albums by year filters
// ============================================

const _filterAlbumsBySingleYearFilter = (albums: Album[], year: string | number): Album[] => {
  const yearNumber: number = _.toNumber(year);
  return _.filter(albums, (o: Album): boolean => _.toNumber(o.year) === yearNumber);
};

const _filterAlbumsByMultipleYearFilters = (
  albums: Album[],
  years: (string | number)[]
): Album[] => {
  const multipleFilterResults: Array<Array<Album>> = _.reduce(
    years,
    (result: Array<Array<Album>>, year: string | number) => {
      const filteredAlbums: Album[] = _filterAlbumsBySingleYearFilter(albums, year);
      result.push(filteredAlbums);
      return result;
    },
    []
  );

  // @ts-ignore
  return _.unionBy(...multipleFilterResults, "id");
};

const _getSelectedYearFiltersOptions = (
  yearFilters: (string | number)[]
): YearFilterOptionMap[] => {
  const yearOptions: YearFilterOptionMap[] = _.map(yearFilters, (year: string | number) =>
    _getYearFilterOptionWithMatchingAlbumsMap([], year)
  );

  return yearOptions;
};

const _getYearFilterOptionWithMatchingAlbumsMap = (
  albumsByYear: Album[],
  year: string | number
): YearFilterOptionMap => ({
  [year]: new FilterOption(_.get(albumsByYear, "length", 0), _.toNumber(year))
});

// ============================================
// Module API methods
// ============================================

type getFilterOptionsParams = {
  allAlbums: Album[];
  visibleAlbums: Album[];
  priceFilters: string[];
  yearFilters: (string | number)[];
};

const getYearFilterOptions = ({
  allAlbums,
  visibleAlbums,
  yearFilters,
  priceFilters
}: getFilterOptionsParams): YearFilterOptionMap[] => {
  // To get filter options we need to get an albums collection which is filtered by
  // opposite filter group options (different group filters are joined by AND).
  const albums: Album[] = priceFilters.length
    ? _filterAlbumsByMultiplePriceFilters(visibleAlbums, priceFilters)
    : allAlbums;

  const yearsFiltersMap: YearFilterOptionMap[] = _.chain(albums)
    .groupBy("year")
    .map(_getYearFilterOptionWithMatchingAlbumsMap)
    .concat(_getSelectedYearFiltersOptions(yearFilters))
    // we need to get currently checked filters in order to display them (even if there are no search results)
    .uniqWith(_uniqFilterOptionsComparator)
    .orderBy((o: YearFilterOptionMap) => Object.values(o)[0].sortKey, "desc")
    .value();

  return yearsFiltersMap;
};

const getPriceFilterOptions = ({
  allAlbums,
  visibleAlbums,
  priceFilters,
  yearFilters
}: getFilterOptionsParams): PriceFilterOptionMap[] => {
  // To get filter options we need to get an albums collection which is filtered by
  // opposite filter group options (different group filters are joined by AND).
  const albums: Album[] = yearFilters.length
    ? _filterAlbumsByMultipleYearFilters(visibleAlbums, yearFilters)
    : allAlbums;

  const maxPrice: number = _getMaxPrice(albums);
  const priceIntervals: object = _getPriceIntervalsArrayByMaxPrice(maxPrice);
  const priceFiltersMap: PriceFilterOptionMap[] = _.chain(albums)
    .groupBy(_.partialRight(_getAlbumPriceInterval, priceIntervals))
    .map(_getPriceFilterOptionWithMatchingAlbumsMap)
    // we need to get currently checked filters in order to display them (even if there are no search results)
    .concat(_getSelectedPriceFiltersOptions(priceFilters))
    .uniqWith(_uniqFilterOptionsComparator)
    .sortBy(o => Object.values(o)[0].sortKey)
    .value();

  return priceFiltersMap;
};

const filterAlbumsByBothFiltersGroups = (
  allAlbums: Album[],
  years: (string | number)[],
  priceIntervals: string[]
): Album[] => {
  const albumsFilteredByPrices: Album[] = priceIntervals.length
    ? _filterAlbumsByMultiplePriceFilters(allAlbums, priceIntervals)
    : [];
  const albumsFilteredByYears: Album[] = years.length
    ? _filterAlbumsByMultipleYearFilters(allAlbums, years)
    : [];

  if (albumsFilteredByPrices.length && albumsFilteredByYears.length) {
    return _.intersectionBy(albumsFilteredByPrices, albumsFilteredByYears, "id");
  }

  return albumsFilteredByPrices.length
    ? albumsFilteredByPrices
    : albumsFilteredByYears.length
    ? albumsFilteredByYears
    : allAlbums;
};

export default {
  filterAlbumsByBothFiltersGroups,
  getPriceFilterOptions,
  getYearFilterOptions
};
