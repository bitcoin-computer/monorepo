import Box from "@mui/material/Box";
import "./Introduction.css";

function Introduction() {
  return (
    <Box className="GridBGFirst">
      <Box className="horizontal-grid-line-1" />
      <Box className="horizontal-grid-line-2" />
      <Box className="horizontal-grid-line-3" />
      <Box className="horizontal-grid-line-4" />
      <Box className="horizontal-grid-line-5" />
      <Box className="horizontal-grid-line-7" />
      <Box className="vertical-grid-line-1" />
      <Box className="vertical-grid-line-2" />
      <Box className="vertical-grid-line-3" />
      <Box className="vertical-grid-line-4" />
      <Box className="vertical-grid-line-5" />
      <Box className="vertical-grid-line-6" />
      <Box className="vertical-grid-line-7" />
      <Box className="TuringCompleteGraph1" />
      <Box className="cross-grid-1" />
      <Box className="cross-grid-2" />
      <Box className="cross-grid-3" />
      <Box className="cross-grid-4" />
      <Box className="features" id="features">Features</Box>
      <Box className="headingWrapper">
        <Box className="headline">
          <p>Turing Complete Smart Contracts</p>
          <p>for Bitcoin.</p>
        </Box>
        <Box className="subHeading">
          <p>Bitcoin Computer is an easy to use smart contract system for Bitcoin.</p>
          <p>You can build fungible and non-fungible tokens (NFTs), games, social</p>
          <p>networks, exchanges, auctions, voting, office applications, artificial</p>
          <p>intelligence ... anything really.</p>
        </Box>
      </Box>
    </Box>
  );
}

export default Introduction;
