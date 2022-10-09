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
    <div className="ArtworkForm">
      {
        <div>
          <h2>Create new Artwork</h2>
          <form onSubmit={handleSubmit}>
            Title
            <br />
            <input
              type="string"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            Artist
            <br />
            <input
              type="string"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
            Url
            <br />
            <input
              type="string"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button type="submit" value="Send Litecoin">
              Create Artwork
            </button>
          </form>
        </div>
      }
    </div>
  );
}

export default ArtworkForm;
