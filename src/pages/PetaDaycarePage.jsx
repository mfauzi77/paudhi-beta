import { useEffect, useRef, useState } from 'react';
import { Filter, Info, MapPin, RefreshCw, Search, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiService from '../utils/apiService';
import { useAuth } from './contexts/AuthContext';

const INDONESIA_BOUNDS = [
  [-11.5, 94],
  [6.5, 142],
];
function formatSyncTime(value) {
  if (!value) return 'Belum tersinkron';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function addLocationMarker(map, layer, location, onSelect) {
  const coordinates = [Number(location.latitude), Number(location.longitude)];
  const icon = L.divIcon({
    className: 'daycare-map-pin',
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42" aria-hidden="true"><path d="M17 1C8.2 1 1 8.2 1 17c0 11.1 16 24 16 24s16-12.9 16-24C33 8.2 25.8 1 17 1Z" fill="#2563eb" stroke="#fff" stroke-width="2"/><circle cx="17" cy="17" r="5" fill="#fff"/></svg>',
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    tooltipAnchor: [0, -36],
  });
  const marker = L.marker(coordinates, { icon, riseOnHover: true }).addTo(layer);
  marker.bindTooltip(location.location_name);
  marker.on('click', () => {
    onSelect(location);
    map.flyTo(coordinates, 11, { duration: 0.8 });
  });
}

export default function PetaDaycarePage() {
  const { user } = useAuth();
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [summary, setSummary] = useState(null);
  const [syncInfo, setSyncInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState('');
  const [selectedKelurahan, setSelectedKelurahan] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const canSync = ['admin', 'super_admin', 'admin_utama'].includes(user?.role);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return undefined;

    const map = L.map(mapElementRef.current, {
      zoomControl: false,
      preferCanvas: true,
      scrollWheelZoom: true,
      minZoom: 4,
      maxZoom: 18,
      maxBounds: L.latLngBounds(INDONESIA_BOUNDS),
      maxBoundsViscosity: 1,
      worldCopyJump: false,
      attributionControl: false,
    });

    map.fitBounds(INDONESIA_BOUNDS, { padding: [12, 12] });
    L.control.attribution({ prefix: false }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(mapElementRef.current);
    requestAnimationFrame(() => {
      map.invalidateSize();
      map.fitBounds(INDONESIA_BOUNDS, { padding: [12, 12] });
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
      markerLayerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const result = await apiService.request('/daycare/sync', { method: 'POST' });
      const locationsResponse = await apiService.request('/daycare/locations');
      setLocations(Array.isArray(locationsResponse.data) ? locationsResponse.data : []);
      setSummary(locationsResponse.summary || null);
      setSyncInfo(locationsResponse.sync || null);
      setLoadError('');
      setSyncMessage(`Sinkronisasi selesai: ${result.data.mappedRows} dari ${result.data.sourceRows} lokasi terpetakan; ${result.data.formulaRows} koordinat berupa formula, ${result.data.invalidRows} tidak valid, dan ${result.data.missingRows} kosong.`);
    } catch (error) {
      setSyncMessage(error.message || 'Sinkronisasi gagal. Coba lagi setelah memeriksa backend.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadLocations = async () => {
      try {
        const response = await apiService.request('/daycare/locations');
        if (!active) return;
        setLocations(Array.isArray(response.data) ? response.data : []);
        setSummary(response.summary || null);
        setSyncInfo(response.sync || null);
        setLoadError('');
      } catch (error) {
        if (!active) return;
        setLoadError(error.message || 'Data peta belum dapat dimuat.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLocations();
    const timer = window.setInterval(loadLocations, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) return;
    const layer = markerLayerRef.current;
    layer.clearLayers();
    locations.forEach((location) => addLocationMarker(mapRef.current, layer, location, setSelectedLocation));
  }, [locations]);

  const mappedCount = summary?.mapped_rows ?? locations.length;
  const orderedLocations = [...locations].sort((a, b) => {
    const numberA = Number(a.sheet_no);
    const numberB = Number(b.sheet_no);
    const orderA = Number.isFinite(numberA) && a.sheet_no !== '' ? numberA : Number(a.source_row) - 1;
    const orderB = Number.isFinite(numberB) && b.sheet_no !== '' ? numberB : Number(b.source_row) - 1;
    return orderA - orderB;
  });
  const provinces = [...new Set(orderedLocations.map((location) => location.provinsi).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'id-ID'));
  const kabupatenOptions = [...new Set(orderedLocations
    .filter((location) => !selectedProvince || location.provinsi === selectedProvince)
    .map((location) => location.kabupaten)
    .filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'id-ID'));
  const kelurahanOptions = [...new Set(orderedLocations
    .filter((location) => (!selectedProvince || location.provinsi === selectedProvince)
      && (!selectedKabupaten || location.kabupaten === selectedKabupaten))
    .map((location) => location.kelurahan)
    .filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'id-ID'));
  const normalizedNameSearch = nameSearch.trim().toLocaleLowerCase('id-ID');
  const normalizedAddressSearch = addressSearch.trim().toLocaleLowerCase('id-ID');
  const filteredLocations = orderedLocations.filter((location) => {
    const matchesName = !normalizedNameSearch
      || String(location.location_name || '').toLocaleLowerCase('id-ID').includes(normalizedNameSearch);
    const matchesAddress = !normalizedAddressSearch
      || String(location.address || '').toLocaleLowerCase('id-ID').includes(normalizedAddressSearch);
    return matchesName
      && matchesAddress
      && (!selectedProvince || location.provinsi === selectedProvince)
      && (!selectedKabupaten || location.kabupaten === selectedKabupaten)
      && (!selectedKelurahan || location.kelurahan === selectedKelurahan);
  });
  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / pageSize));
  const pageLocations = filteredLocations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [nameSearch, addressSearch, selectedProvince, selectedKabupaten, selectedKelurahan]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const focusLocationFromTable = (location) => {
    setSelectedLocation(location);
    if (mapRef.current) {
      mapRef.current.flyTo([Number(location.latitude), Number(location.longitude)], 11, { duration: 0.8 });
    }
    mapElementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
              Sebaran layanan
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Peta Sebaran Daycare
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Data lokasi dibaca dari tab Filter Data dan diperbarui otomatis setiap 15 menit.
            </p>
          </div>
          <div className="flex flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={!canSync || syncing}
              title={canSync ? 'Sinkronkan data daycare.' : 'Masuk dengan akun admin untuk menyinkronkan data.'}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Menyinkronkan…' : 'Sinkronkan data'}
            </button>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold leading-none text-slate-900">{mappedCount}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Lokasi terpetakan</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Filter Data</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="block text-sm font-medium text-slate-700">
                Nama
                <span className="relative mt-1.5 block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={nameSearch}
                    onChange={(event) => setNameSearch(event.target.value)}
                    placeholder="Cari nama daycare"
                    className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    aria-label="Filter berdasarkan nama daycare"
                  />
                </span>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Alamat
                <span className="relative mt-1.5 block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={addressSearch}
                    onChange={(event) => setAddressSearch(event.target.value)}
                    placeholder="Cari alamat"
                    className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    aria-label="Filter berdasarkan alamat"
                  />
                </span>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Provinsi
                <select
                  value={selectedProvince}
                  onChange={(event) => {
                    setSelectedProvince(event.target.value);
                    setSelectedKabupaten('');
                    setSelectedKelurahan('');
                  }}
                  className="mt-1.5 h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Semua Provinsi</option>
                  {provinces.map((province) => <option key={province} value={province}>{province}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Kabupaten/Kota
                <select
                  value={selectedKabupaten}
                  onChange={(event) => {
                    setSelectedKabupaten(event.target.value);
                    setSelectedKelurahan('');
                  }}
                  className="mt-1.5 h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Semua Kabupaten/Kota</option>
                  {kabupatenOptions.map((kabupaten) => <option key={kabupaten} value={kabupaten}>{kabupaten}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Kelurahan
                <select
                  value={selectedKelurahan}
                  onChange={(event) => setSelectedKelurahan(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Semua Kelurahan</option>
                  {kelurahanOptions.map((kelurahan) => <option key={kelurahan} value={kelurahan}>{kelurahan}</option>)}
                </select>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Daftar lokasi di peta</h2>
              <p className="mt-1 text-sm text-slate-500">Pilih baris untuk melihat titiknya pada peta.</p>
            </div>
            <p className="text-sm text-slate-500">{filteredLocations.length} lokasi ditemukan</p>
          </div>
          <div className="max-h-[560px] overflow-auto">
            <table className="min-w-[1600px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-[1] bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">No.</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Nama</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Alamat</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Kelurahan</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Kabupaten/Kota</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Provinsi</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Memiliki Izin Layanan</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Memiliki Izin Operasional</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Jenis Izin Layanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageLocations.map((location) => {
                  const selected = selectedLocation?.source_row === location.source_row;
                  return (
                    <tr
                      key={location.source_row}
                      onClick={() => focusLocationFromTable(location)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          focusLocationFromTable(location);
                        }
                      }}
                      tabIndex={0}
                      aria-label={`Lihat ${location.location_name} pada peta`}
                      className={`cursor-pointer transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${selected ? 'bg-blue-50' : ''}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">{location.sheet_no || Number(location.source_row) - 1}</td>
                      <th scope="row" className="min-w-52 px-4 py-3 font-semibold text-slate-900">{location.location_name}</th>
                      <td className="max-w-sm px-4 py-3 text-slate-600">{location.address || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{location.kelurahan || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{location.kabupaten || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{location.provinsi || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{location.izin_usaha || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{location.izin_operasional || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{location.jenis_izin || '—'}</td>
                    </tr>
                  );
                })}
                {filteredLocations.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                      {locations.length ? 'Tidak ada lokasi yang cocok dengan pencarian.' : 'Belum ada lokasi dengan koordinat valid.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>
              Menampilkan {filteredLocations.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredLocations.length)} dari {filteredLocations.length} lokasi ditemukan ({locations.length} lokasi berkoordinat valid).
            </span>
            <nav className="flex items-center gap-2" aria-label="Navigasi halaman tabel lokasi">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span className="whitespace-nowrap text-sm">Halaman {currentPage} dari {totalPages}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </nav>
          </div>
        </section>
        <section className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
              <RefreshCw className={`h-4 w-4 shrink-0 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm text-slate-500">
                {syncInfo?.lastSyncedAt
                  ? `Terakhir disinkronkan ${formatSyncTime(syncInfo.lastSyncedAt)}`
                  : 'Menunggu sinkronisasi pertama dari spreadsheet'}
              </span>
            </div>
            {loadError && (
              <p className="border-b border-slate-100 px-4 py-2 text-sm text-rose-700 sm:px-5" role="alert">
                {loadError}
              </p>
            )}
            {syncMessage && (
              <p className={`border-b border-slate-100 px-4 py-2 text-sm sm:px-5 ${syncMessage.includes('gagal') ? 'text-rose-700' : 'text-emerald-700'}`} role="status">
                {syncMessage}
              </p>
            )}
            <div
              ref={mapElementRef}
              className="h-[58vh] min-h-[420px] w-full bg-slate-100"
              style={{ height: '58vh', minHeight: 420, width: '100%' }}
              aria-label="Peta Indonesia dengan titik daycare"
            />
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedLocation ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLocation(null)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Tutup detail lokasi"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-blue-700">Detail lokasi</p>
                <h2 className="mt-1 text-lg font-semibold leading-6 text-slate-900">{selectedLocation.location_name}</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Alamat</dt>
                    <dd className="mt-1 leading-5 text-slate-800">{selectedLocation.address || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Kelurahan · Kecamatan</dt>
                    <dd className="mt-1 text-slate-800">{[selectedLocation.kelurahan, selectedLocation.kecamatan].filter(Boolean).join(' · ') || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Kabupaten · Provinsi</dt>
                    <dd className="mt-1 text-slate-800">{[selectedLocation.kabupaten, selectedLocation.provinsi].filter(Boolean).join(' · ') || '—'}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Memiliki Izin Layanan</dt>
                      <dd className="mt-1 text-slate-800">{selectedLocation.izin_usaha || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Memiliki Izin Operasional</dt>
                      <dd className="mt-1 text-slate-800">{selectedLocation.izin_operasional || '—'}</dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Jenis Izin Layanan</dt>
                    <dd className="mt-1 text-slate-800">{selectedLocation.jenis_izin || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Koordinat</dt>
                    <dd className="mt-1 font-mono text-xs text-slate-700">{Number(selectedLocation.latitude).toFixed(6)}, {Number(selectedLocation.longitude).toFixed(6)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Info className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Detail lokasi</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Klik ikon pin pada peta untuk melihat nama, alamat, wilayah, informasi izin, dan koordinatnya di sini.</p>
              </>
            )}

          </aside>
        </section>

      </div>
    </main>
  );
}
