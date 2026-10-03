const priorities = ['Low', 'Medium', 'High'];
const statuses = ['Open', 'In Progress', 'Resolved'];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateTicketInput(input, { partial = false } = {}) {
  const errors = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { general: 'Request body must be a JSON object.' };
  if (!partial || input.title !== undefined) {
    if (typeof input.title !== 'string' || !input.title.trim()) errors.title = 'Title is required.';
    else if (input.title.trim().length > 120) errors.title = 'Title must be 120 characters or fewer.';
  }
  if (!partial || input.description !== undefined) {
    if (typeof input.description !== 'string' || !input.description.trim()) errors.description = 'Description is required.';
  }
  if (!partial || input.customerEmail !== undefined) {
    if (typeof input.customerEmail !== 'string' || !emailRegex.test(input.customerEmail.trim())) errors.customerEmail = 'Enter a valid customer email.';
  }
  if (!partial || input.priority !== undefined) {
    if (!priorities.includes(input.priority)) errors.priority = 'Priority must be Low, Medium, or High.';
  }
  if (input.status !== undefined && !statuses.includes(input.status)) errors.status = 'Status must be Open, In Progress, or Resolved.';
  return errors;
}

export { priorities, statuses };
