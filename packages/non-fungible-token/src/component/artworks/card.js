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
      className="max-w-sm w-12.5  bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
    >
      <a href={artwork.url || artwork.imageUrl}>
        <img
          className="rounded-t-lg"
          src={artwork.url || artwork.imageUrl}
          alt={artwork.title}
        />
      </a>
      <div className="p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {artwork.title}
        </h5>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {artwork.artist}
        </p>
      </div>
    </div>
  ) : (
    <></>
  );
}
export default ArtworkCard;
