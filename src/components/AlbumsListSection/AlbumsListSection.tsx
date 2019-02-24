import { useGlobal } from "reactn";
import React, { useState, useEffect, ReactElement } from "react";
import _ from "lodash";
import AlbumCard from "./AlbumCard";
import { getAlbums } from "../../api/albums";
import Album from "../../types/Album";
import { GlobalState, State } from "../../types/State";
import "./AlbumsListSection.css";

function AlbumsListSection() {
  return (
    <div className="AlbumsListSection">
      <AlbumsList />
    </div>
  );
}

function AlbumsList() {
  const [albums, setAlbums]: GlobalState<Album[]> = useGlobal("albums");
  const [filteredAlbums]: GlobalState<Album[]> = useGlobal("filteredAlbums");
  const [isFiltered]: GlobalState<boolean> = useGlobal("isFiltered");
  const [isFetching, setIsFetching]: State<boolean> = useState(false);

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
