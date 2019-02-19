import React, { useState, useEffect } from "react";
import _ from "lodash";
import { getAlbums } from "../api/albums";

function AlbumsListSection() {
  const [albums, setAlbums] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const data = await getAlbums();
      setAlbums(data);
      setIsFetching(false);
    })();
  }, []);

  const renderAlbum = ({ title, image, price: { label } }) => (
    <div>
      <img src={image} />
      <span>{title}</span>
      <span>{label}</span>
    </div>
  );

  const renderAlbumsList = () =>
    albums.length ? (
      _.map(albums, o => renderAlbum(o))
    ) : (
      <span>No albums found</span>
    );

  const loaderWrapper = renderFunc =>
    isFetching ? <span>Loading...</span> : renderFunc();

  return (
    <div className="AlbumsListSection">{loaderWrapper(renderAlbumsList)}</div>
  );
}

export default AlbumsListSection;
