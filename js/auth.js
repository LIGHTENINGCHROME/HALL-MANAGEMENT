// js/auth.js
const config = require("../config");
const API_BASE_URL = 'https://hall-management.nirmaljyotib.workers.dev';

/**
 * Validates the token with the server.
 * @returns {Promise<boolean>} - True if the token is valid, false otherwise.
 */
async function validateToken() {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
        return false;
    }

    const headers = getAuthHeaders();
                    
    if (!headers) {
        console.error('Authentication token not found. Redirecting to login.');
        logout();
        return;
    }
}

/**
 * Checks if a user is authenticated by validating the token.
 * If the token is invalid or missing, it redirects the user to the login page.
 */
async function checkAuth() {
    const isValid = await validateToken();
    if (!isValid) {
        console.log('No valid auth token found, redirecting to login.');
        // If the current page is not login.html, redirect.
        if (!window.location.pathname.endsWith('../public/login.html')) {
            // Use replace to prevent back button from working after logout/session expiry
            window.location.replace('../public/login.html');
        }
    }
}

/**
 * Logs the user out by removing the token and role from sessionStorage
 * and redirecting to the login page.
 */
function logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    console.log('User logged out.');
    // Use replace to prevent back button from returning to the authenticated page
    window.location.replace('../public/login.html');
}
