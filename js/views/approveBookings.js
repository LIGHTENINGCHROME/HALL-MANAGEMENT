// Approve Bookings View Module
window.ApproveBookingsView = (function() {
    
    function renderApproveBookingsTable(data) {
        const tableBody = document.getElementById('approve-bookings-body');
        if (!tableBody) return;

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400">No pending requests.</td></tr>`;
            return;
        }
        
        // --- PERFORMANCE FIX: Build HTML string before DOM manipulation ---
        const tableHtml = data.map(booking => `
            <tr class="hover:bg-slate-800/50 transition-colors">
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${booking.bookedOn}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-white">${booking.hallName}</div>
                    <div class="text-slate-400">${booking.hallCode}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-white">${booking.purpose}</div>
                    <div class="text-slate-400">${booking.course}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${booking.dateTime.replace('\\n', '<br>')}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <div class="font-medium text-white">${booking.bookedBy}</div>
                    <div class="text-slate-400">${booking.bookedByDept}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold text-yellow-400">${booking.status}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="flex gap-2">
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
            const data = await AppData.fetchApprovalData();
            renderApproveBookingsTable(data);
        } catch (error) {
            console.error('Error loading approval data:', error);
        }
    }

    // Public API
    return {
        initialize
    };
})();