
const axios = require('axios')

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.warn('Missing Airtable env vars. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in Netlify.')
}

const BASE_URL = AIRTABLE_API_KEY && AIRTABLE_BASE_ID
  ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`
  : null

function recordFromApi(r) {
  return {
    id: r.id,
    fields: r.fields || {},
    get(name) { return (this.fields || {})[name] }
  }
}

async function request(method, url, { params = {}, data = null } = {}) {
  if (!BASE_URL) throw new Error('Airtable not configured')
  const res = await axios({
    method,
    url: `${BASE_URL}/${url}`,
    params,
    data,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  return res.data
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
            if (data.offset) {
              offset = data.offset
              continue
            }
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
            if (data.offset) {
              offset = data.offset
            } else {
              break
            }
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
      if (Array.isArray(payload)) {
        data = { records: payload.map(p => ({ fields: p.fields || p })) }
      } else {
        data = { records: [{ fields: payload }] }
      }
      const res = await request('post', encodeURIComponent(table), { data })
      const recs = (res.records || []).map(recordFromApi)
      return recs.length === 1 ? recs[0] : recs
    },
    async update(records) {
      const res = await request('patch', encodeURIComponent(table), { data: { records } })
      return (res.records || []).map(recordFromApi)
    },
    async destroy(ids) {
      const params = new URLSearchParams()
      ;(Array.isArray(ids) ? ids : [ids]).forEach(id => params.append('records[]', id))
      const url = `${encodeURIComponent(table)}?${params.toString()}`
      const res = await request('delete', url)
      return res
    },
    async find(id) {
      const res = await request('get', `${encodeURIComponent(table)}/${id}`)
      return recordFromApi(res)
    }
  }
}

module.exports = { base }
