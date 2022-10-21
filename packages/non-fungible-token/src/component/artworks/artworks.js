import React, { useState, useEffect } from "react";
import Artwork from "./artwork";
import Card from "./card";
import { areEqual } from "../util/util";
import Loader from "../util/loader";
import { useNavigate } from "react-router-dom";

function Artworks(props) {
  const navigate = useNavigate();
  const { computer } = props;
  const [revs, setRevs] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
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
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    })();

    // eslint-disable-next-line
  }, [computer]);

  return (
    <div className="mt-36">
      <div className="grid grid-cols-1 pl-40 pr-40">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <h1 className="font-bold text-3xl ">Your Art Works</h1>
          </div>
        </div>

        <div className="flex flex-wrap">
          {artworks.map((artwork, index) => (
            <Card artwork={artwork} rev={revs[index]} key={artwork.url} />
          ))}
        </div>
        {artworks.length === 0 && !loading && (
          <div className="h-96 w-full grid grid-cols-1 gap-4 place-items-center">
            <button
              onClick={() => {
                navigate("/art/artworkform");
              }}
              className="py-3 w-64 text-xl text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Create your first art work
            </button>
          </div>
        )}
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default Artworks;
