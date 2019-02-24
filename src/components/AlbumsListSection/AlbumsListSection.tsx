import { useGlobal } from "reactn";
import React, { useState, useEffect, ReactElement } from "react";
import _ from "lodash";
import AlbumCard from "./AlbumCard";
import { getAlbums } from "../../api/albums";
import Album from "../../types/Album";
import "./AlbumsListSection.css";

function AlbumsListSection() {
  return (
    <div className="AlbumsListSection">
      <AlbumsList />
    </div>
  );
}

function AlbumsList() {
  const [albums, setAlbums]: [Album[], (value: Album[]) => void] = useGlobal(
    "albums"
  );
  const [filteredAlbums]: [Album[], (value: Album[]) => void] = useGlobal(
    "filteredAlbums"
  );
  const [isFiltered]: [boolean, (value: boolean) => void] = useGlobal(
    "isFiltered"
  );
  const [isFetching, setIsFetching]: [
    boolean,
    (value: boolean) => void
  ] = useState(false);

  const visibleAlbums: Album[] = isFiltered ? filteredAlbums : albums;

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

  const loaderWrapper = (renderFunc: () => ReactElement[] | ReactElement) =>
    isFetching ? <span>Loading...</span> : renderFunc();

  return <div className="AlbumsList">{loaderWrapper(renderAlbumsList)}</div>;
}

export default AlbumsListSection;
