import "./card.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ArtworkCard({ artwork, rev }) {
  const [revId] = useState(rev);
  const navigate = useNavigate();

  const openArtPage = (evt) => {
    evt.preventDefault();
    navigate(`/art/${revId}`);
  };

  return artwork ? (
    <div
      key={artwork._rev}
      onClick={openArtPage}
      className="bg-white rounded-lg border border-gray-200 cursor-pointer"
    >
      <div className="w-full flex justify-center align center">
        <img
          className="rounded-t-lg max-h-80 w-auto"
          src={artwork.url || artwork.imageUrl}
          alt={artwork.title}
        />
      </div>

      <div className="pl-2 pt-2">
        <h1 className="mb-2 text-xl font-bold text-black">{artwork.title}</h1>
        <p className="mb-3 font-normal text-gray-900">{artwork.artist}</p>
      </div>
    </div>
  ) : (
    <></>
  );
}
export default ArtworkCard;
