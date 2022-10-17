import React, { useState } from "react";
import Artwork from "./artwork";

function ArtworkForm(props) {
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
    } catch (err) {
      console.log("error occurred while creating art: ", err);
    } finally {
      setTitle("");
      setArtist("");
      setUrl("");
    }
  };

  return (
    // <div className="ArtworkForm">
    //   {
    //     <div>
    //       <h2>Create new Artwork</h2>
    //       <form onSubmit={handleSubmit}>
    //         Title
    //         <br />
    //         <input
    //           type="string"
    //           value={title}
    //           onChange={(e) => setTitle(e.target.value)}
    //         />
    //         Artist
    //         <br />
    //         <input
    //           type="string"
    //           value={artist}
    //           onChange={(e) => setArtist(e.target.value)}
    //         />
    //         Url
    //         <br />
    //         <input
    //           type="string"
    //           value={url}
    //           onChange={(e) => setUrl(e.target.value)}
    //         />
    //         <button type="submit" value="Send Litecoin">
    //           Create Artwork
    //         </button>
    //       </form>
    //     </div>
    //   }
    // </div>
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md ">
      <div className="text-center mb-5">
        <h1 className="font-medium text-xl ">Create new art work</h1>
        <a href="/art/artworks" className="underline col-blue">
          your art works
        </a>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-10 shadow-xl bg-slate-200  rounded-lg "
      >
        <div class="mb-6">
          <label
            for="title"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Title
          </label>
          <input
            type="string"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required=""
          />
        </div>
        <div class="mb-6">
          <label
            for="artist"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Artist
          </label>
          <input
            type="string"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required=""
          />
        </div>
        <div class="mb-6">
          <label
            for="url"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Url
          </label>
          <input
            type="string"
            id="url"
            value={url}
            onChange={(e) => setArtist(e.target.value)}
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required=""
          />
        </div>

        <button
          type="submit"
          value="Send Litecoin"
          class="text-white  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Create Artwork
        </button>
      </form>
    </div>
  );
}

export default ArtworkForm;
