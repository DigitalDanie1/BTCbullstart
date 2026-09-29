import {daily} from './daily-overheating.mjs?v=20260929';
// Transcribed from the user's 2026-09-22 table; values are observations, not live feeds.
export const provenance = {
  title: '과열지표', asOf: daily.through, periodStart: '2026-09-01',
  source: '9월 1–22일 사용자 원본 · 9월 23일부터 공식 API 수집',
  verifiedAgainst: '추가 기록은 CoinMarketCap 공포탐욕 API 및 업비트 UTC 일봉. 기존 원본과 관측 시각이 다를 수 있음',
  references: ['구글앱스토어', '디시인사이드', 'Coinbase App Rank Bot', 'Cryprice.com', 'TradingView', 'Lookintobitcoin.com', 'CoinMarketCap', '업비트'],
  limitations: [
    '앱 순위의 국가·카테고리·집계 시각과 순위권 범위가 제공되지 않았습니다.',
    '코인베이스의 9월 1–11일 값 500은 원본 그대로이며 집계 상한 여부는 확인되지 않았습니다.',
    '9월 22일 MVRV-Z 1.00 상향 돌파는 표에서 확인됩니다. ‘236일 만’이라는 기간은 사용자 설명이며 제공된 22일 표로 검증할 수 없습니다.',
    '비고는 원본 작성자의 기록이며 사건의 사실관계를 별도로 검증하지 않았습니다.'
  ]
};
export const metrics = [
  {key:'upbit',label:'업비트 앱 순위',unit:'위',kind:'rank',watch:10,danger:1,rule:'10위 이내 주의 · 1위 위험',source:'구글앱스토어'},
  {key:'bithumb',label:'빗썸 앱 순위',unit:'위',kind:'rank',watch:10,danger:1,rule:'10위 이내 주의 · 1위 위험',source:'구글앱스토어'},
  {key:'dc',label:'디시 비트코인 순위',unit:'위',kind:'rank',watch:10,danger:1,rule:'10위 이내 주의 · 1위 위험',source:'디시인사이드'},
  {key:'coinbase',label:'코인베이스 앱 순위',unit:'위',kind:'rank',watch:10,danger:1,rule:'10위 이내 주의 · 1위 위험',source:'Coinbase App Rank Bot'},
  {key:'premium',label:'김치프리미엄',unit:'%',kind:'upper',watch:10,danger:15,rule:'10% 초과 주의 · 15% 초과 위험',source:'Cryprice.com'},
  {key:'dominance',label:'BTC 도미넌스',unit:'%',kind:'lower',watch:45,danger:40,rule:'45% 미만 주의 · 40% 미만 위험',source:'TradingView'},
  {key:'mvrv',label:'MVRV Z-Score',unit:'',kind:'upper',watch:5,danger:6,rule:'5.0 초과 주의 · 6.0 초과 위험',source:'Lookintobitcoin.com'},
  {key:'fear',label:'크립토 공포탐욕지수',unit:'점',kind:'upper',watch:80,danger:90,rule:'80 초과 주의 · 90 초과 위험',source:'CoinMarketCap'}
];
// day, Bithumb rank, DC rank, Coinbase rank (null = not updated), premium %, dominance %, MVRV-Z, fear/greed, BTC KRW, original note
const raw = [
[1,185,39,500,.64,60.06,.87,73,107692000],
[2,194,49,500,.91,60.03,.82,71,105682000],
[3,195,52,500,1.04,60.05,.81,78,106641000],
[4,171,53,500,1.15,60.19,.95,75,110855000],
[5,null,57,500,1.34,59.98,.90,76,108891000],
[6,null,63,500,1.00,59.62,.90,75,108925000],
[7,null,49,500,1.03,59.58,.91,73,108153000],
[8,null,64,500,1.05,59.34,.87,72,106860000],
[9,null,58,500,1.08,59.43,.86,74,107483000],
[10,null,59,500,1.26,59.51,.84,70,106157000],
[11,null,52,500,1.65,59.37,.80,69,106840000],
[12,null,52,null,1.25,59.13,.81,68,105259000],
[13,null,44,null,1.35,59.29,.81,67,104600000],
[14,null,49,null,.70,59.37,.80,68,105603000],
[15,null,42,null,-.04,59.29,.86,66,104848000],
[16,null,45,null,-.26,59.46,.76,63,103578000,'클래리티 법안 부결'],
[17,null,54,null,-.37,59.30,.76,63,105457000,'미국 금리 ↑ (3.50~3.75 → 3.75~4.00)'],
[18,null,53,null,-.71,59.00,.78,67,107628000,'일본 금리 ↑ (1.00 → 1.25)'],
[19,null,54,null,-1.37,59.22,.94,73,111445000],
[20,null,45,null,-1.35,59.33,.95,70,110163000],
[21,null,50,null,-1.46,59.40,.95,74,113351000],
[22,null,40,null,-.89,59.71,1.12,78,116051000]
];
export const rows = raw.map(([day,bithumb,dc,coinbase,premium,dominance,mvrv,fear,btcKrw,note=''])=>({
  date:`2026-09-${String(day).padStart(2,'0')}`,no:415+day,
  upbit:null,upbitStatus:'unranked',bithumb,bithumbStatus:bithumb===null?'unranked':'observed',
  dc,dcStatus:'observed',coinbase,coinbaseStatus:coinbase===null?'missing':'observed',
  premium,dominance,mvrv,fear,btcKrw,note
})).concat(daily.rows);
export {daily};
export function severity(metric,row) {
  const status=row[metric.key+'Status'];
  if(status==='unranked') return 'below';
  const value=row[metric.key];
  if(status==='missing'||!Number.isFinite(value)) return 'unknown';
  if(metric.kind==='rank') return value<=metric.danger?'danger':value<=metric.watch?'watch':'below';
  if(metric.kind==='lower') return value<metric.danger?'danger':value<metric.watch?'watch':'below';
  return value>metric.danger?'danger':value>metric.watch?'watch':'below';
}
export function visibleRows(date) { return rows.filter(row=>row.date<=date); }
export function formatValue(metric,row) {
  if(row[metric.key+'Status']==='unranked') return '순위권 없음';
  if(row[metric.key+'Status']==='missing'||!Number.isFinite(row[metric.key])) return '업데이트 미제공';
  const value=row[metric.key];
  return (metric.kind==='rank'||metric.key==='fear'?String(value):value.toFixed(2))+metric.unit;
}
export function deltaText(metric,current,previous) {
  if(!previous||![current[metric.key],previous[metric.key]].every(Number.isFinite)) return '전일 비교 불가';
  const change=current[metric.key]-previous[metric.key];
  const digits=metric.kind==='rank'||metric.key==='fear'?0:2;
  const unit=metric.unit==='%'?'%p':metric.unit||'';
  return `전일 대비 ${change>0?'+':''}${change.toFixed(digits)}${unit}`;
}
export function toCsv(selectedRows) {
  const escape=value=>'"'+String(value).replaceAll('"','""')+'"';
  const header=['일자',...metrics.map(m=>m.label),'비트코인 가격(KRW)','원본 비고(미검증)'];
  return '\uFEFF'+[header,...selectedRows.map(row=>[row.date,...metrics.map(m=>formatValue(m,row)),row.btcKrw,row.note])].map(line=>line.map(escape).join(',')).join('\r\n');
}

export const originalReport = {
  date: '2026-09-22', title: '과열지표 (260922 화요일)',
  items: [
    '업비트 앱 순위는 순위권 없음, 여전히 하위권 유지 중이며 일반 참여자들은 크립토 시장 외면.',
    '빗썸 앱 순위는 순위권 없음, 여전히 하위권 유지 중이며 일반 참여자들은 크립토 시장 외면.',
    '디시인사이드 비트코인 순위는 40위 기록 중.',
    '코인베이스 앱 순위 업데이트 未.',
    '김치프리미엄 -0.89 포인트 기록 중.',
    '비트코인 도미넌스는 59.71 포인트 기록 중.',
    'MVRV-Z-SCORE는 1.12 포인트 기록 중. 236일만에 1.00포인트 상향 돌파.',
    '크립토공포탐욕지수 78 포인트 기록 중.'
  ],
  purpose: 'PS. 과열지표는 쉽지 않겠지만 크립토 사이클의 과열 및 정점 부근이 언제쯤일지 예상하기 위해 매일 Follow up 중인 데이터입니다.'
};
