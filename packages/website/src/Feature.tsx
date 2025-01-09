import Box from '@mui/material/Box'
import './Feature.css'

export interface FeatureProps {
  heading: string
  text: string
}

function Feature(props: FeatureProps) {
  return (
    <Box>
      <Box sx={{ textAlign: 'start' }}>
        <img src="/feature-dot.png" className="featureDot" alt="dot"></img>
        <h3 className="featureHeading">{props.heading}</h3>
      </Box>
      <Box className="featureText">{props.text}</Box>
    </Box>
  )
}

export default Feature
