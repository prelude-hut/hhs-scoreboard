// Account Popup Hover
const accountPopup = document.getElementById('popup');
const accountPopupTrigger = document.getElementById('Cog');

accountPopupTrigger.addEventListener('mouseenter', function() {
    accountPopupTrigger.src = '../assets/user-square.svg';
});

accountPopupTrigger.addEventListener('mouseleave', function() {
    if (accountPopup.style.display !== "block") {
        accountPopupTrigger.src = '../assets/user-circle.svg';
    }
});

// Show and Hide Popup Functions
function showPopup() {
    accountPopup.style.display = "block";
    accountPopupTrigger.src = '../assets/user-square.svg';
}

function hidePopup() {
    accountPopup.style.display = "none";
    accountPopupTrigger.src = '../assets/user-circle.svg';
}

// Event listener for Esc key
window.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        hidePopup();
        accountPopupTrigger.src = '../assets/user-circle.svg';
    }
});

const pwmodal = document.getElementById("pwModal");

function openPasswordModal() {
    pwmodal.style.display = "block";
}

function closePasswordModal() {
    pwmodal.style.display = "none";
}

function dimScreen() {
    const overlay = document.createElement('div');

    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000'; //Popup is set to 1001
    overlay.id = 'overlay';

    document.body.appendChild(overlay);
}

function undimScreen() {
    const overlay = document.getElementById('overlay');

    if (overlay) {
        document.body.removeChild(overlay);
    }
}

//CHANGE PASSWORD NOT WORKING ON BACKEND YET
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const token = getToken();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match');
        return;
    }

    console.log(currentPassword + newPassword + confirmNewPassword);

    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/changePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            currentPassword: currentPassword,
            newPassword: newPassword,
            confirmNewPassword: confirmNewPassword
        })
    })
    .then(response => {
        if (response.ok) {
            alert('Password changed successfully');
            undimScreen();
            hidePopup();
        } else {
            response.json().then(data => {
                alert(data.error || 'An error occurred while changing password');
            });
        }
    })
    .catch(error => {
        console.error('Error changing password:', error);
        alert('An error occurred while changing password');
    });
}


function signOut(scope) {
    const token = getToken();

    // Check if token is available
    if (!token) {
        location.reload();
    }

    // Make a POST request to sign out endpoint
    fetch('https://scoreboardapi.joshnewman6.com/houseleaderboard/signOut', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, scope })
    })
    .then(response => {
        if (response.status === 200) {
            console.log('Sign out successful');
            // Reload the page
            location.reload();
        } else {
            console.error('Sign out failed:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error signing out:', error);
    });
}