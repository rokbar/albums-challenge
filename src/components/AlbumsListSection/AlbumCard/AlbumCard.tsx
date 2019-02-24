import React from "react";
import './AlbumCard.css';

function AlbumCard({ title, image, year, price: { label } }: {
  title: string,
  image: string,
  year: number,
  price: { label: string }
}) {
  return (
    <div className="AlbumCard">
      <img className="AlbumCard__image" src={image} />
      <span>{title}</span>
      <div className="AlbumCard__details">
        <span className="AlbumCard__price">{label}</span>
        <span className="AlbumCard__year">{year}</span>
      </div>   
    </div>
  );
}

export default AlbumCard;
