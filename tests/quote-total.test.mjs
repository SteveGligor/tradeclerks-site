// The customer page's open-quote total (v/index.html, between "@quote-total begin" and
// "@quote-total end"): the lines that count, then each tax row on that subtotal rounded to the
// cent on its own, an exact half cent up, then added. It must equal what the server stores when
// the customer accepts (quote_tax() in the app repo) and what the app shows (lib/money.ts).
//
// This runs the page's own functions, read out of v/index.html as written, on:
//   1. tests/quote-cases.json: the quotes the app repo's test database and phone code are held
//      to (trade-clerks, supabase/tests/audit/65_money_rounding_test.sql; a copy, checked
//      against that file when the app repo sits beside this one or TRADE_CLERKS_APP names it);
//   2. every subtotal from $0.01 to $5,000.00 at one tax and at two, against a second
//      calculation in whole numbers;
//   3. which rows are used, ticked and unticked optional lines, and odd input.
//
// Run: node --test tests/quote-total.test.mjs      (Node 20.11 or later; nothing to install)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const page = readFileSync(join(ROOT, 'v', 'index.html'), 'utf8')
const begin = page.indexOf('// @quote-total begin'), end = page.indexOf('// @quote-total end')
assert.ok(begin > 0 && end > begin, 'the two marks are in v/index.html')
const { toCents, taxCents, taxRates, quoteTotalFor } =
  new Function(`'use strict';\n${page.slice(begin, end)}\nreturn { toCents, taxCents, taxRates, quoteTotalFor }`)()

const cases = JSON.parse(readFileSync(join(ROOT, 'tests', 'quote-cases.json'), 'utf8'))

// A quote as the page gets it from the server: stored line totals, the rows, the combined rate
const asDocument = q => ({
  status: 'sent',
  tax_rate: q.taxes.reduce((s, t) => s + t.rate, 0),
  tax_lines: q.taxes.length ? q.taxes.map(t => ({ ...t, amount: 0 })) : null,
  lines: q.lines.map((l, i) => ({ id: `l${i}`, optional: !!l.optional, total: q.expect.lines[i] })),
})
const tickedOf = q => Object.fromEntries(q.lines.map((l, i) => [`l${i}`, !!l.ticked]))

test('the page still calls the tested functions for an open quote', () => {
  assert.match(page, /return quoteTotalFor\(d, lines, state\.ticked\);/)
  // plain numbers only, for older phones (comments aside)
  const code = page.slice(begin, end).split('\n').filter(l => !l.trim().startsWith('//')).join('\n')
  assert.doesNotMatch(code, /BigInt|\*\*/)
})

test('every shared quote: the total the customer sees is the total the server stores', () => {
  assert.ok(cases.length >= 11, `only ${cases.length} quotes`)
  for (const q of cases) {
    const d = asDocument(q)
    assert.equal(quoteTotalFor(d, d.lines, tickedOf(q)), q.expect.total, q.name)
  }
})

test('the copy of the shared quotes matches the app repo, when the app repo is at hand', t => {
  const app = process.env.TRADE_CLERKS_APP ?? join(ROOT, '..', 'trade-clerks-app')
  const source = join(app, 'supabase', 'tests', 'audit', '65_money_rounding_test.sql')
  if (!existsSync(source)) return t.skip(`no app repo at ${app}`)
  const sql = readFileSync(source, 'utf8')
  const a = sql.indexOf('($json$') + '($json$'.length
  assert.deepEqual(cases, JSON.parse(sql.slice(a, sql.indexOf('$json$::jsonb', a))))
})

test('two taxes are each rounded on their own, never on the combined rate', () => {
  const lines = [{ id: 'a', optional: false, total: 100.5 }]
  const bc = { tax_rate: 12, tax_lines: [{ label: 'GST', rate: 5 }, { label: 'PST', rate: 7 }] }
  // 5.025 → 5.03 and 7.035 → 7.04; 12 % of 100.50 on its own is 12.06
  assert.equal(quoteTotalFor(bc, lines, {}), 112.57)
  assert.equal(quoteTotalFor({ tax_rate: 12, tax_lines: null }, lines, {}), 112.56)
  const qc = { tax_rate: 14.975, tax_lines: [{ label: 'GST', rate: 5 }, { label: 'QST', rate: 9.975 }] }
  assert.equal(quoteTotalFor(qc, [{ id: 'a', optional: false, total: 20 }], {}), 23)   // QST 1.995 → 2.00
  assert.equal(quoteTotalFor(qc, [{ id: 'a', optional: false, total: 1000.05 }], {}), 1149.8)
})

test('an exact half cent goes up: $18.50 at 13 % is $2.41, 5 % of $2.90 is $0.15', () => {
  assert.equal(taxCents(1850, 13), 241)
  assert.equal(taxCents(290, 5), 15)
  assert.equal(taxCents(10, 5), 1)
  assert.equal(taxCents(1849, 13), 240)
  assert.equal(taxCents(0, 13), 0)
  assert.equal(taxCents(1850, 0), 0)
})

