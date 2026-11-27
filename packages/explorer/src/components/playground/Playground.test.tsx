import { UtilsContext } from '@bitcoin-computer/components'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Playground } from './Playground'

const DRAFT_KEY = 'bc-explorer-playground-draft-v1:create'
const DRAFT_CODE = 'class FromDraft extends Contract {}'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <UtilsContext.UtilsProvider>
        <Playground />
      </UtilsContext.UtilsProvider>
    </MemoryRouter>,
  )
}

function editor(id: string) {
  const el = document.getElementById(id)
  if (!(el instanceof HTMLTextAreaElement)) throw new Error(`${id} textarea missing`)
  return el
}

describe('Playground example link', () => {
  beforeEach(() => localStorage.clear())

  it('Should open Create mode with the counter example and mark the checklist', async () => {
    renderAt('/playground?example=counter')
    await waitFor(() => expect(editor('code-textarea').value).toContain('class Counter'))
    expect(editor('code-textarea').value).toContain('inc()')
    expect(screen.getByRole('tab', { name: 'Create' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Load an example').className).toContain('line-through')
    expect(screen.getByRole('button', { name: 'Preview effect' })).toBeEnabled()
    expect(
      screen.getAllByRole('button', { name: 'Create object' }).every((button) => button.hasAttribute('disabled')),
    ).toBe(true)

    fireEvent.click(screen.getByRole('tab', { name: 'Execute' }))
    await waitFor(() => expect(editor('expression-textarea').value).toContain('new Counter()'))
  })

  it.each(['nft', 'token', 'chat'] as const)(
    'Should load the %s example from the query',
    async (id) => {
      renderAt(`/playground?example=${id}`)
      const label = id === 'nft' ? 'NFT' : id === 'token' ? 'Token' : 'Chat'
      await waitFor(() => expect(editor('code-textarea').value).toContain(`class ${label}`))
      expect(screen.getByText('Load an example').className).toContain('line-through')
    },
  )

  it('Should restore a saved draft when the example param is absent', async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ code: DRAFT_CODE, updatedAt: 1 }))
    renderAt('/playground')
    await waitFor(() => expect(editor('code-textarea').value).toContain('FromDraft'))
    expect(screen.getByText('Load an example').className).not.toContain('line-through')
  })

  it('Should keep a saved draft when the example param is unknown', async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ code: DRAFT_CODE, updatedAt: 1 }))
    renderAt('/playground?example=nope')
    expect(screen.getByRole('heading', { name: 'Playground' })).toBeInTheDocument()
    await waitFor(() => expect(editor('code-textarea').value).toContain('FromDraft'))
    expect(editor('code-textarea').value).not.toContain('class Counter')
  })

  it('Should prefer the example over a saved draft', async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ code: DRAFT_CODE, updatedAt: 1 }))
    renderAt('/playground?example=counter')
    await waitFor(() => expect(editor('code-textarea').value).toContain('class Counter'))
    expect(editor('code-textarea').value).not.toContain('FromDraft')
    expect(localStorage.getItem(DRAFT_KEY)).toContain('FromDraft')
  })
})
