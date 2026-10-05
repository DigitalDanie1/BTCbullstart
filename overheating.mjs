import {rows,daily,metrics,provenance,originalReport,severity,formatValue,deltaText,visibleRows,toCsv} from './data/overheating.mjs?v=20261005021636598';
export function createOverheating(React) {
  const e=React.createElement;
  const names={below:'기준 미도달',watch:'주의',danger:'위험',unknown:'판정 보류'};
  function Trend({metric,data}) {
    const observed=data.map((row,index)=>({index,value:row[metric.key],date:row.date})).filter(p=>Number.isFinite(p.value));
    if(!observed.length) return e('p',null,'표시할 기록이 없습니다.');
    const values=observed.map(p=>p.value),min=Math.min(...values),max=Math.max(...values),pad=Math.max((max-min)*.2,metric.key==='fear'?1:.03),lo=min-pad,hi=max+pad;
    const X=i=>48+i/Math.max(1,data.length-1)*318,Y=v=>112-(v-lo)/(hi-lo)*88;
    const ticks=[hi,(hi+lo)/2,lo];
    const digits=metric.key==='fear'?0:2;
    return e('svg',{viewBox:'0 0 386 150',role:'img','aria-label':`${metric.label}, ${data[0].date}부터 ${data.at(-1).date}까지 ${observed.length}개 기록`,className:'oh-trend'},
      e('title',null,`${metric.label} 추이 · 세로축은 해당 기간의 관측 범위`),
      ticks.map((v,i)=>e('g',{key:i},e('line',{x1:48,x2:366,y1:Y(v),y2:Y(v),className:'oh-gridline'}),e('text',{x:40,y:Y(v)+4,textAnchor:'end'},v.toFixed(digits)))),
      lo<=0&&hi>=0?e('line',{x1:48,x2:366,y1:Y(0),y2:Y(0),className:'oh-zero'}):null,
      observed.slice(1).filter((p,i)=>p.index===observed[i].index+1).map(p=>{const prev=observed.find(q=>q.index===p.index-1);return e('line',{key:p.date,x1:X(prev.index),y1:Y(prev.value),x2:X(p.index),y2:Y(p.value),className:'oh-line'});}),
      observed.map(p=>e('circle',{key:p.date,cx:X(p.index),cy:Y(p.value),r:3,className:'oh-point'},e('title',null,`${p.date}: ${p.value}${metric.unit}`))),
      e('text',{x:48,y:140},data[0].date.slice(5).replace('-','/')),
      e('text',{x:366,y:140,textAnchor:'end'},data.at(-1).date.slice(5).replace('-','/'))
    );
  }
  function download(data) {
    const blob=new Blob([toCsv(data)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`과열지표_${data[0].date}_${data.at(-1).date}.csv`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return function Overheating() {
    const [date,setDate]=React.useState(provenance.asOf);
    const data=visibleRows(date),current=data.at(-1),previous=data.at(-2);
    const counts=metrics.reduce((sum,m)=>{sum[severity(m,current)]++;return sum;},{below:0,watch:0,danger:0,unknown:0});
    const summary=counts.unknown===8?'확인된 지표 없음 · 판정 보류':counts.watch+counts.danger===0?'확인 가능한 지표는 제공된 과열 기준 미도달':`${counts.watch}개 주의 · ${counts.danger}개 위험`;
    return e('section',{id:'overheating',className:'overheating','aria-labelledby':'oh-title'},
      e('div',{className:'oh-head'},e('div',null,e('span',{className:'eyebrow'},'CYCLE WATCH'),e('h2',{id:'oh-title'},'과열지표'),e('p',null,'사이클 과열을 살피는 일별 기록 · 공식 API와 원본 기록')),
        e('div',{className:'oh-controls'},e('label',{htmlFor:'oh-date'},'기준일'),e('select',{id:'oh-date',value:date,onChange:event=>setDate(event.target.value)},[...rows].reverse().map(row=>e('option',{key:row.date,value:row.date},row.date))),
        e('button',{type:'button',onClick:()=>setDate(provenance.asOf)},'최신 기록'),e('button',{type:'button',onClick:()=>download(data)},'표 CSV 저장'))),
      e('div',{className:'oh-summary','aria-live':'polite'},e('div',null,e('strong',null,summary),e('p',null,`${date} 기준 · ${8-counts.unknown}/8개 판정 가능 · ${counts.unknown}개 미제공. 기준 미도달이 상승·안전을 보장하거나 정점 시기를 확정하지는 않습니다.`)),
        e('div',{className:'oh-btc'},e('span',null,'기록된 BTC 가격 · 업비트'),e('b',null,Number.isFinite(current.btcKrw)?`₩${current.btcKrw.toLocaleString('ko-KR')}`:'미제공'),e('small',null,current.sources?.btcKrw?`UTC 일봉 ${current.sources.btcKrw.provisional?'진행 중 · 잠정값':'종가'} · 상단 실시간 시세와 별도`:'선택한 날짜의 원화 가격 · 상단 실시간 시세와 별도'))),
      e('p',{className:'oh-footnote'},`최근 수집 확인: ${daily.checkedAt} · 9/23 이후 미확인 항목은 미제공으로 표시합니다. 공포탐욕은 API의 UTC 관측일 기준이며 당일 값은 변경될 수 있습니다.`),
      e('div',{className:'oh-market'},metrics.filter(m=>m.kind!=='rank').map(metric=>e('article',{className:'oh-metric',key:metric.key},
        e('div',{className:'oh-cardhead'},e('h3',null,metric.label),e('span',{className:`oh-badge ${severity(metric,current)}`},names[severity(metric,current)])),
        e('div',{className:'oh-value'},e('strong',null,formatValue(metric,current)),e('span',null,deltaText(metric,current,previous))),
        e(Trend,{metric,data}),e('p',{className:'oh-rule'},metric.rule),e('small',null,current.sources?.[metric.key]?`${metric.source} API · ${current.sources[metric.key].observedAt}${current.sources[metric.key].provisional?' · 잠정값':''}`:`원본 표 출처: ${metric.source} · 추이 축: 관측 범위`)
      ))),
      e('div',{className:'oh-participation'},e('h3',null,'참여 관심도 · 순위'),e('div',{className:'oh-scroll',tabIndex:0,'aria-label':'앱 및 커뮤니티 순위 표'},e('table',null,
        e('thead',null,e('tr',null,['지표','기록','전일 변화','제공 기준','상태'].map(label=>e('th',{key:label,scope:'col'},label)))),
        e('tbody',null,metrics.filter(m=>m.kind==='rank').map(metric=>e('tr',{key:metric.key},e('th',{scope:'row'},metric.label),e('td',null,formatValue(metric,current)),e('td',null,deltaText(metric,current,previous)),e('td',null,metric.rule),e('td',null,e('span',{className:`oh-badge ${severity(metric,current)}`},names[severity(metric,current)]))))))),
        e('p',{className:'oh-footnote'},'순위권 없음은 미노출 기록이며 0위가 아닙니다. 업데이트 미제공은 결측으로 처리합니다. 순위가 낮아질수록 관심도가 높아지는 방향입니다.')),
      date==='2026-09-22'?e('p',{className:'oh-observation'},'MVRV Z-Score 0.95 → 1.12로 1.00 상향 돌파. “236일 만”은 사용자 제공 설명이며, 이 표의 22일 기록만으로 기간을 확인할 수 없습니다.'):null,
      e('details',{className:'oh-details'},e('summary',null,`날짜별 원본 기록 · ${data.length}일 (${data[0].date}–${date})`),
        e('div',{className:'oh-scroll',tabIndex:0,'aria-label':'과열지표 날짜별 원본 기록'},e('table',null,e('caption',null,'선택 기준일까지의 제공 기록 · 비고의 사건은 외부 검증 전'),
          e('thead',null,e('tr',null,['일자',...metrics.map(m=>m.label),'BTC 가격(KRW)','원본 비고'].map(label=>e('th',{key:label,scope:'col'},label)))),
          e('tbody',null,[...data].reverse().map(row=>e('tr',{key:row.date},e('th',{scope:'row'},row.date),...metrics.map(m=>e('td',{key:m.key},formatValue(m,row))),e('td',null,Number.isFinite(row.btcKrw)?`₩${row.btcKrw.toLocaleString('ko-KR')}`:'미제공'),e('td',{className:'oh-note'},row.note||'—'))))))),
      date===originalReport.date?e('details',{className:'oh-details oh-report',open:true},e('summary',null,'9월 22일 원문 메모'),e('p',{className:'oh-footnote'},'사용자 제공 원문 · 시장 해석과 기간 설명은 원문 작성자의 견해입니다. 원문의 ‘포인트’ 표현은 보존했으며, 지표 카드의 % 단위는 첨부 표를 따릅니다.'),e('h3',null,originalReport.title),e('ol',null,originalReport.items.map((text,i)=>e('li',{key:i},text))),e('p',null,originalReport.purpose),e('h4',null,'Reference'),e('ul',null,provenance.references.map(source=>e('li',{key:source},source)))):null,
      e('details',{className:'oh-details'},e('summary',null,'출처와 판단 기준'),e('p',null,`${provenance.source}. 제공 범위: ${provenance.periodStart}–${provenance.asOf}. ${provenance.verifiedAgainst}.`),
        e('ul',null,Object.entries(current.sources||{}).map(([key,source])=>e('li',{key},e('a',{href:source.url,target:'_blank',rel:'noreferrer'},`${key==='btcKrw'?'업비트 가격':metrics.find(m=>m.key===key)?.label} 원천 API`),` · 관측 ${source.observedAt} · 수집 ${source.retrievedAt}`))),
        e('p',null,'주의·위험 기준은 첨부 표의 작성자 기준입니다. 상향 돌파는 초과(>), 하향 돌파는 미만(<), 순위권 진입은 10위 이내로 적용합니다. 현재 값의 기준 충족 상태이며 당일 돌파 사건이나 종합 투자점수가 아닙니다.'),
        e('ul',null,provenance.limitations.map(text=>e('li',{key:text},text))),e('p',null,`원본 표의 Reference: ${provenance.references.join(' · ')}`))
    );
  };
}
