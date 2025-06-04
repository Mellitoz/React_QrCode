// src/App.js
// Importe os módulos e componentes necessários.
import './App.css'; // Estilos globais da aplicação
import React, { useState } from 'react'; // React e hook useState
import Axios from "axios"; // Para fazer requisições HTTP
import ListaAlunos from "./components/listar/listar"; // Componente para listar alunos

// Componente principal da aplicação, renomeado para App para seguir convenções
function App() {
  // Estado para armazenar os valores dos campos do formulário (nome e idade)
  const [values, setValues] = useState({ nome: '', idade: '' });
  // Estado para feedback ao usuário (mensagens de erro ou sucesso no cadastro)
  const [registerFeedback, setRegisterFeedback] = useState('');
  // Estado para forçar a atualização da lista de alunos após o cadastro
  const [refreshListKey, setRefreshListKey] = useState(0);


  // Função para manipular a mudança nos campos de entrada e atualizar o estado 'values'.
  const handleChangeValues = (event) => {
    // Atualiza o estado 'values', preservando valores antigos e atualizando o campo modificado.
    setValues(prevValue => ({
      ...prevValue,
      [event.target.name]: event.target.value,
    }));
  };

  // Função para lidar com o clique no botão de cadastro.
  const handleSubmitForm = (event) => {
    event.preventDefault(); // Previne o comportamento padrão de submissão do formulário (recarregar a página)

    // Validação simples
    if (!values.nome.trim() || !values.idade.trim()) {
        setRegisterFeedback("Nome e idade são obrigatórios.");
        return;
    }
    if (isNaN(parseInt(values.idade)) || parseInt(values.idade) <= 0) {
        setRegisterFeedback("Idade deve ser um número válido e positivo.");
        return;
    }

    // Faz uma solicitação POST para a URL de registro no backend com os dados do aluno.
    Axios.post("http://localhost:3001/register", {
      nome: values.nome,
      idade: values.idade
    })
    .then((response) => {
      console.log("Resposta do cadastro:", response); // Exibe a resposta da solicitação no console.
      setRegisterFeedback("Aluno cadastrado com sucesso!");
      setValues({ nome: '', idade: '' }); // Limpa os campos do formulário
      setRefreshListKey(prevKey => prevKey + 1); // Altera a chave para forçar o refresh de ListaAlunos
    })
    .catch((error) => {
        console.error("Erro no cadastro:", error);
        if (error.response && error.response.data && error.response.data.error) {
            setRegisterFeedback(`Erro ao cadastrar: ${error.response.data.error}`);
        } else {
            setRegisterFeedback("Erro ao cadastrar aluno. Tente novamente.");
        }
    });
  };

  // Renderiza o formulário de cadastro de aluno e a lista de alunos.
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Cadastro de Aluno</h2>
              {registerFeedback && (
                <div className={`alert ${registerFeedback.includes("Erro") ? 'alert-danger' : 'alert-success'}`}>
                  {registerFeedback}
                </div>
              )}
              <form onSubmit={handleSubmitForm}>
                <div className="mb-3">
                  <label htmlFor="nome" className="form-label">Nome:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nome"
                    name="nome" // 'name' deve corresponder à chave em 'values'
                    value={values.nome} // Controla o valor do input pelo estado
                    onChange={handleChangeValues}
                    placeholder="Digite o nome do aluno"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="idade" className="form-label">Idade:</label>
                  <input
                    type="number" // Mudado para number para melhor validação
                    className="form-control"
                    id="idade"
                    name="idade" // 'name' deve corresponder à chave em 'values'
                    value={values.idade} // Controla o valor do input pelo estado
                    onChange={handleChangeValues}
                    placeholder="Digite a idade"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Cadastrar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Renderiza o componente ListaAlunos para exibir a lista de alunos cadastrados. 
          A key é usada para forçar o remonte do componente quando um novo aluno é cadastrado. */}
      <ListaAlunos key={refreshListKey} />
    </div>
  );
}

// Exporta o componente App para uso no index.js.
export default App;
