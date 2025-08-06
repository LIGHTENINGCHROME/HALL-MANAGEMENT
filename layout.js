// This script fetches the shared layout and injects it into the page.

function loadNavbar() {
    return fetch('layout.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // Create a container for the navbar if it doesn't exist
            let navbarContainer = document.getElementById('navbar-placeholder');
            if (!navbarContainer) {
                // If no placeholder found, insert at the beginning of body
                navbarContainer = document.createElement('div');
                navbarContainer.id = 'nav-placeholder';
                document.body.insertBefore(navbarContainer, document.body.firstChild);
            }
            
            // Insert the navbar HTML
            navbarContainer.innerHTML = html;
            
            // Wait for Alpine.js to be available and then initialize
            const initializeAlpine = () => {
                if (window.Alpine) {
                    // Use Alpine's initTree method to initialize the dynamically loaded content
                    window.Alpine.initTree(navbarContainer);
                    console.log('Navbar loaded and Alpine.js initialized successfully');
                } else {
                    // If Alpine.js isn't loaded yet, wait a bit and try again
                    setTimeout(initializeAlpine, 100);
                }
            };
            
            // Initialize Alpine.js for the navbar
            initializeAlpine();
            
            // Also trigger auto-highlight for active page
            setTimeout(() => {
                highlightActivePage();
            }, 200);
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            // Fallback: show a basic navbar or error message
            const navbarContainer = document.getElementById('navbar-placeholder') || document.body;
            navbarContainer.innerHTML = `
                <div class="bg-red-600 text-white p-4 text-center">
                    <p>⚠️ Navigation bar could not be loaded. Please check that 'navbar.html' exists.</p>
                </div>
            `;
        });
}

// Function to highlight active page
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        if (item.dataset.page === currentPage) {
            item.classList.add('text-blue-400');
            if (item.tagName === 'A' && item.closest('nav')) {
                item.classList.add('bg-blue-600', 'bg-opacity-20');
            }
        }
    });
}

// Auto-load navbar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadNavbar();
});

// Alternative method: Include this script with defer and call loadNavbar() manually
// This gives you more control over when the navbar loads

// Export for ES6 modules (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadNavbar };
}


function navbarData() {
            return {
                mobileMenuOpen: false,
                activeDropdown: null, // Track which dropdown is currently open
                
                closeAllDropdowns() {
                    this.mobileMenuOpen = false;
                    this.activeDropdown = null;
                },
                
                toggleMobileMenu() {
                    this.mobileMenuOpen = !this.mobileMenuOpen;
                    if (!this.mobileMenuOpen) {
                        this.activeDropdown = null; // Close all dropdowns when closing menu
                    }
                },
                
                closeMobileMenu() {
                    this.mobileMenuOpen = false;
                    this.activeDropdown = null;
                },
                
                toggleDropdown(dropdown) {
                    // If the same dropdown is clicked, close it. Otherwise, open the new one.
                    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
                }
            };
        }
        
// Auto-highlight active page (will be called from navbar.js)
window.highlightActivePage = function() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        if (item.dataset.page === currentPage) {
            item.classList.add('text-blue-400');
            if (item.tagName === 'A' && item.closest('nav')) {
                item.classList.add('bg-blue-600', 'bg-opacity-20');
            }
        }
    });
}

console.log('Navbar functions initialized globally');