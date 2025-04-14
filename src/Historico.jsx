import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './styles.css';

function Historico() {
  const [planos, setPlanos] = useState([]);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [planoEditado, setPlanoEditado] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    fetch(import.meta.env.VITE_API_URL + "/meus-planos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPlanos(data.planos || []))
      .catch((err) => {
        console.error("Erro ao buscar planos:", err);
        alert("Erro ao carregar seus planos");
      });
  }, [navigate]);

  const formatarDataHora = (data) => {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
  };

  const abrirModal = (plano) => {
    setPlanoSelecionado(plano);
    setPlanoEditado(plano.plano);
    setModoEdicao(false);
  };

  const salvarEdicao = async () => {
    const token = localStorage.getItem("token");
    if (!token || !planoSelecionado) return;

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/editar-plano/${planoSelecionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plano: planoEditado }),
      });

      if (resposta.ok) {
        alert("Plano atualizado com sucesso!");
        window.location.reload();
      } else {
        const data = await resposta.json();
        alert(data.error || "Erro ao salvar edição.");
      }
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
      alert("Erro ao salvar edição");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">📋 Histórico de Planos</h1>
      <div className="w-full max-w-2xl space-y-4">
        {planos.length === 0 ? (
          <p className="text-center text-gray-500">Você ainda não gerou nenhum plano.</p>
        ) : (
          planos.map((p) => (
            <div
              key={p.id}
              className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={() => abrirModal(p)}
            >
              <div className="flex justify-between">
                <span className="text-sm font-semibold uppercase text-indigo-600">
                  {p.tipo === "treino" ? "Treinamento" : "Alimentação"}
                </span>
                <span className="text-sm text-gray-500">
                  {formatarDataHora(p.criado_em)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-8 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg"
      >
        ← Voltar para o Início
      </button>

      {/* Modal com plano completo */}
      {planoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xl shadow-xl relative animate-fadeIn">
            <h2 className="text-lg font-bold mb-4 text-center text-indigo-600">
              Plano de {planoSelecionado.tipo === "treino" ? "Treinamento" : "Alimentação"}
            </h2>

            {modoEdicao ? (
              <textarea
                rows={10}
                className="w-full border p-3 rounded-lg text-sm mb-4 text-gray-800"
                value={planoEditado}
                onChange={(e) => setPlanoEditado(e.target.value)}
              />
            ) : (
              <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 mb-4 border p-4 rounded-md bg-gray-50">
                {planoSelecionado.plano}
              </div>
            )}

            <div className="flex gap-2">
              {modoEdicao ? (
                <>
                  <button
                    onClick={salvarEdicao}
                    className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                  >
                    Salvar alterações
                  </button>
                  <button
                    onClick={() => setModoEdicao(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModoEdicao(true)}
                  className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600"
                >
                  Editar Plano
                </button>
              )}
            </div>

            <button
              onClick={() => setPlanoSelecionado(null)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Historico;
