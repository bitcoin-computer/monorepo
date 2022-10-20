import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../util/loader";
import SnackBar from "../util/snackBar";

function ArtworkDetails(props) {
  const navigate = useNavigate();
  const { computer } = props;
  let params = useParams();
  const [artwork, setArtwork] = useState({});
  const [txnId] = useState(params.txnId);
  const [outNum] = useState(params.outNum);
  const [disabled, setDisabled] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (computer) {
        try {
          const newArtwork = await computer.sync(`${txnId}/${outNum}`);
          setArtwork(newArtwork);
          setLoading(false);
        } catch (error) {
          setMessage(error.message);
          setSuccess(false);
          setShow(true);
          setTimeout(async () => {
            navigate("/");
          }, 4000);
        }
      }
    })();

    // eslint-disable-next-line
  }, [computer]);

  const handleSend = async () => {
    setDisabled(true);
    try {
      if (!receiverAddress) {
        setDisabled(false);
        setMessage("Please provide a valid address");
        setSuccess(false);
        setShow(true);
        return;
      }

      await artwork.setOwner(receiverAddress);
      setMessage("Successfully Sent");
      setSuccess(true);
      setShow(true);
      setTimeout(async () => {
        navigate("/");
      }, 4000);
    } catch (error) {
      setDisabled(false);
      setMessage(error.message);
      setSuccess(false);
      setShow(true);
    } finally {
      console.log("NFT sent successfully.");
    }
  };

  return (
    <div className="mt-36">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-96 pl-40">
          <img
            className="h-96"
            src={artwork.url || artwork.imageUrl}
            alt={artwork.title}
          />
        </div>
        <div className="h-96 pr-40">
          <h1 className="text-3xl font-bold mb-4">{artwork.title}</h1>
          <div className="space-y-2">
            <h2 className="font-bold">{artwork.artist}</h2>
            <h2>
              Token ID:{" "}
              <span className="font-bold">
                {txnId}/{outNum}
              </span>
            </h2>
            <h2>
              Chain: <span className="font-bold">Litecoin</span>
            </h2>
            <h2>
              Token Standard: <span className="font-bold">BRC721</span>
            </h2>
            <h2>
              Network:
              <span className="font-bold">{computer.getNetwork()}</span>
            </h2>
            <input
              type="string"
              placeholder="Public Key of Receiver"
              className="block  py-3 px-4 rounded-lg w-full border outline-none hover:shadow-inner"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
            />
          </div>
          {/*login button*/}
          <div className=" mt-6">
            <button
              disabled={disabled}
              onClick={handleSend}
              className="py-3 w-64 text-xl text-white bg-blue-400 rounded-2xl"
            >
              Send
            </button>
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

export default ArtworkDetails;
