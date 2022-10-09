import React, { useState, useEffect } from "react";
import Artwork from "./artwork";
import Card from "./card";
import { areEqual } from "./util";

function Artworks(props) {
  const { computer } = props;
  const [revs, setRevs] = useState([]);
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (computer) {
        const newRevs = await computer.query({
          contract: Artwork,
          publicKey: computer.getPublicKey(),
        });

        // sync art work when revs are not same
        if (!areEqual(revs, newRevs)) {
          const newArts = await Promise.all(
            newRevs.map(async (rev) => computer.sync(rev))
          );
          setArtworks(newArts);
        } else {
          console.log("no new art added");
        }
        setRevs(newRevs);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [computer]);

  return (
    <div className="Artworks">
      <h2>Your Artworks</h2>
      <ul className="flex-container">
        {artworks.map((artwork) => (
          <Card artwork={artwork} key={artwork.url} />
        ))}
      </ul>{" "}
    </div>
  );
}

export default Artworks;
