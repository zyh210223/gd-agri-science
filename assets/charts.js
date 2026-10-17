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
    return {
      tooltip: { trigger: 'axis', appendToBody: true },
      grid: { left: 56, right: 20, top: 30, bottom: 34 },
      xAxis: {
        type: 'category',
        data: ['2021', '2022', '2023', '2024', '2025'],
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
        data: [1260, 1265, 1273, 1285, 1290],
        barWidth: '46%',
        itemStyle: { color: C.accent, borderRadius: [6, 6, 0, 0] },
        label: { show: true, position: 'top', color: C.ink, fontFamily: FONT, fontSize: 12 }
      }]
    };
  }

  function buildFruit() {
    return {
      tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}：约 {c} 万吨' },
      legend: { bottom: 0, textStyle: baseText(), itemWidth: 14, itemHeight: 9 },
      series: [{
        type: 'pie',
        roseType: 'radius',
        radius: ['18%', '68%'],
        center: ['50%', '44%'],
        data: [
          { value: 560, name: '柑橘橙柚' },
          { value: 490, name: '香蕉' },
          { value: 430, name: '荔枝' },
          { value: 200, name: '菠萝' },
          { value: 180, name: '龙眼' },
          { value: 300, name: '其他水果' }
        ],
        itemStyle: { borderColor: C.bg2, borderWidth: 2 },
        label: { color: C.ink, fontFamily: FONT, fontSize: 12, formatter: '{b}' },
        labelLine: { lineStyle: { color: C.muted } },
        color: PALETTE,
        animationType: 'scale',
        animationEasing: 'elasticOut'
      }]
    };
  }

  function buildTech() {
    return {
      tooltip: { trigger: 'axis', appendToBody: true, valueFormatter: function (v) { return v + '%'; } },
      legend: { top: 0, right: 10, textStyle: baseText() },
      grid: { left: 50, right: 24, top: 40, bottom: 34 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
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
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          data: [68.5, 69.2, 70.1, 70.8, 71.5, 72.0, 72.6],
          lineStyle: { width: 3, color: C.accent },
          itemStyle: { color: C.accent },
          areaStyle: { color: C.accent, opacity: 0.08 }
        },
        {
          name: '全国平均',
          type: 'line',
          smooth: true,
          symbol: 'triangle',
          symbolSize: 7,
          data: [59.2, 60.7, 61.5, 62.4, 63.2, 63.8, 64.5],
          lineStyle: { width: 3, color: C.accent2, type: 'dashed' },
          itemStyle: { color: C.accent2 }
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

  window.addEventListener('resize', function () {
    charts.forEach(function (c) { c.resize(); });
  });
})();
