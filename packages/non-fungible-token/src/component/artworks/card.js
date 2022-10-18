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
    <div
      key={artwork._rev}
      onClick={handleClick}
      class="max-w-sm w-12.5  bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
    >
      <a href={artwork.url || artwork.imageUrl}>
        <img
          class="rounded-t-lg"
          src={artwork.url || artwork.imageUrl}
          alt={artwork.title}
        />
      </a>
      <div class="p-5">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {artwork.title}
        </h5>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {artwork.artist}
        </p>
      </div>
    </div>
  ) : (
    <></>
  );
};
export default artworkCard;
