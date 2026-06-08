import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useElectionSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchSettings();
    intervalRef.current = setInterval(fetchSettings, 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  async function fetchSettings() {
    const { data } = await supabase.from('election_settings').select('*').single();
    if (data) setSettings(data);
    setLoading(false);
  }

  async function togglePolls(currentlyOpen, adminEmail) {
    const { error } = await supabase.from('election_settings').update({
      polls_open: !currentlyOpen,
      opened_at: !currentlyOpen ? new Date().toISOString() : undefined,
      closed_at: currentlyOpen ? new Date().toISOString() : undefined,
      opened_by: adminEmail,
      updated_at: new Date().toISOString(),
    }).eq('id', settings.id);
    if (!error) fetchSettings();
    return !error;
  }

  return { settings, loading, togglePolls };
}
