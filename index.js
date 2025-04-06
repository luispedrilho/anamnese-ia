import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { OpenAI } from "openai"

dotenv.config()

const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}))

app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

app.post("/gerar-plano", async (req, res) => {
  try {
    const { respostas } = req.body

    const prompt = `
Sou um nutricionista e treinador. Com base nas respostas a seguir, gere um plano alimentar e de treino personalizado:

${respostas.map((r, i) => `Pergunta ${i + 1}: ${r}`).join("\n")}

Responda de forma estruturada, clara e com orientações práticas para iniciantes.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    })

    const plano = completion.choices[0].message.content
    res.json({ plano })
  } catch (err) {
    console.error("Erro ao gerar plano:", err)
    res.status(500).json({ erro: "Erro ao gerar plano com IA" })
  }
})

app.listen(3001, () => {
  console.log("🔥 Backend rodando em http://localhost:3001")
})