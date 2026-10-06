import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle, ArrowRight, CheckCircle2, CreditCard, ExternalLink,
  FlaskConical, ShieldCheck, XCircle,
} from 'lucide-react';
import { createPayHereRecurringPayment } from '../lib/api';

const SUCCESS_CARDS = [
  ['Visa', '4916217501611292'],
  ['Mastercard', '5307732125531191'],
  ['AMEX', '346781005510225'],
];

const DECLINE_CARDS = [
  ['Insufficient funds', '4024007194349121'],
  ['Limit exceeded', '4929119799365646'],
  ['Do not honor', '4929768900837248'],
  ['Network error', '4024007120869333'],
];

function ResultPage({ type }: { type: 'success' | 'cancel' | 'error' }) {
  const config = {
    success: {
      icon: <CheckCircle2 size={34} />,
      title: 'Sandbox payment authorized',
      message: 'PayHere returned successfully. Check your notify endpoint for the authorization event.',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    cancel: {
      icon: <XCircle size={34} />,
      title: 'Sandbox payment cancelled',
      message: 'No payment was completed. You can safely return to the Sandbox test page.',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    error: {
      icon: <AlertCircle size={34} />,
      title: 'Sandbox payment failed',
      message: 'PayHere could not authorize this test payment. Review the selected test card and try again.',
      color: 'text-red-700 bg-red-50 border-red-200',
    },
  }[type];

  return (
    <div className="min-h-[70vh] bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm md:p-12">
        <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border ${config.color}`}>
          {config.icon}
        </div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#12b94b]">PayHere Sandbox</p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">{config.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">{config.message}</p>
        <Link to="/payhere-sandbox" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1cd75b] px-5 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-[#18c251]">
          Back to Sandbox Tests <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

export default function PayHereSandbox() {
  const location = useLocation();
  const path = location.pathname;
  if (path.endsWith('/success')) return <ResultPage type="success" />;
  if (path.endsWith('/cancel')) return <ResultPage type="cancel" />;
  if (path.endsWith('/error')) return <ResultPage type="error" />;

  const [amount, setAmount] = useState('100.00');
  const [recurrence, setRecurrence] = useState('1 Month');
  const [duration, setDuration] = useState('3 Month');
  const [customer, setCustomer] = useState({ firstName: 'Sandbox', lastName: 'Tester', email: 'tester@example.com', phone: '0771234567', address: 'No. 1, Test Street', city: 'Colombo' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const updateCustomer = (field: keyof typeof customer, value: string) => setCustomer(prev => ({ ...prev, [field]: value }));

  const startRecurringPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payment = await createPayHereRecurringPayment({
        amount: Number(amount),
        recurrence,
        duration,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
      });

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payment.actionUrl;
      const fields = { ...payment, actionUrl: undefined };
      Object.entries(fields).forEach(([name, value]) => {
        if (value === undefined) return;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = String(value);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err.message || 'Unable to start PayHere Sandbox recurring payment.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#12b94b]"><FlaskConical size={16} /> Integration Lab</div>
              <h1 className="max-w-2xl text-3xl font-black uppercase tracking-tight text-gray-900 md:text-5xl">PayHere Sandbox</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">Test recurring payment authorization safely. Sandbox payments are simulated and do not charge a real card.</p>
            </div>
            <a href="https://support.payhere.lk/api-&-mobile-sdk/recurring-api" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-600 hover:text-black"><ExternalLink size={14} /> Recurring API docs</a>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1.25fr_0.75fr]">
        <form onSubmit={startRecurringPayment} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1cd75b]/10 text-[#12b94b]"><CreditCard size={20} /></div><div><h2 className="text-xl font-black uppercase text-gray-900">Recurring test payment</h2><p className="text-xs text-gray-500">The first authorization opens in PayHere Sandbox.</p></div></div>
          {error && <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700"><AlertCircle size={16} />{error}</div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase text-gray-600">Amount (LKR)<input required min="10" step="0.01" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#1cd75b]" /></label>
            <label className="text-xs font-bold uppercase text-gray-600">Recurrence<select value={recurrence} onChange={e => setRecurrence(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#1cd75b]"><option>1 Week</option><option>1 Month</option><option>3 Month</option><option>1 Year</option></select></label>
            <label className="text-xs font-bold uppercase text-gray-600">Duration<select value={duration} onChange={e => setDuration(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#1cd75b]"><option>1 Month</option><option>3 Month</option><option>1 Year</option><option>Forever</option></select></label>
            <label className="text-xs font-bold uppercase text-gray-600">Email<input required type="email" value={customer.email} onChange={e => updateCustomer('email', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#1cd75b]" /></label>
            <label className="text-xs font-bold uppercase text-gray-600">First name<input required value={customer.firstName} onChange={e => updateCustomer('firstName', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#1cd75b]" /></label>
            <label className="text-xs font-bold uppercase text-gray-600">Last name<input required value={customer.lastName} onChange={e => updateCustomer('lastName', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#1cd75b]" /></label>
            <label className="text-xs font-bold uppercase text-gray-600">Phone<input required value={customer.phone} onChange={e => updateCustomer('phone', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#1cd75b]" /></label>
            <label className="text-xs font-bold uppercase text-gray-600">City<input required value={customer.city} onChange={e => updateCustomer('city', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#1cd75b]" /></label>
          </div>
          <label className="mt-5 block text-xs font-bold uppercase text-gray-600">Address<input required value={customer.address} onChange={e => updateCustomer('address', e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#1cd75b]" /></label>
          <button disabled={busy} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1cd75b] py-4 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-green-500/20 hover:bg-[#18c251] disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Opening PayHere...' : 'Start Sandbox Subscription'} <ArrowRight size={16} /></button>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-bold text-gray-500"><ShieldCheck size={15} className="text-[#1cd75b]" /> Merchant secret stays on the backend.</p>
        </form>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-900">Successful test cards</h2><div className="space-y-3">{SUCCESS_CARDS.map(([brand, number]) => <div key={brand} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 text-xs"><span className="font-bold text-gray-600">{brand}</span><code className="font-bold text-gray-900">{number}</code></div>)}</div><p className="mt-4 text-xs leading-5 text-gray-500">Use any valid future expiry date and any valid CVV in Sandbox.</p></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="mb-4 text-sm font-black uppercase tracking-wider text-amber-900">Decline scenarios</h2><div className="space-y-2">{DECLINE_CARDS.map(([label, number]) => <div key={label} className="flex items-center justify-between gap-3 text-xs text-amber-800"><span>{label}</span><code className="font-bold">{number}</code></div>)}</div></div>
          <div className="rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white"><p className="text-xs font-black uppercase tracking-wider text-[#1cd75b]">Sandbox behavior</p><p className="mt-2 text-sm leading-6 text-gray-300">Recurring installments are accelerated in Sandbox, so the next notification can arrive about one minute after authorization. Use a public URL for notify callbacks.</p></div>
        </aside>
      </main>
    </div>
  );
}
