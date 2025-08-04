// Navigation Module - Dynamic menu generation and view switching
window.NavigationModule = (function() {
    
    // Navigation menu data - All items are preserved as they are for the HOD.
    const navItems = [
        { name: 'Dashboard', target: 'dashboard-view' },
        { 
            name: 'Hall Details', 
            subItems: [
                { name: 'View/Modify Halls', target: 'hall-details-view' },
                { name: 'Archive Halls', target: 'archive-view' }
            ]
        },
        { 
            name: 'Employee Details', 
            subItems: [
                { name: 'View Employees', target: 'employee-details-view' }
            ] 
        },
        { 
            name: 'Book the Hall', 
            subItems: [
                { name: 'Browse & Book', target: 'browse-book-view' }, 
                { name: 'Semester Booking', target: 'semester-booking-view' }, 
                { name: 'My Bookings', target: 'my-bookings-view' }
            ] 
        },
        { 
            name: 'Approve Bookings', 
            subItems: [
                { name: 'Bookings', target: 'approve-bookings-view' }, 
                { name: 'Booking Conflicts', target: 'booking-conflicts-view' }
            ] 
        },
        { 
            name: 'Manage Bookings', 
            subItems: [
                { name: 'Forward Bookings', target: 'forward-bookings-view' }, 
                { name: 'View Bookings', target: 'view-bookings-view' }
            ] 
        }
    ];

    function createNavigationMenu() {
        const navContainer = document.getElementById('main-nav');
        if (!navContainer) return;

        navContainer.innerHTML = ''; // Clear any existing menu

        navItems.forEach(item => {
            const navElement = document.createElement('div');
            navElement.className = 'relative group';

            const link = document.createElement('a');
            link.href = '#';
            if(item.target) link.dataset.target = item.target;
            link.className = 'flex items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-all duration-200';
            link.textContent = item.name;

            // Create dropdown for items with sub-items
            if (item.subItems) {
                link.innerHTML += `<i data-lucide="chevron-down" class="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform"></i>`;
                const dropdown = document.createElement('div');
                dropdown.className = 'absolute left-0 mt-2 w-56 origin-top-left bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 nav-dropdown-scrollable';
                const subList = document.createElement('div');
                subList.className = 'py-1';
                item.subItems.forEach(subItem => {
                    const subLink = document.createElement('a');
                    subLink.href = '#';
                    if(subItem.target) subLink.dataset.target = subItem.target;
                    subLink.textContent = subItem.name;
                    subLink.className = 'block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white';
                    subList.appendChild(subLink);
                });
                dropdown.appendChild(subList);
                navElement.appendChild(link);
                navElement.appendChild(dropdown);
            } else {
                navElement.appendChild(link);
            }
            navContainer.appendChild(navElement);
        });

        // Re-render icons after adding them to the DOM
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    /**
     * ADDED: Fetches user data from the API and displays the name in the header.
     */
    async function displayUserInfo() {
        const userNameDisplay = document.getElementById('user-name-display');
        if (!userNameDisplay) return;
        try {
            // This function is defined in data.js and calls the live API
            const userData = await AppData.fetchUserData(); 
            userNameDisplay.textContent = userData.name || 'User';
        } catch (error) {
            console.error("Failed to fetch user's name:", error);
            userNameDisplay.textContent = 'User'; // Fallback name
        }
    }

    function setupScrollBehavior() {
        let lastScrollTop = 0;
        const topBarsContainer = document.getElementById('top-bars-container');
        if (!topBarsContainer) return;

        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const containerHeight = topBarsContainer.offsetHeight;

            if (scrollTop > lastScrollTop && scrollTop > containerHeight){
                topBarsContainer.classList.add('!-translate-y-full');
            } else {
                topBarsContainer.classList.remove('!-translate-y-full');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
        }, false);
    }

    // Public API - ADDED displayUserInfo to be accessible from main.js
    return {
        createMenu: createNavigationMenu,
        displayUserInfo,
        setupScrollBehavior
    };
})();
