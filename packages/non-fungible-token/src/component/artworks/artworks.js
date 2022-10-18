import React, { useState, useEffect } from "react";
import Artwork from "./artwork";
import Card from "./card";
import { areEqual } from "../util/util";
import { NavLink } from "react-router-dom";

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
    <div className="mt-40 sm:mx-auto sm:w-full sm:max-w-3xl ">
      <div className="text-center my-5">
        <h1 className="font-medium text-xl ">Your Art Works</h1>
        <NavLink to="/art/artworkform" className="underline col-blue">
          create new artwork
        </NavLink>
      </div>
      <ul className="flex-container grid grid-cols-3 gap-1">
        {artworks.map((artwork) => (
          <Card artwork={artwork} key={artwork.url} />
        ))}
      </ul>{" "}
    </div>
  );
}

export default Artworks;
