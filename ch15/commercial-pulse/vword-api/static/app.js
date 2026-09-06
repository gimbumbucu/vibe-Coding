/**
 * COMMERCIAL STRATEGY AI - MARKET ENTRY & SITE ASSESSMENT ENGINE
 * High-performance data visualization & decision intelligence for 2.77M nationwide stores
 */

// Global State
const state = {
  theme: localStorage.getItem('theme') || 'dark',
  activeTab: 'dashboard',
  targetIndustry: 'cafe',
  metadata: null,
  filters: {
    sido: '전체',
    sigungu: '전체',
    categoryLarge: '전체',
    categoryMid: '전체',
    keyword: ''
  },
  mapMode: 'cluster', // 'cluster' | 'heatmap' | 'radius'
  assessmentRadius: 500, // 300 | 500 | 1000 meters
  activeFranchiseGroup: 'cafe',
  currentPage: 1,
  pageSize: 20,
  totalPages: 1,
  
  // Leaflet references
  map: null,
  tileLayer: null,
  markerCluster: null,
  heatLayer: null,
  radiusCircle: null,
  candidateMarker: null,
  mapStoresData: [],
  
  // Geocode map
  geocodeMap: null,
  geocodeMarker: null,

  // Chart instances
  charts: {
    dongOpportunity: null,
    doughnutCategory: null,
    franchiseBar: null
  }
};

// DOM Cache
const DOM = {
  html: document.documentElement,
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon'),
  refreshDataBtn: document.getElementById('refreshDataBtn'),
  liveStoreCountLabel: document.getElementById('liveStoreCountLabel'),

  // Navigation
  tabStrategy: document.getElementById('tabStrategy'),
  tabGeocode: document.getElementById('tabGeocode'),
  viewDashboard: document.getElementById('viewDashboard'),
  viewGeocode: document.getElementById('viewGeocode'),

  // Industry & Strategy Filters
  industryPillsList: document.getElementById('industryPillsList'),
  filterSido: document.getElementById('filterSido'),
  filterSigungu: document.getElementById('filterSigungu'),
  filterKeyword: document.getElementById('filterKeyword'),
  clearKeywordBtn: document.getElementById('clearKeywordBtn'),
  applyFilterBtn: document.getElementById('applyFilterBtn'),
  resetFilterBtn: document.getElementById('resetFilterBtn'),

  // Strategy KPI Cards
  kpiCardSaturation: document.getElementById('kpiCardSaturation'),
  kpiSaturationLevel: document.getElementById('kpiSaturationLevel'),
  kpiSaturationSubtext: document.getElementById('kpiSaturationSubtext'),
  kpiTopPromisingDong: document.getElementById('kpiTopPromisingDong'),
  kpiTopPromisingScore: document.getElementById('kpiTopPromisingScore'),
  kpiTargetStoresCount: document.getElementById('kpiTargetStoresCount'),
  kpiTargetStoresRatio: document.getElementById('kpiTargetStoresRatio'),
  kpiMagnetCount: document.getElementById('kpiMagnetCount'),
  kpiMagnetSubtext: document.getElementById('kpiMagnetSubtext'),

  // Map Controls
  mapElement: document.getElementById('dashboardMap'),
  mapLoadingOverlay: document.getElementById('mapLoadingOverlay'),
  mapVisibleCountBadge: document.getElementById('mapVisibleCountBadge'),
  mapModeClusterBtn: document.getElementById('mapModeClusterBtn'),
  mapModeHeatmapBtn: document.getElementById('mapModeHeatmapBtn'),
  mapModeRadiusBtn: document.getElementById('mapModeRadiusBtn'),
  radiusSelectorGroup: document.getElementById('radiusSelectorGroup'),
  radiusChips: document.querySelectorAll('.radius-chip'),
  radiusModeHint: document.getElementById('radiusModeHint'),
  syncBboxBtn: document.getElementById('syncBboxBtn'),
  resetMapCenterBtn: document.getElementById('resetMapCenterBtn'),

  // Site Assessment Floating Card
  siteAssessmentCard: document.getElementById('siteAssessmentCard'),
  closeAssessCardBtn: document.getElementById('closeAssessCardBtn'),
  assessGradeBadge: document.getElementById('assessGradeBadge'),
  assessAddressTitle: document.getElementById('assessAddressTitle'),
  assessScoreValue: document.getElementById('assessScoreValue'),
  assessActionTip: document.getElementById('assessActionTip'),
  assessTotalStores: document.getElementById('assessTotalStores'),
  assessCompetitorCount: document.getElementById('assessCompetitorCount'),
  assessNearestDist: document.getElementById('assessNearestDist'),
  assessOfficeCount: document.getElementById('assessOfficeCount'),
  assessEduCount: document.getElementById('assessEduCount'),
  assessHealthCount: document.getElementById('assessHealthCount'),
  assessCompetitorList: document.getElementById('assessCompetitorList'),

  // Strategy Charts & Promising Districts
  chartTabBtns: document.querySelectorAll('.chart-tab-btn'),
  chartTabOpportunity: document.getElementById('chartTabOpportunity'),
  chartTabCompetition: document.getElementById('chartTabCompetition'),
  chartTabDifferentiation: document.getElementById('chartTabDifferentiation'),
  promisingCardsContainer: document.getElementById('promisingCardsContainer'),
  franchisePills: document.querySelectorAll('.franchise-pill'),
  franchiseChartTitle: document.getElementById('franchiseChartTitle'),
  differentiationContent: document.getElementById('differentiationContent'),

  // Table
  tableTotalCount: document.getElementById('tableTotalCount'),
  storeTableBody: document.getElementById('storeTableBody'),
  pageIndicator: document.getElementById('pageIndicator'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),

  // Geocode Form
  geocodeSearchForm: document.getElementById('geocodeSearchForm'),
  geocodeAddressInput: document.getElementById('geocodeAddressInput'),
  geocodeResultCard: document.getElementById('geocodeResultCard'),
  geocodeDisplayAddress: document.getElementById('geocodeDisplayAddress'),
  geocodeLatValue: document.getElementById('geocodeLatValue'),
  geocodeLonValue: document.getElementById('geocodeLonValue'),
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initTabs();
  initMap();
  initCharts();
  initEventListeners();

  await loadMetadata();
  await refreshStrategyDashboard();
});

