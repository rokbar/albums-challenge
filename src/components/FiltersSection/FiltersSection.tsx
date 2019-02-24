import React, { useState, ReactElement } from "react";
import _ from "lodash";
import useFilterOptions from "../../hooks/useFilterOptions";
import { State } from "../../types/State";
import { PriceFilterOptionMap, YearFilterOptionMap, FilterOptions } from "../../types/FilterOption";
import "./FiltersSection.css";

function FiltersSection(): ReactElement {
  const [priceFilters, setPriceFilters]: State<string[]> = useState([]);
  const [yearFilters, setYearFilters]: State<(number | string)[]> = useState([]);
  const { priceOptions, yearOptions }: FilterOptions = useFilterOptions({
    yearFilters,
    priceFilters
  });

  const handleOnFilterSelect = ([currentState, setStateFunc]: State<(string | number)[]>) => (
    filterLabel: string
  ) => (isFilterOptionSelected: boolean | number) =>
    isFilterOptionSelected
      ? setStateFunc([...currentState, filterLabel])
      : setStateFunc(_.filter(currentState, o => o !== filterLabel));

  return (
    <div className="FiltersSection">
      <FiltersCard
        title="Price"
        selectedFilters={priceFilters}
        options={priceOptions}
        handleOnFilterSelect={handleOnFilterSelect([priceFilters, setPriceFilters])}
      />
      <FiltersCard
        title="Year"
        selectedFilters={yearFilters}
        options={yearOptions}
        handleOnFilterSelect={handleOnFilterSelect([yearFilters, setYearFilters])}
      />
    </div>
  );
}

type FiltersCardProps = {
  title: string;
  selectedFilters: (string | number)[];
  options: (PriceFilterOptionMap | YearFilterOptionMap)[];
  handleOnFilterSelect: (filterLabel: string) => (isFilterOptionSelected: number | boolean) => void;
};

function FiltersCard({
  title,
  selectedFilters,
  options,
  handleOnFilterSelect = () => () => {}
}: FiltersCardProps): ReactElement {
  const isOptionSelected = (selectedFilters: (string | number)[], filterLabel: string): boolean =>
    _.some(selectedFilters, s => s === filterLabel);

  const renderFilterOptions = (
    options: (PriceFilterOptionMap | YearFilterOptionMap)[]
  ): ReactElement[] =>
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

type FiltersOptionProps = {
  filterLabel: string;
  isSelected: boolean | undefined;
  matchingAlbumsCount: number;
  handleOnFilterSelect: (isFilterOptionSelected: number | boolean) => void;
};

function FiltersOption({
  filterLabel = "",
  isSelected = false,
  matchingAlbumsCount = 0,
  handleOnFilterSelect = () => {}
}: FiltersOptionProps): ReactElement {
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
