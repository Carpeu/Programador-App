const canvas = document.getElementById('drawingCanvas');
// Obtém o elemento canvas do HTML usando seu ID.
const ctx = canvas.getContext('2d');
// Obtém o contexto de desenho 2D do canvas, permitindo desenhar nele.
const colorPicker = document.getElementById('colorPicker');
// Obtém o elemento do seletor de cores do HTML usando seu ID.

let painting = false;
// Variável booleana para rastrear se o usuário está atualmente desenhando.

function startPosition(e) {
    // Função chamada quando o botão do mouse é pressionado sobre o canvas.
    painting = true;
    // Define a variável 'painting' como true, indicando que o desenho pode começar.
    draw(e);
    // Chama a função 'draw' para iniciar o desenho no ponto onde o mouse foi pressionado.
}

function endPosition() {
    // Função chamada quando o botão do mouse é liberado sobre o canvas.
    painting = false;
    // Define a variável 'painting' como false, indicando que o desenho deve parar.
    ctx.beginPath();
    // Inicia um novo caminho de desenho para evitar a conexão de linhas ao mover o mouse sem clicar.
}

function draw(e) {
    // Função chamada para desenhar no canvas enquanto o mouse está pressionado e se movendo.
    if (!painting) return;
    // Se 'painting' for false, a função é interrompida, pois o usuário não está desenhando.

    ctx.lineWidth = 5;
    // Define a espessura da linha de desenho como 5 pixels.
    ctx.lineCap = 'round';
    // Define a forma das extremidades das linhas como arredondadas.
    ctx.strokeStyle = colorPicker.value;
    // Define a cor da linha de desenho para o valor selecionado no seletor de cores.

    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    // Desenha uma linha do ponto anterior até a posição atual do mouse, levando em consideração a posição do canvas na tela.
    ctx.stroke();
    // Desenha a linha definida no contexto.
    ctx.beginPath();
    // Inicia um novo caminho para evitar problemas com a conexão de linhas ao mover o mouse rapidamente.
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    // Move o "pincel" para a posição atual do mouse.
}

function clearBoard() {
    // Função chamada para apagar todo o conteúdo do canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Limpa uma área retangular no canvas, cobrindo todo o canvas (de 0,0 até a largura e altura).
}

canvas.addEventListener('mousedown', startPosition);
// Adiciona um ouvinte de evento para o evento 'mousedown' no canvas, que chama a função 'startPosition' quando o mouse é pressionado.
canvas.addEventListener('mouseup', endPosition);
// Adiciona um ouvinte de evento para o evento 'mouseup' no canvas, que chama a função 'endPosition' quando o mouse é liberado.
canvas.addEventListener('mousemove', draw);
// Adiciona um ouvinte de evento para o evento 'mousemove' no canvas, que chama a função 'draw' quando o mouse se move enquanto está pressionado.