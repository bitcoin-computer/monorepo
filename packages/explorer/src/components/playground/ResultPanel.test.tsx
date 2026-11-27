import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ResultPanel } from './ResultPanel'

function renderResult(data: { _rev: string; type: 'objects' | 'modules' }) {
  return render(
    <MemoryRouter>
      <ResultPanel
        result={{ status: 'success', title: 'Object created', data }}
        onDismiss={() => undefined}
      />
    </MemoryRouter>,
  )
}

describe('ResultPanel', () => {
  it('Should tell the developer to open the object and call a method', () => {
    renderResult({ _rev: 'abc:0', type: 'objects' })
    expect(screen.getByRole('status').textContent).toMatch(/Open the object and call a method/)
    expect(screen.getByRole('link', { name: 'object' })).toHaveAttribute('href', '/objects/abc:0')
  })

  it('Should keep the module success text', () => {
    renderResult({ _rev: 'abc:0', type: 'modules' })
    const text = screen.getByRole('status').textContent || ''
    expect(text).toMatch(/Created a\s*module/)
    expect(text).not.toMatch(/call a method/)
    expect(screen.getByRole('link', { name: 'module' })).toHaveAttribute('href', '/modules/abc:0')
  })
})
