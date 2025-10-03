/// <reference types="jest" />
import React, { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import { RegistrationProvider, useRegistrationData } from '../regDataProvider'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

function Consumer() {
  const { programs } = useRegistrationData()
  return <div data-testid="program-count">{programs.length}</div>
}

describe('RegistrationProvider', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset()
  })

  it('requests the programs collection only once per mount even with StrictMode double rendering', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/register/programs/')) {
        return Promise.resolve({
          data: [
            {
              id: 1,
              name: 'Sample Program',
              description: '',
              requires_ticket: false,
              created_at: '',
              updated_at: '',
              category_label: null,
              category_options: [],
              active: true,
            },
          ],
        })
      }

      if (typeof url === 'string' && url.includes('/register/schools/')) {
        return Promise.resolve({ data: [] })
      }

      return Promise.reject(new Error(`Unexpected axios GET to ${url}`))
    })

    render(
      <StrictMode>
        <RegistrationProvider>
          <Consumer />
        </RegistrationProvider>
      </StrictMode>
    )

    await waitFor(() => expect(screen.getByTestId('program-count').textContent).toBe('1'))

    const programCalls = mockedAxios.get.mock.calls.filter(([url]) =>
      typeof url === 'string' && url.includes('/register/programs/')
    )

    expect(programCalls).toHaveLength(1)
    expect(programCalls[0]?.[0]).toMatch(/\/register\/programs\/\?active=true$/)
  })
})
