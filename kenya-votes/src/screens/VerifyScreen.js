import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COUNTIES, CONSTITUENCIES, WARDS, ADMIN_PIN } from '../data/kenyaData';
import { useElection } from '../context/ElectionContext';
import { AppButton, Card, COLORS, SectionHeader } from '../components/UI';

export default function VerifyScreen({ navigation }) {
  const { state, dispatch } = useElection();
  const [nationalId, setNationalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [county, setCounty] = useState('');
  const [constituency, setConstituency] = useState('');
  const [ward, setWard] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const constituencies = county ? (CONSTITUENCIES[county] || []) : [];
  const wards = constituency ? (WARDS[constituency] || []) : [];

  function validate() {
    if (!nationalId.trim()) return 'Enter your National ID number.';
    if (nationalId.trim().length < 6) return 'ID must be at least 6 digits.';
    if (!fullName.trim()) return 'Enter your full name.';
    if (!county) return 'Select your county.';
    if (!constituency) return 'Select your constituency.';
    if (!ward) return 'Select your ward.';
    if (state.voted.has(nationalId.trim())) return 'This ID has already voted in this election.';
    return null;
  }

  function handleVerify() {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setVerifying(true);

    // Simulate ID verification delay
    setTimeout(() => {
      setVerifying(false);
      const countyName = COUNTIES.find(c => c.id === county)?.name || county;
      const constName = constituencies.find(c => c.id === constituency)?.name || constituency;
      const wardName = wards.find(w => w.id === ward)?.name || ward;

      dispatch({
        type: 'SET_VOTER',
        payload: {
          id: nationalId.trim(),
          name: fullName.trim(),
          county, countyName,
          constituency, constName,
          ward, wardName,
        },
      });
      navigation.navigate('Ballot');
    }, 2000);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SectionHeader
        title="Voter Verification"
        subtitle="Enter your details exactly as they appear on your National ID"
      />

      {verifying ? (
        <Card style={styles.verifyCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.verifyText}>Checking voter registry...</Text>
          <Text style={styles.verifySubText}>Verifying identity with IEBC database</Text>
        </Card>
      ) : (
        <Card>
          <Text style={styles.label}>National ID Number *</Text>
          <TextInput
            style={styles.input}
            value={nationalId}
            onChangeText={v => { setNationalId(v); setError(''); }}
            placeholder="e.g. 28345671"
            keyboardType="numeric"
            maxLength={9}
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.label}>Full Name (as on ID) *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={v => { setFullName(v); setError(''); }}
            placeholder="e.g. Jane Wanjiku Mwangi"
            autoCapitalize="words"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.label}>County *</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={county}
              onValueChange={v => { setCounty(v); setConstituency(''); setWard(''); }}
              style={styles.picker}
            >
              <Picker.Item label="— Select County —" value="" />
              {COUNTIES.map(c => (
                <Picker.Item key={c.id} label={c.name} value={c.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Constituency *</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={constituency}
              onValueChange={v => { setConstituency(v); setWard(''); }}
              style={styles.picker}
              enabled={!!county}
            >
              <Picker.Item label={county ? '— Select Constituency —' : '— Select county first —'} value="" />
              {constituencies.map(c => (
                <Picker.Item key={c.id} label={c.name} value={c.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Ward *</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={ward}
              onValueChange={v => setWard(v)}
              style={styles.picker}
              enabled={!!constituency}
            >
              <Picker.Item label={constituency ? '— Select Ward —' : '— Select constituency first —'} value="" />
              {wards.map(w => (
                <Picker.Item key={w.id} label={w.name} value={w.id} />
              ))}
            </Picker>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AppButton
            title="Verify & Proceed to Ballot"
            onPress={handleVerify}
            style={{ marginTop: 8 }}
          />
        </Card>
      )}

      <Text style={styles.note}>
        🔒 Your identity is verified but will not be linked to your vote choices.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4, marginTop: 12, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    padding: 12, fontSize: 15, color: COLORS.text, backgroundColor: '#FAFAFA',
  },
  pickerWrap: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    backgroundColor: '#FAFAFA', overflow: 'hidden',
  },
  picker: { height: 50, color: COLORS.text },
  error: { color: COLORS.danger, fontSize: 13, marginTop: 8 },
  verifyCard: { alignItems: 'center', paddingVertical: 32 },
  verifyText: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  verifySubText: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  note: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
