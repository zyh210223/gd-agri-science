/* 智绘田园 · 粤农新篇 —— 交互与动画 */
(function () {
  'use strict';

  var css = function (name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ========== 0. 预加载器 ========== */
  (function preloader() {
    var el = document.getElementById('preloader');
    if (!el) return;
    var hide = function () { el.classList.add('done'); };
    if (document.readyState === 'complete') {
      setTimeout(hide, 800);
    } else {
      window.addEventListener('load', function () { setTimeout(hide, 600); });
    }
    setTimeout(hide, 3200);
  })();

  /* ========== 0.1 滚动进度 / 返回顶部 / Hero 视差 ========== */
  (function scrollHelpers() {
    var bar = document.getElementById('scrollBar');
    var backTop = document.getElementById('backTop');
    var heroBg = document.getElementById('heroBg');
    var heroH = 0;
    function measureHero() {
      var h = document.querySelector('header.hero');
      heroH = h ? h.offsetHeight : 0;
    }
    measureHero();
    window.addEventListener('resize', measureHero);
    var ticking = false;
    function update() {
      ticking = false;
      var st = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (st / max) * 100 : 0) + '%';
      if (backTop) backTop.classList.toggle('show', st > 600);
      if (heroBg && !reducedMotion && st < heroH * 1.15) {
        heroBg.style.transform = 'scale(1.06) translateY(' + st * 0.16 + 'px)';
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
    // Hero 鼠标视差
    var hero = document.querySelector('header.hero');
    if (hero && heroBg && finePointer && !reducedMotion) {
      var inner = hero.querySelector('.hero-inner');
      hero.addEventListener('pointermove', function (e) {
        var x = e.clientX / window.innerWidth - 0.5;
        var y = e.clientY / window.innerHeight - 0.5;
        var st = window.scrollY || 0;
        var sy = st * 0.16;
        heroBg.style.transform = 'scale(1.1) translate(' + (-x * 22) + 'px,' + (sy - y * 14) + 'px)';
        if (inner) inner.style.transform = 'translate(' + (x * 10) + 'px,' + (y * 8) + 'px)';
      });
      hero.addEventListener('pointerleave', function () {
        if (inner) inner.style.transform = '';
      });
    }
  })();

  /* ========== 0.2 右侧章节圆点导航 ========== */
  (function dotNav() {
    var ids = ['top', 'map', 'smart', 'commissioner', 'green', 'quality', 'data', 'quiz'];
    var labels = { top: '开篇', map: '岭南农珍', smart: '智慧农业', commissioner: '科技特派员', green: '绿色防控', quality: '质量安全', data: '数据看振兴', quiz: '科普闯关' };
    var nav = document.createElement('nav');
    nav.className = 'dot-nav';
    nav.setAttribute('aria-label', '章节导航');
    var links = {};
    ids.forEach(function (id) {
      var a = document.createElement('a');
      a.href = '#' + id;
      a.innerHTML = '<span>' + labels[id] + '</span>';
      nav.appendChild(a);
      links[id] = a;
    });
    document.body.appendChild(nav);
    // 顶部导航高亮同步
    var topLinks = document.querySelectorAll('nav.topnav .links a');
    function setActive(id) {
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === id); });
      topLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + id); });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id === 'top' ? 'top' : e.target.id);
      });
    }, { rootMargin: '-42% 0px -52% 0px' });
    ids.forEach(function (id) {
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
      var dur = 1500, start = null;
      function frame(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
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

  /* ========== 0.5 卡片倾斜 ========== */
  (function tilt() {
    if (reducedMotion || !finePointer) return;
    document.querySelectorAll('#prodCard, .stat-card, figure.chart-card').forEach(function (card) {
      card.addEventListener('pointermove', function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 4) + 'deg)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  })();

  /* ========== 1. Hero 落叶粒子 ========== */
  (function heroLeaves() {
    var canvas = document.getElementById('leafCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var leaves = [];
    var COLORS = [css('--accent'), css('--accent2'), css('--accent3'), css('--dark-muted')];
    var W = 0, H = 0;
    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    function makeLeaf(seed) {
      var depth = 0.5 + Math.random() * 0.8;
      return {
        x: Math.random() * W, y: seed ? Math.random() * H : -24,
        size: (4 + Math.random() * 7) * depth, depth: depth,
        speed: (0.4 + Math.random() * 0.9) * depth,
        sway: 18 + Math.random() * 42, phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.03,
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
        l.y += l.speed; l.phase += 0.016; l.rot += l.rotSpeed;
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
    if (!reducedMotion) tick();
  })();

  /* ========== 1.5 深色区萤火虫 ========== */
  (function fireflies() {
    var canvas = document.getElementById('fireflyCanvas');
    var zone = canvas && canvas.closest('section');
    if (!canvas || !zone) return;
    var ctx = canvas.getContext('2d');
    var bugs = [], W = 0, H = 0;
    var cGold = css('--accent2');
    function resize() { W = canvas.width = zone.clientWidth; H = canvas.height = zone.clientHeight; }
    function makeBug(seed) {
      return {
        x: Math.random() * W, y: seed ? Math.random() * H : H + 10,
        r: 1.2 + Math.random() * 2.2, vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.35, phase: Math.random() * Math.PI * 2,
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
        var glow = (Math.sin(b.phase) + 1) / 2;
        ctx.globalAlpha = 0.25 + glow * 0.6;
        ctx.fillStyle = cGold;
        ctx.shadowColor = cGold;
        ctx.shadowBlur = 8 + glow * 10;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', init);
    init();
    if (!reducedMotion) tick();
  })();

  /* ========== 2. 互动地图 ========== */
  (function agriMap() {
    var DATA = {
      maoming: {
        tag: '中国荔乡', name: '茂名 · 荔枝', img: './assets/lychee_1920x1920.jpg',
        desc: '全国每两颗荔枝，差不多就有一颗产自广东，其中茂名占了大头，白糖罂、妃子笑、桂味都在这儿。采下几个小时内送进田头冷库预冷，再上冷链车，到北方人手里时果柄还绿着。',
        tech: '田头冷库预冷 · 全程冷链 · 生物保鲜'
      },
      xuwen: {
        tag: '菠萝的海', name: '徐闻 · 菠萝', img: './assets/pineapple_1920x1920.jpg',
        desc: '全国每三个菠萝，约有一个出自徐闻，连片的菠萝田被叫作"菠萝的海"。过去丰收了还愁卖，现在靠换品种、做电商、接订单，菠萝没熟就先有了买家。',
        tech: '品种更新 · 产销大数据 · 电商订单'
      },
      zengcheng: {
        tag: '丝苗米之乡', name: '增城 · 丝苗米', img: './assets/rice_1920x1920.jpg',
        desc: '丝苗米米粒细长，冷饭不回生；增城挂绿荔枝更是出名。罗锡文院士团队的水稻无人农场也落在这里：耕田、播种、收割，全靠北斗导航的农机自己干。',
        tech: '无人农场 · 北斗导航农机 · 优质稻种'
      },
      chaozhou: {
        tag: '一树一香', name: '潮州 · 凤凰单丛', img: './assets/tea_1920x1920.jpg',
        desc: '凤凰山上的单丛茶"一树一香"，蜜兰香、鸭屎香各有拥趸。茶园挂起虫情测报灯和粘虫板替代喷药，每盒茶还能扫码追到采自哪个山头。',
        tech: '生态茶园 · 虫害测报 · 一品一码'
      },
      meizhou: {
        tag: '金柚之乡', name: '梅州 · 金柚', img: null,
        desc: '梅州沙田柚清甜带蜜，一棵树能养活一家人。过去施肥靠经验，现在特派员带着测土仪下乡，缺什么补什么，裂果少了，糖度也稳了。',
        tech: '无病毒苗 · 测土配方 · 冷链出村'
      },
      yingde: {
        tag: '红茶名片', name: '英德 · 红茶', img: null,
        desc: '英红九号是英德红茶的当家品种，茶汤红亮、茶味浓。从一片鲜叶到一罐茶，温度、时间都有标准，老茶区靠标准化重新打开了市场。',
        tech: '良种繁育 · 标准化加工 · 品牌运营'
      },
      zhanjiang: {
        tag: '对虾之都', name: '湛江 · 对虾', img: null,
        desc: '很多人餐桌上的对虾来自湛江的虾塘。传感器盯着水温、溶氧和酸碱度，一缺氧增氧机自动开；再套养滤水鱼，少用药也能稳产。',
        tech: '良种虾苗 · 水质在线监测 · 生态混养'
      },
      xinhui: {
        tag: '一两陈皮一两金', name: '新会 · 陈皮', img: null,
        desc: '新会陈皮要晒要陈，年份越久越值钱，也越容易被仿冒。现在靠种质基因比对和仓储温湿度记录，道地陈皮有了自己的"身份证"。',
        tech: '种质研究 · 标准化仓储 · 年份溯源'
      },
      deqing: {
        tag: '昔日贡品', name: '德庆 · 贡柑', img: null,
        desc: '德庆贡柑清甜化渣，古时是贡品。柑橘最怕黄龙病，树染了病只能砍。当地靠无病毒苗、统防统治传毒木虱，给果园筑防线。',
        tech: '无病毒苗 · 统防统治 · 水肥一体'
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
      tech.innerHTML = '<b>技术看点：</b>' + d.tech;
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
      s.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(s.getAttribute('data-key')); }
      });
    });

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
              setTimeout(function () { s.classList.add('show'); }, reducedMotion ? 0 : 500 + i * 100);
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

  /* ========== 3. 物联网仪表盘（天气联动 + 灌溉） ========== */
  (function iotDashboard() {
    var cards = document.querySelectorAll('.iot-card');
    if (!cards.length) return;
    var MODES = {
      sunny:  { airTemp: 30.5, airHum: 62, soilBase: 34, light: 58, co2: 418, tAmp: 1.4, hAmp: 4, lAmp: 4 },
      cloudy: { airTemp: 27.2, airHum: 76, soilBase: 42, light: 22, co2: 425, tAmp: 1.0, hAmp: 3, lAmp: 3 },
      rain:   { airTemp: 25.4, airHum: 93, soilBase: 60, light: 8,  co2: 430, tAmp: 0.8, hAmp: 2, lAmp: 2 }
    };
    var DEC = { airTemp: 1, airHum: 0, soilHum: 0, light: 1, co2: 0 };
    var series = {};
    var state = { mode: 'sunny', irrigating: false };
    var lineColor = css('--accent2');
    var gridColor = css('--dark-muted');
    var panel = document.getElementById('iotPanel');
    var soilCard = document.querySelector('.iot-card[data-metric="soilHum"]');

    function baseOf(key) {
      var m = MODES[state.mode];
      if (key === 'airTemp') return m.airTemp;
      if (key === 'airHum') return m.airHum;
      if (key === 'light') return m.light;
      if (key === 'co2') return m.co2;
      if (key === 'soilHum') {
        if (state.irrigating) return 58;
        return m.soilBase;
      }
      return 40;
    }
    function ampOf(key) {
      var m = MODES[state.mode];
      if (key === 'airTemp') return m.tAmp;
      if (key === 'airHum') return m.hAmp;
      if (key === 'light') return m.lAmp;
      if (key === 'co2') return 10;
      if (key === 'soilHum') return key && state.irrigating ? 1.5 : 2.5;
      return 2;
    }

    cards.forEach(function (card) {
      var key = card.getAttribute('data-metric');
      series[key] = [];
      for (var i = 0; i < 20; i++) series[key].push(baseOf(key) + (Math.random() - 0.5) * ampOf(key));
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
      var last = data[data.length - 1];
      var ly = h - 5 - ((last - min) / (max - min)) * (h - 10);
      ctx.fillStyle = lineColor;
      ctx.beginPath(); ctx.arc(w - 2, ly, 2.2, 0, Math.PI * 2); ctx.fill();
    }

    function step() {
      cards.forEach(function (card) {
        var key = card.getAttribute('data-metric');
        var last = series[key][series[key].length - 1];
        var next;
        if (key === 'soilHum') {
          next = last + (baseOf(key) - last) * 0.3 + (Math.random() - 0.5) * 0.8;
        } else {
          next = last + (Math.random() - 0.5) * ampOf(key);
          next = baseOf(key) + (next - baseOf(key)) * 0.6;
        }
        series[key].push(next);
        if (series[key].length > 20) series[key].shift();
        var numEl = card.querySelector('.num');
        numEl.textContent = next.toFixed(DEC[key]);
        if (!reducedMotion) {
          numEl.classList.remove('flash');
          void numEl.offsetWidth;
          numEl.classList.add('flash');
        }
        drawSpark(card, series[key]);
      });
      // 土壤过干报警
      var soilNow = series.soilHum[series.soilHum.length - 1];
      soilCard.classList.toggle('alarm', soilNow < 28 && !state.irrigating && state.mode !== 'rain');
    }
    cards.forEach(function (card) { drawSpark(card, series[card.getAttribute('data-metric')]); });
    setInterval(step, 2000);

    // 天气切换
    document.querySelectorAll('.wx-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        state.mode = b.getAttribute('data-wx');
        document.querySelectorAll('.wx-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
        if (panel) panel.classList.toggle('rain', state.mode === 'rain');
      });
    });

    var btn = document.getElementById('irrigateBtn');
    var hint = document.getElementById('irrigateHint');
    btn.addEventListener('click', function () {
      state.irrigating = !state.irrigating;
      if (state.irrigating) {
        btn.textContent = '停止灌溉';
        soilCard.classList.add('boost');
        hint.textContent = '滴灌中：作物喝多少给多少，不搞大水漫灌。';
      } else {
        btn.textContent = '开启智能灌溉';
        soilCard.classList.remove('boost');
        hint.textContent = '已关阀。土壤湿度跌破阈值，系统会自己报警。';
      }
    });
  })();

  /* ========== 4. 无人机（调速 / 航线显隐 / 作业上色） ========== */
  (function droneSim() {
    var canvas = document.getElementById('droneCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var running = false, raf = null;
    var progress = 0;
    var btn = document.getElementById('droneBtn');
    var progEl = document.getElementById('droneProg');
    var speedInput = document.getElementById('droneSpeed');
    var routeBtn = document.getElementById('droneRoute');
    var showRoute = false;
    var speed = parseFloat(speedInput && speedInput.value) || 1.6;

    var cField = css('--dark2'), cRow = css('--accent'),
        cDrone = css('--dark-ink'), cSpray = css('--accent2'), cRoute = css('--dark-muted');

    var rows = 6, margin = 40, rowGap = (H - margin * 2) / (rows - 1);
    var path = [];
    for (var r = 0; r < rows; r++) {
      var y = margin + r * rowGap;
      if (r % 2 === 0) path.push({ x: margin, y: y }, { x: W - margin, y: y });
      else path.push({ x: W - margin, y: y }, { x: margin, y: y });
    }
    var segIdx = 0, segT = 0, SEG_LEN = 0;
    var pos = { x: path[0].x, y: path[0].y };
    var droplets = [], windStreaks = [];
    var rotorAngle = 0;
    var doneRows = {};

    function segLength() {
      var a = path[segIdx], b = path[segIdx + 1];
      return Math.hypot(b.x - a.x, b.y - a.y);
    }
    SEG_LEN = segLength();
    function rowOfSeg(i) { return Math.floor(i / 2); }

    function drawRoutePlan() {
      if (!showRoute) return;
      ctx.save();
      ctx.strokeStyle = cRoute;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 7]);
      ctx.beginPath();
      path.forEach(function (p, i) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = cRoute;
      path.forEach(function (p, i) {
        ctx.globalAlpha = i === 0 ? 0.9 : 0.4;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    }
    function drawField() {
      ctx.fillStyle = css('--dark');
      ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < rows; i++) {
        var yy = margin + i * rowGap;
        var done = doneRows[i];
        ctx.strokeStyle = done ? cSpray : cRow;
        ctx.globalAlpha = done ? 0.55 : 0.32;
        ctx.lineWidth = done ? 10 : 8;
        ctx.beginPath(); ctx.moveTo(margin - 10, yy); ctx.lineTo(W - margin + 10, yy); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      drawRoutePlan();
    }
    function drawDrone() {
      rotorAngle += 0.6;
      ctx.strokeStyle = cDrone;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pos.x - 14, pos.y - 8); ctx.lineTo(pos.x + 14, pos.y + 8);
      ctx.moveTo(pos.x - 14, pos.y + 8); ctx.lineTo(pos.x + 14, pos.y - 8);
      ctx.stroke();
      ctx.fillStyle = cDrone;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2); ctx.fill();
      [[-14, -8], [14, -8], [-14, 8], [14, 8]].forEach(function (p) {
        var cx = pos.x + p[0], cy = pos.y + p[1];
        ctx.strokeStyle = cSpray;
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(cx, cy, 4.5, rotorAngle, rotorAngle + Math.PI * 1.2); ctx.stroke();
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
      if (running && Math.random() < 0.08) {
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
        btn.textContent = '再飞一遍';
        progress = 100;
        progEl.textContent = '100%';
        drawField(); drawDrone();
        return;
      }
      var a = path[segIdx], b = path[segIdx + 1];
      segT += speed / SEG_LEN;
      if (segT >= 1) {
        segT = 0; segIdx++;
        doneRows[rowOfSeg(segIdx - 1)] = true;
        if (segIdx < path.length - 1) SEG_LEN = segLength();
      }
      pos.x = a.x + (b.x - a.x) * segT;
      pos.y = a.y + (b.y - a.y) * segT;
      for (var i = 0; i < 3; i++) {
        droplets.push({
          x: pos.x + (Math.random() - 0.5) * 22, y: pos.y + 8 + Math.random() * 6,
          vy: 0.6 + Math.random() * 0.8, r: 1 + Math.random() * 1.6, alpha: 0.75
        });
      }
      droplets = droplets.filter(function (d) {
        d.y += d.vy; d.alpha -= 0.02;
        return d.alpha > 0 && d.y < H - margin + rowGap / 2;
      });
      var totalSegs = path.length - 1;
      progress = Math.min(100, Math.round(((segIdx + segT) / totalSegs) * 100));
      progEl.textContent = progress + '%';
      drawField(); drawWind(); drawDroplets(); drawDrone();
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
          doneRows = {};
        }
        running = true;
        btn.textContent = '暂停作业';
        raf = requestAnimationFrame(stepFrame);
      }
    });
    if (speedInput) speedInput.addEventListener('input', function () { speed = parseFloat(speedInput.value) || 1.6; });
    if (routeBtn) routeBtn.addEventListener('click', function () {
      showRoute = !showRoute;
      routeBtn.textContent = showRoute ? '航线：开' : '航线：关';
      if (!running) { drawField(); drawDrone(); }
    });
    drawField(); drawDrone();
  })();

  /* ========== 4.5 新旧对比滑块 ========== */
  (function compareSlider() {
    var box = document.getElementById('compare');
    var handle = document.getElementById('cmpHandle');
    if (!box || !handle) return;
    var pos = 50;
    function setPos(p) {
      pos = Math.max(5, Math.min(95, p));
      box.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', Math.round(pos));
    }
    var dragging = false;
    function move(clientX) {
      var r = box.getBoundingClientRect();
      setPos(((clientX - r.left) / r.width) * 100);
    }
    handle.addEventListener('pointerdown', function (e) {
      dragging = true; handle.setPointerCapture(e.pointerId);
    });
    box.addEventListener('pointerdown', function (e) {
      if (e.target === handle || handle.contains(e.target)) return;
      dragging = true; move(e.clientX);
    });
    window.addEventListener('pointermove', function (e) { if (dragging) move(e.clientX); });
    window.addEventListener('pointerup', function () { dragging = false; });
    handle.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { setPos(pos - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPos(pos + 4); e.preventDefault(); }
      if (e.key === 'Home') { setPos(5); e.preventDefault(); }
      if (e.key === 'End') { setPos(95); e.preventDefault(); }
    });
    setPos(50);
  })();

  /* ========== 5. 绿色防控标签 ========== */
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
        desc: '活都在这一层：根在这儿扎，肥在这儿化。广东不少田有机质偏低，地越种越板，水都浇不进去。',
        fix: '药方：稻草粉碎还田、冬种紫云英绿肥、腐熟有机肥回田，把地养松。'
      },
      {
        name: '犁底层（20–30 厘米）',
        desc: '拖拉机年年在同一个深度碾，压出一层硬"夹层"，根扎不下去，雨水也渗不快。',
        fix: '药方：隔几年深松一次，深度三十厘米以上，把这层硬盖子捅开。'
      },
      {
        name: '心土层（30–60 厘米）',
        desc: '地下的"蓄水库"，但红壤这一层又酸又黏，pH 常常低于 5.5，活性铝会伤根。',
        fix: '药方：撒石灰或土壤调理剂中和酸度，再按测土结果配方施肥。'
      },
      {
        name: '底土层（60 厘米以下）',
        desc: '再往下接近成土母质，没多少养分，但管着排水。珠三角低洼田这层不透水，雨季就渍根。',
        fix: '药方：修通田间排灌沟，雨后排得快，地下水位压得住。'
      }
    ];
    var layers = document.querySelectorAll('.soil-layer');
    if (!layers.length) return;
    var nameEl = document.getElementById('soilName');
    var descEl = document.getElementById('soilDesc');
    var fixEl = document.getElementById('soilFix');
    descEl.textContent = LAYERS[0].desc;
    fixEl.textContent = LAYERS[0].fix;
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

  /* ========== 7. 案例手风琴 ========== */
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
        }, 400 + i * 850));
      });
    }
    btn.addEventListener('click', play);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !played) { played = true; play(); io.disconnect(); }
      });
    }, { threshold: 0.4 });
    io.observe(track);
  })();

  /* ========== 9. 科普闯关（连对 + 彩纸） ========== */
  (function quiz() {
    var box = document.getElementById('quizBox');
    if (!box) return;
    var QUESTIONS = [
      {
        q: '广东荔枝产量大约占全国的多少？',
        opts: ['五分之一', '三分之一', '一半', '三分之二'], ans: 2,
        ex: '广东荔枝约占全国一半，茂名是最大产区。'
      },
      {
        q: '"菠萝的海"说的是哪里？',
        opts: ['湛江徐闻', '海南文昌', '广西南宁', '福建漳州'], ans: 0,
        ex: '徐闻一县菠萝产量约占全国三分之一，连片菠萝田就是"菠萝的海"。'
      },
      {
        q: '性诱剂靠什么办法防虫？',
        opts: ['释放毒素杀死所有昆虫', '假冒雌虫气味诱捕雄虫', '强光烤死害虫', '改变土壤酸度'], ans: 1,
        ex: '性信息素诱杀雄虫，交配少了虫卵就少，而且只针对目标害虫。'
      },
      {
        q: '跟人工背桶打药比，无人机强在哪？',
        opts: ['完全不用药', '效率高几十倍，药雾还能吹进叶背', '一分钱不花', '只能夜里干'], ans: 1,
        ex: '无人机一天能洒三四百亩，下压气流把药雾送到叶子背面，飞手也不用钻药雾。'
      },
      {
        q: '科技特派员这套办法最早出现在哪？',
        opts: ['广东', '福建南平', '浙江', '山东'], ans: 1,
        ex: '1999 年发源于福建南平，广东 2002 年跟进。'
      },
      {
        q: '广东红壤偏酸，常用什么办法改？',
        opts: ['多撒食盐', '石灰调酸加有机肥', '只管浇水', '埋塑料布'], ans: 1,
        ex: '石灰调酸、有机肥养地，是红壤改良的常规组合。'
      },
      {
        q: '农产品上的追溯码能干什么？',
        opts: ['让包装好看', '倒查产地、检测和物流', '直接涨价', '没有实际信息'], ans: 1,
        ex: '扫码可查产地、检测、物流，出了问题能顺着码倒查到地块。'
      },
      {
        q: '罗锡文院士的水稻无人农场建在哪？',
        opts: ['广州增城', '深圳南山', '珠海斗门', '佛山顺德'], ans: 0,
        ex: '2020 年起，罗锡文团队在广州增城建设水稻无人农场。'
      }
    ];
    var qi = 0, score = 0, streak = 0, answered = false;
    var playEl = document.getElementById('quizPlay');
    var resultEl = document.getElementById('quizResult');
    var qEl = document.getElementById('quizQ');
    var optsEl = document.getElementById('quizOpts');
    var exEl = document.getElementById('quizExplain');
    var stepEl = document.getElementById('quizStep');
    var fillEl = document.getElementById('quizBarFill');
    var liveEl = document.getElementById('quizScoreLive');
    var hintEl = document.getElementById('quizHint');
    var streakEl = document.getElementById('quizStreak');
    var nextBtn = document.getElementById('quizNext');
    var CONFETTI = [css('--accent'), css('--accent2'), css('--accent3'), css('--chart4')];

    function confetti() {
      if (reducedMotion) return;
      for (var i = 0; i < 22; i++) {
        var p = document.createElement('span');
        p.className = 'confetti-piece';
        p.style.background = CONFETTI[i % CONFETTI.length];
        var ang = Math.random() * Math.PI * 2;
        var dist = 70 + Math.random() * 130;
        p.style.setProperty('--x', Math.cos(ang) * dist + 'px');
        p.style.setProperty('--y', Math.sin(ang) * dist - 40 + 'px');
        p.style.animationDelay = (Math.random() * 0.08) + 's';
        box.appendChild(p);
        (function (node) { setTimeout(function () { node.remove(); }, 1200); })(p);
      }
    }

    function render() {
      var item = QUESTIONS[qi];
      answered = false;
      stepEl.textContent = (qi + 1) + ' / ' + QUESTIONS.length;
      fillEl.style.width = (qi / QUESTIONS.length) * 100 + '%';
      qEl.textContent = item.q;
      exEl.classList.remove('show');
      nextBtn.style.display = 'none';
      hintEl.textContent = '选一个答案';
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
        score++; streak++;
        liveEl.textContent = '得分 ' + score;
        hintEl.textContent = '答对了';
        streakEl.textContent = streak >= 2 ? '连对 ×' + streak : '';
        confetti();
      } else {
        streak = 0;
        streakEl.textContent = '';
        hintEl.textContent = '这题错了';
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
      if (reducedMotion) { fs.textContent = score; }
      else {
        var dur = 1100, start = null;
        function frame(ts) {
          if (!start) start = ts;
          var p = Math.min(1, (ts - start) / dur);
          fs.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
      var grade, comment;
      if (score <= 2) { grade = '科普新芽'; comment = '刚破土的小苗。回前面转一圈再来，准能对更多。'; }
      else if (score <= 5) { grade = '田园观察员'; comment = '底子不错，离达人就差几道题。'; }
      else if (score <= 7) { grade = '粤农科普能手'; comment = '荔枝、菠萝、无人农场都没难住你，把这些讲给同学听吧。'; }
      else { grade = '粤农科普达人'; comment = '满分！这节课你可以上台讲了。'; }
      document.getElementById('finalGrade').textContent = grade;
      document.getElementById('finalComment').textContent = comment;
    }
    nextBtn.addEventListener('click', function () {
      if (qi === QUESTIONS.length - 1) { fillEl.style.width = '100%'; finish(); }
      else { qi++; render(); }
    });
    document.getElementById('quizRestart').addEventListener('click', function () {
      qi = 0; score = 0; streak = 0;
      liveEl.textContent = '得分 0';
      streakEl.textContent = '';
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
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  })();

})();
