// Dashboard View Module
window.DashboardView = (function() {
    
    function initialize() {
        // Initialize the calendar every time the dashboard is shown.
        CalendarModule.initialize();
        return Promise.resolve();
    }

    function cleanup() {
        // Destroy the calendar instance when navigating away from the dashboard.
        CalendarModule.destroy();
    }

    // Public API
    return {
        initialize,
        cleanup
    };
})();
