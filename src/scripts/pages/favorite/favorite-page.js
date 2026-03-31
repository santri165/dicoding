import idbHelper from '../../data/idb-helper';
import Swal from 'sweetalert2';

const FavoritePage = {
  async render() {
    return `
      <section class="dashboard">
        <header class="dashboard-header">
          <h1>Halaman Favorit</h1>
          <p style="margin-top: 10px; font-size: 1.1rem; color: #aaa;">Cerita yang telah Anda simpan</p>
        </header>
        
        <div class="dashboard-content">
          <div class="list-container" style="max-width: 800px; margin: 0 auto; width: 100%;">
            <div class="list-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2>Daftar Favorit</h2>
              <div class="list-filters">
                <label for="search-input" style="display:none;">Cari cerita</label>
                <input type="text" id="search-input" placeholder="Cari cerita..." aria-label="Cari cerita" style="padding: 10px; border-radius: 8px; border: 1px solid #333; background: #1a1a1a; color: white; width: 100%; max-width: 300px;" />
              </div>
            </div>
            <div id="favorite-list" class="story-list">
              <div class="loading-state">Memuat cerita favorit...</div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    this._stories = [];
    this._filteredStories = [];
    await this._fetchFavorites();
    this._bindFilterEvents();
  },

  async _fetchFavorites() {
    const listContainer = document.querySelector('#favorite-list');
    try {
      this._stories = await idbHelper.getAllSavedStories() || [];
      this._filteredStories = [...this._stories];
      this._renderFavorites();
    } catch (error) {
      console.error(error);
      if (listContainer) {
        listContainer.innerHTML = '<p class="empty-state">Gagal memuat cerita favorit.</p>';
      }
    }
  },

  _bindFilterEvents() {
    const searchInput = document.querySelector('#search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      this._filteredStories = this._stories.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query)
      );
      this._renderFavorites();
    });
  },

  _renderFavorites() {
    const listContainer = document.querySelector('#favorite-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    if (!this._filteredStories || this._filteredStories.length === 0) {
      listContainer.innerHTML = '<p class="empty-state">Belum ada cerita yang disimpan.</p>';
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
            <button class="btn btn-delete" style="margin-top: 10px; padding: 5px 10px; font-size: 0.9rem; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Hapus</button>
          </div>
        `;

        const deleteBtn = storyItem.querySelector('.btn-delete');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); // prevent clicking card if any
            await idbHelper.deleteSavedStory(story.id);
            Swal.fire({
              icon: 'success',
              title: 'Dihapus!',
              text: 'Cerita dihapus dari favorit',
              timer: 1500,
              showConfirmButton: false
            });
            await this._fetchFavorites(); // re-fetch and re-render
          });
        }

        listContainer.appendChild(storyItem);
      });
  }
};

export default FavoritePage;
