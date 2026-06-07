import React, { createContext, useContext, useReducer } from 'react';

const ElectionContext = createContext(null);

const initialState = {
  votes: {},         // { raceId: { candidateId: count } }
  voted: new Set(),  // voter IDs that have voted
  auditLog: [],      // { time, maskedId, county, constituency, ward }
  currentVoter: null,// { id, name, county, constituency, ward }
  selections: {},    // { president, governor, senator, mp, mca }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VOTER':
      return { ...state, currentVoter: action.payload, selections: {} };

    case 'SELECT_CANDIDATE': {
      return {
        ...state,
        selections: { ...state.selections, [action.race]: action.candidateId },
      };
    }

    case 'SUBMIT_BALLOT': {
      const { voter, selections } = action.payload;
      const newVotes = { ...state.votes };

      Object.entries(selections).forEach(([race, candidateId]) => {
        if (!newVotes[race]) newVotes[race] = {};
        newVotes[race][candidateId] = (newVotes[race][candidateId] || 0) + 1;
      });

      const newVoted = new Set(state.voted);
      newVoted.add(voter.id);

      const entry = {
        time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        maskedId: voter.id.slice(0, 3) + 'XXXXX',
        county: voter.county,
        constituency: voter.constituency,
        ward: voter.ward,
        receiptId: 'RCT-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      };

      return {
        ...state,
        votes: newVotes,
        voted: newVoted,
        auditLog: [entry, ...state.auditLog],
        lastReceipt: entry.receiptId,
        currentVoter: null,
        selections: {},
      };
    }

    case 'CLEAR_VOTER':
      return { ...state, currentVoter: null, selections: {} };

    default:
      return state;
  }
}

export function ElectionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <ElectionContext.Provider value={{ state, dispatch }}>
      {children}
    </ElectionContext.Provider>
  );
}

export function useElection() {
  return useContext(ElectionContext);
}
