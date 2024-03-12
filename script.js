async function fetchScores(manualBoolean) {
    try {
        const response = await fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/getscores', {
            method: 'POST'
        });
        const data = await response.json();
        updateScores(data, manualBoolean);
        document.querySelector('main').style.display = 'block';
    } catch (error) {
        console.error('Error fetching scores:', error);
    }
}

function updateScores(scores, manualBoolean) {
    const houses = Object.keys(scores.total).map((house) => ({
        name: house,
        points: scores.total[house].points
    }));

    // Sort houses based on points
    houses.sort((a, b) => b.points - a.points);

    const mainElement = document.querySelector('main');

    mainElement.innerHTML = '';

    // Update scores and rearrange cards
    houses.forEach((house, index) => {
        const cardId = `${house.name}Card`;
        const positionId = `${house.name}Position`;
        const pointsId = `${house.name}Points`;

        const position = index + 1;
        const positionSuffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';

        const cardDiv = document.createElement('div');
        cardDiv.classList.add('houseCard');
        cardDiv.id = cardId;

        const positionDiv = document.createElement('div');
        const positionHeader = document.createElement('h1');
        positionHeader.classList.add('position');
        positionHeader.id = positionId;
        positionHeader.textContent = `${position}${positionSuffix}`;
        positionDiv.appendChild(positionHeader);
        cardDiv.appendChild(positionDiv);

        const nameDiv = document.createElement('div');
        const nameHeader = document.createElement('h2');
        nameHeader.classList.add('teamName');
        nameHeader.id = `${house.name}Name`;
        nameHeader.textContent = house.name; // Just use the name, not displayName
        nameDiv.appendChild(nameHeader);
        cardDiv.appendChild(nameDiv);

        const scoresContainerDiv = document.createElement('div');
        scoresContainerDiv.classList.add('scoresContainer');
        const scoresHeader = document.createElement('h2');
        scoresHeader.classList.add('scores');
        scoresHeader.id = pointsId;
        scoresHeader.textContent = `${house.points} Points`;
        scoresContainerDiv.appendChild(scoresHeader);
        cardDiv.appendChild(scoresContainerDiv);

        mainElement.appendChild(cardDiv);

        if (manualBoolean === 'true') {
            changeButtonText('refreshButton', 'Refresh Scores');
        }
    });
}

function startUpdatingScores() {
    fetchScores();
    setInterval(fetchScores, 1000);
}

window.onload = startUpdatingScores;