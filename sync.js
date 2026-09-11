'use strict';
(() => {
 const STORAGE='trilingual-sheet-connection-v1';
 let config=null,busy=false,lastData='',lastSuccess='';
 const status=document.getElementById('syncStatus');
 const form=document.getElementById('sheetConnection');
 const endpoint=document.getElementById('sheetEndpoint');
 const key=document.getElementById('sheetKey');
 const message=document.getElementById('connectionMessage');
 try{config=JSON.parse(localStorage.getItem(STORAGE)||'null')}catch{}
 const valid=c=>c&&/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(c.endpoint)&&/^[a-f0-9]{64}$/.test(c.key);
 if(!valid(config))config=null;
 if(config)endpoint.value=config.endpoint;
 window.trilingualSyncLabel=config?'시트 연결 확인 중…':'시트 연결 전 · 저장된 기록 표시 중';
 function label(s){window.trilingualSyncLabel=s;status.textContent=s}
 function validate(data){
  if(!data||data.ok!==true||data.spreadsheetId!=='1nq5g5YUJQkATZP6Q6UnjKA8mjPHOf9hDEaiHPY3dS0g')throw Error('응답을 확인할 수 없습니다. 연결 주소와 키를 확인하세요.');
  for(const lang of ['chinese','english']){const rows=data.history?.[lang];if(!Array.isArray(rows)||!Array.isArray(rows[0])||rows[0][0]!=='날짜'||!rows[0].includes('학습 주제')||!rows[0].includes('내 발화'))throw Error('시트의 날짜·학습 주제·내 발화 열을 확인하세요.');}
  return data.history;
 }
 async function sync(){
  if(busy||document.hidden)return;
  if(!config){label('시트 연결 전 · 저장된 기록 표시 중');return;}
  busy=true;label('시트에서 최신 내용 확인 중…');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch(config.endpoint,{method:'POST',body:JSON.stringify({key:config.key}),credentials:'omit',redirect:'follow',cache:'no-store',signal:controller.signal});
   if(!response.ok)throw Error('시트 연결 실패');
   const next=validate(await response.json()),serialized=JSON.stringify(next);
   lastSuccess=new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
   label('시트 연결됨 · '+lastSuccess+' 확인 · 화면을 보는 동안 20초마다 갱신');
   if(serialized!==lastData){lastData=serialized;window.dispatchEvent(new CustomEvent('trilingual-sheet-update',{detail:next}));}
   message.textContent='연결됨. 시트 수정 사항이 자동으로 반영됩니다.';
  }catch(e){label((lastSuccess?lastSuccess+' 마지막 성공 · ':'')+'연결 실패 · 현재 기록 유지');message.textContent='연결 주소·키와 웹 앱 배포 설정을 확인하세요. 연결 후에도 실패하면 다시 시도해 주세요.';}
  finally{clearTimeout(timer);busy=false;}
 }
 form.addEventListener('submit',e=>{e.preventDefault();const next={endpoint:endpoint.value.trim(),key:key.value.trim()||config?.key};if(!valid(next)){message.textContent='Google 웹 앱의 /exec 주소와 64자리 연결 키를 입력하세요.';return;}config=next;try{localStorage.setItem(STORAGE,JSON.stringify(config));message.textContent='이 기기에 연결 설정을 저장했습니다.'}catch{message.textContent='기기 저장이 제한되어 이번 실행 동안만 연결됩니다.'}key.value='';lastData='';sync();});
 document.getElementById('disconnectSheet').onclick=()=>{config=null;localStorage.removeItem(STORAGE);endpoint.value='';key.value='';message.textContent='자동 연결을 해제했습니다.';label('시트 연결 해제 · 현재 기록 표시 중')};
 document.getElementById('refreshBtn').onclick=()=>config?sync():location.reload();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
 window.addEventListener('online',sync);setInterval(sync,20000);sync();
})();
