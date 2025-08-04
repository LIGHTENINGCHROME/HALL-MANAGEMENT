// HallBooking/js/views/semesterBooking.js

// Semester Booking View Module
window.SemesterBookingView = (function() {
    // --- CONSTANTS ---
    const PERIOD_TIMES = {
        1: '09:30-10:30', 2: '10:30-11:30', 3: '11:30-12:30', 4: '12:30-01:30',
        5: '01:30-02:30', 6: '02:30-03:30', 7: '03:30-04:30', 8: '04:30-05:30'
    };
    const SESSION_STORAGE_KEY = 'semesterBookingState';

    // --- STATE MANAGEMENT ---
    let state = {
        semesterHallsData: {},
        employeeData: [],
        selectedHallId: null,
        hallStates: {}, // Stores state for each hall: { hallId: { selectedSlots, formDetails } }
    };
    let abortController;

    // --- State Persistence Functions ---
    function saveStateToSession() {
        if (!state.selectedHallId) return;

        const currentHallState = state.hallStates[state.selectedHallId] || { selectedSlots: [], formDetails: {} };
        
        currentHallState.formDetails = {
            startDate: document.getElementById('start-date')?.value,
            endDate: document.getElementById('end-date')?.value,
            purpose: document.getElementById('booking-purpose')?.value,
            title: document.getElementById('course-title')?.value,
            faculty: document.getElementById('faculty-select')?.value,
        };
        state.hallStates[state.selectedHallId] = currentHallState;

        const stateToSave = {
            selectedHallId: state.selectedHallId,
            hallStates: state.hallStates
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
    }

    function loadStateFromSession() {
        const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            state.selectedHallId = parsedState.selectedHallId;
            state.hallStates = parsedState.hallStates || {};
        }
    }
    
    function clearCurrentHallState() {
        const hallId = state.selectedHallId;
        if (hallId && state.hallStates[hallId]) {
            state.hallStates[hallId] = { selectedSlots: [], formDetails: {} };
        }
        renderBookingPanel();
        saveStateToSession();
    }

    function renderSemesterHalls(data) {
        const container = document.getElementById('semester-halls-container');
        if (!container) return;

        const hallsHtml = Object.entries(data).map(([groupName, halls]) => `
            <div>
                <h2 class="text-xl font-bold text-blue-400 mb-3">${groupName}</h2>
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    ${halls.map(hall => {
                        const isActive = hall.id === state.selectedHallId ? 'active' : '';
                        return `
                        <div data-hall-id="${hall.id}" class="semester-hall-card ${isActive} bg-slate-900/50 p-3 rounded-lg border border-slate-700 hover:border-blue-500 transition flex flex-col justify-between">
                            <div class="cursor-pointer">
                                <p class="font-semibold text-white">${hall.name}</p>
                                <p class="text-sm text-slate-400">Capacity: ${hall.capacity}</p>
                            </div>
                            <div class="mt-3 text-right">
                                <button data-action="view-semester-hall-details" data-hall-id="${hall.id}" class="px-3 py-1 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-md transition">
                                    View Details
                                </button>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = hallsHtml;
    }

    function renderBookingPanel() {
        const container = document.getElementById('booking-panel-container');
        if (!container) return;

        const selectedHall = findHallById(state.selectedHallId);
        const currentHallState = state.hallStates[state.selectedHallId] || { selectedSlots: [], formDetails: {} };

        if (!selectedHall) {
            container.innerHTML = `<div class="flex items-center justify-center h-full"><p class="text-center text-slate-400">Please click a hall's title from the left to begin booking.</p></div>`;
            return;
        }

        const panelHtml = `
            <h2 class="text-2xl font-bold text-white mb-4">Book a Slot in: <span class="text-blue-400">${selectedHall.name}</span></h2>
            <div class="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-2">
                <div class="flex flex-col lg:col-span-7">
                    <h3 class="text-lg font-semibold text-slate-300 mb-2">1. Select Available Slots</h3>
                    <div id="interactive-timetable" class="overflow-x-auto">${renderInteractiveTimetable(selectedHall, currentHallState.selectedSlots)}</div>
                    <div class="mt-4">
                        <h4 class="font-semibold text-slate-300 mb-2">Selected Slots:</h4>
                        <div class="selected-slots-container">
                            <div id="selected-slots-summary" class="flex flex-wrap gap-2">
                                ${renderSelectedSlotsSummary(currentHallState.selectedSlots)}
                            </div>
                        </div>
                    </div>
                </div>
                <div id="booking-form-section" class="lg:col-span-5">
                    ${renderBookingForm()}
                </div>
            </div>
        `;
        container.innerHTML = panelHtml;
        setupBookingPanelHandlers();
    }

    function renderInteractiveTimetable(hall, selectedSlots) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const periods = Object.keys(PERIOD_TIMES).map(Number);
        
        let tableHTML = `<table class="w-full text-center"><thead><tr><th class="p-2 border border-slate-700 align-bottom">Day</th>`;
        periods.forEach(p => {
            tableHTML += `<th class="p-2 border border-slate-700 timetable-header-cell">
                            <div>${p}</div>
                            <div class="text-xs font-normal text-slate-400">${PERIOD_TIMES[p]}</div>
                         </th>`;
        });
        tableHTML += `</tr></thead><tbody>`;

        days.forEach(day => {
            tableHTML += `<tr><td class="p-2 border border-slate-700 font-semibold">${day}</td>`;
            periods.forEach(period => {
                const courseCode = hall.timetable[day]?.[period];
                const isBooked = !!courseCode;
                const isSelected = selectedSlots.some(s => s.day === day && s.period === period);
                
                let cellClass = 'timetable-slot ';
                let title = '';

                if (isBooked) {
                    cellClass += 'booked';
                    title = `title="Booked: ${courseCode}"`;
                } else {
                    cellClass += isSelected ? 'selected' : 'available';
                }
                
                tableHTML += `<td class="p-1 border border-slate-700 ${cellClass}" data-day="${day}" data-period="${period}" ${title}>${isBooked ? courseCode : ''}</td>`;
            });
            tableHTML += `</tr>`;
        });

        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function renderSelectedSlotsSummary(selectedSlots) {
        if (selectedSlots.length === 0) {
            return '<p class="text-slate-500 text-sm p-2">No slots selected.</p>';
        }
        return selectedSlots.map(s => `
            <div class="selected-slot-pill bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2">
                <span>${s.day}, P${s.period} (${PERIOD_TIMES[s.period]})</span>
                <button data-day="${s.day}" data-period="${s.period}" class="remove-slot-btn text-sky-200 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-4 h-4 pointer-events-none"></i>
                </button>
            </div>
        `).join('');
    }

    function renderBookingForm() {
        const inputClasses = "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white";
        return `
            <div class="space-y-4">
                <div>
                    <h3 class="text-lg font-semibold text-slate-300 mb-2">2. Enter Booking Details</h3>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="start-date" class="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                        <input type="date" id="start-date" class="${inputClasses}">
                    </div>
                    <div>
                        <label for="end-date" class="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                        <input type="date" id="end-date" class="${inputClasses}">
                    </div>
                </div>
                 <div>
                    <label for="booking-purpose" class="block text-sm font-medium text-slate-300 mb-1">Booking Purpose</label>
                    <select id="booking-purpose" class="${inputClasses}">
                        <option>Class</option><option>Seminar</option><option>Workshop</option><option>Meeting</option>
                    </select>
                </div>
                 <div>
                    <label for="course-title" class="block text-sm font-medium text-slate-300 mb-1">Course / Event Title</label>
                    <input type="text" id="course-title" class="${inputClasses}" placeholder="e.g., Advanced Algorithms">
                </div>
                <div>
                    <label for="faculty-select-input" class="block text-sm font-medium text-slate-300 mb-1">Faculty / Organizer</label>
                    <div class="relative">
                        <input type="text" id="faculty-select-input" class="${inputClasses}" placeholder="Search for a faculty member...">
                        <div id="faculty-select-options" class="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 hidden max-h-60 overflow-y-auto"></div>
                    </div>
                    <input type="hidden" id="faculty-select">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-300 mb-1">Faculty Department</label>
                    <input type="text" id="faculty-dept" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-400" readonly>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-300 mb-1">Faculty Email</label>
                    <input type="text" id="faculty-email" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-400" readonly>
                </div>
                <div class="flex gap-4 pt-4">
                     <button id="clear-selection-btn" class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition">Clear</button>
                     <button id="submit-booking-btn" class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">Submit</button>
                </div>
            </div>
        `;
    }
    
    function populateFacultyDropdown(searchTerm = '') {
        const optionsContainer = document.getElementById('faculty-select-options');
        if (!optionsContainer) return;

        const filteredEmployees = state.employeeData.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredEmployees.length === 0) {
            optionsContainer.innerHTML = `<div class="p-2 text-slate-400">No results found</div>`;
            return;
        }

        optionsContainer.innerHTML = filteredEmployees.map(emp => 
            `<div class="p-2 cursor-pointer hover:bg-slate-700" data-value="${emp.email}" data-name="${emp.name}">${emp.name}</div>`
        ).join('');
    }

    function handleHallClick(e) {
        const card = e.target.closest('.semester-hall-card');
        if (!card || e.target.closest('button')) return;
        
        state.selectedHallId = card.dataset.hallId;

        document.querySelectorAll('.semester-hall-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        renderBookingPanel();
        saveStateToSession();
    }

    function handleTimetableClick(e) {
        const slot = e.target.closest('.timetable-slot.available, .timetable-slot.selected');
        if (!slot) return;
        
        const day = slot.dataset.day;
        const period = parseInt(slot.dataset.period, 10);

        if (day && !isNaN(period)) {
            toggleSlotSelection(day, period);
        }
    }

    function handleRemoveSlot(e) {
        const removeBtn = e.target.closest('.remove-slot-btn');
        if (!removeBtn) return;
        const day = removeBtn.dataset.day;
        const period = parseInt(removeBtn.dataset.period, 10);
        toggleSlotSelection(day, period);
    }
    
    function toggleSlotSelection(day, period) {
        const hallId = state.selectedHallId;
        if (!hallId) return;

        if (!state.hallStates[hallId]) {
            state.hallStates[hallId] = { selectedSlots: [], formDetails: {} };
        }
        const currentHallSlots = state.hallStates[hallId].selectedSlots;
        
        const index = currentHallSlots.findIndex(s => s.day === day && s.period === period);
        
        if (index > -1) {
            currentHallSlots.splice(index, 1);
        } else {
            currentHallSlots.push({ day, period });
        }
        
        saveStateToSession();
        renderBookingPanel();
    }

    function handleFacultyChange(selectedEmail) {
        const deptInput = document.getElementById('faculty-dept');
        const emailInput = document.getElementById('faculty-email');
        if (selectedEmail) {
            const faculty = state.employeeData.find(emp => emp.email === selectedEmail);
            if(faculty) {
                deptInput.value = faculty.department;
                emailInput.value = faculty.email;
            }
        } else {
            deptInput.value = '';
            emailInput.value = '';
        }
        saveStateToSession();
    }
    
    // --- MODIFIED: Final Booking Submission ---
    function handleSubmit() {
        const hallId = state.selectedHallId;
        if (!hallId) { alert('Please select a hall.'); return; }

        const selectedHall = findHallById(hallId);
        const currentHallState = state.hallStates[hallId];
        const formDetails = currentHallState.formDetails;

        if (!selectedHall || currentHallState.selectedSlots.length === 0) {
            alert('Please select a hall and at least one time slot.'); return;
        }
        if (!formDetails.startDate || !formDetails.endDate) {
            alert('Please select a valid start and end date.'); return;
        }
        if (new Date(formDetails.startDate) > new Date(formDetails.endDate)) {
            alert('The start date cannot be after the end date.'); return;
        }
        if (!formDetails.title || !formDetails.faculty) {
            alert('Please enter a Course/Event Title and select a Faculty/Organizer.'); return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const bookingId = `BK-${today.replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        const facultyMember = state.employeeData.find(e => e.email === formDetails.faculty);

        const bookingRecord = {
            bookedOn: today,
            bookingId: bookingId,
            hallName: selectedHall.name,
            hallCode: selectedHall.id,
            department: facultyMember.department,
            purpose: formDetails.purpose,
            course: formDetails.title,
            dateTime: `Semester: ${formDetails.startDate} to ${formDetails.endDate}`,
            status: 'Approved', // Semester bookings are auto-approved in this mock
            isSemester: true,
            bookedBy: facultyMember.name,
            bookedByDept: facultyMember.department,
            phone: facultyMember.phone,
            email: facultyMember.email
        };

        const courseCode = formDetails.title.replace(/\s/g, '_').toUpperCase().substring(0, 8);

        AppData.addSemesterBooking({
            hallId: hallId,
            slotsToBook: currentHallState.selectedSlots,
            courseCode: courseCode,
            bookingRecord: bookingRecord
        });

        alert(`Semester booking submitted successfully for ${formDetails.title}!\nID: ${bookingId}`);
        clearCurrentHallState();
    }

    function setupEventHandlers() {
        if (abortController) { abortController.abort(); }
        abortController = new AbortController();
        const { signal } = abortController;
        const hallsContainer = document.getElementById('semester-halls-panel');
        if (hallsContainer) {
            hallsContainer.addEventListener('click', handleHallClick, { signal });
        }
    }
    
    function setupBookingPanelHandlers() {
        const panel = document.getElementById('booking-panel-container');
        if(!panel) return;
        lucide.createIcons();
        
        const timetable = panel.querySelector('#interactive-timetable');
        const summary = panel.querySelector('#selected-slots-summary');
        const clearBtn = panel.querySelector('#clear-selection-btn');
        const submitBtn = panel.querySelector('#submit-booking-btn');

        if(timetable) timetable.addEventListener('click', handleTimetableClick);
        if(summary) summary.addEventListener('click', handleRemoveSlot);
        if(clearBtn) clearBtn.addEventListener('click', clearCurrentHallState);
        if(submitBtn) submitBtn.addEventListener('click', handleSubmit);

        // Dynamic Faculty Dropdown Logic
        const facultyInput = document.getElementById('faculty-select-input');
        const facultyOptions = document.getElementById('faculty-select-options');
        const facultyHidden = document.getElementById('faculty-select');

        if (facultyInput) {
            facultyInput.addEventListener('focus', () => {
                populateFacultyDropdown(facultyInput.value);
                facultyOptions.classList.remove('hidden');
            });
            facultyInput.addEventListener('blur', () => setTimeout(() => facultyOptions.classList.add('hidden'), 150));
            facultyInput.addEventListener('input', () => populateFacultyDropdown(facultyInput.value));
            facultyOptions.addEventListener('mousedown', (e) => {
                if (e.target.dataset.value) {
                    facultyHidden.value = e.target.dataset.value;
                    facultyInput.value = e.target.dataset.name;
                    facultyOptions.classList.add('hidden');
                    handleFacultyChange(facultyHidden.value);
                }
            });
        }
        
        // Restore form state
        const currentHallState = state.hallStates[state.selectedHallId] || { formDetails: {} };
        const savedDetails = currentHallState.formDetails;
        
        const startDateInput = document.getElementById('start-date');
        if (startDateInput) startDateInput.value = savedDetails.startDate || new Date().toISOString().split('T')[0];
        
        const endDateInput = document.getElementById('end-date');
        if (endDateInput) endDateInput.value = savedDetails.endDate || '';
        
        const purposeSelect = document.getElementById('booking-purpose');
        if (purposeSelect) purposeSelect.value = savedDetails.purpose || 'Class';
        
        const courseTitleInput = document.getElementById('course-title');
        if (courseTitleInput) courseTitleInput.value = savedDetails.title || '';
        
        if (facultyHidden && savedDetails.faculty) {
            facultyHidden.value = savedDetails.faculty;
            const selectedFaculty = state.employeeData.find(e => e.email === savedDetails.faculty);
            if (facultyInput && selectedFaculty) {
                facultyInput.value = selectedFaculty.name;
            }
            handleFacultyChange(savedDetails.faculty);
        }

        panel.querySelectorAll('#start-date, #end-date, #booking-purpose, #course-title')
             .forEach(el => el.addEventListener('change', saveStateToSession));
    }

    function findHallById(id) {
        if (!id) return null;
        return Object.values(state.semesterHallsData).flat().find(h => h.id === id);
    }

    function cleanup() {
        if (abortController) { 
            abortController.abort();
            console.log("Cleaned up SemesterBookingView listeners.");
        }
    }

    async function initialize() {
        try {
            loadStateFromSession();

            const [halls, employees] = await Promise.all([
                AppData.fetchSemesterHalls(), AppData.fetchEmployeeData()
            ]);
            state.semesterHallsData = halls;
            state.employeeData = employees;
            
            renderSemesterHalls(state.semesterHallsData);
            renderBookingPanel();
            setupEventHandlers();
        } catch (error) {
            console.error('Error loading semester booking view:', error);
        }
    }

    return { initialize, cleanup };
})();
