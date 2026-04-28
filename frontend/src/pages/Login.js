import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await api.post('/auth/register', form);
        toast.success('Registered! Please login.');
        setIsRegister(false);
      } else {
        const res = await api.post('/auth/login', form);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('manager', JSON.stringify(res.data.manager));
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>📈</div>
        <h1 style={styles.title}>Portfolio Manager</h1>
        <p style={styles.sub}>{isRegister ? 'Create your account' : 'Sign in to your account'}</p>
        <form onSubmit={handle}>
          {isRegister && (
            <input style={styles.input} placeholder="Full Name"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          )}
          <input style={styles.input} placeholder="Email" type="email"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={styles.input} placeholder="Password" type="password"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={styles.toggle}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span style={styles.link} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0f0f' },
  card: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'48px 40px', width:'100%', maxWidth:'420px' },
  logo: { fontSize:'48px', textAlign:'center', marginBottom:'16px' },
  title: { fontSize:'24px', fontWeight:'700', textAlign:'center', color:'#fff', marginBottom:'8px' },
  sub: { color:'#666', textAlign:'center', marginBottom:'32px', fontSize:'14px' },
  input: { width:'100%', padding:'12px 16px', marginBottom:'12px', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', color:'#e0e0e0', fontSize:'14px', display:'block' },
  btn: { width:'100%', padding:'13px', background:'#00c853', border:'none', borderRadius:'8px', color:'#000', fontWeight:'700', fontSize:'15px', cursor:'pointer', marginTop:'8px' },
  toggle: { textAlign:'center', marginTop:'24px', color:'#666', fontSize:'14px' },
  link: { color:'#00c853', cursor:'pointer', fontWeight:'600' }
};
