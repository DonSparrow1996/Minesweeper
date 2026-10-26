document.addEventListener("DOMContentLoaded", () => {
    const minefield = document.querySelector('.minefield');
    for (let i = 0; i < 225; i++) {
        const cell = document.createElement('div');                 //Создали 225 ячеек (поле 15*15).
        cell.classList.add('cell');
        minefield.appendChild(cell);
    }
});

$(function () {
    let bombCount = $('.bomb').length;
    $('.number').text(bombCount);
});

$(function () {
    $('.cell').addClass('close');
    $('.close').click(function() {
        if ($(this).hasClass('flagged')) {
            return false;
        } else {
            $(this).removeClass('close').addClass('open');
        }
    });
    $('.close').contextmenu(function(event) {
        event.preventDefault();                 // Отключаем стандартное контекстное меню

        if ($(this).hasClass('close')) {
            $(this).toggleClass('flagged');
            let flagCount = $('.flagged').length;
            let bombCount = $('.bomb').length;
            let bombDangerCount = bombCount - flagCount;
            let realFlaggedBomb = $('.bomb.flagged').length;
            console.log(realFlaggedBomb);
            $('.number').text(bombDangerCount);
            if (bombDangerCount === 0 && flagCount === realFlaggedBomb && bombCount > 0) {
                $('.win, .restart_external').show(200);

            }
        }
    });
});

$(document).one('click', '.cell', function () {
    $('h2').hide();
    console.log('GAME IS START');
    let cells = $('.cell').toArray(); // Превращаем jQuery-объект в массив
    let bombPositions = new Set(); // чтобы избежать повторов
    let clickedIndex = $('.cell').index(this);
    let clickedX = clickedIndex % 15;
    let clickedY = Math.floor(clickedIndex / 15);
    let safeZone = new Set([clickedIndex]);

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let nx = clickedX + dx;
            let ny = clickedY + dy;
        
            if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15) {
            safeZone.add(ny * 15 + nx);
            }
        }
    }

    while (bombPositions.size < 30) { // 30 бомб
        let randomIndex = Math.floor(Math.random() * cells.length);         //Расставляем бомбы
        if (safeZone.has(randomIndex)) continue;
        bombPositions.add(randomIndex);
    }
    bombPositions.forEach(index => {
        $(cells[index]).addClass('bomb');
        $('.cell').removeClass('flagged');
    });

    let bombCount = $('.bomb').length;
    $('.number').text(bombCount);

    $('.cell').each(function () {
        if ($(this).hasClass('bomb')) return;

        let index = $('.cell').index(this);
        let x = index % 15;
        let y = Math.floor(index / 15);
        let bombCount = 0;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;

                let nx = x + dx;
                let ny = y + dy;

                if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15) {
                    let neighborIndex = ny * 15 + nx;
                    if ($('.cell').eq(neighborIndex).hasClass('bomb')) {
                        bombCount++;
                    }
                }
            }
        }

        if (bombCount > 0) {
        $(this).append(`<p class="bombsAround">${bombCount}</p>`);
        }
    });

    let queue = [clickedIndex];
    let visited = new Set(queue);

    while (queue.length > 0) {
        let currentIndex = queue.shift();
        let currentCell = $('.cell').eq(currentIndex);

        if (currentCell.hasClass('bomb')) continue;

        currentCell.click();

        if (currentCell.find('.bombsAround').length > 0) continue;

        let x = currentIndex % 15;
        let y = Math.floor(currentIndex / 15);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;

                let nx = x + dx;
                let ny = y + dy;

                if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15) {
                    let neighborIndex = ny * 15 + nx;
    
                   if (!visited.has(neighborIndex)) {
                    queue.push(neighborIndex);
                    visited.add(neighborIndex);
                   }
            }
            }
        }
    }
});

$(document).on('mousedown', '.cell.open:has(p)', function(event) {
    if (event.which === 2) {  
        event.preventDefault();  
        console.log('Средний клик по ячейке с числом!');

        let index = $('.cell').index(this);
        let x = index % 15;
        let y = Math.floor(index / 15);
        let bombs = 0;
        let flags = 0;
        let toClick = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;

                let nx = x + dx;
                let ny = y + dy;

                if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15) {
                    let neighborIndex = ny * 15 + nx;
                    let neighbor = $('.cell').eq(neighborIndex);
        
                    if (neighbor.hasClass('bomb')) bombs++;
                    if (neighbor.hasClass('flagged')) flags++;
                    if (neighbor.hasClass('close') && !neighbor.hasClass('flagged')) {
                        toClick.push(neighbor);
                    }
                }
            }
        }

        if (bombs === flags) {
            toClick.forEach(cell => cell.trigger('click'));
        }
           }
});

function openEmptyCells() {
    let queue = $('.cell.open:not(:has(p))').toArray();
    let visited = new Set(queue.map(cell => $('.cell').index(cell)));

    while (queue.length > 0) {
        let currentCell = $(queue.shift());
        let index = $('.cell').index(currentCell);
        let x = index % 15;
        let y = Math.floor(index / 15);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;

                let nx = x + dx;
                let ny = y + dy;

                if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15) {
                    let neighborIndex = ny * 15 + nx;
                    let neighborCell = $('.cell').eq(neighborIndex);

                    if (neighborCell.hasClass('close')) {
                        neighborCell.removeClass('close').addClass('open');

                        if (!neighborCell.has('p').length && !visited.has(neighborIndex)) {
                            queue.push(neighborCell[0]);
                            visited.add(neighborIndex);
                        }
                    }
                }
            }
        }
    }
}

// Запускаем проверку **каждые 250 мс**
setInterval(openEmptyCells, 250);



$(function () {
    $(document).on('click', '.bomb', function() {
        $('.cell.bomb').removeClass('close flagged').addClass('open');                   // GAME OVER
        $('.state p').text('GAME OVER');
    });
});

$(function () {
    $('.restart_internal, .restart_external').click(function() {
        location.reload();
    });
});