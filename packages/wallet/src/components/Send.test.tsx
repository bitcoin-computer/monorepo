import { fireEvent, render, screen } from '@testing-library/react'
import { UtilsContext } from '@bitcoin-computer/components'
import { Computer } from '@bitcoin-computer/lib'
import { SendForm } from './Send'

function renderForm(fee: string) {
  const computer = {
    getChain: () => 'LTC',
    setFee: vi.fn(),
    send: vi.fn().mockResolvedValue('ab'.repeat(32)),
  }
  render(
    <UtilsContext.UtilsProvider>
      <SendForm computer={computer as unknown as Computer} />
    </UtilsContext.UtilsProvider>,
  )
  fireEvent.change(screen.getByLabelText('To Address'), { target: { value: 'mfWx' } })
  fireEvent.change(screen.getByLabelText(/Amount/), { target: { value: '0.1' } })
  fireEvent.change(screen.getByLabelText(/Fee/), { target: { value: fee } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  return computer
}

describe('SendForm fee', () => {
  it.each(['abc', '', '0', '-1', 'Infinity'])(
    'Should reject the fee %j without changing the computer fee or sending',
    async (fee) => {
      const computer = renderForm(fee)
      expect(await screen.findByRole('alert')).toHaveTextContent(/fee/i)
      expect(computer.setFee).not.toHaveBeenCalled()
      expect(computer.send).not.toHaveBeenCalled()
    },
  )

  it('Should send with a valid fee', async () => {
    const computer = renderForm('2.5')
    await vi.waitFor(() => expect(computer.send).toHaveBeenCalled())
    expect(computer.setFee).toHaveBeenCalledWith(2.5)
  })
})
