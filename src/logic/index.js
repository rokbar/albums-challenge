import _ from "lodash";

const PRICE_INTERVAL_STEP = 5;

// =============================================
// Helpers
// =============================================

const _parsePriceInterval = priceInterval => priceInterval.split("-");

const _uniqFilterOptionsComparator = (o1, o2) => {
  const obj1 = Object.values(o1)[0];
  const obj2 = Object.values(o2)[0];
  if (obj1.sortKey !== obj2.sortKey) {
    return false;
  } else {
    return obj1.length < obj2.length;
  }
};

const _getPriceIntervalsArrayByMaxPrice = maxPrice => {
  const minInterval = 0;
  const maxInterval =
    Math.ceil(maxPrice / PRICE_INTERVAL_STEP) * PRICE_INTERVAL_STEP;

  let intervals = {};
  for (let i = minInterval; i < maxInterval; i += PRICE_INTERVAL_STEP) {
    const intervalKey = `${i}-${i + PRICE_INTERVAL_STEP}`;
    intervals = {
      ...intervals,
      [intervalKey]: {
        minIntervalValue: i,
        maxIntervalValue: i + PRICE_INTERVAL_STEP
      }
    };
  }

  return intervals;
};

const _getMaxPrice = albums =>
  _.chain(albums)
    .maxBy(({ price: { amount = 0 } }) => Number(amount))
    .get("price.amount", 0)
    .toNumber()
    .value();

// =============================================
// Methods for filtering albums by price filters
// =============================================

const _filterAlbumsBySinglePriceFilter = (albums, priceInterval) => {
  const [minIntervalValue, maxIntervalValue] = _parsePriceInterval(
    priceInterval
  );
  return _.filter(albums, o => {
    const price = _.chain(o)
      .get("price.amount", 0)
      .toNumber()
      .value();
    return minIntervalValue <= price && price < maxIntervalValue;
  });
};

const _filterAlbumsByMultiplePriceFilters = (albums, priceIntervals) => {
  const multipleFilterResults = _.reduce(
    priceIntervals,
    (result, interval) => {
      const filteredAlbums = _filterAlbumsBySinglePriceFilter(albums, interval);
      result.push(filteredAlbums);
      return result;
    },
    []
  );

  return _.unionBy(...multipleFilterResults, "id");
};

const _getSelectedPriceFiltersOptions = priceFilters => {
  const priceOptions = _.map(priceFilters, priceInterval =>
    _getPriceFilterOptionWithMatchingAlbumsLength([], priceInterval)
  );

  return priceOptions;
};

const _getPriceFilterOptionWithMatchingAlbumsLength = (
  albumsByPrice,
  priceInterval
) => {
  const [minIntervalValue, maxIntervalValue] = _parsePriceInterval(
    priceInterval
  );

  return {
    [priceInterval]: {
      length: _.get(albumsByPrice, "length", 0),
      sortKey: _.toNumber(maxIntervalValue)
    }
  };
};

const _getAlbumPriceInterval = (album, priceIntervals) => {
  let intervalLabel = "0-5";
  const price = _.chain(album)
    .get("price.amount", 0)
    .toNumber()
    .value();
  const matchingInterval = _.find(priceIntervals, (i, key) => {
    if (i.minIntervalValue <= price && price < i.maxIntervalValue) {
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

const _filterAlbumsBySingleYearFilter = (albums, year) => {
  const yearNumber = _.toNumber(year);
  return _.filter(albums, o => _.toNumber(_.toNumber(o.year) === yearNumber));
};

const _filterAlbumsByMultipleYearFilters = (albums, years) => {
  const multipleFilterResults = _.reduce(
    years,
    (result, year) => {
      const filteredAlbums = _filterAlbumsBySingleYearFilter(albums, year);
      result.push(filteredAlbums);
      return result;
    },
    []
  );

  return _.unionBy(...multipleFilterResults, "id");
};

const _getSelectedYearFiltersOptions = yearFilters => {
  const yearOptions = _.map(yearFilters, year =>
    _getYearFilterOptionWithMatchingAlbumsLength([], year)
  );

  return yearOptions;
};

const _getYearFilterOptionWithMatchingAlbumsLength = (albumsByYear, year) => ({
  [year]: {
    length: _.get(albumsByYear, "length", 0),
    sortKey: _.toNumber(year)
  }
});

// ============================================
// Module API methods
// ============================================

const getYearFilterOptions = ({
  allAlbums,
  visibleAlbums,
  yearFilters,
  priceFilters
}) => {
  // To get filter options we need to get an albums collection which is filtered by
  // opposite filter group options (different group filters are joined by AND).
  const albums = priceFilters.length
    ? _filterAlbumsByMultiplePriceFilters(visibleAlbums, priceFilters)
    : allAlbums;

  return (
    _.chain(albums)
      .groupBy("year")
      .map(_getYearFilterOptionWithMatchingAlbumsLength)
      .concat(_getSelectedYearFiltersOptions(yearFilters))
      // we need to get currently checked filters in order to display them (even if there are no search results)
      .uniqWith(_uniqFilterOptionsComparator)
      .orderBy(o => Object.values(o)[0].sortKey, 'desc')
      .value()
  );
};

const getPriceFilterOptions = ({
  allAlbums,
  visibleAlbums,
  priceFilters,
  yearFilters
}) => {
  // To get filter options we need to get an albums collection which is filtered by
  // opposite filter group options (different group filters are joined by AND).
  const albums = yearFilters.length
    ? _filterAlbumsByMultipleYearFilters(visibleAlbums, yearFilters)
    : allAlbums;

  const maxPrice = _getMaxPrice(albums);
  const priceIntervals = _getPriceIntervalsArrayByMaxPrice(maxPrice);
  const albumsByPrice = _.chain(albums)
    .groupBy(_.partialRight(_getAlbumPriceInterval, priceIntervals))
    .map(_getPriceFilterOptionWithMatchingAlbumsLength)
    // we need to get currently checked filters in order to display them (even if there are no search results)
    .concat(_getSelectedPriceFiltersOptions(priceFilters))
    .uniqWith(_uniqFilterOptionsComparator)
    .sortBy(o => Object.values(o)[0].sortKey)
    .value();

  return albumsByPrice;
};

const filterAlbumsByBothFiltersGroups = (allAlbums, years, priceIntervals) => {
  const albumsFilteredByPrices =
    priceIntervals.length &&
    _filterAlbumsByMultiplePriceFilters(allAlbums, priceIntervals);
  const albumsFilteredByYears =
    years.length && _filterAlbumsByMultipleYearFilters(allAlbums, years);

  if (albumsFilteredByPrices.length && albumsFilteredByYears.length) {
    return _.intersectionBy(
      albumsFilteredByPrices,
      albumsFilteredByYears,
      "id"
    );
  } else if (albumsFilteredByPrices || albumsFilteredByYears) {
    return albumsFilteredByPrices || albumsFilteredByYears;
  }

  return allAlbums;
};

export default {
  filterAlbumsByBothFiltersGroups,
  getPriceFilterOptions,
  getYearFilterOptions
};
