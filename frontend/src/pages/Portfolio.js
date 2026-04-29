import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

export default function Portfolio() {
  const { clientId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showSell, setShowSell] = useState(null);
  const [form, setForm] = useState({ symbol: '', quantity: '', buy_price: '', buy_date: '' });
  const [sellForm, setSellForm] = useState({ sell_price: '', sell_date: '' });
  const [fetchingPrice, setFetchingPrice] = useState(false);

useEffect(() => { fetchPortfolio(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPortfolio = async () => {
    try {
      const res = await api.get(`/portfolio/${clientId}`);
      console.log('Holdings data:', res.data); // debug
      setHoldings(res.data);
    } catch { toast.error('Failed to load portfolio'); }
  };

  const fetchLivePrice = async () => {
    if (!form.symbol) return;
    setFetchingPrice(true);
    try {
      const res = await api.get(`/stocks/${form.symbol}`);
      setForm(f => ({ ...f, buy_price: res.data.price }));
      toast.success(`Live price: ₹${res.data.price}`);
    } catch { toast.error('Could not fetch price'); }
    setFetchingPrice(false);
  };

  const addHolding = async (e) => {
    e.preventDefault();
    try {
      await api.post('/portfolio', { ...form, client_id: clientId, company_name: form.symbol });
      toast.success('Stock added!');
      setShowAdd(false);
      setForm({ symbol: '', quantity: '', buy_price: '', buy_date: '' });
      fetchPortfolio();
    } catch { toast.error('Failed to add stock'); }
  };

  const sellHolding = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/portfolio/${showSell}/sell`, sellForm);
      toast.success('Stock sold!');
      setShowSell(null);
      fetchPortfolio();
    } catch { toast.error('Failed to sell'); }
  };

  const deleteHolding = async (id) => {
    if (!window.confirm('Remove this stock?')) return;
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('Stock removed');
      fetchPortfolio();
    } catch { toast.error('Failed to remove'); }
  };

  // Fix: handle both camelCase and lowercase field names from PostgreSQL
  const getVal = (h, ...keys) => {
    for (const k of keys) {
      if (h[k] !== undefined && h[k] !== null) return parseFloat(h[k]);
    }
    return 0;
  };

  const totalInvested = holdings.reduce((s, h) => s + getVal(h, 'investedAmount', 'investedamount'), 0);
  const totalCurrent = holdings.reduce((s, h) => s + getVal(h, 'currentAmount', 'currentamount'), 0);
  const totalPnl = holdings.reduce((s, h) => s + getVal(h, 'pnl'), 0);

  const printBill = (h) => {
    const invested = getVal(h, 'investedAmount', 'investedamount');
    const pnl = getVal(h, 'pnl');
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Trade Bill</title>
      <style>body{font-family:sans-serif;padding:40px;} h1{color:#333;} table{width:100%;border-collapse:collapse;margin-top:20px;} td,th{padding:12px;border:1px solid #ddd;text-align:left;} .pnl{color:${pnl>=0?'green':'red'};font-weight:bold;}</style>
      </head><body>
      <h1>📈 Portfolio Manager — Trade Bill</h1>
      <p><strong>Stock:</strong> ${h.symbol} — ${h.company_name}</p>
      <table>
        <tr><th>Field</th><th>Value</th></tr>
        <tr><td>Quantity</td><td>${h.quantity}</td></tr>
        <tr><td>Buy Price</td><td>₹${h.buy_price}</td></tr>
        <tr><td>Buy Date</td><td>${h.buy_date?.slice(0,10)}</td></tr>
        <tr><td>Sell Price</td><td>${h.sell_price ? '₹'+h.sell_price : 'Still Holding'}</td></tr>
        <tr><td>Sell Date</td><td>${h.sell_date?.slice(0,10) || '—'}</td></tr>
        <tr><td>Invested Amount</td><td>₹${invested.toFixed(2)}</td></tr>
        <tr><td>Current Value</td><td>₹${current.toFixed(2)}</td></tr>
        <tr><td>P&L</td><td class="pnl">${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)}</td></tr>
      </table>
      <p style="margin-top:30px;color:#999;">Generated on ${new Date().toLocaleString()}</p>
      </body></html>`);
    win.print();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
          <h1 style={styles.title}>{state?.clientName || 'Client'}'s Portfolio</h1>
        </div>
        <button onClick={() => setShowAdd(true)} style={styles.addBtn}>+ Add Stock</button>
      </div>

      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Invested</p>
          <p style={styles.summaryValue}>₹{totalInvested.toFixed(2)}</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Current Value</p>
          <p style={styles.summaryValue}>₹{totalCurrent.toFixed(2)}</p>
        </div>
        <div style={{...styles.summaryCard, borderColor: totalPnl >= 0 ? '#00c853' : '#ff1744'}}>
          <p style={styles.summaryLabel}>P&L</p>
          <p style={{...styles.summaryValue, color: totalPnl >= 0 ? '#00c853' : '#ff1744'}}>
            {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toFixed(2)}
          </p>
        </div>
      </div>

      {holdings.length === 0 ? (
        <div style={styles.empty}>No stocks yet. Add your first stock!</div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Symbol</span><span>Qty</span><span>Buy Price</span>
            <span>Current</span><span>Invested</span><span>P&L</span><span>Actions</span>
          </div>
          {holdings.map(h => {
            const invested = getVal(h, 'investedAmount', 'investedamount');
            const current = getVal(h, 'currentAmount', 'currentamount');
            const currentPrice = getVal(h, 'currentPrice', 'currentprice');
            const pnl = getVal(h, 'pnl');
            return (
              <div key={h.id} style={styles.tableRow}>
                <span style={styles.symbol}>{h.symbol}</span>
                <span>{h.quantity}</span>
                <span>₹{h.buy_price}</span>
                <span>₹{currentPrice.toFixed(2)}</span>
                <span>₹{invested.toFixed(2)}</span>
                <span style={{color: pnl >= 0 ? '#00c853' : '#ff1744', fontWeight:'600'}}>
                  {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                </span>
                <span style={styles.actions}>
                  <button onClick={() => printBill(h)} style={styles.billBtn}>Bill</button>
                  {!h.sell_price && <button onClick={() => setShowSell(h.id)} style={styles.sellBtn}>Sell</button>}
                  <button onClick={() => deleteHolding(h.id)} style={styles.deleteBtn}>✕</button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add Stock</h2>
            <form onSubmit={addHolding}>
              <div style={{display:'flex', gap:'8px'}}>
                <input style={{...styles.input, flex:1}} placeholder="NSE Symbol (e.g. TCS)" value={form.symbol}
                  onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} required />
                <button type="button" onClick={fetchLivePrice} style={styles.fetchBtn} disabled={fetchingPrice}>
                  {fetchingPrice ? '...' : '₹ Live'}
                </button>
              </div>
              <input style={styles.input} placeholder="Quantity" type="number" value={form.quantity}
                onChange={e => setForm({...form, quantity: e.target.value})} required />
              <input style={styles.input} placeholder="Buy Price (₹)" type="number" value={form.buy_price}
                onChange={e => setForm({...form, buy_price: e.target.value})} required />
              <input style={styles.input} type="date" value={form.buy_date}
                onChange={e => setForm({...form, buy_date: e.target.value})} required />
              <div style={styles.modalBtns}>
                <button type="button" onClick={() => setShowAdd(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.addBtn}>Add Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSell && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Sell Stock</h2>
            <form onSubmit={sellHolding}>
              <input style={styles.input} placeholder="Sell Price (₹)" type="number" value={sellForm.sell_price}
                onChange={e => setSellForm({...sellForm, sell_price: e.target.value})} required />
              <input style={styles.input} type="date" value={sellForm.sell_date}
                onChange={e => setSellForm({...sellForm, sell_date: e.target.value})} required />
              <div style={styles.modalBtns}>
                <button type="button" onClick={() => setShowSell(null)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={{...styles.addBtn, background:'#ff1744', color:'#fff'}}>Sell</button>
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
  backBtn: { background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:'14px', marginBottom:'4px', padding:0 },
  title: { fontSize:'20px', fontWeight:'700', color:'#fff' },
  addBtn: { padding:'10px 20px', background:'#00c853', border:'none', borderRadius:'8px', color:'#000', fontWeight:'700', cursor:'pointer' },
  summaryRow: { display:'flex', gap:'16px', padding:'24px 40px' },
  summaryCard: { flex:1, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'20px' },
  summaryLabel: { color:'#666', fontSize:'13px', marginBottom:'8px' },
  summaryValue: { fontSize:'22px', fontWeight:'700', color:'#fff' },
  empty: { textAlign:'center', color:'#444', padding:'80px' },
  table: { margin:'0 40px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', overflow:'hidden' },
  tableHeader: { display:'grid', gridTemplateColumns:'1fr 0.5fr 1fr 1fr 1fr 1fr 1.2fr', padding:'14px 20px', background:'#111', color:'#555', fontSize:'12px', textTransform:'uppercase', gap:'8px' },
  tableRow: { display:'grid', gridTemplateColumns:'1fr 0.5fr 1fr 1fr 1fr 1fr 1.2fr', padding:'16px 20px', borderTop:'1px solid #222', alignItems:'center', gap:'8px', fontSize:'14px' },
  symbol: { fontWeight:'700', color:'#fff' },
  actions: { display:'flex', gap:'6px' },
  billBtn: { padding:'5px 10px', background:'#1a237e20', border:'1px solid #3949ab', borderRadius:'6px', color:'#7986cb', cursor:'pointer', fontSize:'12px' },
  sellBtn: { padding:'5px 10px', background:'#ff174420', border:'1px solid #ff1744', borderRadius:'6px', color:'#ff1744', cursor:'pointer', fontSize:'12px' },
  deleteBtn: { padding:'5px 10px', background:'transparent', border:'1px solid #333', borderRadius:'6px', color:'#555', cursor:'pointer', fontSize:'12px' },
  overlay: { position:'fixed', inset:0, background:'#000000aa', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 },
  modal: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'420px' },
  modalTitle: { fontSize:'18px', fontWeight:'700', color:'#fff', marginBottom:'24px' },
  input: { width:'100%', padding:'12px 16px', marginBottom:'12px', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', color:'#e0e0e0', fontSize:'14px', display:'block' },
  fetchBtn: { padding:'12px 16px', background:'#1a237e', border:'1px solid #3949ab', borderRadius:'8px', color:'#7986cb', cursor:'pointer', fontWeight:'600', marginBottom:'12px' },
  modalBtns: { display:'flex', gap:'12px', marginTop:'8px' },
  cancelBtn: { flex:1, padding:'11px', background:'transparent', border:'1px solid #333', borderRadius:'8px', color:'#999', cursor:'pointer' },
};