// Theme Management
function initTheme() {
  DOM.html.setAttribute('data-theme', state.theme);
  DOM.themeIcon.className = state.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

  DOM.themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    DOM.html.setAttribute('data-theme', state.theme);
    DOM.themeIcon.className = state.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('theme', state.theme);
    updateChartTheme();
    updateMapTile();
  });
}

// Tab Switching
function initTabs() {
  const switchTab = (tabName) => {
    state.activeTab = tabName;
    if (tabName === 'dashboard') {
      DOM.tabStrategy.classList.add('active');
      DOM.tabGeocode.classList.remove('active');
      DOM.viewDashboard.classList.add('active');
      DOM.viewGeocode.classList.remove('active');
      setTimeout(() => state.map && state.map.invalidateSize(), 200);
    } else {
      DOM.tabGeocode.classList.add('active');
      DOM.tabStrategy.classList.remove('active');
      DOM.viewGeocode.classList.add('active');
      DOM.viewDashboard.classList.remove('active');
      initGeocodeMap();
      setTimeout(() => state.geocodeMap && state.geocodeMap.invalidateSize(), 200);
    }
  };

  DOM.tabStrategy.addEventListener('click', () => switchTab('dashboard'));
  DOM.tabGeocode.addEventListener('click', () => switchTab('geocoding'));
}

// ==========================================================================
// LEAFLET MAP & INTERACTIVE RADIUS ASSESSMENT
// ==========================================================================

function initMap() {
  state.map = L.map('dashboardMap', {
    center: [36.35, 127.38],
    zoom: 7,
    zoomControl: false,
    preferCanvas: true
  });

  L.control.zoom({ position: 'bottomright' }).addTo(state.map);

  updateMapTile();

  // MarkerCluster Group
  state.markerCluster = L.markerClusterGroup({
    chunkedLoading: true,
    chunkInterval: 100,
    chunkDelay: 20,
    maxClusterRadius: 45,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      let sizeClass = 'small';
      if (count > 500) sizeClass = 'large';
      else if (count > 100) sizeClass = 'medium';

      return L.divIcon({
        html: `<div><span>${count.toLocaleString()}</span></div>`,
        className: `marker-cluster marker-cluster-${sizeClass}`,
        iconSize: L.point(40, 40)
      });
    }
  });

  state.map.addLayer(state.markerCluster);

  // Map Click Handler for Candidate Radius Assessment
  state.map.on('click', async (e) => {
    if (state.mapMode !== 'radius') return;
    const { lat, lng } = e.latlng;
    await executeRadiusAssessment(lat, lng);
  });
}

function updateMapTile() {
  const isDark = state.theme === 'dark';
  if (state.tileLayer && state.map.hasLayer(state.tileLayer)) {
    state.map.removeLayer(state.tileLayer);
  }

  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDark
    ? '&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  state.tileLayer = L.tileLayer(tileUrl, {
    maxZoom: 18,
    attribution: attribution
  }).addTo(state.map);
}

function showMapLoading(show) {
  if (show) DOM.mapLoadingOverlay.classList.add('show');
  else DOM.mapLoadingOverlay.classList.remove('show');
}

