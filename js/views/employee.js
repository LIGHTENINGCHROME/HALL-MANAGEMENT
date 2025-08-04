// Employee View Module
window.EmployeeView = (function() {
    
    // --- STATE MANAGEMENT ---
    let state = {
        allEmployees: [],
        selectedRows: [], // Stores emails of selected employees
        multiSelection: false,
        schoolsData: {},
    };
    let abortController;

    // --- RENDERING ---
    function renderEmployeeTable() {
        const tableBody = document.getElementById('employee-details-body');
        if (!tableBody) return;

        if (!state.allEmployees || state.allEmployees.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-slate-400">No employee details found.</td></tr>`;
            return;
        }
        
        const tableHtml = state.allEmployees.map(emp => {
            const isSelected = state.selectedRows.includes(emp.email);
            const statusColor = emp.status === 'Active' ? 'text-green-400' : 'text-yellow-400';
            return `
            <tr data-employee-email="${emp.email}" class="${isSelected ? 'bg-blue-900/30' : ''} hover:bg-slate-800/50 transition-colors">
                <td class="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <input type="checkbox" class="row-checkbox rounded bg-slate-700 border-slate-500 text-blue-500 focus:ring-blue-500" ${isSelected ? 'checked' : ''}>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-blue-400">${emp.name}</div>
                    <div class="text-slate-400">${emp.email}</div>
                    <div class="text-slate-400">${emp.phone || ''}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${emp.designation}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div class="font-medium text-blue-400">Department</div>
                    <div class="text-slate-400">${emp.department}</div>
                    <div class="font-medium text-blue-400 mt-1">School</div>
                    <div class="text-slate-400">${emp.school}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm font-semibold ${statusColor}">${emp.status}</td>
            </tr>
        `}).join('');

        tableBody.innerHTML = tableHtml;
        updateActionButtonsState();
        if (window.lucide) lucide.createIcons();
    }

    // --- UI & STATE UPDATES ---
    function updateActionButtonsState() {
        const selectedCount = state.selectedRows.length;
        const modifyBtn = document.getElementById('modify-employee-btn');
        const deleteBtn = document.getElementById('delete-employee-btn');
        const selectAllCheckbox = document.getElementById('select-all-employee-checkbox');
        
        if(modifyBtn) modifyBtn.disabled = selectedCount !== 1;
        if(deleteBtn) deleteBtn.disabled = selectedCount === 0;
        
        if (selectAllCheckbox) {
            selectAllCheckbox.disabled = !state.multiSelection;
            if (!state.multiSelection) {
                selectAllCheckbox.checked = false;
            } else {
                 selectAllCheckbox.checked = selectedCount > 0 && selectedCount === state.allEmployees.length;
            }
        }
    }

    function handleRowSelection(email, isChecked) {
        if (!state.multiSelection) {
            state.selectedRows = isChecked ? [email] : [];
        } else {
            if (isChecked) {
                if (!state.selectedRows.includes(email)) {
                    state.selectedRows.push(email);
                }
            } else {
                state.selectedRows = state.selectedRows.filter(e => e !== email);
            }
        }
        renderEmployeeTable();
    }

    // --- MODAL HANDLING ---
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById('modal-backdrop');
        if (!modal || !backdrop) return;

        backdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            modal.classList.remove('opacity-0');
            modal.querySelector('.modal-content')?.classList.remove('scale-95');
        }, 10);
    }

    function closeModal() {
        const backdrop = document.getElementById('modal-backdrop');
        const modals = document.querySelectorAll('.modal');
        
        backdrop?.classList.add('opacity-0');
        modals.forEach(modal => {
            modal.classList.add('opacity-0');
            modal.querySelector('.modal-content')?.classList.add('scale-95');
        });

        setTimeout(() => {
            backdrop?.classList.add('hidden');
            modals.forEach(modal => modal.classList.add('hidden'));
        }, 300); // Match transition duration
    }

    function setupUpdateEmployeeModal() {
        const email = state.selectedRows[0];
        const employee = state.allEmployees.find(emp => emp.email === email);
        if (!employee) {
            console.error("Could not find selected employee to modify.");
            return;
        }

        // --- Populate basic fields ---
        document.getElementById('update-employee-original-email').value = employee.email;
        document.getElementById('update-employee-name').value = employee.name;
        document.getElementById('update-employee-email').value = employee.email;
        document.getElementById('update-employee-phone').value = employee.phone || '';
        document.getElementById('update-employee-designation').value = employee.designation;

        // --- Dynamic Dropdown Elements ---
        const schoolInput = document.getElementById('update-employee-school-input');
        const schoolOptions = document.getElementById('update-employee-school-options');
        const schoolHidden = document.getElementById('update-employee-school');
        const deptInput = document.getElementById('update-employee-department-input');
        const deptOptions = document.getElementById('update-employee-department-options');
        const deptHidden = document.getElementById('update-employee-department');
        
        // --- Dynamic Dropdown Logic ---
        function populateSchoolOptions(searchTerm = '') {
            const filteredSchools = Object.keys(state.schoolsData).filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
            schoolOptions.innerHTML = filteredSchools.map(s => `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="${s}">${s}</div>`).join('');
        }

        function populateDeptOptions(school, searchTerm = '') {
            let departments = school ? (state.schoolsData[school] || []) : [...new Set(Object.values(state.schoolsData).flat())];
            const filteredDepts = departments.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
            deptOptions.innerHTML = filteredDepts.map(d => `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="${d}">${d}</div>`).join('');
        }

        // School Dropdown Handlers
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
        schoolOptions.addEventListener('mousedown', (e) => {
            if (e.target.dataset.value) {
                const schoolValue = e.target.dataset.value;
                schoolInput.value = schoolValue;
                schoolHidden.value = schoolValue;
                deptInput.value = '';
                deptHidden.value = '';
                populateDeptOptions(schoolValue, '');
            }
        });

        // Department Dropdown Handlers
        deptInput.addEventListener('focus', () => { populateDeptOptions(schoolHidden.value, deptInput.value); deptOptions.classList.remove('hidden'); });
        deptInput.addEventListener('blur', () => setTimeout(() => deptOptions.classList.add('hidden'), 150));
        deptInput.addEventListener('input', () => populateDeptOptions('', deptInput.value)); // Always search globally
        deptOptions.addEventListener('mousedown', (e) => {
            if (e.target.dataset.value) {
                const deptValue = e.target.dataset.value;
                deptInput.value = deptValue;
                deptHidden.value = deptValue;
                // Auto-context: find and set the school for the selected department
                for (const school in state.schoolsData) {
                    if (state.schoolsData[school].includes(deptValue)) {
                        schoolInput.value = school;
                        schoolHidden.value = school;
                        break;
                    }
                }
            }
        });

        // --- Set Initial Values ---
        schoolInput.value = employee.school;
        schoolHidden.value = employee.school;
        deptInput.value = employee.department;
        deptHidden.value = employee.department;
        
        openModal('update-employee-modal');
    }

    // --- EVENT HANDLERS ---
    function setupEventHandlers() {
        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        const view = document.getElementById('employee-details-view');
        if (!view) return;

        const multiSelectToggle = document.getElementById('employee-multiselect-toggle');
        if(multiSelectToggle) {
            multiSelectToggle.addEventListener('change', (e) => {
                state.multiSelection = e.target.checked;
                if (!state.multiSelection && state.selectedRows.length > 1) {
                    state.selectedRows = [state.selectedRows[0]];
                } else if (!state.multiSelection) {
                    state.selectedRows = [];
                }
                renderEmployeeTable();
            }, { signal });
        }
        
        const selectAllCheckbox = document.getElementById('select-all-employee-checkbox');
        if(selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                if (state.multiSelection) {
                    state.selectedRows = e.target.checked ? state.allEmployees.map(emp => emp.email) : [];
                    renderEmployeeTable();
                }
            }, { signal });
        }
        
        const tableBody = document.getElementById('employee-details-body');
        if(tableBody) {
            tableBody.addEventListener('change', (e) => {
                if (e.target.classList.contains('row-checkbox')) {
                    const row = e.target.closest('tr');
                    const email = row.dataset.employeeEmail;
                    handleRowSelection(email, e.target.checked);
                }
            }, { signal });
        }

        const modifyBtn = document.getElementById('modify-employee-btn');
        if(modifyBtn) {
            modifyBtn.addEventListener('click', () => {
                if (modifyBtn.disabled) return;
                setupUpdateEmployeeModal();
            }, { signal });
        }

        const deleteBtn = document.getElementById('delete-employee-btn');
        if(deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (deleteBtn.disabled) return;
                
                if (confirm(`Are you sure you want to delete ${state.selectedRows.length} employee(s)? This action cannot be undone.`)) {
                    await AppData.deleteEmployees(state.selectedRows);
                    state.selectedRows = [];
                    await initialize(); 
                    alert('Employee(s) have been deleted successfully.');
                }
            }, { signal });
        }

        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', closeModal, { signal });
        });
        document.getElementById('modal-backdrop')?.addEventListener('click', closeModal, { signal });

        const updateForm = document.getElementById('update-employee-form');
        if(updateForm) {
            updateForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const updatedEmployee = {
                    originalEmail: document.getElementById('update-employee-original-email').value,
                    name: document.getElementById('update-employee-name').value,
                    email: document.getElementById('update-employee-email').value,
                    phone: document.getElementById('update-employee-phone').value,
                    designation: document.getElementById('update-employee-designation').value,
                    school: document.getElementById('update-employee-school').value,
                    department: document.getElementById('update-employee-department').value,
                };
                await AppData.updateEmployee(updatedEmployee);
                state.selectedRows = [updatedEmployee.email];
                closeModal();
                await initialize();
                alert('Employee details updated successfully.');
            }, { signal });
        }
    }
    
    function cleanup() {
        if(abortController) abortController.abort();
        state = {
            allEmployees: [],
            selectedRows: [],
            multiSelection: false,
            schoolsData: {},
        };
        const multiSelectToggle = document.getElementById('employee-multiselect-toggle');
        if(multiSelectToggle) multiSelectToggle.checked = false;
        closeModal();
    }

    async function initialize() {
        try {
            const [data, schools] = await Promise.all([
                AppData.fetchEmployeeData(),
                AppData.getSchools()
            ]);
            state.allEmployees = data;
            state.schoolsData = schools;
            renderEmployeeTable();
            setupEventHandlers();
        } catch (error) {
            console.error('Error loading employee details:', error);
            const tableBody = document.getElementById('employee-details-body');
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-red-400">Failed to load employee data.</td></tr>`;
        }
    }

    // Public API
    return {
        initialize,
        cleanup
    };
})();
