import { useGlobal } from "reactn";
import { useEffect } from "react";
import logic from "../logic";
import Album from "../types/Album";
import { FilterOptions, YearFilterOptionMap, PriceFilterOptionMap } from "../types/FilterOption";
import { GlobalState } from "../types/State";

const { filterAlbumsByBothFiltersGroups, getPriceFilterOptions, getYearFilterOptions } = logic;

function useFilterOptions({
  yearFilters,
  priceFilters
}: {
  yearFilters: (string | number)[];
  priceFilters: string[];
}): FilterOptions {
  const [albums]: GlobalState<Album[]> = useGlobal("albums");
  const [filteredAlbums, setFilteredAlbums]: GlobalState<Album[]> = useGlobal("filteredAlbums");
  const [isFiltered, setIsFiltered]: GlobalState<boolean | number> = useGlobal("isFiltered");

  useEffect(() => {
    const isFiltered: number | boolean = yearFilters.length || priceFilters.length;
    const filteredAlbumsByBothFilters: Album[] = filterAlbumsByBothFiltersGroups(
      albums,
      yearFilters,
      priceFilters
    );
    setFilteredAlbums(filteredAlbumsByBothFilters);
    setIsFiltered(isFiltered);
  }, [yearFilters, priceFilters]);

  const visibleAlbums: Album[] = isFiltered ? filteredAlbums : albums;

  const priceOptions: PriceFilterOptionMap[] = getPriceFilterOptions({
    allAlbums: albums,
    visibleAlbums,
    priceFilters,
    yearFilters
  });
  const yearOptions: YearFilterOptionMap[] = getYearFilterOptions({
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
