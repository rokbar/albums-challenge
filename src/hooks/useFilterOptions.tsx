import { useEffect } from "react";
import logic from "../logic";
import logic$ from "../logic/index$";
import Album from "../types/Album";
import { FilterOptions, YearFilterOptionMap, PriceFilterOptionMap } from "../types/FilterOption";
import useObservable from "../hooks/useObservable";
import { albums$, filteredAlbums$, isFiltered$ } from "../logic/observables";

const { filterAlbumsByBothFiltersGroups, getPriceFilterOptions, getYearFilterOptions } = logic;
const { filterAlbumsByBothFiltersGroups$ } = logic$;

function useFilterOptions({
  yearFilters,
  priceFilters
}: {
  yearFilters: (string | number)[];
  priceFilters: string[];
}): FilterOptions {
  const albums = useObservable(albums$, albums$.getValue());
  const filteredAlbums = useObservable(filteredAlbums$, filteredAlbums$.getValue());
  const isFiltered = useObservable(isFiltered$, isFiltered$.getValue());

  useEffect(() => {
    filterAlbumsByBothFiltersGroups$(
      albums$,
      yearFilters,
      priceFilters,
    );
    const isFiltered: boolean = !!yearFilters.length || !!priceFilters.length;
    const filteredAlbumsByBothFilters: Album[] = filterAlbumsByBothFiltersGroups(
      albums,
      yearFilters,
      priceFilters
    );
    filteredAlbums$.next(filteredAlbumsByBothFilters);
    isFiltered$.next(isFiltered);
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
