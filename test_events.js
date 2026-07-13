async function run() {
  const url = `https://jkt48.com/api/v1/schedules/shcdf3-pajama-drive`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  const json = await res.json();
  console.log('Lineup for shcdf3-pajama-drive (July 18):');
  console.log(json.data?.jkt48_member || json.data?.members);
}

run();
