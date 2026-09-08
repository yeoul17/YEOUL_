const names=["최혜람","설예준","선아진","류재원","미오(배서우)","스이나 모모카","백은하","범설아","서율","진도운","월화","은나루","단홍화","그라티아 락테아","유스티티아 락테아","서윤호","양나라"];
const profileTemplate="직업 :\n생일 :\n키 :\n별자리 :\n성격 :\n탄생화 :\n동물화 :\n특이사항 :";
const profiles={
  "최혜람":"직업 : 동물원 수의사 및 사육사\n생일 : 11월 17일\n키 : 171cm\n별자리 : 전갈자리\n성격 : 세심함, 츤데레, 다정함\n탄생화 : 머위\n동물화 : 하늘색 판다\n특이사항 : 그믐달 동공",
  "설예준":"직업 : 비행기 승무원\n생일 : 1월 30일\n키 : 186cm\n별자리 : 물병자리\n성격 : 무뚝뚝, 츤데레(연인, 가족한정), 눈물많음\n탄생화 : 매쉬 메리골드\n동물화 : 분홍색 여우\n관계성 : 선아진과 연인\n특이사항 : 별과 달모양 하이라이트",
  "선아진":"직업 : 포토그래퍼\n생일 : 7월 5일\n키 : 166cm\n별자리 : 게자리\n성격 : 온화함, 늘 웃는 얼굴, 눈물없음\n탄생화 : 라벤더\n동물화 : 밀색 토끼\n관계성 : 설예준과 연인\n특이사항 : 하트 다이아모양 하이라이트",
  "류재원":"직업 : 대학생\n생일 : 9월 8일\n키 : 188cm\n별자리 : 처녀자리\n성격 : 3무(무관심, 무뚝뚝, 무소유), 나른함\n탄생화 : 갓\n동물화 : 초록 나비\n특이사항 : 나비모양 동공",
  "미오(배서우)":"직업 : 아이돌 및 배우\n생일 : 10월 3일\n키 : 171cm\n별자리 : 천칭자리\n성격 : 차분함, 냉소적, 정 많음\n탄생화 : 단풍나무\n동물화 : 녹색 브릿지 검은고양이\n특이사항 : 어깨와 허리 꽃 타투",
  "스이나 모모카":"직업 : 대학생\n생일 : 4월 9일\n키 : 164cm\n별자리 : 양자리\n성격 : 발랄함, 호기심, 애교많음\n탄생화 : 벚나무\n동물화 : 분홍 곰\n관계성 : 선아진 대학 후배\n특이사항 : 벚꽃 동공"
};
const C=names.map((name,i)=>({
  id:i+1,
  name,
  description:profiles[name]??profileTemplate,
  images:i===0?["images/characters/choi-hyeram.jpg"]:i===1?["images/characters/seol-yejun.jpg"]:i===2?["images/characters/seon-ajin.jpg"]:i===3?["images/characters/ryu-jaewon.jpg"]:[]
}));let page=1,current=null;const per=10;const grid=document.querySelector('#grid');

// Supabase 설정이 아직 입력되지 않은 경우를 위한 안전장치
const SUPABASE_READY=!!(window.supabase&&window.YEOUL_SUPABASE_URL&&window.YEOUL_SUPABASE_ANON_KEY&&window.YEOUL_SUPABASE_URL.includes('supabase.co')&&!window.YEOUL_SUPABASE_ANON_KEY.includes('YOUR-'));
const sb=SUPABASE_READY?window.supabase.createClient(window.YEOUL_SUPABASE_URL,window.YEOUL_SUPABASE_ANON_KEY):null;
let user=null,profile=null,likes=[];

