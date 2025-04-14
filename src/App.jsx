import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/robo-fitness.png";

function App() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("usuario");

    if (!token || !userData) {
      navigate("/login");
    } else {
      setUsuario(JSON.parse(userData));
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const perguntasAlimentacao = [
    "Qual sua idade, altura e peso atual?",
    "Você tem alguma restrição alimentar ou condição de saúde (como diabetes, hipertensão, intolerâncias)?",
    "Como é sua alimentação atualmente? (descreva café da manhã, almoço, jantar e lanches)",
    "Você costuma fazer uso de suplementos ou vitaminas?",
    "Qual é sua rotina diária? (trabalho, horários, atividade física, etc)"
  ];

  const perguntasTreinamento = [
    "Qual sua idade, altura e peso atual?",
    "Você já treina? Se sim, com que frequência e há quanto tempo?",
    "Tem alguma limitação física ou lesão?",
    "Qual seu principal objetivo? (ex: emagrecer, ganhar massa, melhorar o condicionamento)",
    "Onde pretende treinar? (academia, casa, ao ar livre)"
  ];

  const [tipoPlano, setTipoPlano] = useState(null);
  const [etapa, setEtapa] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [respostaAtual, setRespostaAtual] = useState("");
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [planoGerado, setPlanoGerado] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const chatEndRef = useRef(null);

  const perguntas = tipoPlano === "alimentacao" ? perguntasAlimentacao : perguntasTreinamento;

  useEffect(() => {
    if (
      tipoPlano &&
      etapa < perguntas.length &&
      (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].pergunta !== perguntas[etapa])
    ) {
      setChatHistory([...chatHistory, { pergunta: perguntas[etapa], resposta: "" }]);
    }
  }, [etapa, chatHistory, perguntas, tipoPlano]);

  const avancar = () => {
    if (!respostaAtual.trim()) return;
    const updatedHistory = chatHistory.map((entry, index) =>
      index === chatHistory.length - 1 ? { ...entry, resposta: respostaAtual } : entry
    );

    setChatHistory(updatedHistory);
    setRespostaAtual("");
    if (etapa < perguntas.length - 1) {
      setEtapa(etapa + 1);
    } else {
      setMostrarResumo(true);
    }
  };

  const voltarInicio = () => {
    setTipoPlano(null);
    setEtapa(0);
    setChatHistory([]);
    setRespostaAtual("");
    setMostrarResumo(false);
    setPlanoGerado("");
    setMostrarModal(false);
  };

  const apiUrl = import.meta.env.VITE_API_URL;
  const gerarPlanoIA = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem("token");
      const resposta = await fetch(`${apiUrl}/gerar-plano`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          respostas: chatHistory.map((entry) => entry.resposta),
          tipo: tipoPlano === "treinamento" ? "treino" : "alimentacao"
        })
      });

      const data = await resposta.json();
      if (data.plano) {
        setPlanoGerado(data.plano);
        setMostrarModal(true);
      } else {
        alert("Erro: resposta da IA vazia ou mal formatada.");
        console.error("Resposta inesperada:", data);
      }
    } catch (err) {
      alert("Erro ao gerar plano com IA");
      console.error(err);
    }
    setCarregando(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  if (!usuario) return null;

  if (!tipoPlano) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#c4f0ff] to-[#f0eaff] p-6 relative">
        <button onClick={logout} className="absolute top-4 right-4 text-sm text-indigo-500 hover:underline">
          Sair
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <img src={logo} alt="Robo Fitness" className="w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Anamnese com IA</h1>
          <p className="text-gray-600 text-sm mb-6">
            Obtenha planos personalizados de saúde com inteligência artificial
          </p>
          <div className="space-y-4 mb-6">
            <button onClick={() => setTipoPlano("alimentacao")} className="w-full bg-green-100 text-green-700 font-semibold px-4 py-3 rounded-lg text-left shadow hover:shadow-md">
              🥗 Plano de Alimentação
              <div className="text-sm font-normal text-gray-500">Sugestões personalizadas de dieta para o seu dia a dia</div>
            </button>
            <button onClick={() => setTipoPlano("treinamento")} className="w-full bg-indigo-100 text-indigo-700 font-semibold px-4 py-3 rounded-lg text-left shadow hover:shadow-md">
              🏋️ Plano de Treinamento
              <div className="text-sm font-normal text-gray-500">Rotinas de exercícios adaptadas ao seu objetivo</div>
            </button>
          </div>
          <button onClick={() => navigate("/historico")} className="text-sm text-indigo-600 underline hover:text-indigo-800">
            📋 Ver meus planos anteriores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4f0ff] to-[#f0eaff] flex items-center justify-center p-4 relative">
      <button onClick={logout} className="absolute top-4 right-4 text-sm text-indigo-500 hover:underline">Sair</button>
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} className="w-10 h-10" alt="Logo" />
          <div>
            <h2 className="font-bold text-lg text-gray-800">FitBot</h2>
            <p className="text-sm text-gray-500">Seu treinador virtual</p>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button onClick={voltarInicio} className="text-sm text-indigo-500 hover:underline">← Voltar para o início</button>
        </div>

        <div className="chat-history mb-4 max-h-[400px] overflow-y-auto">
          {chatHistory.map((entry, index) => (
            <div key={index} className="mb-2">
              <div className="bg-indigo-100 text-sm p-3 rounded-lg mb-1 text-gray-800">{entry.pergunta}</div>
              {entry.resposta && (
                <div className="bg-gray-100 text-sm p-3 rounded-lg ml-auto text-right text-gray-600">
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
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              rows={2}
              value={respostaAtual}
              onChange={(e) => setRespostaAtual(e.target.value)}
              placeholder="Digite sua resposta aqui..."
            />
            <button
              onClick={avancar}
              className="w-full bg-indigo-500 text-white font-medium py-2 mt-2 rounded-lg hover:bg-indigo-600"
            >
              {etapa < perguntas.length - 1 ? "Próxima" : "Finalizar"} ➡️
            </button>
          </>
        ) : (
          <button
            onClick={gerarPlanoIA}
            className="w-full bg-green-500 text-white font-medium py-2 rounded-md hover:bg-green-600"
            disabled={carregando}
          >
            {carregando ? "Gerando plano..." : "Gerar plano com IA"}
          </button>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xl shadow-xl relative animate-fadeIn">
            <h2 className="text-lg font-bold mb-4 text-center text-indigo-600">
              🎯 Plano Personalizado
            </h2>
            <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 mb-4 border p-4 rounded-md bg-gray-50">
              {planoGerado}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={voltarInicio} className="bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200">
                ← Início
              </button>
              <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
                Refazer Anamnese
              </button>
              <button onClick={() => navigate("/historico")} className="text-sm text-indigo-600 underline hover:text-indigo-800">
                📋 Ver meu histórico de planos
              </button>
            </div>
            <button onClick={() => setMostrarModal(false)} className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
