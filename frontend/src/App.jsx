import { useEffect, useState } from 'react';
import { Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw, Inbox, CheckCircle2, Clock3 } from 'lucide-react';
import { getSummary, getTickets } from './api';
import StatusBadge from './components/StatusBadge';
import Modal from './components/Modal';
import TicketForm from './components/TicketForm';
import TicketDrawer from './components/TicketDrawer';

const emptySummary = { total:0, open:0, inProgress:0, resolved:0 };
export default function App(){
  const [summary,setSummary]=useState(emptySummary); const [data,setData]=useState({items:[],pagination:{page:1,limit:10,total:0,totalPages:0}});
  const [filters,setFilters]=useState({search:'',status:'',priority:'',sort:'newest',page:1,limit:10});
  const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [showCreate,setShowCreate]=useState(false); const [selected,setSelected]=useState(null); const [refreshing,setRefreshing]=useState(false);
  async function load({silent=false}={}){if(silent)setRefreshing(true);else setLoading(true);setError('');try{const [s,t]=await Promise.all([getSummary(),getTickets(filters)]);setSummary(s);setData(t)}catch(e){setError(e.message)}finally{if(silent)setRefreshing(false);else setLoading(false)}}
  useEffect(()=>{load()},[filters.search,filters.status,filters.priority,filters.sort,filters.page]);
  const change=(key,value)=>setFilters(f=>({...f,[key]:value,page:key==='page'?value:1}));
  return <div className="app">
    <header className="topbar"><div className="brand"><div className="brand-mark">S</div><div><strong>SupportDesk</strong><span>Ticket operations</span></div></div><button className="btn primary" onClick={()=>setShowCreate(true)}><Plus size={18}/> New ticket</button></header>
    <main className="container">
      <div className="hero"><div><p className="eyebrow">Support operations</p><h1>Ticket dashboard</h1><p>Track customer requests, prioritize work, and keep every issue moving.</p></div><button className="btn secondary" onClick={()=>load({silent:true})} disabled={refreshing}><RefreshCw size={16}/> {refreshing?'Refreshing…':'Refresh'}</button></div>
      <section className="stats"><Stat icon={<Inbox/>} label="Total tickets" value={summary.total}/><Stat icon={<Clock3/>} label="Open" value={summary.open}/><Stat icon={<SlidersHorizontal/>} label="In progress" value={summary.inProgress}/><Stat icon={<CheckCircle2/>} label="Resolved" value={summary.resolved}/></section>
      <section className="panel">
        <div className="toolbar"><div className="search"><Search size={18}/><input value={filters.search} onChange={e=>change('search',e.target.value)} placeholder="Search title or customer email…"/></div><div className="filters"><select value={filters.status} onChange={e=>change('status',e.target.value)}><option value="">All statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option></select><select value={filters.priority} onChange={e=>change('priority',e.target.value)}><option value="">All priorities</option><option>Low</option><option>Medium</option><option>High</option></select><select value={filters.sort} onChange={e=>change('sort',e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div></div>
        {error && <div className="alert">{error}</div>}
        {loading ? <div className="loading">Loading tickets…</div> : data.items.length===0 ? <div className="empty"><div className="empty-icon"><Inbox/></div><h3>No tickets found</h3><p>Try changing your search or filters.</p></div> : <>
          <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Customer</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>{data.items.map(t=><tr key={t.id} onClick={()=>setSelected(t.id)}><td><div className="ticket-title"><span>#{t.id}</span><strong>{t.title}</strong></div><small>{t.description.length>70?t.description.slice(0,70)+'…':t.description}</small></td><td>{t.customerEmail}</td><td><span className={`priority priority-${t.priority.toLowerCase()}`}>{t.priority}</span></td><td><StatusBadge value={t.status}/></td><td>{new Date(t.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
          <div className="pagination"><span>Showing {Math.min((data.pagination.page-1)*data.pagination.limit+1,data.pagination.total)}–{Math.min(data.pagination.page*data.pagination.limit,data.pagination.total)} of {data.pagination.total}</span><div><button disabled={data.pagination.page<=1} onClick={()=>change('page',data.pagination.page-1)}><ChevronLeft size={17}/></button><span>Page {data.pagination.page} of {Math.max(data.pagination.totalPages,1)}</span><button disabled={data.pagination.page>=data.pagination.totalPages} onClick={()=>change('page',data.pagination.page+1)}><ChevronRight size={17}/></button></div></div>
        </>}
      </section>
    </main>
    {showCreate&&<Modal title="Create support ticket" onClose={()=>setShowCreate(false)}><TicketForm onCancel={()=>setShowCreate(false)} onCreated={()=>{setShowCreate(false);setFilters(f=>({...f,page:1}));load()}}/></Modal>}
    {selected&&<TicketDrawer id={selected} onClose={()=>setSelected(null)} onUpdated={()=>load()}/>} 
  </div>
}
function Stat({icon,label,value}){return <div className="stat"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>}
