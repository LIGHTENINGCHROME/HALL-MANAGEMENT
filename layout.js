// This script fetches the shared layout and injects it into the page.

document.addEventListener('DOMContentLoaded', function() {
    // Define placeholders in your main HTML files
    const headerPlaceholder = document.getElementById('header-placeholder');
    const navPlaceholder = document.getElementById('nav-placeholder');

    if (headerPlaceholder && navPlaceholder) {
        // Fetch the content of the layout file
        fetch('layout.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                // Create a temporary container to parse the fetched HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data;

                // Extract the header and nav elements
                const header = tempDiv.querySelector('header');
                const nav = tempDiv.querySelector('nav');

                // Inject the header and nav into their placeholders
                if (header) {
                    headerPlaceholder.replaceWith(header);
                }
                if (nav) {
                    navPlaceholder.replaceWith(nav);
                }
            })
            .catch(error => {
                console.error('Error loading layout:', error);
                // Display an error message to the user
                headerPlaceholder.innerHTML = '<p class="text-red-500 text-center">Error: Could not load page header.</p>';
                navPlaceholder.innerHTML = '<p class="text-red-500 text-center">Error: Could not load page navigation.</p>';
            });
    }
});
