import React, { useGlobal, useState, useEffect } from "reactn";
import _ from "lodash";
import AlbumCard from "./AlbumCard";
import { getAlbums } from "../../api/albums";
import "./AlbumsListSection.css";

function AlbumsListSection() {
  return (
    <div className="AlbumsListSection">
      <AlbumsList />
    </div>
  );
}

function AlbumsList() {
  const [albums, setAlbums] = useGlobal("albums");
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const data = await getAlbums();
      setAlbums(data);
      setIsFetching(false);
    })();
  }, []);

  const renderAlbumsList = () =>
    albums.length ? (
      _.map(albums, o => <AlbumCard {...o} />)
    ) : (
      <span>No albums found</span>
    );

  const loaderWrapper = renderFunc =>
    isFetching ? <span>Loading...</span> : renderFunc();

  return <div className="AlbumsList">{loaderWrapper(renderAlbumsList)}</div>;
}

export default AlbumsListSection;
