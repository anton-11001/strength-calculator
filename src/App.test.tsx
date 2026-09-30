import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('calculator UI', () => {
  it('calculates and displays the reference recommendation', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /calculate working weight/i }))

    expect(screen.getByText('52.5 kg', { selector: '.primary-result strong' })).toBeInTheDocument()
    expect(screen.getByText('52.5 kg–55 kg')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /estimated single-set rep maxes/i })).toBeInTheDocument()
  })

  it('shows inline validation and withholds results for invalid input', async () => {
    const user = userEvent.setup()
    render(<App />)

    const weight = screen.getByLabelText(/weight/i)
    await user.clear(weight)
    await user.type(weight, '0')
    await user.click(screen.getByRole('button', { name: /calculate working weight/i }))

    expect(screen.getByText('Enter a weight greater than 0.')).toBeInTheDocument()
    expect(screen.queryByText('Suggested starting weight')).not.toBeInTheDocument()
    expect(weight).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports keyboard entry and custom exercises', async () => {
    const user = userEvent.setup()
    render(<App />)

    const exercise = screen.getByLabelText('Exercise')
    await user.clear(exercise)
    await user.type(exercise, 'Cable Row')
    await user.click(screen.getByRole('button', { name: /calculate working weight/i }))

    expect(screen.getByText('Suggested starting weight')).toBeInTheDocument()
  })
})
