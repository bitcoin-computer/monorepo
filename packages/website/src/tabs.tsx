import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CodeSectionNonFungible from "./CodeSectionNonFungible";
import CodeSectionFungible from "./CodeSectionFungible";
import CodeSectionChat from "./CodeSectionChat";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        paddingTop: "31.26vw", width: "98%",
        margin: "0 1%"
      }}
      className="ExamplesBoxContent"
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          variant="fullWidth"

        >
          <Tab label="Non-Fungible tokens" {...a11yProps(0)} className="examples-tab" />
          <Tab label="Fungible Token" {...a11yProps(1)} className="examples-tab" />
          <Tab label="Chat" {...a11yProps(2)} className="examples-tab" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Grid container sx={{ zIndex: 3 }} className="example-grid-wrapper">
          <Grid item xs={4} className="infoGridExample">
            {/* <Box className="example-1-text-tab">
              How to create Non-Fungible tokens NFTs) on Bitcoin Computer
            </Box> */}
            <Box className="example-1-subtext-tab">
              A non-fungible token is an object that stores an image url, the title of an artwork, and the name of a artist.
            </Box>
            <br />
            <Box className="example-1-subtext-tab">
              A keyword property "_owners" is set to a public key. The holder of that public key is the owner of the object in the sense the corresponding private key is required to update the object. To send the NFT to another user, the current owner can reassign the "_owners" property to the new owner's public key. More on <a href='https://github.com/bitcoin-computer/monorepo/tree/main/packages/nft' rel="noreferrer" target="_blank" className="docsLinkExamples">Github</a>.
            </Box>
          </Grid>
          <Grid item xs={4} className="infoGridExample">
            {/* <Box className="example-rectangle" /> */}
            <CodeSectionNonFungible />
          </Grid>
          <Grid item xs={4} className="infoGridExample"></Grid>
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Grid container sx={{ zIndex: 3 }} className="example-grid-wrapper">
          <Grid item xs={4} className="infoGridExample">
            <Box className="example-1-subtext-tab">
              A fungible token is initialized to a fixed supply and an initial owner.
            </Box>
            <br />
            <Box className="example-1-subtext-tab">
              The only function is a "send" function. This function checks that the supply of the token is above the amount to be sent. If so the amount stored in this instance is decreased by "amount". Then a new instance of the token class is created. The owner of the new token is set to the recipient. The full code is available on <a href='https://github.com/bitcoin-computer/monorepo/tree/main/packages/ft' rel="noreferrer" target="_blank" className="docsLinkExamples">Github</a>.
            </Box>
          </Grid>
          <Grid item xs={4} className="infoGridExample">
            {/* <Box className="example-rectangle" /> */}
            <CodeSectionFungible />
          </Grid>
          <Grid item xs={4} className="infoGridExample"></Grid>
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Grid container sx={{ zIndex: 3 }} className="example-grid-wrapper">
          <Grid item xs={4} className="infoGridExample">
            <Box className="example-1-subtext-tab">
              A chat is an object that stores a list of messages that is initially empty. It has a function invite that adds another user to the _owners array thereby giving them write access (only the creator of the chat can post and invite users initially). Once invited a user can call post to send a message to the chat and invite other users. You can find a working implementation on <a href='https://github.com/bitcoin-computer/bitcoin-chat' rel="noreferrer" target="_blank" className="docsLinkExamples">Github</a>.
            </Box>
          </Grid>
          <Grid item xs={4} className="infoGridExample">
            {/* <Box className="example-rectangle" /> */}
            <CodeSectionChat />
          </Grid>
          <Grid item xs={4} className="infoGridExample"></Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}
