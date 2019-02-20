import React, { setGlobal } from 'reactn';
import ReactDOM from 'react-dom';
import './index.css';
import MainPage from './components/MainPage';
import * as serviceWorker from './serviceWorker';

const YEAR_FILTER = 1;
const PRICE_FILTER = 2;

// initialize global state;
setGlobal({
  albums: [],
  filteredAlbums: [],
  firstLevelFilter: null,
  secondLevelFilter: null,
});

ReactDOM.render(<MainPage />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
