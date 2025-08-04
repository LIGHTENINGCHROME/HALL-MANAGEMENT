window.BrowseBookView = (function() {
    let allBookingHalls = {};
    let allAvailability = [];
    let schoolsData = {};
    let abortController;

    const SESSION_STORAGE_KEY = 'browseBookState';

    // Default state for a clean slate
    const getDefaultState = () => ({
        hallType: 'Seminar',
        viewMode: 'with-image',
        filters: {
            school: 'All',
            department: 'All',
            fromDate: '',
            toDate: '',
            capacity: null,
            features: [],
            timeSlots: []
        }
    });

    let state = getDefaultState();

    function saveStateToSession() {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
    }

    function loadStateFromSession() {
        const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            state = { ...getDefaultState(), ...parsed };
            state.filters = { ...getDefaultState().filters, ...parsed.filters };
        }
    }

    // --- Data Handling ---
    function flattenHalls(data) {
        return Object.values(data).flatMap(group => 
            Array.isArray(group) ? group : (typeof group === 'object' && group !== null ? flattenHalls(group) : [])
        );
    }
    
    function getHallsForType(hallType) {
        const hallsData = allBookingHalls[hallType] || [];
        if (Array.isArray(hallsData)) {
            return [...hallsData];
        }
        return flattenHalls(hallsData);
    }

    // --- UI Rendering ---
    function populateFilters() {
        const schoolFilterInput = document.getElementById('school-filter-input');
        const schoolFilterOptions = document.getElementById('school-filter-options');
        const schoolFilterHidden = document.getElementById('school-filter');
        const deptFilterInput = document.getElementById('dept-filter-input');
        const deptFilterOptions = document.getElementById('dept-filter-options');
        const deptFilterHidden = document.getElementById('dept-filter');

        function populateSchoolOptions(searchTerm = '') {
            const filteredSchools = Object.keys(schoolsData).filter(school => school.toLowerCase().includes(searchTerm.toLowerCase()));
            schoolFilterOptions.innerHTML = `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="All">All Schools</div>` + filteredSchools.map(school => `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="${school}">${school}</div>`).join('');
        }

        function populateDeptOptions(school = 'All', searchTerm = '') {
            let departments = [];
            // If user is actively searching, search all departments
            if (searchTerm) {
                 departments = [...new Set(Object.values(schoolsData).flat())];
            } else if (school === 'All') {
                departments = [...new Set(Object.values(schoolsData).flat())];
            } else {
                departments = schoolsData[school] || [];
            }
            const filteredDepts = departments.filter(dept => dept.toLowerCase().includes(searchTerm.toLowerCase()));
            deptFilterOptions.innerHTML = `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="All">All Departments</div>` + filteredDepts.map(dept => `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="${dept}">${dept}</div>`).join('');
        }

        // School Dropdown Logic
        schoolFilterInput.addEventListener('focus', () => {
            populateSchoolOptions(schoolFilterInput.value);
            schoolFilterOptions.classList.remove('hidden');
        });
        schoolFilterInput.addEventListener('blur', () => setTimeout(() => schoolFilterOptions.classList.add('hidden'), 150));
        schoolFilterInput.addEventListener('input', () => {
            populateSchoolOptions(schoolFilterInput.value);
            if (schoolFilterInput.value === '') {
                schoolFilterHidden.value = 'All';
                deptFilterInput.value = '';
                deptFilterHidden.value = 'All';
                populateDeptOptions('All', '');
                handleFilterChange();
            }
        });
        schoolFilterInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstOption = schoolFilterOptions.querySelector('[data-value]');
                if (firstOption && !schoolFilterOptions.classList.contains('hidden')) {
                    firstOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    schoolFilterOptions.classList.add('hidden');
                }
            }
        });
        schoolFilterOptions.addEventListener('mousedown', (e) => {
            if (e.target.dataset.value) {
                const schoolValue = e.target.dataset.value;
                schoolFilterInput.value = schoolValue === 'All' ? '' : schoolValue;
                schoolFilterHidden.value = schoolValue;
                deptFilterInput.value = '';
                deptFilterHidden.value = 'All';
                populateDeptOptions(schoolValue, '');
                handleFilterChange();
            }
        });

        // Department Dropdown Logic
        deptFilterInput.addEventListener('focus', () => {
            populateDeptOptions(schoolFilterHidden.value, deptFilterInput.value);
            deptFilterOptions.classList.remove('hidden');
        });
        deptFilterInput.addEventListener('blur', () => setTimeout(() => deptFilterOptions.classList.add('hidden'), 150));
        deptFilterInput.addEventListener('input', () => {
            populateDeptOptions(schoolFilterHidden.value, deptFilterInput.value);
            if (deptFilterInput.value === '') {
                deptFilterHidden.value = 'All';
            }
        });
        deptFilterInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstOption = deptFilterOptions.querySelector('[data-value]');
                if (firstOption && !deptFilterOptions.classList.contains('hidden')) {
                    firstOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    deptFilterOptions.classList.add('hidden');
                }
            }
        });
        deptFilterOptions.addEventListener('mousedown', (e) => {
            if (e.target.dataset.value) {
                const deptValue = e.target.dataset.value;
                deptFilterInput.value = deptValue === 'All' ? '' : deptValue;
                deptFilterHidden.value = deptValue;

                if (deptValue !== 'All') {
                    for (const school in schoolsData) {
                        if (schoolsData[school].includes(deptValue)) {
                            schoolFilterInput.value = school;
                            schoolFilterHidden.value = school;
                            break;
                        }
                    }
                }
                handleFilterChange();
            }
        });

        populateSchoolOptions();
        populateDeptOptions();
    }
    
    function restoreFilterUI() {
        document.querySelectorAll('.hall-type-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.hallType === state.hallType));
        
        const filters = state.filters || {};
        const schoolFilterInput = document.getElementById('school-filter-input');
        const schoolFilter = document.getElementById('school-filter');
        const deptFilterInput = document.getElementById('dept-filter-input');
        const deptFilter = document.getElementById('dept-filter');

        schoolFilter.value = filters.school || 'All';
        schoolFilterInput.value = filters.school === 'All' ? '' : filters.school;
        deptFilter.value = filters.department || 'All';
        deptFilterInput.value = filters.department === 'All' ? '' : filters.department;

        document.getElementById('from-date').value = filters.fromDate || '';
        document.getElementById('to-date').value = filters.toDate || '';

        document.querySelectorAll('input[name="capacity"]').forEach(radio => radio.checked = radio.value === filters.capacity);
        
        document.querySelectorAll('input[data-feature]').forEach(cb => {
            cb.checked = filters.features?.includes(cb.dataset.feature) ?? false;
        });
        
        document.querySelectorAll('#time-slot-buttons button').forEach(btn => {
            btn.classList.toggle('selected', filters.timeSlots?.includes(btn.dataset.time) ?? false);
        });

        document.getElementById('view-mode-select').value = state.viewMode || 'with-image';
    }

    function applyFiltersAndRender() {
        const filters = state.filters;
        let hallsToDisplay = getHallsForType(state.hallType);

        if (filters.school && filters.school !== 'All') hallsToDisplay = hallsToDisplay.filter(h => h.school === filters.school);
        if (filters.department && filters.department !== 'All') hallsToDisplay = hallsToDisplay.filter(h => h.department === filters.department);
        if (filters.capacity) {
            const range = { 'less-50': [0, 49], '50-100': [50, 100], 'more-100': [101, Infinity] }[filters.capacity];
            if(range) hallsToDisplay = hallsToDisplay.filter(h => h.capacity >= range[0] && h.capacity <= range[1]);
        }
        if (filters.features && filters.features.length > 0) {
            hallsToDisplay = hallsToDisplay.filter(h => filters.features.every(f => h.features.includes(f)));
        }
        if (filters.fromDate && filters.toDate && filters.timeSlots && filters.timeSlots.length > 0) {
            const from = new Date(filters.fromDate);
            const to = new Date(filters.toDate);
            hallsToDisplay = hallsToDisplay.filter(hall => {
                for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                    for (const time of filters.timeSlots) {
                        const isBooked = allAvailability.some(b => 
                            b.hallId === hall.id &&
                            new Date(b.year, b.month, b.day).getTime() === new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() &&
                            b.time === time
                        );
                        if (isBooked) return false;
                    }
                }
                return true;
            });
        }

        renderFilteredResults(hallsToDisplay);
    }
    
    function renderFilteredResults(filteredHalls) {
        const cardsContainer = document.getElementById('hall-cards-container');
        const tableContainer = document.getElementById('hall-table-container');
        const title = document.getElementById('hall-listing-title');
        
        if (title) title.textContent = `${state.hallType} (${filteredHalls.length})`;

        if (state.viewMode === 'table') {
            cardsContainer?.classList.add('hidden');
            tableContainer?.classList.remove('hidden');
            renderBookingHallsAsTable(filteredHalls);
        } else {
            tableContainer?.classList.add('hidden');
            cardsContainer?.classList.remove('hidden');
            renderBookingHallsAsCards(filteredHalls, state.viewMode);
        }
    }

    function renderBookingHallsAsCards(data, mode) {
        const container = document.getElementById('hall-cards-container');
        if (!container) return;
        if (data.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-10 text-slate-400">No halls match the selected criteria.</div>`; return;
        }
        container.innerHTML = data.map(hall => `
            <div data-hall-id="${hall.id}" class="hall-card bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-700 flex flex-col">
                ${mode === 'with-image' ? `<img src="https://placehold.co/600x400/0f172a/93c5fd?text=${hall.name.replace(/\s/g,'+')}" alt="${hall.name}" class="w-full h-32 object-cover rounded-t-lg mb-4" onerror="this.onerror=null;this.src='https://placehold.co/600x400/0f172a/93c5fd?text=Image+Not+Found';">` : ''}
                <div class="p-4 flex flex-col flex-grow justify-between">
                    <div>
                        <h4 class="font-bold text-blue-400">${hall.name} <span class="text-sm font-normal text-slate-400">(${hall.type})</span></h4>
                        <p class="text-sm text-slate-300 mt-1">${hall.location}</p><p class="text-sm text-slate-400 mt-2">Capacity: ${hall.capacity}</p>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button data-action="view-details" data-hall-id="${hall.id}" class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition">View</button>
                        <button data-action="book-now" data-hall-id="${hall.id}" class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">Book</button>
                    </div>
                </div>
            </div>`).join('');
    }

    function renderBookingHallsAsTable(data) {
        const container = document.getElementById('hall-table-container');
        if (!container) return;
        if (data.length === 0) {
            container.innerHTML = `<div class="table-container"><table class="min-w-full divide-y divide-slate-700"><tbody><tr><td colspan="4" class="text-center py-10 text-slate-400">No halls match the selected criteria.</td></tr></tbody></table></div>`; return;
        }
        const tableBodyHtml = data.map(hall => `
            <tr class="hover:bg-slate-800/50 transition-colors">
                <td class="whitespace-nowrap px-3 py-4 text-sm"><div class="font-medium text-blue-400">${hall.name}</div><div class="text-slate-400">${hall.type}</div></td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${hall.location}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-slate-300">${hall.capacity}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm"><div class="flex gap-2">
                    <button data-action="view-details" data-hall-id="${hall.id}" class="px-3 py-1 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-md transition">View</button>
                    <button data-action="book-now" data-hall-id="${hall.id}" class="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition">Book</button>
                </div></td>
            </tr>`).join('');
        container.innerHTML = `
            <div class="table-container overflow-auto">
                <table class="min-w-full divide-y divide-slate-700">
                    <thead class="bg-slate-900/50"><tr>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Hall Name</th><th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Location</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Capacity</th><th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Actions</th>
                    </tr></thead>
                    <tbody class="divide-y divide-slate-800 bg-slate-900/30">${tableBodyHtml}</tbody>
                </table>
            </div>`;
    }

    function handleFilterChange() {
        state.filters.school = document.getElementById('school-filter').value;
        state.filters.department = document.getElementById('dept-filter').value;
        state.viewMode = document.getElementById('view-mode-select').value;
        state.filters.capacity = document.querySelector('input[name="capacity"]:checked')?.value || null;
        state.filters.features = Array.from(document.querySelectorAll('input[data-feature]:checked')).map(cb => cb.dataset.feature);
        state.filters.fromDate = document.getElementById('from-date').value;
        state.filters.toDate = document.getElementById('to-date').value;
        state.filters.timeSlots = Array.from(document.querySelectorAll('#time-slot-buttons button.selected')).map(btn => btn.dataset.time);
        
        applyFiltersAndRender();
        saveStateToSession();
    }

    // --- Event Handling & State Update ---
    function setupEventHandlers() {
        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        const container = document.getElementById('browse-book-view');
        if(!container) return;

        const handleInteraction = (e) => {
            const target = e.target;

            if (e.type === 'click') {
                if (target.matches('.hall-type-btn')) {
                    const newType = target.dataset.hallType;
                    if (newType !== state.hallType) {
                        state.hallType = newType;
                        state.filters = getDefaultState().filters; 
                        restoreFilterUI();
                        applyFiltersAndRender();
                        saveStateToSession();
                    }
                } else if (target.closest('#time-slot-buttons > button')) {
                    target.closest('#time-slot-buttons > button').classList.toggle('selected');
                    handleFilterChange();
                } else if (target.matches('#clear-capacity, #clear-features, #clear-timeslots')) {
                    if (target.id === 'clear-capacity') {
                        const checkedRadio = document.querySelector('input[name="capacity"]:checked');
                        if (checkedRadio) checkedRadio.checked = false;
                    }
                    if (target.id === 'clear-features') document.querySelectorAll('input[data-feature]:checked').forEach(cb => cb.checked = false);
                    if (target.id === 'clear-timeslots') document.querySelectorAll('#time-slot-buttons button.selected').forEach(btn => btn.classList.remove('selected'));
                    handleFilterChange();
                } else if (target.matches('#forenoon-btn, #afternoon-btn')) {
                    const isForenoon = target.id === 'forenoon-btn';
                    const periodSlots = Array.from(document.querySelectorAll('#time-slot-buttons button')).filter(btn => {
                        const time = btn.dataset.time;
                        const isPM = time.includes('PM');
                        const hour = parseInt(time.split(':')[0]);
                        return isForenoon ? (!isPM || hour === 12) : (isPM && hour !== 12);
                    });
                    const areAllSelected = periodSlots.every(btn => btn.classList.contains('selected'));
                    periodSlots.forEach(btn => btn.classList.toggle('selected', !areAllSelected));
                    handleFilterChange();
                }
            }
            else if (e.type === 'change') {
                if(target.matches('input[name="capacity"], input[data-feature], #view-mode-select, #from-date, #to-date')) {
                    handleFilterChange();
                }
            }
        };

        container.addEventListener('click', handleInteraction, { signal });
        container.addEventListener('change', handleInteraction, { signal });
    }
    
    function cleanup() {
        if (abortController) abortController.abort();
    }

    async function initialize() {
        loadStateFromSession();
        const [halls, availability, schools] = await Promise.all([
            AppData.fetchBookingHalls(), 
            AppData.fetchHallAvailability(),
            AppData.getSchools()
        ]);
        allBookingHalls = halls;
        allAvailability = availability;
        schoolsData = schools;
        
        populateFilters();
        restoreFilterUI();
        applyFiltersAndRender();
        setupEventHandlers();
        
        if (window.lucide) lucide.createIcons();
    }

    return { initialize, cleanup };
})();
