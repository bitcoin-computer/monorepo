import Box from "@mui/material/Box";
import "./Pricing.css";

function Pricing() {
  return (
    <Box className="pricing-container" sx={{ backgroundColor: "#0046FF" }} id="pricing">
      <Box className="horizontal-pricing-grid-line-1 grid-opacity" />
      <Box className="horizontal-pricing-grid-line-2 grid-opacity" />
      <Box className="horizontal-pricing-grid-line-3 grid-opacity" />
      <Box className="horizontal-pricing-grid-line-4 grid-opacity" />
      <Box className="vertical-grid-line-1 grid-opacity" />
      <Box className="vertical-grid-line-2 grid-opacity" />
      <Box className="vertical-grid-line-3 grid-opacity" />
      <Box className="vertical-grid-line-4 grid-opacity" />
      <Box className="vertical-grid-line-5 grid-opacity" />
      <Box className="vertical-grid-line-6 grid-opacity" />
      <Box className="vertical-grid-line-7 grid-opacity" />
      <Box className="pricing-heading">Pricing</Box>
      <Box className="pricing-option-1">
        Free forever<br />on testnet
      </Box>
      <Box className="pricing-option-2">
        Low fixed fee<br />on mainnet
      </Box>
      <Box className="pricing-option-3">

      </Box>
      <Box className="graph3" />
    </Box>
  );
}

export default Pricing;
