
const axios = require('axios')

const token = (process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_PAT || process.env.AIRTABLE_TOKEN || '').trim()
const baseId = (process.env.AIRTABLE_BASE_ID || '').trim()
const apiBaseOverride = (process.env.AIRTABLE_API_URL || '').trim()

if (!token || !baseId) {
  console.warn('Missing Airtable env vars. Set AIRTABLE_API_KEY (or AIRTABLE_PAT) and AIRTABLE_BASE_ID in Netlify.')
}

const BASE_URL = token && baseId
  ? (apiBaseOverride || `https://api.airtable.com/v0/${baseId}`)
  : null

function recordFromApi(r) {
  return { id: r.id, fields: r.fields || {}, get(name) { return (this.fields || {})[name] } }
}

function paramsSerializer(params) {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) v.forEach(item => usp.append(`${k}[]`, item))
    else usp.append(k, v)
  }
  return usp.toString()
}

async function request(method, url, { params = {}, data = null } = {}) {
  if (!BASE_URL) throw new Error('Airtable not configured')
  const m = (method || 'get').toUpperCase()
  const headers = { Authorization: `Bearer ${token}` }
  if (m === 'POST' || m === 'PATCH' || m === 'PUT') headers['Content-Type'] = 'application/json'
  const config = { method: m, url: `${BASE_URL}/${url}`, params, headers, timeout: 15000, paramsSerializer }
  if ((m === 'POST' || m === 'PATCH' || m === 'PUT') && data != null) config.data = data
  try { const res = await axios(config); return res.data }
  catch (err) { console.error('Airtable request error', { method: m, url: config.url, status: err.response?.status, airtableError: err.response?.data?.error || null }); throw err }
}

function base(table) {
  return {
    select(opts = {}) {
      const params = {}
      if (opts.view) params.view = opts.view
      if (opts.pageSize) params.pageSize = opts.pageSize
      if (opts.fields) params.fields = opts.fields
      if (opts.filterByFormula) params.filterByFormula = opts.filterByFormula
      return {
        async eachPage(pageFn) {
          let offset = undefined
          while (true) {
            const data = await request('get', encodeURIComponent(table), { params: { ...params, offset } })
            const records = (data.records || []).map(recordFromApi)
            const fetchNextPage = () => {}
            await pageFn(records, fetchNextPage)
            if (data.offset) { offset = data.offset; continue }
            break
          }
        },
        async all() {
          const all = []
          let offset = undefined
          while (true) {
            const data = await request('get', encodeURIComponent(table), { params: { ...params, offset } })
            const records = (data.records || []).map(recordFromApi)
            all.push(...records)
            if (data.offset) offset = data.offset; else break
          }
          return all
        },
        async firstPage() {
          const data = await request('get', encodeURIComponent(table), { params })
          return (data.records || []).map(recordFromApi)
        }
      }
    },
    async create(payload) {
      let data
      if (Array.isArray(payload)) data = { records: payload.map(p => ({ fields: p.fields || p })) }
      else data = { records: [{ fields: payload }] }
      const res = await request('post', encodeURIComponent(table), { data })
      const recs = (res.records || []).map(recordFromApi)
      return recs.length === 1 ? recs[0] : recs
    },
    async update(records) {
      const res = await request('patch', encodeURIComponent(table), { data: { records } })
      return (res.records || []).map(recordFromApi)
    },
    async destroy(ids) {
      const usp = new URLSearchParams(); (Array.isArray(ids) ? ids : [ids]).forEach(id => usp.append('records[]', id))
      const path = `${encodeURIComponent(table)}?${usp.toString()}`
      return await request('delete', path)
    },
    async find(id) {
      const res = await request('get', `${encodeURIComponent(table)}/${id}`)
      return recordFromApi(res)
    }
  }
}

module.exports = { base }
