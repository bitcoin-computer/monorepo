import React, { useState } from "react";
import { BRC721 } from "./brc721";

function BRCTest(props) {
  const { computer } = props;
  const [brc721] = useState(new BRC721(computer));
  const [balace, setBalance] = useState(0);

  const mint = async () => {
    await brc721.mint(computer.getPublicKey(), "Vivek", "VIV");
    setBalance(await brc721.balanceOf(computer.getPublicKey()));
  };

  return (
    <div className="Artworks">
      <p>balance: {balace}</p>
      <button onClick={() => mint()}>mint</button>
    </div>
  );
}

export default BRCTest;
