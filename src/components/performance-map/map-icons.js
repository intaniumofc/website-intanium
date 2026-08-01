import L from 'leaflet';

/**
 * Creates custom L.divIcon elements styled with classic teardrop pins.
 * On-Air: IRIS Blue (#72C4FF / #2E7BC4)
 * Off-Air: IRIS Pink (#FF5FB2 / #D83584)
 */

export function createOnairIcon(isSelected = false) {
  const scale = isSelected ? 'scale-125 z-50' : 'hover:scale-110';
  const html = `
    <div class="relative flex items-center justify-center transition-transform duration-200 ease-out ${scale}">
      ${isSelected ? '<div class="absolute -inset-2 rounded-full bg-[#72C4FF]/40 animate-ping"></div>' : ''}
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#2E7BC4] drop-shadow-[0_4px_10px_rgba(46,123,196,0.4)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        <circle cx="12" cy="9" r="3" fill="white" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-icon custom-onair-icon',
    iconSize: [40, 44],
    iconAnchor: [20, 42],
  });
}

export function createOffairIcon(isSelected = false) {
  const scale = isSelected ? 'scale-125 z-50' : 'hover:scale-110';
  const html = `
    <div class="relative flex items-center justify-center transition-transform duration-200 ease-out ${scale}">
      ${isSelected ? '<div class="absolute -inset-2 rounded-full bg-[#FF5FB2]/40 animate-ping"></div>' : ''}
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#FF5FB2] drop-shadow-[0_4px_10px_rgba(255,95,178,0.45)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        <circle cx="12" cy="9" r="3" fill="white" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-icon custom-offair-icon',
    iconSize: [40, 44],
    iconAnchor: [20, 42],
  });
}

export function createCustomClusterIcon(cluster) {
  const count = cluster.getChildCount();
  let sizeClass = 'w-11 h-11 text-sm font-black';
  if (count > 20) sizeClass = 'w-14 h-14 text-base font-black';
  else if (count > 8) sizeClass = 'w-12 h-12 text-sm font-black';

  const html = `
    <div class="relative flex items-center justify-center group cursor-pointer">
      <div class="absolute -inset-2 rounded-full bg-gradient-to-r from-[#FF5FB2] via-[#A855F7] to-[#72C4FF] opacity-60 blur-md group-hover:opacity-90 transition-opacity duration-300 animate-pulse"></div>
      
      <div class="${sizeClass} relative flex items-center justify-center rounded-full bg-gradient-to-tr from-[#FF5FB2] via-[#A855F7] to-[#72C4FF] border-2 border-white text-white shadow-xl font-sans tracking-tight">
        <span class="drop-shadow-md">${count}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-cluster-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}
