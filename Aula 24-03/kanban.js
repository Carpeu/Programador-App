document.addEventListener('DOMContentLoaded', (event) => {
    const columns = document.querySelectorAll('.column');
    let draggedItem = null;

    columns.forEach(column => {
        column.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            e.target.style.opacity = '0.4';
        });

        column.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
        });

        column.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('column')) {
                e.target.appendChild(draggedItem);
            } else if (e.target.classList.contains('item')) {
                e.target.parentNode.insertBefore(draggedItem, e.target.nextSibling);
            }
        });
    });
});
