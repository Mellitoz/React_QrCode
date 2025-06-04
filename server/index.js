// server/index.js
// Importa os módulos necessários
const express = require("express");
const app = express();
const mysql = require('mysql2'); // Biblioteca para interagir com o MySQL
const cors = require("cors"); // Middleware para habilitar CORS (Cross-Origin Resource Sharing)
const QRCode = require('qrcode'); // Biblioteca para gerar QR Codes

// Configuração do pool de conexões com o banco de dados MySQL
const db = mysql.createPool({
    host: "localhost", // Endereço do servidor do banco de dados
    user: "root", // Nome de usuário do banco de dados
    port: 3307, // Porta do servidor do banco de dados (ajuste se for diferente)
    password: "catolica", // Senha do banco de dados (substitua pela sua senha)
    database: "crudalunos", // Nome do banco de dados
});

// Middlewares
app.use(cors()); // Habilita o CORS para todas as rotas
app.use(express.json()); // Permite que o servidor entenda requisições com corpo em JSON

// Rota POST para registrar um novo aluno
app.post("/register", (req, res) => {
    // Extrai nome e idade do corpo da requisição
    const { nome } = req.body;
    const { idade } = req.body;

    // Comando SQL para inserir um novo aluno na tabela 'alunos'
    let SQL = "INSERT INTO alunos (nome, idade) VALUES (?, ?)";

    // Executa o comando SQL
    db.query(SQL, [nome, idade], (err, result) => {
        if (err) {
            console.error("Erro ao registrar aluno:", err); // Loga o erro no console do servidor
            res.status(500).json({ error: "Erro interno ao registrar aluno" }); // Retorna erro 500
        } else {
            console.log("Aluno registrado com sucesso:", result);
            res.status(201).json({ message: "Aluno registrado com sucesso", id: result.insertId }); // Retorna sucesso
        }
    });
});

// Rota GET para listar todos os alunos com seus respectivos QR Codes
app.get("/listar", async (req, res) => { // A rota agora é assíncrona
    // Comando SQL para selecionar todos os alunos
    let SQL = "SELECT * FROM alunos";

    // Executa o comando SQL
    db.query(SQL, async (err, results) => { // O callback também é assíncrono
        if (err) {
            console.error("Erro ao listar alunos:", err);
            return res.status(500).json({ error: "Erro interno ao listar alunos" });
        }
        try {
            // Mapeia os resultados e gera o QR code para cada aluno
            const alunosComQR = await Promise.all(results.map(async (aluno) => {
                // Texto que será codificado no QR Code
                // Inclui Nome, Idade e ID do aluno para identificação
                const qrText = `Nome: ${aluno.nome}, Idade: ${aluno.idade}, ID: ${aluno.id}`;
                // Gera o QR Code como Data URL (imagem PNG em base64)
                const qrDataUrl = await QRCode.toDataURL(qrText);
                // Retorna o objeto do aluno com a adição da URL do QR Code
                return { ...aluno, qrCodeUrl: qrDataUrl };
            }));
            res.json(alunosComQR); // Envia a lista de alunos com os QR Codes
        } catch (qrError) {
            console.error("Erro ao gerar QR codes:", qrError);
            // Se houver erro na geração do QR Code, envia uma resposta de erro
            return res.status(500).json({ error: "Erro interno ao gerar QR codes" });
        }
    });
});

// Rota DELETE para excluir um aluno pelo ID
app.delete("/excluir/:id", (req, res) => {
    const alunoId = req.params.id; // Pega o ID do aluno dos parâmetros da rota

    // Comando SQL para excluir o aluno com base no ID
    const SQL = "DELETE FROM alunos WHERE id = ?";
    db.query(SQL, [alunoId], (err, result) => {
        if (err) {
            console.error("Erro ao excluir aluno:", err);
            res.status(500).json({ error: "Erro interno ao excluir aluno" });
        } else {
            if (result.affectedRows > 0) {
                res.json({ message: "Aluno excluído com sucesso" });
            } else {
                res.status(404).json({ error: "Aluno não encontrado" });
            }
        }
    });
});

// Rota PUT para editar os dados de um aluno pelo ID
app.put("/editar/:id", (req, res) => {
    const alunoId = req.params.id; // Pega o ID do aluno dos parâmetros da rota
    const { nome, idade } = req.body; // Pega nome e idade do corpo da requisição

    // Validação simples dos dados recebidos
    if (!nome || !idade) {
        return res.status(400).json({ error: "Nome e idade são obrigatórios" });
    }

    // Comando SQL para atualizar os dados do aluno com base no ID
    const SQL = "UPDATE alunos SET nome = ?, idade = ? WHERE id = ?";
    db.query(SQL, [nome, idade, alunoId], (err, result) => {
        if (err) {
            console.error("Erro ao editar aluno:", err);
            res.status(500).json({ error: "Erro interno ao editar aluno" });
        } else {
            if (result.affectedRows > 0) {
                res.json({ message: "Aluno editado com sucesso" });
            } else {
                res.status(404).json({ error: "Aluno não encontrado para edição" });
            }
        }
    });
});

// Define a porta em que o servidor vai escutar
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
