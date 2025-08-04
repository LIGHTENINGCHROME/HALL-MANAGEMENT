// Booking Conflicts View Module
window.ConflictsView = (function() {
    
    function renderBookingConflictsTable(data) {
        const tableBody = document.getElementById('booking-conflicts-body');
        if (!tableBody) return;

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400">No booking conflicts found.</td></tr>`;
            return;
        }
        
        // --- PERFORMANCE FIX: Build HTML string before DOM manipulation ---
        const tableHtml = data.map(booking => `
            <tr class="bg-red-900/20">
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="text-slate-300">${booking.bookedOn}</div>
                    <div class="text-blue-400">${booking.bookingId}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-white">${booking.hallName}</div>
                    <div class="text-slate-400">${booking.hallCode}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-white">${booking.purpose}</div>
                    <div class="text-slate-400">${booking.course}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${booking.dateTime.replace(/\\n/g, '<br>')}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <div class="font-medium text-blue-400">${booking.bookedBy}</div>
                    <div class="text-slate-400">${booking.bookedByDept}</div>
                    <div class="text-slate-400">${booking.phone}</div>
                    <div class="text-slate-400">${booking.email}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-semibold text-yellow-400">${booking.status}</div>
                    <div class="text-red-400 font-semibold">Conflict Exists</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="flex flex-col gap-2">
                        <button data-action="approve" class="px-3 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition">Approve</button>
                        <button data-action="reject" class="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition">Reject</button>
                    </div>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = tableHtml;
    }

    async function initialize() {
        try {
            const data = await AppData.fetchBookingConflictsData();
            renderBookingConflictsTable(data);
        } catch (error) {
            console.error('Error loading booking conflicts:', error);
        }
    }

    // Public API
    return {
        initialize
    };
})();