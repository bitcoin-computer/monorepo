import { screen, render } from '@testing-library/react'
import App from './App'

describe('App', () => {
  // todo: make this test work
  it.skip('renders the App component', () => {
    render(<App />)
    const linkElement = screen.getByText(/All Games/i)
    expect(linkElement).toBeInTheDocument()
  })
})
