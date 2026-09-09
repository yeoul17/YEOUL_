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
const SUPABASE_READY=!!(window.supabase&&typeof window.supabase.createClient==='function'&&typeof window.YEOUL_SUPABASE_URL==='string'&&window.YEOUL_SUPABASE_URL.includes('.supabase.co')&&typeof window.YEOUL_SUPABASE_ANON_KEY==='string'&&window.YEOUL_SUPABASE_ANON_KEY.length>20&&!window.YEOUL_SUPABASE_ANON_KEY.includes('YOUR-'));
let sb=null;
let SUPABASE_INIT_ERROR='';
if(SUPABASE_READY){try{sb=window.supabase.createClient(window.YEOUL_SUPABASE_URL.trim(),window.YEOUL_SUPABASE_ANON_KEY.trim());}catch(e){SUPABASE_INIT_ERROR=e?.message||String(e);}}
let user=null,profile=null,likes=[];

function render(){const total=Math.ceil(C.length/per);page=Math.max(1,Math.min(page,total));grid.innerHTML='';C.slice((page-1)*per,page*per).forEach(c=>{const b=document.createElement('button');b.className='card';const liked=likes.includes(c.id);b.innerHTML=`<span class="num">${String(c.id).padStart(2,'0')}</span><div class="card-image-wrap">${c.images&&c.images.length?`<div class="card-image"><img src="${c.images[0]}" alt="${c.name}"></div>`:'<div class="card-image empty-card-image">IMAGE</div>'}<span class="card-like ${liked?'liked':''}" role="button" tabindex="0" aria-label="${c.name} 좋아요 ${liked?'취소':'누르기'}" title="좋아요" data-id="${c.id}">${liked?'♥':'♡'}</span></div><h3>${c.name}</h3>`;b.onclick=()=>openPreview(c.id);const heart=b.querySelector('.card-like');heart.onclick=(e)=>{e.preventDefault();e.stopPropagation();toggleCardLike(c.id)};heart.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();toggleCardLike(c.id)}};grid.appendChild(b)});document.querySelector('#label').textContent=`${String(page).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;document.querySelector('#dots').innerHTML=Array.from({length:total},(_,i)=>`<button class="dot ${i+1===page?'active':''}" onclick="goToCharacterPage(${i+1})"></button>`).join('')}
function renderPreviewImage(){const box=document.querySelector('#previewImage');box.innerHTML=current.images.length?`<img src="${current.images[0]}" alt="${current.name}">`:'IMAGE';}
function updateLikes(){if(!current)return;const on=likes.includes(current.id);document.querySelectorAll('.like').forEach(b=>{b.classList.toggle('liked',on);b.textContent=on?'♥':'♡'})}
function updateCardLikes(){document.querySelectorAll('.card-like').forEach(h=>{const id=Number(h.dataset.id);const on=likes.includes(id);h.classList.toggle('liked',on);h.textContent=on?'♥':'♡';h.setAttribute('aria-label',`${C.find(c=>c.id===id)?.name||''} 좋아요 ${on?'취소':'누르기'}`)})}

async function loadProfileAndLikes(){
  if(!sb||!user){profile=null;likes=[];refreshProfileUI();render();return;}
  const {data:pData}=await sb.from('profiles').select('id,nickname,avatar_url,is_master').eq('id',user.id).maybeSingle();
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
  const loginNav=document.querySelector('#loginNav');
  const loginTitle=document.querySelector('#loginTitle'),loginEyebrow=document.querySelector('#loginEyebrow'),loginBoxTitle=document.querySelector('#loginBoxTitle'),loginIntro=document.querySelector('#loginIntro');
  const loginGuest=document.querySelector('#loginGuestArea'),loginMember=document.querySelector('#loginMemberArea');
  if(!SUPABASE_READY){nav.textContent='♡　프로필';if(loginNav)loginNav.style.display='';auth.hidden=false;create.hidden=true;userArea.hidden=true;if(loginGuest)loginGuest.hidden=false;if(loginMember)loginMember.hidden=true;status.textContent='Supabase 설정이 준비되지 않았어요.';return;}
  if(user&&profile){
    if(loginGuest)loginGuest.hidden=true;if(loginMember)loginMember.hidden=false;
    nav.textContent='♡ '+profile.nickname;
    if(loginNav)loginNav.style.display='none';
    auth.hidden=true;create.hidden=true;userArea.hidden=false;name.textContent=profile.nickname;status.textContent='프로필이 준비되어 있어요. 이제 좋아요를 누를 수 있어요.';
    if(profile.avatar_url){avatar.src=profile.avatar_url;avatar.classList.add('show');fallback.classList.add('hide')}else{avatar.removeAttribute('src');avatar.classList.remove('show');fallback.classList.remove('hide')}
    if(loginTitle)loginTitle.textContent='내 프로필'; if(loginEyebrow)loginEyebrow.textContent='MY PROFILE'; if(loginBoxTitle)loginBoxTitle.textContent='여울의 보석함 프로필'; if(loginIntro)loginIntro.textContent='로그인되어 있습니다. 프로필과 좋아요한 보석을 확인할 수 있어요.';
  } else {
    if(loginGuest)loginGuest.hidden=!!user;if(loginMember)loginMember.hidden=!user;
    nav.textContent='♡　프로필';
    if(loginNav)loginNav.style.display=user?'none':'';
    if(user){auth.hidden=true;create.hidden=false;userArea.hidden=true;status.textContent='이메일 인증이 완료됐어요. 이제 프로필을 만들어주세요.';}
    else{auth.hidden=false;create.hidden=true;userArea.hidden=true;status.textContent='프로필을 만들면 좋아요를 누를 수 있어요.';}
    if(loginTitle)loginTitle.textContent=user?'내 프로필':'로그인'; if(loginEyebrow)loginEyebrow.textContent=user?'MY PROFILE':'MEMBER LOGIN'; if(loginBoxTitle)loginBoxTitle.textContent=user?'여울의 보석함 프로필':'여울의 보석함 로그인'; if(loginIntro)loginIntro.textContent=user?'로그인이 완료됐어요. 아래 버튼에서 프로필을 열어주세요.':'이메일과 비밀번호로 로그인해주세요.';
  }
  renderMyLikes();
}
function openProfile(){const m=document.querySelector('#profileModal');if(!m)return;refreshProfileUI();document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));m.classList.add('open');m.setAttribute('aria-hidden','false');document.querySelectorAll('[data-page]').forEach(n=>n.classList.remove('active'));const nav=document.querySelector('#profileNav');if(nav)nav.classList.add('active');requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));setTimeout(()=>{document.querySelector(user&&profile?'#profileName':'#loginEmail')?.focus()},50)}
function closeProfile(){const m=document.querySelector('#profileModal');if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true')}

async function requireProfile(){
  if(user&&profile)return true;
  if(!user){
    const go=confirm('좋아요를 누르려면 먼저 로그인해주세요.\n\n[확인] 로그인 페이지로 이동\n[취소] 그대로 있기');
    if(go){show('login');setLoginMode('login');document.querySelector('#loginEmail')?.focus();}
    return false;
  }
  openProfile();
  popup('프로필이 필요해요','로그인은 완료됐지만 아직 프로필이 만들어지지 않았어요.\n\n프로필에서 닉네임을 입력하고 프로필을 만들어주세요.');
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
function openPreview(id){
  if(!user){
    const go=confirm('캐릭터를 보려면 먼저 로그인해주세요.\n\n[확인] 로그인 페이지로 이동\n[취소] 그대로 있기');
    if(go)show('login');
    return;
  }
  previewScrollY=window.scrollY||document.documentElement.scrollTop||0;current=C.find(x=>x.id===id);document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));const selected=[...document.querySelectorAll('.card')].find(c=>c.querySelector('.num')?.textContent===String(current.id).padStart(2,'0'));if(selected)selected.classList.add('selected');const previewInner=document.querySelector('#preview .preview-inner');const previewDesc=document.querySelector('#previewDesc');if(previewInner){previewInner.scrollTop=0;previewInner.scrollLeft=0;}if(previewDesc){previewDesc.scrollTop=0;previewDesc.scrollLeft=0;}document.querySelector('#previewName').textContent=current.name;document.querySelector('#previewDesc').innerHTML=current.description.split('\n').map(line=>{const parts=line.split(' : ');return parts.length>1?`<span class="info-line"><b>${parts.shift()} :</b> ${parts.join(' : ')}</span>`:`<span class="info-line intro-line">${line}</span>`}).join('');renderPreviewImage();document.querySelector('#preview').classList.add('open');if(previewInner){previewInner.scrollTop=0;previewInner.scrollLeft=0;}document.body.classList.add('preview-open');document.documentElement.classList.add('preview-open');document.body.style.overflow='hidden'}
function closePreview(){document.querySelector('#preview').classList.remove('open');document.body.classList.remove('preview-open');document.documentElement.classList.remove('preview-open');document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));document.body.style.overflow='';requestAnimationFrame(()=>window.scrollTo(0,previewScrollY))}
document.querySelector('#previewClose').onclick=closePreview;
function goToCharacterPage(nextPage){const total=Math.ceil(C.length/per);page=Math.max(1,Math.min(nextPage,total));render();requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));}
document.querySelector('#prev').onclick=()=>goToCharacterPage(page-1);document.querySelector('#next').onclick=()=>goToCharacterPage(page+1);document.querySelectorAll('[data-page]').forEach(b=>{b.addEventListener('click',e=>{e.preventDefault();show(b.dataset.page);});});
function show(id){
  closePreview();
  closeProfile();
  document.body.classList.remove('preview-open');
  document.documentElement.classList.remove('preview-open');
  document.body.style.overflow='';
  if(typeof window.resetHome==='function')window.resetHome();
  const target=document.getElementById(id);
  if(!target)return;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  target.classList.add('active');
  document.querySelectorAll('[data-page]').forEach(n=>n.classList.toggle('active',n.dataset.page===id));
  document.querySelector('#profileNav')?.classList.remove('active');
  if(id==='home'){document.body.classList.remove('home-guide-open');document.documentElement.classList.remove('home-guide-open');}
  refreshProfileUI();
  requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));
}

const profileModal=document.querySelector('#profileModal');
document.querySelector('#profileNav').onclick=()=>{if(user)openProfile();else{show('login');setLoginMode('login');document.querySelector('#loginEmail')?.focus();}};document.querySelector('#profileClose').onclick=closeProfile;document.querySelector('.profile-backdrop').onclick=closeProfile;

document.querySelector('#profileGoLogin').onclick=()=>{closeProfile();show('login');setLoginMode('login');document.querySelector('#loginEmail')?.focus();};

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

document.querySelector('#profileEdit').onclick=()=>{if(!profile)return;document.querySelector('#profileCreateArea').hidden=false;document.querySelector('#profileUserArea').hidden=true;document.querySelector('#profileName').value=profile.nickname;document.querySelector('#profileStatus').textContent='닉네임이나 프로필 사진을 변경할 수 있어요.';document.querySelector('#profileCreate').textContent='수정 완료';const box=document.querySelector('#profileAvatarPreview');box.innerHTML=profile.avatar_url?`<img src="${profile.avatar_url}" alt="현재 프로필 사진">`:'♡';};

function authErrorMessage(error, mode){
  const raw=String(error?.message||error?.error_description||'').trim();
  const code=String(error?.code||'').trim();
  const status=String(error?.status||'');
  const all=(raw+' '+code+' '+status).toLowerCase();
  if(all.includes('invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않아요.\n\n이메일 주소를 다시 확인하고, 비밀번호를 정확히 입력해주세요.\n\n이 이메일로 예전에 다른 방식으로 계정이 만들어졌는데 비밀번호를 설정하지 않았다면 비밀번호 로그인이 되지 않을 수 있어요.\n\n그 경우에는 아래의 비밀번호 재설정 버튼에서 새 비밀번호를 설정한 뒤 로그인해주세요.';
  if(all.includes('email not confirmed')) return '이메일 인증이 아직 완료되지 않았어요.\n\n가입할 때 받은 인증 메일의 링크를 먼저 눌러주세요.';
  if(all.includes('user already registered')||all.includes('already registered')) return '이미 가입된 이메일이에요.\n\n회원가입이 아니라 로그인 버튼을 이용해주세요. 비밀번호를 모른다면 이메일 간편 로그인을 이용할 수 있어요.';
  if(mode==='otp' && (all.includes('signups not allowed')||all.includes('signup') && (all.includes('disabled')||all.includes('not allowed')))) return '이메일 간편 로그인은 이미 가입된 계정에서만 사용할 수 있어요.\n\n아직 회원가입하지 않았다면 먼저 이메일과 비밀번호로 회원가입해주세요.';
  if(all.includes('signups not allowed')||all.includes('signup') && (all.includes('disabled')||all.includes('not allowed'))) return '현재 Supabase에서 신규 회원가입이 허용되지 않았어요.\n\nSupabase > Authentication > Sign In > Allow new users to sign up을 켜주세요.';
  if(all.includes('password') && (all.includes('at least')||all.includes('6')||all.includes('short'))) return '비밀번호는 6자 이상이어야 해요.';
  if(all.includes('rate limit')||all.includes('rate_limit')) return '이메일 발송 제한에 걸렸어요.\n\n잠시 기다린 뒤 다시 시도해주세요. 이미 받은 인증 메일이 있다면 기존 메일의 링크를 사용해주세요.';
  if(all.includes('fetch')||all.includes('network')||all.includes('failed to fetch')) return 'Supabase 서버에 연결하지 못했어요.\n\n인터넷 연결과 Supabase 설정을 확인해주세요.';
  return (mode==='login'?'로그인에 실패했어요.':mode==='signup'?'회원가입에 실패했어요.':mode==='reset'?'비밀번호 재설정에 실패했어요.':'이메일 간편 로그인에 실패했어요.')+'\n\n'+(raw||'알 수 없는 오류가 발생했어요.')+(code?`\n\n오류 코드: ${code}`:'');
}
function popup(title,message){alert(title+'\n\n'+message);}
function getLoginValues(){return {email:document.querySelector('#loginEmail').value.trim(),password:document.querySelector('#loginPassword').value};}
function validateEmail(email){return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);}
let loginMode='login';
function setLoginMode(mode){
  loginMode=mode==='signup'?'signup':'login';
  const wrap=document.querySelector('#signupPasswordConfirmWrap');
  const confirm=document.querySelector('#signupPasswordConfirm');
  const loginBtn=document.querySelector('#loginPasswordBtn');
  const signupBtn=document.querySelector('#signupPasswordBtn');
  const title=document.querySelector('#loginTitle');
  const eyebrow=document.querySelector('#loginEyebrow');
  const boxTitle=document.querySelector('#loginBoxTitle');
  const intro=document.querySelector('#loginIntro');
  if(wrap)wrap.hidden=loginMode!=='signup';
  if(confirm && loginMode!=='signup')confirm.value='';
  if(loginBtn)loginBtn.textContent=loginMode==='signup'?'회원가입으로 돌아가기':'로그인';
  if(signupBtn){signupBtn.textContent=loginMode==='signup'?'가입하기':'회원가입';}
  if(title)title.textContent=loginMode==='signup'?'회원가입':'로그인';
  if(eyebrow)eyebrow.textContent=loginMode==='signup'?'MEMBER SIGN UP':'MEMBER LOGIN';
  if(boxTitle)boxTitle.textContent=loginMode==='signup'?'여울의 보석함 회원가입':'여울의 보석함 로그인';
  if(intro)intro.textContent=loginMode==='signup'?'이메일과 비밀번호를 입력해 계정을 만들어주세요.':'이메일과 비밀번호로 로그인해주세요.';
  const otp=document.querySelector('#loginOtpBtn'); if(otp)otp.style.display=loginMode==='signup'?'none':''; const reset=document.querySelector('#loginResetBtn'); if(reset)reset.style.display=loginMode==='signup'?'none':'';
}
async function finishAuth(session,message){
  user=session?.user||null;
  await loadProfileAndLikes();
  refreshProfileUI();
  openProfile();
  if(message)popup('로그인 완료',message+'\n\n이제 이 페이지는 내 프로필로 바뀌어요.');
}

document.querySelector('#loginPasswordBtn').onclick=async()=>{
  if(loginMode==='signup'){setLoginMode('login');return;}
  if(!sb)return popup('로그인할 수 없어요',SUPABASE_INIT_ERROR||'Supabase 설정이 준비되지 않았어요. supabase-config.js의 URL과 Publishable Key를 확인해주세요.');
  const {email,password}=getLoginValues();
  if(!validateEmail(email))return popup('입력 확인','올바른 이메일 주소를 입력해주세요.\n\n예: example@email.com');
  if(!password)return popup('입력 확인','비밀번호를 입력해주세요.');
  const btn=document.querySelector('#loginPasswordBtn');btn.disabled=true;btn.textContent='로그인 중...';
  try{const {data,error}=await sb.auth.signInWithPassword({email,password});if(error){popup('로그인 실패',authErrorMessage(error,'login'));return;}await finishAuth(data?.session||null,'로그인이 정상적으로 완료되었습니다.');}
  catch(e){popup('로그인 오류',authErrorMessage(e,'login'));}
  finally{btn.disabled=false;btn.textContent='로그인';}
};

document.querySelector('#signupPasswordBtn').onclick=async()=>{
  if(loginMode!=='signup'){setLoginMode('signup');document.querySelector('#loginEmail')?.focus();return;}
  if(!sb)return popup('회원가입할 수 없어요',SUPABASE_INIT_ERROR||'Supabase 설정이 준비되지 않았어요. supabase-config.js의 URL과 Publishable Key를 확인해주세요.');
  const {email,password}=getLoginValues();
  const confirmPassword=document.querySelector('#signupPasswordConfirm').value;
  if(!validateEmail(email))return popup('입력 확인','올바른 이메일 주소를 입력해주세요.\n\n예: example@email.com');
  if(password.length<6)return popup('입력 확인','비밀번호는 6자 이상으로 입력해주세요.\n\n현재 입력한 비밀번호가 너무 짧아요.');
  if(password!==confirmPassword)return popup('입력 확인','비밀번호가 서로 일치하지 않아요.\n\n비밀번호와 비밀번호 확인을 똑같이 입력해주세요.');
  const btn=document.querySelector('#signupPasswordBtn');btn.disabled=true;btn.textContent='가입 중...';
  try{
    const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+window.location.pathname}});
    if(error){popup('회원가입 실패',authErrorMessage(error,'signup'));return;}
    // Supabase는 이미 가입된 이메일에 대해 보안상 오류 대신 identities가 비어 있는 user를 반환할 수 있습니다.
    if(data?.user && Array.isArray(data.user.identities) && data.user.identities.length===0){
      popup('회원가입할 수 없어요','이 이메일은 이미 가입된 계정입니다.\n\n회원가입이 아니라 로그인해주세요.\n비밀번호가 기억나지 않으면 ' + '비밀번호를 잊으셨나요?' + '를 눌러 새 비밀번호를 설정할 수 있어요.');
      setLoginMode('login');
      return;
    }
    if(data?.session){await finishAuth(data.session,'회원가입과 로그인이 완료되었습니다.');}
    else{popup('회원가입 완료','계정이 만들어졌어요.\n\n이메일 인증이 필요한 설정이라면 가입한 이메일로 인증 메일이 도착합니다. 인증 링크를 누른 뒤 같은 이메일과 비밀번호로 로그인해주세요.');setLoginMode('login');}
  }catch(e){popup('회원가입 오류',authErrorMessage(e,'signup'));}
  finally{btn.disabled=false;btn.textContent=loginMode==='signup'?'가입하기':'회원가입';}
};

document.querySelector('#loginEmail').addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('#loginPassword').focus()});
document.querySelector('#loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('#loginPasswordBtn').click()});
document.querySelector('#signupPasswordConfirm').addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('#signupPasswordBtn').click()});

const OTP_COOLDOWN_MS=60000;
function otpCooldownRemaining(){const t=Number(localStorage.getItem('yeoul_otp_last_sent')||0);return Math.max(0,OTP_COOLDOWN_MS-(Date.now()-t));}
function startOtpCooldown(btn){
  const tick=()=>{const left=otpCooldownRemaining();if(left<=0){btn.disabled=false;btn.textContent='이메일 인증으로 간편 로그인';return;}btn.disabled=true;btn.textContent=`인증 메일 재전송 (${Math.ceil(left/1000)}초)`;setTimeout(tick,1000)};tick();
}
document.querySelector('#loginOtpBtn').onclick=async()=>{
  if(!sb)return popup('간편 로그인할 수 없어요',SUPABASE_INIT_ERROR||'Supabase 설정이 준비되지 않았어요.');
  const email=document.querySelector('#loginEmail').value.trim();
  if(!validateEmail(email))return popup('입력 확인','올바른 이메일 주소를 입력해주세요.');
  const btn=document.querySelector('#loginOtpBtn');
  const remaining=otpCooldownRemaining();
  if(remaining>0){startOtpCooldown(btn);return popup('잠시만 기다려주세요',`인증 메일을 최근에 요청했어요. ${Math.ceil(remaining/1000)}초 후 다시 요청해주세요.\n\n이미 받은 메일이 있다면 새로 요청하지 말고 기존 인증 링크를 눌러주세요.`);}
  btn.disabled=true;btn.textContent='인증 메일 보내는 중...';
  try{
    const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+window.location.pathname,shouldCreateUser:false}});
    if(error){
      const raw=String(error.message||'');
      if(raw.toLowerCase().includes('rate limit')||raw.toLowerCase().includes('rate_limit')){localStorage.setItem('yeoul_otp_last_sent',String(Date.now()));startOtpCooldown(btn);popup('이메일 발송 제한',authErrorMessage(error,'otp'));return;}
      popup('간편 로그인 실패',authErrorMessage(error,'otp'));return;
    }
    localStorage.setItem('yeoul_otp_last_sent',String(Date.now()));startOtpCooldown(btn);
    popup('인증 메일 발송 완료','인증 메일을 보냈어요.\n\n이메일을 열고 인증 링크를 눌러주세요.\n인증이 완료되면 이 사이트로 돌아오면서 자동으로 로그인됩니다.');
  }catch(e){popup('간편 로그인 오류',authErrorMessage(e,'otp'));}
  finally{if(otpCooldownRemaining()<=0){btn.disabled=false;btn.textContent='이메일 인증으로 간편 로그인';}}
};

document.querySelector('#loginResetBtn').onclick=async()=>{
  if(!sb)return popup('비밀번호를 재설정할 수 없어요',SUPABASE_INIT_ERROR||'Supabase 설정이 준비되지 않았어요.');
  const email=document.querySelector('#loginEmail').value.trim();
  if(!validateEmail(email))return popup('입력 확인','비밀번호를 재설정할 이메일 주소를 먼저 입력해주세요.');
  const btn=document.querySelector('#loginResetBtn');btn.disabled=true;btn.textContent='재설정 메일 보내는 중...';
  try{
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});
    if(error){popup('비밀번호 재설정 실패',authErrorMessage(error,'reset'));return;}
    popup('비밀번호 재설정 메일 발송','비밀번호 재설정 링크를 이메일로 보냈어요.\n\n메일의 링크를 눌러 새 비밀번호를 설정해주세요.');
  }catch(e){popup('비밀번호 재설정 오류',authErrorMessage(e,'reset'));}
  finally{btn.disabled=false;btn.textContent='비밀번호를 잊으셨나요?';}
};

document.querySelector('#loginToProfile').onclick=()=>{if(user)openProfile();};
document.querySelector('#loginMemberLogout').onclick=async()=>{if(!sb)return;if(!confirm('로그아웃할까요?'))return;const {error}=await sb.auth.signOut();if(error){popup('로그아웃 실패',error.message);return;}user=null;profile=null;likes=[];setLoginMode('login');refreshProfileUI();render();show('login');};
document.querySelector('#loginEmail').addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('#loginPassword').focus()});
document.querySelector('#loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')document.querySelector('#loginPasswordBtn').click()});

document.querySelector('#profileLogout').onclick=async()=>{if(!sb)return;if(!confirm('로그아웃할까요?'))return;await sb.auth.signOut();user=null;profile=null;likes=[];refreshProfileUI();render();closeProfile()};

if(sb){
  sb.auth.onAuthStateChange((event,session)=>{
    user=session?.user||null;
    setTimeout(async()=>{
      try{await loadProfileAndLikes();}catch(e){console.error('profile load error',e);refreshProfileUI();}
      if(event==='PASSWORD_RECOVERY'){
        const first=prompt('새 비밀번호를 입력해주세요. (6자 이상)');
        if(first===null)return;
        if(first.length<6){popup('비밀번호 오류','비밀번호는 6자 이상이어야 해요.');return;}
        const second=prompt('새 비밀번호를 한 번 더 입력해주세요.');
        if(first!==second){popup('비밀번호 오류','두 비밀번호가 서로 일치하지 않아요.');return;}
        const {error:pwError}=await sb.auth.updateUser({password:first});
        if(pwError)popup('비밀번호 변경 실패',authErrorMessage(pwError,'reset'));
        else popup('비밀번호 변경 완료','새 비밀번호가 설정됐어요. 이제 이메일과 새 비밀번호로 로그인할 수 있어요.');
      }
      if(event==='SIGNED_IN'){openProfile();}
      if(event==='SIGNED_OUT'){profile=null;likes=[];setLoginMode('login');refreshProfileUI();render();show('login');}
    },0);
  });
  sb.auth.getSession().then(async({data,error})=>{
    if(error)console.error('getSession error',error);
    user=data?.session?.user||null;
    try{await loadProfileAndLikes();}catch(e){console.error('initial profile load error',e);refreshProfileUI();}
  });
}
render();refreshProfileUI();if(!user)setLoginMode(loginMode);

/* v78 master dashboard */
async function loadMasterLikes(){
  const grid=document.querySelector('#masterLikesGrid');
  const status=document.querySelector('#masterStatus');
  const totalEl=document.querySelector('#masterLikeTotal');
  const empty=document.querySelector('#masterEmpty');
  if(!grid||!status||!totalEl||!empty)return;
  if(!user||!profile?.is_master){grid.innerHTML='';totalEl.textContent='';empty.hidden=true;status.textContent='마스터 계정만 볼 수 있어요.';return;}
  status.textContent='좋아요 기록을 불러오는 중...';
  const {data:likesData,error}=await sb.from('character_likes').select('user_id,character_id,created_at').order('created_at',{ascending:false});
  if(error){status.textContent='불러오기에 실패했어요.';grid.innerHTML='';empty.hidden=false;empty.querySelector('h3').textContent='좋아요 기록을 불러오지 못했어요.';empty.querySelector('p').textContent=error.message;return;}
  const rows=likesData||[];
  totalEl.textContent=`전체 ${rows.length}개`;
  grid.innerHTML='';
  if(!rows.length){empty.hidden=false;status.textContent='좋아요 기록이 없습니다.';return;}
  empty.hidden=true;
  const ids=[...new Set(rows.map(r=>r.user_id))];
  let profileMap=new Map();
  if(ids.length){
    const {data:pRows,error:pErr}=await sb.from('profiles').select('id,nickname,avatar_url').in('id',ids);
    if(!pErr)(pRows||[]).forEach(p=>profileMap.set(p.id,p));
  }
  C.forEach(c=>{
    const mine=rows.filter(r=>Number(r.character_id)===c.id);
    if(!mine.length)return;
    const card=document.createElement('div');card.className='master-like-card';
    const users=mine.map(r=>{
      const p=profileMap.get(r.user_id);
      const name=p?.nickname||'프로필 미작성 사용자';
      const date=r.created_at?new Date(r.created_at).toLocaleString('ko-KR',{dateStyle:'short',timeStyle:'short'}):'';
      const avatar=p?.avatar_url?`<img class="master-like-avatar" src="${p.avatar_url}" alt="">`:'<span class="master-like-avatar">♡</span>';
      return `<div class="master-like-user">${avatar}<div><strong>${name}</strong><small>${date}</small></div></div>`;
    }).join('');
    card.innerHTML=`<h3>${c.name}<span class="master-like-count">${mine.length}명</span></h3><div class="master-like-users">${users}</div>`;
    grid.appendChild(card);
  });
  status.textContent=`캐릭터 ${grid.children.length}개에 좋아요가 있어요.`;
}

const originalRefreshProfileUI=refreshProfileUI;
refreshProfileUI=function(){
  originalRefreshProfileUI();
  const masterNav=document.querySelector('#masterNav');
  if(masterNav){masterNav.hidden=!(user&&profile?.is_master);}
  if(user&&profile?.is_master&&document.querySelector('#master')?.classList.contains('active'))loadMasterLikes();
};

const originalShow=show;
show=function(id){
  if(id==='master' && !(user&&profile?.is_master)){
    popup('접근할 수 없어요','마스터 계정만 좋아요 관리 페이지를 볼 수 있습니다.');
    return;
  }
  originalShow(id);
  if(id==='master')loadMasterLikes();
};

document.querySelector('#masterRefresh')?.addEventListener('click',loadMasterLikes);
