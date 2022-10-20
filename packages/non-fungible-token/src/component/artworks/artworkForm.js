import React, { useState } from "react";
import Artwork from "./artwork";
import { useNavigate } from "react-router-dom";
import SnackBar from "../util/snackBar";
import Loader from "../util/loader";

function ArtworkForm(props) {
  const navigate = useNavigate();
  const { computer } = props;
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      setDisabled(true);
      if (!title) {
        setMessage("Provide valid title.");
        setSuccess(false);
        setShow(true);
        return;
      }
      if (!artist) {
        setMessage("Provide valid artist.");
        setSuccess(false);
        setShow(true);
        return;
      }
      if (!url) {
        setMessage("Provide valid url.");
        setSuccess(false);
        setShow(true);
        return;
      }
      setLoading(true);
      await computer.new(Artwork, [title, artist, url]);

      setMessage("NFT minted.");
      setSuccess(true);
      setShow(true);
      setTimeout(() => {
        setLoading(false);
        navigate("/");
      }, 2000);
    } catch (err) {
      setLoading(false);
      setDisabled(false);
      setMessage(err.message);
      setSuccess(false);
      setShow(true);
    }
  };

  return (
    <div className="mt-36">
      <div className="grid grid-cols-1 gap-4 h-96">
        <div className="sm:mx-auto sm:w-full pl-40 pr-40">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <h1 className="font-bold text-3xl ">Create a new artwork </h1>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border grid place-items-center">
              {!url && (
                <img
                  className="max-h-52 w-auto"
                  src="/small-placeholder.png"
                  alt="NFT"
                />
              )}
              {url && <img className="h-100 w-auto" src={url} alt="NFT" />}
            </div>
            <div>
              <form onSubmit={handleSubmit} className="p-10 border ">
                <div className="mb-6">
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                  >
                    Title
                  </label>
                  <input
                    type="string"
                    placeholder="Title"
                    className="block  py-3 px-4 rounded-lg w-full border outline-none"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required={true}
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="artist"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                  >
                    Artist
                  </label>
                  <input
                    type="string"
                    placeholder="Artist"
                    className="block  py-3 px-4 rounded-lg w-full border outline-none "
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required={true}
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="url"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                  >
                    URL
                  </label>

                  <input
                    type="string"
                    placeholder="URL"
                    className="block  py-3 px-4 rounded-lg w-full border outline-none "
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required={true}
                  />
                </div>

                <button
                  disabled={disabled}
                  type="submit"
                  value="Send Litecoin"
                  className="text-white  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Create Artwork
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {show && (
        <SnackBar success={success} message={message} setShow={setShow} />
      )}
      {loading && <Loader />}
    </div>
  );
}

export default ArtworkForm;
