import Box from "@mui/material/Box";
import { ReactComponent as FooterSvg } from "./social/footer.svg";
import "./Footer.css";

function Footer() {
  return (
    <Box className="footer-container">
      <FooterSvg />
    </Box>
  );
}

export default Footer;
