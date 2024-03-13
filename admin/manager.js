// CONTAINER VISIBILITY
function hideContainers() {
    var containers = document.getElementsByClassName('container');
    for (var i = 0; i < containers.length; i++) {
        containers[i].style.display = 'none';
    }
}

function showContainer(elementid) {
    hideContainers()
    document.getElementById(elementid).style.display = 'block';
}

function unhideAdminControls() {
    const adminControls = document.getElementsByClassName("adminControls");
    Array.from(adminControls).forEach(element => {
        element.style.display = "block";
    });
}

function unhideUserControls() {
    const userControls = document.getElementsByClassName("userControls");
    Array.from(userControls).forEach(element => {
        element.style.display = "block";
    });
}

function hideControls() {
    const adminControls = document.getElementsByClassName("adminControls");
    Array.from(adminControls).forEach(element => {
        element.style.display = "none";
    });

    const userControls = document.getElementsByClassName("userControls");
    Array.from(userControls).forEach(element => {
        element.style.display = "none";
    });
}


// COOKIE AND TOKEN STUFF
function getCookie(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for(let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

function getToken() {
    var value = "; " + document.cookie;
    var parts = value.split("; " + "token" + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  function validateToken(token) {
    // Make a POST request to the endpoint
    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/validateToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => {
        if (response.status === 200) {
            unhideAdminControls();
            scoreButton();
            const defaultButton = document.getElementById('defaultAdminButton');
            defaultButton.classList.add('active');
            localStorage.setItem('accountType', 'admin');
        } else if (response.status === 202) {
            unhideUserControls();
            scoreButton();
            localStorage.setItem('accountType', 'contributor');
            const defaultButton = document.getElementById('defaultUserButton');
            defaultButton.classList.add('active');
        } else if (response.status === 201) {
            showContainer('awaitingapprovalcontainer');
            hideControls();
        } else if (response.status === 401) {
            // If the response is 401, clear the 'token' cookie and reload the page
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            location.reload();
        } else {
            console.log('Unexpected status code:', response.status);
        }
    })
    .catch(error => {
        console.error('Error sending request:', error);
    });
}

function setTokenCookie(token) {
    const oneDayInSeconds = 86400;
    const expiryDays = 400;

    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (expiryDays * oneDayInSeconds * 1000));

    document.cookie = `token=${token}; expires=${expirationDate.toUTCString()}; path=/; Secure; SameSite=Strict`;
}

function renewTokenCookie() {
    const tokenCookie = getCookie('token');
    if (tokenCookie !== "") {
        setTokenCookie(tokenCookie);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renewTokenCookie();
});


// LOGGING IN AND SIGNING UP
let ginviteCode // Global invite code

function extractEmailAndInviteCodeFromURL() {
    var urlParams = new URLSearchParams(window.location.search);

    var email = urlParams.get('email');
    var inviteCode = urlParams.get('inviteCode');

    if (email && inviteCode) {
        showContainer('signup');
        var emailInput = document.getElementById('signupEmail');
        if (emailInput) {
            emailInput.value = email;
        }
        ginviteCode = inviteCode;    

    } /* else if (inviteCode && !email) {
        showContainer('signup')
        console.log("Invite Code:", inviteCode);
        ginviteCode = inviteCode
    } else {
        showContainer('login')
    } */
}

function clearURLParameters() {
    var url = window.location.href;

    if (url.indexOf('?') !== -1) {
        var baseUrl = url.substring(0, url.indexOf('?'));

        window.history.replaceState({}, document.title, baseUrl);
    }
}

function showAdminElements() {
    const adminElements = document.querySelectorAll('.adminOnly');
    adminElements.forEach(element => {
        element.style.display = 'block';
    });
}

function hideUserElements() {
    const userElements = document.querySelectorAll('.userOnly');
    userElements.forEach(element => {
        element.style.display = 'none';
    });
}

window.onload = function() {
    const token = getCookie('token');
    const accountType = localStorage.getItem('accountType');

    if (token) {
        if (accountType === 'contributor') {
            unhideUserControls();
            hideContainers();
            clearURLParameters();
            validateToken(token);
        } else if (accountType === 'admin') {
            unhideAdminControls();
            showAdminElements();
            hideUserElements();
            hideContainers();
            clearURLParameters();
            validateToken(token);
        } else {
            validateToken(token);
        }
    } else {
        console.log('Not Authorized. Please Log In.');
        extractEmailAndInviteCodeFromURL();
        showContainer('login');
    }
};

//Authentication
function signUp() {
    const email = document.querySelector('#signupForm input[name="email"]').value;
    const password = document.querySelector('#signupForm input[name="password"]').value;
    const confirmPassword = document.querySelector('#signupForm input[name="confirmPassword"]').value;
    
    if (email === undefined || password === undefined || confirmPassword === undefined) {
        console.error('One or more fields are undefined');
        return;
    }

    if (password !== confirmPassword) {
        console.error('Passwords do not match');
        return;
    }

    const data = {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        inviteCode: ginviteCode
    };

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Sign up successful:', data);
        const token = data.token;
        setTokenCookie(token);
        console.log('Token:', token);
        location.reload();
    })
    .catch(error => {
        console.error('Error during sign up:', error);
        showToast();
    });
}

