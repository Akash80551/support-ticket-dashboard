import { useCallback, useEffect, useState } from 'react';
import { getTicket, updateTicket } from '../api';
import StatusBadge from './StatusBadge';
import { X, Mail, Clock3 } from 'lucide-react';
export default function TicketDrawer({id,onClose,onUpdated}){
  const [ticket,setTicket]=useState(null);const [error,setError]=useState('');const [saving,setSaving]=useState(false);const [saved,setSaved]=useState(false);
  const loadTicket=useCallback(async()=>{setTicket(null);setError('');try{setTicket(await getTicket(id));}catch(e){setError(e.message);}},[id]);
  useEffect(()=>{loadTicket();},[loadTicket]);
  async function save(field,value){setSaving(true);setSaved(false);setError('');try{const updated=await updateTicket(id,{[field]:value});setTicket(updated);setSaved(true);onUpdated(updated);}catch(e){setError(e.message);}finally{setSaving(false);}}
  return <div className="drawer-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><aside className="drawer" aria-label={`Ticket ${id} details`}>
    <div className="drawer-head"><div><p className="eyebrow">Ticket #{id}</p><h2>{ticket?.title||'Loading ticket…'}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close ticket details"><X/></button></div>
    {error&&<div className="alert">{error}{!ticket&&<button className="link-btn" onClick={loadTicket}>Retry</button>}</div>}
    {!ticket?<div className="loading drawer-loading">Loading ticket details…</div>:<>
      <div className="detail-grid"><div><span className="detail-label">Customer</span><p><Mail size={15}/>{ticket.customerEmail}</p></div><div><span className="detail-label">Created</span><p><Clock3 size={15}/>{new Date(ticket.createdAt).toLocaleString()}</p></div></div>
      <section className="description"><span className="detail-label">Description</span><p>{ticket.description}</p></section>
      <div className="edit-row"><label>Status<select disabled={saving} value={ticket.status} onChange={e=>save('status',e.target.value)}><option>Open</option><option>In Progress</option><option>Resolved</option></select></label><label>Priority<select disabled={saving} value={ticket.priority} onChange={e=>save('priority',e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></label></div>
      <div className="current-status"><span>{saved?'Changes saved':'Current status'}</span><StatusBadge value={ticket.status}/></div><p className="updated">Last updated {new Date(ticket.updatedAt).toLocaleString()}</p>
    </>}
  </aside></div>;
}
