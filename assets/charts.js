/* 数据看振兴 —— ECharts 图表（进入视口时启动动画） */
(function () {
  'use strict';

  var rs = getComputedStyle(document.documentElement);
  var css = function (n) { return rs.getPropertyValue(n).trim(); };
  var C = {
    accent: css('--accent'),
    accent2: css('--accent2'),
    accent3: css('--accent3'),
    ink: css('--ink'),
    muted: css('--muted'),
    rule: css('--rule'),
    bg2: css('--bg2'),
    chart4: css('--chart4'),
    chart5: css('--chart5'),
    chart6: css('--chart6')
  };
  var PALETTE = [C.accent, C.accent2, C.accent3, C.chart4, C.chart5, C.chart6];
  var FONT = "'Outfit', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif";
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function baseText() {
    return { color: C.muted, fontFamily: FONT, fontSize: 12 };
  }

  /* 统一的提示框皮肤 */
  function tip(extra) {
    var o = {
      appendToBody: true,
      backgroundColor: 'rgba(255,255,255,0.94)',
      borderColor: C.rule,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: C.ink, fontFamily: FONT, fontSize: 12 },
      extraCssText: 'border-radius:10px;box-shadow:0 10px 28px rgba(48,54,45,.16);backdrop-filter:blur(4px);'
    };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }

  /* 纵向渐变（柱体） */
  function vGradient(top, bottom) {
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: top },
      { offset: 1, color: bottom }
    ]);
  }
  /* 面积渐变（折线下方） */
  function areaGradient(color, alphaTop) {
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: hexA(color, alphaTop) },
      { offset: 1, color: hexA(color, 0.02) }
    ]);
  }
  /* 把 #rrggbb 与透明度合成 rgba（变量都是 6 位 hex） */
  function hexA(hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.substring(0, 2), 16),
        g = parseInt(h.substring(2, 4), 16),
        b = parseInt(h.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  var charts = [];
  function mount(id, option) {
    var el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    option.textStyle = { fontFamily: FONT };
    option.animation = !reducedMotion;
    option.animationDuration = 1300;
    option.animationEasing = 'cubicOut';
    chart.setOption(option);
    charts.push(chart);
  }

  function buildGrain() {
    var years = ['2021', '2022', '2023', '2024', '2025'];
    var data = [1260, 1265, 1273, 1285, 1290];
    return {
      tooltip: tip({
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: hexA(C.accent, 0.08) } },
        formatter: function (ps) {
          var p = ps[0];
          return p.name + ' 年<br/><b style="color:' + C.accent + '">粮食总产量 ' + p.value + ' 万吨</b>';
        }
      }),
      grid: { left: 56, right: 20, top: 36, bottom: 34 },
      xAxis: {
        type: 'category',
        data: years,
        axisTick: { show: false },
        axisLabel: baseText(),
        axisLine: { lineStyle: { color: C.rule } }
      },
      yAxis: {
        type: 'value',
        min: 1100,
        name: '万吨',
        nameTextStyle: baseText(),
        axisLabel: baseText(),
        splitLine: { lineStyle: { color: C.rule, type: 'dashed' } }
      },
      series: [{
        type: 'bar',
        data: data,
        barWidth: '48%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: vGradient(hexA(C.accent, 0.95), hexA(C.accent, 0.45))
        },
        emphasis: {
          itemStyle: {
            color: vGradient(C.accent2, hexA(C.accent2, 0.55)),
            shadowBlur: 16,
            shadowColor: hexA(C.accent2, 0.35)
          },
          label: { color: C.accent2 }
        },
        label: {
          show: true, position: 'top', color: C.ink,
          fontFamily: FONT, fontSize: 12, fontWeight: 600
        },
        animationDelay: function (idx) { return idx * 110; },
        animationDuration: 900
      }]
    };
  }

  function buildFruit() {
    var data = [
      { value: 560, name: '柑橘橙柚' },
      { value: 490, name: '香蕉' },
      { value: 430, name: '荔枝' },
      { value: 200, name: '菠萝' },
      { value: 180, name: '龙眼' },
      { value: 300, name: '其他水果' }
    ];
    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    return {
      title: {
        text: '约 ' + total,
        subtext: '万吨 · 岭南鲜果年产',
        left: 'center',
        top: '35%',
        textStyle: { color: C.accent, fontFamily: FONT, fontSize: 22, fontWeight: 700 },
        subtextStyle: { color: C.muted, fontFamily: FONT, fontSize: 11 },
        itemGap: 4
      },
      tooltip: tip({
        trigger: 'item',
        formatter: function (p) {
          return p.name + '<br/>约 <b>' + p.value + ' 万吨</b> · 占 ' + p.percent + '%';
        }
      }),
      legend: { bottom: 0, textStyle: baseText(), itemWidth: 12, itemHeight: 9, itemGap: 14 },
      series: [{
        type: 'pie',
        roseType: 'radius',
        radius: ['26%', '66%'],
        center: ['50%', '45%'],
        data: data,
        itemStyle: {
          borderColor: C.bg2,
          borderWidth: 2,
          borderRadius: 5
        },
        label: { color: C.ink, fontFamily: FONT, fontSize: 12, formatter: '{b}' },
        labelLine: { lineStyle: { color: C.muted }, length: 8, length2: 10 },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: { shadowBlur: 18, shadowColor: 'rgba(48,54,45,.28)' },
          label: { fontWeight: 700, color: C.accent }
        },
        color: PALETTE,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) { return idx * 90; }
      }]
    };
  }

  function buildTech() {
    var years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
    return {
      tooltip: tip({
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: { color: C.accent2, type: 'dashed', opacity: 0.6 }
        },
        formatter: function (ps) {
          var s = ps[0].name + ' 年';
          ps.forEach(function (p) {
            s += '<br/><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' +
              p.color + ';margin-right:6px"></span>' + p.seriesName + '：<b>' + p.value + '%</b>';
          });
          return s;
        }
      }),
      legend: {
        top: 0, right: 6,
        textStyle: baseText(), itemWidth: 16, itemHeight: 9, itemGap: 18
      },
      grid: { left: 48, right: 92, top: 42, bottom: 34 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: years,
        axisTick: { show: false },
        axisLabel: baseText(),
        axisLine: { lineStyle: { color: C.rule } }
      },
      yAxis: {
        type: 'value',
        min: 55,
        max: 78,
        name: '%',
        nameTextStyle: baseText(),
        axisLabel: baseText(),
        splitLine: { lineStyle: { color: C.rule, type: 'dashed' } }
      },
      series: [
        {
          name: '广东',
          type: 'line',
          smooth: 0.35,
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          data: [68.5, 69.2, 70.1, 70.8, 71.5, 72.0, 72.6],
          lineStyle: { width: 3.5, color: C.accent },
          itemStyle: { color: C.accent, borderColor: '#fff', borderWidth: 1.5 },
          areaStyle: { color: areaGradient(C.accent, 0.28) },
          emphasis: {
            focus: 'series',
            itemStyle: { borderWidth: 2, shadowBlur: 10, shadowColor: hexA(C.accent, 0.5) }
          },
          endLabel: {
            show: true, formatter: '广东 72.6%', color: C.accent,
            fontFamily: FONT, fontSize: 11, fontWeight: 700,
            valueAnimation: true
          },
          animationDuration: 1600
        },
        {
          name: '全国平均',
          type: 'line',
          smooth: 0.35,
          symbol: 'triangle',
          symbolSize: 8,
          showSymbol: false,
          data: [59.2, 60.7, 61.5, 62.4, 63.2, 63.8, 64.5],
          lineStyle: { width: 2.5, color: C.accent2, type: 'dashed' },
          itemStyle: { color: C.accent2, borderColor: '#fff', borderWidth: 1.5 },
          areaStyle: { color: areaGradient(C.accent2, 0.12) },
          emphasis: { focus: 'series' },
          endLabel: {
            show: true, formatter: '全国 64.5%', color: C.accent2,
            fontFamily: FONT, fontSize: 11, fontWeight: 700,
            valueAnimation: true
          },
          animationDuration: 1600
        }
      ]
    };
  }

  // 进入"数据看振兴"区域后再初始化，让入场动画被看见
  function boot() {
    mount('chartGrain', buildGrain());
    mount('chartFruit', buildFruit());
    mount('chartTech', buildTech());
  }

  var dataSec = document.getElementById('data');
  if (dataSec && 'IntersectionObserver' in window && !reducedMotion) {
    var booted = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !booted) {
          booted = true;
          boot();
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(dataSec);
  } else {
    boot();
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      charts.forEach(function (c) { c.resize(); });
    }, 150);
  });
})();
