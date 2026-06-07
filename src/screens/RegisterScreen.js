import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COUNTIES, CONSTITUENCIES, WARDS } from '../data/kenyaData';
import { supabase } from '../lib/supabase';
import { AppButton, Card, COLORS } from '../components/UI';

export default function RegisterScreen({ navigation }) {
  const [nationalId, setNationalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [county, setCounty] = useState('');
  const [constituency, setConstituency] = useState('');
  const [ward, setWard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const constituencies = county ? (CONSTITUENCIES[county] || []) : [];
  const wards = constituency ? (WARDS[constituency] || []) : [];

  async function handleRegister() {
    setError('');
    if (!nationalId.trim()) { setError('Enter your National ID number.'); return; }
    if (nationalId.trim().length < 6) { setError('ID must be at least 6 digits.'); return; }
    if (!fullName.trim()) { setError('Enter your full name.'); return; }
    if (!county) { setError('Select your county.'); return; }
    if (!constituency) { setError('Select your constituency.'); return; }
    if (!ward) { setError('Select your ward.'); return; }

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('voters')
        .select('id')
        .eq('national_id', nationalId.trim())
        .single();

      if (existing) {
        setError('This ID is already registered. Proceed to verify and vote.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('voters').insert({
        national_id: nationalId.trim(),
        full_name: fullName.trim(),
        county,
        constituency,
        ward,
      });

      if (insertError) throw insertError;

      Alert.alert(
        'Registration Successful',
        'You are now registered. Proceed to verify your identity and vote.',
        [{ text: 'Proceed to Vote', onPress: () => navigation.navigate('Verify') }]
      );
    } catch (e) {
      setError('Registration failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Voter Registration</Text>
      <Text style={styles.subtitle}>Register to participate in the election. You only need to do this once.</Text>
      <Card>
        <Text style={styles.label}>National ID Number *</Text>
        <TextInput style={styles.input} value={nationalId} onChangeText={v => { setNationalId(v); setError(''); }}
          placeholder="e.g. 28345671" keyboardType="numeric" maxLength={9}
          placeholderTextColor={COLORS.textLight} />
        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={v => { setFullName(v); setError(''); }}
          placeholder="e.g. Jane Wanjiku Mwangi" autoCapitalize="words"
          placeholderTextColor={COLORS.textLight} />
        <Text style={styles.label}>County *</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={county} onValueChange={v => { setCounty(v); setConstituency(''); setWard(''); }} style={styles.picker}>
            <Picker.Item label="— Select County —" value="" />
            {COUNTIES.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
          </Picker>
        </View>
        <Text style={styles.label}>Constituency *</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={constituency} onValueChange={v => { setConstituency(v); setWard(''); }} style={styles.picker} enabled={!!county}>
            <Picker.Item label={county ? '— Select Constituency —' : '— Select county first —'} value="" />
            {constituencies.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
          </Picker>
        </View>
        <Text style={styles.label}>Ward *</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={ward} onValueChange={v => setWard(v)} style={styles.picker} enabled={!!constituency}>
            <Picker.Item label={constituency ? '— Select Ward —' : '— Select constituency first —'} value="" />
            {wards.map(w => <Picker.Item key={w.id} label={w.name} value={w.id} />)}
          </Picker>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title={loading ? 'Registering...' : 'Register as Voter'}
          onPress={handleRegister} loading={loading} style={{ marginTop: 12 }} />
      </Card>
      <Text style={styles.note}>Already registered? <Text style={styles.link} onPress={() => navigation.navigate('Verify')}>Proceed to verify and vote</Text></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 16, lineHeight: 20 },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4, marginTop: 12, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 15, color: COLORS.text, backgroundColor: '#FAFAFA' },
  pickerWrap: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: '#FAFAFA', overflow: 'hidden' },
  picker: { height: 50, color: COLORS.text },
  error: { color: COLORS.danger, fontSize: 13, marginTop: 8 },
  note: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
  link: { color: COLORS.primary, fontWeight: '500' },
});
