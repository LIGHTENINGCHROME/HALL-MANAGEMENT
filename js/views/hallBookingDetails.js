// HallBooking/js/views/hallBookingDetails.js

window.HallBookingDetailsView = (function() {
    let state = {
        currentHall: null,
        currentHallId: null,
        currentDate: new Date(),
        availabilityData: [],
        selectedSlots: [], 
    };
    let abortController;
    
    const STORAGE_KEY_PREFIX = 'hallBookingDetails_';
    const FINAL_BOOKING_SLOTS = 'finalBookingSlots';
    const FINAL_BOOKING_AVAILABILITY = 'finalBookingAvailability';
    const FINAL_BOOKING_HALL = 'finalBookingHall';

    function saveStateToSession() {
        if (!state.currentHallId) return;
        const key = STORAGE_KEY_PREFIX + state.currentHallId;
        const stateToSave = {
            selectedSlots: state.selectedSlots,
            currentDate: state.currentDate.toISOString()
        };
        sessionStorage.setItem(key, JSON.stringify(stateToSave));
    }

    function loadStateFromSession() {
        if (!state.currentHallId) return;
        const key = STORAGE_KEY_PREFIX + state.currentHallId;
        const savedState = sessionStorage.getItem(key);
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            state.selectedSlots = parsedState.selectedSlots || [];
            state.currentDate = new Date(parsedState.currentDate);
        }
    }

    function renderHallDetails(hall) {
        const detailsContainer = document.getElementById('booking-hall-details');
        const featuresContainer = document.getElementById('booking-hall-features');
        const inchargeContainer = document.getElementById('booking-hall-incharge');

        if (!detailsContainer || !featuresContainer || !inchargeContainer || !hall) return;

        detailsContainer.innerHTML = `
            <h3 class="text-lg font-bold text-blue-300 mb-2">Hall Details</h3>
            <p class="font-semibold text-white">${hall.name || 'N/A'}</p>
            <p class="text-sm text-slate-300">${hall.location || 'N/A'}</p>
            <p class="text-sm text-slate-400 mt-2">Capacity: ${hall.capacity || 'N/A'}</p>
            <p class="text-sm text-slate-400">Floor: ${hall.floor || 'N/A'}</p>
            <p class="text-sm text-slate-400">Zone: ${hall.zone || 'N/A'}</p>
        `;

        const featuresList = hall.features && hall.features.length > 0
            ? hall.features.map(f => `<li class="flex items-center text-slate-300"><i data-lucide="check" class="w-4 h-4 mr-2 text-green-400"></i>${f}</li>`).join('')
            : '<li class="text-slate-400">No features listed.</li>';
        featuresContainer.innerHTML = `
            <h3 class="text-lg font-bold text-green-300 mb-2">Features</h3>
            <ul class="space-y-1">${featuresList}</ul>
        `;

        const incharge = hall.incharge || {};
        inchargeContainer.innerHTML = `
            <h3 class="text-lg font-bold text-yellow-300 mb-2">In-Charge Details</h3>
            <p class="text-sm text-slate-300"><span class="font-semibold text-white">Name:</span> ${incharge.name || 'N/A'}</p>
            <p class="text-sm text-slate-300"><span class="font-semibold text-white">Designation:</span> ${incharge.designation || 'N/A'}</p>
            <p class="text-sm text-slate-300"><span class="font-semibold text-white">Email:</span> ${incharge.email || 'N/A'}</p>
            <p class="text-sm text-slate-300"><span class="font-semibold text-white">Intercom:</span> ${incharge.intercom || 'N/A'}</p>
        `;

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function getSlotStatus(year, month, day, time) {
        const isSelected = state.selectedSlots.some(s => s.year === year && s.month === month && s.day === day && s.time === time);
        if (isSelected) return 'Selected';
        
        const booking = state.availabilityData.find(b =>
            b.hallId === state.currentHallId && b.year === year && b.month === month && b.day === day && b.time === time
        );
        return booking ? booking.status : 'Available';
    }

    function updateBookingButtonState() {
        const bookBtn = document.getElementById('confirm-booking-btn');
        if (!bookBtn) return;
        const count = state.selectedSlots.length;

        if (count > 0) {
            bookBtn.textContent = `Book (${count} Slot${count > 1 ? 's' : ''} Selected)`;
        } else {
            bookBtn.textContent = 'Book';
        }
        
        // The button is now always enabled.
        bookBtn.disabled = false;
        bookBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    function renderBookingGrid() {
        const gridContainer = document.getElementById('booking-calendar-grid');
        const monthYearTitle = document.getElementById('current-month-year');
        if (!gridContainer || !monthYearTitle) return;

        const year = state.currentDate.getFullYear();
        const month = state.currentDate.getMonth();
        monthYearTitle.textContent = state.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const times = ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM'];
        
        let gridHtml = '<table class="min-w-full text-center text-xs"><thead><tr><th class="p-1"></th>';
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const weekendClass = isWeekend ? 'weekend-header' : '';
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            gridHtml += `<th class="p-1 text-slate-300 ${weekendClass}">${day}<br>${dayName}</th>`;
        }
        gridHtml += '</tr></thead><tbody>';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        times.forEach(time => {
            gridHtml += `<tr><td class="p-1 text-slate-300 font-semibold align-middle">${time}</td>`;
            for (let day = 1; day <= daysInMonth; day++) {
                const currentSlotDate = new Date(year, month, day);
                const dayOfWeek = currentSlotDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const weekendClass = isWeekend ? 'weekend-cell' : '';

                let status = (currentSlotDate < today) ? 'Past' : getSlotStatus(year, month, day, time);
                let cellClass = '';
                let dataAttrs = `data-year="${year}" data-month="${month}" data-day="${day}" data-time="${time}"`;

                switch (status) {
                    case 'Past':    cellClass = 'bg-gray-700/50 cursor-not-allowed'; break;
                    case 'Booked':  cellClass = 'bg-red-600/80 cursor-not-allowed'; break;
                    case 'Pending': cellClass = 'bg-yellow-500/80 cursor-not-allowed'; break;
                    case 'Selected':cellClass = 'bg-cyan-500/80 cursor-pointer hover:bg-cyan-400/80'; break;
                    default:        cellClass = 'bg-green-500/80 cursor-pointer hover:bg-green-400/80'; break;
                }
                
                gridHtml += `<td class="p-0 ${weekendClass}"><div class="w-full h-6 border border-slate-700 ${cellClass}" ${dataAttrs}></div></td>`;
            }
            gridHtml += '</tr>';
        });
        gridHtml += '</tbody></table>';
        gridContainer.innerHTML = gridHtml;
        updateBookingButtonState();
    }
    
    function handleSlotClick(e) {
        const cell = e.target.closest('[data-time]');
        if (!cell || cell.classList.contains('bg-red-600/80') || cell.classList.contains('bg-yellow-500/80') || cell.classList.contains('bg-gray-700/50')) {
            return;
        }

        const slot = {
            year: parseInt(cell.dataset.year),
            month: parseInt(cell.dataset.month),
            day: parseInt(cell.dataset.day),
            time: cell.dataset.time,
        };
        
        const index = state.selectedSlots.findIndex(s => s.year === slot.year && s.month === slot.month && s.day === slot.day && s.time === slot.time);

        if (index > -1) {
            state.selectedSlots.splice(index, 1);
        } else {
            state.selectedSlots.push(slot);
        }
        renderBookingGrid();
        saveStateToSession();
    }

    function changeMonth(offset) {
        state.currentDate.setMonth(state.currentDate.getMonth() + offset);
        renderBookingGrid();
        saveStateToSession();
    }

    function setupEventHandlers() {
        if (abortController) { abortController.abort(); }
        abortController = new AbortController();
        const { signal } = abortController;
        
        document.getElementById('prev-month-btn')?.addEventListener('click', () => changeMonth(-1), { signal });
        document.getElementById('next-month-btn')?.addEventListener('click', () => changeMonth(1), { signal });
        document.getElementById('booking-calendar-grid')?.addEventListener('click', handleSlotClick, { signal });
        
        document.getElementById('confirm-booking-btn')?.addEventListener('click', () => {
            sessionStorage.setItem(FINAL_BOOKING_HALL, JSON.stringify(state.currentHall));
            sessionStorage.setItem(FINAL_BOOKING_SLOTS, JSON.stringify(state.selectedSlots));
            const relevantAvailability = state.availabilityData.filter(d => d.hallId === state.currentHallId);
            sessionStorage.setItem(FINAL_BOOKING_AVAILABILITY, JSON.stringify(relevantAvailability));
            
            sessionStorage.removeItem(STORAGE_KEY_PREFIX + state.currentHallId);

            window.location.hash = `#final-booking-form-view`;
        }, { signal });
    }

    function cleanup() {
        if (abortController) {
            abortController.abort();
        }
    }

    async function initialize(hallId) {
        state = {
            currentHall: null,
            currentHallId: hallId,
            currentDate: new Date(),
            availabilityData: [],
            selectedSlots: [],
        };
        
        loadStateFromSession();

        try {
            const [allHalls, availability] = await Promise.all([AppData.fetchBookingHalls(), AppData.fetchHallAvailability()]);
            state.availabilityData = availability;
            const flattenedHalls = Object.values(allHalls).flatMap(group => Array.isArray(group) ? group : Object.values(group)).flat(Infinity);
            const hall = flattenedHalls.find(h => h.id === hallId);
            
            if (hall) {
                state.currentHall = hall;
                renderHallDetails(hall);
                renderBookingGrid();
                setupEventHandlers();
            } else {
                const container = document.getElementById('hall-booking-details-view').querySelector('.bg-slate-800\\/50');
                if (container) {
                    container.innerHTML = `<p class="text-center text-red-400 py-20">Error: Hall details could not be loaded. Please go back and try again.</p>`;
                }
            }
        } catch (error) {
            console.error('Error initializing hall booking details view:', error);
        }
    }

    return { initialize, cleanup };
})();