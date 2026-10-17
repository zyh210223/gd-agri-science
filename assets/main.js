/* 智绘田园 · 粤农新篇 —— 交互与精细动画 */
(function () {
  'use strict';

  var css = function (name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========== 0. 预加载器 ========== */
  (function preloader() {
    var el = document.getElementById('preloader');
    if (!el) return;
    var hide = function () { el.classList.add('done'); };
    if (document.readyState === 'complete') {
      setTimeout(hide, 900);
    } else {
      window.addEventListener('load', function () { setTimeout(hide, 700); });
    }
    setTimeout(hide, 3200); // 兜底
  })();

  /* ========== 0.1 滚动进度条 + 返回顶部 ========== */
  (function scrollHelpers() {
    var bar = document.getElementById('scrollBar');
    var backTop = document.getElementById('backTop');
    var ticking = false;
    function update() {
      ticking = false;
      var st = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (st / max) * 100 : 0) + '%';
      if (backTop) backTop.classList.toggle('show', st > 600);
      // Hero 背景视差
      var heroBg = document.querySelector('.hero-bg');
      if (heroBg && st < window.innerHeight * 1.2 && !reducedMotion) {
        heroBg.style.transform = 'scale(1.08) translateY(' + st * 0.18 + 'px)';
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ========== 0.2 导航 scrollspy ========== */
  (function scrollspy() {
    var links = document.querySelectorAll('nav.topnav .links a');
    if (!links.length) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute('href') || '').replace('#', '');
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = map[e.target.id];
        if (!link) return;
        if (e.isIntersecting) {
          links.forEach(function (a) { a.style.color = ''; });
          link.style.color = css('--accent');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  })();

  /* ========== 0.3 按钮涟漪 ========== */
  (function ripples() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        if (reducedMotion) return;
        var rect = btn.getBoundingClientRect();
        var d = Math.max(rect.width, rect.height);
        var span = document.createElement('span');
        span.className = 'ripple';
        span.style.width = span.style.height = d + 'px';
        span.style.left = (ev.clientX - rect.left - d / 2) + 'px';
        span.style.top = (ev.clientY - rect.top - d / 2) + 'px';
        btn.appendChild(span);
        setTimeout(function () { span.remove(); }, 650);
      });
    });
  })();

  /* ========== 0.4 数字滚动计数 ========== */
  (function counters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (reducedMotion) { el.textContent = target + suffix; return; }
      var dur = 1600, start = null;
      function frame(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ========== 0.5 卡片倾斜视差 ========== */
  (function tilt() {
    if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('#prodCard, .stat-card, figure.chart-card').forEach(function (card) {
      card.addEventListener('pointermove', function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 5) + 'deg)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  })();

  /* ========== 1. Hero 落叶粒子（含深度缩放） ========== */
  (function heroLeaves() {
    var canvas = document.getElementById('leafCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var leaves = [];
    var COLORS = [css('--accent'), css('--accent2'), css('--accent3'), css('--dark-muted')];
    var W = 0, H = 0;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    function makeLeaf(seed) {
      var depth = 0.5 + Math.random() * 0.8; // 近大远小
      return {
        x: Math.random() * W,
        y: seed ? Math.random() * H : -24,
        size: (4 + Math.random() * 7) * depth,
        depth: depth,
        speed: (0.4 + Math.random() * 0.9) * depth,
        sway: 18 + Math.random() * 42,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: (0.3 + Math.random() * 0.5) * depth
      };
    }
    function init() {
      resize();
      leaves = [];
      var n = Math.max(20, Math.floor(W / 38));
      for (var i = 0; i < n; i++) leaves.push(makeLeaf(true));
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < leaves.length; i++) {
        var l = leaves[i];
        l.y += l.speed;
        l.phase += 0.016;
        l.rot += l.rotSpeed;
        if (l.y > H + 24) leaves[i] = makeLeaf(false);
        ctx.save();
        ctx.translate(l.x + Math.sin(l.phase) * l.sway * 0.2, l.y);
        ctx.rotate(l.rot);
        ctx.globalAlpha = l.alpha;
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size, l.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', init);
    init();
    if (!reducedMotion) tick(); else { init(); }
  })();

  /* ========== 1.5 深色区萤火虫 ========== */
  (function fireflies() {
    var canvas = document.getElementById('fireflyCanvas');
    var zone = canvas && canvas.closest('section');
    if (!canvas || !zone) return;
    var ctx = canvas.getContext('2d');
    var bugs = [], W = 0, H = 0;
    var cGold = css('--accent2');

    function resize() {
      W = canvas.width = zone.clientWidth;
      H = canvas.height = zone.clientHeight;
    }
    function makeBug(seed) {
      return {
        x: Math.random() * W,
        y: seed ? Math.random() * H : H + 10,
        r: 1.2 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        blinkSpeed: 0.01 + Math.random() * 0.02
      };
    }
    function init() {
      resize();
      bugs = [];
      var n = Math.max(16, Math.floor(W / 60));
      for (var i = 0; i < n; i++) bugs.push(makeBug(true));
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < bugs.length; i++) {
        var b = bugs[i];
        b.phase += b.blinkSpeed;
        b.x += b.vx + Math.sin(b.phase) * 0.3;
        b.y += b.vy;
        if (b.y < -12 || b.x < -12 || b.x > W + 12) bugs[i] = makeBug(false);
        var glow = (Math.sin(b.phase) + 1) / 2; // 0..1 呼吸
        ctx.globalAlpha = 0.25 + glow * 0.6;
        ctx.fillStyle = cGold;
        ctx.shadowColor = cGold;
        ctx.shadowBlur = 8 + glow * 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', init);
    init();
    if (!reducedMotion) tick();
  })();

  /* ========== 2. 互动地图（路径描绘 + 热点弹入） ========== */
  (function agriMap() {
    var DATA = {
      maoming: {
        tag: '中国荔乡', name: '茂名 · 荔枝', img: './assets/lychee_1920x1920.jpg',
        desc: '广东荔枝产量约占全国一半，茂名是核心产区之一，白糖罂、妃子笑、桂味等名品云集。如今，田头冷链、绿色防控与精深加工，让"一日色变"的荔枝跨越千里仍鲜甜如初。',
        tech: '田头预冷 + 全程冷链 + 生物保鲜技术'
      },
      xuwen: {
        tag: '菠萝的海', name: '徐闻 · 菠萝', img: './assets/pineapple_1920x1920.jpg',
        desc: '徐闻菠萝产量约占全国三分之一，连片果园如金色海洋，被称为"菠萝的海"。近年来通过品种改良与"12221"农产品市场体系建设，徐闻菠萝从"丰产难卖"走向"订单农业"。',
        tech: '品种改良 + 大数据产销对接 + 电商直播'
      },
      zengcheng: {
        tag: '米香荔甜', name: '增城 · 丝苗米', img: './assets/rice_1920x1920.jpg',
        desc: '增城丝苗米米粒细长、饭味清香，是"中国丝苗米之乡"；增城挂绿荔枝更是闻名中外。这里还建有罗锡文院士团队的水稻无人农场示范基地。',
        tech: '无人农场 + 北斗导航农机 + 优质稻良种'
      },
      chaozhou: {
        tag: '一树一香', name: '潮州 · 凤凰单丛', img: './assets/tea_1920x1920.jpg',
        desc: '凤凰山云雾滋养的单丛茶，香型丰富、"一树一香"。生态茶园管理、绿色防控与数字化溯源，让这片古老的茶山焕发新活力。',
        tech: '生态茶园 + 绿色防控 + 数字化溯源'
      },
      meizhou: {
        tag: '金柚之乡', name: '梅州 · 金柚', img: null,
        desc: '梅州是"中国金柚之乡"，沙田柚果肉清甜。科技特派员推广无病苗繁育、测土配方施肥与覆草保墒技术，帮助柚农稳产提质。',
        tech: '无病苗繁育 + 测土配方施肥 + 冷链物流'
      },
      yingde: {
        tag: '红茶名片', name: '英德 · 红茶', img: null,
        desc: '英德红茶（英红九号）汤色红亮、滋味浓醇，是广东红茶的金字招牌。良种繁育体系与标准化加工，让老茶区持续飘香。',
        tech: '良种繁育 + 标准化加工 + 品牌建设'
      },
      zhanjiang: {
        tag: '对虾之都', name: '湛江 · 对虾', img: null,
        desc: '湛江是对虾养殖与加工出口重镇。良种选育、水质在线监测与生态健康养殖模式，让对虾养得更健康、卖得更远。',
        tech: '良种选育 + 水质监测 + 生态健康养殖'
      },
      xinhui: {
        tag: '一两陈皮一两金', name: '新会 · 陈皮', img: null,
        desc: '新会柑晒制的新会陈皮是地理标志产品。道地性研究与标准化仓储陈化技术，守护着这片"越陈越香"的岭南味道。',
        tech: '道地性研究 + 标准化陈化仓储'
      },
      deqing: {
        tag: '贡品佳果', name: '德庆 · 贡柑', img: null,
        desc: '德庆贡柑清甜化渣，历史上曾作贡品。面对柑橘黄龙病威胁，当地推广无毒苗、统防统治与水肥一体化技术，守住产业根基。',
        tech: '黄龙病综合防控 + 水肥一体化'
      }
    };
    var card = document.getElementById('prodCard');
    var path = document.getElementById('gdPath');
    if (!card) return;
    var imgBox = document.getElementById('prodImgBox');
    var img = document.getElementById('prodImg');
    var tag = document.getElementById('prodTag');
    var name = document.getElementById('prodName');
    var desc = document.getElementById('prodDesc');
    var tech = document.getElementById('prodTech');
    var spots = document.querySelectorAll('.hotspot');

    function select(key) {
      var d = DATA[key];
      if (!d) return;
      spots.forEach(function (s) { s.classList.toggle('active', s.getAttribute('data-key') === key); });
      tag.textContent = d.tag;
      name.textContent = d.name;
      desc.textContent = d.desc;
      tech.innerHTML = '<b>科技加持：</b>' + d.tech;
      if (d.img) {
        imgBox.style.display = '';
        if (img.getAttribute('src') !== d.img) {
          img.classList.add('fading');
          var swap = new Image();
          swap.onload = function () {
            img.src = d.img;
            requestAnimationFrame(function () { img.classList.remove('fading'); });
          };
          swap.src = d.img;
        }
        img.alt = d.name + '配图';
      } else {
        imgBox.style.display = 'none';
      }
    }
    spots.forEach(function (s) {
      s.addEventListener('click', function () { select(s.getAttribute('data-key')); });
    });

    // 路径描绘 + 热点弹入（进入视口触发）
    var drawn = false;
    if (path && 'getTotalLength' in path) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      var mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !drawn) {
            drawn = true;
            path.classList.add('drawn');
            spots.forEach(function (s, i) {
              setTimeout(function () { s.classList.add('show'); }, reducedMotion ? 0 : 500 + i * 110);
            });
            select('maoming');
            mio.disconnect();
          }
        });
      }, { threshold: 0.25 });
      mio.observe(path.closest('.map-panel') || path);
    } else {
      spots.forEach(function (s) { s.classList.add('show'); });
      select('maoming');
    }
  })();

  /* ========== 3. 物联网仪表盘（数值闪烁反馈） ========== */
  (function iotDashboard() {
    var cards = document.querySelectorAll('.iot-card');
    if (!cards.length) return;
    var CONF = {
      airTemp: { base: 28.4, amp: 1.2, dec: 1 },
      airHum: { base: 72, amp: 3, dec: 0 },
      soilHum: { base: 38, amp: 2, dec: 0 },
      light: { base: 45.2, amp: 2.5, dec: 1 },
      co2: { base: 418, amp: 12, dec: 0 }
    };
    var series = {};
    var state = { irrigating: false, soilTarget: 38 };
    var lineColor = css('--accent2');
    var gridColor = css('--dark-muted');

    cards.forEach(function (card) {
      var key = card.getAttribute('data-metric');
      series[key] = [];
      for (var i = 0; i < 20; i++) {
        series[key].push(CONF[key].base + (Math.random() - 0.5) * CONF[key].amp);
      }
    });

    function drawSpark(card, data) {
      var canvas = card.querySelector('canvas');
      var ctx = canvas.getContext('2d');
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var min = Math.min.apply(null, data), max = Math.max.apply(null, data);
      if (max - min < 0.001) max = min + 1;
      ctx.strokeStyle = gridColor;
      ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.moveTo(0, h - 3); ctx.lineTo(w, h - 3); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      data.forEach(function (v, i) {
        var x = (i / (data.length - 1)) * (w - 4) + 2;
        var y = h - 5 - ((v - min) / (max - min)) * (h - 10);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // 末端亮点
      var last = data[data.length - 1];
      var lx = w - 2, ly = h - 5 - ((last - min) / (max - min)) * (h - 10);
      ctx.fillStyle = lineColor;
      ctx.beginPath(); ctx.arc(lx, ly, 2.2, 0, Math.PI * 2); ctx.fill();
    }

    function step() {
      cards.forEach(function (card) {
        var key = card.getAttribute('data-metric');
        var c = CONF[key];
        var last = series[key][series[key].length - 1];
        var next;
        if (key === 'soilHum') {
          var diff = state.soilTarget - last;
          next = last + diff * 0.35 + (Math.random() - 0.5) * 0.6;
        } else {
          next = last + (Math.random() - 0.5) * c.amp;
          next = c.base + (next - c.base) * 0.7;
        }
        series[key].push(next);
        if (series[key].length > 20) series[key].shift();
        var numEl = card.querySelector('.num');
        numEl.textContent = next.toFixed(c.dec);
        if (!reducedMotion) {
          numEl.classList.remove('flash');
          void numEl.offsetWidth; // 重启动画
          numEl.classList.add('flash');
        }
        drawSpark(card, series[key]);
      });
    }
    cards.forEach(function (card) { drawSpark(card, series[card.getAttribute('data-metric')]); });
    setInterval(step, 2000);

    var btn = document.getElementById('irrigateBtn');
    var hint = document.getElementById('irrigateHint');
    var soilCard = document.querySelector('.iot-card[data-metric="soilHum"]');
    btn.addEventListener('click', function () {
      state.irrigating = !state.irrigating;
      if (state.irrigating) {
        state.soilTarget = 58;
        btn.textContent = '停止灌溉';
        soilCard.classList.add('boost');
        hint.textContent = '滴灌进行中：水肥一体化系统正按作物需水模型精准补水，避免大水漫灌造成浪费。';
      } else {
        state.soilTarget = 38;
        btn.textContent = '开启智能灌溉';
        soilCard.classList.remove('boost');
        hint.textContent = '灌溉已停止。系统会持续监测墒情，在土壤过干时自动提醒。';
      }
    });
  })();

  /* ========== 4. 无人机植保 canvas（增强版） ========== */
  (function droneSim() {
    var canvas = document.getElementById('droneCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var running = false, raf = null;
    var progress = 0;
    var btn = document.getElementById('droneBtn');
    var progEl = document.getElementById('droneProg');

    var cSky = css('--dark'), cField = css('--dark2'), cRow = css('--accent'),
        cDrone = css('--dark-ink'), cSpray = css('--accent2');

    var rows = 6, margin = 40, rowGap = (H - margin * 2) / (rows - 1);
    var path = [];
    for (var r = 0; r < rows; r++) {
      var y = margin + r * rowGap;
      if (r % 2 === 0) {
        path.push({ x: margin, y: y }, { x: W - margin, y: y });
      } else {
        path.push({ x: W - margin, y: y }, { x: margin, y: y });
      }
    }
    var segIdx = 0, segT = 0, SEG_LEN = 0;
    var pos = { x: path[0].x, y: path[0].y };
    var droplets = [];
    var windStreaks = [];
    var rotorAngle = 0;
    var speed = 1.6;
    var doneRows = new Set();

    function segLength() {
      var a = path[segIdx], b = path[segIdx + 1];
      return Math.hypot(b.x - a.x, b.y - a.y);
    }
    SEG_LEN = segLength();

    function rowOfSeg(idx) { return Math.floor(idx / 2); }

    function drawField() {
      ctx.fillStyle = cSky;
      ctx.fillRect(0, 0, W, H);
      for (var r = 0; r < rows; r++) {
        var y = margin + r * rowGap;
        var done = doneRows.has(r);
        ctx.strokeStyle = done ? cSpray : cRow;
        ctx.globalAlpha = done ? 0.55 : 0.35;
        ctx.lineWidth = done ? 10 : 8;
        ctx.beginPath(); ctx.moveTo(margin - 10, y); ctx.lineTo(W - margin + 10, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    function drawDrone() {
      rotorAngle += 0.6;
      // 机身
      ctx.strokeStyle = cDrone;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pos.x - 14, pos.y - 8); ctx.lineTo(pos.x + 14, pos.y + 8);
      ctx.moveTo(pos.x - 14, pos.y + 8); ctx.lineTo(pos.x + 14, pos.y - 8);
      ctx.stroke();
      ctx.fillStyle = cDrone;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2); ctx.fill();
      // 旋翼（旋转模糊圈）
      [[-14, -8], [14, -8], [-14, 8], [14, 8]].forEach(function (p) {
        var cx = pos.x + p[0], cy = pos.y + p[1];
        ctx.strokeStyle = cSpray;
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5, rotorAngle, rotorAngle + Math.PI * 1.2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = cSpray;
        ctx.beginPath(); ctx.arc(cx, cy, 1.6, 0, Math.PI * 2); ctx.fill();
      });
    }
    function drawDroplets() {
      ctx.fillStyle = cSpray;
      droplets.forEach(function (d) {
        ctx.globalAlpha = d.alpha;
        ctx.shadowColor = cSpray;
        ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    function drawWind() {
      // 高速掠过的风线
      if (running && Math.random() < 0.08 && !reducedMotion) {
        windStreaks.push({ x: -60, y: Math.random() * H, len: 40 + Math.random() * 60, v: 6 + Math.random() * 5 });
      }
      ctx.strokeStyle = cField;
      ctx.lineWidth = 1;
      windStreaks = windStreaks.filter(function (s) {
        s.x += s.v;
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.len, s.y); ctx.stroke();
        return s.x < W + 80;
      });
      ctx.globalAlpha = 1;
    }
    function stepFrame() {
      if (segIdx >= path.length - 1) {
        running = false;
        btn.textContent = '重新开始';
        progress = 100;
        progEl.textContent = '100%';
        drawField();
        drawDrone();
        return;
      }
      var a = path[segIdx], b = path[segIdx + 1];
      segT += speed / SEG_LEN;
      if (segT >= 1) {
        segT = 0; segIdx++;
        doneRows.add(rowOfSeg(segIdx - 1));
        if (segIdx < path.length - 1) SEG_LEN = segLength();
      }
      pos.x = a.x + (b.x - a.x) * segT;
      pos.y = a.y + (b.y - a.y) * segT;
      for (var i = 0; i < 3; i++) {
        droplets.push({
          x: pos.x + (Math.random() - 0.5) * 22,
          y: pos.y + 8 + Math.random() * 6,
          vy: 0.6 + Math.random() * 0.8,
          r: 1 + Math.random() * 1.6,
          alpha: 0.75
        });
      }
      droplets = droplets.filter(function (d) {
        d.y += d.vy; d.alpha -= 0.02;
        return d.alpha > 0 && d.y < H - margin + rowGap / 2;
      });
      var totalSegs = path.length - 1;
      progress = Math.min(100, Math.round(((segIdx + segT) / totalSegs) * 100));
      progEl.textContent = progress + '%';

      drawField();
      drawWind();
      drawDroplets();
      drawDrone();
      if (running) raf = requestAnimationFrame(stepFrame);
    }
    btn.addEventListener('click', function () {
      if (running) {
        running = false;
        btn.textContent = '继续作业';
        if (raf) cancelAnimationFrame(raf);
      } else {
        if (segIdx >= path.length - 1 || progress >= 100) {
          segIdx = 0; segT = 0; SEG_LEN = segLength();
          pos = { x: path[0].x, y: path[0].y };
          droplets = []; windStreaks = []; progress = 0;
          doneRows.clear();
        }
        running = true;
        btn.textContent = '暂停作业';
        raf = requestAnimationFrame(stepFrame);
      }
    });
    drawField();
    drawDrone();
  })();

  /* ========== 5. 绿色防控标签切换 ========== */
  (function greenTabs() {
    var btns = document.querySelectorAll('#greenTabs .tab-btn');
    var panels = document.querySelectorAll('#greenPanels .tab-panel');
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = +btn.getAttribute('data-tab');
        btns.forEach(function (b, i) { b.classList.toggle('active', i === idx); });
        panels.forEach(function (p, i) { p.classList.toggle('active', i === idx); });
      });
    });
  })();

  /* ========== 6. 土壤剖面 ========== */
  (function soilProfile() {
    var LAYERS = [
      {
        name: '耕作层（0–20 厘米）',
        desc: '作物根系最密集、养分最活跃的"黄金层"。广东部分农田有机质含量有待提升，板结问题影响根系呼吸。',
        fix: '改良良方：增施有机肥、秸秆粉碎还田、冬种紫云英等绿肥，逐步提高土壤有机质。'
      },
      {
        name: '犁底层（20–30 厘米）',
        desc: '长期在同一深度翻耕，农机碾压形成紧实的"硬盘"，阻碍根系下扎和雨水下渗。',
        fix: '改良良方：每隔几年用深松机深松 30 厘米以上，打破犁底层，让根系"深呼吸"。'
      },
      {
        name: '心土层（30–60 厘米）',
        desc: '保水保肥的"地下水库"。广东红壤普遍偏酸（pH 多在 5.5 以下），铝离子活化会抑制作物生长。',
        fix: '改良良方：适量施用石灰或土壤调理剂调酸，配合测土配方施肥，缺什么补什么。'
      },
      {
        name: '底土层（60 厘米以下）',
        desc: '接近母质的层次，养分少但关系着排水与地下水环境。珠三角部分低洼农田需防范渍害。',
        fix: '改良良方：完善排灌沟渠，防止渍害与盐碱上返，保护农田生态环境。'
      }
    ];
    var layers = document.querySelectorAll('.soil-layer');
    if (!layers.length) return;
    var nameEl = document.getElementById('soilName');
    var descEl = document.getElementById('soilDesc');
    var fixEl = document.getElementById('soilFix');
    layers.forEach(function (g) {
      g.addEventListener('click', function () {
        var i = +g.getAttribute('data-layer');
        layers.forEach(function (x, j) { x.classList.toggle('active', j === i); });
        nameEl.textContent = LAYERS[i].name;
        descEl.textContent = LAYERS[i].desc;
        fixEl.textContent = LAYERS[i].fix;
      });
    });
  })();

  /* ========== 7. 特派员案例手风琴 ========== */
  (function caseAccordion() {
    var items = document.querySelectorAll('.case-item');
    items.forEach(function (item) {
      var head = item.querySelector('.case-head');
      head.addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        items.forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
  })();

  /* ========== 8. 质量安全步骤动画 ========== */
  (function qualitySteps() {
    var track = document.getElementById('stepTrack');
    if (!track) return;
    var steps = track.querySelectorAll('.q-step');
    var fill = document.getElementById('stepFill');
    var btn = document.getElementById('stepReplay');
    var timers = [];
    var played = false;

    function reset() {
      timers.forEach(clearTimeout);
      timers = [];
      steps.forEach(function (s) { s.classList.remove('lit'); });
      fill.style.width = '0';
    }
    function play() {
      reset();
      steps.forEach(function (s, i) {
        timers.push(setTimeout(function () {
          s.classList.add('lit');
          fill.style.width = (i / (steps.length - 1)) * 84 + '%';
        }, 500 + i * 900));
      });
    }
    btn.addEventListener('click', play);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !played) {
          played = true;
          play();
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(track);
  })();

  /* ========== 9. 科普闯关测验（选项入场动画） ========== */
  (function quiz() {
    var box = document.getElementById('quizBox');
    if (!box) return;
    var QUESTIONS = [
      {
        q: '广东荔枝产量大约占全国总产量的多少？',
        opts: ['约五分之一', '约三分之一', '约一半', '约三分之二'],
        ans: 2,
        ex: '广东是我国最大的荔枝产区，产量约占全国一半，茂名、广州增城与从化是核心产区。'
      },
      {
        q: '被称为"菠萝的海"的地方是哪里？',
        opts: ['湛江徐闻', '海南文昌', '广西南宁', '福建漳州'],
        ans: 0,
        ex: '湛江徐闻县菠萝产量约占全国三分之一，连片果园如金色海洋，故名"菠萝的海"。'
      },
      {
        q: '性诱剂防治害虫的原理是什么？',
        opts: ['释放毒素杀死所有昆虫', '模拟雌虫信息素诱捕雄虫，干扰交配', '用强光照射杀死害虫', '改变土壤酸碱度驱虫'],
        ans: 1,
        ex: '性诱剂模拟雌虫释放的性信息素，诱捕雄虫、降低交配率，从而减少下一代虫口，专一对付目标害虫。'
      },
      {
        q: '与人工喷洒相比，无人机植保的主要优势是？',
        opts: ['完全不需要使用农药', '效率高、喷洒均匀，还能减少人接触农药', '作业成本为零', '只能在夜间作业'],
        ans: 1,
        ex: '植保无人机效率可达人工数十倍，雾化喷洒更均匀、药液利用率更高，飞手远离药液更安全。'
      },
      {
        q: '农村科技特派员制度最早起源于哪里？',
        opts: ['广东', '福建南平', '浙江', '山东'],
        ans: 1,
        ex: '该制度 1999 年起源于福建南平，随后在全国推广；广东自 2002 年起推行。'
      },
      {
        q: '针对广东偏酸的红壤，常用的改良措施是？',
        opts: ['大量施用食盐', '适量施用石灰调酸并增施有机肥', '只多浇水', '把塑料埋入土中'],
        ans: 1,
        ex: '红壤调酸常用石灰或土壤调理剂，配合增施有机肥、测土配方施肥，逐步改善土壤环境。'
      },
      {
        q: '农产品包装上的追溯码主要作用是？',
        opts: ['装饰包装', '记录产地、检测与流通信息，便于全程追溯', '直接提高售价', '没有任何实际信息'],
        ans: 1,
        ex: '追溯码记录农产品从产地、检测到流通的关键信息，消费者扫码可查，出现问题也能快速定位环节。'
      },
      {
        q: '罗锡文院士团队在哪里建设了水稻无人农场示范基地？',
        opts: ['广州增城', '深圳南山', '珠海斗门', '佛山顺德'],
        ans: 0,
        ex: '2020 年起，罗锡文院士带领华南农业大学团队在广州增城建设水稻无人农场示范基地，依托北斗导航实现全程机械化作业。'
      }
    ];
    var qi = 0, score = 0, answered = false;
    var playEl = document.getElementById('quizPlay');
    var resultEl = document.getElementById('quizResult');
    var qEl = document.getElementById('quizQ');
    var optsEl = document.getElementById('quizOpts');
    var exEl = document.getElementById('quizExplain');
    var stepEl = document.getElementById('quizStep');
    var fillEl = document.getElementById('quizBarFill');
    var liveEl = document.getElementById('quizScoreLive');
    var hintEl = document.getElementById('quizHint');
    var nextBtn = document.getElementById('quizNext');

    function render() {
      var item = QUESTIONS[qi];
      answered = false;
      stepEl.textContent = (qi + 1) + ' / ' + QUESTIONS.length;
      fillEl.style.width = (qi / QUESTIONS.length) * 100 + '%';
      qEl.textContent = item.q;
      exEl.classList.remove('show');
      nextBtn.style.display = 'none';
      hintEl.textContent = '请选择答案';
      optsEl.innerHTML = '';
      item.opts.forEach(function (opt, i) {
        var b = document.createElement('button');
        b.className = 'quiz-opt';
        b.textContent = String.fromCharCode(65 + i) + '. ' + opt;
        b.style.animationDelay = (i * 0.07) + 's';
        b.addEventListener('click', function () { answer(i, b); });
        optsEl.appendChild(b);
      });
    }
    function answer(i, btn) {
      if (answered) return;
      answered = true;
      var item = QUESTIONS[qi];
      var buttons = optsEl.querySelectorAll('.quiz-opt');
      buttons.forEach(function (b, j) {
        b.disabled = true;
        if (j === item.ans) b.classList.add('correct');
        else if (j === i) b.classList.add('wrong');
      });
      if (i === item.ans) {
        score++;
        liveEl.textContent = '得分 ' + score;
        hintEl.textContent = '回答正确！';
      } else {
        hintEl.textContent = '答错了，看看解析';
      }
      exEl.textContent = '解析：' + item.ex;
      exEl.classList.add('show');
      nextBtn.style.display = '';
      nextBtn.textContent = qi === QUESTIONS.length - 1 ? '查看成绩' : '下一题';
    }
    function finish() {
      playEl.style.display = 'none';
      resultEl.classList.add('show');
      var fs = document.getElementById('finalScore');
      if (reducedMotion) {
        fs.textContent = score;
      } else {
        var dur = 1200, start = null;
        function frame(ts) {
          if (!start) start = ts;
          var p = Math.min(1, (ts - start) / dur);
          fs.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
      var grade, comment;
      if (score <= 2) {
        grade = '科普新芽';
        comment = '刚刚破土的小苗！回到前面的章节再逛一圈，下次一定能答对更多。';
      } else if (score <= 5) {
        grade = '田园观察员';
        comment = '已经对广东农业有了不错的了解，继续加油，离达人只差一步。';
      } else if (score <= 7) {
        grade = '粤农科普能手';
        comment = '相当厉害！荔枝、菠萝、无人农场都难不倒你，把这份知识分享给更多人吧。';
      } else {
        grade = '粤农科普达人';
        comment = '满分通关！你已经掌握了广东农业科技的核心知识点，欢迎把科普的种子播撒出去。';
      }
      document.getElementById('finalGrade').textContent = grade;
      document.getElementById('finalComment').textContent = comment;
    }
    nextBtn.addEventListener('click', function () {
      if (qi === QUESTIONS.length - 1) {
        fillEl.style.width = '100%';
        finish();
      } else {
        qi++;
        render();
      }
    });
    document.getElementById('quizRestart').addEventListener('click', function () {
      qi = 0; score = 0;
      liveEl.textContent = '得分 0';
      resultEl.classList.remove('show');
      playEl.style.display = '';
      render();
    });
    render();
  })();

  /* ========== 10. 滚动显现 ========== */
  (function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reducedMotion) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  })();

})();
