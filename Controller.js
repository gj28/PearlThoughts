const doctorsData = require('./data/doctors.json');
const doctorsappointments = './data/appointments.json';
const fs = require('fs');

function getDoctors(req, res) {
    res.json(doctorsData);
}

function getDoctorById(req, res) {
    const doctorId = parseInt(req.params.id);
    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
}


function checkAvailability(req, res) {
    const doctorId = parseInt(req.params.id);
    const requestedDate = req.query.date;
    const requestedTime = req.query.time;

    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }

    const dayOfWeek = new Date(requestedDate).toLocaleDateString('en-US', { weekday: 'long' });

    if (doctor.schedule[dayOfWeek] === 'Not available') {
        return res.json({ available: false, message: 'Doctor not available on this day' });
    }

    const [start, end] = doctor.schedule[dayOfWeek].split(' - ');
    const startTime = new Date(`${requestedDate}T${start}`);
    const endTime = new Date(`${requestedDate}T${end}`);
    const requestedDateTime = new Date(`${requestedDate}T${requestedTime}`);

    if (requestedDateTime < startTime || requestedDateTime >= endTime) {
        return res.json({ available: false, message: 'Doctor not available at this time' });
    }

    res.json({ available: true, message: 'Doctor is available' });
}

function bookAppointment(req, res) {
    const doctorId = parseInt(req.params.id);
    const { date, time, patientName } = req.body;

    if (!date || !time) {
        return res.status(400).json({ success: false, message: 'Date and time are required' });
    }

    const parsedDate = date.replace(/ /g, '-'); 
    const parsedTime = time.replace(/ /g, ':');

    if (isNaN(Date.parse(parsedDate))) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }

    const dayOfWeek = new Date(parsedDate).toLocaleDateString('en-US', { weekday: 'long' });



    if (doctor.schedule[dayOfWeek] === 'Not available') {
        return res.json({ success: false, message: 'Doctor not available on this day' });
    }

    const [start, end] = doctor.schedule[dayOfWeek].split(' - ');
    const startTime = new Date(`${parsedDate}T${start}`);
    const endTime = new Date(`${parsedDate}T${end}`);
    const requestedDateTime = new Date(`${parsedDate}T${parsedTime}`);

    if (requestedDateTime < startTime || requestedDateTime >= endTime) {
        return res.json({ success: false, message: 'Doctor not available at this time' });
    }

    let appointments = [];
    try {
        appointments = JSON.parse(fs.readFileSync(doctorsappointments));
    } catch (error) {
        //continue with empty array
    }

    const doctorAppointments = appointments.filter(appointment => appointment.doctorId === doctorId && appointment.date === parsedDate);
    if (doctorAppointments.length >= doctor.maxAppointmentsPerSlot) {
        return res.json({ success: false, message: 'Maximum appointments for this slot reached' });
    }

    // Book the appointment
    const newAppointment = {
        doctorId: doctorId,
        date: parsedDate,
        time: parsedTime,
        patientName: patientName 
    };
    appointments.push(newAppointment);

    fs.writeFileSync(doctorsappointments, JSON.stringify(appointments));

    res.json({ success: true, message: 'Appointment booked successfully' });
}



module.exports = {
    getDoctors,
    getDoctorById,
    checkAvailability,
    bookAppointment
};