function render(){const total=Math.ceil(C.length/per);page=Math.max(1,Math.min(page,total));grid.innerHTML='';C.slice((page-1)*per,page*per).forEach(c=>{const b=document.createElement('button');b.className='card';const liked=likes.includes(c.id);b.innerHTML=`<span class="num">${String(c.id).padStart(2,'0')}</span><div class="card-image-wrap">${c.images&&c.images.length?`<div class="card-image"><img src="${c.images[0]}" alt="${c.name}"></div>`:'<div class="card-image empty-card-image">IMAGE</div>'}<span class="card-like ${liked?'liked':''}" role="button" tabindex="0" aria-label="${c.name} 좋아요 ${liked?'취소':'누르기'}" title="좋아요" data-id="${c.id}">${liked?'♥':'♡'}</span></div><h3>${c.name}</h3>`;b.onclick=()=>openPreview(c.id);const heart=b.querySelector('.card-like');heart.onclick=(e)=>{e.preventDefault();e.stopPropagation();toggleCardLike(c.id)};heart.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();toggleCardLike(c.id)}};grid.appendChild(b)});document.querySelector('#label').textContent=`${String(page).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;document.querySelector('#dots').innerHTML=Array.from({length:total},(_,i)=>`<button class="dot ${i+1===page?'active':''}" onclick="goToCharacterPage(${i+1})"></button>`).join('')}
function renderPreviewImage(){const box=document.querySelector('#previewImage');box.innerHTML=current.images.length?`<img src="${current.images[0]}" alt="${current.name}">`:'IMAGE';}
function updateLikes(){if(!current)return;const on=likes.includes(current.id);document.querySelectorAll('.like').forEach(b=>{b.classList.toggle('liked',on);b.textContent=on?'♥':'♡'})}
function updateCardLikes(){document.querySelectorAll('.card-like').forEach(h=>{const id=Number(h.dataset.id);const on=likes.includes(id);h.classList.toggle('liked',on);h.textContent=on?'♥':'♡';h.setAttribute('aria-label',`${C.find(c=>c.id===id)?.name||''} 좋아요 ${on?'취소':'누르기'}`)})}

async function loadProfileAndLikes(){
  if(!sb||!user){profile=null;likes=[];refreshProfileUI();render();return;}
  const {data:pData}=await sb.from('profiles').select('id,nickname,avatar_url').eq('id',user.id).maybeSingle();
  profile=pData||null;
  const {data:lData}=await sb.from('character_likes').select('character_id').eq('user_id',user.id).order('created_at',{ascending:true});
  likes=(lData||[]).map(x=>Number(x.character_id));
  refreshProfileUI();render();
}

function renderMyLikes(){
  const list=document.querySelector('#myLikesList'), count=document.querySelector('#myLikesCount'), empty=document.querySelector('#myLikesEmpty');
  if(!list||!count||!empty)return;
  count.textContent=`${likes.length} / 3`;
  list.innerHTML='';
  likes.map(id=>C.find(c=>c.id===id)).filter(Boolean).forEach(c=>{
    const b=document.createElement('button'); b.className='my-like-item';
    b.innerHTML=c.images&&c.images.length?`<img src="${c.images[0]}" alt="${c.name}"><span>${c.name}</span>`:`<span class="my-like-placeholder">IMAGE</span><span>${c.name}</span>`;
    b.onclick=()=>{closeProfile(); show('characters'); requestAnimationFrame(()=>{const total=Math.ceil(C.length/per); const targetPage=Math.ceil(c.id/per); page=Math.max(1,Math.min(targetPage,total)); render(); requestAnimationFrame(()=>openPreview(c.id));});};
    list.appendChild(b);
  });
  empty.hidden=likes.length!==0;
}

function refreshProfileUI(){
  const nav=document.querySelector('#profileNav');const auth=document.querySelector('#profileAuthArea');const create=document.querySelector('#profileCreateArea');const userArea=document.querySelector('#profileUserArea');const name=document.querySelector('#profileUserName');const status=document.querySelector('#profileStatus');
  const avatar=document.querySelector('#profileUserAvatar');const fallback=document.querySelector('#profileUserAvatarFallback');
  if(!SUPABASE_READY){nav.textContent='♡　프로필';auth.hidden=false;create.hidden=true;userArea.hidden=true;status.textContent='이메일 인증 기능을 사용하려면 Supabase 설정이 필요합니다.';return;}
  if(user&&profile){nav.textContent='♡ '+profile.nickname;auth.hidden=true;create.hidden=true;userArea.hidden=false;name.textContent=profile.nickname;status.textContent='프로필이 준비되어 있어요. 이제 좋아요를 누를 수 있어요.';if(profile.avatar_url){avatar.src=profile.avatar_url;avatar.classList.add('show');fallback.classList.add('hide')}else{avatar.removeAttribute('src');avatar.classList.remove('show');fallback.classList.remove('hide')}}
  else if(user&&!profile){nav.textContent='♡　프로필';auth.hidden=true;create.hidden=false;userArea.hidden=true;status.textContent='이메일 인증이 완료됐어요. 이제 프로필을 만들어주세요.'}
  else{nav.textContent='♡　프로필';auth.hidden=false;create.hidden=true;userArea.hidden=true;status.textContent='프로필을 만들면 좋아요를 누를 수 있어요.'}
}
function openProfile(){const m=document.querySelector('#profileModal');refreshProfileUI();m.classList.add('open');m.setAttribute('aria-hidden','false');setTimeout(()=>{document.querySelector(user&&profile?'#profileName':'#profileEmail')?.focus()},50)}
function closeProfile(){const m=document.querySelector('#profileModal');m.classList.remove('open');m.setAttribute('aria-hidden','true')}

async function requireProfile(){
  if(user&&profile)return true;
  openProfile();
  if(!user) alert('좋아요를 누르려면 먼저 이메일 인증을 해주세요.');
  else alert('이메일 인증이 완료됐어요. 먼저 프로필을 만들어주세요.');
  return false;
}
async function toggleCardLike(id){
  if(!(await requireProfile()))return;
  const i=likes.indexOf(id);
  if(i>=0){const {error}=await sb.from('character_likes').delete().eq('user_id',user.id).eq('character_id',id);if(error)return alert('좋아요 취소에 실패했어요.');likes.splice(i,1)}
  else{if(likes.length>=3)return alert('좋아요는 최대 3명까지 선택할 수 있어요.');const {error}=await sb.from('character_likes').insert({user_id:user.id,character_id:id});if(error)return alert('좋아요 저장에 실패했어요.');likes.push(id)}
  updateCardLikes();updateLikes();renderMyLikes();
}
async function toggleLike(){if(current)await toggleCardLike(current.id)}

let previewScrollY=0;
function openPreview(id){previewScrollY=window.scrollY||document.documentElement.scrollTop||0;current=C.find(x=>x.id===id);document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));const selected=[...document.querySelectorAll('.card')].find(c=>c.querySelector('.num')?.textContent===String(current.id).padStart(2,'0'));if(selected)selected.classList.add('selected');const previewInner=document.querySelector('#preview .preview-inner');const previewDesc=document.querySelector('#previewDesc');if(previewInner){previewInner.scrollTop=0;previewInner.scrollLeft=0;}if(previewDesc){previewDesc.scrollTop=0;previewDesc.scrollLeft=0;}document.querySelector('#previewName').textContent=current.name;document.querySelector('#previewDesc').innerHTML=current.description.split('\n').map(line=>{const parts=line.split(' : ');return parts.length>1?`<span class="info-line"><b>${parts.shift()} :</b> ${parts.join(' : ')}</span>`:`<span class="info-line intro-line">${line}</span>`}).join('');renderPreviewImage();document.querySelector('#preview').classList.add('open');if(previewInner){previewInner.scrollTop=0;previewInner.scrollLeft=0;}document.body.classList.add('preview-open');document.documentElement.classList.add('preview-open');document.body.style.overflow='hidden'}
function closePreview(){document.querySelector('#preview').classList.remove('open');document.body.classList.remove('preview-open');document.documentElement.classList.remove('preview-open');document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));document.body.style.overflow='';requestAnimationFrame(()=>window.scrollTo(0,previewScrollY))}
document.querySelector('#previewClose').onclick=closePreview;
function goToCharacterPage(nextPage){const total=Math.ceil(C.length/per);page=Math.max(1,Math.min(nextPage,total));render();requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));}
document.querySelector('#prev').onclick=()=>goToCharacterPage(page-1);document.querySelector('#next').onclick=()=>goToCharacterPage(page+1);document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();show(b.dataset.page);}));
function show(id){
  try{
    closePreview();
    document.body.classList.remove('preview-open');
    document.documentElement.classList.remove('preview-open');
    document.body.style.overflow='';
    if(typeof window.resetHome==='function') window.resetHome();
    const pages=document.querySelectorAll('.page');
    pages.forEach(p=>p.classList.remove('active'));
    const target=document.getElementById(id);
    if(!target){console.error('페이지를 찾을 수 없습니다:',id);return;}
    target.classList.add('active');
    document.querySelectorAll('[data-page]').forEach(n=>n.classList.toggle('active',n.dataset.page===id));
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));
  }catch(err){console.error('페이지 이동 오류:',err);alert('페이지를 여는 중 오류가 발생했어요. 새로고침 후 다시 시도해주세요.');}
}
window.show=show;
document.getElementById('loginNav')?.addEventListener('click',function(e){e.preventDefault();show('login');});


const profileModal=document.querySelector('#profileModal');
document.querySelector('#profileNav').onclick=openProfile;document.querySelector('#profileClose').onclick=closeProfile;document.querySelector('.profile-backdrop').onclick=closeProfile;

document.querySelector('#profileSendEmail').onclick=async()=>{
  if(!sb)return alert('먼저 Supabase 설정을 완료해주세요.');
  const email=document.querySelector('#profileEmail').value.trim();
  if(!email||!email.includes('@'))return alert('올바른 이메일 주소를 입력해주세요.');
  const btn=document.querySelector('#profileSendEmail');btn.disabled=true;btn.textContent='인증 메일 보내는 중...';
  const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+window.location.pathname,shouldCreateUser:true}});
  btn.disabled=false;btn.textContent='이메일 인증 링크 받기';
  const msg=document.querySelector('#profileAuthMessage');msg.classList.remove('error');
  if(error){msg.textContent='메일을 보내지 못했어요: '+error.message;msg.classList.add('error');return;}
  msg.textContent='인증 링크를 보냈어요! 이메일을 확인하고 링크를 눌러주세요.';msg.classList.add('success');
};

document.querySelector('#profileCreate').onclick=async()=>{
  if(!sb||!user)return alert('먼저 이메일 인증을 완료해주세요.');
  const input=document.querySelector('#profileName');const name=input.value.trim();if(!name)return alert('닉네임을 입력해주세요.');
  const file=document.querySelector('#profileAvatar').files[0];
  if(file&&file.size>5*1024*1024)return alert('프로필 사진은 5MB 이하로 올려주세요.');
  const btn=document.querySelector('#profileCreate');btn.disabled=true;btn.textContent='프로필 저장 중...';
  let avatarUrl=profile?.avatar_url||null;
  if(file){const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=`${user.id}/avatar.${ext}`;const {error:upErr}=await sb.storage.from('avatars').upload(path,file,{upsert:true,contentType:file.type});if(upErr){btn.disabled=false;btn.textContent='프로필 만들기';return alert('프로필 사진 업로드에 실패했어요: '+upErr.message)}avatarUrl=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl+'?v='+Date.now();}
  const {error}=await sb.from('profiles').upsert({id:user.id,nickname:name,avatar_url:avatarUrl,updated_at:new Date().toISOString()});
  btn.disabled=false;btn.textContent='프로필 만들기';if(error)return alert('프로필 저장에 실패했어요: '+error.message);
  await loadProfileAndLikes();alert('프로필이 만들어졌어요! 이제 좋아요를 누를 수 있어요.');
};

document.querySelector('#profileAvatar').onchange=(e)=>{const file=e.target.files[0];const box=document.querySelector('#profileAvatarPreview');if(!file){box.innerHTML='♡';return}if(file.size>5*1024*1024){e.target.value='';box.innerHTML='♡';return alert('프로필 사진은 5MB 이하로 올려주세요.')}const reader=new FileReader();reader.onload=()=>{box.innerHTML=`<img src="${reader.result}" alt="미리보기">`};reader.readAsDataURL(file)};
document.querySelector('#profileName').addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('#profileCreate').click()});
document.querySelector('#profileEmail').addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('#profileSendEmail').click()});

document.querySelector('#profileEdit').onclick=()=>{if(!profile)return;document.querySelector('#profileCreateArea').hidden=false;document.querySelector('#profileUserArea').hidden=true;document.querySelector('#profileName').value=profile.nickname;document.querySelector('#profileStatus').textContent='닉네임이나 프로필 사진을 변경할 수 있어요.';const box=document.querySelector('#profileAvatarPreview');box.innerHTML=profile.avatar_url?`<img src="${profile.avatar_url}" alt="현재 프로필 사진">`:'♡';};

document.querySelector('#loginPasswordBtn').onclick=async()=>{
  if(!sb)return alert('먼저 Supabase 설정을 완료해주세요.');
  const email=document.querySelector('#loginEmail').value.trim();
  const password=document.querySelector('#loginPassword').value;
  const msg=document.querySelector('#loginMessage');
  msg.classList.remove('error','success');
  if(!email||!email.includes('@'))return alert('올바른 이메일 주소를 입력해주세요.');
  if(!password)return alert('비밀번호를 입력해주세요.');
  const btn=document.querySelector('#loginPasswordBtn');btn.disabled=true;btn.textContent='로그인 중...';
  const {error}=await sb.auth.signInWithPassword({email,password});
  btn.disabled=false;btn.textContent='로그인';
  if(error){msg.textContent=error.message.includes('Email not confirmed')?'이메일 인증이 완료되지 않았어요. 받은 인증 메일에서 이메일을 인증해주세요.':'로그인에 실패했어요: '+error.message;msg.classList.add('error');return;}
  msg.textContent='로그인되었습니다.';msg.classList.add('success');
};
document.querySelector('#signupPasswordBtn').onclick=async()=>{
  if(!sb)return alert('먼저 Supabase 설정을 완료해주세요.');
  const email=document.querySelector('#loginEmail').value.trim();
  const password=document.querySelector('#loginPassword').value;
  const msg=document.querySelector('#loginMessage');
  msg.classList.remove('error','success');
  if(!email||!email.includes('@'))return alert('올바른 이메일 주소를 입력해주세요.');
  if(password.length<6)return alert('비밀번호는 6자 이상으로 입력해주세요.');
  const btn=document.querySelector('#signupPasswordBtn');btn.disabled=true;btn.textContent='가입 중...';
  const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+window.location.pathname}});
  btn.disabled=false;btn.textContent='회원가입';
  if(error){msg.textContent='회원가입에 실패했어요: '+error.message;msg.classList.add('error');return;}
  if(data.session){msg.textContent='회원가입과 로그인이 완료되었습니다.';msg.classList.add('success');}
  else{msg.textContent='가입이 완료되었습니다. 이메일로 받은 인증 링크를 눌러 계정을 활성화해주세요.';msg.classList.add('success');}
};
document.querySelector('#loginOtpBtn').onclick=async()=>{
  if(!sb)return alert('먼저 Supabase 설정을 완료해주세요.');
  const email=document.querySelector('#loginEmail').value.trim();
  const msg=document.querySelector('#loginMessage');msg.classList.remove('error','success');
  if(!email||!email.includes('@'))return alert('올바른 이메일 주소를 입력해주세요.');
  const btn=document.querySelector('#loginOtpBtn');btn.disabled=true;btn.textContent='인증 메일 보내는 중...';
  const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+window.location.pathname,shouldCreateUser:true}});
  btn.disabled=false;btn.textContent='이메일 인증으로 간편 로그인';
  if(error){msg.textContent='인증 메일을 보내지 못했어요: '+error.message;msg.classList.add('error');return;}
  msg.textContent='로그인 링크를 보냈어요! 이메일을 확인해주세요.';msg.classList.add('success');
};
document.querySelector('#loginToProfile').onclick=()=>{ if(user) openProfile(); else alert('먼저 로그인해주세요.'); };
document.querySelector('#loginEmail').addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('#loginPassword').focus()});
document.querySelector('#loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('#loginPasswordBtn').click()});

document.querySelector('#profileLogout').onclick=async()=>{if(!sb)return;if(!confirm('로그아웃할까요?'))return;await sb.auth.signOut();user=null;profile=null;likes=[];refreshProfileUI();render();closeProfile()};

if(sb){sb.auth.onAuthStateChange((event,session)=>{user=session?.user||null;setTimeout(async()=>{await loadProfileAndLikes();if(event==='SIGNED_IN'){closeProfile();setTimeout(()=>{if(!profile)openProfile()},250)}},0)});sb.auth.getSession().then(async({data})=>{user=data.session?.user||null;await loadProfileAndLikes();});}
render();refreshProfileUI();
