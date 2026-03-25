import Api from '../../networks/api';
import MapHelper from '../../utils/map-helper';
import CameraHelper from '../../utils/camera-helper';
import idbHelper from '../../data/idb-helper';
import Swal from 'sweetalert2';

const AddStoryPage = {
  async render() {
    return `
      <section class="add-story-section">
        <header class="page-header">
          <h1>Add New Story</h1>
          <a href="#/" class="back-link">&larr; Back to Home</a>
        </header>

        <form id="addStoryForm" class="story-form">
          <!-- Text Data -->
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" rows="4" required placeholder="What's your story about?"></textarea>
          </div>
          
          <!-- Image Section -->
          <div class="form-group camera-group">
            <label for="photoInput">Photo</label>
            
            <div class="camera-actions">
              <button type="button" id="startCamera" class="btn btn-secondary">Use Camera</button>
              <span class="or-separator">OR</span>
              <input type="file" id="photoInput" accept="image/*" />
            </div>

            <!-- Video Stream Container -->
            <div id="cameraContainer" class="camera-container" style="display: none;">
              <video id="cameraVideo" autoplay playsinline></video>
              <button type="button" id="capturePhoto" class="btn btn-primary">Capture</button>
            </div>
            
            <!-- Result Preview -->
            <div id="previewContainer" class="preview-container" style="display: none;">
              <canvas id="cameraCanvas" style="display: none;"></canvas>
              <img id="photoPreview" src="" alt="Photo preview" />
            </div>
          </div>

          <!-- Location Picker -->
          <div class="form-group">
            <label for="latInput">Location (Optional - Click map to pick)</label>
            <div id="location-map" class="map-picker"></div>
            <div class="coords-display">
              <input type="text" id="latInput" placeholder="Latitude" readonly />
              <label for="lonInput" style="display:none;">Longitude</label>
              <input type="text" id="lonInput" placeholder="Longitude" readonly />
              <button type="button" id="clearCoords" class="btn btn-small">Clear Location</button>
            </div>
          </div>

          <button type="submit" id="submitBtn" class="btn btn-primary btn-block btn-lg">Post Story</button>
        </form>
      </section>
    `;
  },

  async afterRender() {
    let capturedPhotoBlob = null;
    
    // Elements
    const addStoryForm = document.querySelector('#addStoryForm');
    const descInput = document.querySelector('#description');
    const photoInput = document.querySelector('#photoInput');
    const latInput = document.querySelector('#latInput');
    const lonInput = document.querySelector('#lonInput');
    const clearCoordsBtn = document.querySelector('#clearCoords');
    
    // Camera Elements
    const startCameraBtn = document.querySelector('#startCamera');
    const capturePhotoBtn = document.querySelector('#capturePhoto');
    const cameraContainer = document.querySelector('#cameraContainer');
    const cameraVideo = document.querySelector('#cameraVideo');
    const previewContainer = document.querySelector('#previewContainer');
    const cameraCanvas = document.querySelector('#cameraCanvas');
    const photoPreview = document.querySelector('#photoPreview');

    // 1. Setup Map Picker
    MapHelper.initMap('location-map', [-2.5489, 118.0149], 4);
    setTimeout(() => {
        MapHelper.map.invalidateSize(); // Fix leafleft missing rendering on hidden views initially
    }, 500);
    
    MapHelper.enableLocationPicker((lat, lng) => {
      latInput.value = lat;
      lonInput.value = lng;
    });

    clearCoordsBtn.addEventListener('click', () => {
      latInput.value = '';
      lonInput.value = '';
    });

    // 2. Camera Interactivity
    startCameraBtn.addEventListener('click', async () => {
      try {
        await CameraHelper.startCamera(cameraVideo);
        cameraContainer.style.display = 'block';
        previewContainer.style.display = 'none';
        startCameraBtn.style.display = 'none';
        photoInput.value = ''; // clear file input
        capturedPhotoBlob = null;
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    });

    capturePhotoBtn.addEventListener('click', () => {
      const photoURI = CameraHelper.takePhoto(cameraVideo, cameraCanvas);
      if (photoURI) {
        photoPreview.src = photoURI;
        previewContainer.style.display = 'block';
        cameraContainer.style.display = 'none';
        CameraHelper.stopCamera();
        
        startCameraBtn.style.display = 'inline-block';
        startCameraBtn.textContent = 'Retake Photo';
        
        capturedPhotoBlob = CameraHelper.dataURItoBlob(photoURI);
      }
    });

    // 3. File Input Fallback
    photoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        CameraHelper.stopCamera();
        cameraContainer.style.display = 'none';
        startCameraBtn.style.display = 'inline-block';
        startCameraBtn.textContent = 'Use Camera';
        
        const file = e.target.files[0];
        capturedPhotoBlob = file;
        
        // Setup preview
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview.src = e.target.result;
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    // 4. Form Submission
    addStoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!capturedPhotoBlob) {
        Swal.fire('Warning', 'Please provide a photo.', 'warning');
        return;
      }

      const description = descInput.value;
      const lat = latInput.value || undefined;
      const lon = lonInput.value || undefined;

      // Show loading
      Swal.fire({
        title: 'Uploading Story...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        // Check online status
        if (!navigator.onLine) {
          throw new Error('OFFLINE_DETECTED');
        }

        await Api.storeStory({
          description,
          photo: capturedPhotoBlob,
          lat,
          lon
        });

        Swal.fire('Success', 'Story has been created!', 'success').then(() => {
          location.hash = '#/';
        });

      } catch (error) {
        if (error.message === 'OFFLINE_DETECTED' || !navigator.onLine) {
          // Attempt Background Sync
          try {
            await this._saveForSync({ description, photo: capturedPhotoBlob, lat, lon });
            Swal.fire('Offline', 'You are offline. Story saved and will be uploaded automatically when you are back online.', 'info').then(() => {
              location.hash = '#/';
            });
          } catch (syncError) {
            Swal.fire('Error', 'Failed to save story for sync: ' + syncError.message, 'error');
          }
        } else {
          Swal.fire('Error', error.message, 'error');
        }
      }
    });
    
    // Ensure camera stops when leaving the page component
    const originalHashChangeEvent = window.onhashchange;
    window.addEventListener('hashchange', () => {
      CameraHelper.stopCamera();
    }, { once: true });
  },

  async _saveForSync(storyData) {
    // 1. Save to IDB
    await idbHelper.putSyncStory(storyData);

    // 2. Register Sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-add-story');
    }
  }
};

export default AddStoryPage;
