// Helper validasi realtime bersama untuk seluruh form Join Us.
// Dipindahkan apa adanya dari JoinUsPage lama — jangan ubah regex/aturan.

export const getAgeError = (val) => {
  if (!val) return '';
  const num = Number(val);
  if (isNaN(num) || !Number.isInteger(num) || num < 12 || num > 80) {
    return 'Usia harus berupa angka antara 12 - 80 tahun';
  }
  return '';
};

export const getWAError = (val) => {
  if (!val) return '';
  const clean = val.trim().replace(/[\s-]/g, '');
  if (!/^(08|62|\+62)\d{8,13}$/.test(clean)) {
    return 'Nomor WA tidak valid (contoh: 081234567890 / 6281234567890)';
  }
  return '';
};

export const getLineIdError = (val) => {
  if (!val) return '';
  if (/\s/.test(val.trim())) {
    return 'ID Line tidak boleh mengandung spasi';
  }
  if (val.trim().length < 2) {
    return 'ID Line minimal 2 karakter';
  }
  return '';
};

export const getXAccountError = (val) => {
  if (!val) return '';
  if (/\s/.test(val.trim())) {
    return 'Username X/Twitter tidak boleh mengandung spasi';
  }
  return '';
};
