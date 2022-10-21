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
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="pl-32 mb-4">
          <h1 className="font-bold text-3xl ">Send NFT</h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full pl-32">
            <img
              className="w-full h-auto"
              src={artwork.url || artwork.imageUrl}
              alt={artwork.title}
            />
          </div>
          <div className="h-96 pr-32">
            <h1 className="text-3xl font-bold mb-4">{artwork.title}</h1>
            <div className="space-y-2">
              <h2 className="font-bold">{artwork.artist}</h2>
              <h2>
                <span className="font-bold">Token ID</span>: {txnId}/{outNum}
              </h2>
              <h2>
                <span className="font-bold">Chain</span>: Litecoin
              </h2>
              <h2>
                <span className="font-bold">Token Standard</span>: BRC721
              </h2>
              <h2>
                <span className="font-bold">Network</span>:{" "}
                {computer.getNetwork()}
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
      </div>
      {show && (
        <SnackBar success={success} message={message} setShow={setShow} />
      )}
      {loading && <Loader />}
    </div>
  );
}

export default ArtworkDetails;
