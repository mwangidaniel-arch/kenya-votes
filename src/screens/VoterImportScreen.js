import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { AppButton, Card, Badge, COLORS } from '../components/UI';

export default function VoterImportScreen({ navigation }) {
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(0);
  const [fileName, setFileName] = useState('');

  const REQUIRED_COLS = ['national_id', 'full_name', 'county', 'constituency', 'ward'];

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setFileName(file.name);
      const content = await FileSystem.readAsStringAsync(file.uri);

      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const cols = results.meta.fields || [];
          const missing = REQUIRED_COLS.filter(c => !cols.includes(c));

          if (missing.length > 0) {
            Alert.alert('Invalid CSV', 'Missing columns: ' + missing.join(', ') + '\n\nRequired: national_id, full_name, county, constituency, ward');
            return;
          }

          const rowErrors = [];
          const validRows = [];

          results.data.forEach((row, i) => {
            const missingFields = REQUIRED_COLS.filter(c => !row[c] || row[c].trim() === '');
            if (missingFields.length > 0) {
              rowErrors.push('Row ' + (i + 2) + ': missing ' + missingFields.join(', '));
            } else {
              validRows.push({
                national_id: row.national_id.trim(),
                full_name: row.full_name.trim(),
                county: row.county.trim().toLowerCase(),
                constituency: row.constituency.trim().toLowerCase(),
                ward: row.ward.trim().toLowerCase(),
              });
            }
          });

          setPreview(validRows);
          setErrors(rowErrors);
        },
        error: (err) => {
          Alert.alert('Parse Error', err.message);
        }
      });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function importVoters() {
    if (preview.length === 0) return;

    Alert.alert(
      'Confirm Import',
      'Import ' + preview.length + ' voters into the registry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: async () => {
          setLoading(true);
          let successCount = 0;
          let skipCount = 0;

          // Insert in batches of 50
          const batchSize = 50;
          for (let i = 0; i < preview.length; i += batchSize) {
            const batch = preview.slice(i, i + batchSize);
            const { error } = await supabase
              .from('voters')
              .upsert(batch, { onConflict: 'national_id', ignoreDuplicates: true });

            if (!error) {
              successCount += batch.length;
            } else {
              skipCount += batch.length;
            }
          }

          setLoading(false);
          setImported(successCount);
          setPreview([]);
          Alert.alert(
            'Import Complete',
            successCount + ' voters imported successfully.' + (skipCount > 0 ? '\n' + skipCount + ' skipped (duplicates).' : '')
          );
        }}
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Voter CSV Import</Text>
      <Text style={styles.subtitle}>
        Upload a CSV file to bulk register voters. Required columns: national_id, full_name, county, constituency, ward
      </Text>

      <Card style={styles.templateCard}>
        <Text style={styles.templateTitle}>CSV Template</Text>
        <Text style={styles.templateText}>
          national_id,full_name,county,constituency,ward{'\n'}
          28345671,Jane Wanjiku,nairobi,westlands,westlands_w1{'\n'}
          34521089,Peter Mwangi,nakuru,naivasha,naivasha_w1
        </Text>
      </Card>

      <AppButton
        title="Select CSV File"
        onPress={pickFile}
        variant="outline"
        style={{ marginBottom: 12 }}
      />

      {fileName ? <Text style={styles.fileName}>File: {fileName}</Text> : null}

      {errors.length > 0 && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>{errors.length} row(s) with errors — will be skipped</Text>
          {errors.slice(0, 5).map((e, i) => (
            <Text key={i} style={styles.errorText}>{e}</Text>
          ))}
          {errors.length > 5 && <Text style={styles.errorText}>...and {errors.length - 5} more</Text>}
        </Card>
      )}

      {preview.length > 0 && (
        <Card>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Preview — {preview.length} valid rows</Text>
            <Badge label="Ready to import" type="success" />
          </View>
          {preview.slice(0, 5).map((row, i) => (
            <View key={i} style={styles.previewRow}>
              <Text style={styles.previewId}>{row.national_id}</Text>
              <Text style={styles.previewName}>{row.full_name}</Text>
              <Text style={styles.previewLocation}>{row.county}</Text>
            </View>
          ))}
          {preview.length > 5 && (
            <Text style={styles.moreText}>...and {preview.length - 5} more rows</Text>
          )}
          <AppButton
            title={loading ? 'Importing...' : 'Import ' + preview.length + ' Voters'}
            onPress={importVoters}
            loading={loading}
            variant="success"
            style={{ marginTop: 12 }}
          />
        </Card>
      )}

      {imported > 0 && (
        <Card style={styles.successCard}>
          <Text style={styles.successText}>Last import: {imported} voters added successfully</Text>
        </Card>
      )}

      <AppButton
        title="Back to Dashboard"
        onPress={() => navigation.goBack()}
        variant="outline"
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16, lineHeight: 18 },
  templateCard: { backgroundColor: '#F8F9FA', marginBottom: 16 },
  templateTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  templateText: { fontSize: 11, fontFamily: 'monospace', color: COLORS.text, lineHeight: 18 },
  fileName: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  errorCard: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
  errorTitle: { fontSize: 13, fontWeight: '600', color: COLORS.danger, marginBottom: 6 },
  errorText: { fontSize: 12, color: COLORS.danger, marginBottom: 2 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  previewTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  previewRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 8 },
  previewId: { fontSize: 12, fontFamily: 'monospace', color: COLORS.text, width: 80 },
  previewName: { fontSize: 13, color: COLORS.text, flex: 1 },
  previewLocation: { fontSize: 12, color: COLORS.textMuted, width: 70 },
  moreText: { fontSize: 12, color: COLORS.textMuted, marginTop: 8, fontStyle: 'italic' },
  successCard: { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
  successText: { fontSize: 13, color: COLORS.success, fontWeight: '500' },
});
