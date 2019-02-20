import React from "react";
import './AlbumCard.css';

function AlbumCard({ title, image, price: { label } }) {
  return (
    <div className="AlbumCard">
      <img className="AlbumCard__image" src={image} />
      <span>{title}</span>
      <span className="AlbumCard__price">{label}</span>
    </div>
  );
}

export default AlbumCard;
