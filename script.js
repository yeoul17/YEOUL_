const names=["최혜람","설예준","선아진","류재원","미오(배서우)","스이나 모모카","백은하","범설아","서율","진도운","월화","은나루","단홍화","그라티아 락테아","유스티티아 락테아","서윤호","양나라"];
const profileTemplate="직업 :\n생일 :\n키 :\n별자리 :\n성격 :\n탄생화 :\n동물화 :\n특이사항 :";
const profiles={
  "최혜람":"직업 : 동물원 수의사 및 사육사\n생일 : 11월 17일\n키 : 171cm\n별자리 : 전갈자리\n성격 : 세심함, 츤데레, 다정함\n탄생화 : 머위\n동물화 : 하늘색 판다\n특이사항 : 그믐달 동공",
  "설예준":"직업 : 비행기 승무원\n생일 : 1월 30일\n키 : 186cm\n별자리 : 물병자리\n성격 : 무뚝뚝, 츤데레(연인, 가족한정), 눈물많음\n탄생화 : 매쉬 메리골드\n동물화 : 분홍색 여우\n관계성 : 선아진과 연인\n특이사항 : 별과 달모양 하이라이트",
  "선아진":"직업 : 포토그래퍼\n생일 : 7월 5일\n키 : 166cm\n별자리 : 게자리\n성격 : 온화함, 늘 웃는 얼굴, 눈물없음\n탄생화 : 라벤더\n동물화 : 밀색 토끼\n관계성 : 설예준과 연인\n특이사항 : 하트 다이아모양 하이라이트",
  "류재원":"직업 : 대학생\n생일 : 9월 8일\n키 : 188cm\n별자리 : 처녀자리\n성격 : 3무(무관심, 무뚝뚝, 무소유), 나른함\n탄생화 : 갓\n동물화 : 초록 나비\n특이사항 : 나비모양 동공"
};
const C=names.map((name,i)=>({
  id:i+1,
  name,
  description:profiles[name]??profileTemplate,
  images:i===0?["images/characters/choi-hyeram.jpg"]:i===1?["images/characters/seol-yejun.jpg"]:i===2?["images/characters/seon-ajin.jpg"]:[]
}));let page=1,current=null;const per=10;const grid=document.querySelector('#grid');const likes=JSON.parse(localStorage.getItem('yeoulLikes')||'[]');
function render(){const total=Math.ceil(C.length/per);page=Math.max(1,Math.min(page,total));grid.innerHTML='';C.slice((page-1)*per,page*per).forEach(c=>{const b=document.createElement('button');b.className='card';const liked=likes.includes(c.id);b.innerHTML=`<span class="num">${String(c.id).padStart(2,'0')}</span><div class="card-image-wrap">${c.images&&c.images.length?`<div class="card-image"><img src="${c.images[0]}" alt="${c.name}"></div>`:'<div class="card-image empty-card-image">IMAGE</div>'}<span class="card-like ${liked?'liked':''}" role="button" tabindex="0" aria-label="${c.name} 좋아요 ${liked?'취소':'누르기'}" title="좋아요" data-id="${c.id}">${liked?'♥':'♡'}</span></div><h3>${c.name}</h3>`;b.onclick=()=>openPreview(c.id);const heart=b.querySelector('.card-like');heart.onclick=(e)=>{e.preventDefault();e.stopPropagation();toggleCardLike(c.id)};heart.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();toggleCardLike(c.id)}};grid.appendChild(b)});document.querySelector('#label').textContent=`${String(page).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;document.querySelector('#dots').innerHTML=Array.from({length:total},(_,i)=>`<button class="dot ${i+1===page?'active':''}" onclick="goToCharacterPage(${i+1})"></button>`).join('')}
function renderPreviewImage(){const box=document.querySelector('#previewImage');box.innerHTML=current.images.length?`<img src="${current.images[0]}" alt="${current.name}">`:'IMAGE';}
function updateLikes(){const on=likes.includes(current.id);document.querySelectorAll('.like').forEach(b=>{b.classList.toggle('liked',on);b.textContent=on?'♥':'♡'})}
function saveLikes(){localStorage.setItem('yeoulLikes',JSON.stringify(likes))}
function toggleLike(){const i=likes.indexOf(current.id);if(i>=0)likes.splice(i,1);else if(likes.length<3)likes.push(current.id);else return alert('좋아요는 최대 3명까지 선택할 수 있어요.');saveLikes();updateLikes();updateCardLikes()}
function toggleCardLike(id){const i=likes.indexOf(id);if(i>=0)likes.splice(i,1);else if(likes.length<3)likes.push(id);else return alert('좋아요는 최대 3명까지 선택할 수 있어요.');saveLikes();updateCardLikes();if(current&&current.id===id)updateLikes()}
function updateCardLikes(){document.querySelectorAll('.card-like').forEach(h=>{const id=Number(h.dataset.id);const on=likes.includes(id);h.classList.toggle('liked',on);h.textContent=on?'♥':'♡';h.setAttribute('aria-label',`${C.find(c=>c.id===id)?.name||''} 좋아요 ${on?'취소':'누르기'}`)})}
let previewScrollY=0;
function openPreview(id){previewScrollY=window.scrollY||document.documentElement.scrollTop||0;current=C.find(x=>x.id===id);document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));const selected=[...document.querySelectorAll('.card')].find(c=>c.querySelector('.num')?.textContent===String(current.id).padStart(2,'0'));if(selected)selected.classList.add('selected');const previewInner=document.querySelector('#preview .preview-inner');const previewDesc=document.querySelector('#previewDesc');if(previewInner){previewInner.scrollTop=0;previewInner.scrollLeft=0;}if(previewDesc){previewDesc.scrollTop=0;previewDesc.scrollLeft=0;}document.querySelector('#previewName').textContent=current.name;document.querySelector('#previewDesc').innerHTML=current.description.split('\n').map(line=>{const parts=line.split(' : ');return parts.length>1?`<span class="info-line"><b>${parts.shift()} :</b> ${parts.join(' : ')}</span>`:`<span class="info-line intro-line">${line}</span>`}).join('');renderPreviewImage();document.querySelector('#preview').classList.add('open');if(previewInner){previewInner.scrollTop=0;previewInner.scrollLeft=0;}document.body.classList.add('preview-open');document.documentElement.classList.add('preview-open');document.body.style.overflow='hidden'}
function closePreview(){document.querySelector('#preview').classList.remove('open');document.body.classList.remove('preview-open');document.documentElement.classList.remove('preview-open');document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));document.body.style.overflow='';requestAnimationFrame(()=>window.scrollTo(0,previewScrollY))}
document.querySelector('#previewClose').onclick=closePreview;
function goToCharacterPage(nextPage){
  const total=Math.ceil(C.length/per);
  page=Math.max(1,Math.min(nextPage,total));
  render();
  requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));
}
document.querySelector('#prev').onclick=()=>goToCharacterPage(page-1);
document.querySelector('#next').onclick=()=>goToCharacterPage(page+1);
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>show(b.dataset.page));
function show(id){
  closePreview();
  document.body.classList.remove('preview-open');
  document.documentElement.classList.remove('preview-open');
  document.body.style.overflow='';
  if(typeof window.resetHome==='function') window.resetHome();
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target=document.querySelector('#'+id); if(target) target.classList.add('active');
  document.querySelectorAll('[data-page]').forEach(n=>n.classList.toggle('active',n.dataset.page===id));
  requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));
}
render();
