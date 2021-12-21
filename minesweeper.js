const readline = require('readline');
const { isNumber } = require('util');
const columnsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const lineNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
let gameover = false;

start();

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

function generateField(lines, columns) {

    const lineArray = [];
    for (let lineIndex = 0; lineIndex < lines; lineIndex++) {
        const columnArray = []
        for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
            const spot = {
                line: lineNumbers[lineIndex],
                column: columnsLetters[columnIndex],
                bomb: false,
                pressed: false,
                bombs: 0
            }
            columnArray.push(spot);
        }
        lineArray.push(columnArray);
    }

    return lineArray;
}

function addBombs(field, bombs) {

    flatted = field.flat();

    for (let index = 0; index < bombs; index++) {

        let added = false;
        do {
            indexToAdd = Math.floor(Math.random() * flatted.length);
            if (!flatted[indexToAdd].bomb) {
                flatted[indexToAdd].bomb = true;
                added = true;
            }

        } while (!added);

    }

    returningArray = [];

    let chunk = field[0].length;
    for (let index = 0, j = flatted.length; index < flatted.length; index += chunk) {
        returningArray.push(flatted.slice(index, index + chunk))

    }

    return returningArray;
}


async function drawField(field) {

    let columnTitle = '  ';
    for (let index = 0; index < field[0].length; index++) {
        columnTitle += `${columnsLetters[index]}  `;

    }
    console.log(columnTitle);
    for (let lineIndex = 0; lineIndex < field.length; lineIndex++) {
        const line = field[lineIndex];
        let spots = `${lineNumbers[lineIndex]}`;
        for (let columnIndex = 0; columnIndex < line.length; columnIndex++) {
            const spot = line[columnIndex];
            if (spot.pressed) {
                if (spot.bomb) {
                    spots += `[\x1B[31mX\x1b[0m]`;
                    gameover = true;
                } else {
                    spots += `[${spot.bombs}]`;
                }
            } else {
                spots += `[ ]`
            }

        }
        console.log(spots);

    }
}

async function pressSpot(field, line, column) {


    try {
        if (line !== -1 && column !== -1) {

            if (!field[line][column].pressed) {
                field[line][column].pressed = true;
                await searchBombs(field, line, column);
            }
        }
    } catch (error) {

    }


    return field;

}

async function searchBombs(field, line, column) {

    let bombs = 0;
    for (let index = line - 1; index < line + 2; index++) {
        for (let index2 = column - 1; index2 < column + 2; index2++) {
            let spot = {};
            try {
                spot = field[index][index2];

                if (spot.bomb) {
                    bombs += 1;
                }
            }
            catch (error) {

            }
        }
    }
    field[line][column].bombs = bombs;
    if (bombs === 0) {
        for (let index = line - 1; index < line + 2; index++) {
            for (let index2 = column - 1; index2 < column + 2; index2++) {

                     await pressSpot(field, index, index2);
                
            }
        }
    }
}

async function start() {
    console.clear();
    await askQuestion('iniciar? S/N :');
    const linesInput = await askQuestion('numero de linhas? (max 10):');
    const columnsInput = await askQuestion('numero de colunas? (max 10):');
    const bombsInput = await askQuestion(`numero de bombas? (max ${parseInt(linesInput)*parseInt(columnsInput)}):`);
    let option = null
    let field = generateField(parseInt(linesInput), parseInt(columnsInput));
    field = addBombs(field, parseInt(bombsInput));
    do {
        console.clear();
        await drawField(field);
        console.log('');

        if (gameover) {
            console.log("Game Over!");
            break;
        }
        option = await askQuestion('digite a localização: ');

        if (option.split('').length === 2) {
            const splitted = option.toUpperCase().split('');
            if (!isNaN(parseInt(splitted[0])) && typeof splitted[1] === 'string') {


                const line = lineNumbers.indexOf(splitted[0]);
                const column = columnsLetters.indexOf(splitted[1]);
                field = await pressSpot(field, line, column);
            } else if (!isNaN(parseInt(splitted[1])) && typeof splitted[0] === 'string') {
                const line = lineNumbers.indexOf(splitted[1]);
                const column = columnsLetters.indexOf(splitted[0]);
                field = await pressSpot(field, line, column);

            } else {
                console.log('valor não reconhecido');
            }
        } else if (option == 9) {


        } else {
            console.log('');
            console.log('valor não reconhecido');
            console.log('');
        }

    } while (option != 9);

}
