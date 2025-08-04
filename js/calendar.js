// Calendar Module - FullCalendar initialization and view toggle buttons
window.CalendarModule = (function() {
    let calendar = null;

    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        // If a calendar instance already exists, destroy it first to prevent memory leaks
        if (calendar) {
            calendar.destroy();
        }

        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: { 
                left: 'prev,next today', 
                center: 'title', 
                right: '' 
            },
            editable: true,
            events: [
                { 
                    title: 'CS Dept. Seminar', 
                    start: '2025-07-28T10:00:00', 
                    end: '2025-07-28T12:00:00', 
                    backgroundColor: '#3b82f6', 
                    borderColor: '#2563eb' 
                },
                { 
                    title: 'Annual Tech Fest', 
                    start: '2025-07-29', 
                    end: '2025-07-31', 
                    backgroundColor: '#ef4444', 
                    borderColor: '#dc2626' 
                },
            ]
        });
        
        calendar.render();
        setupViewToggle();
    }

    function setupViewToggle() {
        const viewToggleContainer = document.getElementById('calendar-view-toggle');
        const viewButtons = viewToggleContainer?.querySelectorAll('.view-btn');
        
        if (!viewButtons) return;

        function updateActiveButton(activeView) {
            viewButtons.forEach(button => {
                const isActive = button.dataset.view === activeView;
                button.classList.toggle('bg-blue-600', isActive);
                button.classList.toggle('text-white', isActive);
                button.classList.toggle('text-slate-300', !isActive);
            });
        }

        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!calendar) return;
                const view = button.dataset.view;
                calendar.changeView(view);
                updateActiveButton(view);
            });
        });

        // Set initial active state
        if (calendar) {
            updateActiveButton(calendar.view.type);
        }
    }

    function updateSize() {
        if (calendar) {
            calendar.updateSize();
        }
    }

    function destroyCalendar() {
        if (calendar) {
            calendar.destroy();
            calendar = null;
            const calendarEl = document.getElementById('calendar');
            if (calendarEl) {
                // Empty the container but do not remove it.
                calendarEl.innerHTML = '';
            }
            console.log("Cleaned up CalendarModule instance.");
        }
    }

    // Public API
    return {
        initialize: initializeCalendar,
        updateSize,
        destroy: destroyCalendar
    };
})();
