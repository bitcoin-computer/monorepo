import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Feature from './Feature'
import './Features.css'

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
            text="Smart contracts on the Bitcoin Computer are written in JavaScript. If you are familiar with JavaScript, you can easily develop your own smart contracts using our platform."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Free computation"
            text="Unlike other platforms where computation is prohibitively expensive, Bitcoin Computer standardizes costs: every algorithm incurs only the cost of a payment. This unique cost structure opens up new possibilities for deploying compute-intensive algorithms within smart contracts."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Pure Bitcoin"
            text="Smart contracts on Bitcoin boast the same level of decentralization as Bitcoin itself. The Bitcoin Computer operates without relying on a side-chain, ensuring that smart contracts remain functional as long as Bitcoin exists."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Off-Chain storage"
            text="The choice between storing data on-chain or securely hashing it off-chain depends on the application. Our platform simplifies the process for programmers to store data off-chain efficiently, allowing for tailored data management strategies."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Encryption"
            text="Designed to balance privacy with compliance, our platform ensures that while all smart contract data can be encrypted for privacy, monetary transactions remain transparent to support anti-money laundering initiatives."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Cross-Chain"
            text="Our goal is for the Bitcoin Computer to be compatible with all Bitcoin-like currencies. Initially launching with support for Litecoin, we plan to progressively include additional currencies to enhance accessibility and versatility."
          />
        </Grid>
        <Grid item xs={4} className="feature featuresGridItem">
          <Feature
            heading="Trustless"
            text="Operate your own Bitcoin Computer Node for trustless blockchain access. Deploy a node locally with just a single line of code, ensuring full control and direct interaction with the blockchain."
          />
        </Grid>
      </Grid>
      <Box className="graph-container">
        <img className="graph2" src="/Graph-2.png" alt="graph2" />
      </Box>
    </Box>
  )
}

export default Features
