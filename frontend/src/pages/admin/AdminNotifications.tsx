import React, { useEffect, useState } from 'react';
import { Bell, Send, Trash2, Users } from 'lucide-react';
import { broadcastAdminNotification, deleteAdminNotification } from '../../lib/api';

interface SentNotification {
  id: string;
  title: string;
  message: string;
  sentAt: string;
}

const HISTORY_KEY = 'admin_sent_notifications';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [history, setHistory] = useState<SentNotification[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const sendNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Enter both a notification title and message.' });
      return;
    }

    setSending(true);
    try {
      const notification = await broadcastAdminNotification(title.trim(), message.trim());
      const sent: SentNotification = {
        id: notification.id,
        title: title.trim(),
        message: message.trim(),
        sentAt: new Date().toLocaleString(),
      };
      const nextHistory = [sent, ...history].slice(0, 20);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      setTitle('');
      setMessage('');
      setFeedback({ type: 'success', text: 'Notification sent to all customers.' });
    } catch (error: any) {
      setFeedback({ type: 'error', text: error.message || 'Could not send notification.' });
    } finally {
      setSending(false);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await deleteAdminNotification(id);
      const nextHistory = history.filter(item => item.id !== id);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      setFeedback({ type: 'success', text: 'Notification deleted for all customers.' });
    } catch (error: any) {
      setFeedback({ type: 'error', text: error.message || 'Could not delete notification.' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-white">Customer Notifications</h2>
        <p className="text-gray-500 text-sm mt-1">Send an announcement to every registered customer</p>
      </div>

      {feedback && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${feedback.type === 'success'
          ? 'border-[#2ee661]/30 bg-[#2ee661]/10 text-[#2ee661]'
          : 'border-red-400/30 bg-red-400/10 text-red-300'}`}>
          {feedback.text}
        </div>
      )}

      <form onSubmit={sendNotification} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-[#30363D] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#2ee661]/10 text-[#2ee661] flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">New announcement</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Users size={12} /> All registered customers</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={80} placeholder="e.g. New weekend offer"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#2ee661]/50" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={300} rows={5} placeholder="Write the notification message..."
            className="w-full bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-[#2ee661]/50" />
          <p className="text-[11px] text-gray-600 mt-1 text-right">{message.length}/300</p>
        </div>
        <button type="submit" disabled={sending || !title.trim() || !message.trim()}
          className="flex items-center gap-2 bg-[#2ee661] text-black px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#24c24e] disabled:opacity-50 disabled:cursor-not-allowed">
          <Send size={16} /> {sending ? 'Sending...' : 'Send to All Customers'}
        </button>
      </form>

      <section className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#30363D]">
          <h3 className="font-bold text-white">Sent from this admin browser</h3>
          <p className="text-xs text-gray-500 mt-1">Recent announcements</p>
        </div>
        {history.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No announcements sent yet.</p>
        ) : history.map(item => (
          <div key={item.id} className="p-5 border-b border-[#30363D]/50 last:border-0">
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-gray-500">{item.sentAt}</span>
                <button
                  type="button"
                  onClick={() => void removeNotification(item.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  aria-label={`Delete notification ${item.title}`}
                  title="Delete for all customers"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">{item.message}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
