import { PriceFilterOptionMap } from "../types/FilterOption";
import {
  _parsePriceInterval,
  _uniqFilterOptionsComparator,
  _getPriceIntervalsArrayByMaxPrice,
  _getMaxPrice,
  _doesAlbumIncludeInPriceFilters,
  _filterAlbumsByMultiplePriceFilters,
  _getSelectedPriceFiltersOptionsMaps,
  _getMatchingPriceFilterOptionsMap,
  _getAlbumPriceInterval,
  _doesAlbumIncludeInYearFilters,
  _filterAlbumsByMultipleYearFilters,
  _getSelectedYearFiltersOptionsMaps,
  _getMatchingYearFilterOptionMap,
  PriceIntervalObject
} from "./index";
import Album from "../types/Album";

describe("albums app logic functions", () => {
  describe("private methods", () => {
    it("_parsePriceInterval should return valid min max prices", () => {
      const interval = "15-20";
      const [min, max] = _parsePriceInterval(interval);
      expect(min).toEqual(15);
      expect(max).toEqual(20);
    });

    it("_uniqFilterOptionsComparator should return option which has matching albums (length > 0)", () => {
      const priceFilterOptionMap: PriceFilterOptionMap = {
        ["10-15"]: {
          length: 30,
          sortKey: 15
        }
      };
      const noMatchingAlbumsPriceFilterOptionMap: PriceFilterOptionMap = {
        ["10-15"]: {
          length: 0,
          sortKey: 15
        }
      };
      expect(
        _uniqFilterOptionsComparator(priceFilterOptionMap, noMatchingAlbumsPriceFilterOptionMap)
      ).toBeFalsy();
    });

    it("_getPriceIntervalsArrayByMaxPrice should return valid array of price intervals", () => {
      const maxPrice = 9.99;
      const priceIntervals: PriceIntervalObject[] = _getPriceIntervalsArrayByMaxPrice(maxPrice);
      expect(priceIntervals).toEqual([
        {
          intervalKey: "0-5",
          minIntervalValue: 0,
          maxIntervalValue: 5
        },
        {
          intervalKey: "5-10",
          minIntervalValue: 5,
          maxIntervalValue: 10
        }
      ]);
    });

    it("_getMaxPrice should return maxPrice of albums collection", () => {
      const albums: Album[] = [
        new Album(
          "123",
          "imageurl",
          "Album Title",
          { label: "$15.55", amount: 15.55, currency: "USD" },
          2007
        ),
        new Album(
          "124",
          "imageurl",
          "Album Title2",
          { label: "$9.88", amount: 9.88, currency: "USD" },
          2007
        )
      ];
      expect(_getMaxPrice(albums)).toEqual(15.55);
    });

    it("_doesAlbumIncludeInPriceFilters should say if album's price includes in given price filters", () => {
      const album: Album = new Album(
        "123",
        "imageurl",
        "Album Title",
        { label: "$15.55", amount: 15.55, currency: "USD" },
        2007
      );
      expect(_doesAlbumIncludeInPriceFilters(album, ["0-5", "10-15"])).toBeFalsy();
      expect(_doesAlbumIncludeInPriceFilters(album, ["10-15", "15-20"])).toBeTruthy();
    });

    it("_filterAlbumsByMultiplePriceFilters should filter correctly", () => {
      const albums: Album[] = [
        new Album(
          "123",
          "imageurl",
          "Album Title",
          { label: "$15.55", amount: 15.55, currency: "USD" },
          2007
        ),
        new Album(
          "124",
          "imageurl",
          "Album Title2",
          { label: "$9.88", amount: 9.88, currency: "USD" },
          2007
        )
      ];
      const priceFilters = ["0-5", "15-20"];
      const filteredAlbums = _filterAlbumsByMultiplePriceFilters(albums, priceFilters);
      expect(filteredAlbums.length).toEqual(1);
      expect(filteredAlbums).toEqual([
        new Album(
          "123",
          "imageurl",
          "Album Title",
          { label: "$15.55", amount: 15.55, currency: "USD" },
          2007
        )
      ]);
    });

    it("_getSelectedPriceFiltersOptionsMaps should convert given price intervals to PriceFilterOptionMap objects", () => {
      const priceFilters = ["0-5", "15-20"];
      expect(_getSelectedPriceFiltersOptionsMaps(priceFilters)).toEqual([
        {
          ["0-5"]: {
            length: 0,
            sortKey: 5
          }
        },
        {
          ["15-20"]: {
            length: 0,
            sortKey: 20
          }
        }
      ]);
    });

    it("_getMatchingPriceFilterOptionsMap should calculate albums length and return valid object with price interval as an object key", () => {
      const albums: Album[] = [
        new Album(
          "124",
          "imageurl",
          "Album Title2",
          { label: "$9.88", amount: 9.88, currency: "USD" },
          2007
        ),
        new Album(
          "125",
          "imageurl",
          "Album Title3",
          { label: "$7.88", amount: 7.88, currency: "USD" },
          2007
        )
      ];
      const priceInterval = "5-10";
      expect(_getMatchingPriceFilterOptionsMap(albums, priceInterval)).toEqual({
        ["5-10"]: {
          length: 2,
          sortKey: 10
        }
      });
    });

    it("_getAlbumPriceInterval should return price interval label to which an album belongs", () => {
      const album = new Album(
        "125",
        "imageurl",
        "Album Title3",
        { label: "$7.88", amount: 7.88, currency: "USD" },
        2007
      );
      const priceIntervalObjectArray: PriceIntervalObject[] = [
        {
          intervalKey: "0-5",
          minIntervalValue: 0,
          maxIntervalValue: 5
        },
        {
          intervalKey: "5-10",
          minIntervalValue: 5,
          maxIntervalValue: 10
        }
      ];
      expect(_getAlbumPriceInterval(album, priceIntervalObjectArray)).toEqual("5-10");
    });

    it("_doesAlbumIncludeInYearFilters should say if album's year includes in given year filters", () => {
      const album: Album = new Album(
        "123",
        "imageurl",
        "Album Title",
        { label: "$15.55", amount: 15.55, currency: "USD" },
        2007
      );
      expect(_doesAlbumIncludeInYearFilters(album, ["2004", "2006"])).toBeFalsy();
      expect(_doesAlbumIncludeInYearFilters(album, ["2005", "2007"])).toBeTruthy();
    });

    it("_filterAlbumsByMultipleYearFilters should filter correctly", () => {
      const albums: Album[] = [
        new Album(
          "123",
          "imageurl",
          "Album Title",
          { label: "$15.55", amount: 15.55, currency: "USD" },
          1995
        ),
        new Album(
          "124",
          "imageurl",
          "Album Title2",
          { label: "$9.88", amount: 9.88, currency: "USD" },
          2007
        )
      ];
      const yearFilters = ["2002", "2005", "2007"];
      const filteredAlbums = _filterAlbumsByMultipleYearFilters(albums, yearFilters);
      expect(filteredAlbums.length).toEqual(1);
      expect(filteredAlbums).toEqual([
        new Album(
          "124",
          "imageurl",
          "Album Title2",
          { label: "$9.88", amount: 9.88, currency: "USD" },
          2007
        )
      ]);
    });

    it("_getSelectedYearFiltersOptionsMaps should convert given years to YearFilterOptionMap objects", () => {
      const yearFilters = ["2002", "2005", "2007"];
      expect(_getSelectedYearFiltersOptionsMaps(yearFilters)).toEqual([
        {
          ["2002"]: {
            length: 0,
            sortKey: 2002
          }
        },
        {
          ["2005"]: {
            length: 0,
            sortKey: 2005
          }
        },
        {
          ["2007"]: {
            length: 0,
            sortKey: 2007
          }
        }
      ]);
    });

    it("_getAlbumsYearFilterOptionMap should calculate albums length and return valid object with year as an object key", () => {
      const albums: Album[] = [
        new Album(
          "124",
          "imageurl",
          "Album Title2",
          { label: "$9.88", amount: 9.88, currency: "USD" },
          2007
        ),
        new Album(
          "125",
          "imageurl",
          "Album Title3",
          { label: "$7.88", amount: 7.88, currency: "USD" },
          2007
        )
      ];
      const year = 2007;
      expect(_getMatchingYearFilterOptionMap(albums, year)).toEqual({
        ["2007"]: {
          length: 2,
          sortKey: 2007
        }
      });
    });
  });
});
