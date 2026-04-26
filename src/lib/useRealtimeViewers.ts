import { useEffect, useState, useRef } from 'react';
import { supabase } from './supabase';

// Відстежує скільки людей зараз дивляться на конкретне авто
// Використовує Supabase Realtime Presence
export function useRealtimeViewers(carId: string | number | undefined) {
  const [count, setCount] = useState(0);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!carId) return;

    const channelName = `car-viewers-${carId}`;
    const userId = Math.random().toString(36).slice(2); // анонімний ID сесії

    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ car_id: carId, ts: Date.now() });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [carId]);

  return count;
}

