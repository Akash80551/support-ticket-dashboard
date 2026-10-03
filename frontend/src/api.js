class ApiError extends Error {
  constructor(message, fields = {}) { super(message); this.name='ApiError'; this.fields=fields; }
}
const request=async(url,options={})=>{
  const res=await fetch(url,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const body=await res.json().catch(()=>({}));
  if(!res.ok) throw new ApiError(body?.error?.message || 'Something went wrong. Please try again.',body?.error?.fields || {});
  return body.data;
};
export const getSummary=()=>request('/api/tickets/summary');
export const getTickets=(params)=>request(`/api/tickets?${new URLSearchParams(params)}`);
export const getTicket=(id)=>request(`/api/tickets/${id}`);
export const createTicket=(payload)=>request('/api/tickets',{method:'POST',body:JSON.stringify(payload)});
export const updateTicket=(id,payload)=>request(`/api/tickets/${id}`,{method:'PATCH',body:JSON.stringify(payload)});
