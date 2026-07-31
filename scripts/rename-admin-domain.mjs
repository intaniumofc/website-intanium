// Sekali jalan: ganti domain email admin @intanium.admin -> @iris.admin
// Memakai REST API Supabase langsung (tanpa supabase-js, kompatibel Node 20):
// - GoTrue Admin API : auth.users + auth.identities
// - PostgREST        : admin_profiles.username + admin_activity_logs
// Idempotent — aman dijalankan ulang.
//
// Cara pakai:
//   node scripts/rename-admin-domain.mjs --dry-run   (lihat apa yang akan diubah)
//   node scripts/rename-admin-domain.mjs             (eksekusi)

import { readFileSync } from 'fs';
import { resolve } from 'path';

const OLD_DOMAIN = '@intanium.admin';
const NEW_DOMAIN = '@iris.admin';
const DRY_RUN = process.argv.includes('--dry-run');

// Baca .env secara manual (tanpa dependency tambahan)
function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

loadEnv();

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env');
  process.exit(1);
}

const HEADERS = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

async function api(path, options = {}) {
  const res = await fetch(`${URL_BASE}${path}`, { ...options, headers: { ...HEADERS, ...(options.headers || {}) } });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} -> HTTP ${res.status}: ${text.slice(0, 200)}`);
  return body;
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (tidak ada perubahan)' : 'EKSEKUSI'}\n`);

  // 1. Ambil semua user auth ber-domain lama (GoTrue Admin API)
  const list = await api('/auth/v1/admin/users?page=1&per_page=1000');
  const users = list.users || [];
  const targets = users.filter((u) => (u.email || '').endsWith(OLD_DOMAIN));

  console.log(`Ditemukan ${targets.length} akun ${OLD_DOMAIN}:`);
  for (const u of targets) console.log(`  - ${u.email}`);

  // 2. Ganti email tiap akun (email_confirm agar langsung aktif tanpa email konfirmasi)
  let renamed = 0;
  for (const u of targets) {
    const newEmail = u.email.replace(OLD_DOMAIN, NEW_DOMAIN);
    if (DRY_RUN) {
      console.log(`  [dry] ${u.email} -> ${newEmail}`);
      continue;
    }
    try {
      await api(`/auth/v1/admin/users/${u.id}`, {
        method: 'PUT',
        body: JSON.stringify({ email: newEmail, email_confirm: true }),
      });
      console.log(`  OK ${u.email} -> ${newEmail}`);
      renamed++;
    } catch (e) {
      console.error(`  GAGAL ${u.email}: ${e.message}`);
    }
  }

  if (DRY_RUN) {
    // Preview perubahan tabel juga
    const profiles = await api(`/rest/v1/admin_profiles?select=username&username=like.*${encodeURIComponent(OLD_DOMAIN)}`);
    console.log(`\n[dry] admin_profiles yang akan diubah: ${profiles.length} baris`);
    for (const p of profiles) console.log(`  [dry] ${p.username} -> ${p.username.replace(OLD_DOMAIN, NEW_DOMAIN)}`);
    const logs = await api(`/rest/v1/admin_activity_logs?select=id&admin_username=like.*${encodeURIComponent(OLD_DOMAIN)}`);
    console.log(`[dry] admin_activity_logs yang akan dirapikan: ${logs.length} baris`);
    console.log('\nSelesai. Jalankan tanpa --dry-run untuk eksekusi.');
    return;
  }

  // 3. Samakan admin_profiles.username (dipakai cek hak akses di kode)
  const profiles = await api(`/rest/v1/admin_profiles?select=id,username&username=like.*${encodeURIComponent(OLD_DOMAIN)}`);
  for (const p of profiles) {
    const newUsername = p.username.replace(OLD_DOMAIN, NEW_DOMAIN);
    try {
      await api(`/rest/v1/admin_profiles?id=eq.${p.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ username: newUsername }),
        headers: { Prefer: 'return=minimal' },
      });
      console.log(`  OK profil ${p.username} -> ${newUsername}`);
    } catch (e) {
      console.error(`  GAGAL profil ${p.username}: ${e.message}`);
    }
  }

  // 4. Rapikan histori log aktivitas
  const logs = await api(`/rest/v1/admin_activity_logs?select=id,admin_username&admin_username=like.*${encodeURIComponent(OLD_DOMAIN)}`);
  for (const l of logs) {
    await api(`/rest/v1/admin_activity_logs?id=eq.${l.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ admin_username: l.admin_username.replace(OLD_DOMAIN, NEW_DOMAIN) }),
      headers: { Prefer: 'return=minimal' },
    });
  }
  console.log(`  Log aktivitas dirapikan: ${logs.length} baris`);

  console.log(`\nSelesai. ${renamed} akun auth diganti. Semua admin login pakai email baru (password tetap).`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