function signIn() {
    const email = document.querySelector('#signinForm input[name="email"]').value;
    const password = document.querySelector('#signinForm input[name="password"]').value;    
    if (email === undefined || password === undefined) {
        console.error('One or more fields are undefined');
        return;
    }

    const data = {
        email: email,
        password: password,
    };

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 201) {
            hideControls();
            showContainer('awaitingapprovalcontainer');
            return;
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (!data) return;
        console.log('Sign in successful:', data);
        const token = data.token;
        setTokenCookie(token);
        console.log('Token:', token);
		location.reload();
    })
    .catch(error => {
        console.error('Error during sign in:', error);
        showToast();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.querySelector('#signupForm input[type="submit"]');
    
    signUpButton.addEventListener('click', function(event) {
        event.preventDefault();
        signUp();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const signInButton = document.querySelector('#signinForm input[type="submit"]');
    
    signInButton.addEventListener('click', function(event) {
        event.preventDefault();
        signIn(); 
    });
});

//ADMIN CONTROLS - BUTTONS

const buttons = document.querySelectorAll('.adminControls button');

buttons.forEach(button => {
    button.addEventListener('click', function() {
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });

        this.classList.add('active');
    });
});

const userbuttons = document.querySelectorAll('.userControls button');

userbuttons.forEach(button => {
    button.addEventListener('click', function() {
        userbuttons.forEach(btn => {
            btn.classList.remove('active');
        });

        this.classList.add('active');
    });
});

function restrictNumericInput() {
    var numericInputs = document.querySelectorAll(".cci");

    numericInputs.forEach(function(input) {
        input.addEventListener("input", function(event) {
            if (isNaN(event.target.value)) {
                event.target.value = "";
            }
        });
    });
}

restrictNumericInput();

var arrowButtons = document.querySelectorAll(".arrows");

arrowButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        button.classList.add("clicked");

        setTimeout(function() {
            button.classList.remove("clicked");
        }, 200);
    });
});

var allArrowButtons = document.querySelectorAll('.upArrow, .downArrow, .aupArrow, .adownArrow');

allArrowButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        var inputField = button.parentElement.querySelector("input[type='number']");

        if (inputField && inputField.value !== "") {
            if (button.classList.contains("upArrow") || button.classList.contains("aupArrow")) {
                inputField.value = parseInt(inputField.value) + 1;
            } else if (button.classList.contains("downArrow") || button.classList.contains("adownArrow")) {
                inputField.value = parseInt(inputField.value) - 1;
            }
        }
    });
});

//SCORE TAB

async function fetchScores() {
    try {
        const response = await fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/getscores', {
            method: 'POST'
        });
        const data = await response.json();
        updateScores(data.total);
    } catch (error) {
        console.error('Error fetching scores:', error);
    }
}

