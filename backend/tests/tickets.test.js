import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { db, closeDb } from '../src/db.js';
const reset=()=>db.exec('DELETE FROM tickets');
after(()=>closeDb());

test('POST /api/tickets validates required fields and email', async()=>{reset();const res=await request(app).post('/api/tickets').send({title:'',description:'',customerEmail:'bad',priority:'High'});assert.equal(res.status,400);assert.ok(res.body.error.fields.title);assert.ok(res.body.error.fields.description);assert.ok(res.body.error.fields.customerEmail);});

test('POST /api/tickets rejects a title longer than 120 characters', async()=>{reset();const res=await request(app).post('/api/tickets').send({title:'x'.repeat(121),description:'A valid description',customerEmail:'test@example.com',priority:'Medium'});assert.equal(res.status,400);assert.match(res.body.error.fields.title,/120/);});

test('GET /api/tickets applies search, filters and server-side pagination', async()=>{reset();const insert=db.prepare(`INSERT INTO tickets(title,description,customer_email,priority,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`);for(let i=0;i<12;i++)insert.run(`Password ${i}`,'Need help',`user${i}@example.com`,i%2?'Low':'High',i%2?'Resolved':'Open',new Date(Date.now()-i*1000).toISOString(),new Date().toISOString());const res=await request(app).get('/api/tickets?search=password&priority=High&page=1&limit=5');assert.equal(res.status,200);assert.equal(res.body.data.items.length,5);assert.equal(res.body.data.pagination.total,6);assert.equal(res.body.data.pagination.totalPages,2);});

test('GET /api/tickets/summary counts the entire dataset', async()=>{reset();const create=(status,priority)=>request(app).post('/api/tickets').send({title:`${status} ticket`,description:'A description',customerEmail:`${status.replaceAll(' ','').toLowerCase()}@example.com`,priority,status});await create('Open','Low');await create('In Progress','High');await create('Resolved','Medium');const filtered=await request(app).get('/api/tickets?status=Open&priority=Low');assert.equal(filtered.body.data.pagination.total,1);const summary=await request(app).get('/api/tickets/summary');assert.equal(summary.status,200);assert.deepEqual(summary.body.data,{total:3,open:1,inProgress:1,resolved:1});});

test('PATCH /api/tickets/:id persists status and priority', async()=>{reset();const create=await request(app).post('/api/tickets').send({title:'Test ticket',description:'A description',customerEmail:'test@example.com',priority:'Low'});assert.equal(create.status,201);const id=create.body.data.id;const patch=await request(app).patch(`/api/tickets/${id}`).send({status:'Resolved',priority:'High'});assert.equal(patch.status,200);const fetched=await request(app).get(`/api/tickets/${id}`);assert.equal(fetched.status,200);assert.equal(fetched.body.data.status,'Resolved');assert.equal(fetched.body.data.priority,'High');});

test('GET /api/tickets/:id returns 404 for an unknown ticket', async()=>{reset();const res=await request(app).get('/api/tickets/999999');assert.equal(res.status,404);assert.equal(res.body.error.message,'Ticket not found.');});
