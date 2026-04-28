import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const navigate = useNavigate();
  const manager = JSON.parse(localStorage.getItem('manager') || '{}');

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch { toast.error('Failed to load clients'); }
  };

  const addClient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', form);
      toast.success('Client added!');
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '' });
      fetchClients();
    } catch { toast.error('Failed to add client'); }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client removed');
      fetchClients();
    } catch { toast.error('Failed to delete'); }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📈 Portfolio Manager</h1>
          <p style={styles.sub}>Welcome, {manager.name}</p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.content}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Your Clients</h2>
          <button onClick={() => setShowAdd(true)} style={styles.addBtn}>+ Add Client</button>
        </div>

        {clients.length === 0 ? (
          <div style={styles.empty}>No clients yet. Add your first client!</div>
        ) : (
          <div style={styles.grid}>
            {clients.map(c => (
              <div key={c.id} style={styles.card}>
                <div style={styles.avatar}>{c.name[0].toUpperCase()}</div>
                <div style={styles.clientInfo}>
                  <h3 style={styles.clientName}>{c.name}</h3>
                  <p style={styles.clientDetail}>{c.email}</p>
                  <p style={styles.clientDetail}>{c.phone}</p>
                </div>
                <div style={styles.cardActions}>
                  <button onClick={() => navigate(`/portfolio/${c.id}`, { state: { clientName: c.name } })} style={styles.viewBtn}>View Portfolio</button>
                  <button onClick={() => deleteClient(c.id)} style={styles.deleteBtn}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add New Client</h2>
            <form onSubmit={addClient}>
              <input style={styles.input} placeholder="Client Name" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
              <input style={styles.input} placeholder="Email" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} />
              <input style={styles.input} placeholder="Phone" value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})} />
              <div style={styles.modalBtns}>
                <button type="button" onClick={() => setShowAdd(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.addBtn}>Add Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight:'100vh', background:'#0f0f0f' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'24px 40px', borderBottom:'1px solid #1e1e1e', background:'#1a1a1a' },
  title: { fontSize:'22px', fontWeight:'700', color:'#fff' },
  sub: { color:'#666', fontSize:'13px', marginTop:'4px' },
  logoutBtn: { padding:'8px 20px', background:'transparent', border:'1px solid #333', borderRadius:'8px', color:'#999', cursor:'pointer' },
  content: { padding:'40px' },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  sectionTitle: { fontSize:'18px', fontWeight:'600', color:'#fff' },
  addBtn: { padding:'10px 20px', background:'#00c853', border:'none', borderRadius:'8px', color:'#000', fontWeight:'700', cursor:'pointer' },
  empty: { textAlign:'center', color:'#444', padding:'80px', fontSize:'16px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'16px' },
  card: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'24px', display:'flex', flexDirection:'column', gap:'16px' },
  avatar: { width:'48px', height:'48px', borderRadius:'50%', background:'#00c853', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'20px' },
  clientInfo: { flex:1 },
  clientName: { fontSize:'16px', fontWeight:'600', color:'#fff', marginBottom:'4px' },
  clientDetail: { fontSize:'13px', color:'#666', marginBottom:'2px' },
  cardActions: { display:'flex', gap:'8px' },
  viewBtn: { flex:1, padding:'9px', background:'#00c85320', border:'1px solid #00c853', borderRadius:'8px', color:'#00c853', cursor:'pointer', fontWeight:'600', fontSize:'13px' },
  deleteBtn: { padding:'9px 16px', background:'transparent', border:'1px solid #333', borderRadius:'8px', color:'#666', cursor:'pointer', fontSize:'13px' },
  overlay: { position:'fixed', inset:0, background:'#000000aa', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 },
  modal: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'420px' },
  modalTitle: { fontSize:'18px', fontWeight:'700', color:'#fff', marginBottom:'24px' },
  input: { width:'100%', padding:'12px 16px', marginBottom:'12px', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', color:'#e0e0e0', fontSize:'14px', display:'block' },
  modalBtns: { display:'flex', gap:'12px', marginTop:'8px' },
  cancelBtn: { flex:1, padding:'11px', background:'transparent', border:'1px solid #333', borderRadius:'8px', color:'#999', cursor:'pointer' },
};
