// Archive View Module
window.ArchiveView = (function() {
    
    // --- STATE MANAGEMENT ---
    let state = {
        allHalls: [],
        selectedRows: [], // Stores hall codes of selected rows
        multiSelection: false,
    };
    let abortController;

    // --- RENDERING ---
    function renderArchivedHallTable() {
        const tableBody = document.getElementById('archived-hall-details-body');
        if (!tableBody) return;

        if (!state.allHalls || state.allHalls.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400">No archived details found.</td></tr>`;
            return;
        }
        
        const tableHtml = state.allHalls.map(hall => {
            const isSelected = state.selectedRows.includes(hall.hallCode);
            // Archived halls are always status:false, so we show a red indicator
            const statusColor = 'bg-red-900/50 text-red-400';
            const statusText = 'No';

            return `
            <tr data-hall-code="${hall.hallCode}" class="${isSelected ? 'bg-blue-900/30' : ''} hover:bg-slate-800/50 transition-colors">
                <td class="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <input type="checkbox" class="row-checkbox rounded bg-slate-700 border-slate-500 text-blue-500 focus:ring-blue-500" ${isSelected ? 'checked' : ''}>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${hall.date}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-blue-400">${hall.hallName}</div>
                    <div class="text-slate-400">${hall.hallCode}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-blue-400">${hall.school}</div>
                    <div class="text-slate-400">${hall.department}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300 max-w-xs truncate" title="${hall.features}">${hall.features}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-blue-400">${hall.inchargeName}</div>
                    <div class="text-slate-400">${hall.inchargeRole}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}">${statusText}</span>
                </td>
            </tr>
        `}).join('');

        tableBody.innerHTML = tableHtml;
        updateActionButtonsState();
        if (window.lucide) lucide.createIcons();
    }
    
    // --- UI & STATE UPDATES ---
    function updateActionButtonsState() {
        const selectedCount = state.selectedRows.length;
        const reactivateBtn = document.getElementById('reactivate-btn');
        const selectAllCheckbox = document.getElementById('select-all-archive-checkbox');
        
        if(reactivateBtn) reactivateBtn.disabled = selectedCount === 0;
        
        if (selectAllCheckbox) {
            selectAllCheckbox.disabled = !state.multiSelection;
            if (!state.multiSelection) {
                selectAllCheckbox.checked = false;
            } else {
                 selectAllCheckbox.checked = selectedCount > 0 && selectedCount === state.allHalls.length;
            }
        }
    }

    function handleRowSelection(hallCode, isChecked) {
        if (!state.multiSelection) {
            state.selectedRows = isChecked ? [hallCode] : [];
        } else {
            if (isChecked) {
                if (!state.selectedRows.includes(hallCode)) {
                    state.selectedRows.push(hallCode);
                }
            } else {
                state.selectedRows = state.selectedRows.filter(code => code !== hallCode);
            }
        }
        renderArchivedHallTable();
    }

    // --- EVENT HANDLERS ---
    function setupEventHandlers() {
        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        const view = document.getElementById('archive-view');
        if (!view) return;

        const multiSelectToggle = document.getElementById('archive-multiselect-toggle');
        if(multiSelectToggle) {
            multiSelectToggle.addEventListener('change', (e) => {
                state.multiSelection = e.target.checked;
                if (!state.multiSelection && state.selectedRows.length > 1) {
                    state.selectedRows = [state.selectedRows[0]];
                } else if (!state.multiSelection) {
                    state.selectedRows = [];
                }
                renderArchivedHallTable();
            }, { signal });
        }
        
        const selectAllCheckbox = document.getElementById('select-all-archive-checkbox');
        if(selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                if (state.multiSelection) {
                    state.selectedRows = e.target.checked ? state.allHalls.map(h => h.hallCode) : [];
                    renderArchivedHallTable();
                }
            }, { signal });
        }
        
        const tableBody = document.getElementById('archived-hall-details-body');
        if(tableBody) {
            tableBody.addEventListener('change', (e) => {
                if (e.target.classList.contains('row-checkbox')) {
                    const row = e.target.closest('tr');
                    const hallCode = row.dataset.hallCode;
                    handleRowSelection(hallCode, e.target.checked);
                }
            }, { signal });
        }

        const reactivateBtn = document.getElementById('reactivate-btn');
        if(reactivateBtn) {
            reactivateBtn.addEventListener('click', async () => {
                if (state.selectedRows.length === 0) return;
                
                if (confirm(`Are you sure you want to re-activate ${state.selectedRows.length} hall(s)?`)) {
                    await AppData.reactivateHalls(state.selectedRows);
                    // Reset selection and re-initialize the view to show fresh data
                    state.selectedRows = [];
                    await initialize(); 
                    alert('Hall(s) have been re-activated successfully.');
                }
            }, { signal });
        }
    }

    function cleanup() {
        if(abortController) abortController.abort();
        // Reset state
        state = {
            allHalls: [],
            selectedRows: [],
            multiSelection: false,
        };
        const multiSelectToggle = document.getElementById('archive-multiselect-toggle');
        if(multiSelectToggle) multiSelectToggle.checked = false;
    }

    async function initialize() {
        try {
            const data = await AppData.fetchArchivedHallData();
            state.allHalls = data;
            renderArchivedHallTable();
            setupEventHandlers();
        } catch (error) {
            console.error('Error loading archived hall details:', error);
            const tableBody = document.getElementById('archived-hall-details-body');
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-red-400">Failed to load archived data.</td></tr>`;
        }
    }

    // Public API
    return {
        initialize,
        cleanup
    };
})();
