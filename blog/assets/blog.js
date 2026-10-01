(function(){
  // thanh tiến độ đọc + mục lục đang đọc
  var bar=document.querySelector(".progress"),art=document.querySelector(".main");
  if(bar&&art){var on=function(){var r=art.getBoundingClientRect(),h=art.offsetHeight-innerHeight*.6;bar.style.width=Math.min(100,Math.max(0,-r.top/h*100))+"%";};addEventListener("scroll",on,{passive:true});on();}
  var links=[].slice.call(document.querySelectorAll(".stoc a"));
  if(links.length&&"IntersectionObserver" in window){
    var map={};links.forEach(function(a){map[a.getAttribute("href").slice(1)]=a;});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.remove("on")});var a=map[e.target.id];if(a)a.classList.add("on");}});},{rootMargin:"-20% 0px -70% 0px"});
    document.querySelectorAll(".main h2[id]").forEach(function(h){io.observe(h)});
  }
  document.querySelectorAll("[data-copy]").forEach(function(b){b.addEventListener("click",function(){
    var u=location.href.split("#")[0];
    (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){b.textContent="✓";setTimeout(function(){b.textContent="🔗"},1500)}).catch(function(){prompt("Copy link:",u)});
  });});
  // ảnh lỗi -> hình vector dự phòng
  document.querySelectorAll("img[data-fb]").forEach(function(im){im.addEventListener("error",function(){if(im.dataset.fb&&im.src.indexOf(im.dataset.fb)<0){im.removeAttribute("srcset");im.src=im.dataset.fb;}});});
  // tìm kiếm toàn blog
  var q=document.getElementById("q"),grid=document.getElementById("grid");
  if(!q||!grid)return;
  var orig=grid.innerHTML,cnt=document.getElementById("cnt"),origCnt=cnt?cnt.textContent:"",empty=document.querySelector(".empty"),pager=document.querySelector(".pager"),feat=document.getElementById("feat"),data=null,t;
  function norm(s){return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d");}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]});}
  function card(p){return '<a class="card" href="'+p.s+'.html"><div class="im"><img src="'+(p.im||("img/"+p.i))+'" width="1600" height="900" loading="lazy" alt=""'+(p.im?' data-fb="img/'+p.i+'"':'')+'></div><div class="tx"><span class="cat" data-cat="'+esc(p.c)+'">'+esc(p.c)+'</span><h3>'+esc(p.t)+'</h3><p>'+esc(p.d)+'</p><div class="ft"><span>'+p.r+' phút đọc</span><b>Đọc bài →</b></div></div></a>';}
  function run(){
    var s=norm(q.value.trim());
    if(!s){grid.innerHTML=orig;if(cnt)cnt.textContent=origCnt;if(empty)empty.style.display="none";if(pager)pager.style.display="";if(feat)feat.style.display="";return;}
    var words=s.split(/\s+/),res=data.filter(function(p){var h=p._h||(p._h=norm(p.t+" "+p.d+" "+p.k+" "+p.c));return words.every(function(w){return h.indexOf(w)>-1});}).slice(0,60);
    grid.innerHTML=res.map(card).join("");if(cnt)cnt.textContent=res.length;if(empty)empty.style.display=res.length?"none":"block";if(pager)pager.style.display="none";if(feat)feat.style.display="none";
  }
  q.addEventListener("input",function(){clearTimeout(t);t=setTimeout(function(){if(data)return run();fetch("assets/search.json").then(function(r){return r.json()}).then(function(d){data=d;run();});},150);});
  addEventListener("keydown",function(e){if(e.key==="/"&&document.activeElement!==q){e.preventDefault();q.focus();}});
})();
(function(){
  // chọn ngôn ngữ — dùng chung khoá "acca-lang" với trang chủ
  var sel=document.querySelector(".blang");if(!sel)return;
  var alts={};try{alts=JSON.parse(sel.getAttribute("data-alts"))}catch(e){}
  var cur=document.documentElement.lang||"vi";
  if(cur!=="vi"){try{localStorage.setItem("acca-lang",cur)}catch(e){}}
  sel.addEventListener("change",function(){var l=sel.value;try{localStorage.setItem("acca-lang",l)}catch(e){}if(alts[l])location.href=alts[l];});
  // trang chủ blog (tiếng Việt): khách đã chọn ngôn ngữ khác ở trang chủ -> mở blog ngôn ngữ đó
  if(document.body.getAttribute("data-blog-home")==="1"&&cur==="vi"&&!/[?&]lang=vi/.test(location.search)){
    var s=null;try{s=localStorage.getItem("acca-lang")}catch(e){}
    if(s&&s!=="vi"&&alts[s])location.replace(alts[s]);
  }
})();
