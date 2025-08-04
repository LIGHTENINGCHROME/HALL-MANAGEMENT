// View Bookings View Module
window.ViewBookingsView = (function() {
    
    function renderViewBookingsTable(data) {
        const tableBody = document.getElementById('view-bookings-body');
        if (!tableBody) return;

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400">No bookings found.</td></tr>`;
            return;
        }
        
        // --- PERFORMANCE FIX: Build HTML string before DOM manipulation ---
        const tableHtml = data.map(booking => {
            let statusClass = '';
            switch(booking.status) {
                case 'Approved': statusClass = 'text-green-400'; break;
                case 'Rejected': statusClass = 'text-red-400'; break;
                default: statusClass = 'text-yellow-400'; break;
            }
            const semesterHtml = booking.isSemester ? '<div class="text-red-400 text-xs mt-1">Semester Booking</div>' : '';
            return `
                 <tr class="hover:bg-slate-800/50 transition-colors">
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <div class="text-slate-300">${booking.bookedOn}</div>
                        <div class="text-blue-400">${booking.bookingId}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <div class="font-medium text-white">${booking.hallName}</div>
                        <div class="text-blue-400">${booking.hallCode}</div>
                        <div class="text-slate-400">${booking.department}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <div class="font-medium text-white">${booking.purpose}</div>
                        <div class="text-slate-400">${booking.course.replace('\\n', '<br>')}</div>
                        ${semesterHtml}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${booking.dateTime.replace(/\\n/g, '<br>')}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <div class="font-medium text-blue-400">${booking.bookedBy}</div>
                        <div class="text-slate-400">${booking.bookedByDept}</div>
                        <div class="text-slate-400">${booking.phone}</div>
                        <div class="text-slate-400">${booking.email}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold ${statusClass}">${booking.status}</td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = tableHtml;
    }

    async function initialize() {
        try {
            const data = await AppData.fetchViewBookingsData();
            renderViewBookingsTable(data);
        } catch (error) {
            console.error('Error loading view bookings:', error);
        }
    }

    // Public API
    return {
        initialize
    };
})();