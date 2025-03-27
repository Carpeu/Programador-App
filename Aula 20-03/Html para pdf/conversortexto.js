document.getElementById('convertBtn').addEventListener('click', function() {
    const htmlContent = document.getElementById('htmlInput').value;
    if (!htmlContent) {
    alert('Por favor, insira algum conteúdo HTML.');
    return;
    }
    // Cria um elemento temporário para converter o HTML
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    // Configurações para o PDF
    const opt = {
    margin: 10,
    filename: 'documento.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // Converte o HTML para PDF
    html2pdf().from(element).set(opt).save();
    });