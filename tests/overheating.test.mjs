import test from 'node:test';
import assert from 'node:assert/strict';
import {rows,metrics,severity,formatValue,deltaText,visibleRows,toCsv} from '../data/overheating.mjs';
const get=key=>metrics.find(m=>m.key===key);
test('all 22 dates are contiguous and unique; latest row matches supplied summary',()=>{
 assert.equal(rows.length,22); assert.equal(new Set(rows.map(r=>r.date)).size,22);
 rows.forEach((row,i)=>assert.equal(row.date,`2026-09-${String(i+1).padStart(2,'0')}`));
 assert.deepEqual(['premium','dominance','mvrv','fear','dc','btcKrw'].map(key=>rows.at(-1)[key]),[-.89,59.71,1.12,78,40,116051000]);
});
test('unranked and missing ranks are separate, never zero or fabricated rank',()=>{
 assert.equal(formatValue(get('upbit'),rows.at(-1)),'순위권 없음');
 assert.equal(formatValue(get('coinbase'),rows.at(-1)),'업데이트 미제공');
 assert.equal(rows.filter(r=>r.coinbaseStatus==='observed').length,11);
 assert.equal(rows.filter(r=>r.coinbaseStatus==='missing').length,11);
 assert.equal(severity(get('coinbase'),rows.at(-1)),'unknown');
 assert.equal(severity(get('upbit'),rows.at(-1)),'below');
 assert.equal(formatValue(get('coinbase'),rows[0]),'500위');
});
test('upper, lower and rank thresholds honor supplied directions and exact boundaries',()=>{
 for(const [key,value,want] of [['fear',80,'below'],['fear',81,'watch'],['fear',90,'watch'],['fear',91,'danger'],['mvrv',5,'below'],['mvrv',5.1,'watch'],['mvrv',6.1,'danger'],['premium',15.1,'danger'],['dominance',45,'below'],['dominance',44.99,'watch'],['dominance',40,'watch'],['dominance',39.99,'danger'],['dc',11,'below'],['dc',10,'watch'],['dc',1,'danger']]) assert.equal(severity(get(key),{[key]:value}),want,`${key} ${value}`);
});
test('latest status has seven below-threshold readings and one unavailable',()=>{
 const counts=metrics.map(m=>severity(m,rows.at(-1)));
 assert.equal(counts.filter(s=>s==='below').length,7);assert.equal(counts.filter(s=>s==='unknown').length,1);
});
test('percentage deltas are percentage points and score deltas keep their units',()=>{
 assert.equal(deltaText(get('premium'),rows.at(-1),rows.at(-2)),'전일 대비 +0.57%p');
 assert.equal(deltaText(get('dominance'),rows.at(-1),rows.at(-2)),'전일 대비 +0.31%p');
 assert.equal(deltaText(get('mvrv'),rows.at(-1),rows.at(-2)),'전일 대비 +0.17');
 assert.equal(deltaText(get('fear'),rows.at(-1),rows.at(-2)),'전일 대비 +4점');
 assert.equal(deltaText(get('coinbase'),rows.at(-1),rows.at(-2)),'전일 비교 불가');
});
test('date selection bounds charts, records and CSV to the same rows',()=>{
 const selected=visibleRows('2026-09-11');assert.equal(selected.length,11);
 const csv=toCsv(selected);assert.equal(csv.split('\r\n').length,12);
 assert.ok(csv.includes('2026-09-11'));assert.ok(!csv.includes('2026-09-12'));
 assert.ok(csv.includes('순위권 없음'));assert.ok(csv.includes('500위'));
 assert.equal(visibleRows('2026-09-01').length,1);
});
