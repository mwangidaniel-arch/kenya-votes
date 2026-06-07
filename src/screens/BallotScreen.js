import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import {
  PRESIDENTIAL_CANDIDATES,
  getCountyCandidates,
  getMPCandidates,
  getMCACandidates,
  getWomenRepCandidates,
} from '../data/kenyaData';
import { useElection } from '../context/ElectionContext';
import { AppButton, Card, Badge, COLORS } from '../components/UI';

const RACE_COLORS = {
  president: '#1565C0',
  governor: '#2E7D32',
  senator: '#6A1B9A',
  womenrep: '#AD1457',
  mp: '#E65100',
  mca: '#00695C',
};

const RACE_LABELS = {
  president: '🏛️ President',
  governor: '🏢 Governor',
  senator: '📜 Senator',
  mp: '🗳️ Member of Parliament',
  mca: '🏘️ Member of County Assembly',
};

function CandidateCard({ candidate, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.candidateCard, selected && styles.candidateSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={styles.candidateInfo}>
        <Text style={[styles.candidateName, selected && styles.candidateNameSelected]}>
          {candidate.name}
        </Text>
        <Text style={styles.candidateParty}>{candidate.party}</Text>
      </View>
      {selected && <Badge label="Selected" type="info" />}
    </TouchableOpacity>
  );
}

function RaceSection({ raceKey, label, candidates }) {
  const { state, dispatch } = useElection();
  const selected = state.selections[raceKey];
  const color = RACE_COLORS[raceKey];

  return (
    <Card style={{ borderLeftWidth: 3, borderLeftColor: color }}>
      <View style={styles.raceHeader}>
        <Text style={[styles.raceLabel, { color }]}>{label}</Text>
        {selected
          ? <Badge label="Done" type="success" />
          : <Badge label="Required" type="warning" />
        }
      </View>
      {candidates.map(c => (
        <CandidateCard
          key={c.id}
          candidate={c}
          selected={selected === c.id}
          onSelect={() => dispatch({ type: 'SELECT_CANDIDATE', race: raceKey, candidateId: c.id })}
        />
      ))}
    </Card>
  );
}

export default function BallotScreen({ navigation }) {
  const { state, dispatch } = useElection();
  const voter = state.currentVoter;

  if (!voter) {
    return (
      <View style={styles.noVoter}>
        <Text style={styles.noVoterText}>Session expired. Please verify again.</Text>
        <AppButton title="Go Back" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }

  const countyCands = getCountyCandidates(voter.county);
  const womenRepCands = getWomenRepCandidates(voter.county);
  const mpCands = getMPCandidates(voter.constituency);
  const mcaCands = getMCACandidates(voter.ward);

  const races = [
    { key: 'president', label: RACE_LABELS.president, candidates: PRESIDENTIAL_CANDIDATES },
    { key: 'governor', label: RACE_LABELS.governor, candidates: countyCands.governor },
    { key: 'senator', label: RACE_LABELS.senator, candidates: countyCands.senator },
    { key: 'womenrep', label: RACE_LABELS.womenrep, candidates: womenRepCands },
    { key: 'mp', label: RACE_LABELS.mp, candidates: mpCands },
    { key: 'mca', label: RACE_LABELS.mca, candidates: mcaCands },
  ];

  const completedRaces = races.filter(r => state.selections[r.key]).length;
  const allComplete = completedRaces === races.length;

  function handleSubmit() {
    if (!allComplete) {
      Alert.alert('Incomplete Ballot', `You have ${races.length - completedRaces} race(s) still unselected. Please complete all 6 races.`);
      return;
    }
    Alert.alert(
      'Confirm Your Vote',
      'Once submitted, your vote cannot be changed. Are you sure?',
      [
        { text: 'Review Again', style: 'cancel' },
        {
          text: 'Submit Vote',
          onPress: () => {
            dispatch({ type: 'SUBMIT_BALLOT', payload: { voter, selections: state.selections } });
            navigation.navigate('Confirmation');
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.voterBanner}>
        <Text style={styles.voterName}>Verified: {voter.name}</Text>
        <Text style={styles.voterLocation}>{voter.wardName} · {voter.constName} · {voter.countyName}</Text>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{completedRaces}/{races.length} races completed</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(completedRaces / races.length) * 100}%` }]} />
        </View>
      </View>

      {races.map(r => (
        <RaceSection key={r.key} raceKey={r.key} label={r.label} candidates={r.candidates} />
      ))}

      <AppButton
        title={allComplete ? 'Submit Ballot' : `Complete All Races (${completedRaces}/5)`}
        onPress={handleSubmit}
        variant={allComplete ? 'success' : 'primary'}
        disabled={!allComplete}
        style={{ marginTop: 8 }}
      />
      <Text style={styles.securityNote}>
        Your vote is secret. Ballot choices are not linked to your identity.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 48 },
  voterBanner: {
    backgroundColor: COLORS.successLight,
    borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#A5D6A7',
  },
  voterName: { fontSize: 15, fontWeight: '600', color: COLORS.success },
  voterLocation: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  progressRow: { marginBottom: 16 },
  progressText: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  progressTrack: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 3 },
  raceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  raceLabel: { fontSize: 15, fontWeight: '700' },
  candidateCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 8, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FAFAFA',
  },
  candidateSelected: {
    borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight, borderWidth: 1.5,
  },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  candidateInfo: { flex: 1 },
  candidateName: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  candidateNameSelected: { color: COLORS.primary },
  candidateParty: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  noVoter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  noVoterText: { fontSize: 15, color: COLORS.textMuted, marginBottom: 20, textAlign: 'center' },
  securityNote: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', marginTop: 16 },
});
