import { useState } from 'react';
import { createTicket } from '../api';
const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function TicketForm({onCreated,onCancel}){
  const [form,setForm]=useState({title:'',description:'',customerEmail:'',priority:'Medium'});
  const [errors,setErrors]=useState({}); const [saving,setSaving]=useState(false);
  const change=e=>{const {name,value}=e.target;setForm(f=>({...f,[name]:value}));setErrors(e=>({...e,[name]:'',general:''}));};
  function validate(){const e={};if(!form.title.trim())e.title='Title is required.';else if(form.title.trim().length>120)e.title='Title must be 120 characters or fewer.';if(!form.description.trim())e.description='Description is required.';if(!form.customerEmail.trim())e.customerEmail='Customer email is required.';else if(!emailRegex.test(form.customerEmail.trim()))e.customerEmail='Enter a valid email address.';return e;}
  async function submit(e){e.preventDefault();const clientErrors=validate();if(Object.keys(clientErrors).length){setErrors(clientErrors);return;}setErrors({});setSaving(true);try{const ticket=await createTicket({...form,title:form.title.trim(),description:form.description.trim(),customerEmail:form.customerEmail.trim()});onCreated(ticket);}catch(err){setErrors({general:err.message,...(err.fields||{})});}finally{setSaving(false);}}
  return <form onSubmit={submit} className="form" noValidate>
    {errors.general&&<div className="alert">{errors.general}</div>}
    <label>Title<span>*</span><input name="title" maxLength="120" value={form.title} onChange={change} placeholder="Briefly describe the issue" aria-invalid={Boolean(errors.title)}/>{errors.title?<small className="field-error">{errors.title}</small>:<small>{form.title.length}/120</small>}</label>
    <label>Description<span>*</span><textarea name="description" rows="5" value={form.description} onChange={change} placeholder="Describe the customer issue" aria-invalid={Boolean(errors.description)}/>{errors.description&&<small className="field-error">{errors.description}</small>}</label>
    <label>Customer email<span>*</span><input type="email" name="customerEmail" value={form.customerEmail} onChange={change} placeholder="customer@example.com" aria-invalid={Boolean(errors.customerEmail)}/>{errors.customerEmail&&<small className="field-error">{errors.customerEmail}</small>}</label>
    <label>Priority<span>*</span><select name="priority" value={form.priority} onChange={change}><option>Low</option><option>Medium</option><option>High</option></select>{errors.priority&&<small className="field-error">{errors.priority}</small>}</label>
    <div className="form-actions"><button type="button" className="btn secondary" onClick={onCancel} disabled={saving}>Cancel</button><button className="btn primary" disabled={saving}>{saving?'Creating…':'Create ticket'}</button></div>
  </form>;
}
