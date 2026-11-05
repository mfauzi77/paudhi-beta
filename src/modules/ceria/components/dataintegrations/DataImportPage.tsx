import React, { useState } from 'react';

interface DataImportPageProps {
  title: string;
  templatePath: string; // public path to template CSV
  endpoint: string; // backend API endpoint to POST data
  description?: string;
}

const DataImportPage: React.FC<DataImportPageProps> = ({ title, templatePath, endpoint, description }) => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [manualNama, setManualNama] = useState('');
  const [manualKabupaten, setManualKabupaten] = useState('');
  const [manualAngka, setManualAngka] = useState('');

  const handleDownloadTemplate = () => {
    window.open(templatePath, '_blank');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatus('');
    try {
      const text = await file.text();
      const payload = { csv: text };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Upload failed');
      }
      setStatus('Import berhasil.');
    } catch (err: any) {
      setStatus(`Gagal import: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNama || !manualKabupaten || manualAngka === '') {
      setStatus('Isi semua kolom manual terlebih dahulu.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(endpoint.replace('/import/', '/manual/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: manualNama, kabupaten: manualKabupaten, angka: Number(manualAngka) })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Gagal simpan manual');
      }
      setStatus('Data manual tersimpan.');
      setManualNama('');
      setManualKabupaten('');
      setManualAngka('');
    } catch (err: any) {
      setStatus(`Gagal simpan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      {description && (<p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{description}</p>)}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={handleDownloadTemplate} className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded">Unduh Template</button>
        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
          {loading ? 'Mengunggah...' : 'Pilih File'}
          <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      {status && (<div className="text-sm mt-2">{status}</div>)}
      <div className="mt-6 p-4 rounded bg-slate-100 dark:bg-slate-800">
        <p className="text-sm">Format: CSV dengan header: <code>nama,kabupaten,angka</code>. Satu baris per wilayah.</p>
      </div>

      <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
        <h2 className="text-lg font-semibold mb-3">Input Manual</h2>
        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={manualNama} onChange={e => setManualNama(e.target.value)} placeholder="nama" className="px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
          <input value={manualKabupaten} onChange={e => setManualKabupaten(e.target.value)} placeholder="kabupaten" className="px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
          <input value={manualAngka} onChange={e => setManualAngka(e.target.value)} placeholder="angka" type="number" step="any" className="px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
          <div className="sm:col-span-3">
            <button disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded">Simpan Manual</button>
          </div>
        </form>
      </div>

      <ManualList endpoint={endpoint.replace('/import/', '/manual/')} />
    </div>
  );
};

export default DataImportPage;

const ManualList: React.FC<{ endpoint: string }> = ({ endpoint }) => {
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [data, setData] = React.useState<{ total: number; items: any[] } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = `${endpoint}?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal memuat data');
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [endpoint, q, page, pageSize]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-3">Data Manual Tersimpan</h2>
      <div className="flex gap-2 mb-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari nama/kabupaten" className="px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex-1" />
        <button onClick={() => { setPage(1); load(); }} className="px-3 py-2 rounded bg-slate-200 dark:bg-slate-700">Cari</button>
      </div>
      {loading ? <div className="text-sm">Memuat...</div> : (
        <div className="overflow-auto border border-slate-200 dark:border-slate-700 rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="text-left px-3 py-2">Nama</th>
                <th className="text-left px-3 py-2">Kabupaten</th>
                <th className="text-left px-3 py-2">Angka</th>
                <th className="text-left px-3 py-2">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((it, idx) => (
                <tr key={idx} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2">{it.nama}</td>
                  <td className="px-3 py-2">{it.kabupaten}</td>
                  <td className="px-3 py-2">{it.angka}</td>
                  <td className="px-3 py-2">{it.createdAt ? new Date(it.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {(!data || data.items.length === 0) && (
                <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-500">Belum ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-2 rounded bg-slate-200 dark:bg-slate-700 disabled:opacity-50">Sebelumnya</button>
        <div className="text-xs text-slate-600 dark:text-slate-300">Halaman {page} dari {data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1}</div>
        <button disabled={data ? page >= Math.ceil(data.total / pageSize) : true} onClick={() => setPage(p => p + 1)} className="px-3 py-2 rounded bg-slate-200 dark:bg-slate-700 disabled:opacity-50">Berikutnya</button>
      </div>
    </div>
  );
};


