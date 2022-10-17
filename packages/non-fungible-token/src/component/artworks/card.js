import "./card.css";
import React from "react";

const artworkCard = ({ artwork }) => {
  const handleClick = async () => {
    const publicKey = prompt("Please enter the public key of the new owner");
    try {
      if (publicKey) {
        await artwork.setOwner(publicKey);
      }
    } catch (error) {
      console.log("error while sending NFT, ", error);
    } finally {
      console.log("NFT sent successfully.");
    }
  };

  return artwork ? (
    <li key={artwork._rev} className="card" onClick={handleClick}>
      <img src={artwork.url || artwork.imageUrl} alt={artwork.title} />
      <div className="container">
        <b>{artwork.title}</b>
        <br />
        {artwork.artist}
        <br />
      </div>
    </li>
  ) : (
    <></>
  );
};
export default artworkCard;
