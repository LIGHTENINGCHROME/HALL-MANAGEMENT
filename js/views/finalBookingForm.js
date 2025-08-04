// HallBooking/js/views/finalBookingForm.js

window.FinalBookingFormView = (function() {
    
    const SESSION_STORAGE_KEY_FORM = 'finalBookingFormState';
    let state = {
        hall: null,
        availabilityData: [],
        selectedSlots: [], // Single source of truth: [{ date: 'YYYY-MM-DD', time: 'HH:MM AM/PM' }]
        currentDate: new Date(),
        calendarView: 'month',
        allSchools: {},
    };
    let abortController;

    // --- STATE PERSISTENCE ---
    function saveStateToSession() {
        if (!state.hall) return;
        const key = SESSION_STORAGE_KEY_FORM + `_${state.hall.id}`;
        const stateToSave = {
            selectedSlots: state.selectedSlots,
            currentDate: state.currentDate.toISOString(),
            calendarView: state.calendarView,
        };
        sessionStorage.setItem(key, JSON.stringify(stateToSave));
    }

    function loadStateFromSession() {
        if (!state.hall) return;
        const key = SESSION_STORAGE_KEY_FORM + `_${state.hall.id}`;
        const savedState = sessionStorage.getItem(key);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            state.selectedSlots = parsed.selectedSlots || [];
            state.currentDate = new Date(parsed.currentDate);
            state.calendarView = parsed.calendarView || 'month';
        }
    }

    // --- RENDERING ---
    function render() {
        const container = document.getElementById('final-booking-form-content');
        if (!container || !state.hall) return;

        const { fromDate, toDate } = getSelectedDateRange();
        
        const inputClasses = "mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500";
        const readonlyInputClasses = "mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-400 cursor-not-allowed";

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-slate-300">Hall Type</label>
                    <input type="text" value="${state.hall.type}" readonly class="${readonlyInputClasses}">
                </div>
                 <div>
                    <label class="block text-sm font-medium text-slate-300">Hall Name</label>
                    <input type="text" value="${state.hall.name}" readonly class="${readonlyInputClasses}">
                </div>
                <div>
                    <label for="school-select-input" class="block text-sm font-medium text-slate-300">School</label>
                    <div class="relative">
                        <input type="text" id="school-select-input" class="${inputClasses}" placeholder="Search for a school...">
                        <div id="school-select-options" class="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 hidden max-h-60 overflow-y-auto"></div>
                    </div>
                    <input type="hidden" id="school-select">
                </div>
                 <div>
                    <label for="department-select-input" class="block text-sm font-medium text-slate-300">Department</label>
                     <div class="relative">
                        <input type="text" id="department-select-input" class="${inputClasses}" placeholder="Search for a department...">
                        <div id="department-select-options" class="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 hidden max-h-60 overflow-y-auto"></div>
                    </div>
                    <input type="hidden" id="department-select">
                </div>
                <div>
                    <label for="booking-purpose-final" class="block text-sm font-medium text-slate-300">Purpose</label>
                    <input type="text" id="booking-purpose-final" placeholder="e.g., Ph.D. Defense" class="${inputClasses}">
                </div>
                <div>
                    <label for="course-title-final" class="block text-sm font-medium text-slate-300">Course / Event Title</label>
                    <input type="text" id="course-title-final" placeholder="e.g., Viva Voce for Mr. Alex" class="${inputClasses}">
                </div>
            </div>
            
            <div id="interactive-calendar-container" class="pt-4"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                    <label class="block text-sm font-medium text-slate-300">From:</label>
                    <input id="from-date-input" type="date" value="${fromDate}" class="${inputClasses}">
                </div>
                 <div>
                    <label class="block text-sm font-medium text-slate-300">To:</label>
                    <input id="to-date-input" type="date" value="${toDate}" class="${inputClasses}">
                </div>
            </div>

             <div class="pt-4">
                <label class="block text-sm font-medium text-slate-300 mb-2">Choose Slot(s):</label>
                <div class="flex rounded-lg border border-slate-600 overflow-hidden mb-4">
                    <button id="forenoon-btn" class="flex-1 p-2 text-sm font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">Forenoon</button>
                    <button id="afternoon-btn" class="flex-1 p-2 text-sm font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">Afternoon</button>
                </div>
                <div id="time-slots-checkboxes" class="p-4 border border-slate-600 rounded-md grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${renderTimeCheckboxes()}
                </div>
            </div>

            <div class="pt-4">
                <label class="block text-sm font-medium text-slate-300 mb-2">Selected Slots (${state.selectedSlots.length})</label>
                <div id="selected-slots-pills" class="selected-slots-container flex flex-wrap gap-2">
                    ${renderSelectedSlotsPills()}
                </div>
            </div>

            <div class="flex justify-end gap-4 pt-4">
                <button onclick="window.history.back()" class="px-6 py-2 text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition">Back</button>
                <button id="confirm-booking-final-btn" class="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">Confirm Booking</button>
            </div>
        `;

        populateDynamicSelects();
        updateUI();
        setupEventHandlers();
    }
    
    function populateDynamicSelects() {
        const schoolSelectInput = document.getElementById('school-select-input');
        const schoolSelectOptions = document.getElementById('school-select-options');
        const schoolSelectHidden = document.getElementById('school-select');
        const deptSelectInput = document.getElementById('department-select-input');
        const deptSelectOptions = document.getElementById('department-select-options');
        const deptSelectHidden = document.getElementById('department-select');

        function populateSchoolOptions(searchTerm = '') {
            const filteredSchools = Object.keys(state.allSchools).filter(school => school.toLowerCase().includes(searchTerm.toLowerCase()));
            schoolSelectOptions.innerHTML = filteredSchools.map(school => `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="${school}">${school}</div>`).join('');
        }

        function populateDeptOptions(school, searchTerm = '') {
            let departments = [];
            if (school && state.allSchools[school] && searchTerm === '') {
                departments = state.allSchools[school];
            } else {
                departments = [...new Set(Object.values(state.allSchools).flat())];
            }
            const filteredDepts = departments.filter(dept => dept.toLowerCase().includes(searchTerm.toLowerCase()));
            deptSelectOptions.innerHTML = filteredDepts.map(dept => `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="${dept}">${dept}</div>`).join('');
        }

        // School Dropdown Logic
        schoolSelectInput.addEventListener('focus', () => {
            populateSchoolOptions(schoolSelectInput.value);
            schoolSelectOptions.classList.remove('hidden');
        });
        schoolSelectInput.addEventListener('blur', () => setTimeout(() => schoolSelectOptions.classList.add('hidden'), 150));
        schoolSelectInput.addEventListener('input', () => {
            populateSchoolOptions(schoolSelectInput.value);
            if (schoolSelectInput.value === '') {
                schoolSelectHidden.value = '';
                deptSelectInput.value = '';
                deptSelectHidden.value = '';
                populateDeptOptions('', '');
            }
        });
        schoolSelectInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstOption = schoolSelectOptions.querySelector('[data-value]');
                if (firstOption && !schoolSelectOptions.classList.contains('hidden')) {
                    firstOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    schoolSelectOptions.classList.add('hidden');
                }
            }
        });
        schoolSelectOptions.addEventListener('mousedown', (e) => {
            if (e.target.dataset.value) {
                const schoolValue = e.target.dataset.value;
                schoolSelectInput.value = schoolValue;
                schoolSelectHidden.value = schoolValue;
                deptSelectInput.value = '';
                deptSelectHidden.value = '';
                populateDeptOptions(schoolValue, '');
            }
        });

        // Department Dropdown Logic
        deptSelectInput.addEventListener('focus', () => {
            populateDeptOptions(schoolSelectHidden.value, deptSelectInput.value);
            deptSelectOptions.classList.remove('hidden');
        });
        deptSelectInput.addEventListener('blur', () => setTimeout(() => deptSelectOptions.classList.add('hidden'), 150));
        deptSelectInput.addEventListener('input', () => {
            // When typing, always search globally by passing an empty school
            populateDeptOptions('', deptSelectInput.value);
            if (deptSelectInput.value === '') {
                deptSelectHidden.value = '';
            }
        });
        deptSelectInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstOption = deptSelectOptions.querySelector('[data-value]');
                if (firstOption && !deptSelectOptions.classList.contains('hidden')) {
                    firstOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    deptSelectOptions.classList.add('hidden');
                }
            }
        });
        deptSelectOptions.addEventListener('mousedown', (e) => {
            if (e.target.dataset.value) {
                const deptValue = e.target.dataset.value;
                deptSelectInput.value = deptValue;
                deptSelectHidden.value = deptValue;

                for (const school in state.allSchools) {
                    if (state.allSchools[school].includes(deptValue)) {
                        schoolSelectInput.value = school;
                        schoolSelectHidden.value = school;
                        break;
                    }
                }
            }
        });

        // Set initial values
        if (state.hall.school) {
            schoolSelectInput.value = state.hall.school;
            schoolSelectHidden.value = state.hall.school;
        }
        if (state.hall.department) {
            deptSelectInput.value = state.hall.department;
            deptSelectHidden.value = state.hall.department;
        }
        populateSchoolOptions();
        populateDeptOptions(schoolSelectHidden.value);
    }

    function updateUI() {
        document.getElementById('interactive-calendar-container').innerHTML = renderCalendar();
        
        const pillsContainer = document.getElementById('selected-slots-pills');
        if (pillsContainer) {
            pillsContainer.innerHTML = renderSelectedSlotsPills();
        }

        document.getElementById('time-slots-checkboxes').innerHTML = renderTimeCheckboxes();
        updateDateInputs();
        if (window.lucide) lucide.createIcons();
    }
    
    function renderCalendar() {
        const title = getCalendarTitle();
        let gridHtml;
        switch(state.calendarView) {
            case 'day': gridHtml = renderDayView(); break;
            case 'week': gridHtml = renderWeekView(); break;
            default: gridHtml = renderMonthView(); break;
        }

        return `
            <div class="p-2 border border-slate-600 rounded-lg">
                <div class="flex items-center justify-between gap-4 mb-2">
                    <div class="flex items-center gap-2">
                        <button id="calendar-prev-btn" title="Previous" class="p-1 rounded-md bg-slate-700 hover:bg-slate-600 transition"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
                        <button id="calendar-next-btn" title="Next" class="p-1 rounded-md bg-slate-700 hover:bg-slate-600 transition"><i data-lucide="chevron-right" class="w-5 h-5"></i></button>
                        <span class="text-center font-semibold text-white">${title}</span>
                    </div>
                    <div class="flex items-center bg-slate-700 rounded-lg p-1 space-x-1">
                        <button data-view="day" class="calendar-view-btn px-3 py-1 text-xs font-semibold rounded-md transition ${state.calendarView === 'day' ? 'bg-blue-600 text-white' : 'text-slate-300'}">Day</button>
                        <button data-view="week" class="calendar-view-btn px-3 py-1 text-xs font-semibold rounded-md transition ${state.calendarView === 'week' ? 'bg-blue-600 text-white' : 'text-slate-300'}">Week</button>
                        <button data-view="month" class="calendar-view-btn px-3 py-1 text-xs font-semibold rounded-md transition ${state.calendarView === 'month' ? 'bg-blue-600 text-white' : 'text-slate-300'}">Month</button>
                    </div>
                </div>
                <div class="overflow-x-auto">${gridHtml}</div>
            </div>
        `;
    }

    function renderMonthView() {
        const date = state.currentDate;
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const times = ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM'];

        let table = '<table class="w-full text-center text-xs calendar-grid"><thead><tr><th class="p-1"></th>';
        for (let day = 1; day <= daysInMonth; day++) {
             const d = new Date(year, month, day);
             const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
             table += `<th class="p-1 font-mono text-slate-400">${day}<br>${dayName}</th>`;
        }
        table += '</tr></thead><tbody>';
        times.forEach(time => {
            table += `<tr><td class="p-1 text-slate-400 text-xxs whitespace-nowrap">${time}</td>`;
            for (let day = 1; day <= daysInMonth; day++) {
                table += renderSlotCell(new Date(year, month, day), time);
            }
            table += '</tr>';
        });
        table += '</tbody></table>';
        return table;
    }

    function renderWeekView() {
        const startOfWeek = new Date(state.currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start on Sunday
        const times = ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM'];
        
        let table = '<table class="w-full text-center text-xs calendar-grid"><thead><tr><th class="p-1"></th>';
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            table += `<th class="p-2 font-mono text-slate-400">${day.getDate()}<br>${dayName}</th>`;
        }
        table += '</tr></thead><tbody>';
        times.forEach(time => {
            table += `<tr><td class="p-2 text-slate-400 whitespace-nowrap">${time}</td>`;
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(day.getDate() + i);
                table += renderSlotCell(day, time, 'h-10');
            }
            table += '</tr>';
        });
        table += '</tbody></table>';
        return table;
    }

    function renderDayView() {
        const day = state.currentDate;
        const times = ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM'];
        
        let list = '<ul class="space-y-1 calendar-grid">';
        times.forEach(time => {
            const status = getSlotStatus(day, time);
            list += `
                <li data-date="${day.toISOString().split('T')[0]}" data-time="${time}" 
                    class="p-3 rounded-md flex justify-between items-center text-white ${status.cellClass}">
                    <span>${time}</span>
                    <span class="text-sm font-semibold">${status.label}</span>
                </li>
            `;
        });
        list += '</ul>';
        return list;
    }

    function renderSlotCell(date, time, heightClass = 'h-6') {
        const { cellClass } = getSlotStatus(date, time);
        return `<td class="p-0"><div data-date="${date.toISOString().split('T')[0]}" data-time="${time}" class="w-full ${heightClass} border border-slate-800 ${cellClass}"></div></td>`;
    }
    
    function renderTimeCheckboxes() {
        const timeSlots = [
            { time: '09:30 AM', period: 'forenoon' }, { time: '10:30 AM', period: 'forenoon' },
            { time: '11:30 AM', period: 'forenoon' }, { time: '12:30 PM', period: 'forenoon' },
            { time: '01:30 PM', period: 'afternoon' }, { time: '02:30 PM', period: 'afternoon' },
            { time: '03:30 PM', period: 'afternoon' }, { time: '04:30 PM', period: 'afternoon' }
        ];
        
        const { fromDate, toDate } = getSelectedDateRange(true);
        const from = new Date(fromDate + 'T00:00:00');
        const to = new Date(toDate + 'T00:00:00');
        const checkboxClasses = "time-slot-checkbox form-checkbox h-4 w-4 bg-slate-800 text-blue-500 border-slate-600 rounded focus:ring-blue-500 mr-2";

        return timeSlots.map(slot => {
            let isChecked = false;
            if(fromDate && toDate && from <= to) {
                 isChecked = true;
                 for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                    if (!state.selectedSlots.some(s => s.date === d.toISOString().split('T')[0] && s.time === slot.time)) {
                        isChecked = false;
                        break;
                    }
                }
            }
            
            return `<label class="flex items-center text-slate-300">
                      <input type="checkbox" data-time="${slot.time}" data-period="${slot.period}" ${isChecked ? 'checked' : ''} class="${checkboxClasses}">
                      ${slot.time.replace(' AM', 'am').replace(' PM', 'pm')}
                    </label>`;
        }).join('');
    }

    function renderSelectedSlotsPills() {
        if (state.selectedSlots.length === 0) {
            return '<p class="text-slate-500 text-sm">No slots selected.</p>';
        }
        return state.selectedSlots
            .sort((a,b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time))
            .map(slot => {
                const date = new Date(slot.date + 'T00:00:00');
                const formattedDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                return `
                <div class="pill bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5">
                    <span>${formattedDate}, ${slot.time}</span>
                    <button data-date="${slot.date}" data-time="${slot.time}" class="remove-pill-btn text-blue-200 hover:text-white">
                        <i data-lucide="x" class="w-3 h-3 pointer-events-none"></i>
                    </button>
                </div>
            `}).join('');
    }

    // --- LOGIC & HELPERS ---
    function getSlotStatus(date, time) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const slotDate = new Date(date); slotDate.setHours(0, 0, 0, 0);
        const slotId = { date: slotDate.toISOString().split('T')[0], time: time };
        
        if (slotDate < today) return { label: 'Past', cellClass: 'bg-gray-700/50 cursor-not-allowed' };
        if (state.selectedSlots.some(s => s.date === slotId.date && s.time === slotId.time)) {
             return { label: 'Selected', cellClass: 'bg-cyan-500/80 cursor-pointer hover:bg-cyan-400/80' };
        }
        const booking = state.availabilityData.find(b => {
             const bookingDate = new Date(b.year, b.month - 1, b.day); // Month is 1-based in data
             bookingDate.setHours(0,0,0,0);
             return bookingDate.getTime() === slotDate.getTime() && b.time === time;
        });

        if (booking) {
             if (booking.status === 'Booked') return { label: 'Booked', cellClass: 'bg-red-600/80 cursor-not-allowed' };
             if (booking.status === 'Pending') return { label: 'Pending', cellClass: 'bg-yellow-500/80 cursor-not-allowed' };
        }
        return { label: 'Available', cellClass: 'bg-green-500/80 cursor-pointer hover:bg-green-400/80' };
    }

    function getCalendarTitle() {
        const date = state.currentDate;
        switch(state.calendarView) {
            case 'day': return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            case 'week':
                const start = new Date(date); start.setDate(start.getDate() - start.getDay());
                const end = new Date(start); end.setDate(end.getDate() + 6);
                return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            default: return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    }
    
    function getSelectedDateRange(useInputs = false) {
        let fromDate, toDate;
        if (useInputs) {
            fromDate = document.getElementById('from-date-input')?.value;
            toDate = document.getElementById('to-date-input')?.value;
        } else if (state.selectedSlots.length > 0) {
            const dates = state.selectedSlots.map(s => s.date);
            dates.sort();
            fromDate = dates[0];
            toDate = dates[dates.length - 1];
        }
        return { fromDate: fromDate || '', toDate: toDate || '' };
    }
    
    function updateDateInputs() {
        const { fromDate, toDate } = getSelectedDateRange();
        const fromInput = document.getElementById('from-date-input');
        const toInput = document.getElementById('to-date-input');
        if (fromInput) fromInput.value = fromDate;
        if (toInput) toInput.value = toDate;
    }
    
    function toggleSlot(date, time) {
        const slotIdentifier = { date, time };
        const index = state.selectedSlots.findIndex(s => s.date === date && s.time === time);
        if (index > -1) {
            state.selectedSlots.splice(index, 1);
        } else {
            state.selectedSlots.push(slotIdentifier);
        }
    }
    
    // --- EVENT HANDLERS ---
    function setupEventHandlers() {
        const container = document.getElementById('final-booking-form-content');
        if (!container) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        container.addEventListener('click', e => {
            const slotEl = e.target.closest('[data-date][data-time]');
            if (slotEl && !slotEl.classList.contains('cursor-not-allowed')) {
                toggleSlot(slotEl.dataset.date, slotEl.dataset.time);
                updateUI();
                saveStateToSession();
                return;
            }
            
            const viewBtn = e.target.closest('.calendar-view-btn');
            if (viewBtn) { state.calendarView = viewBtn.dataset.view; updateUI(); saveStateToSession(); return; }

            const navBtn = e.target.closest('#calendar-prev-btn, #calendar-next-btn');
            if (navBtn) {
                const dir = navBtn.id === 'calendar-prev-btn' ? -1 : 1;
                if (state.calendarView === 'day') state.currentDate.setDate(state.currentDate.getDate() + dir);
                else if (state.calendarView === 'week') state.currentDate.setDate(state.currentDate.getDate() + (7 * dir));
                else state.currentDate.setMonth(state.currentDate.getMonth() + dir);
                updateUI(); saveStateToSession(); return;
            }

            const periodBtn = e.target.closest('#forenoon-btn, #afternoon-btn');
            if (periodBtn) {
                const period = periodBtn.id === 'forenoon-btn' ? 'forenoon' : 'afternoon';
                const checkboxes = document.querySelectorAll(`.time-slot-checkbox[data-period="${period}"]`);
                checkboxes.forEach(cb => {
                    if (!cb.checked) {
                        cb.click(); // Programmatically click to trigger change event
                    }
                });
            }
            
            const removePillBtn = e.target.closest('.remove-pill-btn');
            if(removePillBtn) {
                toggleSlot(removePillBtn.dataset.date, removePillBtn.dataset.time);
                updateUI();
                saveStateToSession();
            }

        }, { signal });
        
        container.addEventListener('change', e => {
             if (e.target.matches('.time-slot-checkbox')) {
                const time = e.target.dataset.time;
                const { fromDate, toDate } = getSelectedDateRange(true);
                if (!fromDate || !toDate) { 
                    alert('Please select a "From" and "To" date first.'); 
                    e.target.checked = !e.target.checked;
                    return;
                }
                for (let d = new Date(fromDate); d <= new Date(toDate); d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    const index = state.selectedSlots.findIndex(s => s.date === dateStr && s.time === time);
                    if(e.target.checked && index === -1) { state.selectedSlots.push({ date: dateStr, time: time }); }
                    else if (!e.target.checked && index > -1) { state.selectedSlots.splice(index, 1); }
                }
                updateUI(); saveStateToSession();
             }
        }, { signal });
        
        document.getElementById('confirm-booking-final-btn')?.addEventListener('click', () => {
            if (state.selectedSlots.length === 0) { 
                alert('Please select at least one time slot.'); 
                return; 
            }
            
            const purpose = document.getElementById('booking-purpose-final').value;
            const course = document.getElementById('course-title-final').value;
            const department = document.getElementById('department-select').value;
            
            if (!purpose || !course) {
                alert('Please fill in the Purpose and Course/Event Title fields.');
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const bookingId = `BK-${today.replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

            const { fromDate, toDate } = getSelectedDateRange();
            const sortedSlots = state.selectedSlots.sort((a,b) => a.time.localeCompare(b.time));
            const firstSlotTime = sortedSlots[0]?.time;
            const lastSlotTime = sortedSlots[sortedSlots.length - 1]?.time;
            
            const bookingRecord = {
                bookedOn: today,
                bookingId: bookingId,
                hallName: state.hall.name,
                hallCode: state.hall.id,
                department: department,
                purpose: purpose,
                course: course,
                dateTime: `${fromDate} to ${toDate}\n${firstSlotTime} - ${lastSlotTime}`,
                status: 'Pending'
            };

            const availabilityRecords = state.selectedSlots.map(slot => {
                const d = new Date(slot.date + 'T00:00:00');
                return {
                    hallId: state.hall.id,
                    year: d.getFullYear(),
                    month: d.getMonth() + 1, // month is 0-indexed in JS Date, but data expects 1-based
                    day: d.getDate(),
                    time: slot.time,
                    status: 'Pending'
                };
            });

            AppData.addIndividualBooking({ bookingRecord, availabilityRecords });
            
            alert(`Booking request submitted successfully!\nID: ${bookingId}`);
            cleanup(); 
            window.location.hash = '#my-bookings-view';
        }, { signal });
    }

    async function initialize(hallId) {
        let hall = null;
        const savedHallJSON = sessionStorage.getItem('finalBookingHall');
        if (savedHallJSON) {
            hall = JSON.parse(savedHallJSON);
            state.selectedSlots = JSON.parse(sessionStorage.getItem('finalBookingSlots') || '[]').map(s => ({
                date: new Date(s.year, s.month, s.day).toISOString().split('T')[0],
                time: s.time
            }));
        } else if (hallId) {
            const allHalls = await AppData.fetchBookingHalls();
            const flatHalls = Object.values(allHalls).flat(Infinity);
            hall = flatHalls.find(h => h.id === hallId);
            state.selectedSlots = [];
        }
        
        if (hall) {
            state.hall = hall;
            const [availability, schools] = await Promise.all([
                AppData.fetchHallAvailability(),
                AppData.getSchools()
            ]);
            state.availabilityData = availability;
            state.allSchools = schools;

            loadStateFromSession();
            render();
        } else {
            const contentDiv = document.getElementById('final-booking-form-content');
            if(contentDiv) contentDiv.innerHTML = `<div class="text-center py-10"><h2 class="text-xl font-bold text-red-400">Booking Session Expired or Hall Not Found</h2><p class="text-slate-400 mt-2">Please go back and start the booking process again.</p></div>`;
        }
    }
    
    function cleanup() {
        if(abortController) abortController.abort();
        if(state.hall) sessionStorage.removeItem(SESSION_STORAGE_KEY_FORM + `_${state.hall.id}`);
        sessionStorage.removeItem('finalBookingSlots');
        sessionStorage.removeItem('finalBookingAvailability');
        sessionStorage.removeItem('finalBookingHall');
        state = { hall: null, availabilityData: [], selectedSlots: [], currentDate: new Date(), calendarView: 'month', allSchools: {} };
    }

    return { initialize, cleanup };
})();
