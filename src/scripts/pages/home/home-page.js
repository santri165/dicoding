import Api from '../../networks/api';
import MapHelper from '../../utils/map-helper';
import idbHelper from '../../data/idb-helper';
import Swal from 'sweetalert2';

const HomePage = {
  async render() {
    return `
      <section class="dashboard">
        <header class="dashboard-header">
          <h1>Explore Stories</h1>
          <a href="#/add-story" class="btn btn-primary">+ Add New Story</a>
          <button id="logoutBtn" class="btn btn-secondary">Logout</button>
        </header>
        
        <div class="dashboard-content">
          <div class="list-container">
            <div class="list-header">
              <h2>Recent Updates</h2>
              <div class="list-filters">
                <input type="text" id="search-input" placeholder="Search stories..." aria-label="Search stories" />
                <select id="sort-select" aria-label="Sort stories">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
            <div id="story-list" class="story-list">
              <div class="loading-state">Loading stories...</div>
            </div>
          </div>
          
          <div class="map-container">
            <div id="map" class="map-element"></div>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    this._bindLogoutEvent();
    
    // Initial State
    this._stories = [];
    this._filteredStories = [];

    try {
      // 1. Initialize Map
      MapHelper.initMap('map', [-2.5489, 118.0149], 5);

      // 2. Fetch data (Try API first, fallback to IDB)
      try {
        const stories = await Api.getAllStories(1, 20, 1);
        this._stories = stories;
        
        // Save to IDB for offline use
        for (const story of stories) {
          await idbHelper.putStory(story);
        }
      } catch (apiError) {
        console.warn('API Fetch failed, using cached data:', apiError);
        this._stories = await idbHelper.getAllStories();
      }

      this._filteredStories = [...this._stories];
      this._renderListAndMarkers();
      this._bindFilterEvents();

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to initialize dashboard.', 'error');
    }
  },

  _renderListAndMarkers() {
    const listContainer = document.querySelector('#story-list');
    listContainer.innerHTML = '';
    
    if (this._filteredStories.length === 0) {
      listContainer.innerHTML = '<p class="empty-state">No stories found.</p>';
      MapHelper.addMarkers([]); // Clear markers
      return;
    }

    this._filteredStories.forEach((story) => {
      const dateStr = new Date(story.createdAt).toLocaleDateString();
      const storyItem = document.createElement('article');
      storyItem.classList.add('story-item');
      storyItem.innerHTML = `
        <img src="${story.photoUrl}" alt="Photo by ${story.name}" class="story-image" loading="lazy" />
        <div class="story-info">
          <h3 class="story-author">${story.name}</h3>
          <p class="story-date"><time datetime="${story.createdAt}">${dateStr}</time></p>
          <p class="story-desc">${story.description}</p>
          <button class="btn btn-save" style="margin-top: 10px; padding: 5px 10px; font-size: 0.9rem;">Simpan</button>
        </div>
      `;

      const saveBtn = storyItem.querySelector('.btn-save');
      if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await idbHelper.putSavedStory(story);
          Swal.fire({
            icon: 'success',
            title: 'Tersimpan!',
            text: 'Cerita berhasil disimpan ke halaman favorit',
            timer: 1500,
            showConfirmButton: false
          });
        });
      }

      storyItem.addEventListener('click', () => {
        if (story.lat && story.lon) {
          MapHelper.highlightMarker(story.id);
        }
      });

      listContainer.appendChild(storyItem);
    });

    // Update Map Markers
    const mappedStories = this._filteredStories.filter((s) => s.lat && s.lon);
    MapHelper.addMarkers(mappedStories);
  },

  _bindFilterEvents() {
    const searchInput = document.querySelector('#search-input');
    const sortSelect = document.querySelector('#sort-select');

    const handleFilter = () => {
      const query = searchInput.value.toLowerCase();
      const sortBy = sortSelect.value;

      this._filteredStories = this._stories.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query)
      );

      if (sortBy === 'newest') {
        this._filteredStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        this._filteredStories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      this._renderListAndMarkers();
    };

    searchInput.addEventListener('input', handleFilter);
    sortSelect.addEventListener('change', handleFilter);
  },
  
  _bindLogoutEvent() {
    const logoutBtn = document.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        import('../../utils/auth').then(m => {
          m.default.removeToken();
          location.hash = '#/login';
        });
      });
    }
  }
};

export default HomePage;
