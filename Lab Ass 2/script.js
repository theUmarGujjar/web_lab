document.addEventListener('DOMContentLoaded', () => {
    // 1. Select the DOM elements
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // 2. Toggle Menu Functionality
    hamburgerBtn.addEventListener('click', () => {
        // Toggle the 'active' class to trigger CSS max-height transition
        navMenu.classList.toggle('active');
        
        // Change icon to '✕' when open, and back to '☰' when closed
        if (navMenu.classList.contains('active')) {
            hamburgerBtn.innerHTML = '✕';
        } else {
            hamburgerBtn.innerHTML = '☰';
        }
    });

    // 3. Bonus Task: Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class to hide the menu
            navMenu.classList.remove('active');
            // Reset hamburger icon
            hamburgerBtn.innerHTML = '☰';
        });
    });
});