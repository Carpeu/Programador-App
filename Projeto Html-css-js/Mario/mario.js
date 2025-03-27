const mario = document.querySelector('.mario'); // Elemento do Mario
const pipe = document.querySelector('.pipe');   // Elemento do cano
const clouds = document.querySelector('.clouds'); // Elemento das nuvens
const ground = document.querySelector('.ground'); // Elemento do chão

// Variáveis de estado do jogo
let isGameOver = false; // Flag para verificar se o jogo acabou
let gameLoop;          // Referência para o loop principal do jogo

const jump = () => {
    // Se o jogo acabou, reinicia ao pressionar qualquer tecla
        if (isGameOver) {
            restartGame();
            return;
        }    
    // Impede de pular novamente enquanto já está pulando
        if (mario.classList.contains('jump')) return;

            // Adiciona a classe 'jump' que ativa a animação
            mario.classList.add('jump');
    
            // Remove a classe 'jump' após 500ms (quando a animação termina)
        setTimeout(() => {
            mario.classList.remove('jump');
        }, 500);
}
// Função que verifica colisões entre Mario e cano
const checkCollision = () => {
    const pipePosition = pipe.offsetLeft;  // Obtém a posição horizontal do cano
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', ''); // Obtém a posição vertical do Mario (distância do fundo)
    const marioWidth = +window.getComputedStyle(mario).width.replace('px', ''); // Obtém a largura do Mario

     // Condição de colisão:
    // - Quando o cano está entre 0 e 120px à direita do Mario
    // - E o Mario está a menos de 80px do chão
        if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
            // Para a animação do cano e fixa sua posição
            pipe.style.animation = 'none';
            pipe.style.left = `${pipePosition}px`;
            // Para a animação do Mario e fixa sua posição
            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;
            // Muda a imagem para game over e ajusta tamanho
            mario.src = 'game-over.png';
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';
            // Para as animações do cenário
            clouds.style.animation = 'none';
            ground.style.animation = 'none';
            
            // Para o loop do jogo
            clearInterval(gameLoop);
            // Marca o jogo como encerrado
            isGameOver = true;
        }
}
// Função para reiniciar o jogo
const restartGame = () => {
    // Reseta todas as posições e animações
    pipe.style.animation = 'pipe-animation 2.5s infinite linear';
    pipe.style.left = '';
    
    // Reseta o Mario para o estado inicial
    mario.src = 'mario.gif';
    mario.style.width = '150px';
    mario.style.marginLeft = '';
    mario.style.bottom = '60px';
    mario.style.animation = '';
    mario.classList.remove('jump');
    
    // Reinicia as animações do cenário
    clouds.style.animation = 'clouds-animation 15s infinite linear';
    ground.style.animation = 'ground-animation 5s linear infinite';
    
    // Marca o jogo como ativo
    isGameOver = false;
    
    // Reinicia o loop do jogo
    gameLoop = setInterval(checkCollision, 10);
}
// Inicia o jogo pela primeira vez
gameLoop = setInterval(checkCollision, 10);

document.addEventListener('keydown', jump); // Permite também clicar na tela para pular/reiniciar

document.addEventListener('click', jump); // Pula com clique do mouse