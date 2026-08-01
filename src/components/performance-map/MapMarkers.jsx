'use client';

import React, { memo } from 'react';
import { Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { createOnairIcon, createOffairIcon, createCustomClusterIcon } from './map-icons';

function MapMarkersUnmemoized({ locations = [], selectedLocationId = null, onSelectLocation }) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createCustomClusterIcon}
      maxClusterRadius={50}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
    >
      {locations.map((loc) => {
        const isSelected = selectedLocationId === loc.id;
        const icon = loc.type === 'onair' ? createOnairIcon(isSelected) : createOffairIcon(isSelected);

        return (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectLocation(loc),
            }}
          />
        );
      })}
    </MarkerClusterGroup>
  );
}

export default memo(MapMarkersUnmemoized);