function updateScores(scores) {
    const allowedIDs = ['Onka', 'Scott', 'Cox', 'Sturt'];

    Object.keys(scores).forEach((house) => {
        const displayName = house;
        const points = scores[house].points;
        
        if (allowedIDs.includes(displayName)) {
            const inputField = document.querySelector(`#${displayName} input`);
            if (inputField) {
                inputField.value = points;
            }
        }
    });

    changeButtonText('gsfs', 'Get Scores from server');
}

extractEmailAndInviteCodeFromURL();

function sendScores(operation) {
  var onkaScore, scottScore, coxScore, sturtScore;
  var comment = document.getElementById("comment").value;

  if (getComputedStyle(document.getElementById("updateScores")).display !== "none") {
      // Add to the score
      onkaScore = document.getElementById("aOnka").querySelector("input").value;
      scottScore = document.getElementById("aScott").querySelector("input").value;
      coxScore = document.getElementById("aCox").querySelector("input").value;
      sturtScore = document.getElementById("aSturt").querySelector("input").value;
  } else {
      // Override the score
      onkaScore = document.getElementById("Onka").querySelector("input").value;
      scottScore = document.getElementById("Scott").querySelector("input").value;
      coxScore = document.getElementById("Cox").querySelector("input").value;
      sturtScore = document.getElementById("Sturt").querySelector("input").value;
  }

  var token = getToken();

  var payload = {
    operation: operation,
    comment: comment,
    green: onkaScore,
    yellow: scottScore,
    red: coxScore,
    blue: sturtScore,
    token: token
  };

  fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/updatescore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Scores sent successfully:', data);
    changeButtonText('updateButton', 'Update Scores');
    changeButtonText('sendNewButton', 'Overide Server Scores');
    if (operation === 'update') {
        resetInputsToZero()
    } 
  })
  .catch(error => {
    console.error('There was a problem sending scores:', error);
  });
}

function resetInputsToZero() {
    const inputIds = ['aOnka', 'aScott', 'aCox', 'aSturt'];

    inputIds.forEach((id) => {
        const inputField = document.getElementById(id).querySelector('input');
        if (inputField) {
            inputField.value = 0;
        }
    });
}

function clearCommentInput() {
    document.getElementById("comment").value = "";
}

clearCommentInput();

function ors() {
    var overrideScores = document.getElementById("overrideScores");
    var updateScores = document.getElementById("updateScores");
    overrideScores.style.display = "block";
    updateScores.style.display = "none";
}

function uds() {
    var overrideScores = document.getElementById("overrideScores");
    var updateScores = document.getElementById("updateScores");
    overrideScores.style.display = "none";
    updateScores.style.display = "block";
    zeroIfEmpty()
}

function zeroIfEmpty() {
    var inputs = document.querySelectorAll('.cci');
    inputs.forEach(function(input) {
        if (input.value === '') {
            input.value = '0';
        }
    });
}

//USERS TAB

function toggleAccessControlView() {
    const allUsersContainer = document.getElementById('allUsers');
    const allInvitesContainer = document.getElementById('allInvites');

    if (allUsersContainer.style.display === 'none') {
        allUsersContainer.style.display = 'block';
        allInvitesContainer.style.display = 'none';
    } else {
        allUsersContainer.style.display = 'none';
        allInvitesContainer.style.display = 'block';
    }
}

function getUsers() {
    var token = getToken('token');

    // Fetch list of valid emails from the server
    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/adminemails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch valid emails');
        }
        return response.json();
    })
    .then(data => {
        const adminemails = data.adminemails;

        const usersContainer = document.getElementById('userList');

        const userList = document.createElement('ul');

        adminemails.forEach(email => {
            const listItem = document.createElement('li');
            listItem.textContent = email;
            userList.appendChild(listItem);
        });

        usersContainer.innerHTML = '';
        usersContainer.appendChild(userList);
    })
    .catch(error => {
        console.error('Error fetching valid emails:', error.message);
    });
}

