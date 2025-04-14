import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Historico() {
  const [planos, setPlanos] = useState([]);
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
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold uppercase text-indigo-600">
                  {p.tipo === "treino" ? "Treinamento" : "Alimentação"}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <pre className="text-sm whitespace-pre-wrap text-gray-700">
                {p.plano}
              </pre>
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
    </div>
  );
}

export default Historico;
