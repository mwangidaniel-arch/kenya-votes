import React, { createContext, useContext, useReducer } from 'react';
import { supabase } from '../lib/supabase';

const ElectionContext = createContext(null);

const initialState = {
  currentVoter: null,
  selections: {},
  lastReceipt: null,
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VOTER':
      return { ...state, currentVoter: action.payload, selections: {}, error: null };
    case 'SELECT_CANDIDATE':
      return { ...state, selections: { ...state.selections, [action.race]: action.candidateId } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_RECEIPT':
      return { ...state, lastReceipt: action.payload, currentVoter: null, selections: {} };
    case 'CLEAR_VOTER':
      return { ...state, currentVoter: null, selections: {} };
    default:
      return state;
  }
}

export function ElectionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function verifyVoter(nationalId, fullName) {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .eq('national_id', nationalId.trim())
        .single();
      if (error || !data) {
        dispatch({ type: 'SET_ERROR', payload: 'ID not found in voter registry.' });
        return false;
      }
      const nameLower = fullName.trim().toLowerCase();
      const regLower = data.full_name.toLowerCase();
      const match = regLower.includes(nameLower.split(' ')[0]) || nameLower.includes(regLower.split(' ')[0]);
      if (!match) {
        dispatch({ type: 'SET_ERROR', payload: 'Name does not match registry record.' });
        return false;
      }
      const { data: existing } = await supabase
        .from('votes')
        .select('id')
        .eq('national_id', nationalId.trim())
        .single();
      if (existing) {
        dispatch({ type: 'SET_ERROR', payload: 'This ID has already voted in this election.' });
        return false;
      }
      dispatch({ type: 'SET_VOTER', payload: {
        id: nationalId.trim(),
        name: data.full_name,
        county: data.county,
        constituency: data.constituency,
        ward: data.ward,
      }});
      return true;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Verification failed. Check your connection.' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function submitBallot(voter, selections) {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const receiptId = 'RCT-' + Math.random().toString(36).slice(2, 10).toUpperCase();
      const { error: voteError } = await supabase.from('votes').insert({
        receipt_id: receiptId,
        national_id: voter.id,
        county: voter.county,
        constituency: voter.constituency,
        ward: voter.ward,
        president: selections.president,
        governor: selections.governor,
        senator: selections.senator,
        women_rep: selections.womenrep,
        mp: selections.mp,
        mca: selections.mca,
      });
      if (voteError) throw voteError;
      await supabase.from('audit_log').insert({
        masked_id: voter.id.slice(0, 3) + 'XXXXX',
        county: voter.county,
        constituency: voter.constituency,
        ward: voter.ward,
      });
      dispatch({ type: 'SET_RECEIPT', payload: receiptId });
      return receiptId;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to submit vote. Try again.' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  return (
    <ElectionContext.Provider value={{ state, dispatch, verifyVoter, submitBallot }}>
      {children}
    </ElectionContext.Provider>
  );
}

export function useElection() {
  return useContext(ElectionContext);
}
