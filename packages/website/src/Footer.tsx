import Box from '@mui/material/Box'
// @ts-expect-error importing svg
import FooterSvg from './social/footer.svg?react'
import './Footer.css'

function Footer() {
  return (
    <Box className="footer-container">
      <FooterSvg />
    </Box>
  )
}

export default Footer
