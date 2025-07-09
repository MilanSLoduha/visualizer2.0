import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { email, password } = req.body

    const response = await fetch('http://localhost:8081/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    })

    if (!response.ok) {
      const { message } = await response.json()
      return res.status(response.status).json({ error: message })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch {
    res.status(500).json({ error: 'Something went wrong' })
  }
}