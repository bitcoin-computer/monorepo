import { screen, render } from "@testing-library/react"
import App from "./App"

describe("App", () => {
  it("renders the App component", () => {
    render(<App />)
    const linkElement = screen.getByText(/Bitcoin Computer Wallet/i)
    expect(linkElement).toBeInTheDocument()
  })
})
