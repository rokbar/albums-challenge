import { useGlobal } from "reactn";
import { useEffect } from "react";
import logic from "../logic";
import Album from "../types/Album";

const {
  filterAlbumsByBothFiltersGroups,
  getPriceFilterOptions,
  getYearFilterOptions
} = logic;

function useFilterOptions({
  yearFilters,
  priceFilters
}: {
  yearFilters: number[];
  priceFilters: string[];
}) {
  const [albums]: [Album[], (value: Album[]) => void] = useGlobal("albums");

  const [filteredAlbums, setFilteredAlbums]: [
    Album[],
    (value: Album[]) => void
  ] = useGlobal("filteredAlbums");
  
  const [isFiltered, setIsFiltered]: [
    boolean | number,
    (value: boolean | number) => void
  ] = useGlobal("isFiltered");

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
