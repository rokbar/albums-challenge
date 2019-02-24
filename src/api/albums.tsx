import axios from "axios";
import _ from "lodash";
import Album from "../types/Album";

const GET_ALBUMS_URL =
  "https://itunes.apple.com/us/rss/topalbums/limit=100/json";

const _getAlbumSmallestImageURL = (data: object) =>
  _.get(
    _.minBy(_.get(data, "im:image"), (o: object) =>
      _.toNumber(_.get(o, "attributes.height", null))
    ),
    "label",
    null
  );
const _getAlbumYear = (data: object) =>
  new Date(_.get(data, "im:releaseDate.label", null)).getFullYear(); // if null, returns 1970

export const getAlbums = async () => {
  const response = await axios(GET_ALBUMS_URL);
  const dataEntry = _.get(response, "data.feed.entry", []);

  let albums: Album[] = [];
  if (dataEntry.length) {
    albums = _.map(dataEntry, (o: object) => {
      const id = _.get(o, "id.attributes.im:id", _.uniqueId());
      const image = _getAlbumSmallestImageURL(o);
      const title = _.get(o, "title.label");
      const pricelabel = _.get(o, "im:price.label", "");
      const { amount: priceAmount, currency: priceCurrency } = _.get(
        o,
        "im:price.attributes",
        { amount: 0, currency: "N/A" }
      );
      const year = _getAlbumYear(o);
      return new Album(
        id,
        image,
        title,
        {
          label: pricelabel,
          amount: priceAmount,
          currency: priceCurrency
        },
        year
      );
    });
  }

  return albums;
};