function createInvite() {
    const token = getToken();
    const emailInput = document.querySelector('#emailInput');

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/createInvite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token, email: emailInput.value })
    })
    .then(response => response.json())
    .then(data => {
        const { email, inviteCode } = data;
        const name = getEmailName(email);

        console.log('Email:', email);
        console.log('Invite Code:', inviteCode);
        console.log('Name:', name);

        console.log('Invite created:', data);
        changeButtonText('createInviteButton', 'Invite');
        emailInput.value = '';
        showPopup2('Invite Link', 'Send this link to ' + name + ' to invite them to this website:', 'https://scoreboard.hhs.sa.edu.au/admin?email=' + email + '&inviteCode=' + inviteCode);
    })
    .catch(error => console.error('Error creating invite:', error));
}

function getEmailName(email) {
    const atIndex = email.indexOf('@');
    let name = email.substring(0, atIndex); 
    name = name.replace(/\d+/g, '');
    name = name.replace('.', ' ');
    name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return name;
}

function fetchInvites() {
    const token = getToken();

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/fetchInvites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Invites:', data);
        displayInvites(data.invites);
    })
    .catch(error => console.error('Error fetching invites:', error));
}

function displayInvites(invites) {
    const inviteList = document.getElementById('inviteList');
    inviteList.innerHTML = '';

    invites.forEach(invite => {
        const listItem = document.createElement('li');
        listItem.classList.add('inviteList');

        listItem.textContent = `Email: ${invite.email}, Invite Code: ${invite.inviteCode}`;

        const lineBreak = document.createElement('br');
        listItem.appendChild(lineBreak);

        const revokeButton = document.createElement('button');
        revokeButton.textContent = 'Revoke';
        revokeButton.classList.add('inviteButtons');
        revokeButton.id = `revokeButton_${invite.email}`;
        revokeButton.addEventListener('click', () => revokeInvite(invite.inviteCode));

        const copyButton = document.createElement('button');
        const inviteName = getEmailName(invite.email);
        copyButton.textContent = 'Copy Link';
        copyButton.classList.add('inviteButtons');
        copyButton.id = `copyButton_${invite.email}`;
        copyButton.addEventListener('click', () => showPopup2('Invite Link', 'Send this link to ' + inviteName + ' to invite them to this website:', 'https://scoreboard.hhs.sa.edu.au/admin?email=' + invite.email + '&inviteCode=' + invite.inviteCode));

        listItem.appendChild(revokeButton);
        listItem.appendChild(copyButton);

        inviteList.appendChild(listItem);
    });
}

function revokeInvite(inviteCode) {
    const token = getToken();

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/revokeInvite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token, inviteCode: inviteCode })
    })
    .then(response => {
        if (response.ok) {
            console.log('Invite revoked successfully');
            fetchInvites();
        } else {
            console.error('Failed to revoke invite');
        }
    })
    .catch(error => console.error('Error revoking invite:', error));
}

function scoreButton() {
	showContainer('score');
    document.getElementById("comment").value = '';
    uds();
    fetchScores();
    restrictNumericInput();
}

function usersButton() {
    const allUsersContainer = document.getElementById('allUsers');
    const allInvitesContainer = document.getElementById('allInvites');
    showContainer('users');
    getUsers();
    allUsersContainer.style.display = 'block';
    allInvitesContainer.style.display = 'none';
}

