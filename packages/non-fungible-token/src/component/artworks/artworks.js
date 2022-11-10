import React from "react";
import Card from "./card";

function Artworks(props) {
  const { artworks, revs } = props;

  return (
    <div>
      <div className="flex flex-wrap">
        {artworks.map((artwork, index) => (
          <Card artwork={artwork} rev={revs[index]} key={artwork.url} />
        ))}
      </div>
    </div>
  );
}

export default Artworks;
