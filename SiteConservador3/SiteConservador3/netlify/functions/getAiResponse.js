// Importa o cliente da Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Acessa a sua chave de API a partir das variáveis de ambiente da Netlify
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async function (event, context) {
  // 1. Validação de Segurança
  // Garante que a requisição é um POST para evitar outros tipos de acesso
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ error: "Método não permitido." }),
    };
  }

  try {
    // 2. Extração e Validação do Prompt
    const { prompt } = JSON.parse(event.body);

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ error: "O 'prompt' é obrigatório e não pode ser vazio." }),
      };
    }

    // 3. Comunicação com a API Gemini
    // Inicia o modelo de IA que vamos usar
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Gera o conteúdo com base no prompt recebido
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Retorno da Resposta para o Front-End
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      // Retornamos a resposta da IA no formato que o seu front-end espera
      body: JSON.stringify({
        candidates: [{
          content: {
            parts: [{ text: text }]
          }
        }]
      }),
    };

  } catch (error) {
    // 5. Tratamento de Erros
    console.error("Erro ao processar a requisição de IA:", error);
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ error: "Ocorreu um erro no servidor ao tentar obter a resposta da IA." }),
    };
  }
};