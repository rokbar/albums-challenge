import { BehaviorSubject } from 'rxjs';
import Album from '../types/Album';

type GlobalState = {
  albums: Array<Album>,
  filteredAlbums: Array<Album>,
  isFiltered: boolean | number,
};

export let initialGlobalState: GlobalState = {
  albums: [],
  filteredAlbums: [],
  isFiltered: false,
};

const globalStateObservable = new BehaviorSubject(initialGlobalState);

export default globalStateObservable;
