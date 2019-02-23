import React, { useState } from "reactn";
import _ from "lodash";
import useFilterOptions from "../../hooks/useFilterOptions";
import "./FiltersSection.css";

function FiltersSection() {
  const [priceFilters, setPriceFilters] = useState([]);
  const [yearFilters, setYearFilters] = useState([]);
  const { priceOptions, yearOptions } = useFilterOptions({
    yearFilters,
    priceFilters
  });

  const handleOnFilterSelect = (
    currentFilterState,
    setStateFunc
  ) => filterLabel => isFilterOptionSelected =>
    isFilterOptionSelected
      ? setStateFunc([...currentFilterState, filterLabel])
      : setStateFunc(_.filter(currentFilterState, o => o !== filterLabel));

  return (
    <div className="FiltersSection">
      <FiltersCard
        title="Price"
        selectedFilters={priceFilters}
        options={priceOptions}
        handleOnFilterSelect={handleOnFilterSelect(
          priceFilters,
          setPriceFilters
        )}
      />
      <FiltersCard
        title="Year"
        selectedFilters={yearFilters}
        options={yearOptions}
        handleOnFilterSelect={handleOnFilterSelect(yearFilters, setYearFilters)}
      />
    </div>
  );
}

function FiltersCard({
  title,
  selectedFilters,
  options,
  handleOnFilterSelect = () => {}
}) {
  const isOptionSelected = (selectedFilters, filterLabel) =>
    _.some(selectedFilters, s => s === filterLabel);

  const renderFilterOptions = options =>
    _.map(options, o => {
      const filterLabel = Object.keys(o)[0];
      return (
        <FiltersOption
          filterLabel={filterLabel}
          isSelected={isOptionSelected(selectedFilters, filterLabel)}
          matchingAlbumsCount={o[filterLabel].length}
          handleOnFilterSelect={handleOnFilterSelect(filterLabel)}
        />
      );
    });

  return (
    <div className="FiltersCard">
      <div className="FiltersCard__header">{title}</div>
      {renderFilterOptions(options)}
    </div>
  );
}

function FiltersOption({
  filterLabel = "",
  isSelected = false,
  matchingAlbumsCount = 0,
  handleOnFilterSelect = () => {}
}) {
  const handleOnChange = () => {
    const nextState = !isSelected;
    handleOnFilterSelect(nextState);
  };

  return (
    <div className="FiltersOption">
      <input
        className="FiltersOption__checkbox"
        type="checkbox"
        onChange={handleOnChange}
        checked={isSelected}
      />
      <span className="FiltersOption__label">{filterLabel}</span>
      <span className="FiltersOption__count">({matchingAlbumsCount})</span>
    </div>
  );
}

export default FiltersSection;
