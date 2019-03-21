import React, { setGlobal } from 'reactn';
import ReactDOM from 'react-dom';
import './index.css';
import MainPage from './components/MainPage';
import * as serviceWorker from './serviceWorker';

// initialize global state;
setGlobal({
  albums: [],
  filteredAlbums: [],
  isFiltered: false,
});

ReactDOM.render(<MainPage />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
