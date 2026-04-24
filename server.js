const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
app.post('/api/claude', async (req, res) => {
  const { default: fetch } = await import('node-fetch')
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.1-8b-instant', max_tokens: 1000, messages: req.body.messages })
  })
  const data = await r.json()
  res.json(data)
})
app.listen(3001, () => console.log('Proxy on :3001'))
