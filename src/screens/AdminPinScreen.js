import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { AppButton, Card, COLORS } from '../components/UI';

export default function AdminPinScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!email.trim()) { setError('Enter your email.'); return; }
    if (!password) { setError('Enter your password.'); return; }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError('Invalid email or password.');
        return;
      }

      if (data.user) {
        navigation.navigate('Admin');
      }
    } catch (e) {
      setError('Login failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.lockIcon}>🔐</Text>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>Election officials only</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={v => { setEmail(v); setError(''); }}
          placeholder="admin@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.textLight}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={v => { setPassword(v); setError(''); }}
          placeholder="Enter password"
          secureTextEntry
          placeholderTextColor={COLORS.textLight}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          loading={loading}
          style={{ marginTop: 16 }}
        />
        <AppButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ marginTop: 8 }}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', padding: 24 },
  card: { alignItems: 'center', padding: 28 },
  lockIcon: { fontSize: 32, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 24 },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4, marginTop: 12, fontWeight: '500', alignSelf: 'flex-start', width: '100%' },
  input: { width: '100%', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 15, color: COLORS.text, backgroundColor: '#FAFAFA' },
  error: { color: COLORS.danger, fontSize: 13, marginTop: 8, textAlign: 'center' },
});