//LOG TAB
function clearLogContainer() {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = ''; // Clears all child elements
  }

  function displayLogs() {
    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/getUserLogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
    })
    .then(response => response.text())
    .then(data => {
        const logs = data.split('\n').reverse();
        const logContainer = document.getElementById('logContainer');
        let currentDate = null;

        clearLogContainer();

        logs.forEach(log => {
            if (!log.trim()) return;

            const parts = log.split(';');
            if (parts.length < 4) return;

            const logDate = new Date(parts[0]).toLocaleDateString('en-AU');
            const logTime = new Date(parts[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            const logSummary = parts[1];
            const logScores = parts[2];
            const logComment = parts[3];

            if (logDate !== currentDate) {
                currentDate = logDate;
                const dateHeading = document.createElement('p');
                dateHeading.classList.add('logDate');
                dateHeading.textContent = logDate;
                logContainer.appendChild(dateHeading);
            }

            const details = document.createElement('details');
            details.classList.add('logDetails');

            const summary = document.createElement('summary');
            summary.classList.add('logSummary');
            summary.textContent = `${logTime} - ${logSummary}`;

            const logScoresElement = document.createTextNode(logScores);

            // Create a div to hold scores and comment
            const contentDiv = document.createElement('div');

            // Add scores to the div
            const scoresParagraph = document.createElement('p');
            scoresParagraph.textContent = logScores;

            // Add comment to the div
            const commentParagraph = document.createElement('p');
            commentParagraph.textContent = `Comment: ${logComment}`;

            // Append scores and comment to the div
            contentDiv.appendChild(scoresParagraph);
            contentDiv.appendChild(commentParagraph);

            // Append the div to the details element
            details.appendChild(summary);
            details.appendChild(contentDiv);

            logContainer.appendChild(details);
        });
    })
    .catch(error => console.error('Error:', error));
}

function clearContributions() {
    const contributionsContainer = document.querySelector('#contributions .containerChild');
    contributionsContainer.innerHTML = ''; // Clear all child elements
}


function displayContributions() {
    const token = getToken();
    const contributionsCC = document.getElementById("contributionsCC");
    const headerText = document.createElement("b");
    headerText.textContent = "Requests to modify the scores are displayed below:";
    const lineBreak = document.createElement("br");

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/getContributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => response.json())
    .then(data => {
        clearContributions()
        const contributionsContainer = document.querySelector('#contributions .containerChild');
        
        contributionsCC.prepend(lineBreak);
        contributionsCC.prepend(headerText);

        if (data.contributions.length === 0) {
            const noRequestsText = document.createElement('p');
            noRequestsText.innerHTML = '<p>All requests have been acted on</p><br>';
            contributionsCC.appendChild(noRequestsText);
        } else {
            data.contributions.forEach(contribution => {
                const contributionItem = document.createElement('div');
                contributionItem.classList.add('contributionItem');
            
                // Get the requester's name from the contributor's email
                let requesterName = getEmailName(contribution.contributor);
                
                // Create header
                const header = document.createElement('p');
                header.textContent = `${requesterName} is requesting to add scores for reason "${contribution.comment}"`;
                contributionItem.appendChild(header);
                
                // Create list for scores
                const scoresList = document.createElement('ul');
                const onkaScore = document.createElement('li');
                onkaScore.textContent = `Onka: ${contribution.Onka}`;
                scoresList.appendChild(onkaScore);
                const scottScore = document.createElement('li');
                scottScore.textContent = `Scott: ${contribution.Scott}`;
                scoresList.appendChild(scottScore);
                const coxScore = document.createElement('li');
                coxScore.textContent = `Cox: ${contribution.Cox}`;
                scoresList.appendChild(coxScore);
                const sturtScore = document.createElement('li');
                sturtScore.textContent = `Sturt: ${contribution.Sturt}`;
                scoresList.appendChild(sturtScore);
            
                contributionItem.appendChild(scoresList);

                // Create buttons
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.addEventListener('click', () => handleRequest(contribution.id, 'accept'));
                contributionItem.appendChild(acceptButton);

                const denyButton = document.createElement('button');
                denyButton.textContent = 'Deny';
                denyButton.addEventListener('click', () => handleRequest(contribution.id, 'deny'));
                contributionItem.appendChild(denyButton);

                contributionsContainer.appendChild(contributionItem);
            });
        }
    })
    .catch(error => console.error('Error fetching contributions:', error));
}


