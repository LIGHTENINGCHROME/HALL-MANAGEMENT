// =================================================================
// CENTRAL CONFIGURATION FILE
// =================================================================
// Place all your important links and API endpoints here.
// To use a link in any HTML file, make sure to include this script first.
// Example usage in your JS: AppConfig.apiBaseUrl + AppConfig.endpoints.createEmployee
// =================================================================

const AppConfig = {
    // Base URL for your API. All endpoint URLs will be appended to this.
    apiBaseUrl: 'https://hall-management.nirmaljyotib.workers.dev/api',

    // Specific API endpoints
    endpoints: {
        hall: '/hall',
        allHall: '/hall/all-hall',
        addHall: '/hall/create',
        allschool: '/school/all-schools',
        addschool: '/school/create',
        alldept: '/department/all-department',
        addDept: '/department/create',
        emp:'/employee',
        allemp: '/employee/all-employees',
        addemp: '/employee/create'
        // Add other API endpoints here, e.g., deleteEmployee: '/employee/delete'
    },
};