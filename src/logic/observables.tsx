import { BehaviorSubject } from 'rxjs';
import Album from '../types/Album';

export let albums$: BehaviorSubject<Album[]>;
export let filteredAlbums$: BehaviorSubject<Album[]>;
export let isFiltered$: BehaviorSubject<boolean>;

export const initializeGlobalObservables = () => {
  const initialAlbums: Album[] = [];
  albums$ = new BehaviorSubject(initialAlbums);
  filteredAlbums$ = new BehaviorSubject(initialAlbums);
  isFiltered$ = new BehaviorSubject(false);
}

