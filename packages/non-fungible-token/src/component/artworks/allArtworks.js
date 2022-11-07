import React, { useState, useEffect } from "react";
import Artwork from "./artwork";
import { areEqual } from "../util/util";
import Loader from "../util/loader";
import Artworks from "./artworks";
import { useNavigate } from "react-router-dom";

function AllArtworks(props) {
  const navigate = useNavigate();
  const { computer, publicKey, setPublicKey } = props;
  const [revs, setRevs] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pageNum, setPageNum] = useState(0);
  const [isNextAvailable, setIsNextAvailable] = useState(true);
  const [isPrevAvailable, setIsPrevAvailable] = useState(
    pageNum === 0 ? false : true
  );

  let artsPerPage = 4;
  let limit = artsPerPage + 1;

  const getArts = async () => {
    if (computer) {
      const newRevs = await computer.query({
        contract: Artwork,
        publicKey: publicKey,
        limit,
        offset: pageNum * artsPerPage,
      });

      const totalRevsReceived = newRevs.length;
      // more items are available
      if (totalRevsReceived <= artsPerPage) {
        setIsNextAvailable(false);
      } else {
        setIsNextAvailable(true);
        newRevs.splice(-1);
      }
      setIsPrevAvailable(pageNum === 0 ? false : true);

      if (!areEqual(revs, newRevs)) {
        // sync art work when revs are not same
        const newArts = await Promise.all(
          newRevs.map(async (rev) => computer.sync(rev))
        );
        setArtworks(newArts);
        newArts.forEach((art) => console.log("art: ", art));
        setLoading(false);
      } else {
        console.log("no new art added");
      }
      setRevs(newRevs);
    }
  };

  const handleNext = async () => {
    setPageNum(pageNum + 1);
  };

  const handlePrev = async () => {
    setIsNextAvailable(true);
    setPageNum(pageNum - 1);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await getArts();
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    })();

    // eslint-disable-next-line
  }, [computer, pageNum, publicKey]);

  useEffect(() => {
    (async () => {
      setIsPrevAvailable(false);
      setPageNum(0);
    })();

    // eslint-disable-next-line
  }, [publicKey]);

  return (
    <div className="mt-36">
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
      <div className="grid grid-cols-1 pl-40 pr-40 h-120">
        {artworks.length !== 0 && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex flex-row">
                <h1 className="font-bold text-3xl">
                  {publicKey === computer.getPublicKey()
                    ? "My Arts"
                    : publicKey
                    ? "Arts Found"
                    : "All Arts"}
                </h1>
                {publicKey && (
                  <button
                    onClick={() => setPublicKey("")}
                    class="h-10 ml-4 p-2 w-20 mr-4 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    <span>Go to All</span>
                  </button>
                )}
              </div>
              <nav className="h-20">
                <ul class="flex justify-center pt-2">
                  <li>
                    <button
                      disabled={!isPrevAvailable}
                      onClick={handlePrev}
                      className="py-2 w-16 mr-4 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-slate-400"
                    >
                      Prev
                    </button>
                  </li>
                  <li>
                    <button
                      disabled={!isNextAvailable}
                      onClick={handleNext}
                      className="py-2 w-16 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-slate-400"
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            {!loading && <Artworks artworks={artworks} revs={revs} />}
          </div>
        )}
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default AllArtworks;
