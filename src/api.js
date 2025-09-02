
import axios from 'axios'

const API = {
  async getGameState() {
    const { data } = await axios.get('/.netlify/functions/game-state')
    return data
  },
  async listPlayers() {
    const { data } = await axios.get('/.netlify/functions/players-list')
    return data
  },
  async signup(payload) {
    const { data } = await axios.post('/.netlify/functions/signup', payload)
    return data
  },
  async vote(payload) {
    const { data } = await axios.post('/.netlify/functions/vote', payload)
    return data
  },
  // Admin
  async adminList(adminPassword) {
    const { data } = await axios.get('/.netlify/functions/admin-list', { headers: { 'x-admin-password': adminPassword } })
    return data
  },
  async adminVerify(adminPassword, phone, verified, status) {
    const { data } = await axios.post('/.netlify/functions/admin-verify', { phone, verified, status }, { headers: { 'x-admin-password': adminPassword } })
    return data
  },
  async adminStartWeek(adminPassword) {
    const { data } = await axios.post('/.netlify/functions/admin-start-week', {}, { headers: { 'x-admin-password': adminPassword } })
    return data
  },
  async adminReset(adminPassword) {
    const { data } = await axios.post('/.netlify/functions/admin-reset', {}, { headers: { 'x-admin-password': adminPassword } })
    return data
  },
  async adminRecordElimination(adminPassword, eliminatorPhone, eliminatedPhone) {
    const { data } = await axios.post('/.netlify/functions/record-elimination', { eliminatorPhone, eliminatedPhone }, { headers: { 'x-admin-password': adminPassword } })
    return data
  },
  async tallyVotes() {
    const { data } = await axios.get('/.netlify/functions/vote-tally')
    return data
  }
}

export default API
