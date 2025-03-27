
async function consultarCEP() { // Função assíncrona para consultar o CEP usando a API ViaCEP
    const cepInput = document.getElementById('cep'); // Obtém o elemento de entrada com o ID 'cep'
    const resultadoDiv = document.getElementById('resultado'); // Obtém a div onde os resultados serão exibidos
    const novaConsultaButton = document.getElementById('novaConsulta'); // Obtém o botão de "Nova Consulta"
    const cep = cepInput.value.replace(/\D/g, ''); // Obtém o valor do campo CEP e remove todos os caracteres não numéricos

    if (!/^\d{8}$/.test(cep)) { // Verifica se o CEP inserido possui exatamente 8 dígitos (formato válido)
        resultadoDiv.innerHTML = '<p class="error">Por favor, digite um CEP válido (apenas números).</p>'; // Exibe uma mensagem de erro na div de resultado
        novaConsultaButton.style.display = 'none'; // Esconde o botão de nova consulta
        return; // Sai da função se o CEP for inválido
    }

    const url = `https://viacep.com.br/ws/${cep}/json/`; // Monta a URL da API do ViaCEP com o CEP fornecido

    resultadoDiv.innerHTML = '<p class="loading">Consultando...</p>'; // Exibe uma mensagem de "Consultando..." na div de resultado

    try {
        const response = await fetch(url); // Faz uma requisição assíncrona para a URL da API
        if (!response.ok) { // Verifica se a resposta da requisição foi bem-sucedida (status 2xx)
            throw new Error(`Erro na requisição: ${response.status}`); // Lança um erro se a requisição falhar
        }
        const data = await response.json(); // Converte a resposta da API (JSON) para um objeto JavaScript

        if (data.erro) { // Verifica se a API retornou um erro (CEP não encontrado)
            resultadoDiv.innerHTML = `<p class="error">CEP não encontrado.</p>`; // Exibe uma mensagem de erro na div de resultado
            novaConsultaButton.style.display = 'none'; // Esconde o botão de nova consulta
        } else { // Caso o CEP seja encontrado, exibe os dados retornados pela API
            resultadoDiv.innerHTML = `
                <p><strong>CEP:</strong> ${data.cep}</p>   <!-- Exibe o CEP formatado -->
                <p><strong>Logradouro:</strong> ${data.logradouro}</p>   <!-- Exibe o logradouro (nome da rua/avenida) -->
                <p><strong>Complemento:</strong> ${data.complemento || 'Não informado'}</p>   <!-- Exibe o complemento (se existir) ou "Não informado" caso não haja -->
                <p><strong>Bairro:</strong> ${data.bairro}</p>   <!-- Exibe o bairro -->
                <p><strong>Localidade:</strong> ${data.localidade}</p>   <!-- Exibe a cidade -->
                <p><strong>UF:</strong> ${data.uf}</p>   <!-- Exibe o estado (sigla da Unidade Federativa) -->
            `; // Exibe os dados do endereço formatados na div de resultado
            novaConsultaButton.style.display = 'block'; // Mostra o botão de nova consulta
        }

    } catch (error) { // Captura qualquer erro que ocorra durante a execução do bloco try
        console.error('Erro na consulta:', error); // Loga o erro no console para fins de depuração
        resultadoDiv.innerHTML = `<p class="error">Ocorreu um erro ao consultar o CEP.</p>`; // Exibe uma mensagem de erro genérica na div de resultado
        novaConsultaButton.style.display = 'none'; // Esconde o botão de nova consulta em caso de erro
    }
}

// Adiciona um listener para formatar o CEP ao sair do campo
document.addEventListener('DOMContentLoaded', () => {
    const cepInput = document.getElementById('cep'); // Obtém o elemento de entrada do CEP
    const novaConsultaButton = document.getElementById('novaConsulta'); // Obtém o botão de "Nova Consulta"
    if (cepInput) { // Verifica se o elemento de entrada do CEP foi encontrado na página
        cepInput.addEventListener('blur', function() { // Adiciona um ouvinte de evento para o evento 'blur' (quando o campo perde o foco)
            let cepValue = this.value.replace(/\D/g, ''); // Obtém o valor do campo e remove caracteres não numéricos
            if (cepValue.length === 8) { // Verifica se o CEP possui 8 dígitos
                this.value = cepValue.substring(0, 5) + '-' + cepValue.substring(5); // Formata o CEP adicionando um hífen
            }
        });
    }

    // Inicialmente esconde o botão de nova consulta
    if (novaConsultaButton) {
        novaConsultaButton.style.display = 'none'; // Define a propriedade 'display' do botão como 'none' para escondê-lo
    }
});

// Função para limpar os resultados
function limparResultado() {
    document.getElementById('cep').value = ''; // Limpa o valor do campo de entrada do CEP
    document.getElementById('resultado').innerHTML = ''; // Limpa o conteúdo da div de resultado
    document.getElementById('novaConsulta').style.display = 'none'; // Esconde o botão de nova consulta
}