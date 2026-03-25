import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const MapHelper = {
  map: null,
  markers: [],

  initMap(containerId, initialCenter = [0, 0], initialZoom = 2) {
    if (this.map) {
      this.map.remove();
    }
    this.map = L.map(containerId).setView(initialCenter, initialZoom);
    this.markers = []; // reset markers

    // Layer Control (Advanced Criteria)
    const standardLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri',
    });

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    });

    standardLayer.addTo(this.map); // default

    const baseMaps = {
      'Standard Map': standardLayer,
      'Satellite': satelliteLayer,
      'Dark Mode': darkLayer,
    };

    L.control.layers(baseMaps).addTo(this.map);
  },

  addMarkers(stories) {
    if (!this.map) return;
    
    // Clear existing markers
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        
        // Popup with simple description
        const popupContent = `
          <div style="text-align:center;">
            <b>${story.name}</b><br>
            <img src="${story.photoUrl}" alt="${story.name}'s story photo" style="width: 100%; max-width: 150px; border-radius: 4px; margin-top: 5px;" loading="lazy"/><br>
            <p style="font-size: 0.9em; color: #555;">${story.description}</p>
          </div>
        `;
        marker.bindPopup(popupContent);
        
        // Store reference to marker by story id for interactivity
        marker.storyId = story.id;
        this.markers.push(marker);
      }
    });

    // Fit bounds if markers exist
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  },

  highlightMarker(storyId) {
    const marker = this.markers.find((m) => m.storyId === storyId);
    if (marker) {
      this.map.flyTo(marker.getLatLng(), 14, {
        animate: true,
        duration: 1.5,
      });
      setTimeout(() => {
        marker.openPopup();
      }, 1500);
    }
  },
  
  // Method to allow user to pick location on map (for Add Story)
  enableLocationPicker(onLocationSelect) {
    let pickerMarker = null;

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (pickerMarker) {
        this.map.removeLayer(pickerMarker);
      }
      pickerMarker = L.marker([lat, lng]).addTo(this.map);
      onLocationSelect(lat, lng);
    });
    
    // Attempt to locate user automatically
    this.map.locate({ setView: true, maxZoom: 14 });
    this.map.on('locationfound', (e) => {
      const { lat, lng } = e.latlng;
      if (pickerMarker) {
        this.map.removeLayer(pickerMarker);
      }
      pickerMarker = L.marker([lat, lng]).addTo(this.map);
      onLocationSelect(lat, lng);
    });
  }
};

export default MapHelper;