// Radius Site Assessment Logic
async function executeRadiusAssessment(lat, lon) {
  showMapLoading(true);

  // 1. Draw animated circle buffer
  if (state.radiusCircle && state.map.hasLayer(state.radiusCircle)) {
    state.map.removeLayer(state.radiusCircle);
  }
  if (state.candidateMarker && state.map.hasLayer(state.candidateMarker)) {
    state.map.removeLayer(state.candidateMarker);
  }

  state.radiusCircle = L.circle([lat, lon], {
    radius: state.assessmentRadius,
    color: '#f59e0b',
    weight: 2,
    fillColor: '#f59e0b',
    fillOpacity: 0.18,
    dashArray: '6, 6'
  }).addTo(state.map);

  const candidateIcon = L.divIcon({
    className: 'candidate-pin',
    html: `<div style="background:#ef4444;width:18px;height:18px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 0 10px rgba(239,68,68,0.9);display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;"><i class="fa-solid fa-flag"></i></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  state.candidateMarker = L.marker([lat, lon], { icon: candidateIcon }).addTo(state.map);
  state.map.panTo([lat, lon], { animate: true });

  try {
    const q = new URLSearchParams({
      lat: lat.toFixed(6),
      lon: lon.toFixed(6),
      radius: state.assessmentRadius,
      target_industry: state.targetIndustry
    });

    const res = await fetch(`/api/strategy/radius-assessment?${q.toString()}`);
    if (!res.ok) throw new Error('입지 분석 데이터 조회 실패');
    const data = await res.json();

    renderSiteAssessmentCard(data);
  } catch (err) {
    console.error('Site Assessment error:', err);
  } finally {
    showMapLoading(false);
  }
}

function renderSiteAssessmentCard(data) {
  DOM.siteAssessmentCard.style.display = 'flex';
  DOM.assessAddressTitle.textContent = `후보지 반경 ${data.radius_meter}m 입지 진단`;
  DOM.assessGradeBadge.textContent = data.site_grade;
  DOM.assessScoreValue.textContent = data.site_score;
  DOM.assessActionTip.textContent = data.action_tip;

  DOM.assessTotalStores.textContent = `${data.total_stores_in_radius.toLocaleString()}개`;
  DOM.assessCompetitorCount.textContent = `${data.competitors_count.toLocaleString()}개`;
  DOM.assessNearestDist.textContent = data.competitors_count > 0 ? `${data.nearest_competitor_distance_m}m` : '경쟁점 없음';
  DOM.assessOfficeCount.textContent = `${data.office_magnets.toLocaleString()}개`;
  DOM.assessEduCount.textContent = `${data.edu_magnets.toLocaleString()}개`;
  DOM.assessHealthCount.textContent = `${data.health_magnets.toLocaleString()}개`;

  // Render Closest Competitors List
  if (!data.closest_competitors || data.closest_competitors.length === 0) {
    DOM.assessCompetitorList.innerHTML = `
      <li style="justify-content:center; color:var(--accent-emerald);">
        <i class="fa-solid fa-circle-check"></i> 반경 내 동종 경쟁점이 없습니다 (독점 기회)
      </li>
    `;
  } else {
    DOM.assessCompetitorList.innerHTML = data.closest_competitors.map(c => `
      <li>
        <span class="competitor-name">${escapeHtml(c.name)} ${c.branch ? `(${escapeHtml(c.branch)})` : ''}</span>
        <span class="competitor-dist">${c.distance_m}m</span>
      </li>
    `).join('');
  }
}

// Stores Rendering on Map
function renderMapStores(stores) {
  state.mapStoresData = stores;
  DOM.mapVisibleCountBadge.textContent = `${stores.length.toLocaleString()}개 표시 중`;

  if (state.mapMode === 'cluster' || state.mapMode === 'radius') {
    renderClusterMarkers(stores);
  } else {
    renderHeatmap(stores);
  }
}

function renderClusterMarkers(stores) {
  if (state.heatLayer && state.map.hasLayer(state.heatLayer)) {
    state.map.removeLayer(state.heatLayer);
  }
  if (!state.map.hasLayer(state.markerCluster)) {
    state.map.addLayer(state.markerCluster);
  }

  state.markerCluster.clearLayers();

  const markers = [];
  const defaultIcon = L.divIcon({
    className: 'custom-store-pin',
    html: `<div style="background:#6366f1;width:12px;height:12px;border-radius:50%;border:2px solid #ffffff;box-shadow:0 0 6px rgba(99,102,241,0.8);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  for (const s of stores) {
    if (!s.lat || !s.lon) continue;
    const marker = L.marker([s.lat, s.lon], { icon: defaultIcon });

    const popupHtml = `
      <div class="popup-store-card">
        <div class="popup-store-name">${escapeHtml(s.name)} ${s.branch ? `(${escapeHtml(s.branch)})` : ''}</div>
        <div class="popup-badge-row">
          <span class="popup-badge">${escapeHtml(s.cat_large)}</span>
          <span class="popup-badge">${escapeHtml(s.cat_mid)}</span>
        </div>
        <div class="popup-address">${escapeHtml(s.road_addr || s.dong || '')}</div>
      </div>
    `;
    marker.bindPopup(popupHtml, { className: 'custom-popup' });
    markers.push(marker);
  }

  state.markerCluster.addLayers(markers);
}

function renderHeatmap(stores) {
  if (state.markerCluster && state.map.hasLayer(state.markerCluster)) {
    state.map.removeLayer(state.markerCluster);
  }

  const heatPoints = stores.map(s => [s.lat, s.lon, 0.6]);

  if (state.heatLayer) {
    state.heatLayer.setLatLngs(heatPoints);
    if (!state.map.hasLayer(state.heatLayer)) {
      state.map.addLayer(state.heatLayer);
    }
  } else {
    state.heatLayer = L.heatLayer(heatPoints, {
      radius: 22,
      blur: 16,
      maxZoom: 17,
      gradient: { 0.2: '#3b82f6', 0.5: '#10b981', 0.8: '#f59e0b', 1.0: '#ef4444' }
    }).addTo(state.map);
  }
}

// ==========================================================================
// CHART.JS INITIALIZATION
// ==========================================================================

function getChartThemeColors() {
  const isDark = state.theme === 'dark';
  return {
    textColor: isDark ? '#94a3b8' : '#475569',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif"
  };
}

function initCharts() {
  const colors = getChartThemeColors();

  // 1. Dong Opportunity Bar Chart (Horizontal)
  const ctxOpportunity = document.getElementById('dongOpportunityChart').getContext('2d');
  state.charts.dongOpportunity = new Chart(ctxOpportunity, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: '출점 유망도 점수',
          data: [],
          backgroundColor: '#10b981',
          borderRadius: 4,
          barPercentage: 0.65,
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` 유망 점수: ${ctx.parsed.x}점`
          }
        }
      },
      scales: {
        x: {
          max: 100,
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, font: { family: colors.fontFamily } }
        },
        y: {
          grid: { display: false },
          ticks: { color: colors.textColor, font: { family: colors.fontFamily, size: 11 } }
        }
      }
    }
  });

  // 2. Industry Doughnut Chart
  const ctxDoughnut = document.getElementById('doughnutCategoryChart').getContext('2d');
  state.charts.doughnutCategory = new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
          '#06b6d4', '#3b82f6', '#f97316', '#14b8a6', '#64748b'
        ],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: colors.textColor,
            font: { family: colors.fontFamily, size: 11 },
            boxWidth: 10,
            padding: 8
          }
        }
      }
    }
  });

  // 3. Franchise Bar Chart
  const ctxFranchise = document.getElementById('franchiseBarChart').getContext('2d');
  state.charts.franchiseBar = new Chart(ctxFranchise, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: '매장 수',
        data: [],
        backgroundColor: [
          '#00704A', '#FCD116', '#FF6600', '#002B49', '#A81C2B',
          '#3B82F6', '#8B5CF6', '#10B981'
        ],
        borderRadius: 6,
        barPercentage: 0.65
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y.toLocaleString()}개 매장`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: colors.textColor, font: { family: colors.fontFamily, size: 11 } }
        },
        y: {
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, font: { family: colors.fontFamily } }
        }
      }
    }
  });
}

function updateChartTheme() {
  const colors = getChartThemeColors();
  Object.values(state.charts).forEach(chart => {
    if (!chart) return;
    if (chart.options.scales) {
      if (chart.options.scales.x) {
        chart.options.scales.x.ticks.color = colors.textColor;
        if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = colors.gridColor;
      }
      if (chart.options.scales.y) {
        chart.options.scales.y.ticks.color = colors.textColor;
        if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = colors.gridColor;
      }
    }
    if (chart.options.plugins && chart.options.plugins.legend) {
      chart.options.plugins.legend.labels.color = colors.textColor;
    }
    chart.update();
  });
}

// ==========================================================================
// DATA FETCHING & STRATEGY ENGINE
// ==========================================================================

async function loadMetadata() {
  try {
    const res = await fetch('/api/dashboard/metadata');
    if (!res.ok) throw new Error('메타데이터 로드 실패');
    const data = await res.json();
    state.metadata = data;

    DOM.liveStoreCountLabel.textContent = `${data.total_stores.toLocaleString()}개 상가 분석 중`;

    // Populate Sido dropdown
    DOM.filterSido.innerHTML = '<option value="전체">전국 (전체)</option>';
    data.sido_list.forEach(sido => {
      const opt = document.createElement('option');
      opt.value = sido;
      opt.textContent = sido;
      DOM.filterSido.appendChild(opt);
    });
  } catch (err) {
    console.error('Metadata error:', err);
  }
}

function updateSigunguDropdown(selectedSido) {
  DOM.filterSigungu.innerHTML = '<option value="전체">전체 시군구</option>';
  if (selectedSido === '전체' || !state.metadata || !state.metadata.regions[selectedSido]) {
    DOM.filterSigungu.disabled = selectedSido === '전체';
    return;
  }

  DOM.filterSigungu.disabled = false;
  const sigungus = state.metadata.regions[selectedSido];
  sigungus.forEach(sigungu => {
    const opt = document.createElement('option');
    opt.value = sigungu;
    opt.textContent = sigungu;
    DOM.filterSigungu.appendChild(opt);
  });
}

function buildStrategyQueryParams(extra = {}) {
  const params = new URLSearchParams();
  if (state.filters.sido && state.filters.sido !== '전체') params.append('sido', state.filters.sido);
  if (state.filters.sigungu && state.filters.sigungu !== '전체') params.append('sigungu', state.filters.sigungu);
  if (state.filters.keyword) params.append('query', state.filters.keyword);
  params.append('target_industry', state.targetIndustry);

  Object.entries(extra).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, v);
  });

  return params.toString();
}

async function refreshStrategyDashboard(syncBbox = false) {
  showMapLoading(true);
  try {
    await Promise.all([
      fetchMarketOpportunity(),
      fetchSummaryKPIs(),
      fetchFranchiseChart(),
      fetchMapStores(syncBbox),
      fetchStoresTable(1)
    ]);
  } catch (err) {
    console.error('Refresh error:', err);
  } finally {
    showMapLoading(false);
  }
}

// 1. Fetch Market Opportunity Ranking & Saturation
async function fetchMarketOpportunity() {
  const q = buildStrategyQueryParams();
  const res = await fetch(`/api/strategy/opportunity?${q}`);
  if (!res.ok) return;
  const data = await res.json();

  // Update KPI Card 1: Saturation Level
  DOM.kpiSaturationLevel.textContent = data.overall_saturation.split(' ')[0];
  DOM.kpiSaturationLevel.className = `kpi-value text-${data.overall_badge}`;
  DOM.kpiSaturationSubtext.textContent = data.overall_saturation.substring(data.overall_saturation.indexOf('('));

  // Update KPI Card 2: Top Promising Dong
  if (data.top_promising_dongs && data.top_promising_dongs.length > 0) {
    const top1 = data.top_promising_dongs[0];
    DOM.kpiTopPromisingDong.textContent = `${top1.dong}`;
    DOM.kpiTopPromisingScore.textContent = `유망도 점수: ${top1.score}점 (경쟁률 ${top1.target_ratio}%)`;
  } else {
    DOM.kpiTopPromisingDong.textContent = '-';
    DOM.kpiTopPromisingScore.textContent = '분석 데이터 없음';
  }

  // Render Top 5 Promising Dong Cards
  renderPromisingCards(data.top_promising_dongs || []);

  // Render Dong Opportunity Bar Chart
  if (state.charts.dongOpportunity && data.dong_list) {
    const topDongs = data.dong_list.slice(0, 10);
    state.charts.dongOpportunity.data.labels = topDongs.map(d => `${d.dong}`);
    state.charts.dongOpportunity.data.datasets[0].data = topDongs.map(d => d.score);
    state.charts.dongOpportunity.update();
  }

  // Update Strategic Differentiation Guide (Tab 3)
  renderDifferentiationGuide(data);
}

function renderPromisingCards(dongs) {
  if (dongs.length === 0) {
    DOM.promisingCardsContainer.innerHTML = '<div class="promising-loading">조건에 맞는 유망 상권이 없습니다.</div>';
    return;
  }

  DOM.promisingCardsContainer.innerHTML = dongs.map((d, idx) => `
    <div class="promising-card" onclick="zoomToDong('${escapeHtml(d.sido)}', '${escapeHtml(d.sigungu)}', '${escapeHtml(d.dong)}')">
      <div class="promising-rank-badge">${idx + 1}</div>
      <div class="promising-dong-name">${escapeHtml(d.dong)}</div>
      <div class="promising-score">⭐ ${d.score}점</div>
      <div class="promising-meta">전체 ${d.total_stores}개 중 목표 ${d.target_stores}개 (${d.target_ratio}%)</div>
      <div class="promising-meta" style="color:var(--accent-blue);">오피스 ${d.office_stores}개 / 학원 ${d.edu_stores}개</div>
    </div>
  `).join('');
}

window.zoomToDong = async function(sido, sigungu, dong) {
  // Query dong coordinates from table or backend
  const q = new URLSearchParams({ sido, sigungu, query: dong, page: 1, page_size: 1 });
  const res = await fetch(`/api/dashboard/stores/list?${q.toString()}`);
  if (res.ok) {
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const s = data.items[0];
      state.map.flyTo([s.lat, s.lon], 15, { duration: 1.2 });
      if (state.mapMode === 'radius') {
        executeRadiusAssessment(s.lat, s.lon);
      }
    }
  }
};

// 2. Fetch General Summary KPIs
async function fetchSummaryKPIs() {
  const q = buildStrategyQueryParams();
  const res = await fetch(`/api/dashboard/summary?${q}`);
  if (!res.ok) return;
  const data = await res.json();

  // Find target industry share from distribution
  let targetCount = 0;
  let targetRatio = 0;
  if (data.category_distribution && data.category_distribution.length > 0) {
    const first = data.category_distribution[0];
    targetCount = first.count;
    targetRatio = first.percentage;
  }

  DOM.kpiTargetStoresCount.textContent = targetCount.toLocaleString();
  DOM.kpiTargetStoresRatio.textContent = `전체 상가의 약 ${targetRatio}% 점유`;

  // Magnets estimation from dong count
  DOM.kpiMagnetCount.textContent = ((data.dong_count || 1) * 85).toLocaleString();
  DOM.kpiMagnetSubtext.textContent = `${data.dong_count || 0}개 행정동 집객 시설`;

  // Doughnut Chart
  if (state.charts.doughnutCategory && data.category_distribution) {
    const labels = data.category_distribution.map(d => d.name);
    const counts = data.category_distribution.map(d => d.count);
    state.charts.doughnutCategory.data.labels = labels;
    state.charts.doughnutCategory.data.datasets[0].data = counts;
    state.charts.doughnutCategory.update();
  }
}

// 3. Franchise Comparison
async function fetchFranchiseChart() {
  const q = buildStrategyQueryParams({ group_key: state.activeFranchiseGroup });
  const res = await fetch(`/api/dashboard/stats/franchise?${q}`);
  if (!res.ok) return;
  const data = await res.json();

  DOM.franchiseChartTitle.innerHTML = `<i class="fa-solid fa-tags"></i> ${data.group_title} 브랜드 출점 수 비교`;

  if (state.charts.franchiseBar && data.brands) {
    state.charts.franchiseBar.data.labels = data.brands.map(b => b.brand);
    state.charts.franchiseBar.data.datasets[0].data = data.brands.map(b => b.count);
    state.charts.franchiseBar.update();
  }
}

// 4. Map Stores Fetching
async function fetchMapStores(useBbox = false) {
  const extra = { limit: 2500 };
  if (useBbox && state.map) {
    const bounds = state.map.getBounds();
    extra.min_lat = bounds.getSouth();
    extra.max_lat = bounds.getNorth();
    extra.min_lon = bounds.getWest();
    extra.max_lon = bounds.getEast();
  }

  const q = buildStrategyQueryParams(extra);
  const res = await fetch(`/api/dashboard/stores/map?${q}`);
  if (!res.ok) return;
  const data = await res.json();

  renderMapStores(data.stores || []);

  if (!useBbox && data.stores.length > 0 && state.filters.sido !== '전체') {
    const lats = data.stores.map(s => s.lat);
    const lons = data.stores.map(s => s.lon);
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)]
    );
    state.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  }
}

// 5. Stores Table
async function fetchStoresTable(page = 1) {
  state.currentPage = page;
  const q = buildStrategyQueryParams({ page, page_size: state.pageSize });
  const res = await fetch(`/api/dashboard/stores/list?${q}`);
  if (!res.ok) return;
  const data = await res.json();

  state.totalPages = data.total_pages || 1;
  DOM.tableTotalCount.textContent = `총 ${data.total_count.toLocaleString()}개 점포`;
  DOM.pageIndicator.textContent = `${data.page} / ${state.totalPages} 페이지`;
  DOM.prevPageBtn.disabled = data.page <= 1;
  DOM.nextPageBtn.disabled = data.page >= state.totalPages;

  renderTableRows(data.items || []);
}

function renderTableRows(items) {
  if (items.length === 0) {
    DOM.storeTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center empty-cell">
          <i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 8px; display: block; opacity: 0.4;"></i>
          조건에 부합하는 상가 데이터가 없습니다.
        </td>
      </tr>
    `;
    return;
  }

  DOM.storeTableBody.innerHTML = items.map(s => `
    <tr>
      <td class="store-name-cell">${escapeHtml(s.name)} ${s.branch ? `<span style="font-size:0.75rem; color:var(--text-muted);">(${escapeHtml(s.branch)})</span>` : ''}</td>
      <td><span class="badge-tag">${escapeHtml(s.cat_large)}</span></td>
      <td>${escapeHtml(s.cat_mid)}</td>
      <td>${escapeHtml(s.cat_sub)}</td>
      <td>${escapeHtml(s.sido)}</td>
      <td>${escapeHtml(s.sigungu)}</td>
      <td>${escapeHtml(s.dong)}</td>
      <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(s.road_addr || '-')}</td>
      <td class="text-center">
        <button class="btn-locate" onclick="locateStoreOnMap(${s.lat}, ${s.lon}, '${escapeHtml(s.name)}')">
          <i class="fa-solid fa-location-dot"></i> 보기
        </button>
      </td>
    </tr>
  `).join('');
}

