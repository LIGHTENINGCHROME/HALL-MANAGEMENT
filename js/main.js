// HallBooking/js/main.js

// Main Application Entry Point
(function() {
    
    let currentViewId = null;

    // This function hides the old view, shows the new one, and calls the logic for the new view.
    window.switchView = function(targetId, context = {}) {
        if (currentViewId) {
            const viewName = currentViewId.replace('-view', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'View';
            const viewModule = window[viewName];
            if (viewModule && typeof viewModule.cleanup === 'function') {
                viewModule.cleanup();
            }
        }

        const allViews = document.querySelectorAll('main, div[id$="-view"]');
        allViews.forEach(view => {
            view.classList.toggle('hidden', view.id !== targetId);
        });
        
        currentViewId = targetId;
        handleViewSwitch(targetId, context);
    };

    // This function handles clicks on buttons like "View Details"
    function handleGlobalClick(event) {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const hallCard = button.closest('[data-hall-id]');
        const hallId = hallCard?.dataset.hallId || button.dataset.hallId;

        switch (action) {
            case 'view-details':
            case 'view-semester-hall-details':
                if (hallId) {
                    window.location.hash = `#hall-booking-details-view?id=${hallId}`;
                }
                break;
            case 'book-now':
                if (hallId) {
                    // Clear session keys from the other booking flow to avoid conflicts
                    sessionStorage.removeItem('finalBookingSlots');
                    sessionStorage.removeItem('finalBookingAvailability');
                    sessionStorage.removeItem('finalBookingHall');
                    window.location.hash = `#final-booking-form-view?id=${hallId}`;
                }
                break;
        }
    }

    // This is the core router that calls the correct JavaScript file for each page.
    async function handleViewSwitch(targetId, context = {}) {
        const hallId = context.hallId;

        const viewInitializers = {
            'dashboard-view': () => DashboardView.initialize(),
            'hall-details-view': () => HallDetailsView.initialize(),
            'archive-view': () => ArchiveView.initialize(),
            'employee-details-view': () => EmployeeView.initialize(),
            'browse-book-view': () => BrowseBookView.initialize(),
            'semester-booking-view': () => SemesterBookingView.initialize(),
            'my-bookings-view': () => MyBookingsView.initialize(),
            'approve-bookings-view': () => ApproveBookingsView.initialize(),
            'booking-conflicts-view': () => ConflictsView.initialize(),
            'forward-bookings-view': () => ForwardView.initialize(),
            'view-bookings-view': () => ViewBookingsView.initialize(),
            'hall-booking-details-view': () => HallBookingDetailsView.initialize(hallId),
            'final-booking-form-view': () => FinalBookingFormView.initialize(hallId)
        };

        const initializer = viewInitializers[targetId];
        if (initializer) {
            await initializer();
        }
    }

    // This function reads the URL to determine which page to show.
    function handleHashChange() {
        const hash = window.location.hash.slice(1);
        const [path, query] = hash.split('?');
        const targetId = path || 'dashboard-view';
        
        const params = new URLSearchParams(query);
        const hallId = params.get('id');

        if (document.getElementById(targetId)) {
            const context = { hallId: hallId };
            switchView(targetId, context);
        } else {
            switchView('dashboard-view');
            window.location.hash = '#dashboard-view';
        }
    }

    function setupNavigationHandling() {
        const navContainer = document.getElementById('main-nav');
        if (!navContainer) return;
        navContainer.addEventListener('click', async (e) => {
            const link = e.target.closest('a[data-target]');
            if (!link) return;
            e.preventDefault();
            window.location.hash = '#' + link.dataset.target;
        });
    }

    // MODIFIED: This is now the main entry point for the authenticated app.
    async function initializeApp() {
        // First, check if user is authenticated. This function (from auth.js) will redirect if not.
        checkAuth(); 

        // If authenticated, proceed with app initialization.
        if (window.lucide) { lucide.createIcons(); }
        
        // Display user info and create the role-based menu.
        await NavigationModule.displayUserInfo();
        NavigationModule.createMenu();
        
        NavigationModule.setupScrollBehavior();
        setupNavigationHandling();
        document.body.addEventListener('click', handleGlobalClick);
        window.addEventListener('hashchange', handleHashChange);
        
        // Load the view based on the initial URL, now that the app is set up.
        handleHashChange(); 
    }

    // The app starts here when the DOM is fully loaded.
    document.addEventListener('DOMContentLoaded', initializeApp);

})();
