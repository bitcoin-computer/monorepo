import React, { useState, useEffect } from "react";
import Artwork from "./artwork";
import Card from "./card";
import { areEqual } from "../util/util";
import Loader from "../util/loader";

function Artworks(props) {
  const { computer } = props;
  const [revs, setRevs] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
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
          console.log(newArts);
          setArtworks(newArts);
          setLoading(false);
        } else {
          console.log("no new art added");
        }
        setRevs(newRevs);
      }
    })();

    // eslint-disable-next-line
  }, [computer]);

  return (
    <div className="mt-36">
      <div class="grid grid-cols-1 pl-40 pr-40">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <h1 className="font-medium text-2xl ">Your Art Works</h1>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-12">
          {artworks.map((artwork, index) => (
            <Card artwork={artwork} rev={revs[index]} key={artwork.url} />
          ))}
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default Artworks;
