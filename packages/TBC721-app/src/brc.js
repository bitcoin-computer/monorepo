import React, { useState } from "react";
import { TBC721 } from "./tbc721";

function BRCTest(props) {
  const { computer } = props;
  const [tbc721] = useState(new TBC721(computer));
  const [balace, setBalance] = useState(0);

  const mint = async () => {
    await tbc721.mint(computer.getPublicKey(), "Vivek", "VIV");
    setBalance(await tbc721.balanceOf(computer.getPublicKey()));
  };

  return (
    <div className="Artworks">
      <p>balance: {balace}</p>
      <button onClick={() => mint()}>mint</button>
    </div>
  );
}

export default BRCTest;
