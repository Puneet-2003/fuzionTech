const VALID_TRANSITIONS = {
  'BACKLOG': ['IN_PROGRESS'],
  'IN_PROGRESS': ['REVIEW', 'BACKLOG'],
  'REVIEW': ['DONE', 'IN_PROGRESS'],
  'DONE': []
};

const isValidTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) return true; 
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
};

const getTransitionError = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) return null;
  
  if (!VALID_TRANSITIONS.hasOwnProperty(currentStatus)) {
    return `Invalid current status: ${currentStatus}`;
  }
  
  if (!isValidTransition(currentStatus, newStatus)) {
    return `Cannot transition from ${currentStatus} to ${newStatus}. ` +
           `Allowed: ${VALID_TRANSITIONS[currentStatus].join(', ') || 'None'}`;
  }
  
  return null;
};

module.exports = { isValidTransition, getTransitionError, VALID_TRANSITIONS };
