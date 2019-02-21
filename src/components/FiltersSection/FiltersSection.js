import React, { useGlobal } from "reactn";
import _ from "lodash";
import "./FiltersSection.css";

const PRICE_INTERVAL_STEP = 5;

function FiltersSection() {
  const [albums] = useGlobal("albums");
  const [filteredAlbums, setFilteredAlbums] = useGlobal("filteredAlbums");
  const [firstLevelFilter, setFirstLevelFilter] = useGlobal("firstLevelFilter");
  const [secondLevelFilter, setSecondLevelFilter] = useGlobal(
    "secondLevelFilter"
  );

  const getYearOptions = albums =>
    _.chain(albums)
      .groupBy("year")
      .map((albumsByYear, year) => ({
        [year]: {
          length: _.get(albumsByYear, "length", 0),
          sortKey: _.toNumber(year),
        },
      }))
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
      Math.round(maxPrice / PRICE_INTERVAL_STEP) * PRICE_INTERVAL_STEP;

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

  const getPriceOptions = albums => {
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
          if (i.minIntervalValue < price && price < i.maxIntervalValue) {
            intervalLabel = key;
            return true;
          }
          return false;
        });
        return intervalLabel;
      })
      .map((albumsByPrice, priceInterval) => {
        const [minIntervalValue, maxIntervalValue] = priceInterval.split('-');
        return {
          [priceInterval]: {
            length: _.get(albumsByPrice, "length", 0),
            sortKey: _.toNumber(maxIntervalValue),
          },
        }
      })
      .sortBy(o => Object.values(o)[0].sortKey)
      .value();

    return albumsByPrice;
  };

  const visibleAlbums = !filteredAlbums.length ? albums : filteredAlbums;

  return (
    <div className="FiltersSection">
      <FiltersCard title="Price" options={getPriceOptions(visibleAlbums)} />
      <FiltersCard title="Year" options={getYearOptions(visibleAlbums)} />
    </div>
  );
}

function FiltersCard({ title, options }) {
  const renderOptions = () =>
    _.map(options, o => {
      const label = Object.keys(o)[0];
      return <FiltersOption label={label} matchingAlbumsCount={o[label].length} />;
    });

  return (
    <div className="FiltersCard">
      <div className="FiltersCard__header">{title}</div>
      {renderOptions()}
    </div>
  );
}

function FiltersOption({ label = "", matchingAlbumsCount = 0 }) {
  return (
    <div className="FiltersOption">
      <input className="FiltersOption__checkbox" type="checkbox" />
      <span className="FiltersOption__label">{label}</span>
      <span className="FiltersOption__count">({matchingAlbumsCount})</span>
    </div>
  );
}

export default FiltersSection;
