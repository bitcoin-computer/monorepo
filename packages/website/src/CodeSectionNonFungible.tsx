import Box from "@mui/material/Box";

import "./CodeSection.css";

function CodeSection() {
  return (
    <Box className="code-section-container">
      <Box>
        <pre className="code-block">
          <code> 1 </code>
          <code className="code-yellow">class</code>{" "}
          <code className="code-dark-yellow"> NFT</code>
          <code className="code-yellow"> extends </code>{" "}
          <code className="code-dark-yellow">Contract</code>
          <code className="code-gray">{` {`}</code>
          <br />
          <code> 2 </code>
          <code className="code-dark-blue">{`    constructor`}</code>
          <code>(</code>
          <code className="code-light-blue">data, owner</code>
          <code>)</code> <code>{`{`}</code>
          <br />
          <code> 3 </code>
          <code className="code-blue">{`      super(`}</code>
          <code className="code-grey">{`{`}</code>
          <br />
          <code> 4 </code>
          <code className="code-dark-blue">        data,</code>
          <br />
          <code> 5 </code>
          <code className="code-dark-blue">        _owners</code> <code>:[</code>
          <code className="code-dark-blue">owner</code>
          <code>]</code>
          <br />
          <code> 6 </code>
          <code className="code-grey">{`      }`}</code><code className="code-blue">{`)`}</code>
          <br />
          <code> 7 </code>
          <code>{`    }`}</code>
          <br />
          <code> 8 </code>
          <br />
          <code> 9 </code>
          <code className="code-dark-blue">{`    send`}</code>
          <code>(</code>
          <code className="code-light-blue">to</code>
          <code>)</code> <code>{`{`}</code>
          <br />
          <code>10 </code>
          <code className="code-blue">{`        this`}</code>
          <code>.</code>
          <code className="code-dark-blue">_owners</code> <code>= [</code>
          <code className="code-dark-blue">to</code>
          <code>]</code>
          <br />
          <code>11 </code>
          <code>{`    }`}</code>
          <br />
          <code>12 </code>
          <code>{`}`}</code>
        </pre>
      </Box>
    </Box>
  );
}

export default CodeSection;