window.locateStoreOnMap = function(lat, lon, name) {
  if (!state.map || !lat || !lon) return;
  state.map.flyTo([lat, lon], 17, { duration: 1.2 });
  if (state.mapMode === 'radius') {
    executeRadiusAssessment(lat, lon);
  }
};

// Strategic Differentiation Generator
function renderDifferentiationGuide(data) {
  const topDong = (data.top_promising_dongs && data.top_promising_dongs.length > 0) ? data.top_promising_dongs[0] : null;
  const dongName = topDong ? topDong.dong : '분석 지역';

  DOM.differentiationContent.innerHTML = `
    <div class="strategy-item">
      <div class="strategy-title">🏢 1. 오피스 밀집 상권 (예: ${dongName}) 맞춤 전략</div>
      <p>• <strong>피크타임 고속 회전</strong>: 오전 8~9시 출근 시간대 모바일 사전 주문(Smart Order) 및 테이크아웃 전용 패스트 트랙 구성</p>
      <p>• <strong>구독형 멤버십 모델</strong>: 직장인 대상 주간/월간 음료·식사 할인 구독 서비스로 락인(Lock-in) 효과 극대화</p>
    </div>
    <div class="strategy-item">
      <div class="strategy-title">🎓 2. 학원가 및 학생 유동 상권 맞춤 전략</div>
      <p>• <strong>가성비 & 대용량 메뉴</strong>: 중고등·대학생 타깃의 합리적인 가격대 대용량 시그니처 메뉴 라인업 구축</p>
      <p>• <strong>방과 후·주말 스터디 공간화</strong>: 1인 좌석 및 콘센트 인프라 확충으로 체류 시간 증대</p>
    </div>
    <div class="strategy-item">
      <div class="strategy-title">💡 3. 초기 투자 비용 최소화 및 리스크 방어 방안</div>
      <p>• <strong>공유 주방 / 배달 하이브리드</strong>: 메인 상권 대로변 대신 1.5급지 이면도로에서 배달·포장 중심 출점으로 보증금·월세 40% 절감</p>
      <p>• <strong>지역 특화 틈새 메뉴</strong>: 인근 대형 프랜차이즈가 다루지 않는 프리미엄 수제 디저트 또는 특화 원두 라인업으로 차별화</p>
    </div>
  `;
}

