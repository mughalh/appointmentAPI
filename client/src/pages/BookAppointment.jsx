import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FiCalendar, FiClock, FiUser, FiBriefcase, 
  FiArrowLeft, FiArrowRight, FiCheckCircle
} from 'react-icons/fi';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service');
  const rescheduleId = searchParams.get('reschedule');

  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [selectedService, setSelectedService] = useState(preselectedService || '');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchServices();
    if (rescheduleId) {
      fetchAppointmentDetails(rescheduleId);
    }
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchEmployees(selectedService);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedEmployee, selectedDate]);

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/services');
      setServices(response.data.services || response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchEmployees = async (serviceId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employees/by-service/${serviceId}`);
      setEmployees(response.data.employees || response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/employees/${selectedEmployee}/availability?date=${selectedDate}`
      );
      setAvailableSlots(response.data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const fetchAppointmentDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/appointments/${id}`);
      const apt = response.data.appointment || response.data;
      setSelectedService(apt.service._id);
      setSelectedEmployee(apt.employee._id);
      // Don't set date/time for reschedule - let user choose new ones
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedService || !selectedEmployee || !selectedTime) {
      alert('Please complete all steps');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        serviceId: selectedService,
        employeeId: selectedEmployee,
        startTime: selectedTime,
        notes: ''
      };

      await axios.post('http://localhost:5000/api/appointments', appointmentData);
      
      // Navigate to appointments page with success message
      navigate('/appointments', { state: { bookingSuccess: true } });
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedTime) return;
    
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/appointments/${rescheduleId}/reschedule`, {
        startTime: selectedTime
      });
      navigate('/appointments', { state: { rescheduleSuccess: true } });
    } catch (error) {
      console.error('Error rescheduling:', error);
      alert('Failed to reschedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceObj = services.find(s => s._id === selectedService);
  const selectedEmployeeObj = employees.find(e => e._id === selectedEmployee);

  if (loading && step === 1) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="metro-tile" style={{ textAlign: 'center', padding: '40px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', marginBottom: '20px' }}
          >
            📅
          </motion.div>
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#667eea',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '20px'
          }}
        >
          <FiArrowLeft /> Back
        </button>

        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
          {rescheduleId ? 'Reschedule Appointment' : 'Book an Appointment'}
        </h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          {rescheduleId 
            ? 'Select a new date and time for your appointment'
            : 'Choose your service, provider, and preferred time'
          }
        </p>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '40px',
          position: 'relative'
        }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step >= s ? '#667eea' : '#e0e0e0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontWeight: 'bold'
              }}>
                {step > s ? <FiCheckCircle /> : s}
              </div>
              <p style={{ fontSize: '14px', color: step >= s ? '#667eea' : '#999' }}>
                {s === 1 && 'Choose Service'}
                {s === 2 && 'Select Provider'}
                {s === 3 && 'Pick Time'}
              </p>
            </div>
          ))}
          {/* Progress Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '12.5%',
            right: '12.5%',
            height: '2px',
            background: '#e0e0e0',
            zIndex: -1
          }}>
            <div style={{
              width: `${(step - 1) * 50}%`,
              height: '100%',
              background: '#667eea',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Step 1: Choose Service */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 style={{ marginBottom: '20px' }}>Select a Service</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {services.map(service => (
                <motion.div
                  key={service._id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedService(service._id);
                    setStep(2);
                  }}
                  style={{
                    padding: '20px',
                    border: `2px solid ${selectedService === service._id ? '#667eea' : '#e0e0e0'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedService === service._id ? 'rgba(102,126,234,0.1)' : 'white'
                  }}
                >
                  <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{service.name}</h3>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                    {service.description?.substring(0, 60)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#667eea', fontWeight: 'bold' }}>${service.price}</span>
                    <span style={{ color: '#999' }}>{service.durationMinutes} min</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Provider */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  marginRight: '20px',
                  cursor: 'pointer'
                }}
              >
                <FiArrowLeft /> Back
              </button>
              <h2>Select a Provider for {selectedServiceObj?.name}</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {employees.map(emp => (
                <motion.div
                  key={emp._id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedEmployee(emp._id);
                    setStep(3);
                  }}
                  style={{
                    padding: '20px',
                    border: `2px solid ${selectedEmployee === emp._id ? '#667eea' : '#e0e0e0'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedEmployee === emp._id ? 'rgba(102,126,234,0.1)' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: '#667eea',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {emp.user?.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{emp.user?.fullName}</h3>
                      <p style={{ color: '#666', fontSize: '14px' }}>{emp.specialization}</p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <span style={{ fontSize: '12px', color: '#999' }}>⭐ {emp.rating || '4.5'}</span>
                        <span style={{ fontSize: '12px', color: '#999' }}>🎂 {emp.experience}+ years</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Pick Date & Time */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  marginRight: '20px',
                  cursor: 'pointer'
                }}
              >
                <FiArrowLeft /> Back
              </button>
              <h2>Select Date & Time</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              {/* Date Selection */}
              <div style={{
                padding: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px'
              }}>
                <h3 style={{ marginBottom: '15px' }}>Select Date</h3>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Time Selection */}
              <div style={{
                padding: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px'
              }}>
                <h3 style={{ marginBottom: '15px' }}>Available Times</h3>
                {selectedDate ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                  }}>
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTime(slot)}
                        style={{
                          padding: '10px',
                          border: 'none',
                          background: selectedTime === slot ? '#667eea' : '#f0f0f0',
                          color: selectedTime === slot ? 'white' : '#333',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                    Please select a date first
                  </p>
                )}
              </div>
            </div>

            {/* Summary & Book Button */}
            {selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '30px',
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px'
                }}
              >
                <h3 style={{ marginBottom: '15px' }}>Appointment Summary</h3>
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>Service:</strong> {selectedServiceObj?.name}</p>
                  <p><strong>Provider:</strong> {selectedEmployeeObj?.user?.fullName}</p>
                  <p><strong>Date:</strong> {new Date(selectedTime).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(selectedTime).toLocaleTimeString()}</p>
                  <p><strong>Price:</strong> ${selectedServiceObj?.price}</p>
                </div>
                <button
                  onClick={rescheduleId ? handleRescheduleAppointment : handleBookAppointment}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Processing...' : rescheduleId ? 'Confirm Reschedule' : 'Confirm Booking'}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BookAppointment;