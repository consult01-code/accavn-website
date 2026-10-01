/* ACCA Consulting Vietnam — Chatbox "Tư vấn online miễn phí"
 * Gắn vào trang: <script src="chat/acca-chat.js" defer></script> (blog: ../chat/acca-chat.js)
 * Chế độ AI: gọi máy chủ Apps Script (AccaChat.gs). Chưa có API key → trả lời theo kho kiến thức bên dưới.
 * Mở chat từ nút bất kỳ: thêm thuộc tính data-acca-chat, hoặc gọi window.ACCAChat.open().
 */
(function(){
  if (window.ACCAChat) return;
  var BACKEND = 'https://script.google.com/macros/s/AKfycbzcNPAWKicAS9pv_2H0T6I3l1xnJlasKL-Emf0XWyKs-dOb_vvP0M9_q_wV2IWIteyYEQ/exec';
  var ZALO = 'https://zalo.me/0938847699', PHONE = '0938 847 699';
  var lang = (document.documentElement.getAttribute('data-lang') || document.documentElement.lang || 'vi').slice(0,2);
  var VI = lang === 'vi';
  var T = VI ? {
    launch:'Tư vấn online miễn phí tại đây', title:'Trợ lý ACCA', sub:'Tư vấn online miễn phí · kế toán, thuế, doanh nghiệp',
    hello:'Chào anh/chị, em là Trợ lý ACCA. Anh/chị cần tư vấn về kế toán, thuế, thành lập công ty hay phần mềm ACCA Smart ạ?',
    ph:'Nhập câu hỏi của anh/chị…', send:'Gửi', typing:'Trợ lý đang trả lời…',
    leadT:'Để lại thông tin, chuyên viên ACCA gọi lại trong giờ làm việc', name:'Họ tên', phone:'Số điện thoại', need:'Anh/chị cần tư vấn gì?', leadBtn:'Gửi thông tin',
    leadOk:'Em đã nhận thông tin. Chuyên viên ACCA sẽ liên hệ anh/chị sớm nhất. Cần gấp: gọi/Zalo '+PHONE+'.',
    leadErr:'Chưa gửi được. Anh/chị nhắn Zalo '+PHONE+' giúp em nhé.', badPhone:'Số điện thoại chưa đúng, anh/chị kiểm tra lại giúp em.',
    limit:'Hôm nay trợ lý đã trả lời nhiều câu. Anh/chị để lại số điện thoại hoặc nhắn Zalo '+PHONE+' để chuyên viên hỗ trợ tiếp ạ.',
    close:'Đóng', zalo:'Nhắn Zalo', call:'Gọi '+PHONE, leave:'Để lại SĐT'
  } : {
    launch:'Free online consultation here', title:'ACCA Assistant', sub:'Free online advice · accounting, tax, company setup',
    hello:'Hello, I am the ACCA Assistant. How can I help with accounting, tax, company setup or ACCA Smart software?',
    ph:'Type your question…', send:'Send', typing:'Assistant is typing…',
    leadT:'Leave your details and an ACCA consultant will call you back', name:'Full name', phone:'Phone number', need:'What do you need help with?', leadBtn:'Send',
    leadOk:'Thank you. An ACCA consultant will contact you shortly. Urgent: call/Zalo +84 938 847 699.',
    leadErr:'Could not send. Please message us on Zalo +84 938 847 699.', badPhone:'Please check the phone number.',
    limit:'The assistant has reached today\'s limit. Please leave your phone number or message Zalo +84 938 847 699.',
    close:'Close', zalo:'Zalo', call:'Call +84 938 847 699', leave:'Leave phone'
  };
  var CHIPS = VI ? ['Báo giá kế toán','Thành lập công ty','Hạn nộp thuế','Phần mềm ACCA Smart','Doanh nghiệp FDI','Gặp chuyên viên']
                 : ['Accounting price','Company setup','Tax deadlines','ACCA Smart software','FDI company','Talk to a consultant'];

  /* ---------- Kho kiến thức (chế độ miễn phí) ---------- */
  var KB = [
    {k:['gia','bao gia','chi phi','bao nhieu tien','phi dich vu','price','cost','fee'], a:
      'Phí kế toán trọn gói tạm tính theo tháng:\n• Chưa phát sinh hóa đơn: từ 399.000đ\n• 1–15 hóa đơn: 800.000đ · 16–30: 1.200.000đ · 31–50: 1.800.000đ · 51–100: 2.800.000đ · trên 100: 4.000.000đ\n• Sản xuất–xây dựng ×1,3; doanh nghiệp FDI ×1,6; cộng thêm theo số nhân viên (5–15 người +300.000đ).\nAnh/chị có thể tự ước tính ở mục Bảng giá trên trang chủ. Để lại số điện thoại để nhận báo giá chính xác theo hồ sơ nhé.', lead:true},
    {k:['thanh lap','mo cong ty','dang ky kinh doanh','giay phep kinh doanh','lap cong ty','setup','incorporat','establish'], a:
      'ACCA hỗ trợ thành lập doanh nghiệp trọn gói: tư vấn loại hình, ngành nghề, vốn điều lệ, soạn và nộp hồ sơ. Thường 3–5 ngày làm việc nhận giấy chứng nhận đăng ký doanh nghiệp sau khi hồ sơ đầy đủ. Sau khi thành lập, ACCA tiếp tục làm kế toán – thuế để doanh nghiệp không bị phạt chậm nộp tờ khai.', lead:true},
    {k:['han nop','thoi han','deadline','khi nao nop','ngay nop','to khai thang','to khai quy'], a:
      'Hạn nộp tờ khai thuế:\n• Kê khai tháng: chậm nhất ngày 20 tháng sau.\n• Kê khai quý: chậm nhất ngày cuối tháng đầu quý sau.\n• Báo cáo tài chính, quyết toán TNDN và TNCN năm: chậm nhất ngày cuối tháng thứ 3 sau khi kết thúc năm tài chính.\nDoanh nghiệp chưa có doanh thu vẫn phải nộp tờ khai định kỳ.'},
    {k:['chua co doanh thu','chua phat sinh','khong co doanh thu','khong hoat dong'], a:
      'Có ạ. Doanh nghiệp chưa có doanh thu vẫn phải nộp tờ khai thuế định kỳ (như tờ khai GTGT) và báo cáo tài chính năm. Bỏ sót có thể bị phạt chậm nộp hồ sơ. Gói chỉ khai báo thuế của ACCA từ 399.000đ/tháng.'},
    {k:['phan mem','acca smart','smart','kho phan mem','software','accounting software','portal'], a:
      'Kho phần mềm online ACCA Smart (accavn.com/portal.html):\n• Đang dùng được: ACCA Smart-Accounting (phần mềm kế toán online theo Thông tư 99/2025 và 133/2016) 399.000đ/tháng; ACCA Smart-Business Infor (theo dõi doanh thu, lãi lỗ, thuế cho chủ doanh nghiệp) 199.000đ/tháng.\n• Sắp ra mắt: Cash, Document, Tax, HR, Insurance, Sales, CRM, Finance, Training, Meeting và nhiều phần mềm khác.\nTài khoản do ACCA cấp, anh/chị để lại số điện thoại để được mở tài khoản dùng thử nhé.', lead:true},
    {k:['fdi','nuoc ngoai','von nuoc ngoai','foreign','expat','investor'], a:
      'ACCA đồng hành cùng doanh nghiệp có vốn đầu tư nước ngoài: kế toán, thuế, báo cáo định kỳ cho chủ đầu tư, hỗ trợ thủ tục và trao đổi được bằng tiếng Anh. Phí kế toán doanh nghiệp FDI tính hệ số ×1,6 theo bảng giá.', lead:true},
    {k:['vat','gtgt','8%','giam thue','thue suat'], a:
      'Thuế GTGT: nhóm hàng hóa, dịch vụ đủ điều kiện được giảm còn 8% đến hết 31/12/2026 (Nghị quyết 204/2025/QH15). Hàng mua vào từ 5 triệu đồng trở lên phải thanh toán không dùng tiền mặt mới được khấu trừ thuế đầu vào. Mặt hàng cụ thể có được giảm không, anh/chị để lại số điện thoại để chuyên viên kiểm tra nhé.'},
    {k:['tncn','thu nhap ca nhan','giam tru','gia canh','nguoi phu thuoc'], a:
      'Thuế TNCN từ kỳ tính thuế 2026: giảm trừ bản thân 15,5 triệu đồng/tháng, mỗi người phụ thuộc 6,2 triệu đồng/tháng. ACCA kê khai, quyết toán TNCN cho nhân viên trong gói kế toán trọn gói.'},
    {k:['tndn','thu nhap doanh nghiep','loi nhuan'], a:
      'Thuế TNDN phổ thông 20%. Doanh nghiệp doanh thu năm không quá 3 tỷ đồng áp dụng 15%, từ trên 3 tỷ đến 50 tỷ đồng áp dụng 17% (Luật Thuế TNDN 2025). Tạm nộp theo quý, quyết toán chậm nhất ngày cuối tháng thứ 3 sau năm tài chính.'},
    {k:['mon bai'], a:'Lệ phí môn bài được bãi bỏ từ 01/01/2026, doanh nghiệp không còn phải khai và nộp lệ phí môn bài từ năm 2026.'},
    {k:['ho kinh doanh','thue khoan','ho ca the'], a:'ACCA hỗ trợ hộ kinh doanh chuyển sang kê khai, sổ sách và hóa đơn điện tử theo quy định mới. Anh/chị để lại số điện thoại, chuyên viên sẽ xem quy mô doanh thu và tư vấn cách làm phù hợp.', lead:true},
    {k:['ra soat','thanh tra','kiem tra thue','giai trinh','so sach sai','quyet toan'], a:'ACCA rà soát sổ sách, phát hiện sai sót trước khi cơ quan thuế kiểm tra, chuẩn bị hồ sơ và hỗ trợ giải trình khi có kiểm tra, thanh tra. Anh/chị để lại số điện thoại để chuyên viên xem hồ sơ cụ thể nhé.', lead:true},
    {k:['tu xa','online','tinh khac','gui chung tu','zalo','email'], a:'Làm việc từ xa được ạ: chứng từ gửi qua email/Zalo, ACCA kê khai, nộp tờ khai bằng chữ ký số và gửi báo cáo định kỳ, không cần gặp trực tiếp.'},
    {k:['dia chi','van phong','o dau','lien he','hotline','so dien thoai','address','contact'], a:'Văn phòng ACCA: 232 Nguyễn Lương Bằng, Phường Tân Mỹ, TP. Hồ Chí Minh. Hotline/Zalo: '+PHONE+'. Email: info@accavn.com.'},
    {k:['chuyen vien','nguoi that','goi lai','tu van vien','consultant','human','call me'], a:'Dạ, anh/chị để lại họ tên và số điện thoại bên dưới, chuyên viên ACCA sẽ gọi lại trong giờ làm việc. Cần gấp anh/chị gọi/Zalo '+PHONE+' ạ.', lead:true},
    {k:['hoa don dien tu','hoa don'], a:'Hóa đơn điện tử thực hiện theo Nghị định 70/2025/NĐ-CP. ACCA hướng dẫn đăng ký, lập, xử lý hóa đơn sai sót và đối chiếu hóa đơn đầu vào – đầu ra hằng tháng trong gói kế toán.'}
  ];
  function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d'); }
  function kbAnswer(q){
    var n = norm(q), best = null, bestScore = 0;
    KB.forEach(function(it){ var sc = 0; it.k.forEach(function(k){ if(n.indexOf(k) >= 0) sc += k.length; }); if(sc > bestScore){ bestScore = sc; best = it; } });
    if(best) return best;
    return {a: VI ? 'Câu này em cần chuyên viên kiểm tra kỹ để trả lời chính xác. Anh/chị để lại số điện thoại, ACCA sẽ gọi lại tư vấn miễn phí, hoặc nhắn Zalo '+PHONE+' ạ.'
                  : 'A consultant needs to review this to give you an accurate answer. Please leave your phone number or message Zalo +84 938 847 699.', lead:true};
  }

  /* ---------- Trạng thái ---------- */
  var S = { open:false, msgs:[], aiOff:false, busy:false, leadSent:false };
  var sid = '';
  try{ sid = sessionStorage.getItem('acca_chat_sid') || ''; if(!sid){ sid = Math.random().toString(36).slice(2,12); sessionStorage.setItem('acca_chat_sid', sid); }
       var saved = JSON.parse(sessionStorage.getItem('acca_chat_msgs') || '[]'); if(Array.isArray(saved)) S.msgs = saved.slice(-40);
       S.leadSent = sessionStorage.getItem('acca_chat_lead') === '1'; }catch(e){}
  function persist(){ try{ sessionStorage.setItem('acca_chat_msgs', JSON.stringify(S.msgs.slice(-40))); }catch(e){} }

  /* ---------- Giao diện ---------- */
  var css = [
  '.acw{--acw-pri:#0E4D3C;--acw-pri-fg:#fff;--acw-gold:#B4842A;--acw-bg:#fff;--acw-soft:#f1ece0;--acw-line:#e3ddd0;--acw-ink:#16201b;--acw-muted:#5d6a63;font:15px/1.5 "Be Vietnam Pro",system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--acw-ink)}',
  '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .acw{--acw-pri:#4bbf97;--acw-pri-fg:#0e1613;--acw-gold:#d9ad55;--acw-bg:#16221d;--acw-soft:#1c2a24;--acw-line:#2a3a33;--acw-ink:#e6ede9;--acw-muted:#9fb1a8}}',
  ':root[data-theme="dark"] .acw{--acw-pri:#4bbf97;--acw-pri-fg:#0e1613;--acw-gold:#d9ad55;--acw-bg:#16221d;--acw-soft:#1c2a24;--acw-line:#2a3a33;--acw-ink:#e6ede9;--acw-muted:#9fb1a8}',
  '.acw *{box-sizing:border-box}',
  '.acw .acw-panel,.acw .acw-body,.acw .acw-head,.acw .acw-foot{margin:0}',
  '.acw p{margin:0}.acw form{margin:0}',
  '.acw-launch{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:9998;display:flex;align-items:center;gap:9px;background:var(--acw-pri);color:var(--acw-pri-fg);border:0;border-radius:999px;padding:12px 18px 12px 14px;font:600 .95rem/1.2 inherit;font-family:inherit;cursor:pointer;box-shadow:0 10px 30px -8px rgba(10,40,30,.55)}',
  '.acw-launch:hover{filter:brightness(1.08)}.acw-launch:focus-visible,.acw button:focus-visible,.acw input:focus-visible,.acw textarea:focus-visible{outline:2px solid var(--acw-gold);outline-offset:2px}',
  '.acw-dot{width:30px;height:30px;border-radius:50%;background:var(--acw-gold);display:grid;place-items:center;flex:none}',
  '.acw-dot svg{width:17px;height:17px}',
  '.acw-panel{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:9999;width:min(390px,calc(100vw - 24px));height:min(600px,calc(100vh - 40px));background:var(--acw-bg);border:1px solid var(--acw-line);border-radius:18px;box-shadow:0 24px 60px -18px rgba(0,0,0,.45);display:flex;flex-direction:column;overflow:hidden}',
  '.acw-panel[hidden],.acw-launch[hidden],.acw-lead[hidden]{display:none!important}',
  '.acw-head{background:var(--acw-pri);color:var(--acw-pri-fg);padding:14px 14px 12px 16px;display:flex;gap:11px;align-items:center}',
  '.acw-head b{display:block;font-size:1rem}.acw-head small{display:block;font-size:.76rem;opacity:.85}',
  '.acw-x{margin-left:auto;background:transparent;border:0;color:inherit;font-size:1.5rem;line-height:1;cursor:pointer;padding:2px 6px;border-radius:8px}',
  '.acw-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:var(--acw-soft)}',
  '.acw-m{max-width:86%;padding:9px 12px;border-radius:14px;white-space:pre-line;overflow-wrap:anywhere;font-size:.92rem}',
  '.acw-m.bot{background:var(--acw-bg);border:1px solid var(--acw-line);border-top-left-radius:4px;align-self:flex-start}',
  '.acw-m.me{background:var(--acw-pri);color:var(--acw-pri-fg);border-top-right-radius:4px;align-self:flex-end}',
  '.acw-m.typing{color:var(--acw-muted);font-style:italic}',
  '.acw-acts{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start}',
  '.acw-chip{background:var(--acw-bg);border:1px solid var(--acw-line);color:var(--acw-ink);border-radius:999px;padding:6px 11px;font:500 .82rem/1.2 inherit;font-family:inherit;cursor:pointer;text-decoration:none}',
  '.acw-chip:hover{border-color:var(--acw-pri);color:var(--acw-pri)}',
  '.acw-chip.gold{background:var(--acw-gold);border-color:var(--acw-gold);color:#fff}',
  '.acw-lead{background:var(--acw-bg);border:1px solid var(--acw-line);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px;align-self:stretch}',
  '.acw-lead p{margin:0;font-size:.82rem;font-weight:600}',
  '.acw-lead input,.acw-lead textarea{width:100%;border:1px solid var(--acw-line);background:var(--acw-soft);color:var(--acw-ink);border-radius:10px;padding:8px 10px;font:inherit;font-size:.9rem}',
  '.acw-lead textarea{resize:vertical;min-height:52px}',
  '.acw-lead button{background:var(--acw-pri);color:var(--acw-pri-fg);border:0;border-radius:10px;padding:9px;font:600 .9rem inherit;font-family:inherit;cursor:pointer}',
  '.acw-err{color:#c0392b;font-size:.8rem;margin:0}',
  '.acw-foot{display:flex;gap:8px;padding:10px;border-top:1px solid var(--acw-line);background:var(--acw-bg)}',
  '.acw-foot textarea{flex:1;resize:none;border:1px solid var(--acw-line);background:var(--acw-soft);color:var(--acw-ink);border-radius:12px;padding:9px 11px;font:inherit;font-size:.92rem;height:42px;max-height:110px}',
  '.acw-foot button{background:var(--acw-pri);color:var(--acw-pri-fg);border:0;border-radius:12px;padding:0 15px;font:600 .9rem inherit;font-family:inherit;cursor:pointer}',
  '.acw-foot button:disabled{opacity:.5;cursor:default}',
  '.acw-note{font-size:.7rem;color:var(--acw-muted);text-align:center;padding:0 10px 8px;background:var(--acw-bg)}',
  '@media (max-width:620px){.acw-launch{right:12px;padding:10px 14px 10px 10px;font-size:.86rem}.acw-panel{left:0;right:0;bottom:0;width:auto;height:calc(100% - env(safe-area-inset-top,0px));border-radius:16px 16px 0 0}body.acw-has-mbar .acw-launch{bottom:calc(74px + env(safe-area-inset-bottom,0px))}}',
  '@media (max-width:620px){.hcta[data-short]{font-size:0!important}.hcta[data-short]::after{content:attr(data-short);font-size:.82rem}}',
  '@media (prefers-reduced-motion:no-preference){.acw-panel{animation:acwIn .18s ease-out}@keyframes acwIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}}'
  ].join('\n');
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.1-4.6A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/></svg>';

  var root, panel, body, input, sendBtn, launch;
  function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function build(){
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    root = el('div','acw'); root.setAttribute('lang', VI ? 'vi' : 'en');
    launch = el('button','acw-launch','<span class="acw-dot">'+ICON+'</span><span>'+esc(T.launch)+'</span>'); launch.type='button';
    launch.setAttribute('aria-label', T.launch); launch.onclick = open;
    panel = el('div','acw-panel'); panel.hidden = true; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label', T.title);
    panel.innerHTML = '<div class="acw-head"><span class="acw-dot">'+ICON+'</span><div><b>'+esc(T.title)+'</b><small>'+esc(T.sub)+'</small></div><button class="acw-x" type="button" aria-label="'+esc(T.close)+'">×</button></div>'+
      '<div class="acw-body" aria-live="polite"></div>'+
      '<div class="acw-foot"><textarea rows="1" placeholder="'+esc(T.ph)+'" aria-label="'+esc(T.ph)+'"></textarea><button type="button">'+esc(T.send)+'</button></div>'+
      '<div class="acw-note">ACCA Consulting Vietnam · '+(VI?'Thông tin mang tính tham khảo':'For reference only')+'</div>';
    root.appendChild(launch); root.appendChild(panel); document.body.appendChild(root);
    body = panel.querySelector('.acw-body'); input = panel.querySelector('textarea'); sendBtn = panel.querySelector('.acw-foot button');
    panel.querySelector('.acw-x').onclick = close;
    sendBtn.onclick = function(){ send(input.value); };
    input.addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(input.value); } });
    panel.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
    if(document.querySelector('.mbar')) document.body.classList.add('acw-has-mbar');
    // Nút góc trên của Blog: rút gọn chữ trên điện thoại
    var SHORT = {vi:'Tư vấn miễn phí',en:'Free advice',zh:'免费咨询',ko:'무료 상담',ja:'無料相談',fr:'Conseil gratuit',ru:'Консультация',de:'Gratis-Beratung'};
    [].forEach.call(document.querySelectorAll('.hcta'), function(a){ a.setAttribute('data-short', SHORT[lang] || SHORT.en); });
    // Nút "Tư vấn online miễn phí" có sẵn trên trang mở chat
    document.addEventListener('click', function(e){
      var t = e.target.closest && e.target.closest('[data-acca-chat], .nav-cta, .hcta');
      if(!t) return; e.preventDefault(); open();
    });
    render();
  }

  function render(){
    body.innerHTML = '';
    if(!S.msgs.length){ addBot(T.hello, {chips:true, silent:true}); return; }
    S.msgs.forEach(function(m){ var b = el('div','acw-m '+(m.role==='user'?'me':'bot')); b.textContent = m.content; body.appendChild(b); });
    if(!S.leadSent) body.appendChild(actions(false));
    scroll();
  }
  function scroll(){ body.scrollTop = body.scrollHeight; }
  function actions(withChips){
    var w = el('div','acw-acts');
    if(withChips) CHIPS.forEach(function(c){ var b=el('button','acw-chip'); b.type='button'; b.textContent=c; b.onclick=function(){ send(c); }; w.appendChild(b); });
    var z = el('a','acw-chip'); z.href=ZALO; z.target='_blank'; z.rel='noopener'; z.textContent='💬 '+T.zalo; w.appendChild(z);
    if(!S.leadSent){ var l=el('button','acw-chip gold'); l.type='button'; l.textContent='📞 '+T.leave; l.onclick=showLead; w.appendChild(l); }
    return w;
  }
  function addBot(text, o){
    o = o || {};
    var old = body.querySelector('.acw-acts'); if(old) old.remove();
    var b = el('div','acw-m bot'); b.textContent = text; body.appendChild(b);
    if(!o.silent){ S.msgs.push({role:'assistant', content:text}); persist(); }
    body.appendChild(actions(!!o.chips));
    if(o.lead && !S.leadSent && !body.querySelector('.acw-lead')) showLead();
    scroll();
  }
  function addMe(text){
    var old = body.querySelector('.acw-acts'); if(old) old.remove();
    var b = el('div','acw-m me'); b.textContent = text; body.appendChild(b);
    S.msgs.push({role:'user', content:text}); persist(); scroll();
  }
  function showLead(){
    if(body.querySelector('.acw-lead')) { body.querySelector('.acw-lead input').focus(); return; }
    var f = el('form','acw-lead');
    f.innerHTML = '<p>'+esc(T.leadT)+'</p><input name="name" autocomplete="name" placeholder="'+esc(T.name)+'" aria-label="'+esc(T.name)+'">'+
      '<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="'+esc(T.phone)+' *" aria-label="'+esc(T.phone)+'">'+
      '<textarea name="need" placeholder="'+esc(T.need)+'" aria-label="'+esc(T.need)+'"></textarea><p class="acw-err" hidden></p><button type="submit">'+esc(T.leadBtn)+'</button>';
    f.onsubmit = function(e){
      e.preventDefault(); var err = f.querySelector('.acw-err'); err.hidden = true;
      var phone = f.phone.value.trim(); if(phone.replace(/\D/g,'').length < 9){ err.textContent = T.badPhone; err.hidden = false; return; }
      var btn = f.querySelector('button'); btn.disabled = true;
      var transcript = S.msgs.slice(-12).map(function(m){ return (m.role==='user'?'Khách: ':'Trợ lý: ')+m.content; }).join('\n');
      post({action:'smart_load', sub:'chat_lead', name:f.name.value.trim(), phone:phone, need:f.need.value.trim(), page:location.pathname, transcript:transcript})
        .then(function(r){ if(r && r.ok){ S.leadSent = true; try{ sessionStorage.setItem('acca_chat_lead','1'); }catch(e){} f.remove(); addBot(T.leadOk); } else throw 0; })
        .catch(function(){ btn.disabled = false; err.textContent = T.leadErr; err.hidden = false; });
    };
    body.appendChild(f); scroll(); f.name.focus();
  }
  function post(payload){
    return fetch(BACKEND, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(payload)})
      .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); });
  }
  function send(text){
    text = String(text||'').trim(); if(!text || S.busy) return;
    input.value = ''; addMe(text);
    S.busy = true; sendBtn.disabled = true;
    var typing = el('div','acw-m bot typing'); typing.textContent = T.typing; body.appendChild(typing); scroll();
    var done = function(ans, lead){ typing.remove(); S.busy = false; sendBtn.disabled = false; addBot(ans, {lead:lead}); input.focus(); };
    var fallback = function(){ var k = kbAnswer(text); setTimeout(function(){ done(k.a, k.lead); }, 350); };
    if(S.aiOff){ fallback(); return; }
    var history = S.msgs.slice(-12).map(function(m){ return {role:m.role, content:m.content}; });
    post({action:'smart_load', sub:'chat', sid:sid, messages:history})
      .then(function(r){
        if(r && r.ok && r.reply){ done(r.reply, /số điện thoại|phone|zalo/i.test(r.reply) && !S.leadSent); return; }
        if(r && r.code === 'limit'){ done(T.limit, true); return; }
        // Máy chủ chưa bật AI (hoặc chưa cài AccaChat.gs): dùng kho kiến thức cho cả phiên, khỏi gọi lại
        if(!r || ['busy','ai_error'].indexOf(r.code) < 0) S.aiOff = true;
        fallback();
      })
      .catch(function(){ fallback(); });
  }
  function open(){ if(!panel) return; S.open = true; panel.hidden = false; launch.hidden = true; setTimeout(function(){ input.focus(); scroll(); }, 30); }
  function close(){ S.open = false; panel.hidden = true; launch.hidden = false; launch.focus(); }

  window.ACCAChat = { open: function(){ open(); }, close: function(){ close(); } };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
