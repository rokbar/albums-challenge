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
  const [filteredAlbums] = useGlobal("filteredAlbums");
  const [isFiltered] = useGlobal("isFiltered");
  const [isFetching, setIsFetching] = useState(false);

  const visibleAlbums = isFiltered ? filteredAlbums : albums;

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const data = await getAlbums();
      setAlbums(data);
      setIsFetching(false);
    })();
  }, []);

  const renderAlbumsList = () =>
    visibleAlbums.length ? (
      _.map(visibleAlbums, o => <AlbumCard {...o} />)
    ) : (
      <span>No albums found</span>
    );

  const loaderWrapper = renderFunc =>
    isFetching ? <span>Loading...</span> : renderFunc();

  return <div className="AlbumsList">{loaderWrapper(renderAlbumsList)}</div>;
}

export default AlbumsListSection;
