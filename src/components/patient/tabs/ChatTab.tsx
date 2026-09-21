import React, { useState } from 'react';
import { Appointment, ChatMessage } from '../../../types';
import { Clock, Send, MessageSquare } from 'lucide-react';

interface ChatTabProps {
  activeChatApt: Appointment | undefined;
  chatMessages: Record<string, ChatMessage[]>;
  sendChatMessage: (appointmentId: string, text: string, senderRole?: any) => void;
  onNavigateTab: (tabId: 'booking') => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  activeChatApt,
  chatMessages,
  sendChatMessage,
  onNavigateTab
}) => {
  const [chatInput, setChatInput] = useState('');
  const [chatTimerMinutes] = useState(48);

  const currentMessages = activeChatApt ? chatMessages[activeChatApt.id] || [] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatApt) return;
    sendChatMessage(activeChatApt.id, chatInput, 'PATIENT');
    setChatInput('');
  };

  if (!activeChatApt) {
    return (
      <div className="py-6">
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200/80 max-w-xl mx-auto shadow-xs">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Sesi Chat yang Sedang Aktif</h3>
          <p className="text-xs text-slate-500 mt-1">
            Ruang chat akan aktif saat jadwal konsultasi tiba atau Anda dapat membuat reservasi sesi baru.
          </p>
          <button
            onClick={() => onNavigateTab('booking')}
            className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Pesan Sesi Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs max-w-4xl mx-auto flex flex-col h-[640px]">
        {/* Chat Top Navigation Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              PSI
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                {activeChatApt.psychologistName}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-emerald-300">
                Sesi: {activeChatApt.packageName} • #{activeChatApt.bookingCode}
              </div>
            </div>
          </div>

          {/* Auto Timer Countdown */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Sisa Sesi:</span>
            <span className="font-mono font-bold text-amber-300">{chatTimerMinutes}:24 Menit</span>
          </div>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 custom-scrollbar">
          {currentMessages.map(msg => {
            const isMe = msg.senderRole === 'PATIENT';
            const isSys = msg.senderRole === 'SYSTEM';

            if (isSys) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="px-4 py-1.5 bg-slate-200/80 rounded-full text-[11px] text-slate-600 font-medium text-center max-w-md">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-emerald-700 text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className={`text-[10px] font-bold ${isMe ? 'text-emerald-200' : 'text-teal-700'}`}>
                      {msg.senderName}
                    </span>
                    <span className={`text-[10px] ${isMe ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Therapeutic Prompt Suggestions */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] custom-scrollbar">
          <span className="text-slate-400 font-bold whitespace-nowrap">Saran Percakapan:</span>
          {[
            'Dada saya terasa sesak saat bangun pagi',
            'Bagaimana cara latihan pernapasan 4-7-8?',
            'Saya cemas berlebih memikirkan presentasi kantor'
          ].map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                sendChatMessage(activeChatApt.id, prompt, 'PATIENT');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Chat Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Ketik pesan konsultasi Anda di sini..."
            className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};

