import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastMsg { id: number; type: ToastType; text: string }

let _msgs: ToastMsg[] = [];
let _listeners: Array<(msgs: ToastMsg[]) => void> = [];
let _nextId = 1;

function notify(text: string, type: ToastType = 'info', duration = 4000) {
  const id = _nextId++;
  _msgs = [..._msgs, { id, type, text }];
  _listeners.forEach(l => l(_msgs));
  setTimeout(() => {
    _msgs = _msgs.filter(m => m.id !== id);
    _listeners.forEach(l => l(_msgs));
  }, duration);
}

export const toast = {
  success: (text: string) => notify(text, 'success'),
  error:   (text: string) => notify(text, 'error'),
  info:    (text: string) => notify(text, 'info'),
};

export function useToastStore(): ToastMsg[] {
  const [msgs, setMsgs] = useState<ToastMsg[]>(_msgs);
  useEffect(() => {
    _listeners.push(setMsgs);
    return () => { _listeners = _listeners.filter(l => l !== setMsgs); };
  }, []);
  return msgs;
}
