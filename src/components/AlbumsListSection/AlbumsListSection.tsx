import { useGlobal } from "reactn";
import React, { useState, useEffect, ReactElement } from "react";
import { BehaviorSubject, combineLatest } from 'rxjs';
import _ from "lodash";
import AlbumCard from "./AlbumCard";
import { getAlbums } from "../../api/albums";
import Album from "../../types/Album";
import { GlobalState, State } from "../../types/State";
import observable from "../../logic/observable";
import useObservable from "../../hooks/useObservable";
import "./AlbumsListSection.css";

const observable$ = observable;
// observable$.subscribe(value => console.log(value));

function AlbumsListSection() {
  return (
    <div className="AlbumsListSection">
      <AlbumsList />
    </div>
  );
}

const initialAlbums: Album[] = [];
const albums$ = new BehaviorSubject(initialAlbums);
const filteredAlbums$ = new BehaviorSubject([]);
const isFiltered$ = new BehaviorSubject(false);
const combinedState$ = combineLatest(albums$, filteredAlbums$);

function AlbumsList() {
  const albums = useObservable(albums$, albums$.getValue());
  const filteredAlbums = useObservable(filteredAlbums$, filteredAlbums$.getValue());
  const isFiltered = useObservable(isFiltered$, isFiltered$.getValue());
  // const [albums, setAlbums]: GlobalState<Album[]> = useGlobal("albums");
  // const [filteredAlbums]: GlobalState<Album[]> = useGlobal("filteredAlbums");
  // const [isFiltered]: GlobalState<boolean> = useGlobal("isFiltered");
  const [isFetching, setIsFetching]: State<boolean> = useState(false);

  const visibleAlbums: Album[] = isFiltered ? filteredAlbums : albums;

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const data = await getAlbums();
      // setAlbums(data);
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
