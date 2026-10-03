import { db } from './db.js';
import { validateTicketInput, priorities, statuses } from './validation.js';

const row = (r) => ({ id:r.id, title:r.title, description:r.description, customerEmail:r.customer_email, priority:r.priority, status:r.status, createdAt:r.created_at, updatedAt:r.updated_at });

export function listTickets({ search='', status='', priority='', sort='newest', page=1, limit=10 }) {
  const where=[]; const params={};
  if (search) { where.push('(LOWER(title) LIKE LOWER(@search) OR LOWER(customer_email) LIKE LOWER(@search))'); params.search=`%${search}%`; }
  if (status) { where.push('status = @status'); params.status=status; }
  if (priority) { where.push('priority = @priority'); params.priority=priority; }
  const whereSql=where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql=sort==='oldest' ? 'created_at ASC, id ASC' : 'created_at DESC, id DESC';
  const total=db.prepare(`SELECT COUNT(*) AS count FROM tickets ${whereSql}`).get(params).count;
  const totalPages=Math.ceil(total/limit);
  const offset=(page-1)*limit;
  const items=db.prepare(`SELECT * FROM tickets ${whereSql} ORDER BY ${orderSql} LIMIT @limit OFFSET @offset`).all({...params,limit,offset}).map(row);
  return { items, pagination:{page,limit,total,totalPages} };
}

export function getSummary() {
  const total=db.prepare('SELECT COUNT(*) AS count FROM tickets').get().count;
  const counts=Object.fromEntries(statuses.map(s=>[s,0]));
  for (const r of db.prepare('SELECT status, COUNT(*) AS count FROM tickets GROUP BY status').all()) counts[r.status]=r.count;
  return { total, open:counts.Open, inProgress:counts['In Progress'], resolved:counts.Resolved };
}

export function getTicket(id) { const ticket=db.prepare('SELECT * FROM tickets WHERE id = ?').get(id); return ticket ? row(ticket) : null; }

export function createTicket(input) {
  const errors=validateTicketInput(input); if (Object.keys(errors).length) return { errors };
  const now=new Date().toISOString();
  const result=db.prepare(`INSERT INTO tickets(title, description, customer_email, priority, status, created_at, updated_at) VALUES(@title,@description,@customerEmail,@priority,@status,@createdAt,@updatedAt)`).run({ title:input.title.trim(), description:input.description.trim(), customerEmail:input.customerEmail.trim(), priority:input.priority, status:input.status ?? 'Open', createdAt:now, updatedAt:now });
  return { ticket:getTicket(result.lastInsertRowid) };
}

export function updateTicket(id,input) {
  if (!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).length===0) return { errors:{general:'At least one field is required.'} };
  const existing=getTicket(id); if (!existing) return { notFound:true };
  const errors=validateTicketInput(input,{partial:true}); if (Object.keys(errors).length) return { errors };
  const next={ title:input.title!==undefined ? input.title.trim() : existing.title, description:input.description!==undefined ? input.description.trim() : existing.description, customerEmail:input.customerEmail!==undefined ? input.customerEmail.trim() : existing.customerEmail, priority:input.priority!==undefined ? input.priority : existing.priority, status:input.status!==undefined ? input.status : existing.status };
  const now=new Date().toISOString();
  db.prepare(`UPDATE tickets SET title=@title, description=@description, customer_email=@customerEmail, priority=@priority, status=@status, updated_at=@updatedAt WHERE id=@id`).run({...next,updatedAt:now,id});
  return { ticket:getTicket(id) };
}

export { priorities, statuses };
