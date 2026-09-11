
'use strict';
const lessons=window.TRILINGUAL_DATA||{};
let history=window.TRILINGUAL_HISTORY||{};
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalizeDate=v=>{const m=String(v||'').match(/(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})/);return m?m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0'):''};
let current='chinese',session='evening',selectedDate='';
function records(lang=current){
 const source=history[lang]||[],headers=source[0]||[];
 return source.slice(1).filter(r=>normalizeDate(r[0])).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
}
function dates(){return [...new Set([...records().map(r=>normalizeDate(r['날짜'])),normalizeDate(lessons[current]?.date)].filter(Boolean))].sort().reverse()}
function dayRows(){return records().filter(r=>normalizeDate(r['날짜'])===selectedDate)}
function eveningRows(){return dayRows().filter(r=>!String(r['학습 주제']).includes('브리핑'))}
function chosenVocab(){return normalizeDate(lessons[current]?.date)===selectedDate?lessons[current]?.vocab||[]:[]}
function feedback(r){return r['발음·전달력 피드백']||r['발음 피드백']||''}
function words(r){return r['핵심 표현·단어']||r['고급·시사 어휘']||''}
function field(title,text){return text?'<div class="record-field"><strong>'+esc(title)+'</strong><p>'+esc(text)+'</p></div>':''}
function vocabHtml(rows=[]){
 return rows.length?'<div class="table-scroll" role="region" aria-label="단어와 용례 표" tabindex="0"><table class="study-table"><thead><tr><th>단어·표현</th><th>뜻·문맥</th><th>용례·조합</th><th>반대·대비 표현</th></tr></thead><tbody>'+rows.map(v=>'<tr><th scope="row">'+esc(v.word)+'</th><td>'+esc(v.meaning)+'</td><td>'+esc(v.usage)+'</td><td>'+esc(v.opposite)+'</td></tr>').join('')+'</tbody></table></div>':'';
}
function recordHtml(r,i){return '<details class="record-card"'+(i===0?' open':'')+'><summary><span>'+String(i+1).padStart(2,'0')+'</span> '+esc(r['학습 주제'])+'</summary><div class="record-body">'+field('한국어 문제',r['한국어 문제'])+field('회화 패턴',r['회화 패턴'])+field('예문',r['예문'])+field('내 답변 원문',r['내 발화'])+field('교정 문장',r['교정 문장'])+field('단어·표현',words(r))+field('피드백·수정 이유',feedback(r))+field('복습',String(r['복습 상태']||'')+' · '+String(r['복습일']||''))+field('메모',r['메모'])+'</div></details>'}
function correctionTable(rows){
 return rows.length?'<p class="subtle">총 '+rows.length+'개 기록 · 표를 좌우로 밀어 전체 내용을 확인하세요.</p><div class="table-scroll" tabindex="0" role="region" aria-label="날짜별 발화와 교정 표"><table class="study-table correction-table"><thead><tr>'+['주제·문제','내 답변 원문','교정 문장','단어·표현','수정 이유·피드백'].map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr><th scope="row">'+esc(r['학습 주제'])+field('문제',r['한국어 문제']||r['회화 패턴'])+'</th><td>'+esc(r['내 발화'])+'</td><td>'+esc(r['교정 문장']||r['예문'])+'</td><td>'+esc(words(r))+'</td><td>'+esc(feedback(r))+'</td></tr>').join('')+'</tbody></table></div>':'<p class="empty-state">이 날짜에 저장된 저녁 학습 기록이 없습니다.</p>';
}
function render(){
 const available=dates();if(!available.includes(selectedDate))selectedDate=available[0]||'';
 $('studyDate').innerHTML=available.map(d=>'<option value="'+d+'"'+(d===selectedDate?' selected':'')+'>'+d+'</option>').join('');
 document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===current));
 document.querySelectorAll('[data-session]').forEach(b=>{b.classList.toggle('active',b.dataset.session===session);b.setAttribute('aria-pressed',String(b.dataset.session===session))});
 $('todayDate').textContent=selectedDate;
 const rows=eveningRows(),d=lessons[current]||{};
 $('todayTitle').textContent=session==='evening'?'저녁 학습 기록':'오전 어휘 정리';
 if(session==='morning'){
  const morning=dayRows().filter(r=>String(r['학습 주제']).includes('브리핑'));
  $('lessonCards').innerHTML=morning.length?morning.map(recordHtml).join(''):(normalizeDate(d.date)===selectedDate?vocabHtml(chosenVocab()):'<p class="empty-state">이 날짜에 저장된 오전 어휘가 없습니다.</p>');
  $('memoText').textContent=morning.length?'시트에 기록된 오전 어휘와 학습 내용을 표시합니다.':d.memo||'';
 }else{
  $('lessonCards').innerHTML=rows.length?'<p class="subtle">'+rows.filter(r=>r['내 발화']).length+'개 답변 · '+rows.length+'개 기록</p>'+rows.map(recordHtml).join(''):'<p class="empty-state">이 날짜에 저장된 저녁 학습 기록이 없습니다.</p>';
  $('memoText').textContent=rows.length?'문장별 제목을 누르면 문제, 내 답변, 교정 문장과 수정 이유를 펼쳐볼 수 있습니다. 전체 비교는 교정 표에서 확인하세요.':'수업 후 기록을 저장하면 이 날짜에 표시됩니다.';
 }
 $('notesList').innerHTML=correctionTable(rows);
 $('reviewList').innerHTML=rows.length?rows.map((r,i)=>'<article class="note-item">'+field(String(i+1)+'. '+r['학습 주제'],words(r))+field('복습 문장',r['교정 문장']||r['예문'])+field('상태·일정',String(r['복습 상태']||'')+' · '+String(r['복습일']||''))+field('메모',r['메모'])+'</article>').join(''):vocabHtml(chosenVocab());
 $('syncStatus').textContent=window.trilingualSyncLabel||'시트 연결 전 · 저장된 기록 표시 중';
}
document.querySelectorAll('.lang-btn').forEach(b=>b.onclick=()=>{current=b.dataset.lang;render()});
document.querySelectorAll('[data-session]').forEach(b=>b.onclick=()=>{session=b.dataset.session;render()});
$('studyDate').onchange=e=>{selectedDate=e.target.value;render()};
document.querySelectorAll('.section-tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.section-tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active-panel',x.id===b.dataset.section))});
$('themeBtn').onclick=()=>document.body.classList.toggle('light');
$('refreshBtn').onclick=()=>location.reload();
if('serviceWorker' in navigator){
 let refreshing=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!refreshing){refreshing=true;location.reload()}});
 navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});
}
let deferredPrompt;const install=$('installBtn');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;install.hidden=false});
install.onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;install.hidden=true}};
render();

window.addEventListener('trilingual-sheet-update', e=>{
 const opened=[...document.querySelectorAll('.record-card')].map(x=>x.open);
 const scroll=window.scrollY;
 history=e.detail;render();
 document.querySelectorAll('.record-card').forEach((x,i)=>{if(i<opened.length)x.open=opened[i]});
 window.scrollTo(0,scroll);
});