test('what the page did before, for the record: right at 13 % and 5 %, a cent off at 15 % and with two taxes', () => {
  const before = (sub, rate) => { const tax = Math.round(sub * rate) / 100; return Math.round((sub + tax) * 100) / 100 }
  const now = (sub, rates) => quoteTotalFor({ tax_rate: 0, tax_lines: rates.map(rate => ({ rate })) }, [{ id: 'a', optional: false, total: sub }], {})
  assert.equal(before(18.5, 13), 20.91)
  assert.equal(now(18.5, [13]), 20.91)
  // 15 % of $4.10 is 0.615
  assert.equal(before(4.1, 15), 4.71)
  assert.equal(now(4.1, [15]), 4.72)
  // BC: 5 % and 7 % of $100.50 are 5.025 and 7.035; the page took 12 % of it in one go
  assert.equal(before(100.5, 12), 112.56)
  assert.equal(now(100.5, [5, 7]), 112.57)
  // Quebec: 5 % and 9.975 % of $0.04 are both under half a cent; 14.975 % in one go is over it
  assert.equal(before(0.04, 14.975), 0.05)
  assert.equal(now(0.04, [5, 9.975]), 0.04)
})

test('optional lines count only when ticked; the tax follows', () => {
  const d = { tax_rate: 13, tax_lines: [{ label: 'HST', rate: 13 }] }
  const lines = [{ id: 'r', optional: false, total: 100 }, { id: 'o1', optional: true, total: 50 }, { id: 'o2', optional: true, total: 10 }]
  assert.equal(quoteTotalFor(d, lines, {}), 113)
  assert.equal(quoteTotalFor(d, lines, { o1: true }), 169.5)
  assert.equal(quoteTotalFor(d, lines, { o1: true, o2: true }), 180.8)
  assert.equal(quoteTotalFor(d, lines, { o1: false, o2: true }), 124.3)
  assert.equal(quoteTotalFor(d, [], {}), 0)
})

test('the rows are used as the server uses them: all usable, or the combined rate', () => {
  assert.deepEqual(taxRates({ tax_rate: 13, tax_lines: [{ label: 'HST', rate: 13 }] }), [13])
  assert.deepEqual(taxRates({ tax_rate: 12, tax_lines: [{ rate: 5 }, { rate: 7 }] }), [5, 7])
  // none, empty, a rate as text, a missing rate, out of range, not objects: the combined rate
  for (const rows of [null, undefined, [], [{ label: 'HST', rate: '13' }], [{ label: 'HST' }], [{ rate: -1 }], [{ rate: 101 }], [13], { rate: 13 }, [{ rate: 13 }, { label: 'PST' }]]) {
    assert.deepEqual(taxRates({ tax_rate: 13, tax_lines: rows }), [13], JSON.stringify(rows))
  }
  assert.deepEqual(taxRates({ tax_rate: 0, tax_lines: null }), [])
  assert.deepEqual(taxRates({ tax_lines: null }), [])
  assert.deepEqual(taxRates({ tax_rate: '13', tax_lines: null }), [13])
  assert.deepEqual(taxRates({ tax_rate: 0, tax_lines: [{ label: 'Zero-rated', rate: 0 }] }), [0])
})

// (cents × thousandths of a percent) / 100000, a half up, in whole numbers far below 2^53
const wholeHalfUp = (cents, thousandths) => Math.floor((cents * thousandths + 50000) / 100000)

test('every subtotal from $0.01 to $5,000.00, at one tax and at two', () => {
  let halfCents = 0
  for (const rates of [[13], [5], [15], [5, 7], [5, 9.975], [5, 6], [14.975]]) {
    const d = { tax_rate: rates.reduce((s, r) => s + r, 0), tax_lines: rates.map(rate => ({ label: 'T', rate })) }
    for (let cents = 1; cents <= 500000; cents++) {
      let expected = cents
      for (const rate of rates) {
        const thousandths = Math.round(rate * 1000)
        expected += wholeHalfUp(cents, thousandths)
        if ((cents * thousandths) % 100000 === 50000) halfCents++
      }
      const got = quoteTotalFor(d, [{ id: 'a', optional: false, total: cents / 100 }], {})
      if (got !== expected / 100) assert.fail(`${rates.join(' + ')} % on ${cents / 100}: got ${got}, expected ${expected / 100}`)
    }
  }
  assert.ok(halfCents > 100000, `only ${halfCents} half cents`)
})

test('large amounts and many lines stay exact', () => {
  const d = { tax_rate: 14.975, tax_lines: [{ rate: 5 }, { rate: 9.975 }] }
  assert.equal(quoteTotalFor(d, [{ id: 'a', optional: false, total: 299999.97 }], {}), 344924.97)
  assert.equal(taxCents(999999999999, 14.975), 149750000000)   // 149,749,999,999.85 → …000.00
  assert.equal(taxCents(999999999999, 13), 130000000000)
  const many = Array.from({ length: 300 }, (_, i) => ({ id: `l${i}`, optional: false, total: 0.07 }))
  assert.equal(quoteTotalFor({ tax_rate: 0, tax_lines: null }, many, {}), 21)
})

test('odd input never throws and never shows NaN', () => {
  assert.equal(toCents(null), 0)
  assert.equal(toCents('12.34'), 1234)
  assert.equal(toCents(undefined), 0)
  assert.equal(quoteTotalFor({}, [{ id: 'a', optional: false, total: null }], {}), 0)
  assert.equal(quoteTotalFor({ tax_rate: 'abc', tax_lines: 'no' }, [{ id: 'a', optional: false, total: 10 }], {}), 10)
  // a rate that isn't a plain decimal of up to five places: the nearest answer, still a whole cent
  assert.equal(taxCents(10000, 1e-7), 0)
  assert.equal(taxCents(10000, 9.9755555), 998)
  assert.ok(Number.isInteger(taxCents(12345, 12.3456789)))
})
