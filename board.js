// School Logo Hover Effect
const slogo = document.getElementById('Slogo');
slogo.addEventListener('mouseenter', function() {
    this.style.transition = 'src 0.5s ease';
    this.src = './assets/logo-small-no-overlay.png';
});
slogo.addEventListener('mouseleave', function() {
    this.style.transition = 'src 0.5s ease';
    this.src = './assets/logo-small-black-overlay.png';
});

// Cog Hover
const cog = document.getElementById('Cog');
cog.addEventListener('mouseenter', function() {
    this.style.transition = 'src 0.5s ease';
    this.src = './assets/cog-f.svg';
});
cog.addEventListener('mouseleave', function() {
    if (document.getElementById("popup").style.display !== "block") {
        this.style.transition = 'src 0.5s ease';
        this.src = './assets/cog.svg';
    }
});

// Fill and Unfill Cog Functions
function fillCog() {
    const cog = document.getElementById('Cog');
    cog.style.transition = 'src 0.5s ease';
    cog.src = './assets/cog-f.svg';
}
function unfillCog() {
    const cog = document.getElementById('Cog');
    cog.style.transition = 'src 0.5s ease';
    cog.src = './assets/cog.svg';
}

// Show and Hide Popup Functions
function showPopup() {
    document.getElementById("popup").style.display = "block";
    fillCog()
}
function hidePopup() {
    document.getElementById("popup").style.display = "none";
    unfillCog()
}

// Event listener for Esc key
window.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        hidePopup();
    }
});

// License Button
document.getElementById("licenseBtn").addEventListener("click", function() {
    window.location.href = "./legal.html";
});

// Manage Button
document.getElementById("manageBtn").addEventListener("click", function() {
    window.location.href = "./admin/";
});

// Setting Buttons
var settingButtons = document.querySelectorAll(".setting-btn");

// Setting Button Click Event
settingButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        button.classList.add("clicked");
        setTimeout(function() {
            button.classList.remove("clicked");
        }, 200); 
    });
});

// High Contrast Setting
let highContrast = localStorage.getItem("highContrast") === "true";

// Apply High Contrast Setting
if (highContrast) {
    document.getElementById("contrastBtn").classList.add("active");
    document.body.classList.add("high-contrast");
}

// Event Listener for Contrast Button
document.getElementById("contrastBtn").addEventListener("click", function() {
    highContrast = !highContrast;
    document.getElementById("contrastBtn").classList.toggle("active", highContrast);
    document.body.classList.toggle("high-contrast", highContrast);
    localStorage.setItem("highContrast", highContrast);
});

function disableButton(buttonId) {
    var button = document.getElementById(buttonId);
    if (button) {
        button.disabled = true;
    }
}