import React, { useState, useEffect, ReactElement } from "react";
import _ from "lodash";
import AlbumCard from "./AlbumCard";
import { getAlbums } from "../../api/albums";
import Album from "../../types/Album";
import { State } from "../../types/State";
import { albums$, filteredAlbums$, isFiltered$ } from "../../logic/observables";
import useObservable from "../../hooks/useObservable";
import "./AlbumsListSection.css";

function AlbumsListSection() {
  return (
    <div className="AlbumsListSection">
      <AlbumsList />
    </div>
  );
}

function AlbumsList() {
  const albums = useObservable(albums$, albums$.getValue());
  const filteredAlbums = useObservable(filteredAlbums$, filteredAlbums$.getValue());
  const isFiltered = useObservable(isFiltered$, isFiltered$.getValue());
  const [isFetching, setIsFetching]: State<boolean> = useState(false);

  const visibleAlbums: Album[] = isFiltered ? filteredAlbums : albums;

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const data = await getAlbums();
      setIsFetching(false);
      albums$.next(data);
    })();
  }, []);

  const renderAlbumsList = () =>
    _.get(visibleAlbums, "length", 0) ? (
      _.map(visibleAlbums, o => <AlbumCard {...o} />)
    ) : (
      <span>No albums found</span>
    );

  const loaderWrapper = (renderFunc: () => ReactElement[] | ReactElement) =>
    isFetching ? <span>Loading...</span> : renderFunc();

  return <div className="AlbumsList">{loaderWrapper(renderAlbumsList)}</div>;
}

export default AlbumsListSection;
