// Função assíncrona para consultar índices financeiros de um determinado ano
async function consultarIndicesFinanceiros(ano) {
    // URL da API do Banco Central que fornece os dados da série histórica
    const url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json";

    try {
        // Tenta fazer uma requisição HTTP para a API.
        const response = await fetch(url);
        // Verifica se a resposta da requisição foi bem-sucedida 
        if (!response.ok) {
            // Se a resposta não for bem-sucedida, mostra um erro com a mensagem e o status da resposta
            throw new Error("Erro ao consultar a API do Banco Central. Status: " + response.status);
        }

        // Converte a resposta da API (que é um JSON) para um objeto JavaScript
        const indices = await response.json();

        // Filtra o array de índices para manter apenas aqueles que pertencem ao ano fornecido
        const indicesDoAno = indices.filter(indice => {
            // Divide a string de data (no formato "dd/mm/aaaa") e converte cada parte para um número
            const [, , indiceAno] = indice.data.split("/").map(Number);
            // Retorna verdadeiro se o ano do índice for igual ao ano fornecido
            return indiceAno === ano;
        });

        // Verifica se algum índice foi encontrado para o ano especificado
        if (indicesDoAno.length === 0) {
            // Se nenhum índice for encontrado, retorna uma mensagem informando
            return `Nenhum índice encontrado para o ano ${ano}.`;
        }

        // Agrupar por mês e calcular o índice mensal (considerando o último valor de cada mês)
        const indicesMensais = {};
        // Itera sobre os índices do ano encontrado
        indicesDoAno.forEach(indice => {
            // Extrai o dia, mês e ano da data do índice
            const [dia, mes, anoIndice] = indice.data.split("/").map(Number);
            // Cria uma chave no formato "mês/ano" para identificar cada mês
            const mesAno = `${mes}/${anoIndice}`;
            // Armazena o objeto do índice no objeto indicesMensais, usando a chave mesAno.
            // Se houver múltiplos valores para o mesmo mês, o último encontrado sobrescreverá os anteriores.
            indicesMensais[mesAno] = indice;
        });

        // Converte o objeto indicesMensais em um array de pares chave-valor e o ordena
        const resultadoOrdenado = Object.entries(indicesMensais)
            // Ordena os pares chave-valor com base no mês e no ano
            .sort(([, a], [, b]) => {
                // Extrai mês e ano dos índices para ordenação
                const [mesA, anoA] = a.data.split("/").map(Number);
                const [mesB, anoB] = b.data.split("/").map(Number);
                // Ordena primeiro por ano e depois por mês
                if (anoA !== anoB) return anoA - anoB;
                return mesA - mesB;
            })
            // Mapeia para retornar apenas os valores ordenados
            .map(([, item]) => item);

        // Verifica se algum resultado mensal foi encontrado após o agrupamento e ordenação
        if (resultadoOrdenado.length === 0) {
            // Se nenhum resultado for encontrado, retorna uma mensagem informando
            return `Nenhum índice encontrado para o ano ${ano}.`;
        }

        // Retorna o array de índices mensais ordenados
        return resultadoOrdenado;

    } catch (error) {
        // Captura qualquer erro que ocorra durante a execução da função (por exemplo, erro na requisição da API)
        console.error("Erro ao consultar a API:", error);
        // Retorna a mensagem de erro ou uma mensagem genérica caso a propriedade message não esteja definida
        return error.message || "Ocorreu um erro ao consultar a API.";
    }
}

// Adicionando um listener para o formulário
document.addEventListener('DOMContentLoaded', () => {
    // Obtém a referência para o formulário com o ID "consultaForm"
    const consultaForm = document.getElementById('consultaForm');
    // Obtém a referência para a div onde os resultados serão exibidos, com o ID "resultado"
    const resultadoDiv = document.getElementById('resultado');

    // Verifica se o formulário foi encontrado na página
    if (consultaForm) {
        // Adiciona um ouvinte de evento para o evento "submit" do formulário
        consultaForm.addEventListener('submit', async (event) => {
            // Impede o comportamento padrão do formulário de enviar e recarregar a página
            event.preventDefault();

            // Obtém a referência para o campo de entrada do ano
            const anoInput = document.getElementById('ano');
            // Converte o valor do campo de entrada para um número inteiro
            const ano = parseInt(anoInput.value);

            // Valida se o valor do ano é um número e está dentro do intervalo permitido
            if (isNaN(ano) || ano < 1990 || ano > 2025) {
                // Se o ano for inválido, exibe uma mensagem de erro na div de resultado
                resultadoDiv.innerHTML = '<p class="error">Por favor, insira um ano válido.</p>';
                return; // Sai da função para evitar a consulta à API com um ano inválido
            }

            // Exibe uma mensagem de "Carregando..." na div de resultado
            resultadoDiv.innerHTML = '<p class="loading">Carregando...</p>';

            // Chama a função para consultar os índices financeiros com o ano fornecido
            const resultados = await consultarIndicesFinanceiros(ano);

            // Verifica o tipo do resultado retornado pela função consultarIndicesFinanceiros
            if (typeof resultados === 'string') {
                // Se o resultado for uma string, assume-se que é uma mensagem de erro e a exibe
                resultadoDiv.innerHTML = `<p class="error">${resultados}</p>`;
            } else if (Array.isArray(resultados) && resultados.length > 0) {
                // Se o resultado for um array e não estiver vazio, assume-se que são os dados dos índices
                // Inicia a construção do código HTML para a tabela de resultados
                let html = '<table><thead><tr><th>Mês/Ano</th><th>Valor</th></tr></thead><tbody>';
                // Define um array com os nomes dos meses em português
                const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                // Itera sobre cada item no array de resultados
                resultados.forEach(item => {
                    // Extrai o dia, mês e ano da data do índice
                    const [dia, mes, anoIndice] = item.data.split("/").map(Number);
                    // Obtém o nome do mês correspondente ao número do mês
                    const mesNome = meses[mes - 1];
                    // Adiciona uma linha à tabela para cada resultado, formatando a data e o valor
                    html += `<tr><td>${mesNome}/${anoIndice}</td><td>${item.valor}</td></tr>`;
                });
                // Fecha o corpo da tabela
                html += '</tbody></table>';
                // Define o HTML da div de resultado com a tabela gerada
                resultadoDiv.innerHTML = html;
            } else {
                // Se o resultado não for uma string nem um array com dados, exibe uma mensagem de "nenhum resultado encontrado"
                resultadoDiv.innerHTML = '<p>Nenhum resultado encontrado.</p>';
            }
        });
    }
});