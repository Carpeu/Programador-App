document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os elementos com a classe 'piece' (as peças)
    const pieces = document.querySelectorAll('.piece');
    // Seleciona todos os elementos com a classe 'house' (as casas do tabuleiro)
    const houses = document.querySelectorAll('.house');

    // Seleciona a lista de peças vermelhas capturadas
    const capturedRedList = document.querySelector('.captured-red .pieces-list');
    // Seleciona a lista de peças pretas capturadas
    const capturedBlackList = document.querySelector('.captured-black .pieces-list');
    // Seleciona o elemento para exibir a contagem de peças vermelhas capturadas
    const redCountElement = document.getElementById('red-count');
    // Seleciona o elemento para exibir a contagem de peças pretas capturadas
    const blackCountElement = document.getElementById('black-count');
    // Seleciona o elemento para exibir o jogador atual
    const currentPlayerElement = document.getElementById('current-player');
    // Seleciona o botão de reiniciar o jogo
    const resetButton = document.getElementById('reset-button');

    // Variável para armazenar a peça que está sendo arrastada
    let selectedPiece = null;
    // Contador de peças vermelhas capturadas
    let capturedRed = 0;
    // Contador de peças pretas capturadas
    let capturedBlack = 0;
    // Começa com o jogador vermelho
    let currentPlayer = 'red';
    // Controla se o jogador está em uma sequência de capturas múltiplas
    let isMultipleCapture = false;

    // Atualiza a interface para mostrar o jogador atual
    function updateCurrentPlayerDisplay() {
        currentPlayerElement.textContent = `Jogador Atual: ${currentPlayer === 'red' ? 'Vermelho' : 'Preto'}`;
    }

    // Inicializa a exibição do jogador atual
    updateCurrentPlayerDisplay();

    // Adiciona um ouvinte de evento para o início do arrastar em cada peça
    pieces.forEach(piece => {
        piece.addEventListener('dragstart', (e) => {
            // Verifica se a peça pertence ao jogador atual e se não está em uma captura múltipla
            if (piece.classList.contains(currentPlayer) && !isMultipleCapture) {
                selectedPiece = e.target; // Define a peça selecionada
                e.dataTransfer.setData('text/plain', e.target.id); // Armazena o ID da peça
            } else if (isMultipleCapture && piece.classList.contains(currentPlayer)) {
                // Permite que o jogador continue arrastando se estiver em uma captura múltipla
                selectedPiece = e.target;
                e.dataTransfer.setData('text/plain', e.target.id);
            }
        });
    });

    // Adiciona um ouvinte de evento para quando uma peça é arrastada sobre uma casa
    houses.forEach(house => {
        house.addEventListener('dragover', (e) => {
            e.preventDefault(); // Impede o comportamento padrão de arrastar (permite soltar a peça na casa)
        });

        // Adiciona um ouvinte de evento para quando uma peça é solta em uma casa
        house.addEventListener('drop', (e) => {
            e.preventDefault(); // Impede o comportamento padrão de soltar
            const id = e.dataTransfer.getData('text/plain'); // Obtém o ID da peça que foi arrastada
            const draggable = document.getElementById(id); // Encontra o elemento da peça pelo seu ID

            const originHouse = selectedPiece.parentElement; // Obtém a casa de origem da peça
            const targetHouse = e.target; // Obtém a casa onde a peça foi solta

            const originCoords = getHouseCoordinates(originHouse); // Obtém as coordenadas da casa de origem
            const targetCoords = getHouseCoordinates(targetHouse); // Obtém as coordenadas da casa de destino

            // Verifica se o movimento é válido
            if (isValidMove(originCoords, targetCoords, draggable)) {
                // Verifica se é um movimento de captura
                if (isCaptureMove(originCoords, targetCoords, draggable)) {
                    const capturedPieces = getCapturedPieces(originCoords, targetCoords, draggable); // Obtém as peças capturadas no caminho
                    capturedPieces.forEach(piece => {
                        if (piece.classList.contains('red')) { // Se a peça capturada for vermelha
                            capturedRed++; // Incrementa o contador de peças vermelhas capturadas
                            updateCapturedPieces(piece, capturedRedList, redCountElement); // Atualiza a lista e o contador de peças vermelhas
                        } else if (piece.classList.contains('black')) { // Se a peça capturada for preta
                            capturedBlack++; // Incrementa o contador de peças pretas capturadas
                            updateCapturedPieces(piece, capturedBlackList, blackCountElement); // Atualiza a lista e o contador de peças pretas
                        }
                        piece.remove(); // Remove a peça capturada do tabuleiro
                    });

                    // Verifica se há mais capturas possíveis
                    if (canCaptureAgain(targetCoords, draggable)) {
                        isMultipleCapture = true; // Permite que o jogador continue capturando
                    } else {
                        isMultipleCapture = false; // Finaliza a captura múltipla
                        switchPlayer(); // Passa o turno para o próximo jogador
                    }
                } else {
                    isMultipleCapture = false; // Finaliza a captura múltipla
                    switchPlayer(); // Passa o turno para o próximo jogador
                }

                targetHouse.appendChild(draggable); // Move a peça para a casa de destino
                checkForKing(draggable, targetCoords); // Verifica se a peça se tornou uma dama

                // Verifica se há um vencedor
                checkForWinner();
            }
        });
    });

    // Função para obter as coordenadas (linha e coluna) de uma casa
    function getHouseCoordinates(house) {
        if (!house) return null; // Retorna null se a casa for nula
        const id = house.id.split('-'); // Divide o ID da casa (ex: "house-0-1") em partes
        return { row: parseInt(id[1]), col: parseInt(id[2]) }; // Retorna um objeto com a linha e a coluna como números inteiros
    }

    // Função para verificar se o movimento é válido
    function isValidMove(origin, target, piece) {
        if (!origin || !target || !piece) return false; // Retorna falso se as coordenadas ou a peça não existirem

        const rowDiff = target.row - origin.row; // Diferença entre as linhas
        const colDiff = Math.abs(target.col - origin.col); // Diferença absoluta entre as colunas

        // Verifica se o movimento é diagonal
        if (Math.abs(rowDiff) !== colDiff) return false;

        // Verifica se a casa de destino é branca
        const targetHouse = document.getElementById(`house-${target.row}-${target.col}`);
        if (targetHouse.classList.contains('dark')) return false;

        // Verifica a direção do movimento para peças comuns
        if (!piece.classList.contains('king')) {
            if (piece.classList.contains('red')) {
                if (rowDiff > 0) return false; // Peças vermelhas só podem se mover para cima
            } else if (piece.classList.contains('black')) {
                if (rowDiff < 0) return false; // Peças pretas só podem se mover para baixo
            }
        }

        // Verifica se o caminho está livre
        const rowStep = target.row > origin.row ? 1 : -1; // Passo da linha
        const colStep = target.col > origin.col ? 1 : -1; // Passo da coluna

        let currentRow = origin.row + rowStep; // Começa na próxima casa na direção do destino
        let currentCol = origin.col + colStep;

        let captureCount = 0; // Contador de peças capturadas

        while (currentRow !== target.row || currentCol !== target.col) {
            const currentHouse = document.getElementById(`house-${currentRow}-${currentCol}`);
            if (currentHouse.firstChild) {
                const currentPiece = currentHouse.firstChild;

                // Verifica se a peça no caminho é adversária
                if (currentPiece.classList.contains(piece.classList.contains('red') ? 'black' : 'red')) {
                    captureCount++; // Incrementa o contador de captura
                    if (captureCount > 1 && !piece.classList.contains('king')) return false; // Apenas uma captura por movimento (para peças comuns)
                } else {
                    return false; // Caminho bloqueado por peça aliada
                }
            }
            currentRow += rowStep; // Move para a próxima casa na linha
            currentCol += colStep; // Move para a próxima casa na coluna
        }

        return true; // Movimento válido
    }

    // Função para verificar se o movimento é de captura
    function isCaptureMove(origin, target, piece) {
        const rowDiff = Math.abs(target.row - origin.row); // Diferença de linhas
        const colDiff = Math.abs(target.col - origin.col); // Diferença de colunas

        // Verifica se o movimento é de captura (pelo menos duas casas)
        if (rowDiff < 2 || colDiff < 2) return false;

        const rowStep = target.row > origin.row ? 1 : -1; // Passo da linha
        const colStep = target.col > origin.col ? 1 : -1; // Passo da coluna

        let currentRow = origin.row + rowStep; // Começa na próxima casa
        let currentCol = origin.col + colStep;

        while (currentRow !== target.row || currentCol !== target.col) {
            const currentHouse = document.getElementById(`house-${currentRow}-${currentCol}`);
            if (currentHouse.firstChild) {
                const currentPiece = currentHouse.firstChild;
                // Verifica se a peça no caminho é adversária
                if (currentPiece.classList.contains(piece.classList.contains('red') ? 'black' : 'red')) {
                    return true; // É um movimento de captura
                } else {
                    return false; // Caminho bloqueado
                }
            }
            currentRow += rowStep; // Próxima casa
            currentCol += colStep;
        }

        return false; // Se chegou ao final sem encontrar adversário no caminho, não é captura
    }

    // Função para obter as peças capturadas no caminho
    function getCapturedPieces(origin, target, piece) {
        const rowStep = target.row > origin.row ? 1 : -1; // Passo da linha
        const colStep = target.col > origin.col ? 1 : -1; // Passo da coluna

        let currentRow = origin.row + rowStep; // Começa na próxima casa
        let currentCol = origin.col + colStep;

        const capturedPieces = []; // Array para armazenar as peças capturadas

        while (currentRow !== target.row || currentCol !== target.col) {
            const currentHouse = document.getElementById(`house-${currentRow}-${currentCol}`);
            if (currentHouse.firstChild) {
                const currentPiece = currentHouse.firstChild;
                // Verifica se a peça no caminho é adversária
                if (currentPiece.classList.contains(piece.classList.contains('red') ? 'black' : 'red')) {
                    capturedPieces.push(currentPiece); // Adiciona a peça ao array de capturadas
                }
            }

            currentRow += rowStep; // Próxima casa
            currentCol += colStep;
        }

        return capturedPieces; // Retorna o array de peças capturadas
    }

    // Função para verificar se a peça se tornou uma dama
    function checkForKing(piece, targetCoords) {
        if ((piece.classList.contains('red') && targetCoords.row === 0) || (piece.classList.contains('black') && targetCoords.row === 7)) {
            piece.classList.add('king'); // Adiciona a classe 'king' à peça
        }
    }

    // Função para atualizar a lista de peças capturadas e o contador
    function updateCapturedPieces(piece, listElement, countElement) {
        const capturedPiece = document.createElement('div'); // Cria um novo elemento div para representar a peça capturada
        capturedPiece.classList.add('piece', piece.classList.contains('red') ? 'red' : 'black'); // Adiciona as classes 'piece' e a cor da peça capturada
        listElement.appendChild(capturedPiece); // Adiciona a representação da peça capturada à lista
        countElement.textContent = piece.classList.contains('red') ? capturedRed : capturedBlack; // Atualiza o texto do contador de peças capturadas
    }

    // Função para alternar o jogador atual
    function switchPlayer() {
        currentPlayer = currentPlayer === 'red' ? 'black' : 'red'; // Alterna entre vermelho e preto
        updateCurrentPlayerDisplay(); // Atualiza a exibição do jogador atual
    }

    // Função para verificar se o jogador pode capturar novamente
    function canCaptureAgain(coords, piece) {
        const directions = [
            { row: 2, col: 2 },
            { row: 2, col: -2 },
            { row: -2, col: 2 },
            { row: -2, col: -2 }
        ];

        for (const dir of directions) {
            const targetRow = coords.row + dir.row;
            const targetCol = coords.col + dir.col;

            if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                const targetHouse = document.getElementById(`house-${targetRow}-${targetCol}`);
                if (isValidMove(coords, { row: targetRow, col: targetCol }, piece)) {
                    return true; // Há uma captura possível
                }
            }
        }

        return false; // Não há capturas possíveis
    }

    // Função para verificar se há um vencedor
    function checkForWinner() {
        const redPieces = document.querySelectorAll('.piece.red');
        const blackPieces = document.querySelectorAll('.piece.black');

        if (redPieces.length === 0) {
            showWinnerMessage('Jogador Preto venceu! 🎉'); // Exibe mensagem de vitória
            resetGame();
        } else if (blackPieces.length === 0) {
            showWinnerMessage('Jogador Vermelho venceu! 🎉'); // Exibe mensagem de vitória
            resetGame();
        }
    }

    // Função para exibir uma mensagem de vitória chamativa
    function showWinnerMessage(message) {
        const winnerMessage = document.createElement('div');
        winnerMessage.classList.add('winner-message'); // Adiciona a classe CSS
        winnerMessage.textContent = message;
        document.body.appendChild(winnerMessage);

        // Remove a mensagem após 3 segundos
        setTimeout(() => {
            winnerMessage.remove();
        }, 3000);
    }

    // Função para reiniciar o jogo
    function resetGame() {
        window.location.reload(); // Recarrega a página
    }

    // Adiciona um ouvinte de evento para o botão de reiniciar o jogo
    resetButton.addEventListener('click', resetGame);
});