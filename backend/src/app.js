import express from 'express';
import cors from 'cors';
import { createTicket, getSummary, getTicket, listTickets, updateTicket, priorities, statuses } from './tickets.js';

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.status(200).json({ data: { ok: true } }));
app.get('/api/tickets/summary', (_req, res) => res.status(200).json({ data: getSummary() }));

app.get('/api/tickets', (req, res) => {
  const { search = '', status = '', priority = '', sort = 'newest' } = req.query;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ error: { message: 'Invalid pagination. Page must be >= 1 and limit must be between 1 and 100.' } });
  }
  if (status && !statuses.includes(status)) return res.status(400).json({ error: { message: 'Invalid status filter.', fields: { status: 'Unsupported status.' } } });
  if (priority && !priorities.includes(priority)) return res.status(400).json({ error: { message: 'Invalid priority filter.', fields: { priority: 'Unsupported priority.' } } });
  if (!['newest', 'oldest'].includes(sort)) return res.status(400).json({ error: { message: 'sort must be newest or oldest.' } });
  res.status(200).json({ data: listTickets({ search: String(search).trim(), status, priority, sort, page, limit }) });
});

app.get('/api/tickets/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: { message: 'Ticket id must be a positive integer.' } });
  const ticket = getTicket(id);
  if (!ticket) return res.status(404).json({ error: { message: 'Ticket not found.' } });
  res.status(200).json({ data: ticket });
});

app.post('/api/tickets', (req, res) => {
  const result = createTicket(req.body);
  if (result.errors) return res.status(400).json({ error: { message: 'Validation failed.', fields: result.errors } });
  res.status(201).json({ data: result.ticket });
});

app.patch('/api/tickets/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: { message: 'Ticket id must be a positive integer.' } });
  const result = updateTicket(id, req.body);
  if (result.notFound) return res.status(404).json({ error: { message: 'Ticket not found.' } });
  if (result.errors) return res.status(400).json({ error: { message: 'Validation failed.', fields: result.errors } });
  res.status(200).json({ data: result.ticket });
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ error: { message: 'Invalid JSON request body.' } });
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error.' } });
});
