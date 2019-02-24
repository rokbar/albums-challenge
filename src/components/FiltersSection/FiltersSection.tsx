import React, { useState, Dispatch } from "react";
import _ from "lodash";
import useFilterOptions from "../../hooks/useFilterOptions";
import Album from "../../types/Album";
import {
  PriceFilterOptionMap,
  YearFilterOptionMap
} from "../../types/FilterOption";
import "./FiltersSection.css";

function FiltersSection() {
  const [priceFilters, setPriceFilters]: [
    string[],
    Dispatch<any>
  ] = useState([]);

  const [yearFilters, setYearFilters]: [
    number[],
    Dispatch<any>
  ] = useState([]);
  
  const {
    priceOptions,
    yearOptions
  }: {
    priceOptions: PriceFilterOptionMap[];
    yearOptions: YearFilterOptionMap[];
  } = useFilterOptions({
    yearFilters,
    priceFilters
  });

  const handleOnFilterSelect = (
    currentFilterState: (string | number)[],
    setStateFunc: Dispatch<(string | number)[]>
  ) => (filterLabel: string) => (isFilterOptionSelected: boolean | number) =>
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
  handleOnFilterSelect = () => () => {}
}: {
  title: string,
  selectedFilters: (string | number)[],
  options: (PriceFilterOptionMap | YearFilterOptionMap)[],
  handleOnFilterSelect: (filterLabel: string) => (isFilterOptionSelected: number | boolean) => void
}) {
  const isOptionSelected = (selectedFilters: (string | number)[], filterLabel: string) =>
    _.some(selectedFilters, s => s === filterLabel);

  const renderFilterOptions = (options: (PriceFilterOptionMap | YearFilterOptionMap)[]) =>
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
}: {
  filterLabel: string,
  isSelected: boolean | undefined,
  matchingAlbumsCount: number,
  handleOnFilterSelect: (isFilterOptionSelected: number | boolean)=> void,
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
