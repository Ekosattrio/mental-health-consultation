import React, { useState } from 'react';
import { Appointment, ChatMessage } from '../../../types';
import { Clock, Send, MessageSquare } from 'lucide-react';

interface ChatTabProps {
  activeChatApt: Appointment | undefined;
  chatMessages: Record<string, ChatMessage[]>;
  sendChatMessage: (appointmentId: string, text: string, senderRole?: any) => void;
  onOpenSoap: (patientId: string, aptId: string) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  activeChatApt,
  chatMessages,
  sendChatMessage,
  onOpenSoap
}) => {
  const [chatInput, setChatInput] = useState('');

  const currentMessages = activeChatApt ? chatMessages[activeChatApt.id] || [] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatApt) return;
    sendChatMessage(activeChatApt.id, chatInput, 'PSYCHOLOGIST');
    setChatInput('');
  };

  if (!activeChatApt) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 max-w-lg mx-auto shadow-xs">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Belum ada sesi janji temu yang aktif saat ini.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        {/* Chat View */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col h-[620px]">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                Pasien: {activeChatApt.patientName}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-sky-300">
                Kode: {activeChatApt.bookingCode} • {activeChatApt.packageName}
              </div>
            </div>
            <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sesi: {activeChatApt.startTime} - {activeChatApt.endTime}</span>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 custom-scrollbar">
            {currentMessages.map(msg => {
              const isMe = msg.senderRole === 'PSYCHOLOGIST';
              const isSys = msg.senderRole === 'SYSTEM';

              if (isSys) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="px-4 py-1.5 bg-slate-200/80 rounded-full text-[11px] text-slate-600 font-medium text-center">
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
                        ? 'bg-sky-700 text-white rounded-tr-none shadow-xs'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className={`text-[10px] font-bold ${isMe ? 'text-sky-200' : 'text-emerald-700'}`}>
                        {msg.senderName}
                      </span>
                      <span className={`text-[10px] ${isMe ? 'text-sky-300' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Tulis respons terapeutik psikolog..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden transition-all"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Kirim</span>
            </button>
          </form>
        </div>

        {/* Patient Quick Glance Drawer beside Chat */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs h-[620px] overflow-y-auto space-y-4 custom-scrollbar">
          <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Ringkasan Klien Saat Sesi
          </h4>

          <div className="text-xs space-y-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Pasien</span>
              <span className="font-bold text-slate-800">{activeChatApt.patientName}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Hasil Tes DASS-21</span>
              <span className="font-bold text-rose-600">Kategori Sedang (Skor 14)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Kecemasan: 5/7 • Stres: 5/7</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Keluhan Utama Intake</span>
              <p className="text-[11px] text-slate-700 mt-0.5">
                Burnout Pekerjaan, Kecemasan Berlebih (Anxiety), Sesak dada pagi hari.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenSoap(activeChatApt.patientId, activeChatApt.id)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
              >
                Buka Form Catatan SOAP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

