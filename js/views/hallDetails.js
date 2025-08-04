// Hall Details View Module
window.HallDetailsView = (function() {
    
    // --- STATE MANAGEMENT ---
    let state = {
        allHalls: [],
        filteredHalls: [],
        selectedRows: [], // Stores hall codes of selected rows
        multiSelection: false,
        filters: {} // To store active column filters
    };
    let schoolsData = {};
    let abortController;

    // --- RENDERING ---
    function renderHallTable() {
        // Apply filters before rendering
        if (Object.keys(state.filters).length > 0) {
            state.filteredHalls = state.allHalls.filter(hall => {
                // This is a placeholder for filter logic.
                // A real implementation would iterate through state.filters
                // and check if the hall matches all active filters.
                return true; 
            });
        } else {
            state.filteredHalls = [...state.allHalls];
        }


        const tableBody = document.getElementById('hall-details-body');
        if (!tableBody) return;

        if (state.filteredHalls.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400">No details found.</td></tr>`;
            return;
        }
        
        const tableHtml = state.filteredHalls.map(hall => {
            const isSelected = state.selectedRows.includes(hall.hallCode);
            const statusColor = hall.status ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-400';
            const statusText = hall.status ? 'Yes' : 'No';

            return `
            <tr data-hall-code="${hall.hallCode}" class="${isSelected ? 'bg-blue-900/30' : ''} hover:bg-slate-800/50 transition-colors">
                <td class="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <input type="checkbox" class="row-checkbox rounded bg-slate-700 border-slate-500 text-blue-500 focus:ring-blue-500" ${isSelected ? 'checked' : ''}>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${hall.date}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-blue-400">${hall.hallName}</div>
                    <div class="text-slate-400">${hall.hallCode}</div>
                    <div class="text-slate-400">Capacity: ${hall.capacity}</div>
                    <div class="text-slate-400">${hall.floor}</div>
                    <div class="text-slate-400">${hall.zone}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-blue-400">${hall.school}</div>
                    <div class="text-slate-400">${hall.department}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300 max-w-xs truncate" title="${hall.features}">${hall.features}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-blue-400">${hall.inchargeName}</div>
                    <div class="text-slate-400">${hall.inchargeRole}</div>
                    <div class="text-slate-400">${hall.inchargeEmail}</div>
                    <div class="text-slate-400">${hall.inchargePhone}</div>
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
        const statusBtn = document.getElementById('status-btn');
        const ownershipBtn = document.getElementById('ownership-btn');
        const featuresBtn = document.getElementById('features-btn');
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        
        const hasSelection = selectedCount > 0;
        const hasSingleSelection = selectedCount === 1;

        if(statusBtn) statusBtn.disabled = !hasSelection;
        if(ownershipBtn) ownershipBtn.disabled = !hasSelection;
        if(featuresBtn) featuresBtn.disabled = !hasSingleSelection;
        
        if (selectAllCheckbox) {
            selectAllCheckbox.disabled = !state.multiSelection;
            if (!state.multiSelection) {
                selectAllCheckbox.checked = false;
            } else {
                 selectAllCheckbox.checked = hasSelection && selectedCount === state.filteredHalls.length;
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
        renderHallTable();
    }

    // --- MODAL HANDLING ---
    function openModal(modalId) {
        document.getElementById('modal-backdrop').classList.remove('hidden');
        document.getElementById(modalId).classList.remove('hidden');
    }

    function closeModal() {
        document.getElementById('modal-backdrop').classList.add('hidden');
        document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
        const dynamicModal = document.getElementById('transfer-ownership-modal');
        if (dynamicModal) dynamicModal.remove();
    }

    function setupModal(modalId, openBtnId, setupFn) {
        const openBtn = document.getElementById(openBtnId);
        if (!openBtn) return; // Guard against missing button

        openBtn.addEventListener('click', () => {
            if (openBtn.disabled) return;
            try {
                if (setupFn) {
                    setupFn();
                }
                openModal(modalId);
            } catch (error) {
                console.error(`Error setting up modal "${modalId}":`, error);
            }
        });
    }

    // --- MODAL SPECIFIC LOGIC ---
    function setupUpdateStatusModal() {
        const hall = state.allHalls.find(h => h.hallCode === state.selectedRows[0]);
        if (!hall) return;

        document.querySelector(`input[name="status-option"][value="${hall.status}"]`).checked = true;
        
        const reasonContainer = document.getElementById('status-reason-container');
        const dateRangeContainer = document.getElementById('status-date-range');
        
        reasonContainer.classList.toggle('hidden', hall.status);
        
        document.querySelectorAll('input[name="status-option"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                reasonContainer.classList.toggle('hidden', e.target.value === 'true');
            });
        });

        document.getElementById('status-reason-select').addEventListener('change', (e) => {
            const showDates = e.target.value && e.target.value !== 'Removed';
            dateRangeContainer.classList.toggle('hidden', !showDates);
        });

        const checkedRadio = document.querySelector('input[name="status-option"]:checked');
        if (checkedRadio) checkedRadio.dispatchEvent(new Event('change'));
        
        const reasonSelect = document.getElementById('status-reason-select');
        if(reasonSelect) reasonSelect.dispatchEvent(new Event('change'));
    }

    function showTransferModal() {
        const existingModal = document.getElementById('transfer-ownership-modal');
        if (existingModal) existingModal.remove();
        const backdrop = document.getElementById('modal-backdrop');

        const modalHTML = `
            <div id="transfer-ownership-modal" class="modal fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-700">
                    <h2 class="text-2xl font-bold text-white mb-4">Transfer Ownership</h2>
                    <p class="text-slate-400 mb-6">Choose the new owner for the selected hall(s).</p>
                    <div class="flex items-center gap-6 mb-4">
                        <label class="flex items-center text-white"><input type="radio" name="owner-type" value="School" class="form-radio bg-slate-700 border-slate-600 text-blue-500 h-4 w-4 mr-2" checked>School/Department</label>
                        <label class="flex items-center text-white"><input type="radio" name="owner-type" value="Administration" class="form-radio bg-slate-700 border-slate-600 text-blue-500 h-4 w-4 mr-2">Administration</label>
                    </div>
                    <div id="school-selection-container" class="space-y-4">
                        <div>
                            <label for="school-transfer-input" class="block text-lg font-semibold text-white mb-2">School:</label>
                            <div class="relative">
                                <input type="text" id="school-transfer-input" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Search for a school...">
                                <div id="school-transfer-options" class="absolute z-20 w-full bg-slate-900 border border-slate-600 rounded-lg mt-1 hidden max-h-60 overflow-y-auto"></div>
                            </div>
                            <input type="hidden" id="school-transfer-hidden">
                        </div>
                        <div>
                            <label for="dept-transfer-input" class="block text-lg font-semibold text-white mb-2">Department:</label>
                            <div class="relative">
                                <input type="text" id="dept-transfer-input" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Search for a department...">
                                <div id="dept-transfer-options" class="absolute z-10 w-full bg-slate-900 border border-slate-600 rounded-lg mt-1 hidden max-h-60 overflow-y-auto"></div>
                            </div>
                            <input type="hidden" id="dept-transfer-hidden">
                        </div>
                    </div>
                    <div id="admin-selection-container" class="hidden space-y-4 mt-4">
                        <div>
                            <label for="admin-section-select" class="block text-lg font-semibold text-white mb-2">Section:</label>
                            <select id="admin-section-select" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Select Section</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Examination Wing">Examination Wing</option>
                                <option value="Library">Library</option>
                                <option value="Guest House">Guest House</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-4 mt-8">
                        <button id="cancel-transfer-btn" class="px-6 py-2 text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition">Cancel</button>
                        <button id="confirm-transfer-btn" class="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">Transfer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        backdrop.classList.remove('hidden');

        const schoolInput = document.getElementById('school-transfer-input');
        const schoolOptions = document.getElementById('school-transfer-options');
        const schoolHidden = document.getElementById('school-transfer-hidden');
        const deptInput = document.getElementById('dept-transfer-input');
        const deptOptions = document.getElementById('dept-transfer-options');
        const deptHidden = document.getElementById('dept-transfer-hidden');
        const radioButtons = document.querySelectorAll('input[name="owner-type"]');
        const schoolSelectionContainer = document.getElementById('school-selection-container');
        const adminSelectionContainer = document.getElementById('admin-selection-container');


        const confirmBtn = document.getElementById('confirm-transfer-btn');
        const cancelBtn = document.getElementById('cancel-transfer-btn');

        function handleRadioChange() {
            const selectedType = document.querySelector('input[name="owner-type"]:checked').value;
            schoolSelectionContainer.classList.toggle('hidden', selectedType !== 'School');
            adminSelectionContainer.classList.toggle('hidden', selectedType !== 'Administration');
        }

        radioButtons.forEach(radio => radio.addEventListener('change', handleRadioChange));
        handleRadioChange();

        function populateSchoolOptions(searchTerm = '') {
            const filteredSchools = Object.keys(schoolsData).filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
            schoolOptions.innerHTML = filteredSchools.map(s => `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="${s}">${s}</div>`).join('');
        }

        function populateDeptOptions(school, searchTerm = '') {
            let departments = school ? (schoolsData[school] || []) : [...new Set(Object.values(schoolsData).flat())];
            const filteredDepts = departments.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
            deptOptions.innerHTML = filteredDepts.map(d => `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="${d}">${d}</div>`).join('');
        }

        schoolInput.addEventListener('focus', () => { populateSchoolOptions(schoolInput.value); schoolOptions.classList.remove('hidden'); });
        schoolInput.addEventListener('blur', () => setTimeout(() => schoolOptions.classList.add('hidden'), 150));
        schoolInput.addEventListener('input', () => {
            populateSchoolOptions(schoolInput.value);
            if (schoolInput.value === '') {
                schoolHidden.value = '';
                deptInput.value = '';
                deptHidden.value = '';
                populateDeptOptions('', '');
            }
        });
        schoolInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstOption = schoolOptions.querySelector('[data-value]');
                if (firstOption) firstOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                schoolOptions.classList.add('hidden');
            }
        });
        schoolOptions.addEventListener('mousedown', (e) => {
            if (e.target.dataset.value) {
                schoolInput.value = e.target.dataset.value;
                schoolHidden.value = e.target.dataset.value;
                deptInput.value = '';
                deptHidden.value = '';
                populateDeptOptions(schoolHidden.value, '');
            }
        });

        deptInput.addEventListener('focus', () => { populateDeptOptions(schoolHidden.value, deptInput.value); deptOptions.classList.remove('hidden'); });
        deptInput.addEventListener('blur', () => setTimeout(() => deptOptions.classList.add('hidden'), 150));
        deptInput.addEventListener('input', () => populateDeptOptions(schoolHidden.value, deptInput.value));
        deptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstOption = deptOptions.querySelector('[data-value]');
                if (firstOption) firstOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                deptOptions.classList.add('hidden');
            }
        });
        deptOptions.addEventListener('mousedown', (e) => {
            if (e.target.dataset.value) {
                const deptValue = e.target.dataset.value;
                deptInput.value = deptValue;
                deptHidden.value = deptValue;
                for (const school in schoolsData) {
                    if (schoolsData[school].includes(deptValue)) {
                        schoolInput.value = school;
                        schoolHidden.value = school;
                        break;
                    }
                }
            }
        });

        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            const ownerType = document.querySelector('input[name="owner-type"]:checked').value;
            let newOwner = '';
            if (ownerType === 'School') {
                newOwner = deptHidden.value || schoolHidden.value;
            } else if (ownerType === 'Administration') {
                newOwner = document.getElementById('admin-section-select').value;
            }

            if (!newOwner) {
                alert('Please select a new owner or section.');
                return;
            }
            alert(`Ownership transferred for ${state.selectedRows.length} hall(s) to ${newOwner}.`);
            closeModal();
        });
    }

    function setupFeaturesModal() {
        const hall = state.allHalls.find(h => h.hallCode === state.selectedRows[0]);
        if (!hall) {
            console.error("Modify Features: Could not find selected hall data.");
            throw new Error("Selected hall data not found.");
        };

        let allPossibleFeatures = [];
        if (window.AppData && typeof window.AppData.getFeatures === 'function') {
            allPossibleFeatures = AppData.getFeatures();
        } else {
            allPossibleFeatures = ['AC', 'Projector', 'WiFi', 'Podium', 'Computer', 'Lift', 'Ramp', 'Audio', 'White Board', 'Black Board', 'Smart Board'];
        }

        const container = document.getElementById('features-checkbox-container');
        if (!container) {
             console.error("Modify Features: The 'features-checkbox-container' element was not found in the DOM.");
             throw new Error("Required modal element not found.");
        }
        
        container.innerHTML = allPossibleFeatures.map(feature => {
            const currentFeatures = Array.isArray(hall.features) ? hall.features : (hall.features || '').split(', ');
            const isChecked = currentFeatures.includes(feature);
            return `
                <label class="flex items-center text-slate-300">
                    <input type="checkbox" value="${feature}" class="feature-checkbox form-checkbox h-4 w-4 bg-slate-800 text-blue-500 border-slate-600 rounded focus:ring-blue-500 mr-2" ${isChecked ? 'checked' : ''}>
                    ${feature}
                </label>
            `;
        }).join('');
    }

    // --- EVENT HANDLERS ---
    function setupEventHandlers() {
        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        const view = document.getElementById('hall-details-view');
        if (!view) return;

        const multiSelectToggle = document.getElementById('multiselect-toggle');
        if(multiSelectToggle) {
            multiSelectToggle.addEventListener('change', (e) => {
                state.multiSelection = e.target.checked;
                if (!state.multiSelection && state.selectedRows.length > 1) {
                    state.selectedRows = [state.selectedRows[0]];
                } else if (!state.multiSelection) {
                    state.selectedRows = [];
                }
                renderHallTable();
            }, { signal });
        }
        
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if(selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                if (state.multiSelection) {
                    state.selectedRows = e.target.checked ? state.filteredHalls.map(h => h.hallCode) : [];
                    renderHallTable();
                }
            }, { signal });
        }
        
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if(clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                state.filters = {};
                renderHallTable();
            }, { signal });
        }

        const hallDetailsBody = document.getElementById('hall-details-body');
        if(hallDetailsBody) {
            hallDetailsBody.addEventListener('change', (e) => {
                if (e.target.classList.contains('row-checkbox')) {
                    const row = e.target.closest('tr');
                    const hallCode = row.dataset.hallCode;
                    handleRowSelection(hallCode, e.target.checked);
                }
            }, { signal });
        }

        // Modal setup
        setupModal('update-status-modal', 'status-btn', setupUpdateStatusModal);
        const ownershipBtn = document.getElementById('ownership-btn');
        if(ownershipBtn) ownershipBtn.addEventListener('click', () => { if(!ownershipBtn.disabled) showTransferModal(); }, { signal });
        setupModal('modify-features-modal', 'features-btn', setupFeaturesModal);

        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', closeModal, { signal });
        });
        const modalBackdrop = document.getElementById('modal-backdrop');
        if(modalBackdrop) modalBackdrop.addEventListener('click', closeModal, { signal });

        // Modal submission logic
        const submitStatusUpdate = document.getElementById('submit-status-update');
        if(submitStatusUpdate) {
            submitStatusUpdate.addEventListener('click', async () => {
                // This logic would be in a real app
                alert(`Status updated for ${state.selectedRows.length} hall(s).`);
                closeModal();
            }, { signal });
        }
        
        const submitFeaturesUpdate = document.getElementById('submit-features-update');
        if(submitFeaturesUpdate) {
            submitFeaturesUpdate.addEventListener('click', async () => {
                // This logic would be in a real app
                alert(`Features updated for ${state.selectedRows[0]}.`);
                closeModal();
            }, { signal });
        }
        
        const clearAllFeatures = document.getElementById('clear-all-features');
        if(clearAllFeatures) {
            clearAllFeatures.addEventListener('click', () => {
                document.querySelectorAll('.feature-checkbox').forEach(cb => cb.checked = false);
            }, { signal });
        }
    }
    
    function cleanup() {
        if(abortController) abortController.abort();
        state.selectedRows = [];
        state.multiSelection = false;
        const multiSelectToggle = document.getElementById('multiselect-toggle');
        if(multiSelectToggle) multiSelectToggle.checked = false;
        closeModal();
    }

    async function initialize() {
        try {
            const [halls, schools] = await Promise.all([
                AppData.fetchHallData(),
                AppData.getSchools()
            ]);
            state.allHalls = halls;
            schoolsData = schools;
            renderHallTable();
            setupEventHandlers();
        } catch (error) {
            console.error('Error loading hall details:', error);
            const tableBody = document.getElementById('hall-details-body');
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-red-400">Failed to load hall data.</td></tr>`;
        }
    }

    // Public API
    return {
        initialize,
        cleanup
    };
})();