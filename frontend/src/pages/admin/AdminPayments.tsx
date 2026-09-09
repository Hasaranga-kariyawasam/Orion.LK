import React, { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Edit3, Check, X } from 'lucide-react';
import { useAdmin, PaymentOption } from '../../context/AdminContext';

const PAYMENT_ICONS = ['🏦', '💳', '💵', '📱', '🔄', '🏧', '💎', '🌐'];

export default function AdminPayments() {
  const { paymentOptions, setPaymentOptions } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PaymentOption>>({});

  const addOption = () => {
    const newOpt: PaymentOption = {
      id: Date.now().toString(),
      name: 'New Payment Method',
      description: 'Payment method description',
      icon: '💳',
      enabled: true,
      details: '',
    };
    setPaymentOptions([...paymentOptions, newOpt]);
    setEditingId(newOpt.id);
    setEditData(newOpt);
  };

  const startEdit = (opt: PaymentOption) => {
    setEditingId(opt.id);
    setEditData({ ...opt });
  };

  const saveEdit = () => {
    setPaymentOptions(paymentOptions.map(o => o.id === editingId ? { ...o, ...editData } : o));
    setEditingId(null);
  };

  const toggleEnabled = (id: string) => {
    setPaymentOptions(paymentOptions.map(o => o.id === id ? { ...o, enabled: !o.enabled } : o));
  };

  const remove = (id: string) => {
    if (confirm('Delete this payment method?')) setPaymentOptions(paymentOptions.filter(o => o.id !== id));
  };

  const inputCls = "w-full bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Payment Options</h2>
          <p className="text-gray-500 text-sm mt-1">Manage payment methods shown to customers at checkout</p>
        </div>
        <button onClick={addOption} className="flex items-center gap-2 bg-[#2ee661] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#24c24e] transition-colors">
          <Plus size={18} /> Add Method
        </button>
      </div>

      {/* Active count */}
      <div className="flex gap-4">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl px-5 py-3">
          <span className="text-xs text-gray-500">Active</span>
          <p className="text-xl font-black text-[#2ee661]">{paymentOptions.filter(o => o.enabled).length}</p>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl px-5 py-3">
          <span className="text-xs text-gray-500">Disabled</span>
          <p className="text-xl font-black text-gray-500">{paymentOptions.filter(o => !o.enabled).length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {paymentOptions.map(opt => (
          <div key={opt.id} className={`bg-[#161B22] border rounded-2xl p-5 transition-all ${opt.enabled ? 'border-[#30363D]' : 'border-[#30363D]/30 opacity-50'}`}>
            {editingId === opt.id ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="flex gap-3">
                  <select value={editData.icon} onChange={e => setEditData(prev => ({ ...prev, icon: e.target.value }))}
                    className="bg-[#0d1117] border border-[#30363D] rounded-xl px-3 py-2 text-2xl w-16 text-center focus:outline-none focus:border-[#2ee661]/50">
                    {PAYMENT_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <input value={editData.name || ''} onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Method name" className={`flex-1 ${inputCls}`} />
                </div>
                <input value={editData.description || ''} onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Short description shown to customers" className={inputCls} />
                <textarea value={editData.details || ''} onChange={e => setEditData(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Detailed info (e.g. bank account number, instructions...)" rows={3}
                  className={`${inputCls} resize-none`} />
                <div className="flex gap-3">
                  <button onClick={saveEdit} className="flex items-center gap-2 px-5 py-2.5 bg-[#2ee661] text-black rounded-xl font-bold text-sm hover:bg-[#24c24e] transition-colors">
                    <Check size={16} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-2 px-5 py-2.5 bg-[#0d1117] border border-[#30363D] text-gray-400 rounded-xl font-bold text-sm hover:border-[#2ee661]/30 transition-colors">
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="flex items-start gap-4">
                <span className="text-3xl">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{opt.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${opt.enabled ? 'bg-[#2ee661]/10 text-[#2ee661]' : 'bg-gray-500/10 text-gray-500'}`}>
                      {opt.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{opt.description}</p>
                  {opt.details && (
                    <pre className="text-gray-600 text-xs mt-2 whitespace-pre-wrap font-mono">{opt.details}</pre>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleEnabled(opt.id)}
                    className={`p-2 rounded-xl transition-colors border ${opt.enabled ? 'text-[#2ee661] border-[#2ee661]/20 hover:bg-[#2ee661]/10' : 'text-gray-500 border-[#30363D] hover:border-[#2ee661]/30'}`}>
                    {opt.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => startEdit(opt)} className="p-2 rounded-xl border border-[#30363D] text-gray-400 hover:text-blue-400 hover:border-blue-400/20 transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => remove(opt.id)} className="p-2 rounded-xl border border-[#30363D] text-gray-400 hover:text-red-400 hover:border-red-400/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <button onClick={addOption}
          className="w-full border-2 border-dashed border-[#30363D] hover:border-[#2ee661]/50 text-gray-600 hover:text-[#2ee661] py-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
          <Plus size={20} /> Add Payment Method
        </button>
      </div>
    </div>
  );
}
