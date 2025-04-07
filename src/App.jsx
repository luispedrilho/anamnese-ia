import { useState, useRef, useEffect } from 'react'

function App() {
  const perguntasAlimentacao = [
    "Qual sua idade, altura e peso atual?",
    "Você tem alguma restrição alimentar ou condição de saúde (como diabetes, hipertensão, intolerâncias)?",
    "Como é sua alimentação atualmente? (descreva café da manhã, almoço, jantar e lanches)",
    "Você costuma fazer uso de suplementos ou vitaminas?",
    "Qual é sua rotina diária? (trabalho, horários, atividade física, etc)"
  ]

  const perguntasTreinamento = [
    "Qual sua idade, altura e peso atual?",
    "Você já treina? Se sim, com que frequência e há quanto tempo?",
    "Tem alguma limitação física ou lesão?",
    "Qual seu principal objetivo? (ex: emagrecer, ganhar massa, melhorar o condicionamento)",
    "Onde pretende treinar? (academia, casa, ao ar livre)"
  ]

  const [tipoPlano, setTipoPlano] = useState(null)
  const [etapa, setEtapa] = useState(0)
  const [chatHistory, setChatHistory] = useState([])
  const [respostaAtual, setRespostaAtual] = useState("")
  const [mostrarResumo, setMostrarResumo] = useState(false)
  const [planoGerado, setPlanoGerado] = useState("")
  const [carregando, setCarregando] = useState(false)
  const chatEndRef = useRef(null)

  const perguntas = tipoPlano === "alimentacao" ? perguntasAlimentacao : perguntasTreinamento

  useEffect(() => {
    if (tipoPlano && etapa < perguntas.length && (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].pergunta !== perguntas[etapa])) {
      setChatHistory([...chatHistory, { pergunta: perguntas[etapa], resposta: "" }])
    }
  }, [etapa, chatHistory, perguntas, tipoPlano])

  const avancar = () => {
    if (!respostaAtual.trim()) return

    const updatedHistory = chatHistory.map((entry, index) =>
      index === chatHistory.length - 1 ? { ...entry, resposta: respostaAtual } : entry
    )

    setChatHistory(updatedHistory)
    setRespostaAtual("")

    if (etapa < perguntas.length - 1) {
      setEtapa(etapa + 1)
    } else {
      setMostrarResumo(true)
    }
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  const gerarPlanoIA = async () => {
    setCarregando(true)
    try {
      const resposta = await fetch(`${apiUrl}/gerar-plano`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respostas: chatHistory.map(entry => entry.resposta),
          tipo: tipoPlano === "treinamento" ? "treino" : "alimentacao"
        }),
      })

      const data = await resposta.json()
      if (data.plano) {
        setPlanoGerado(data.plano)
      } else {
        alert("Erro: resposta da IA vazia ou mal formatada.")
        console.error("Resposta inesperada:", data)
      }
    } catch (err) {
      alert("Erro ao gerar plano com IA")
      console.error(err)
    }
    setCarregando(false)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  if (!tipoPlano) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Anamnese com IA
          </h1>
          <p className="text-gray-600 mb-6">Qual plano você deseja montar?</p>
          <div className="space-y-4">
            <button
              onClick={() => setTipoPlano("alimentacao")}
              className="w-full bg-green-600 text-white font-medium py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              🥗 Plano de Alimentação
            </button>
            <button
              onClick={() => setTipoPlano("treinamento")}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              🏋️ Plano de Treinamento
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Anamnese com IA
        </h1>

        <div className="chat-history mb-4">
          {chatHistory.map((entry, index) => (
            <div key={index} className="mb-2">
              <div className="bg-blue-100 p-2 rounded-md mb-1">
                <strong>{entry.pergunta}</strong>
              </div>
              {entry.resposta && (
                <div className="bg-gray-200 p-2 rounded-md">
                  {entry.resposta}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {!mostrarResumo ? (
          <>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={2}
              value={respostaAtual}
              onChange={(e) => setRespostaAtual(e.target.value)}
              placeholder="Digite sua resposta aqui..."
            />
            <button
              onClick={avancar}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {etapa < perguntas.length - 1 ? "Próxima Pergunta" : "Finalizar"}
            </button>
          </>
        ) : planoGerado ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center text-green-700">
              Plano Gerado
            </h2>
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm text-gray-800 mb-4">
              {planoGerado}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
            >
              Refazer Anamnese
            </button>
          </div>
        ) : (
          <button
            onClick={gerarPlanoIA}
            className="w-full bg-green-600 text-white font-medium py-2 rounded-md hover:bg-green-700 transition-colors"
            disabled={carregando}
          >
            {carregando ? "Gerando plano..." : "Gerar plano com IA"}
          </button>
        )}
      </div>
    </div>
  )
}

export default App
