import './App.css'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
// @ts-expect-error importing svg
import Telegram from './social/telegram.svg?react'
// @ts-expect-error importing svg
import YouTube from './social/youtube.svg?react'
// @ts-expect-error importing svg
import GitHub from './social/github.svg?react'
// @ts-expect-error importing svg
import Twitter from './social/twitter.svg?react'
import Features from './Features'
import Pricing from './Pricing'
import Examples from './Examples'
import About from './About'
import Introduction from './Introduction'
// @ts-expect-error importing svg
import ArrowLink from './social/arrow.svg?react'

function App() {
  return (
    <div className="App">
      <header className="header">
        <Grid container sx={{ height: '6vw' }}>
          <Grid item xs={3} sx={{ textAlign: 'left' }}>
            <img src="/logo/BitcoinComputer-Logo.png" height="40px" alt="logo" />
          </Grid>
          <Grid item xs={9} className="navigation">
            <nav>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#examples">Examples</a>
              <a href="https://docs.bitcoincomputer.io" target="_blank" rel="noreferrer">
                Docs
                <ArrowLink className="docsLink" />
              </a>
              <a href="#about">About</a>
            </nav>
          </Grid>
        </Grid>
      </header>
      {/* <BitcoinHeader className="header" /> */}
      <Introduction />
      <Features />
      <Pricing />
      <Examples />
      <About />
      {/* <Footer /> */}
      <Box className="contact-container">
        <Box className="vertical-grid-line-1 grid-opacity" />
        <Box className="vertical-grid-line-2 grid-opacity" />
        <Box className="vertical-grid-line-3 grid-opacity" />
        <Box className="vertical-grid-line-4 grid-opacity" />
        <Box className="vertical-grid-line-5 grid-opacity" />
        <Box className="vertical-grid-line-6 grid-opacity" />
        <Box className="vertical-grid-line-7 grid-opacity" />
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1 }} className="ContentBox ColorWhite">
          <Grid item xs={4} className="contact-email-wrapper">
            <p className="contact-email-wrapper-first">Get in touch</p>
            <p className="contact-email-wrapper-second">
              <a href="mailto:clemens@bitcoincomputer.io">clemens@bitcoincomputer.io</a>
            </p>
          </Grid>
          <Grid item xs={4} className="social-links">
            <Grid item xs={12}>
              <a href="https://twitter.com/thebitcointoken" rel="noreferrer" target="_blank">
                <Twitter height="50px" width="50px" viewBox="0 0 26 26"></Twitter>
              </a>
              <a href="https://t.me/thebitcoincomputer" rel="noreferrer" target="_blank">
                <Telegram height="50px" width="50px" viewBox="0 0 26 26"></Telegram>
              </a>
              <a href="https://www.youtube.com/c/ClemensLey" rel="noreferrer" target="_blank">
                <YouTube height="50px" width="50px" viewBox="0 0 26 26"></YouTube>
              </a>
              <a href="https://github.com/bitcoin-computer" rel="noreferrer" target="_blank">
                <GitHub height="50px" width="50px" viewBox="0 0 26 26"></GitHub>
              </a>
            </Grid>
          </Grid>
          <Grid item xs={4} className="copyright">
            <p>Copyright © 2022 Bitcoin Computer. All rights reserved.</p>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default App
