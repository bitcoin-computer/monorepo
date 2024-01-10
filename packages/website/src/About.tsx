import Box from "@mui/material/Box";
import "./About.css";
import Profile from "./Profile";

function About() {
  return (
    <Box className="about-container" id="about">
      <Box className="horizontal-about-grid-line-1 grid-opacity" />
      <Box className="horizontal-about-grid-line-2 grid-opacity" />
      <Box className="horizontal-about-grid-line-3 grid-opacity" />
      <Box className="horizontal-about-grid-line-4 grid-opacity" />
      <Box className="horizontal-about-grid-line-5 grid-opacity" />
      <Box className="vertical-grid-line-1 grid-opacity" />
      <Box className="vertical-grid-line-2 grid-opacity" />
      <Box className="vertical-grid-line-3 grid-opacity" />
      <Box className="vertical-grid-line-4 grid-opacity" />
      <Box className="vertical-grid-line-5 grid-opacity" />
      <Box className="vertical-grid-line-6 grid-opacity" />
      <Box className="vertical-grid-line-7 grid-opacity" />
      <Box className="about-heading">About</Box>
      <Box className="text-1">
        Building smart contracts on Bitcoin since 2018.
      </Box>
      {/* <Box className="text-2">
        Initially we just wanted to prove a point: that all smart contracts can be built on Bitcoin. Over time we discovered that smart contracts on Bitcoin have a big advantage over smart contracts on Ethereum and other chains.
      </Box> */}
      <Box className="cv-1">
        <Profile
          name="Clemens"
          link="https://www.linkedin.com/in/clemens-ley-444b6b3b/"
          text="PhD in computer science from Oxford University specializing in database theory. PostDoc at EPFL in database systems. Co-founded BetTube (an app for predicting viral YouTube videos), Yours.org (a social network with Bitcoin integration), and Forest Park Group (a fintech company). Inventor and co-founder of the Bitcoin Computer."
        />
      </Box>
      <Box className="cv-2">
        <Profile
          name="Laura"
          text="Tenured professor in computer science at the National University of Rio Cuarto teaching operating systems and computer organization. Previously taught databases, advanced algorithms, and comparative analysis of programming languages. PhD from the National University of San Luis, Argentina in parallel and distributed computing."
        />
      </Box>
      <Box className="cv-3">
        <Profile
          name="Vivek"
          text="Bachelors degree in Computer Science from National Institute of Technology Bhopal (part of NIT, the Indian counterpart to the US Ivy League). AWS solutions architect."
        />
      </Box>
      <Box className="information-text">
        <a href="https://docs.bitcoincomputer.io" rel="noreferrer" target="_blank" className="button-lb">
          <b>Read the Documentation</b>
        </a>
      </Box>
    </Box>
  );
}

export default About;
