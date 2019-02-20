import React from 'react';
import AlbumsListSection from './AlbumsListSection';
import FiltersSection from './FiltersSection';
import './MainPage.css';

function MainPage() {
  return (
    <div className="MainPage">
      <FiltersSection />
      <AlbumsListSection />
    </div>
  );
}

export default MainPage;
