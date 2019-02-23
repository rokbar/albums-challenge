import React, { useGlobal, useState, useEffect } from "reactn";
import _ from "lodash";
import "./FiltersSection.css";

const PRICE_INTERVAL_STEP = 5;

function FiltersSection() {
  const [albums] = useGlobal("albums");
  const [filteredAlbums, setFilteredAlbums] = useGlobal("filteredAlbums");
  const [isFiltered, setIsFiltered] = useGlobal("isFiltered");
  const [priceFilters, setPriceFilters] = useState([]);
  const [yearFilters, setYearFilters] = useState([]);

  useEffect(() => {
    const isFiltered = yearFilters.length || priceFilters.length;
    const filteredAlbumsByBothFilters = filterAlbumsByBothFilters(
      albums,
      yearFilters,
      priceFilters
    );
    setFilteredAlbums(filteredAlbumsByBothFilters);
    setIsFiltered(isFiltered);
  }, [yearFilters, priceFilters]);

  const handleOnFilterCheck = (
    currentState,
    setStateFunc
  ) => label => isChecked =>
    isChecked
      ? setStateFunc([...currentState, label])
      : setStateFunc(_.filter(currentState, o => o !== label));

  const parsePriceInterval = priceInterval => priceInterval.split("-");

  const filterAlbumsBySinglePrice = (albums, priceInterval) => {
    const [minIntervalValue, maxIntervalValue] = parsePriceInterval(
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

  const filterAlbumsByMultiplePrices = (albums, priceIntervals) => {
    const multipleFilterResults = _.reduce(
      priceIntervals,
      (result, interval) => {
        const filteredAlbums = filterAlbumsBySinglePrice(albums, interval);
        result.push(filteredAlbums);
        return result;
      },
      []
    );

    return _.unionBy(...multipleFilterResults, "id");
  };

  const filterAlbumsBySingleYear = (albums, year) => {
    const yearNumber = _.toNumber(year);
    return _.filter(albums, o => _.toNumber(_.toNumber(o.year) === yearNumber));
  };

  const filterAlbumsByMultipleYears = (albums, years) => {
    const multipleFilterResults = _.reduce(
      years,
      (result, year) => {
        const filteredAlbums = filterAlbumsBySingleYear(albums, year);
        result.push(filteredAlbums);
        return result;
      },
      []
    );

    return _.unionBy(...multipleFilterResults, "id");
  };

  const filterAlbumsByBothFilters = (allAlbums, years, priceIntervals) => {
    const albumsFilteredByPrices =
      priceIntervals.length &&
      filterAlbumsByMultiplePrices(allAlbums, priceIntervals);
    const albumsFilteredByYears =
      years.length && filterAlbumsByMultipleYears(allAlbums, years);

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

  const getCheckedYearFiltersOptions = yearFilters => {
    const yearOptions = _.map(yearFilters, year => {
      return {
        [year]: {
          length: 0,
          sortKey: _.toNumber(year)
        }
      };
    });

    return yearOptions;
  };

  const getYearOptions = (albums, yearFilters) =>
    _.chain(albums)
      .groupBy("year")
      .map((albumsByYear, year) => ({
        [year]: {
          length: _.get(albumsByYear, "length", 0),
          sortKey: _.toNumber(year)
        }
      }))
      .concat(getCheckedYearFiltersOptions(yearFilters))
      // we need to get currently checked filters in order to display them (even if there are no search results)
      .uniqWith((o1, o2) => {
        const obj1 = Object.values(o1)[0];
        const obj2 = Object.values(o2)[0];
        if (obj1.sortKey !== obj2.sortKey) {
          return false;
        }
        if (obj1.sortKey === obj2.sortKey) {
          return obj1.length < obj2.length;
        }
      })
      .sortBy(o => Object.values(o)[0].sortKey)
      .value();

  const getMaxPrice = albums =>
    _.chain(albums)
      .maxBy(({ price: { amount = 0 } }) => Number(amount))
      .get("price.amount", 0)
      .toNumber()
      .value();

  const getPriceIntervals = maxPrice => {
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

  const getCheckedPriceFiltersOptions = priceFilters => {
    const priceOptions = _.map(priceFilters, priceInterval => {
      const [minIntervalValue, maxIntervalValue] = parsePriceInterval(
        priceInterval
      );
      return {
        [priceInterval]: {
          length: 0,
          sortKey: _.toNumber(maxIntervalValue)
        }
      };
    });

    return priceOptions;
  };

  const getPriceOptions = (albums, priceFilters) => {
    const maxPrice = getMaxPrice(albums);
    const priceIntervals = getPriceIntervals(maxPrice);
    const albumsByPrice = _.chain(albums)
      .groupBy(o => {
        let intervalLabel = "0-5";
        const price = _.chain(o)
          .get("price.amount", 0)
          .toNumber()
          .value();
        // TODO - think of something better
        const matchingInterval = _.find(priceIntervals, (i, key) => {
          if (i.minIntervalValue <= price && price < i.maxIntervalValue) {
            intervalLabel = key;
            return true;
          }
          return false;
        });
        return intervalLabel;
      })
      .map((albumsByPrice, priceInterval) => {
        const [minIntervalValue, maxIntervalValue] = priceInterval.split("-");
        return {
          [priceInterval]: {
            length: _.get(albumsByPrice, "length", 0),
            sortKey: _.toNumber(maxIntervalValue)
          }
        };
      })
      // we need to get currently checked filters in order to display them (even if there are no search results)
      .concat(getCheckedPriceFiltersOptions(priceFilters))
      .uniqWith((o1, o2) => {
        const obj1 = Object.values(o1)[0];
        const obj2 = Object.values(o2)[0];
        if (obj1.sortKey !== obj2.sortKey) {
          return false;
        }
        if (obj1.sortKey === obj2.sortKey) {
          return obj1.length < obj2.length;
        }
      })
      .sortBy(o => Object.values(o)[0].sortKey)
      .value();

    return albumsByPrice;
  };

  const visibleAlbums = isFiltered ? filteredAlbums : albums;

  return (
    <div className="FiltersSection">
      <FiltersCard
        title="Price"
        selectedFilters={priceFilters}
        options={getPriceOptions(
          yearFilters.length
            ? filterAlbumsByMultipleYears(visibleAlbums, yearFilters)
            : albums,
          priceFilters
        )}
        handleOnFilterCheck={handleOnFilterCheck(priceFilters, setPriceFilters)}
      />
      <FiltersCard
        title="Year"
        selectedFilters={yearFilters}
        options={getYearOptions(
          priceFilters.length
            ? filterAlbumsByMultiplePrices(visibleAlbums, priceFilters)
            : albums,
          yearFilters
        )}
        handleOnFilterCheck={handleOnFilterCheck(yearFilters, setYearFilters)}
      />
    </div>
  );
}

function FiltersCard({
  title,
  selectedFilters,
  options,
  handleOnFilterCheck = () => {}
}) {
  const isOptionSelected = (selectedFilters, label) =>
    _.some(selectedFilters, o => o == label); // we want to coerce in case its price filter (2019 == '2019')

  const renderOptions = () =>
    _.map(options, o => {
      const label = Object.keys(o)[0];
      return (
        <FiltersOption
          label={label}
          isChecked={isOptionSelected(selectedFilters, label)}
          matchingAlbumsCount={o[label].length}
          handleOnFilterCheck={handleOnFilterCheck(label)}
        />
      );
    });

  return (
    <div className="FiltersCard">
      <div className="FiltersCard__header">{title}</div>
      {renderOptions()}
    </div>
  );
}

function FiltersOption({
  label = "",
  isChecked = false,
  matchingAlbumsCount = 0,
  handleOnFilterCheck = () => {}
}) {
  const handleOnChange = () => {
    const nextState = !isChecked;
    handleOnFilterCheck(nextState);
  };

  return (
    <div className="FiltersOption">
      <input
        className="FiltersOption__checkbox"
        type="checkbox"
        onChange={handleOnChange}
        checked={isChecked}
      />
      <span className="FiltersOption__label">{label}</span>
      <span className="FiltersOption__count">({matchingAlbumsCount})</span>
    </div>
  );
}

export default FiltersSection;
