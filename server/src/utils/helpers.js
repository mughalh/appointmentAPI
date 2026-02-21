const generateTimeSlots = (startTime, endTime, durationMinutes, intervalMinutes = 30) => {
  const slots = [];
  let current = new Date(startTime);
  const end = new Date(endTime);

  while (current < end) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
    if (slotEnd <= end) {
      slots.push(new Date(current));
    }
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return slots;
};

const formatDate = (date, format = 'MMM dd, yyyy') => {
  const d = new Date(date);
  const options = {
    'MMM dd, yyyy': { month: 'short', day: '2-digit', year: 'numeric' },
    'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'hh:mm a': { hour: '2-digit', minute: '2-digit' }
  };
  
  return d.toLocaleDateString('en-US', options[format] || options['MMM dd, yyyy']);
};

const calculatePagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

module.exports = {
  generateTimeSlots,
  formatDate,
  calculatePagination
};