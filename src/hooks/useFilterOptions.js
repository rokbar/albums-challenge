import React, { useGlobal, useEffect } from "reactn";
import _ from "lodash";
import logic from "../logic/filtering";

const {
  filterAlbumsByBothFiltersGroups,
  getPriceFilterOptions,
  getYearFilterOptions
} = logic;

function useFilterOptions({ yearFilters, priceFilters }) {
  const [albums] = useGlobal("albums");
  const [filteredAlbums, setFilteredAlbums] = useGlobal("filteredAlbums");
  const [isFiltered, setIsFiltered] = useGlobal("isFiltered");

  useEffect(() => {
    const isFiltered = yearFilters.length || priceFilters.length;
    const filteredAlbumsByBothFilters = filterAlbumsByBothFiltersGroups(
      albums,
      yearFilters,
      priceFilters
    );
    setFilteredAlbums(filteredAlbumsByBothFilters);
    setIsFiltered(isFiltered);
  }, [yearFilters, priceFilters]);

  const visibleAlbums = isFiltered ? filteredAlbums : albums;

  const priceOptions = getPriceFilterOptions({
    allAlbums: albums,
    visibleAlbums,
    priceFilters,
    yearFilters
  });
  const yearOptions = getYearFilterOptions({
    allAlbums: albums,
    visibleAlbums,
    priceFilters,
    yearFilters
  });

  return {
    priceOptions,
    yearOptions
  };
}

export default useFilterOptions;
