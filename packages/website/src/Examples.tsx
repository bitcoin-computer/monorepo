import Box from '@mui/material/Box'
import './Examples.css'
import ExampleTabs from './tabs'

function Examples() {
  return (
    <Box className="examples-container" id="examples">
      <Box className="horizontal-examples-grid-line-1" />
      {/* <Box className="horizontal-examples-grid-line-2" /> */}
      <Box className="horizontal-examples-grid-line-3" />
      {/* <Box className="horizontal-examples-grid-line-4" /> */}
      <Box className="horizontal-examples-grid-line-5" />
      <Box className="horizontal-grid-line-6" />
      <Box className="vertical-grid-line-1" />
      <Box className="vertical-grid-line-2" />
      <Box className="vertical-grid-line-3" sx={{ zIndex: '4' }} />
      <Box className="vertical-grid-line-4" />
      <Box className="vertical-grid-line-5" sx={{ zIndex: '4' }} />
      <Box className="vertical-grid-line-6" />
      <Box className="vertical-grid-line-7" sx={{ zIndex: '4' }} />
      <Box className="examples-heading-tab">Examples</Box>
      <ExampleTabs />
      {/* <Box className="line4" /> */}
      {/* <Box className="example-heading-3">Chat</Box>
      <Box className="example-heading-2">Fungible Token</Box>
      <Box className="example-1-subtext">
        A non-fungible token is an object that has some state. In the example
        below the entire state is stored in a single property state. The token
        has a function setState to update the state and a function send to
        assign a new owner.
      </Box>
      <Box className="example-1-text">
        How to create Non-Fungible tokens NFTs) on Bitcoin Computer
      </Box>
      <Box className="example-1-heading">Non-Fungible tokens </Box>
      <Box className="examples-heading">Examples</Box> */}
    </Box>
  )
}

export default Examples
