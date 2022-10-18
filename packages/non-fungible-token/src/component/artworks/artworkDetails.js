import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ArtworkDetails(props) {
  const navigate = useNavigate();
  const { computer } = props;
  let params = useParams();
  const [artwork, setArtwork] = useState({});
  const [revId] = useState(params.revId);
  const [version] = useState(params.version);
  const [disabled, setDisabled] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (computer) {
        // add try catch and error handling
        // txnId and outputNumber
        const newArtwork = await computer.sync(`${revId}/${version}`);
        setArtwork(newArtwork);
        console.log("new artwork: ", artwork);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [computer]);

  const handleSend = async () => {
    setDisabled(true);
    try {
      if (!receiverAddress) {
        setDisabled(false);
        alert("Provide valid title.");
      }
      await artwork.setOwner(receiverAddress);
      setSuccess(true);
      setTimeout(async () => {
        navigate("/");
      }, 3000);
    } catch (error) {
      setDisabled(false);
      console.log("error while sending NFT, ", error);
    } finally {
      console.log("NFT sent successfully.");
    }
  };

  return (
    <div className="mt-40 sm:mx-auto sm:w-full sm:max-w-3xl ">
      <div className="py-12 px-12 bg-white rounded-2xl shadow-xl z-20">
        <div>
          <h1 className="text-3xl font-bold text-center mb-4 cursor-pointer">
            {artwork.title}
          </h1>
        </div>
        <div className="mt-10">
          <img
            className="rounded-t-lg max-h-60"
            src={artwork.url || artwork.imageUrl}
            alt={artwork.title}
          />
        </div>
        <div className="space-y-4">
          <p className="font-sans">{artwork.artist}</p>
          <input
            type="string"
            placeholder="Public Key of Receiver"
            className="block  py-3 px-4 rounded-lg w-full border outline-none hover:shadow-inner"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
          />
        </div>
        {/*login button*/}
        <div className="text-center mt-6">
          <button
            disabled={disabled}
            onClick={handleSend}
            className="py-3 w-64 text-xl text-white bg-blue-400 rounded-2xl"
          >
            Send
          </button>
        </div>
      </div>
      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded fixed top-40 right-2"
          role="alert"
        >
          <strong className="font-bold">Successfully sent!</strong>
        </div>
      )}
    </div>
  );
}

export default ArtworkDetails;
