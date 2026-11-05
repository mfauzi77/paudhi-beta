const pool = require('../dbPostgres');

const DEFAULT_SHEET_ID = '1MuY9Me-sRMlZxuoHOuDrZxw7zhvKyrtE0hdVF_VJkSo';
const DEFAULT_SHEET_GID = '925388625';
const SYNC_INTERVAL_MS = Math.max(60_000, Number(process.env.DAYCARE_SYNC_INTERVAL_MS || 15 * 60 * 1000));
const CSV_BATCH_SIZE = 250;

let schemaPromise;
let activeSync;

function parseCsv(csv) {
  const text = String(csv || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"' && value.length === 0) {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
}

function parseCoordinatePair(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return { latitude: null, longitude: null, status: 'missing' };
  if (raw.startsWith('=')) return { latitude: null, longitude: null, status: 'formula' };

  const makeResult = (first, second) => {
    const candidates = [
      [Number(first), Number(second)],
      [Number(second), Number(first)],
    ];
    const valid = candidates.find(([latitude, longitude]) => isValidCoordinates(latitude, longitude));
    return valid
      ? { latitude: valid[0], longitude: valid[1], status: 'mapped' }
      : null;
  };

  const labeledLatitude = raw.match(/\b(?:lat|latitude)\s*[:=]?\s*([+-]?\d+(?:[.,]\d+)?)/i);
  const labeledLongitude = raw.match(/\b(?:lon|lng|longitude)\s*[:=]?\s*([+-]?\d+(?:[.,]\d+)?)/i);
  if (labeledLatitude && labeledLongitude) {
    const labeledResult = makeResult(labeledLatitude[1].replace(',', '.'), labeledLongitude[1].replace(',', '.'));
    if (labeledResult) return labeledResult;
  }

  // A semicolon separates coordinates unambiguously when the spreadsheet uses
  // decimal commas, for example: -6,2; 106,8.
  const semicolonPair = raw.match(/^\s*([+-]?\d+(?:[.,]\d+)?)\s*;\s*([+-]?\d+(?:[.,]\d+)?)\s*$/);
  if (semicolonPair) {
    const semicolonResult = makeResult(semicolonPair[1].replace(',', '.'), semicolonPair[2].replace(',', '.'));
    if (semicolonResult) return semicolonResult;
  }

  const whitespacePair = raw.match(/^\s*([+-]?\d+(?:[.,]\d+)?)\s+([+-]?\d+(?:[.,]\d+)?)\s*$/);
  if (whitespacePair) {
    const whitespaceResult = makeResult(whitespacePair[1].replace(',', '.'), whitespacePair[2].replace(',', '.'));
    if (whitespaceResult) return whitespaceResult;
  }

  const decimalPairs = raw.matchAll(/([+-]?\d+(?:\.\d+)?)\s*[,;]\s*([+-]?\d+(?:\.\d+)?)/g);
  for (const pair of decimalPairs) {
    const result = makeResult(pair[1], pair[2]);
    if (result) return result;
  }

  const axes = [...raw.matchAll(/(\d+(?:[.,]\d+)?)\s*[°º]\s*(?:(\d+(?:[.,]\d+)?)\s*['’′]\s*)?(?:(\d+(?:[.,]\d+)?)\s*["”″]?\s*)?([NSEW])/gi)];
  if (axes.length >= 2) {
    const toDecimal = (axis) => {
      const degrees = Number(axis[1].replace(',', '.'));
      const minutes = Number((axis[2] || '0').replace(',', '.'));
      const seconds = Number((axis[3] || '0').replace(',', '.'));
      const magnitude = degrees + minutes / 60 + seconds / 3600;
      return axis[4].toUpperCase() === 'S' || axis[4].toUpperCase() === 'W' ? -magnitude : magnitude;
    };
    const latitudeAxis = axes.find((axis) => /[NS]/i.test(axis[4])) || axes[0];
    const longitudeAxis = axes.find((axis) => /[EW]/i.test(axis[4])) || axes[1];
    const latitude = toDecimal(latitudeAxis);
    const longitude = toDecimal(longitudeAxis);
    if (isValidCoordinates(latitude, longitude)) return { latitude, longitude, status: 'mapped' };
  }

  return { latitude: null, longitude: null, status: 'invalid' };
}

function isValidCoordinates(latitude, longitude) {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -11.5 && latitude <= 6.5
    && longitude >= 94 && longitude <= 142;
}

function normalizeHeader(header) {
  return String(header || '').trim().toLocaleLowerCase('id-ID');
}

function getCell(row, columns, header) {
  const index = columns.get(normalizeHeader(header));
  return index === undefined ? '' : String(row[index] ?? '').trim();
}

function getCellFromAliases(row, columns, aliases) {
  for (const alias of aliases) {
    const index = columns.get(normalizeHeader(alias));
    if (index !== undefined) return String(row[index] ?? '').trim();
  }
  return '';
}

async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS daycare_locations (
        source_row INTEGER PRIMARY KEY,
        sheet_no TEXT,
        location_name TEXT NOT NULL,
        address TEXT NOT NULL DEFAULT '',
        kelurahan TEXT NOT NULL DEFAULT '',
        kecamatan TEXT NOT NULL DEFAULT '',
        kabupaten TEXT NOT NULL DEFAULT '',
        provinsi TEXT NOT NULL DEFAULT '',
        izin_usaha TEXT NOT NULL DEFAULT '',
        izin_operasional TEXT NOT NULL DEFAULT '',
        jenis_izin TEXT NOT NULL DEFAULT '',
        coordinate_raw TEXT NOT NULL DEFAULT '',
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        coordinate_status TEXT NOT NULL DEFAULT 'missing',
        synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS daycare_locations_coordinates_idx
        ON daycare_locations (latitude, longitude)
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
      CREATE TABLE IF NOT EXISTS daycare_sheet_sync_state (
        id SMALLINT PRIMARY KEY CHECK (id = 1),
        last_synced_at TIMESTAMPTZ,
        source_rows INTEGER NOT NULL DEFAULT 0,
        mapped_rows INTEGER NOT NULL DEFAULT 0,
        formula_rows INTEGER NOT NULL DEFAULT 0,
        invalid_rows INTEGER NOT NULL DEFAULT 0,
        missing_rows INTEGER NOT NULL DEFAULT 0,
        last_error TEXT
      );
    `).catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

function buildRecords(csv) {
  const csvRows = parseCsv(csv);
  if (csvRows.length < 2) throw new Error('Google Sheet tidak memiliki baris data.');

  const columns = new Map(csvRows[0].map((header, index) => [normalizeHeader(header), index]));
  const requiredHeaders = [
    { label: 'Nama', aliases: ['Nama', 'Nama Pengasuhan Sementara'] },
    { label: 'Alamat', aliases: ['Alamat'] },
    { label: 'KOORDINAT', aliases: ['KOORDINAT', 'Koordinat'] },
  ];
  const missingHeaders = requiredHeaders
    .filter(({ aliases }) => !aliases.some((alias) => columns.has(normalizeHeader(alias))))
    .map(({ label }) => label);
  if (missingHeaders.length) throw new Error(`Kolom wajib tidak ditemukan: ${missingHeaders.join(', ')}`);

  const records = csvRows.slice(1).map((row, index) => {
    const coordinateRaw = getCell(row, columns, 'KOORDINAT');
    const coordinates = parseCoordinatePair(coordinateRaw);
    return {
      sourceRow: index + 2,
      sheetNo: getCell(row, columns, 'No.'),
      name: getCellFromAliases(row, columns, ['Nama', 'Nama Pengasuhan Sementara']),
      address: getCell(row, columns, 'Alamat'),
      kelurahan: getCell(row, columns, 'Kelurahan') || String(row[4] ?? '').trim(),
      kecamatan: getCell(row, columns, 'Kecamatan'),
      kabupaten: getCellFromAliases(row, columns, ['Kabupaten/Kota', 'Kabupaten', 'Kota']),
      provinsi: getCell(row, columns, 'Provinsi'),
      izinUsaha: getCellFromAliases(row, columns, ['Memiliki Izin Layanan', 'Izin Usaha']),
      izinOperasional: getCellFromAliases(row, columns, ['Memiliki Izin Operasional', 'Izin Operasional']),
      jenisIzin: getCellFromAliases(row, columns, ['Jenis Izin Layanan', 'Jenis Izin']),
      coordinateRaw,
      ...coordinates,
    };
  }).filter((record) => record.name);

  if (!records.length) throw new Error('Google Sheet tidak berisi nama lokasi.');
  return records;
}

async function fetchSheetCsv() {
  const sheetId = process.env.DAYCARE_GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
  const sheetGid = process.env.DAYCARE_GOOGLE_SHEET_GID || DEFAULT_SHEET_GID;
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&gid=${encodeURIComponent(sheetGid)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000), cache: 'no-store' });
  if (!response.ok) throw new Error(`Google Sheet mengembalikan HTTP ${response.status}.`);
  const csv = await response.text();
  if (/<html[\s>]/i.test(csv.slice(0, 500))) {
    throw new Error('Ekspor Google Sheet bukan CSV. Pastikan akses tautan spreadsheet tetap tersedia.');
  }
  return csv;
}

async function storeSnapshot(records) {
  const totals = records.reduce((result, record) => {
    result[record.status] = (result[record.status] || 0) + 1;
    return result;
  }, {});
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM daycare_locations');

    const fields = [
      'source_row', 'sheet_no', 'location_name', 'address', 'kelurahan', 'kecamatan',
      'kabupaten', 'provinsi', 'izin_usaha', 'izin_operasional', 'jenis_izin',
      'coordinate_raw', 'latitude', 'longitude', 'coordinate_status',
    ];
    for (let offset = 0; offset < records.length; offset += CSV_BATCH_SIZE) {
      const batch = records.slice(offset, offset + CSV_BATCH_SIZE);
      const values = [];
      const placeholders = batch.map((record, rowIndex) => {
        const rowValues = [
          record.sourceRow, record.sheetNo, record.name, record.address, record.kelurahan,
          record.kecamatan, record.kabupaten, record.provinsi, record.izinUsaha,
          record.izinOperasional, record.jenisIzin, record.coordinateRaw,
          record.latitude, record.longitude, record.status,
        ];
        values.push(...rowValues);
        const start = rowIndex * fields.length;
        return `(${fields.map((_, fieldIndex) => `$${start + fieldIndex + 1}`).join(', ')})`;
      });
      await client.query(
        `INSERT INTO daycare_locations (${fields.join(', ')}) VALUES ${placeholders.join(', ')}`,
        values,
      );
    }

    await client.query(`
      INSERT INTO daycare_sheet_sync_state
        (id, last_synced_at, source_rows, mapped_rows, formula_rows, invalid_rows, missing_rows, last_error)
      VALUES (1, NOW(), $1, $2, $3, $4, $5, NULL)
      ON CONFLICT (id) DO UPDATE SET
        last_synced_at = EXCLUDED.last_synced_at,
        source_rows = EXCLUDED.source_rows,
        mapped_rows = EXCLUDED.mapped_rows,
        formula_rows = EXCLUDED.formula_rows,
        invalid_rows = EXCLUDED.invalid_rows,
        missing_rows = EXCLUDED.missing_rows,
        last_error = NULL
    `, [records.length, totals.mapped || 0, totals.formula || 0, totals.invalid || 0, totals.missing || 0]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return {
    sourceRows: records.length,
    mappedRows: totals.mapped || 0,
    formulaRows: totals.formula || 0,
    invalidRows: totals.invalid || 0,
    missingRows: totals.missing || 0,
  };
}

async function syncDaycareSheet() {
  if (activeSync) return activeSync;
  activeSync = (async () => {
    await ensureSchema();
    try {
      const csv = await fetchSheetCsv();
      const records = buildRecords(csv);
      const result = await storeSnapshot(records);
      console.log(`✅ Daycare sheet synced: ${result.mappedRows}/${result.sourceRows} locations have coordinates`);
      return result;
    } catch (error) {
      await pool.query(`
        INSERT INTO daycare_sheet_sync_state (id, last_error)
        VALUES (1, $1)
        ON CONFLICT (id) DO UPDATE SET last_error = EXCLUDED.last_error
      `, [error.message]).catch(() => {});
      console.error('❌ Daycare sheet sync failed:', error.message);
      throw error;
    }
  })().finally(() => {
    activeSync = null;
  });
  return activeSync;
}

function startDaycareSync() {
  syncDaycareSheet().catch(() => {});
  const timer = setInterval(() => syncDaycareSheet().catch(() => {}), SYNC_INTERVAL_MS);
  timer.unref?.();
  console.log(`🗺️ Daycare spreadsheet sync scheduled every ${Math.round(SYNC_INTERVAL_MS / 60_000)} minutes`);
}

module.exports = { ensureSchema, startDaycareSync, syncDaycareSheet };
