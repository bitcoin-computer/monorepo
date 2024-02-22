import React from "react"
import Card from "./card"

function Artworks({ artworks }) {
  return (
    <div>
      <div className="flex flex-wrap">
        {artworks.map((artwork, index) => (
          <Card artwork={artwork} rev={artwork._rev} key={artwork._rev} />
        ))}
      </div>
    </div>
  )
}

export default Artworks
