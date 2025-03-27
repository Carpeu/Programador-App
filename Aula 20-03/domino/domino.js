// Aguarda o carregamento completo do DOM antes de executar o código
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o elemento do tabuleiro do jogo
    const gameBoard = document.getElementById('game-board');
    // Seleciona o botão de reset
    const resetButton = document.getElementById('reset-button');
    // Seleciona as áreas dos jogadores em um array
    const playerAreas = [
        document.getElementById('player1-area'),
        document.getElementById('player2-area'),
        document.getElementById('player3-area'),
        document.getElementById('player4-area')
    ];
    // Seleciona a área central do tabuleiro
    const centerArea = document.getElementById('center-area');
    // Seleciona o display que mostra de quem é a vez
    const turnDisplay = document.getElementById('turn-display');

    // Variáveis de estado do jogo
    let dominoPieces = []; // Array para armazenar todas as peças de dominó
    let placedPieces = []; // Array para armazenar peças já colocadas no tabuleiro
    let players = [[], [], [], []]; // Array para armazenar as peças de cada jogador
    let currentPlayer = 0; // Índice do jogador atual
    let gameStarted = false; // Flag para indicar se o jogo começou
    let gameEnded = false; // Flag para indicar se o jogo terminou

    // Função para inicializar o jogo
    function initializeGame() {
        clearBoard(); // Limpa o tabuleiro
        // Adiciona efeito visual ao botão de reset
        resetButton.classList.add('pulse');
        setTimeout(() => resetButton.classList.remove('pulse'), 1000);
        
        // Gera as peças de dominó e distribui para os jogadores
        dominoPieces = generateDominoPieces();
        distributePieces();
        renderPlayerPieces();
        startGame(); // Inicia o jogo
    }
    // Função para limpar o tabuleiro e resetar o estado do jogo
    function clearBoard() {
        // Remove todas as peças colocadas do DOM
        placedPieces.forEach(piece => {
            if (piece.parentNode) {
                piece.parentNode.removeChild(piece);
            }
        });
        placedPieces = []; // Limpa o array de peças colocadas
        
        // Limpa as áreas dos jogadores
        playerAreas.forEach(area => {
            area.innerHTML = '';
        });
        
        // Reseta os arrays de jogadores e variáveis de estado
        players = [[], [], [], []];
        currentPlayer = 0;
        gameStarted = false;
        gameEnded = false;
    }
    // Função para gerar todas as peças de dominó
    function generateDominoPieces() {
        const pieces = []; // Array para armazenar as peças
        // Cores para os valores das peças
        const colors = [
            '#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#888'
        ];
        // Gera todas as combinações possíveis de peças
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                // Cria um elemento DOM para cada peça
                const piece = document.createElement('div');
                piece.classList.add('domino-piece');
                piece.dataset.rotation = '0'; // Armazena a rotação inicial
                piece.dataset.topValue = i; // Valor do topo
                piece.dataset.bottomValue = j; // Valor da base
                // HTML interno da peça (inicialmente com "?")
                piece.innerHTML = `
                    <div class="top" style="color: ${colors[i]}">?</div>
                    <div class="bottom" style="color: ${colors[j]}">?</div>
                `;
                // Adiciona evento de clique para revelar a peça
                piece.addEventListener('click', () => revealPiece(piece));
                pieces.push(piece); // Adiciona a peça ao array
            }
        }
        return pieces; // Retorna todas as peças geradas
    }
    // Função para revelar os valores de uma peça
    function revealPiece(piece) {
        // Verifica se a peça já não está revelada
        if (!piece.classList.contains('revealed')) {
            piece.classList.add('revealed'); // Marca como revelada
            // Obtém os valores e cores da peça
            const topValue = piece.dataset.topValue;
            const bottomValue = piece.dataset.bottomValue;
            const topColor = piece.querySelector('.top').style.color;
            const bottomColor = piece.querySelector('.bottom').style.color;
            
            // Efeito visual ao revelar
            piece.style.transform = 'scale(1.1)';
            setTimeout(() => {
                // Substitui os "?" pelos valores reais
                piece.innerHTML = `
                    <div class="top" style="color: ${topColor}">${topValue}</div>
                    <div class="bottom" style="color: ${bottomColor}">${bottomValue}</div>
                `;
                piece.style.transform = 'scale(1)'; // Volta ao tamanho normal
            }, 200);
        }
    }
    // Função para distribuir as peças entre os jogadores
    function distributePieces() {
        const shuffledPieces = shuffleArray(dominoPieces); // Embaralha as peças
        // Distribui 7 peças para cada jogador
        for (let i = 0; i < 4; i++) {
            players[i] = shuffledPieces.splice(0, 7);
        }
    }
    // Função para renderizar as peças dos jogadores em suas áreas
    function renderPlayerPieces() {
        playerAreas.forEach((area, index) => {
            area.innerHTML = ''; // Limpa a área do jogador
            // Para cada peça do jogador
            players[index].forEach((piece, pieceIndex) => {
                // Posiciona a peça na área do jogador
                piece.style.left = `${pieceIndex * 90}px`;
                piece.style.top = '0px';
                // Armazena a posição original
                piece.dataset.originalLeft = piece.style.left;
                piece.dataset.originalTop = piece.style.top;

                // Verifica se é uma peça dupla (mesmo valor em ambos os lados)
                const topValue = parseInt(piece.dataset.topValue);
                const bottomValue = parseInt(piece.dataset.bottomValue);
                if (topValue === bottomValue) {
                    piece.dataset.rotation = '0'; // Reseta a rotação
                    piece.style.transform = 'rotate(0deg)';
                }
                // Adiciona classe para animação de distribuição
                piece.classList.add('dealing');
                setTimeout(() => {
                    piece.classList.remove('dealing');
                }, 500 + (index * 100) + (pieceIndex * 50));

                area.appendChild(piece); // Adiciona a peça à área do jogador
                makeDraggable(piece); // Torna a peça arrastável
                makeRotatable(piece); // Torna a peça rotacionável
            });
        });
    }
    // Função para embaralhar um array (algoritmo Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
        }
        return array;
    }
    // Função para tornar um elemento arrastável
    function makeDraggable(element) {
        let offsetX, offsetY, isDragging = false;
        let originalLeft, originalTop;

        // Evento quando o mouse é pressionado na peça
        element.addEventListener('mousedown', (e) => {
            // Verifica se a peça pode ser movida (não está colocada, é a vez do jogador)
            if (!element.classList.contains('placed') && gameStarted && currentPlayer === 
            Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement)) {
                isDragging = true;
                // Calcula o offset do mouse em relação à peça
                offsetX = e.clientX - element.getBoundingClientRect().left;
                offsetY = e.clientY - element.getBoundingClientRect().top;
                element.style.zIndex = 100; // Traz para frente
                element.style.transform = element.style.transform + ' scale(1.1)'; // Efeito visual

                originalLeft = element.style.left; // Armazena posição original
                originalTop = element.style.top;
            }
        });
        // Evento quando o mouse é movido (arrastando a peça)
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const boardRect = gameBoard.getBoundingClientRect();
                // Calcula nova posição baseada no movimento do mouse
                const x = e.clientX - boardRect.left - offsetX;
                const y = e.clientY - boardRect.top - offsetY;
                
                // Atualiza posição da peça
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                element.style.position = 'absolute';
            }
        });
        // Evento quando o mouse é solto (finaliza o arrasto)
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = 1; // Volta ao z-index normal
                element.style.transform = element.style.transform.replace(' scale(1.1)', ''); // Remove efeito visual

                // Verifica se a peça está próxima a alguma peça colocada
                const placedPiece = checkIfCloseToPlaced(element);
                if (placedPiece) {
                    // Tenta encaixar a peça
                    if (tryToSnap(element, placedPiece)) {
                        // Remove a peça do array do jogador
                        const playerIndex = Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement);
                        players[playerIndex] = players[playerIndex].filter(p => p !== element);

                        // Verifica se o jogador venceu (sem peças restantes)
                        if (players[playerIndex].length === 0) {
                            endGame(playerIndex);
                            return;
                        }
                        // Passa a vez para o próximo jogador
                        currentPlayer = (currentPlayer + 1) % 4;
                        updateTurnDisplay();
                    } else {
                        // Se não encaixou, volta para a posição original
                        element.style.left = originalLeft;
                        element.style.top = originalTop;
                    }
                } else {
                    // Se não está perto de nenhuma peça, volta para a posição original
                    element.style.left = originalLeft;
                    element.style.top = originalTop;
                }
            }
        });
    }
    // Função para tornar um elemento rotacionável (com duplo clique)
    function makeRotatable(element) {
        element.addEventListener('dblclick', () => {
            // Verifica se a peça pode ser rotacionada (não está colocada, é a vez do jogador)
            if (!element.classList.contains('placed') && gameStarted && currentPlayer === 
            Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement)) {
                element.style.transition = 'transform 0.3s ease'; // Animação suave
                // Calcula nova rotação
                const currentRotation = parseInt(element.dataset.rotation || '0');
                const newRotation = (currentRotation + 90) % 360;
                element.dataset.rotation = newRotation.toString();
                element.style.transform = `rotate(${newRotation}deg)`;
                
                // Remove a transição após a animação
                setTimeout(() => {
                    element.style.transition = '';
                }, 300);
                // Verifica se após a rotação a peça pode ser encaixada
                const placedPiece = checkIfCloseToPlaced(element);
                if (placedPiece) {
                    if (tryToSnap(element, placedPiece)) {
                        // Remove a peça do array do jogador
                        const playerIndex = Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement);
                        players[playerIndex] = players[playerIndex].filter(p => p !== element);

                        // Verifica se o jogador venceu
                        if (players[playerIndex].length === 0) {
                            endGame(playerIndex);
                            return;
                        }
                        // Passa a vez para o próximo jogador
                        currentPlayer = (currentPlayer + 1) % 4;
                        updateTurnDisplay();
                    }
                }
            }
        });
    }
    // Função para verificar se uma peça está próxima a alguma peça colocada
    function checkIfCloseToPlaced(draggablePiece) {
        const rect1 = draggablePiece.getBoundingClientRect();
        // Verifica cada peça colocada
        for (const placedPiece of placedPieces) {
            if (placedPiece !== draggablePiece) {
                const rect2 = placedPiece.getBoundingClientRect();
                // Calcula distância entre as peças
                const distance = Math.sqrt(
                    Math.pow(rect1.left - rect2.left, 2) +
                    Math.pow(rect1.top - rect2.top, 2)
                );
                // Se a distância for pequena o suficiente, retorna a peça
                if (distance < 70) {
                    return placedPiece;
                }
            }
        }
        return null; // Nenhuma peça próxima encontrada
    }
    // Função para tentar encaixar uma peça em outra
    function tryToSnap(movingPiece, fixedPiece) {
        // Obtém os valores das peças
        const movingTop = parseInt(movingPiece.dataset.topValue);
        const movingBottom = parseInt(movingPiece.dataset.bottomValue);
        const fixedTop = parseInt(fixedPiece.dataset.topValue);
        const fixedBottom = parseInt(fixedPiece.dataset.bottomValue);
        const rotation = parseInt(movingPiece.dataset.rotation);

        let canSnap = false; // Flag para indicar se o encaixe é possível
        let newX = parseFloat(fixedPiece.style.left) || 0; // Nova posição X
        let newY = parseFloat(fixedPiece.style.top) || 0; // Nova posição Y

        // Obtém as dimensões das peças
        const fixedRect = fixedPiece.getBoundingClientRect();
        const movingRect = movingPiece.getBoundingClientRect();

        // Verifica possíveis encaixes baseado na rotação
        if (rotation === 0 || rotation === 180) {
            // Peça na orientação vertical
            if (movingTop === fixedBottom) {
                // Encaixe na parte inferior da peça fixa
                canSnap = true;
                newX = fixedRect.left - gameBoard.getBoundingClientRect().left;
                newY = fixedRect.top - gameBoard.getBoundingClientRect().top + fixedRect.height;
            } else if (movingBottom === fixedTop) {
                // Encaixe na parte superior da peça fixa
                canSnap = true;
                newX = fixedRect.left - gameBoard.getBoundingClientRect().left;
                newY = fixedRect.top - gameBoard.getBoundingClientRect().top - movingRect.height;
            }
        } else if (rotation === 90 || rotation === 270) {
            // Peça na orientação horizontal
            if (movingTop === fixedBottom) {
                // Encaixe no lado direito da peça fixa
                canSnap = true;
                newX = fixedRect.left - gameBoard.getBoundingClientRect().left + fixedRect.width;
                newY = fixedRect.top - gameBoard.getBoundingClientRect().top;
            } else if (movingBottom === fixedTop) {
                // Encaixe no lado esquerdo da peça fixa
                canSnap = true;
                newX = fixedRect.left - gameBoard.getBoundingClientRect().left - movingRect.width;
                newY = fixedRect.top - gameBoard.getBoundingClientRect().top;
            }
        }
        // Se o encaixe for possível
        if (canSnap) {
            // Animação de encaixe
            movingPiece.classList.add('placing');
            setTimeout(() => {
                movingPiece.classList.remove('placing');
            }, 300);

            // Posiciona a peça no local correto
            movingPiece.style.left = `${newX}px`;
            movingPiece.style.top = `${newY}px`;
            movingPiece.style.position = 'absolute';
            movingPiece.classList.add('placed'); // Marca como colocada
            placedPieces.push(movingPiece); // Adiciona ao array de peças colocadas
            return true; // Indica que o encaixe foi bem-sucedido
        }
        return false; // Indica que o encaixe falhou
    }
    // Função para iniciar o jogo (encontrar quem tem o duplo-6)
    function startGame() {
        // Verifica cada jogador
        for (let i = 0; i < 4; i++) {
            // Verifica se o jogador tem a peça dupla-6
            const hasDoubleSix = players[i].some(piece =>
                piece.dataset.topValue === '6' && piece.dataset.bottomValue === '6'
            );
            if (hasDoubleSix) {
                currentPlayer = i; // Define como jogador atual
                // Encontra a peça dupla-6
                const doubleSixPiece = players[i].find(piece =>
                    piece.dataset.topValue === '6' && piece.dataset.bottomValue === '6'
                );     
                // Posiciona exatamente no centro do tabuleiro
                const centerX = gameBoard.offsetWidth / 2 - 40; // 40 = metade da largura da peça
                const centerY = gameBoard.offsetHeight / 2 - 80; // 80 = metade da altura da peça
                
                doubleSixPiece.style.left = `${centerX}px`;
                doubleSixPiece.style.top = `${centerY}px`;
                doubleSixPiece.style.position = 'absolute';
                
                // Animação especial para a peça inicial
                doubleSixPiece.style.transition = 'all 0.5s ease';
                doubleSixPiece.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    doubleSixPiece.style.transform = 'scale(1)';
                    setTimeout(() => {
                        doubleSixPiece.style.transition = '';
                    }, 500);
                }, 500);
                
                doubleSixPiece.classList.add('placed'); // Marca como colocada
                placedPieces.push(doubleSixPiece); // Adiciona às peças colocadas
                players[i] = players[i].filter(p => p !== doubleSixPiece); // Remove do jogador
                gameStarted = true; // Marca o jogo como iniciado
                
                revealPiece(doubleSixPiece); // Revela a peça
                updateTurnDisplay(); // Atualiza o display de turno
                break; // Sai do loop
            }
        }
    }
    // Função para finalizar o jogo (quando um jogador fica sem peças)
    function endGame(winnerIndex) {
        gameEnded = true; // Marca o jogo como terminado
        
        // Efeito visual na área do vencedor
        const winnerArea = playerAreas[winnerIndex];
        winnerArea.style.animation = 'pulse 0.5s 3';
        setTimeout(() => {
            winnerArea.style.animation = '';
        }, 1500);     
        // Cria mensagem de vitória
        const winnerMessage = document.createElement('div');
        winnerMessage.textContent = `Jogador ${winnerIndex + 1} venceu!`;
        winnerMessage.style.position = 'absolute';
        winnerMessage.style.top = '50%';
        winnerMessage.style.left = '50%';
        winnerMessage.style.transform = 'translate(-50%, -50%)';
        winnerMessage.style.fontSize = '36px';
        winnerMessage.style.fontWeight = 'bold';
        winnerMessage.style.color = 'gold';
        winnerMessage.style.textShadow = '2px 2px 4px black';
        winnerMessage.style.zIndex = '1000';
        gameBoard.appendChild(winnerMessage);
        
        // Remove a mensagem após 3 segundos
        setTimeout(() => {
            gameBoard.removeChild(winnerMessage);
        }, 3000);
        
        updateTurnDisplay(); // Atualiza o display de turno
    }
    // Função para atualizar o display que mostra de quem é a vez
    function updateTurnDisplay() {
        if (gameStarted && !gameEnded) {
            // Mostra qual jogador tem a vez
            turnDisplay.textContent = `Vez do Jogador ${currentPlayer + 1}`;
            
            // Destaca a área do jogador atual
            playerAreas.forEach((area, index) => {
                if (index === currentPlayer) {
                    // Efeito visual para o jogador atual
                    area.parentElement.style.transform = index === 0 ? 'translateX(-50%) scale(1.1)' : 
                                                      index === 1 ? 'translateY(-50%) scale(1.1)' : 
                                                      index === 2 ? 'translateX(-50%) scale(1.1)' : 
                                                      'translateY(-50%) scale(1.1)';
                    area.style.border = '2px solid gold';
                } else {
                    // Estilo normal para outros jogadores
                    area.parentElement.style.transform = index === 0 ? 'translateX(-50%)' : 
                                                      index === 1 ? 'translateY(-50%)' : 
                                                      index === 2 ? 'translateX(-50%)' : 
                                                      'translateY(-50%)';
                    area.style.border = '1px dashed rgba(255, 255, 255, 0.3)';
                }
            });
        } else {
            // Limpa o display quando o jogo não está em andamento
            turnDisplay.textContent = '';
            playerAreas.forEach(area => {
                area.style.border = '1px dashed rgba(255, 255, 255, 0.3)';
            });
        }
    }
    // Evento de clique no botão de reset
    resetButton.addEventListener('click', () => {
        // Efeito visual ao resetar
        gameBoard.style.opacity = '0.5';
        setTimeout(() => {
            gameBoard.style.opacity = '1';
            initializeGame(); // Reinicia o jogo
        }, 500);
    });
    // Inicializa o jogo quando a página carrega
    initializeGame();
});