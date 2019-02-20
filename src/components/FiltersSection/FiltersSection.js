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
      .groupBy('year')
      .map((albumsByYear, year) => ({
        [year]: _.get(albumsByYear, 'length', 0)
      }))
      .value();

  const getMaxPrice = albums => _.chain(albums)
    .maxBy(({ price: { amount = 0 }}) => Number(amount))
    .get('price.amount', 0)
    .toNumber()
    .value();

  const getPriceIntervals = (maxPrice) => {
    const minInterval = 0;
    const maxInterval = Math.round(maxPrice / PRICE_INTERVAL_STEP) * PRICE_INTERVAL_STEP;
    const intervalsCount = (maxInterval / PRICE_INTERVAL_STEP) || 1;

    let intervals = [];
    for (let i = minInterval; i < maxInterval; i+=PRICE_INTERVAL_STEP) {
      const intervalKey = `${i}-${i+PRICE_INTERVAL_STEP}`;
      intervals.push(intervalKey);
    }

    return intervals;
  }

  const getPriceOptions = albums => {
    const maxPrice = getMaxPrice(albums);
    console.log(getPriceIntervals(maxPrice));
  }

  const visibleAlbums = !filteredAlbums.length ? albums : filteredAlbums;
  console.log(getPriceOptions(visibleAlbums));

  return (
    <div className="FiltersSection">
      <FiltersCard
        title="Price"
        // renderOptions={getPriceOptions(visibleAlbums)}
      />
      <FiltersCard title="Year" options={getYearOptions(visibleAlbums)} />
    </div>
  );
}

function FiltersCard({ title, options }) {
  const renderOptions = () =>
    _.map(options, o => {
      const year = Object.keys(o)[0];
      return <FiltersOption label={year} matchingAlbumsCount={o[year]} />
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
