// src/components/listar/listar.js
import React, { useState, useEffect } from 'react';
import Axios from "axios"; // Para fazer requisições HTTP

function ListaAlunos() {
 
  const [alunos, setAlunos] = useState([]);
  
  const [editingAluno, setEditingAluno] = useState(null);
 
  const [editedData, setEditedData] = useState({ nome: '', idade: '' });
  
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Função para buscar a lista de alunos do backend
  const fetchAlunos = () => {
    Axios.get("http://localhost:3001/listar") 
      .then((response) => {
        setAlunos(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar alunos:", error);
        setFeedbackMessage("Erro ao carregar a lista de alunos.");
      });
  };

 
  useEffect(() => {
    fetchAlunos();
  }, []); 

  
  const handleExcluirAluno = (alunoId) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) { 
        Axios.delete(`http://localhost:3001/excluir/${alunoId}`)
        .then((response) => {
            
            setAlunos((prevAlunos) => prevAlunos.filter((aluno) => aluno.id !== alunoId));
            setFeedbackMessage("Aluno excluído com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao excluir aluno:", error);
            setFeedbackMessage("Erro ao excluir aluno.");
        });
    }
  };

  // Função para iniciar a edição de um aluno
  const handleEditClick = (aluno) => {
    setEditingAluno(aluno); // Define o aluno que está sendo editado
    setEditedData({ nome: aluno.nome, idade: aluno.idade }); // Preenche os campos de edição com os dados atuais
    setFeedbackMessage(''); // Limpa mensagens anteriores
  };

  // Função para salvar as alterações de um aluno
  const handleSaveClick = () => {
    if (!editedData.nome || !editedData.idade) {
        setFeedbackMessage("Nome e idade não podem estar vazios.");
        return;
    }
    Axios.put(`http://localhost:3001/editar/${editingAluno.id}`, editedData)
      .then((response) => {
        // Atualiza a lista de alunos no frontend com os dados modificados
        setAlunos((prevAlunos) =>
          prevAlunos.map((aluno) =>
            aluno.id === editingAluno.id ? { ...aluno, ...editedData, qrCodeUrl: aluno.qrCodeUrl } : aluno // Mantém o qrCodeUrl original
          )
        );
        setEditingAluno(null); // Finaliza o modo de edição
        setEditedData({ nome: '', idade: '' }); // Limpa os campos de edição
        setFeedbackMessage("Aluno atualizado com sucesso!");
        // O QR Code precisaria ser regerado no backend se as informações que o compõem mudarem.
        // Para simplificar, esta versão não regera o QR Code no frontend após a edição.
        // Uma melhoria seria chamar fetchAlunos() para recarregar tudo com QR Codes atualizados.
        fetchAlunos(); // Recarrega os alunos para obter QR Codes atualizados se necessário
      })
      .catch((error) => {
        console.error("Erro ao salvar edição:", error);
        setFeedbackMessage("Erro ao salvar as alterações.");
      });
  };

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setEditingAluno(null);
    setEditedData({ nome: '', idade: ''});
    setFeedbackMessage('');
  };


  // Renderização do componente
  return (
    <div className="mt-4">
      <h2>Lista de Alunos</h2>
      {feedbackMessage && <div className={`alert ${feedbackMessage.includes("Erro") ? 'alert-danger' : 'alert-success'}`}>{feedbackMessage}</div>}
      {alunos.length === 0 && !feedbackMessage.includes("Erro") && <p>Nenhum aluno cadastrado.</p>}
      <ul className="list-group">
        {alunos.map((aluno) => (
          <li className="list-group-item" key={aluno.id}>
            {editingAluno && editingAluno.id === aluno.id ? (
              // Formulário de edição
              <div>
                <div className="mb-2">
                  <label htmlFor={`edit-nome-${aluno.id}`} className="form-label">Nome:</label>
                  <input
                    type="text"
                    id={`edit-nome-${aluno.id}`}
                    className="form-control"
                    value={editedData.nome}
                    onChange={(e) => setEditedData({ ...editedData, nome: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor={`edit-idade-${aluno.id}`} className="form-label">Idade:</label>
                  <input
                    type="number" // Mudado para number para melhor validação de idade
                    id={`edit-idade-${aluno.id}`}
                    className="form-control"
                    value={editedData.idade}
                    onChange={(e) => setEditedData({ ...editedData, idade: e.target.value })}
                  />
                </div>
                <button className="btn btn-success btn-sm me-2" onClick={handleSaveClick}>
                  Salvar
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              </div>
            ) : (
              // Exibição normal do aluno
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1"><strong>Nome:</strong> {aluno.nome}</p>
                  <p className="mb-1"><strong>Idade:</strong> {aluno.idade}</p>
                  <p className="mb-0"><strong>ID:</strong> {aluno.id}</p>
                </div>
                <div className="d-flex flex-column align-items-end">
                    {/* Exibição do QR Code */}
                    {aluno.qrCodeUrl && (
                        <div className="mb-2">
                        <img 
                            src={aluno.qrCodeUrl} 
                            alt={`QR Code para ${aluno.nome}`} 
                            style={{ width: '100px', height: '100px', border: '1px solid #ccc', padding: '5px' }} 
                        />
                        </div>
                    )}
                    <div>
                        <button 
                            className="btn btn-primary btn-sm me-2" 
                            onClick={() => handleEditClick(aluno)}
                            aria-label={`Editar ${aluno.nome}`}
                        >
                        Editar
                        </button>
                        <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleExcluirAluno(aluno.id)}
                            aria-label={`Excluir ${aluno.nome}`}
                        >
                        Excluir
                        </button>
                    </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaAlunos;
