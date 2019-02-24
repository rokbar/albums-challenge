import _ from "lodash";
import FilterOption, { PriceFilterOptionMap, YearFilterOptionMap } from "../types/FilterOption";
import Album from "../types/Album";

export type PriceIntervalObject = {
  intervalKey: string;
  minIntervalValue: number;
  maxIntervalValue: number;
};

type getFilterOptionsParams = {
  allAlbums: Album[];
  visibleAlbums: Album[];
  priceFilters: string[];
  yearFilters: (string | number)[];
};

const PRICE_INTERVAL_STEP = 5;

// =============================================
// Helpers
// =============================================

export const _parsePriceInterval = (priceInterval: string): number[] => {
  const [minIntervalValue, maxIntervalValue]: string[] = priceInterval.split("-");
  return [_.toNumber(minIntervalValue), _.toNumber(maxIntervalValue)];
};

export const _uniqFilterOptionsComparator = (
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

export const _getPriceIntervalsArrayByMaxPrice = (maxPrice: number): PriceIntervalObject[] => {
  const minInterval = 0;
  const maxInterval = Math.ceil(maxPrice / PRICE_INTERVAL_STEP) * PRICE_INTERVAL_STEP;

  let intervals: PriceIntervalObject[] = [];
  for (let i = minInterval; i < maxInterval; i += PRICE_INTERVAL_STEP) {
    const intervalKey: string = `${i}-${i + PRICE_INTERVAL_STEP}`;
    const priceInervalObject: PriceIntervalObject = {
      intervalKey,
      minIntervalValue: i,
      maxIntervalValue: i + PRICE_INTERVAL_STEP
    };
    intervals.push(priceInervalObject);
  }

  return intervals;
};

export const _getMaxPrice = (albums: Album[]): number =>
  _.chain(albums)
    .maxBy(({ price: { amount = 0 } }) => Number(amount))
    .get("price.amount", 0)
    .toNumber()
    .value();

// =============================================
// Methods for filtering albums by price filters
// =============================================

export const _doesAlbumIncludeInPriceFilters = (album: Album, priceIntervals: (string)[]): boolean => {
  const price: number = _.chain(album)
    .get("price.amount", 0)
    .toNumber()
    .value();
  return _.some(priceIntervals, (priceInterval: string) => {
    const [minIntervalValue, maxIntervalValue]: number[] = _parsePriceInterval(priceInterval);
    return minIntervalValue <= price && price < maxIntervalValue;
  });
};

export const _filterAlbumsByMultiplePriceFilters = (
  albums: Album[],
  priceIntervals: string[]
): Album[] => {
  const multipleFilterResults: Array<Album> = _.reduce(
    albums,
    (result: Array<Album>, album: Album) => {
      const isAlbumIncluded: boolean = _doesAlbumIncludeInPriceFilters(album, priceIntervals);
      isAlbumIncluded && result.push(album);
      return result;
    },
    []
  );

  return multipleFilterResults;
};

export const _getSelectedPriceFiltersOptionsMaps = (priceFilters: string[]): PriceFilterOptionMap[] => {
  const priceOptions: PriceFilterOptionMap[] = _.map(priceFilters, (priceInterval: string) =>
    _getMatchingPriceFilterOptionsMap([], priceInterval)
  );

  return priceOptions;
};

export const _getMatchingPriceFilterOptionsMap = (
  albumsByPrice: Album[],
  priceInterval: string
): PriceFilterOptionMap => {
  const [, maxIntervalValue]: number[] = _parsePriceInterval(priceInterval);

  return {
    [priceInterval]: new FilterOption(
      _.get(albumsByPrice, "length", 0),
      _.toNumber(maxIntervalValue)
    )
  };
};

export const _getAlbumPriceInterval = (album: Album, priceIntervals: PriceIntervalObject[]): string => {
  let intervalLabel: string = "0-5";
  const price = _.chain(album)
    .get("price.amount", 0)
    .toNumber()
    .value();
  _.some(priceIntervals, (o: PriceIntervalObject) => {
    if (o.minIntervalValue <= price && price < o.maxIntervalValue) {
      intervalLabel = o.intervalKey;
      return true;
    }
    return false;
  });

  return intervalLabel;
};

// ============================================
// Methods for filtering albums by year filters
// ============================================

export const _doesAlbumIncludeInYearFilters = (album: Album, years: (string | number)[]): boolean =>
  _.some(years, (year: string | number) => album.year === _.toNumber(year));

export const _filterAlbumsByMultipleYearFilters = (
  albums: Album[],
  years: (string | number)[]
): Album[] => {
  const multipleFilterResults: Array<Album> = _.reduce(
    albums,
    (result: Array<Album>, album: Album) => {
      const isAlbumIncluded = _doesAlbumIncludeInYearFilters(album, years);
      isAlbumIncluded && result.push(album);
      return result;
    },
    []
  );

  return multipleFilterResults;
};

export const _getSelectedYearFiltersOptionsMaps = (
  yearFilters: (string | number)[]
): YearFilterOptionMap[] => {
  const yearOptions: YearFilterOptionMap[] = _.map(yearFilters, (year: string | number) =>
    _getMatchingYearFilterOptionMap([], year)
  );

  return yearOptions;
};

export const _getMatchingYearFilterOptionMap = (
  albumsByYear: Album[],
  year: string | number
): YearFilterOptionMap => ({
  [year]: new FilterOption(_.get(albumsByYear, "length", 0), _.toNumber(year))
});

// ============================================
// Module API methods
// ============================================

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
    .map(_getMatchingYearFilterOptionMap)
    .concat(_getSelectedYearFiltersOptionsMaps(yearFilters))
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
  const priceIntervals: PriceIntervalObject[] = _getPriceIntervalsArrayByMaxPrice(maxPrice);
  const priceFiltersMap: PriceFilterOptionMap[] = _.chain(albums)
    .groupBy(_.partialRight(_getAlbumPriceInterval, priceIntervals))
    .map(_getMatchingPriceFilterOptionsMap)
    // we need to get currently checked filters in order to display them (even if there are no search results)
    .concat(_getSelectedPriceFiltersOptionsMaps(priceFilters))
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
