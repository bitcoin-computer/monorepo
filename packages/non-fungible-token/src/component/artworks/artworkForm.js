import React, { useState } from "react";
import Artwork from "./artwork";
import { useNavigate, NavLink } from "react-router-dom";

function ArtworkForm(props) {
  const navigate = useNavigate();
  const { computer } = props;
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      if (!title) {
        alert("Provide valid title.");
        return;
      }
      if (!artist) {
        alert("Provide valid artist.");
        return;
      }
      if (!url) {
        alert("Provide valid url.");
        return;
      }
      const artwork = await computer.new(Artwork, [title, artist, url]);
      console.log("created artwork", artwork);
      navigate("/");
    } catch (err) {
      console.log("error occurred while creating art: ", err);
    } finally {
      setTitle("");
      setArtist("");
      setUrl("");
    }
  };

  return (
    <div className="mt-40 sm:mx-auto sm:w-full sm:max-w-3xl ">
      <div className="text-center mb-5">
        <h1 className="font-medium text-xl ">Create new art work</h1>
        <NavLink to="/" className="underline col-blue">
          your art works
        </NavLink>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-10 shadow-xl bg-gray-100  rounded-lg "
      >
        <div className="mb-6">
          <label
            for="title"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
          >
            Title
          </label>
          <input
            type="string"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required={true}
          />
        </div>
        <div className="mb-6">
          <label
            for="artist"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
          >
            Artist
          </label>
          <input
            type="string"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required={true}
          />
        </div>
        <div className="mb-6">
          <label
            for="url"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
          >
            Url
          </label>
          <input
            type="string"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required={true}
          />
        </div>

        <button
          type="submit"
          value="Send Litecoin"
          className="text-white  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Create Artwork
        </button>
      </form>
    </div>
  );
}

export default ArtworkForm;