// ==========================================================================
// EVENT LISTENERS & FILTER INTERACTIONS
// ==========================================================================

function initEventListeners() {
  // Target Industry Pills
  DOM.industryPillsList.addEventListener('click', (e) => {
    const pill = e.target.closest('.industry-pill');
    if (!pill) return;

    document.querySelectorAll('.industry-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.targetIndustry = pill.getAttribute('data-industry');

    // Auto-sync franchise tab if applicable
    if (['cafe', 'convenience', 'chicken_fastfood', 'bakery_dessert'].includes(state.targetIndustry)) {
      state.activeFranchiseGroup = state.targetIndustry;
      DOM.franchisePills.forEach(p => {
        if (p.getAttribute('data-group') === state.activeFranchiseGroup) p.classList.add('active');
        else p.classList.remove('active');
      });
    }

    refreshStrategyDashboard();
  });

  // Sido Select
  DOM.filterSido.addEventListener('change', (e) => {
    state.filters.sido = e.target.value;
    state.filters.sigungu = '전체';
    updateSigunguDropdown(state.filters.sido);
  });

  // Sigungu Select
  DOM.filterSigungu.addEventListener('change', (e) => {
    state.filters.sigungu = e.target.value;
  });

  // Keyword Search
  DOM.filterKeyword.addEventListener('input', (e) => {
    state.filters.keyword = e.target.value.trim();
    DOM.clearKeywordBtn.style.display = state.filters.keyword ? 'block' : 'none';
  });

  DOM.filterKeyword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') refreshStrategyDashboard();
  });

  DOM.clearKeywordBtn.addEventListener('click', () => {
    DOM.filterKeyword.value = '';
    state.filters.keyword = '';
    DOM.clearKeywordBtn.style.display = 'none';
  });

  DOM.applyFilterBtn.addEventListener('click', () => refreshStrategyDashboard());
  DOM.resetFilterBtn.addEventListener('click', resetFilters);
  DOM.refreshDataBtn.addEventListener('click', () => refreshStrategyDashboard());

  // Map Modes (Cluster, Heatmap, Radius)
  DOM.mapModeClusterBtn.addEventListener('click', () => {
    state.mapMode = 'cluster';
    DOM.mapModeClusterBtn.classList.add('active');
    DOM.mapModeHeatmapBtn.classList.remove('active');
    DOM.mapModeRadiusBtn.classList.remove('active');
    DOM.radiusSelectorGroup.style.display = 'none';
    DOM.radiusModeHint.style.display = 'none';
    DOM.mapElement.style.cursor = '';
    renderMapStores(state.mapStoresData);
  });

  DOM.mapModeHeatmapBtn.addEventListener('click', () => {
    state.mapMode = 'heatmap';
    DOM.mapModeHeatmapBtn.classList.add('active');
    DOM.mapModeClusterBtn.classList.remove('active');
    DOM.mapModeRadiusBtn.classList.remove('active');
    DOM.radiusSelectorGroup.style.display = 'none';
    DOM.radiusModeHint.style.display = 'none';
    DOM.mapElement.style.cursor = '';
    renderMapStores(state.mapStoresData);
  });

  DOM.mapModeRadiusBtn.addEventListener('click', () => {
    state.mapMode = 'radius';
    DOM.mapModeRadiusBtn.classList.add('active');
    DOM.mapModeClusterBtn.classList.remove('active');
    DOM.mapModeHeatmapBtn.classList.remove('active');
    DOM.radiusSelectorGroup.style.display = 'flex';
    DOM.radiusModeHint.style.display = 'flex';
    DOM.mapElement.style.cursor = 'crosshair';
    renderMapStores(state.mapStoresData);
  });

  // Radius Chips
  DOM.radiusChips.forEach(chip => {
    chip.addEventListener('click', () => {
      DOM.radiusChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.assessmentRadius = parseFloat(chip.getAttribute('data-radius'));
      if (state.radiusCircle) {
        state.radiusCircle.setRadius(state.assessmentRadius);
      }
    });
  });

  DOM.closeAssessCardBtn.addEventListener('click', () => {
    DOM.siteAssessmentCard.style.display = 'none';
  });

  // Sync Bbox
  DOM.syncBboxBtn.addEventListener('click', () => refreshStrategyDashboard(true));
  DOM.resetMapCenterBtn.addEventListener('click', () => state.map.setView([36.35, 127.38], 7));

  // Chart Tabs
  DOM.chartTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.chartTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-chart-tab');
      DOM.chartTabOpportunity.classList.toggle('active', tab === 'opportunity');
      DOM.chartTabCompetition.classList.toggle('active', tab === 'competition');
      DOM.chartTabDifferentiation.classList.toggle('active', tab === 'differentiation');
    });
  });

  // Franchise Pills
  DOM.franchisePills.forEach(pill => {
    pill.addEventListener('click', () => {
      DOM.franchisePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeFranchiseGroup = pill.getAttribute('data-group');
      fetchFranchiseChart();
    });
  });

  // Pagination
  DOM.prevPageBtn.addEventListener('click', () => {
    if (state.currentPage > 1) fetchStoresTable(state.currentPage - 1);
  });
  DOM.nextPageBtn.addEventListener('click', () => {
    if (state.currentPage < state.totalPages) fetchStoresTable(state.currentPage + 1);
  });
}

