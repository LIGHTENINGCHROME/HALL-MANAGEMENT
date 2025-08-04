// HallBooking/js/data.js

// Mock Backend Data and Fetch Functions
window.AppData = (function() {
    // --- PERFORMANCE FIX: Caching Layer ---
    const cache = {};

    // --- Helper Data for Generation ---
    const schools = {
        "School of Engineering and Technology": ["Department of Computer Science", "Department of Electronics Engineering", "Department of Physics"],
        "School of Management": ["Department of Management Studies", "Department of Commerce", "Department of Tourism Studies"],
        "School of Humanities": ["Department of English", "Department of History", "Department of Sociology"],
        "School of Physical, Chemical and Applied Sciences": ["Department of Chemistry", "Department of Earth Sciences", "Department of Applied Psychology"],
        "School of Life Sciences": ["Department of Biochemistry & Molecular Biology", "Department of Food Science & Technology", "Department of Microbiology"]
    };

    const features = ['WiFi', 'AC', 'Smartboard', 'Projector', 'Audio System', 'Computer', 'Podium', 'Ramp', 'Video Conferencing', 'Blackboard'];
    const purposes = ['Class', 'Seminar', 'Workshop', 'Meeting', 'Guest Lecture', 'Cultural Event', 'Viva Voce', 'Ph.D. Defense'];

    // --- Mock Data Definitions ---

    let mockHallData = [
        { date: '2025-07-27', hallName: 'Lecture Hall', hallCode: 'SH 360', capacity: 120, floor: 'Second Floor', zone: 'South', school: 'School of Engineering and Technology', department: 'Department of Computer Science', features: 'WiFi, AC, Smartboard, Blackboard, Ramp', inchargeName: 'Dr. S. K. V. Jayakumar', inchargeRole: 'Head of Department', inchargeEmail: 'hodcspu@gmail.com', inchargePhone: '+9104132654990', status: true },
        { date: '2025-07-27', hallName: 'Lecture Hall', hallCode: 'SH 314', capacity: 60, floor: 'Second Floor', zone: 'South', school: 'School of Engineering and Technology', department: 'Department of Computer Science', features: 'WiFi, Projector, Smartboard, Blackboard', inchargeName: 'Dr. S. K. V. Jayakumar', inchargeRole: 'Head of Department', inchargeEmail: 'hodcspu@gmail.com', inchargePhone: '+9104132654990', status: true },
        { date: '2025-06-15', hallName: 'Management Auditorium', hallCode: 'MBA-AUDI', capacity: 250, floor: 'Ground Floor', zone: 'North', school: 'School of Management', department: 'Department of Management Studies', features: 'AC, Projector, Audio System, Podium', inchargeName: 'Dr. R. Venkatesan', inchargeRole: 'Dean', inchargeEmail: 'dean.mgmt@pondiuni.edu.in', inchargePhone: '+9104132654300', status: true },
        { date: '2025-05-20', hallName: 'Humanities Seminar Hall', hallCode: 'HUM-SEM-01', capacity: 80, floor: 'First Floor', zone: 'East', school: 'School of Humanities', department: 'Department of English', features: 'Projector, Audio System, Podium', inchargeName: 'Dr. Priya Krishnan', inchargeRole: 'Head of Department', inchargeEmail: 'hod.eng@pondiuni.edu.in', inchargePhone: '+9104132654500', status: true },
        { date: '2025-04-10', hallName: 'Earth Science Lab', hallCode: 'ES-LAB-G1', capacity: 40, floor: 'Ground Floor', zone: 'West', school: 'School of Physical, Chemical and Applied Sciences', department: 'Department of Earth Sciences', features: 'Projector, Computer, Blackboard', inchargeName: 'Dr. Anand Mohan', inchargeRole: 'Professor', inchargeEmail: 'anand.es@pondiuni.edu.in', inchargePhone: '+9104132654700', status: false },
        { date: '2025-08-01', hallName: 'Life Sciences LH-1', hallCode: 'LS-LH1', capacity: 100, floor: 'First Floor', zone: 'South', school: 'School of Life Sciences', department: 'Department of Microbiology', features: 'Smartboard, Projector', inchargeName: 'Dr. Geetha M', inchargeRole: 'Head of Department', inchargeEmail: 'hod.micro@pondiuni.edu.in', inchargePhone: '+9104132654800', status: true },
    ];

    let mockArchivedHallData = [
         { date: '2024-05-10', hallName: 'Old Physics Lab', hallCode: 'PHY-02', capacity: 40, floor: 'Ground Floor', zone: 'West', school: 'School of Physical, Chemical and Applied Sciences', department: 'Department of Physics', features: 'Blackboard, Basic Benches', inchargeName: 'Admin Store', inchargeRole: 'Store Keeper', inchargeEmail: 'stores@pondiuni.edu.in', inchargePhone: '+9104132655100', status: false },
         { date: '2023-01-20', hallName: 'Old Commerce Block Room 12', hallCode: 'OCB-12', capacity: 50, floor: 'First Floor', zone: 'North', school: 'School of Management', department: 'Department of Commerce', features: 'Blackboard', inchargeName: 'Admin Store', inchargeRole: 'Store Keeper', inchargeEmail: 'stores@pondiuni.edu.in', inchargePhone: '+9104132655100', status: false },
    ];

    let mockEmployeeData = [
        { name: 'Dr. S. K. V. Jayakumar', email: 'hodcspu@gmail.com', phone: '9443212345', designation: 'Professor & Head', department: 'Department of Computer Science', school: 'School of Engineering and Technology', status: 'Active' },
        { name: 'Dr. Sukhvinder Singh', email: 'sukh.csc@pondiuni.ac.in', phone: '9474237176', designation: 'Assistant Professor', department: 'Department of Computer Science', school: 'School of Engineering and Technology', status: 'Active' },
        { name: 'Dr. Krishnapriya S', email: 'krishnapriya@pondiuni.ac.in', phone: '9876543210', designation: 'Assistant Professor', department: 'Department of Computer Science', school: 'School of Engineering and Technology', status: 'Active' },
        { name: 'Dr. S. L. Jayalakshmi', email: 'sathishjayalakshmi02@pondiuni.ac.in', phone: '9988776655', designation: 'Assistant Professor', department: 'Department of Computer Science', school: 'School of Engineering and Technology', status: 'Active' },
        { name: 'Dr. R. Venkatesan', email: 'dean.mgmt@pondiuni.edu.in', phone: '9123456789', designation: 'Dean & Professor', department: 'Department of Management Studies', school: 'School of Management', status: 'Active' },
        { name: 'Dr. Priya Krishnan', email: 'hod.eng@pondiuni.edu.in', phone: '9234567890', designation: 'Professor & Head', department: 'Department of English', school: 'School of Humanities', status: 'Active' },
        { name: 'Dr. Anand Mohan', email: 'anand.es@pondiuni.edu.in', phone: '9345678901', designation: 'Professor', department: 'Department of Earth Sciences', school: 'School of Physical, Chemical and Applied Sciences', status: 'Active' },
        { name: 'Dr. Geetha M', email: 'hod.micro@pondiuni.edu.in', phone: '9456789012', designation: 'Professor & Head', department: 'Department of Microbiology', school: 'School of Life Sciences', status: 'Active' },
        { name: 'Dr. T. Chithralekha', email: 'chithralekha.csc@pondiuni.ac.in', phone: '9567890123', designation: 'Professor', department: 'Department of Computer Science', school: 'School of Engineering and Technology', status: 'Active' },
        { name: 'Dr. Malarvizhi', email: 'malar.mgmt@pondiuni.edu.in', phone: '9678901234', designation: 'Associate Professor', department: 'Department of Management Studies', school: 'School of Management', status: 'Active' },
        { name: 'Dr. John Doe', email: 'johndoe.phy@pondiuni.edu.in', phone: '9789012345', designation: 'Assistant Professor', department: 'Department of Physics', school: 'School of Engineering and Technology', status: 'Active' },
        { name: 'Dr. Jane Smith', email: 'janesmith.chem@pondiuni.edu.in', phone: '9890123456', designation: 'Professor', department: 'Department of Chemistry', school: 'School of Physical, Chemical and Applied Sciences', status: 'On Leave' },
        { name: 'Dr. Robert Brown', email: 'robert.hist@pondiuni.edu.in', phone: '9901234567', designation: 'Associate Professor', department: 'Department of History', school: 'School of Humanities', status: 'Active' },
    ];

    const mockBookingHalls = {
        "Seminar": [
            { id: 'sh210', name: 'Seminar Hall - 210 to 212', type: 'Seminar', school: 'School of Engineering and Technology', department: 'Department of Computer Science', location: 'Dept. of Computer Science', capacity: 60, floor: 'First Floor', zone: 'West', features: ['AC', 'Projector', 'Audio System'], incharge: { name: 'Dr. S. K. V. Jayakumar', designation: 'Head of Department', email: 'hod.csc@pondiuni.edu.in', intercom: '2401' } },
            { id: 'sh117', name: 'Seminar Hall - SH 117', type: 'Seminar', school: 'School of Engineering and Technology', department: 'Department of Computer Science', location: 'Dept. of Computer Science', capacity: 100, floor: 'Ground Floor', zone: 'West', features: ['AC', 'Projector', 'Podium', 'Smartboard'], incharge: { name: 'Dr. S. K. V. Jayakumar', designation: 'Head of Department', email: 'hod.csc@pondiuni.edu.in', intercom: '2401' } },
            { id: 'shcif', name: 'Seminar Hall opposite to CIF', type: 'Seminar', school: 'School of Engineering and Technology', department: 'Department of Computer Science', location: 'CIF Building', capacity: 180, floor: 'Ground Floor', zone: 'Central', features: ['AC', 'Projector', 'Large Stage', 'Audio System', 'Video Conferencing'], incharge: { name: 'CIF Office', designation: 'System Manager', email: 'cif@pondiuni.edu.in', intercom: '2999' } },
            { id: 'mgmtsem', name: 'Management Seminar Hall', type: 'Seminar', school: 'School of Management', department: 'Department of Management Studies', location: 'Management Block', capacity: 80, floor: 'Second Floor', zone: 'North', features: ['AC', 'Smartboard', 'Computer'], incharge: { name: 'Management Dept. Office', designation: 'Office Staff', email: 'office.mgmt@pondiuni.edu.in', intercom: '2600' } },
            { id: 'humsem', name: 'Humanities Seminar Hall', type: 'Seminar', school: 'School of Humanities', department: 'Department of English', location: 'Humanities Block', capacity: 90, floor: 'First Floor', zone: 'East', features: ['Projector', 'Audio System', 'Podium'], incharge: { name: 'Humanities Dept. Office', designation: 'Office Staff', email: 'office.hum@pondiuni.edu.in', intercom: '2700' } },
            { id: 'lifescisem', name: 'Life Sciences Seminar Hall', type: 'Seminar', school: 'School of Life Sciences', department: 'Department of Biochemistry & Molecular Biology', location: 'Life Sciences Block', capacity: 120, floor: 'Second Floor', zone: 'South', features: ['AC', 'Smartboard', 'Projector', 'Audio System'], incharge: { name: 'Life Sciences Dept. Office', designation: 'Office Staff', email: 'office.lifesci@pondiuni.edu.in', intercom: '2800' } },
        ],
        "Auditorium": [
            { id: 'jnbas', name: 'J.N. Auditorium', type: 'Auditorium', school: 'Administrative Building', department: 'University Level', location: 'Near Admin Block', capacity: 800, floor: 'Ground Floor', zone: 'Central', features: ['AC', 'Projector', 'Audio System', 'Podium', 'Ramp', 'Video Conferencing', 'Large Stage'], incharge: { name: 'Registrar Office', designation: 'Staff', email: 'reg.office@pondiuni.edu.in', intercom: '2001' } },
            { id: 'mgmt_audi', name: 'Management Auditorium', type: 'Auditorium', school: 'School of Management', department: 'Department of Management Studies', location: 'Management Block', capacity: 250, floor: 'Ground Floor', zone: 'North', features: ['AC', 'Projector', 'Audio System', 'Podium'], incharge: { name: 'Management Dept. Office', designation: 'Office Staff', email: 'office.mgmt@pondiuni.edu.in', intercom: '2600' } },
        ],
        "Lecture Hall": {
            "Class Rooms": [
                { id: 'cr308', name: 'SH 308', type: 'Lecture Hall', school: 'School of Engineering and Technology', department: 'Department of Computer Science', location: 'Dept. of Computer Science', capacity: 45, floor: 'Second Floor', zone: 'South', features: ['Projector', 'Blackboard'], incharge: { name: 'CS Dept. Office', designation: 'Office Staff', email: 'office.csc@pondiuni.edu.in', intercom: '2400' } },
                { id: 'cr314', name: 'SH 314', type: 'Lecture Hall', school: 'School of Engineering and Technology', department: 'Department of Computer Science', location: 'Dept. of Computer Science', capacity: 60, floor: 'Second Floor', zone: 'South', features: ['Projector', 'Smartboard', 'WiFi'], incharge: { name: 'CS Dept. Office', designation: 'Office Staff', email: 'office.csc@pondiuni.edu.in', intercom: '2400' } },
                { id: 'cr360', name: 'SH 360', type: 'Lecture Hall', school: 'School of Engineering and Technology', department: 'Department of Computer Science', location: 'Dept. of Computer Science', capacity: 120, floor: 'Third Floor', zone: 'South', features: ['AC', 'Projector', 'Blackboard', 'Podium'], incharge: { name: 'CS Dept. Office', designation: 'Office Staff', email: 'office.csc@pondiuni.edu.in', intercom: '2400' } },
                { id: 'phy201', name: 'Physics LH-201', type: 'Lecture Hall', school: 'School of Engineering and Technology', department: 'Department of Physics', location: 'Physics Block', capacity: 70, floor: 'First Floor', zone: 'West', features: ['Blackboard', 'Projector'], incharge: { name: 'Physics Dept. Office', designation: 'Office Staff', email: 'office.phy@pondiuni.edu.in', intercom: '2700' } },
                { id: 'mgmt101', name: 'MBA Room 101', type: 'Lecture Hall', school: 'School of Management', department: 'Department of Management Studies', location: 'Management Block', capacity: 75, floor: 'Ground Floor', zone: 'North', features: ['AC', 'Smartboard'], incharge: { name: 'Management Dept. Office', designation: 'Office Staff', email: 'office.mgmt@pondiuni.edu.in', intercom: '2600' } },
                { id: 'chem_cr1', name: 'Chemistry CR-1', type: 'Lecture Hall', school: 'School of Physical, Chemical and Applied Sciences', department: 'Department of Chemistry', location: 'Chemistry Block', capacity: 80, floor: 'Ground Floor', zone: 'West', features: ['Projector', 'Blackboard'], incharge: { name: 'Chemistry Dept. Office', designation: 'Office Staff', email: 'office.chem@pondiuni.edu.in', intercom: '2900' } },
            ],
            "Lecture Hall Complex": [
                 { id: 'lhc1_001', name: 'LHC1 001', type: 'Lecture Hall', school: 'School of Engineering and Technology', department: 'Department of Electronics Engineering', location: 'Lecture Hall Complex 1', capacity: 20, floor: 'Ground Floor', zone: 'East', features: ['Blackboard'], incharge: { name: 'LHC Office', designation: 'Admin Staff', email: 'lhc.admin@pondiuni.edu.in', intercom: '2100' } },
                 { id: 'lhc1_002', name: 'LHC1 002', type: 'Lecture Hall', school: 'School of Engineering and Technology', department: 'Department of Electronics Engineering', location: 'Lecture Hall Complex 1', capacity: 20, floor: 'Ground Floor', zone: 'East', features: ['Blackboard'], incharge: { name: 'LHC Office', designation: 'Admin Staff', email: 'lhc.admin@pondiuni.edu.in', intercom: '2100' } },
                 { id: 'lhc2_101', name: 'LHC2 101', type: 'Lecture Hall', school: 'School of Life Sciences', department: 'Department of Food Science & Technology', location: 'Lecture Hall Complex 2', capacity: 150, floor: 'First Floor', zone: 'East', features: ['AC', 'Projector', 'Audio System'], incharge: { name: 'LHC Office', designation: 'Admin Staff', email: 'lhc.admin@pondiuni.edu.in', intercom: '2100' } },
                 { id: 'lhc2_102', name: 'LHC2 102', type: 'Lecture Hall', school: 'School of Life Sciences', department: 'Department of Food Science & Technology', location: 'Lecture Hall Complex 2', capacity: 150, floor: 'First Floor', zone: 'East', features: ['AC', 'Projector', 'Audio System'], incharge: { name: 'LHC Office', designation: 'Admin Staff', email: 'lhc.admin@pondiuni.edu.in', intercom: '2100' } },
            ]
        },
        "Conference Hall": [
            { id: 'conf_admin', name: 'Admin Conference Hall', type: 'Conference Hall', school: 'Administrative Building', department: 'Administration', location: 'Admin Block', capacity: 50, floor: 'First Floor', zone: 'Central', features: ['AC', 'Projector', 'Audio System', 'Video Conferencing'], incharge: { name: 'Registrar Office', designation: 'Staff', email: 'reg.office@pondiuni.edu.in', intercom: '2001' } },
            { id: 'conf_vc', name: 'VC Conference Hall', type: 'Conference Hall', school: 'Administrative Building', department: 'Administration', location: 'Admin Block', capacity: 25, floor: 'Second Floor', zone: 'Central', features: ['AC', 'Smartboard', 'Video Conferencing', 'Computer'], incharge: { name: 'VC Secretariat', designation: 'Secretary', email: 'vc.office@pondiuni.edu.in', intercom: '2000' } },
            { id: 'conf_engg', name: 'Engineering Conference Room', type: 'Conference Hall', school: 'School of Engineering and Technology', department: 'Dean Office', location: 'Dept. of Computer Science', capacity: 30, floor: 'Third Floor', zone: 'South', features: ['AC', 'Projector', 'Computer'], incharge: { name: 'Dean (SE&T) Office', designation: 'Office Staff', email: 'dean.engg@pondiuni.edu.in', intercom: '2402' } }
        ]
    };

    const mockSemesterHalls = {
        "Seminar Halls": [
            { id: 'sh210', name: 'Seminar Hall - 210 to 212', capacity: 60, timetable: { Mon: {1: 'CSDS611', 5: 'CSDS612'}, Tue: {}, Wed: {2: 'CSDS614', 3: 'CSDS614'}, Thu: {4: 'CSDS616'}, Fri: {1: 'CSDS611', 2: 'CSDS611', 6: 'CSDS618'} } },
            { id: 'sh117', name: 'Seminar Hall - SH 117', capacity: 100, timetable: { Mon: {3: 'CSCE875'}, Tue: {2: 'CSCE875', 6: 'CSCE836'}, Wed: {}, Thu: {1: 'CSCE836', 5: 'CSCE836'}, Fri: {} } },
        ],
        "Class Rooms": [
            { id: 'cr308', name: 'SH 308', capacity: 45, timetable: { Mon: {2: 'CSCE875', 4: 'CSCE875'}, Tue: {1: 'CSCE836', 3: 'CSCE836'}, Wed: {5: 'CSDS612'}, Thu: {6: 'CSDS614', 7: 'CSDS614'}, Fri: {8: 'CSDS616'} } },
            { id: 'cr314', name: 'SH 314', capacity: 60, timetable: { Mon: {6: 'CSNS_712', 7: 'CSNS_712'}, Tue: {5: 'CSNS_712', 8: 'CSNS_712'}, Wed: {1: 'CSDS618'}, Thu: {2: 'CSDS618', 3: 'CSDS618'}, Fri: {4: 'CSDS618'} } },
            { id: 'cr360', name: 'SH 360', capacity: 120, timetable: { Mon: {}, Tue: {4: 'CSCE875', 7: 'CSCE875'}, Wed: {6: 'CSCE836', 8: 'CSCE836'}, Thu: {}, Fri: {3: 'CSDS612', 5: 'CSDS612'} } },
            { id: 'mgmt101', name: 'MBA Room 101', capacity: 75, timetable: { Mon: {1: 'MBAC501', 2: 'MBAC501'}, Tue: {3: 'MBAC502'}, Wed: {1: 'MBAC503', 2: 'MBAC503'}, Thu: {4: 'MBAC504'}, Fri: {3: 'MBAC505'} } },
        ],
        "Lecture Hall Complex": [
            { id: 'lhc1_001', name: 'LHC1 001', capacity: 20, timetable: { Mon: {8: 'CSDS611'}, Tue: {}, Wed: {7: 'CSDS611'}, Thu: {1: 'CSDS612', 2: 'CSDS612'}, Fri: {6: 'CSDS614'} } },
            { id: 'lhc2_101', name: 'LHC2 101', capacity: 150, timetable: { Mon: {4: 'FST-301'}, Tue: {2: 'BMB-202', 3: 'BMB-202'}, Wed: {}, Thu: {5: 'FST-303'}, Fri: {1: 'BMB-204'} } },
        ]
    };

    const mockHallAvailability = [
        // Past Bookings
        { hallId: 'shcif', year: 2025, month: 6, day: 30, time: '09:30 AM', status: 'Booked' },
        { hallId: 'shcif', year: 2025, month: 6, day: 30, time: '10:30 AM', status: 'Booked' },
        { hallId: 'cr308', year: 2025, month: 7, day: 10, time: '09:30 AM', status: 'Booked' },

        // Future Bookings & Pendings
        { hallId: 'shcif', year: 2025, month: 7, day: 2, time: '02:30 PM', status: 'Booked' },
        { hallId: 'cr308', year: 2025, month: 7, day: 10, time: '10:30 AM', status: 'Booked' },
        { hallId: 'cr308', year: 2025, month: 7, day: 10, time: '11:30 AM', status: 'Pending' },
        { hallId: 'sh210', year: 2025, month: 7, day: 31, time: '09:30 AM', status: 'Booked' },
        { hallId: 'sh210', year: 2025, month: 7, day: 31, time: '10:30 AM', status: 'Booked' },
        { hallId: 'jnbas', year: 2025, month: 7, day: 4, time: '09:30 AM', status: 'Booked' },
        { hallId: 'jnbas', year: 2025, month: 7, day: 4, time: '10:30 AM', status: 'Booked' },
        { hallId: 'jnbas', year: 2025, month: 7, day: 4, time: '11:30 AM', status: 'Booked' },
        { hallId: 'jnbas', year: 2025, month: 7, day: 4, time: '12:30 PM', status: 'Booked' },
        { hallId: 'conf_vc', year: 2025, month: 7, day: 7, time: '02:30 PM', status: 'Booked' },
        { hallId: 'conf_vc', year: 2025, month: 7, day: 7, time: '03:30 PM', status: 'Booked' },
        { hallId: 'mgmtsem', year: 2025, month: 7, day: 9, time: '09:30 AM', status: 'Pending' },
        { hallId: 'cr360', year: 2025, month: 7, day: 18, time: '09:30 AM', status: 'Booked' },
        { hallId: 'cr360', year: 2025, month: 7, day: 18, time: '10:30 AM', status: 'Booked' },
    ];

    const mockMyBookingsData = [
        { bookedOn: '2025-07-25', bookingId: 'BK-20250725-001', hallName: 'Seminar Hall - SH 117', hallCode: 'SH 117', department: 'Dept. of Computer Science', purpose: 'Ph.D. Defense', course: 'Viva Voce for Mr. Alex', dateTime: '2025-08-05\n09:30 AM - 12:30 PM', status: 'Approved' },
        { bookedOn: '2025-07-28', bookingId: 'BK-20250728-003', hallName: 'Admin Conference Hall', hallCode: 'conf_admin', department: 'Administration', purpose: 'Meeting', course: 'Quarterly Review Meeting', dateTime: '2025-08-10\n03:30 PM - 04:30 PM', status: 'Pending' },
        { bookedOn: '2025-07-29', bookingId: 'BK-20250729-001', hallName: 'SH 314', hallCode: 'cr314', department: 'Dept. of Computer Science', purpose: 'Class', course: 'Special Class on AI', dateTime: '2025-08-01\n10:30 AM - 11:30 AM', status: 'Approved' },
        { bookedOn: '2025-06-10', bookingId: 'BK-20250610-005', hallName: 'J.N. Auditorium', hallCode: 'jnbas', department: 'University Level', purpose: 'Cultural Event', course: 'Annual Day Function', dateTime: '2025-07-15\n09:30 AM - 04:30 PM', status: 'Rejected' },
    ];

    const mockApprovalData = [
        { bookedOn: '2025-07-30', hallName: 'Management Seminar Hall', hallCode: 'mgmtsem', purpose: 'Guest Lecture', course: 'Lecture on Startup Ecosystems', dateTime: '2025-08-08\n10:30 AM - 12:30 PM', bookedBy: 'Dr. Malarvizhi', bookedByDept: 'Dept. of Management Studies', status: 'Pending' },
        { bookedOn: '2025-07-31', hallName: 'Humanities Seminar Hall', hallCode: 'humsem', purpose: 'Workshop', course: 'Creative Writing Workshop', dateTime: '2025-08-11\n09:30 AM - 04:30 PM', bookedBy: 'Dr. Priya Krishnan', bookedByDept: 'Dept. of English', status: 'Pending' },
    ];

    const mockBookingConflictsData = [
        { bookedOn: '2025-07-28', bookingId: 'BK-20250728-004', hallName: 'SH 360', hallCode: 'cr360', purpose: 'Class', course: 'Remedial Class for CS-101', dateTime: '2025-08-18\n10:30 AM - 11:30 AM', bookedBy: 'Dr. John Doe', bookedByDept: 'Dept. of Physics', phone: '9789012345', email: 'johndoe.phy@pondiuni.edu.in', status: 'Pending' },
        { bookedOn: '2025-07-29', bookingId: 'BK-20250729-002', hallName: 'SH 360', hallCode: 'cr360', purpose: 'Meeting', course: 'Department Staff Meeting', dateTime: '2025-08-18\n09:30 AM - 11:30 AM', bookedBy: 'Dr. S. K. V. Jayakumar', bookedByDept: 'Dept. of Computer Science', phone: '9443212345', email: 'hodcspu@gmail.com', status: 'Approved' },
    ];

    const mockForwardBookingsData = [
         { bookedOn: '2025-08-01', hallName: 'J.N. Auditorium', hallCode: 'jnbas', purpose: 'Seminar', course: 'National Level Tech Symposium', dateTime: '2025-09-10\n09:30 AM - 05:30 PM', bookedBy: 'Dr. T. Chithralekha', bookedByDept: 'Dept. of Computer Science', status: 'Forwarded' },
    ];
    
    const mockViewBookingsData = [
        // My Bookings
        ...mockMyBookingsData,
        // Approvals
        ...mockApprovalData.map(b => ({ ...b, bookingId: 'BK-20250730-002', phone: '9678901234', email: 'malar.mgmt@pondiuni.edu.in' })),
        // Conflicts
        ...mockBookingConflictsData,
        // Forwards
        ...mockForwardBookingsData.map(b => ({ ...b, bookingId: 'BK-20250801-001', phone: '9567890123', email: 'chithralekha.csc@pondiuni.ac.in' })),
        // Additional Approved
        { bookedOn: '2025-07-20', bookingId: 'BK-20250720-001', hallName: 'SH 360', hallCode: 'cr360', department: 'Dept. of Computer Science', purpose: 'Class', course: 'Semester classes for MCA\nCSCS-456', dateTime: 'Mon, Wed, Fri\nP1, P2', bookedBy: 'Dr. Krishnapriya S', bookedByDept: 'Dept. of Computer Science', phone: '9876543210', email: 'krishnapriya@pondiuni.ac.in', status: 'Approved', isSemester: true },
        { bookedOn: '2025-07-18', bookingId: 'BK-20250718-005', hallName: 'Life Sciences Seminar Hall', hallCode: 'lifescisem', department: 'Dept. of Microbiology', purpose: 'Seminar', course: 'Recent Trends in Microbiology', dateTime: '2025-08-22\n10:00 AM - 01:00 PM', bookedBy: 'Dr. Geetha M', bookedByDept: 'Dept. of Microbiology', phone: '9456789012', email: 'hod.micro@pondiuni.edu.in', status: 'Approved' },
        // Additional Rejected
        { bookedOn: '2025-07-19', bookingId: 'BK-20250719-002', hallName: 'VC Conference Hall', hallCode: 'conf_vc', department: 'Administration', purpose: 'Meeting', course: 'Research Scholars Meeting', dateTime: '2025-08-02\n11:30 AM - 12:30 PM', bookedBy: 'Dr. Robert Brown', bookedByDept: 'Dept. of History', phone: '9901234567', email: 'robert.hist@pondiuni.edu.in', status: 'Rejected' },
    ];


    async function fetchData(key, data) {
        if (cache[key]) {
            return Promise.resolve(JSON.parse(JSON.stringify(cache[key])));
        }
        // Deep copy to prevent mutations from affecting the original mock data
        const deepCopiedData = JSON.parse(JSON.stringify(data));
        cache[key] = deepCopiedData;
        return Promise.resolve(deepCopiedData);
    }

    // --- NEW: Functions to add data to the mock database ---
    function addIndividualBooking(bookingDetails) {
        // 1. Add to MyBookings and ViewBookings
        mockMyBookingsData.unshift(bookingDetails.bookingRecord);
        mockViewBookingsData.unshift(bookingDetails.bookingRecord);

        // 2. Add to HallAvailability
        bookingDetails.availabilityRecords.forEach(avail => {
            mockHallAvailability.push(avail);
        });

        // 3. Invalidate cache for affected data
        delete cache.myBookingsData;
        delete cache.viewBookingsData;
        delete cache.hallAvailability;
    }
    
    function addSemesterBooking(bookingDetails) {
        // 1. Add to MyBookings and ViewBookings
        mockMyBookingsData.unshift(bookingDetails.bookingRecord);
        mockViewBookingsData.unshift(bookingDetails.bookingRecord);

        // 2. Update the timetable in mockSemesterHalls
        const hallToUpdate = Object.values(mockSemesterHalls)
            .flat()
            .find(h => h.id === bookingDetails.hallId);
        
        if (hallToUpdate) {
            bookingDetails.slotsToBook.forEach(slot => {
                if (!hallToUpdate.timetable[slot.day]) {
                    hallToUpdate.timetable[slot.day] = {};
                }
                hallToUpdate.timetable[slot.day][slot.period] = bookingDetails.courseCode;
            });
        }

        // 3. Invalidate cache
        delete cache.myBookingsData;
        delete cache.viewBookingsData;
        delete cache.semesterHalls;
    }

    function reactivateHalls(hallCodes) {
        if (!Array.isArray(hallCodes) || hallCodes.length === 0) {
            return;
        }

        const hallsToReactivate = [];
        
        // Find and remove halls from the archive
        mockArchivedHallData = mockArchivedHallData.filter(hall => {
            if (hallCodes.includes(hall.hallCode)) {
                hallsToReactivate.push(hall);
                return false; // Remove from archive
            }
            return true; // Keep in archive
        });

        // Add halls to the main data and update their status/date
        hallsToReactivate.forEach(hall => {
            hall.status = true;
            hall.date = new Date().toISOString().split('T')[0]; // Set date to today
            mockHallData.unshift(hall); // Add to the top of the active halls list
        });

        // Invalidate caches
        delete cache.hallData;
        delete cache.archivedHallData;
    }

    function deleteEmployees(emails) {
        if (!Array.isArray(emails) || emails.length === 0) {
            return;
        }
        mockEmployeeData = mockEmployeeData.filter(emp => !emails.includes(emp.email));
        delete cache.employeeData; // Invalidate cache
    }

        // --- ADDED: This function fetches REAL user data from the API ---
    async function fetchActualUserData() {
        const API_BASE_URL = 'https://hall-management.nirmaljyotib.workers.dev';
        // MODIFIED: Get token from sessionStorage
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            // If there's no token, we shouldn't be on this page, but as a fallback:
            return Promise.resolve({ name: 'Guest' });
        }

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${token}`);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/user`, { headers });
            if (response.status === 401) {
                logout(); // from auth.js
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch user data from API:', error);
            // Fallback to a default name if the API call fails
            return { name: 'User' };
        }
    }

    function updateEmployee(employeeData) {
        const index = mockEmployeeData.findIndex(emp => emp.email === employeeData.originalEmail);
        if (index !== -1) {
            mockEmployeeData[index] = {
                ...mockEmployeeData[index],
                name: employeeData.name,
                email: employeeData.email,
                phone: employeeData.phone,
                designation: employeeData.designation,
                department: employeeData.department,
                school: employeeData.school,
            };
            delete cache.employeeData; // Invalidate cache
        }
    }

    return {
        fetchHallData: () => fetchData('hallData', mockHallData),
        fetchArchivedHallData: () => fetchData('archivedHallData', mockArchivedHallData),
        fetchEmployeeData: () => fetchData('employeeData', mockEmployeeData),
        fetchBookingHalls: () => fetchData('bookingHalls', mockBookingHalls),
        fetchSemesterHalls: () => fetchData('semesterHalls', mockSemesterHalls),
        fetchMyBookingsData: () => fetchData('myBookingsData', mockMyBookingsData),
        fetchHallAvailability: () => fetchData('hallAvailability', mockHallAvailability),
        fetchApprovalData: () => fetchData('approvalData', mockApprovalData),
        fetchBookingConflictsData: () => fetchData('bookingConflictsData', mockBookingConflictsData),
        fetchForwardBookingsData: () => fetchData('forwardBookingsData', mockForwardBookingsData),
        fetchViewBookingsData: () => fetchData('viewBookingsData', mockViewBookingsData),
        
        // This is the ONLY function that calls the live API
        fetchUserData: fetchActualUserData,

        addIndividualBooking,
        addSemesterBooking,
        reactivateHalls,
        deleteEmployees,
        updateEmployee,
        getSchools: () => schools,
        getFeatures: () => features,
    };
})();
