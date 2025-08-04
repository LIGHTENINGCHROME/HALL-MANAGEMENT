// My Bookings View Module
window.MyBookingsView = (function() {
    
    function renderMyBookingsTable(data) {
        const tableBody = document.getElementById('my-bookings-body');
        if (!tableBody) return;

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400">You have no bookings.</td></tr>`;
            return;
        }
        
        // --- PERFORMANCE FIX: Build HTML string before DOM manipulation ---
        const tableHtml = data.map(booking => {
            const statusClass = booking.status === 'Approved' ? 'text-green-400' : 'text-red-400';
            return `
                <tr class="hover:bg-slate-800/50 transition-colors">
                    <td class="py-4 pl-4 pr-3 text-sm sm:pl-6"><input type="checkbox" class="rounded bg-slate-700 border-slate-500 text-blue-500 focus:ring-blue-500"></td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <div class="text-slate-300">${booking.bookedOn}</div>
                        <div class="text-blue-400">${booking.bookingId}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <div class="font-medium text-white">${booking.hallName}</div>
                        <div class="text-slate-400">${booking.hallCode}</div>
                        <div class="text-slate-400">${booking.department}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <div class="font-medium text-white">${booking.purpose}</div>
                        <div class="text-slate-400">${booking.course}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${booking.dateTime.replace('\\n', '<br>')}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold ${statusClass}">${booking.status}</td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = tableHtml;
    }

    async function initialize() {
        try {
            const data = await AppData.fetchMyBookingsData();
            renderMyBookingsTable(data);
        } catch (error) {
            console.error('Error loading my bookings:', error);
        }
    }

    // Public API
    return {
        initialize
    };
})();