function resetFilters() {
  state.filters = {
    sido: '전체',
    sigungu: '전체',
    categoryLarge: '전체',
    categoryMid: '전체',
    keyword: ''
  };

  DOM.filterSido.value = '전체';
  DOM.filterSigungu.value = '전체';
  DOM.filterSigungu.disabled = true;
  DOM.filterKeyword.value = '';
  DOM.clearKeywordBtn.style.display = 'none';

  refreshStrategyDashboard(false);
}

// Geocoding Tab
function initGeocodeMap() {
  if (state.geocodeMap) return;

  state.geocodeMap = L.map('geocodeMap', {
    center: [37.5665, 126.9780],
    zoom: 13,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(state.geocodeMap);

  DOM.geocodeSearchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const addr = DOM.geocodeAddressInput.value.trim();
    if (!addr) return;

    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(addr)}`);
      if (!res.ok) throw new Error('주소를 찾을 수 없습니다.');
      const data = await res.json();
      const pt = data.result.point;
      const lat = parseFloat(pt.y);
      const lon = parseFloat(pt.x);

      DOM.geocodeDisplayAddress.textContent = data.result.text || addr;
      DOM.geocodeLatValue.textContent = lat.toFixed(6);
      DOM.geocodeLonValue.textContent = lon.toFixed(6);
      DOM.geocodeResultCard.style.display = 'block';

      if (state.geocodeMarker) state.geocodeMap.removeLayer(state.geocodeMarker);
      state.geocodeMarker = L.marker([lat, lon]).addTo(state.geocodeMap);
      state.geocodeMap.setView([lat, lon], 16);
    } catch (err) {
      alert(err.message);
    }
  });
}

// Utility
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
