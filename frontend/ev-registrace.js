(function() {
  const KRAJE_API_URL   = 'https://el-tech.vozidlaonline.cz/api/ev-firmy-kraje-mesice';
  const OKRESY_API_URL  = 'https://el-tech.vozidlaonline.cz/api/ev-firmy-okresy-mesice';
  const REGM_API_URL    = 'https://el-tech.vozidlaonline.cz/api/ev-firmy-registracni-mista-mesice';
  const REGM_DETAIL_API_URL = 'https://el-tech.vozidlaonline.cz/api/ev-firmy-registracni-misto-detail';

  const CR_KRAJE_GEOJSON = 'https://geojson.vozidlaonline.cz/kraje.geojson';

  const KRAJ_CONFIG = {
    jihocesky:          { name: 'Jihočeský kraj',         okresGeojson: 'https://geojson.vozidlaonline.cz/jihocesky.geojson' },
    jihomoravsky:       { name: 'Jihomoravský kraj',      okresGeojson: 'https://geojson.vozidlaonline.cz/jihomoravsky.geojson' },
    karlovarsky:        { name: 'Karlovarský kraj',       okresGeojson: 'https://geojson.vozidlaonline.cz/karlovarsky.geojson' },
    kralovehradecky:    { name: 'Královéhradecký kraj',   okresGeojson: 'https://geojson.vozidlaonline.cz/kralovehradecky.geojson' },
    liberecky:          { name: 'Liberecký kraj',         okresGeojson: 'https://geojson.vozidlaonline.cz/liberecky.geojson' },
    moravskoslezsky:    { name: 'Moravskoslezský kraj',   okresGeojson: 'https://geojson.vozidlaonline.cz/moravskoslezsky.geojson' },
    olomoucky:          { name: 'Olomoucký kraj',         okresGeojson: 'https://geojson.vozidlaonline.cz/olomoucky.geojson' },
    pardubicky:         { name: 'Pardubický kraj',        okresGeojson: 'https://geojson.vozidlaonline.cz/pardubicky.geojson' },
    plzensky:           { name: 'Plzeňský kraj',          okresGeojson: 'https://geojson.vozidlaonline.cz/plzensky.geojson' },
    ustecky:            { name: 'Ústecký kraj',           okresGeojson: 'https://geojson.vozidlaonline.cz/ustecky.geojson' },
    vysocina:           { name: 'Kraj Vysočina',          okresGeojson: 'https://geojson.vozidlaonline.cz/vysocina.geojson' },
    zlinsky:            { name: 'Zlínský kraj',           okresGeojson: 'https://geojson.vozidlaonline.cz/zlinsky.geojson' },
    stredocesky:        { name: 'Středočeský kraj',       okresGeojson: 'https://geojson.vozidlaonline.cz/stredocesky.geojson' },
    hlavni_mesto_praha: { name: 'Hlavní město Praha',     okresGeojson: 'https://geojson.vozidlaonline.cz/hlavni_mesto_praha.geojson' }
  };

  const CESKE_MESICE = [
    'Leden','Únor','Březen','Duben','Květen','Červen',
    'Červenec','Srpen','Září','Říjen','Listopad','Prosinec'
  ];

  const FIRM_DETAIL_STORAGE_PREFIX = 'ev-firm-detail-';

  function pad(n) { return String(n).padStart(2, '0'); }

  function normalizeName(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[-–—]/g, ' ')
      .replace(/[.,]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const KRAJSKA_MESTA = [
    { slug: 'hlavni_mesto_praha', name: 'Praha',             lat: 50.087, lng: 14.421 },
    { slug: 'stredocesky',        name: 'Praha (StČ)',       lat: 50.087, lng: 14.421 },
    { slug: 'jihocesky',          name: 'České Budějovice',  lat: 48.974, lng: 14.474 },
    { slug: 'plzensky',           name: 'Plzeň',             lat: 49.747, lng: 13.377 },
    { slug: 'karlovarsky',        name: 'Karlovy Vary',      lat: 50.231, lng: 12.871 },
    { slug: 'ustecky',            name: 'Ústí n. Labem',     lat: 50.659, lng: 14.042 },
    { slug: 'liberecky',          name: 'Liberec',           lat: 50.768, lng: 15.056 },
    { slug: 'kralovehradecky',    name: 'Hradec Králové',    lat: 50.210, lng: 15.825 },
    { slug: 'pardubicky',         name: 'Pardubice',         lat: 50.038, lng: 15.779 },
    { slug: 'vysocina',           name: 'Jihlava',           lat: 49.396, lng: 15.590 },
    { slug: 'jihomoravsky',       name: 'Brno',              lat: 49.195, lng: 16.607 },
    { slug: 'olomoucky',          name: 'Olomouc',           lat: 49.594, lng: 17.251 },
    { slug: 'zlinsky',            name: 'Zlín',              lat: 49.224, lng: 17.667 },
    { slug: 'moravskoslezsky',    name: 'Ostrava',           lat: 49.835, lng: 18.292 }
  ];

  const OKRESNI_MESTA = [
    { krajSlug: 'jihocesky', okresKey: normalizeName('České Budějovice'),  name: 'České Budějovice',  lat: 48.974, lng: 14.474 },
    { krajSlug: 'jihocesky', okresKey: normalizeName('Český Krumlov'),     name: 'Český Krumlov',     lat: 48.812, lng: 14.317 },
    { krajSlug: 'jihocesky', okresKey: normalizeName('Jindřichův Hradec'), name: 'Jindřichův Hradec', lat: 49.144, lng: 15.003 },
    { krajSlug: 'jihocesky', okresKey: normalizeName('Písek'),             name: 'Písek',             lat: 49.308, lng: 14.147 },
    { krajSlug: 'jihocesky', okresKey: normalizeName('Prachatice'),        name: 'Prachatice',        lat: 49.012, lng: 13.997 },
    { krajSlug: 'jihocesky', okresKey: normalizeName('Strakonice'),        name: 'Strakonice',        lat: 49.262, lng: 13.902 },
    { krajSlug: 'jihocesky', okresKey: normalizeName('Tábor'),             name: 'Tábor',             lat: 49.414, lng: 14.657 },
    { krajSlug: 'jihomoravsky', okresKey: normalizeName('Brno-město'),     name: 'Brno',              lat: 49.195, lng: 16.607 },
    { krajSlug: 'jihomoravsky', okresKey: normalizeName('Blansko'),        name: 'Blansko',           lat: 49.362, lng: 16.644 },
    { krajSlug: 'jihomoravsky', okresKey: normalizeName('Břeclav'),        name: 'Břeclav',           lat: 48.759, lng: 16.882 },
    { krajSlug: 'jihomoravsky', okresKey: normalizeName('Hodonín'),        name: 'Hodonín',           lat: 48.848, lng: 17.133 },
    { krajSlug: 'jihomoravsky', okresKey: normalizeName('Vyškov'),         name: 'Vyškov',            lat: 49.278, lng: 17.001 },
    { krajSlug: 'jihomoravsky', okresKey: normalizeName('Znojmo'),         name: 'Znojmo',            lat: 48.855, lng: 16.048 },
    { krajSlug: 'moravskoslezsky', okresKey: normalizeName('Ostrava-město'), name: 'Ostrava',         lat: 49.835, lng: 18.292 },
    { krajSlug: 'moravskoslezsky', okresKey: normalizeName('Frýdek-Místek'), name: 'Frýdek-Místek',   lat: 49.685, lng: 18.351 },
    { krajSlug: 'moravskoslezsky', okresKey: normalizeName('Karviná'),       name: 'Karviná',         lat: 49.853, lng: 18.542 },
    { krajSlug: 'moravskoslezsky', okresKey: normalizeName('Opava'),         name: 'Opava',           lat: 49.940, lng: 17.902 },
    { krajSlug: 'moravskoslezsky', okresKey: normalizeName('Nový Jičín'),    name: 'Nový Jičín',      lat: 49.595, lng: 18.012 }
  ];

  function setError(msg) {
    const el = document.getElementById('ev-kraje-error');
    if (el) el.textContent = msg || '';
  }

  function showLoading() {
    const el = document.getElementById('ev-loading-overlay');
    if (el) el.style.display = 'flex';
  }

  function hideLoading() {
    const el = document.getElementById('ev-loading-overlay');
    if (el) el.style.display = 'none';
  }

  function collapseSection(id, collapsed) {
    const wrapper = document.getElementById(id);
    if (!wrapper) return;
    if (collapsed) wrapper.classList.add('collapsed');
    else wrapper.classList.remove('collapsed');
  }

  let mapKraje = null;
  let mapOkresy = null;

  let mapKrajeCitiesLayer = null;
  let mapOkresyCitiesLayer = null;

  let krajeLayer = null;
  let okresyLayer = null;

  let selectedKrajSlug = null;
  let selectedOkresName = null;
  let selectedRegMisto = null;

  const krajLayersBySlug  = new Map();
  const okresLayersByName = new Map();

  function resetLayer(layer) {
    if (!layer) return;
    layer.setStyle({
      weight: 1.5,
      color: '#d0d7e2',
      fillColor: '#2f80ed',
      fillOpacity: 0.9
    });
  }

  function highlightLayer(layer) {
    if (!layer) return;
    layer.setStyle({
      fillColor: '#5599f0',
      fillOpacity: 0.95
    });
  }

  function selectLayer(layer) {
    if (!layer) return;
    layer.setStyle({
      fillColor: '#1f5fcb',
      fillOpacity: 0.98
    });
  }

  function initMap() {
    if (!window.L) return;

    mapKraje = L.map('ev-kraje-map-kraje', {
      center: [49.8, 15.5],
      zoom: 7,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      attributionControl: false
    });

    mapOkresy = L.map('ev-kraje-map-okresy', {
      center: [49.8, 15.5],
      zoom: 7,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      attributionControl: false
    });

    mapKrajeCitiesLayer  = L.layerGroup().addTo(mapKraje);
    mapOkresyCitiesLayer = L.layerGroup().addTo(mapOkresy);

    loadKrajeGeojson();
    renderKrajeCities();
  }

  function renderKrajeCities() {
    if (!mapKraje || !mapKrajeCitiesLayer) return;
    mapKrajeCitiesLayer.clearLayers();

    KRAJSKA_MESTA.forEach(city => {
      L.circleMarker([city.lat, city.lng], {
        radius: 8,
        color: '#00000000',
        fillOpacity: 0,
        opacity: 0
      })
        .bindTooltip(city.name, {
          direction: 'right',
          className: 'ev-city-label'
        })
        .addTo(mapKrajeCitiesLayer);
    });
  }

  function renderOkresyCitiesForKraj(krajSlug) {
    if (!mapOkresy || !mapOkresyCitiesLayer) return;
    mapOkresyCitiesLayer.clearLayers();
    if (!krajSlug) return;

    OKRESNI_MESTA
      .filter(c => c.krajSlug === krajSlug)
      .forEach(city => {
        L.circleMarker([city.lat, city.lng], {
          radius: 8,
          color: '#00000000',
          fillOpacity: 0,
          opacity: 0
        })
          .bindTooltip(city.name, {
            direction: 'right',
            className: 'ev-city-label'
          })
          .addTo(mapOkresyCitiesLayer);
      });
  }

  async function loadKrajeGeojson() {
    if (!mapKraje) return;
    try {
      const res = await fetch(CR_KRAJE_GEOJSON);
      if (!res.ok) throw new Error('GeoJSON kraje HTTP ' + res.status);
      const gj = await res.json();

      krajLayersBySlug.clear();
      if (krajeLayer) mapKraje.removeLayer(krajeLayer);

      krajeLayer = L.geoJSON(gj, {
        style: () => ({
          weight: 1.5,
          color: '#d0d7e2',
          fillColor: '#2f80ed',
          fillOpacity: 0.9
        }),
        onEachFeature: function (feature, layer) {
          const props = feature.properties || {};
          const rawName =
            props.NAZEV ||
            props.name ||
            props.kraj ||
            props.KRAJ ||
            props.nazev ||
            '';

          if (rawName) {
            layer.bindTooltip(rawName, {
              direction: 'auto',
              className: 'ev-city-label',
              sticky: true
            });
          }

          const norm = normalizeName(rawName);

          let slug = null;
          for (const s of Object.keys(KRAJ_CONFIG)) {
            const confNorm = normalizeName(KRAJ_CONFIG[s].name);
            if (confNorm === norm || confNorm.includes(norm) || norm.includes(confNorm)) {
              slug = s;
              break;
            }
          }

          if (!slug) {
            console.warn('Nepodařilo se napárovat kraj z GeoJSONu na KRAJ_CONFIG:', rawName, norm, props);
          } else {
            krajLayersBySlug.set(slug, layer);
          }

          layer.on('mouseover', () => {
            if (slug && slug === selectedKrajSlug) return;
            highlightLayer(layer);
          });

          layer.on('mouseout', () => {
            if (slug && slug === selectedKrajSlug) {
              selectLayer(layer);
            } else {
              resetLayer(layer);
            }
          });

          layer.on('click', () => {
            if (!krajeRows || !krajeRows.length || !slug) return;
            const row = krajeRows.find(r => r.slug === slug);
            if (!row) {
              console.warn('Klik na kraj, ale nenašel jsem řádek pro slug:', slug, rawName);
              return;
            }
            handleKrajSelect(row);
          });
        }
      }).addTo(mapKraje);

      setTimeout(() => {
        try {
          mapKraje.invalidateSize();
          mapKraje.fitBounds(krajeLayer.getBounds(), { padding: [0, 0] });
        } catch (e) {}
      }, 0);

    } catch (err) {
      console.error(err);
      setError('Chyba při načítání mapy krajů');
    }
  }

  async function loadOkresyGeojsonForKraj(krajSlug) {
    if (!mapOkresy || !KRAJ_CONFIG[krajSlug]) return;
    try {
      const url = KRAJ_CONFIG[krajSlug].okresGeojson;
      const res = await fetch(url);
      if (!res.ok) throw new Error('GeoJSON okresy HTTP ' + res.status);
      const gj = await res.json();

      okresLayersByName.clear();
      if (okresyLayer) mapOkresy.removeLayer(okresyLayer);

      okresyLayer = L.geoJSON(gj, {
        style: () => ({
          weight: 1.5,
          color: '#d0d7e2',
          fillColor: '#2f80ed',
          fillOpacity: 0.9
        }),
        onEachFeature: function (feature, layer) {
          const props = feature.properties || {};

          let rawName =
            props.NAZEV ||
            props.name  ||
            props.okres ||
            props.OKRES ||
            '';

          if (!rawName) {
            for (const [k, v] of Object.entries(props)) {
              if (typeof v === 'string' && /okres/i.test(k)) {
                rawName = v;
                break;
              }
            }
          }
          if (!rawName) {
            for (const [k, v] of Object.entries(props)) {
              if (typeof v === 'string') {
                rawName = v;
                break;
              }
            }
          }
          if (rawName) {
            layer.bindTooltip(rawName, {
              direction: 'auto',
              className: 'ev-city-label',
              sticky: true
            });
          }

          const normKey = normalizeName(rawName);
          if (normKey) {
            okresLayersByName.set(normKey, layer);
            layer.options.okresKey = normKey;
          }

          layer.on('mouseover', () => {
            if (selectedOkresName && normalizeName(selectedOkresName) === normKey) {
              return;
            }
            highlightLayer(layer);
          });

          layer.on('mouseout', () => {
            if (selectedOkresName && normalizeName(selectedOkresName) === normKey) {
              selectLayer(layer);
            } else {
              resetLayer(layer);
            }
          });

          layer.on('click', () => {
            if (!okresyRows || !okresyRows.length) return;

            const targetKey = layer.options.okresKey || normKey;
            let matchedRow = null;
            for (const r of okresyRows) {
              if (r.normOkres === targetKey) {
                matchedRow = r;
                break;
              }
            }

            if (!matchedRow) {
              console.warn('Polygon okresu bez shody v tabulce:', rawName, '→', targetKey);
              return;
            }

            handleOkresSelect(matchedRow);
          });
        }
      }).addTo(mapOkresy);

      setTimeout(() => {
        try {
          mapOkresy.invalidateSize();
          mapOkresy.fitBounds(okresyLayer.getBounds(), { padding: [0, 0] });
        } catch (e) {}
      }, 0);

    } catch (err) {
      console.error(err);
      setError('Chyba při načítání mapy okresů daného kraje');
    }
  }

  function focusOkresOnMap(okresKey) {
    const key = normalizeName(okresKey);
    if (!mapOkresy || !key) return;

    const selectedLayer = okresLayersByName.get(key);
    if (!selectedLayer) {
      console.warn('Nenalezen polygon okresu pro zvýraznění, key =', key);
      return;
    }

    okresLayersByName.forEach((layer, k) => {
      if (k === key) {
        selectLayer(layer);
      } else {
        resetLayer(layer);
      }
    });
  }

  function initMonthYearSelectors() {
    const monthFromSel = document.getElementById('ev-kraje-month-from');
    const monthToSel   = document.getElementById('ev-kraje-month-to');
    const yearFromSel  = document.getElementById('ev-kraje-year-from');
    const yearToSel    = document.getElementById('ev-kraje-year-to');

    CESKE_MESICE.forEach((name, idx) => {
      monthFromSel.appendChild(new Option(name, idx + 1));
      monthToSel.appendChild(new Option(name, idx + 1));
    });

    const today = new Date();
    const currentYear = today.getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 1;

    for (let y = startYear; y <= endYear; y++) {
      yearFromSel.appendChild(new Option(y, y));
      yearToSel.appendChild(new Option(y, y));
    }

    const defaultToMonth = today.getMonth() + 1;
    const defaultToYear  = currentYear;
    const fromDate = new Date(today.getTime());
    fromDate.setMonth(fromDate.getMonth() - 5);
    const defaultFromMonth = fromDate.getMonth() + 1;
    const defaultFromYear  = fromDate.getFullYear();

    monthFromSel.value = defaultFromMonth;
    yearFromSel.value  = defaultFromYear;
    monthToSel.value   = defaultToMonth;
    yearToSel.value    = defaultToYear;
  }

  function getRange() {
    const mf = parseInt(document.getElementById('ev-kraje-month-from').value, 10);
    const yf = parseInt(document.getElementById('ev-kraje-year-from').value, 10);
    const mt = parseInt(document.getElementById('ev-kraje-month-to').value, 10);
    const yt = parseInt(document.getElementById('ev-kraje-year-to').value, 10);
    if (!mf || !yf || !mt || !yt) return null;

    const from = `${yf}-${pad(mf)}-01`;
    const to   = `${yt}-${pad(mt)}-01`;

    document.getElementById('ev-kraje-from').value = from;
    document.getElementById('ev-kraje-to').value   = to;
    return { from, to };
  }

  let krajeAllMonths = [];
  let krajeRows = [];
  let krajeMonthPageStart = 0;
  let krajeYearsLabel = '';

  const krajNameToSlug = {};
  Object.keys(KRAJ_CONFIG).forEach(slug => {
    krajNameToSlug[KRAJ_CONFIG[slug].name] = slug;
  });

  async function loadKrajeData(from, to) {
    const url = `${KRAJE_API_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Chyba při volání API kraje: ' + res.status);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'API kraje vrátilo chybu');

    const items = data.items || [];
    const monthSet = new Set(items.map(i => i.month));
    const months = Array.from(monthSet).sort();

    const rowsByKraj = {};
    items.forEach(i => {
      const key = i.kraj || '(neznámý kraj)';
      if (!rowsByKraj[key]) {
        const slug = krajNameToSlug[key] || null;
        rowsByKraj[key] = { krajName: key, slug, values: {}, total: 0 };
      }
      rowsByKraj[key].values[i.month] = i.vehicles_count;
      rowsByKraj[key].total += Number(i.vehicles_count) || 0;
    });

    krajeAllMonths = months;
    krajeRows = Object.values(rowsByKraj).sort((a, b) => a.krajName.localeCompare(b.krajName));
    krajeMonthPageStart = 0;

    if (months.length) {
      const firstY = new Date(months[0]).getFullYear();
      const lastY  = new Date(months[months.length - 1]).getFullYear();
      krajeYearsLabel = firstY === lastY ? String(firstY) : `${firstY}–${lastY}`;
    } else {
      krajeYearsLabel = '';
    }

    const labelEl = document.getElementById('ev-kraje-section-label');
    if (labelEl) {
      labelEl.textContent = krajeYearsLabel ? `Kraje · ${krajeYearsLabel}` : 'Kraje';
    }
  }

  function formatMonthRangeLabel(visibleMonths) {
    if (!visibleMonths.length) return '';
    const first = new Date(visibleMonths[0]);
    const last  = new Date(visibleMonths[visibleMonths.length - 1]);
    return `${CESKE_MESICE[first.getMonth()]} ${first.getFullYear()} – ${CESKE_MESICE[last.getMonth()]} ${last.getFullYear()}`;
  }

  function renderKrajeMonthNav() {
    const nav = document.getElementById('ev-kraje-month-nav');
    if (!nav) return;

    if (!krajeAllMonths.length || krajeAllMonths.length <= 12) {
      nav.innerHTML = '';
      return;
    }

    const visible = krajeAllMonths.slice(krajeMonthPageStart, krajeMonthPageStart + 12);
    const totalPages = Math.ceil(krajeAllMonths.length / 12);
    const currentPage = Math.floor(krajeMonthPageStart / 12);

    const uniqueYears = Array.from(new Set(krajeAllMonths.map(m => (new Date(m)).getFullYear())));
    const rangeText = formatMonthRangeLabel(visible);

    const prevDisabled = currentPage === 0;
    const nextDisabled = currentPage >= totalPages - 1;

    let html = '';
    html += '<div class="ev-month-nav-row">';
    html += `<button id="ev-kraje-prev-12" ${prevDisabled ? 'disabled' : ''}>« 12 měsíců</button>`;
    html += `<span>${rangeText}</span>`;
    html += `<button id="ev-kraje-next-12" ${nextDisabled ? 'disabled' : ''}>12 měsíců »</button>`;
    html += '</div>';
    html += '<div class="ev-month-years"><span>Roky:</span>';

    const currentVisibleYear = (new Date(visible[0])).getFullYear();
    uniqueYears.forEach(y => {
      const active = (y === currentVisibleYear) ? ' ev-active-year' : '';
      html += `<button class="ev-kraje-year-btn${active}" data-year="${y}">${y}</button>`;
    });
    html += '</div>';

    nav.innerHTML = html;

    const prevBtn = document.getElementById('ev-kraje-prev-12');
    const nextBtn = document.getElementById('ev-kraje-next-12');
    if (prevBtn && !prevDisabled) {
      prevBtn.addEventListener('click', () => {
        krajeMonthPageStart = Math.max(0, krajeMonthPageStart - 12);
        updateKrajeTable();
      });
    }
    if (nextBtn && !nextDisabled) {
      nextBtn.addEventListener('click', () => {
        const maxStart = Math.max(0, (totalPages - 1) * 12);
        krajeMonthPageStart = Math.min(maxStart, krajeMonthPageStart + 12);
        updateKrajeTable();
      });
    }

    document.querySelectorAll('#ev-kraje-month-nav .ev-kraje-year-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const year = parseInt(this.getAttribute('data-year'), 10);
        if (!year) return;

        document.getElementById('ev-kraje-month-from').value = 1;
        document.getElementById('ev-kraje-year-from').value = year;
        document.getElementById('ev-kraje-month-to').value = 12;
        document.getElementById('ev-kraje-year-to').value = year;

        const from = `${year}-01-01`;
        const to   = `${year}-12-01`;
        document.getElementById('ev-kraje-from').value = from;
        document.getElementById('ev-kraje-to').value   = to;

        setError('');
        showLoading();
        loadKrajeData(from, to)
          .then(() => updateKrajeTable())
          .catch(err => {
            console.error(err);
            setError('Chyba při načítání krajů: ' + err.message);
          })
          .finally(hideLoading);
      });
    });
  }

  function updateKrajeTable() {
    const table = document.getElementById('ev-kraje-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!krajeAllMonths.length || !krajeRows.length) return;

    const visibleMonths = krajeAllMonths.slice(krajeMonthPageStart, krajeMonthPageStart + 12);

    const headRow = document.createElement('tr');
    const thName = document.createElement('th');
    thName.textContent = 'Kraj';
    headRow.appendChild(thName);

    visibleMonths.forEach(m => {
      const th = document.createElement('th');
      const d = new Date(m);
      th.textContent = CESKE_MESICE[d.getMonth()] || m;
      headRow.appendChild(th);
    });

    const thTotal = document.createElement('th');
    thTotal.textContent = 'Celkem';
    headRow.appendChild(thTotal);

    thead.appendChild(headRow);

    const colTotals = new Array(visibleMonths.length).fill(0);
    let grandTotal = 0;

    krajeRows.forEach(row => {
      const tr = document.createElement('tr');
      tr.dataset.krajName = row.krajName;

      const tdName = document.createElement('td');
      tdName.textContent = row.krajName;
      tr.appendChild(tdName);

      let rowSum = 0;

      visibleMonths.forEach((m, idx) => {
        const td = document.createElement('td');
        const val = row.values[m] != null ? Number(row.values[m]) : 0;
        td.textContent = val;
        rowSum += val;
        colTotals[idx] += val;
        grandTotal += val;
        tr.appendChild(td);
      });

      const tdSum = document.createElement('td');
      tdSum.textContent = rowSum;
      tr.appendChild(tdSum);

      tr.addEventListener('mouseover', () => tr.classList.add('ev-row-hover'));
      tr.addEventListener('mouseout', () => tr.classList.remove('ev-row-hover'));

      tr.addEventListener('click', () => handleKrajSelect(row));

      tbody.appendChild(tr);
    });

    const trTotal = document.createElement('tr');
    trTotal.classList.add('ev-total-row');

    const tdLabel = document.createElement('td');
    tdLabel.textContent = 'Celkem';
    trTotal.appendChild(tdLabel);

    visibleMonths.forEach((m, idx) => {
      const td = document.createElement('td');
      td.textContent = colTotals[idx];
      trTotal.appendChild(td);
    });

    const tdGrand = document.createElement('td');
    tdGrand.textContent = grandTotal;
    trTotal.appendChild(tdGrand);

    tbody.appendChild(trTotal);

    renderKrajeMonthNav();
  }

  let okresyAllMonths = [];
  let okresyRows = [];
  let okresyMonthPageStart = 0;

  async function loadOkresyData(krajSlug, from, to) {
    const url = `${OKRESY_API_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&kraj=${encodeURIComponent(krajSlug)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Chyba při volání API okresy: ' + res.status);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'API okresy vrátilo chybu');

    const items = data.items || [];
    const monthSet = new Set(items.map(i => i.month));
    const months = Array.from(monthSet).sort();

    const rowsByOkres = {};
    items.forEach(i => {
      const key = i.okres || '(neznámý okres)';
      if (!rowsByOkres[key]) {
        rowsByOkres[key] = {
          okresName: key,
          normOkres: normalizeName(key),
          values: {},
          total: 0
        };
      }
      rowsByOkres[key].values[i.month] = i.vehicles_count;
      rowsByOkres[key].total += Number(i.vehicles_count) || 0;
    });

    okresyAllMonths = months;
    okresyRows = Object.values(rowsByOkres).sort((a, b) => a.okresName.localeCompare(b.okresName));
    okresyMonthPageStart = 0;
  }

  function renderOkresyMonthNav() {
    const nav = document.getElementById('ev-okresy-month-nav');
    if (!nav) return;

    if (!okresyAllMonths.length || okresyAllMonths.length <= 12) {
      nav.innerHTML = '';
      return;
    }

    const visible = okresyAllMonths.slice(okresyMonthPageStart, okresyMonthPageStart + 12);
    const totalPages = Math.ceil(okresyAllMonths.length / 12);
    const currentPage = Math.floor(okresyMonthPageStart / 12);

    const uniqueYears = Array.from(new Set(okresyAllMonths.map(m => (new Date(m)).getFullYear())));
    const rangeText = formatMonthRangeLabel(visible);

    const prevDisabled = currentPage === 0;
    const nextDisabled = currentPage >= totalPages - 1;

    let html = '';
    html += '<div class="ev-month-nav-row">';
    html += `<button id="ev-okresy-prev-12" ${prevDisabled ? 'disabled' : ''}>« 12 měsíců</button>`;
    html += `<span>${rangeText}</span>`;
    html += `<button id="ev-okresy-next-12" ${nextDisabled ? 'disabled' : ''}>12 měsíců »</button>`;
    html += '</div>';
    html += '<div class="ev-month-years"><span>Roky:</span>';

    const currentVisibleYear = (new Date(visible[0])).getFullYear();
    uniqueYears.forEach(y => {
      const active = (y === currentVisibleYear) ? ' ev-active-year' : '';
      html += `<button class="ev-okresy-year-btn${active}" data-year="${y}">${y}</button>`;
    });
    html += '</div>';

    nav.innerHTML = html;

    const prevBtn = document.getElementById('ev-okresy-prev-12');
    const nextBtn = document.getElementById('ev-okresy-next-12');
    if (prevBtn && !prevDisabled) {
      prevBtn.addEventListener('click', () => {
        okresyMonthPageStart = Math.max(0, okresyMonthPageStart - 12);
        updateOkresyTable();
      });
    }
    if (nextBtn && !nextDisabled) {
      nextBtn.addEventListener('click', () => {
        const maxStart = Math.max(0, (totalPages - 1) * 12);
        okresyMonthPageStart = Math.min(maxStart, okresyMonthPageStart + 12);
        updateOkresyTable();
      });
    }

    document.querySelectorAll('#ev-okresy-month-nav .ev-okresy-year-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const year = parseInt(this.getAttribute('data-year'), 10);
        const idx = okresyAllMonths.findIndex(m => (new Date(m)).getFullYear() === year);
        if (idx >= 0) {
          okresyMonthPageStart = Math.floor(idx / 12) * 12;
          updateOkresyTable();
        }
      });
    });
  }

  function updateOkresyTable() {
    const section = document.getElementById('ev-okresy-section');
    const titleEl = document.getElementById('ev-okresy-title');
    const table   = document.getElementById('ev-okresy-table');
    const thead   = table.querySelector('thead');
    const tbody   = table.querySelector('tbody');

    if (!okresyRows.length) {
      section.style.display = 'none';
      titleEl.textContent = '';
      return;
    }

    section.style.display = 'block';
    titleEl.textContent = 'Okresy v kraji: ' + (selectedKrajSlug && KRAJ_CONFIG[selectedKrajSlug] ? KRAJ_CONFIG[selectedKrajSlug].name : '');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const visibleMonths = okresyAllMonths.slice(okresyMonthPageStart, okresyMonthPageStart + 12);

    const headRow = document.createElement('tr');
    const thName  = document.createElement('th');
    thName.textContent = 'Okres';
    headRow.appendChild(thName);

    visibleMonths.forEach(m => {
      const th = document.createElement('th');
      const d = new Date(m);
      th.textContent = CESKE_MESICE[d.getMonth()] || m;
      headRow.appendChild(th);
    });

    const thTotal = document.createElement('th');
    thTotal.textContent = 'Celkem';
    headRow.appendChild(thTotal);

    thead.appendChild(headRow);

    const colTotals = new Array(visibleMonths.length).fill(0);
    let grandTotal = 0;

    okresyRows.forEach(row => {
      const tr = document.createElement('tr');
      tr.dataset.okresName = row.okresName;
      tr.dataset.okresKey  = row.normOkres;

      const tdName = document.createElement('td');
      tdName.textContent = row.okresName;
      tr.appendChild(tdName);

      let rowSum = 0;

      visibleMonths.forEach((m, idx) => {
        const td = document.createElement('td');
        const val = row.values[m] != null ? Number(row.values[m]) : 0;
        td.textContent = val;
        rowSum += val;
        colTotals[idx] += val;
        grandTotal += val;
        tr.appendChild(td);
      });

      const tdSum = document.createElement('td');
      tdSum.textContent = rowSum;
      tr.appendChild(tdSum);

      tr.addEventListener('mouseover', () => tr.classList.add('ev-row-hover'));
      tr.addEventListener('mouseout', () => tr.classList.remove('ev-row-hover'));

      tr.addEventListener('click', () => handleOkresSelect(row));

      tbody.appendChild(tr);
    });

    const trTotal = document.createElement('tr');
    trTotal.classList.add('ev-total-row');

    const tdLabel = document.createElement('td');
    tdLabel.textContent = 'Celkem';
    trTotal.appendChild(tdLabel);

    visibleMonths.forEach((m, idx) => {
      const td = document.createElement('td');
      td.textContent = colTotals[idx];
      trTotal.appendChild(td);
    });

    const tdGrand = document.createElement('td');
    tdGrand.textContent = grandTotal;
    trTotal.appendChild(tdGrand);

    tbody.appendChild(trTotal);

    renderOkresyMonthNav();
  }

  async function loadAndRenderOkresy(krajSlug, from, to) {
    try {
      await loadOkresyData(krajSlug, from, to);
      updateOkresyTable();

      document.getElementById('ev-regmista-section').style.display = 'none';
      document.querySelector('#ev-regmista-table thead').innerHTML = '';
      document.querySelector('#ev-regmista-table tbody').innerHTML = '';
      document.getElementById('ev-regmista-month-nav').innerHTML = '';

      document.getElementById('ev-firmy-section').style.display = 'none';
      document.querySelector('#ev-firmy-table thead').innerHTML = '';
      document.querySelector('#ev-firmy-table tbody').innerHTML = '';
    } catch (err) {
      console.error(err);
      setError('Chyba při načítání okresů: ' + err.message);
    }
  }

  let regAllMonths = [];
  let regRows = [];
  let regMonthPageStart = 0;

  async function loadRegMistaData(krajSlug, okresName, from, to) {
    const url = `${REGM_API_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&kraj=${encodeURIComponent(krajSlug)}&okres=${encodeURIComponent(okresName)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Chyba při volání API reg. místa: ' + res.status);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'API reg. místa vrátilo chybu');

    const items = data.items || [];
    const monthSet = new Set(items.map(i => i.month));
    const months = Array.from(monthSet).sort();

    const rowsByMisto = {};
    items.forEach(i => {
      const key = i.registracni_misto || '(neznámé místo)';
      if (!rowsByMisto[key]) {
        rowsByMisto[key] = { misto: key, values: {}, total: 0 };
      }
      rowsByMisto[key].values[i.month] = i.vehicles_count;
      rowsByMisto[key].total += Number(i.vehicles_count) || 0;
    });

    regAllMonths = months;
    regRows = Object.values(rowsByMisto).sort((a, b) => a.misto.localeCompare(b.misto));
    regMonthPageStart = 0;
  }

  function renderRegMonthNav() {
    const nav = document.getElementById('ev-regmista-month-nav');
    if (!nav) return;

    if (!regAllMonths.length || regAllMonths.length <= 12) {
      nav.innerHTML = '';
      return;
    }

    const visible = regAllMonths.slice(regMonthPageStart, regMonthPageStart + 12);
    const totalPages = Math.ceil(regAllMonths.length / 12);
    const currentPage = Math.floor(regMonthPageStart / 12);

    const uniqueYears = Array.from(new Set(regAllMonths.map(m => (new Date(m)).getFullYear())));
    const rangeText = formatMonthRangeLabel(visible);

    const prevDisabled = currentPage === 0;
    const nextDisabled = currentPage >= totalPages - 1;

    let html = '';
    html += '<div class="ev-month-nav-row">';
    html += `<button id="ev-reg-prev-12" ${prevDisabled ? 'disabled' : ''}>« 12 měsíců</button>`;
    html += `<span>${rangeText}</span>`;
    html += `<button id="ev-reg-next-12" ${nextDisabled ? 'disabled' : ''}>12 měsíců »</button>`;
    html += '</div>';
    html += '<div class="ev-month-years"><span>Roky:</span>';

    const currentVisibleYear = (new Date(visible[0])).getFullYear();
    uniqueYears.forEach(y => {
      const active = (y === currentVisibleYear) ? ' ev-active-year' : '';
      html += `<button class="ev-reg-year-btn${active}" data-year="${y}">${y}</button>`;
    });
    html += '</div>';

    nav.innerHTML = html;

    const prevBtn = document.getElementById('ev-reg-prev-12');
    const nextBtn = document.getElementById('ev-reg-next-12');
    if (prevBtn && !prevDisabled) {
      prevBtn.addEventListener('click', () => {
        regMonthPageStart = Math.max(0, regMonthPageStart - 12);
        updateRegTable();
      });
    }
    if (nextBtn && !nextDisabled) {
      nextBtn.addEventListener('click', () => {
        const maxStart = Math.max(0, (totalPages - 1) * 12);
        regMonthPageStart = Math.min(maxStart, regMonthPageStart + 12);
        updateRegTable();
      });
    }

    document.querySelectorAll('#ev-regmista-month-nav .ev-reg-year-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const year = parseInt(this.getAttribute('data-year'), 10);
        const idx = regAllMonths.findIndex(m => (new Date(m)).getFullYear() === year);
        if (idx >= 0) {
          regMonthPageStart = Math.floor(idx / 12) * 12;
          updateRegTable();
        }
      });
    });
  }

  let firmyDetailItems = [];

  async function loadRegMistoDetail(krajSlug, okresName, regMistoName, from, to) {
    const params = new URLSearchParams({
      from,
      to,
      kraj: krajSlug,
      okres: okresName,
      registracni_misto: regMistoName
    });
    const url = `${REGM_DETAIL_API_URL}?` + params.toString();
    const res = await fetch(url);
    if (!res.ok) throw new Error('Chyba při volání API detailu firem: ' + res.status);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'API detailu firem vrátilo chybu');

    firmyDetailItems = data.items || [];
  }

  function openFirmDetailPage(item) {
    try {
      const filters = {
        from: document.getElementById('ev-kraje-from').value,
        to: document.getElementById('ev-kraje-to').value,
        kraj: selectedKrajSlug ? KRAJ_CONFIG[selectedKrajSlug].name : '',
        okres: selectedOkresName || '',
        registracniMisto: selectedRegMisto || ''
      };

      const payload = {
        generatedAt: Date.now(),
        filters,
        firma: {
          nazev: item.nazev_firmy || '',
          ico: item.ico_firmy || '',
          ulice: item.ulice_firmy || '',
          cislo_popisne: item.cislo_popisne || '',
          cislo_orientacni: item.cislo_orientacni || '',
          obec: item.obec || item.mesto || '',
          okres: item.okres || filters.okres,
          kraj: item.kraj || filters.kraj,
          typ_spolecnosti: item.forma_firmy || item.typ_spolecnosti || '',
          celkem_ev: Number(item.pocet_vozidel) || 0,
          latitude: item.latitude ?? item.lat ?? null,
          longitude: item.longitude ?? item.lng ?? null
        },
        vozidla: Array.isArray(item.vozidla) ? item.vozidla : []
      };

      const storageKey = `${FIRM_DETAIL_STORAGE_PREFIX}${payload.firma.ico || crypto.randomUUID?.() || Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(payload));
      window.open(`ev-firma-detail.html?dataKey=${encodeURIComponent(storageKey)}`, '_blank', 'noopener');
    } catch (err) {
      console.error('Nepodařilo se otevřít detail firmy', err);
      setError('Detail firmy se nepodařilo připravit. Zkuste to prosím znovu.');
    }
  }

  function updateFirmyTable() {
    const section = document.getElementById('ev-firmy-section');
    const title   = document.getElementById('ev-firmy-title');
    const table   = document.getElementById('ev-firmy-table');
    const thead   = table.querySelector('thead');
    const tbody   = table.querySelector('tbody');

    if (!firmyDetailItems.length) {
      section.style.display = 'none';
      title.textContent = '';
      thead.innerHTML = '';
      tbody.innerHTML = '';
      return;
    }

    section.style.display = 'block';
    title.textContent = `Firmy registrované v místě: ${selectedRegMisto || ''}`;

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const headRow = document.createElement('tr');
    ['Název firmy','Adresa firmy','IČO','Forma','Počet vozidel'].forEach(label => {
      const th = document.createElement('th');
      th.textContent = label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    let totalVehicles = 0;

    firmyDetailItems.forEach(item => {
      const tr = document.createElement('tr');
      tr.dataset.firmName = item.nazev_firmy || '';
      tr.dataset.firmIco = item.ico_firmy || '';

      const nazev  = item.nazev_firmy  || '';
      const adresa = item.adresa_firmy || '';
      const ico    = item.ico_firmy    || '';
      const forma  = item.forma_firmy  || '';
      const pocet  = Number(item.pocet_vozidel) || 0;

      [nazev, adresa, ico, forma, pocet].forEach(val => {
        const td = document.createElement('td');
        td.textContent = val;
        tr.appendChild(td);
      });

      totalVehicles += pocet;

      tr.addEventListener('mouseover', () => tr.classList.add('ev-row-hover'));
      tr.addEventListener('mouseout', () => tr.classList.remove('ev-row-hover'));
      tr.addEventListener('click', () => openFirmDetailPage(item));

      tbody.appendChild(tr);
    });

    const trTotal = document.createElement('tr');
    trTotal.classList.add('ev-total-row');

    const tdLabel = document.createElement('td');
    tdLabel.textContent = 'Celkem';
    trTotal.appendChild(tdLabel);

    trTotal.appendChild(document.createElement('td'));
    trTotal.appendChild(document.createElement('td'));
    trTotal.appendChild(document.createElement('td'));

    const tdTotal = document.createElement('td');
    tdTotal.textContent = totalVehicles;
    trTotal.appendChild(tdTotal);

    tbody.appendChild(trTotal);

    const headerOffset = 120;
    const rect = section.getBoundingClientRect();
    const offsetTop = rect.top + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }

  function updateRegTable() {
    const section = document.getElementById('ev-regmista-section');
    const title   = document.getElementById('ev-regmista-title');
    const table   = document.getElementById('ev-regmista-table');
    const thead   = table.querySelector('thead');
    const tbody   = table.querySelector('tbody');

    if (!regRows.length) {
      section.style.display = 'none';
      title.textContent = '';
      return;
    }

    section.style.display = 'block';
    title.textContent = 'Registrační místa v okrese: ' + (selectedOkresName || '');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const visibleMonths = regAllMonths.slice(regMonthPageStart, regMonthPageStart + 12);

    const headRow = document.createElement('tr');
    const thName  = document.createElement('th');
    thName.textContent = 'Registrační místo';
    headRow.appendChild(thName);

    visibleMonths.forEach(m => {
      const th = document.createElement('th');
      const d = new Date(m);
      th.textContent = CESKE_MESICE[d.getMonth()] || m;
      headRow.appendChild(th);
    });

    const thTotal = document.createElement('th');
    thTotal.textContent = 'Celkem';
    headRow.appendChild(thTotal);

    thead.appendChild(headRow);

    const colTotals = new Array(visibleMonths.length).fill(0);
    let grandTotal = 0;

    regRows.forEach(row => {
      const tr = document.createElement('tr');
      tr.dataset.regMistoName = row.misto;

      const tdName = document.createElement('td');
      tdName.textContent = row.misto;
      tr.appendChild(tdName);

      let rowSum = 0;

      visibleMonths.forEach((m, idx) => {
        const td = document.createElement('td');
        const val = row.values[m] != null ? Number(row.values[m]) : 0;
        td.textContent = val;
        rowSum += val;
        colTotals[idx] += val;
        grandTotal += val;
        tr.appendChild(td);
      });

      const tdSum = document.createElement('td');
      tdSum.textContent = rowSum;
      tr.appendChild(tdSum);

      tr.addEventListener('mouseover', () => tr.classList.add('ev-row-hover'));
      tr.addEventListener('mouseout', () => tr.classList.remove('ev-row-hover'));

      tr.addEventListener('click', () => handleRegMistoSelect(row));

      tbody.appendChild(tr);
    });

    const trTotal = document.createElement('tr');
    trTotal.classList.add('ev-total-row');

    const tdLabel = document.createElement('td');
    tdLabel.textContent = 'Celkem';
    trTotal.appendChild(tdLabel);

    visibleMonths.forEach((m, idx) => {
      const td = document.createElement('td');
      td.textContent = colTotals[idx];
      trTotal.appendChild(td);
    });

    const tdGrand = document.createElement('td');
    tdGrand.textContent = grandTotal;
    trTotal.appendChild(tdGrand);

    tbody.appendChild(trTotal);

    renderRegMonthNav();
  }

  async function loadAndRenderRegMista(krajSlug, okresName, from, to) {
    try {
      await loadRegMistaData(krajSlug, okresName, from, to);
      updateRegTable();

      firmyDetailItems = [];
      updateFirmyTable();
    } catch (err) {
      console.error(err);
      setError('Chyba při načítání registračních míst: ' + err.message);
    }
  }

  function handleKrajSelect(row) {
    document.querySelectorAll('#ev-kraje-table tbody tr').forEach(r => {
      r.classList.remove('ev-row-selected');
    });
    const tr = document.querySelector(`#ev-kraje-table tbody tr[data-kraj-name="${row.krajName}"]`);
    if (tr) tr.classList.add('ev-row-selected');

    const slug = row.slug;
    if (!slug) {
      setError(`Pro kraj "${row.krajName}" není v KRAJ_CONFIG definovaný slug.`);
      return;
    }
    selectedKrajSlug = slug;
    selectedOkresName = null;
    selectedRegMisto = null;
    firmyDetailItems = [];
    updateFirmyTable();

    krajLayersBySlug.forEach((layer, s) => {
      if (s === slug) selectLayer(layer);
      else resetLayer(layer);
    });

    const from = document.getElementById('ev-kraje-from').value;
    const to   = document.getElementById('ev-kraje-to').value;

    const labelEl = document.getElementById('ev-kraje-section-label');
    if (labelEl) {
      labelEl.textContent = krajeYearsLabel
        ? `${row.krajName} · ${krajeYearsLabel}`
        : row.krajName;
    }

    setError('');
    showLoading();
    Promise.all([
      loadOkresyGeojsonForKraj(slug),
      loadAndRenderOkresy(slug, from, to)
    ])
      .then(() => {
        renderOkresyCitiesForKraj(slug);
      })
      .finally(hideLoading);

    const okresSection = document.getElementById('ev-okresy-section');
    if (okresSection) {
      okresSection.style.display = 'block';
      collapseSection('ev-okresy-section', false);
    }
    collapseSection('ev-kraje-section', true);
  }

  function handleOkresSelect(row) {
    document.querySelectorAll('#ev-okresy-table tbody tr').forEach(r => {
      r.classList.remove('ev-row-selected');
    });
    const tr = document.querySelector(`#ev-okresy-table tbody tr[data-okres-name="${row.okresName}"]`);
    if (tr) tr.classList.add('ev-row-selected');

    selectedOkresName = row.okresName;
    selectedRegMisto = null;
    firmyDetailItems = [];
    updateFirmyTable();

    focusOkresOnMap(row.normOkres);

    const from = document.getElementById('ev-kraje-from').value;
    const to   = document.getElementById('ev-kraje-to').value;

    showLoading();
    loadAndRenderRegMista(selectedKrajSlug, row.okresName, from, to).finally(hideLoading);

    const regSection = document.getElementById('ev-regmista-section');
    if (regSection) {
      regSection.style.display = 'block';
      collapseSection('ev-regmista-section', false);

      const headerOffset = 120;
      const rect = regSection.getBoundingClientRect();
      const offsetTop = rect.top + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    collapseSection('ev-okresy-section', true);
  }

  async function handleRegMistoSelect(row) {
    document.querySelectorAll('#ev-regmista-table tbody tr').forEach(r => {
      r.classList.remove('ev-row-selected');
    });
    const tr = document.querySelector(`#ev-regmista-table tbody tr[data-reg-misto-name="${row.misto}"]`);
    if (tr) tr.classList.add('ev-row-selected');

    selectedRegMisto = row.misto;

    const from = document.getElementById('ev-kraje-from').value;
    const to   = document.getElementById('ev-kraje-to').value;

    if (!selectedKrajSlug || !selectedOkresName) {
      return;
    }

    setError('');
    showLoading();
    try {
      await loadRegMistoDetail(selectedKrajSlug, selectedOkresName, selectedRegMisto, from, to);
      updateFirmyTable();
    } catch (err) {
      console.error(err);
      setError('Chyba při načítání firem: ' + err.message);
    } finally {
      hideLoading();
    }
  }

  function initCollapsibles() {
    document.querySelectorAll('.ev-table-wrapper').forEach(wrapper => {
      const title = wrapper.querySelector('.ev-section-title');
      if (!title) return;
      title.addEventListener('click', () => {
        wrapper.classList.toggle('collapsed');
      });
    });
  }

  function initPage() {
    initMonthYearSelectors();
    initMap();
    initCollapsibles();

    const btn = document.getElementById('ev-kraje-reload');
    if (btn) {
      btn.addEventListener('click', async function() {
        const range = getRange();
        if (!range) return;
        setError('');
        selectedKrajSlug = null;
        selectedOkresName = null;
        selectedRegMisto = null;
        firmyDetailItems = [];
        updateFirmyTable();

        document.getElementById('ev-okresy-section').style.display = 'none';
        document.getElementById('ev-regmista-section').style.display = 'none';

        showLoading();
        try {
          await loadKrajeData(range.from, range.to);
          updateKrajeTable();
          loadKrajeGeojson();
          renderKrajeCities();
          collapseSection('ev-kraje-section', false);
        } catch (err) {
          console.error(err);
          setError('Chyba při načítání krajů: ' + err.message);
        } finally {
          hideLoading();
        }
      });
    }

    const range = getRange();
    if (range) {
      showLoading();
      loadKrajeData(range.from, range.to)
        .then(() => {
          updateKrajeTable();
          collapseSection('ev-kraje-section', false);
        })
        .catch(err => {
          console.error(err);
          setError('Chyba při načítání krajů: ' + err.message);
        })
        .finally(hideLoading);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }
})();
