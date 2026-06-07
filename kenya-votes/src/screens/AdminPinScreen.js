import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { ADMIN_PIN } from '../data/kenyaData';
import { AppButton, Card, COLORS } from '../components/UI';

export default function AdminPinScreen({ navigation }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputs = [useRef(), useRef(), useRef(), useRef()];

  function handleChange(text, index) {
    if (!/^\d?$/.test(text)) return;
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);
    setError('');
    if (text && index < 3) inputs[index + 1].current.focus();
    if (!text && index > 0) inputs[index - 1].current.focus();
    if (index === 3 && text) {
      const entered = [...newPin.slice(0, 3), text].join('');
      setTimeout(() => {
        if (entered === ADMIN_PIN) {
          navigation.navigate('Admin');
        } else {
          setError('Incorrect PIN. Try again.');
          setPin(['', '', '', '']);
          inputs[0].current.focus();
        }
      }, 100);
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.lockIcon}>🔐</Text>
        <Text style={styles.title}>Admin Access</Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN to access the election dashboard</Text>
        <View style={styles.pinRow}>
          {pin.map((digit, i) => (
            <TextInput
              key={i}
              ref={inputs[i]}
              style={[styles.pinInput, error ? styles.pinError : {}]}
              value={digit}
              onChangeText={t => handleChange(t, i)}
              keyboardType="numeric"
              maxLength={1}
              secureTextEntry
              selectTextOnFocus
            />
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.hint}>Demo PIN: 1234</Text>
        <AppButton title="Cancel" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: 16 }} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA', justifyContent: 'center', padding: 24 },
  card: { alignItems: 'center', padding: 28 },
  lockIcon: { fontSize: 32, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  pinRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  pinInput: {
    width: 52, height: 60, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E0E0E0',
    fontSize: 24, fontWeight: '700', textAlign: 'center',
    color: '#1A1A2E', backgroundColor: '#FAFAFA',
  },
  pinError: { borderColor: '#C62828', backgroundColor: '#FFEBEE' },
  error: { color: '#C62828', fontSize: 13, marginTop: 4, textAlign: 'center' },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 12 },
});
