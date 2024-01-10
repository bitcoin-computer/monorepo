import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Feature from "./Feature";
import "./Features.css";

function Features() {
  return (
    <Box className="featuresContainer">
      <Box className="horizontal-grid-line-1" />
      <Box className="horizontal-grid-line-2" />
      <Box className="horizontal-grid-line-3" />
      <Box className="horizontal-grid-line-4" />
      <Box className="horizontal-grid-line-5" />
      <Box className="vertical-grid-line-1" />
      <Box className="vertical-grid-line-2" />
      <Box className="vertical-grid-line-3" />
      <Box className="vertical-grid-line-4" />
      <Box className="vertical-grid-line-5" />
      <Box className="vertical-grid-line-6" />
      <Box className="vertical-grid-line-7" />
      <Grid container className="featuresGridWrapper">
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Easy to Use"
            text="Smart contracts are written in Javascript. If you know Javascript you can write smart contracts."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Free computation"
            text="On other blockchains almost all algorithms are prohibitively expensive. On Bitcoin all algorithms have the same cost: the cost of a payment.
          This makes it possible, for the first time, to run compute intense algorithms as smart contracts."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Pure Bitcoin"
            text="Smart contracts on Bitcoin are as decentralized as Bitcoin itself. The Bitcoin Computer does not depend on a side-chain, this means that smart contracts will continue to work as long as Bitcoin is available."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Off-Chain storage"
            text="Which data needs to be stored on-chain vs securely hashed and off-chain is application dependent. We make it easy for the programmer to store data off-chain."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Encryption"
            text="Built to balance privacy with compliance: all smart contract data can be encrypted but flows of money are un-encrypted to enable anti-money laundering efforts."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Cross-Chain"
            text="We want the Bitcoin Computer to work on all Bitcoin-like currencies. We are launching on Litecoin and will add support for other currencies over time."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Trustless"
            text="You can run your own Bitcoin Computer Node to gain trustless access to the blockchain. You can deploy a node locally with one line of code."
          />
        </Grid>
      </Grid>
      <Box className="graph-container">
        <img
          className="graph2"
          src="/Graph-2.png"
          alt="graph2"
        />
      </Box>
    </Box>
  );
}

export default Features;