function handleRequest(id, action) {
    const token = getToken();
    
    if (!token) {
        console.error('Token not found');
        return;
    }

    const data = {
        token: token,
        id: id,
        action: action
    };

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/handleRequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            displayContributions();
        } else {
            console.error('Error:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//MORE TAB

function clearPendingRequests() {
    const myPendingRequestsList = document.getElementById("myPendingRequestsList");
    myPendingRequestsList.innerHTML = '';
}

function displayPendingRequests() {
    const token = getToken();
    const myPendingRequestsList = document.getElementById("myPendingRequestsList");

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/getMyContributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token, requestType: 'pending' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error fetching pending requests:', data.error);
            return;
        }

        clearPendingRequests();
        
        if (data.contributions.length === 0) {
            const noRequestsText = document.createElement('div');
            noRequestsText.innerHTML = '<p class="pendingRequests">No pending requests to display</p><br>';
            myPendingRequestsList.appendChild(noRequestsText);
        } else {
            data.contributions.forEach(contribution => {
                const requestItem = document.createElement('div');
                requestItem.classList.add('requestItem');

                // Display contributor's name and comment
                const requestDetails = document.createElement('p');
                requestDetails.textContent = `"${contribution.comment}"`;
                requestItem.appendChild(requestDetails);

                // Display scores
                const scoresList = document.createElement('ul');
                const onkaScore = document.createElement('li');
                onkaScore.textContent = `Onka: ${contribution.Onka}`;
                scoresList.appendChild(onkaScore);
                const scottScore = document.createElement('li');
                scottScore.textContent = `Scott: ${contribution.Scott}`;
                scoresList.appendChild(scottScore);
                const coxScore = document.createElement('li');
                coxScore.textContent = `Cox: ${contribution.Cox}`;
                scoresList.appendChild(coxScore);
                const sturtScore = document.createElement('li');
                sturtScore.textContent = `Sturt: ${contribution.Sturt}`;
                scoresList.appendChild(sturtScore);
                requestItem.appendChild(scoresList);

                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.addEventListener('click', () => cancelRequest(contribution.id));
                requestItem.appendChild(cancelButton);

                myPendingRequestsList.appendChild(requestItem);
            });
        }
    })
    .catch(error => console.error('Error fetching pending requests:', error));
}

function cancelRequest(id) {
    const token = getToken();

    const requestBody = {
        token: token,
        id: id
    };

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/cancelRequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (response.ok) {
            displayPendingRequests();
        } else {
            throw new Error('Failed to delete request');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function fetchUserLists() {
    // Fetch the lists of contributors and accounts awaiting approval
    Promise.all([
        fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/manageContributors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: getToken(), action: 'list' })
        }),
        fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/manageContributors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: getToken(), action: 'listawaiting' })
        })
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([contributorData, awaitingApprovalData]) => {
        const contributoremails = contributorData.contributoremails;
        const awaitingapproval = awaitingApprovalData.awaitingapproval;

        const awaitingapprovalElement = document.getElementById('awaitingapprovallist');
        const currentaccountsElement = document.getElementById('currentaccountslist');

        awaitingapprovalElement.innerHTML = '';
        currentaccountsElement.innerHTML = '';

        if (awaitingapproval.length === 0) {
            const noUsersMessage = document.createElement('p');
            noUsersMessage.textContent = 'No users awaiting approval';
            awaitingapprovalElement.appendChild(noUsersMessage);
        } else {
            awaitingapproval.forEach(email => {
                const emailElement = document.createElement('div');
                emailElement.innerHTML = '<p>' + email + '</p>';

                const denyButton = createButton('Deny', () => manageUser(email, 'delete'));
                const approveButton = createButton('Approve', () => manageUser(email, 'approve'));
                
                emailElement.appendChild(denyButton);
                emailElement.appendChild(approveButton);

                awaitingapprovalElement.appendChild(emailElement);
            });
        }

        contributoremails.forEach(email => {
            const emailElement = document.createElement('div');
            emailElement.innerHTML = '<p>' + email + '</p>';

            const revokeAccessButton = createButton('Unapprove', () => manageUser(email, 'unauthorise'));
            const promoteButton = createButton('Make Admin', () => manageUser(email, 'promote'));

            emailElement.appendChild(revokeAccessButton);
            emailElement.appendChild(promoteButton);

            currentaccountsElement.appendChild(emailElement);
        });
    })
    .catch(error => {
        console.error('Error fetching user lists:', error);
    });
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

function manageUser(email, action) {
    if (action === 'promote') {
        const confirmPromote = confirm('Are you sure you want to promote this user? They will have full access to this website, including the ability to add scores without confirmation.');
        if (!confirmPromote) {
            return;
        }
    }

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/manageContributors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: getToken(), account: email, action })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        fetchUserLists();
    })
    .catch(error => {
        console.error('Error managing user:', error);
    });
}
