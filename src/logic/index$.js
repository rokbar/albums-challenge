import { merge } from 'rxjs';
import { reduce, flatMap, take, map } from "rxjs/operators";
import {
  _doesAlbumIncludeInPriceFilters,
  _doesAlbumIncludeInYearFilters,
  _parsePriceInterval
} from "./index";

const _filterAlbumsByMultiplePriceFilters = priceIntervals => {
  return reduce((result, album) => {
    const isAlbumIncluded = _doesAlbumIncludeInPriceFilters(album, priceIntervals);
    isAlbumIncluded && result.push(album);
    return result;
  }, []);
};

const _filterAlbumsByMultipleYearFilters = years => {
  return reduce((result, album) => {
    const isAlbumIncluded = _doesAlbumIncludeInYearFilters(album, years);
    isAlbumIncluded && result.push(album);
    return result;
  }, []);
};

const filterAlbumsByBothFiltersGroups$ = (allAlbums$, years, priceIntervals) => {
  if (priceIntervals.length) {
    const resultsPrice = allAlbums$.pipe(
      take(1),
      flatMap(albums => albums),
      _filterAlbumsByMultiplePriceFilters(priceIntervals)
    );

    const resultsYears = allAlbums$.pipe(
      take(1),
      flatMap(albums => albums),
      _filterAlbumsByMultipleYearFilters(years)
    );

    const result = merge(
      resultsYears.pipe(
        map(val => {
          console.log(val);
          return val;
        })
      ),
      resultsPrice.pipe(
        map(val => {
          console.log(val);
          return val;
        })
      )
    );

    console.log(resultsPrice);
    console.log(resultsYears);
    console.log(result);

    const subscribe = result.subscribe(x => console.log(x));
    // const result = (new Observable)
    //   .pipe(forkJoin(resultsYears, resultsPrice))
    //   .subscribe(x => console.log(x));
  }
};

export default {
  filterAlbumsByBothFiltersGroups$
};
