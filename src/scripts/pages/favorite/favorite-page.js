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
            <div id="favorite-list" class="story-list">
              <div class="loading-state">Memuat cerita favorit...</div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    await this._renderFavorites();
  },

  async _renderFavorites() {
    const listContainer = document.querySelector('#favorite-list');
    listContainer.innerHTML = '';
    
    try {
      const stories = await idbHelper.getAllSavedStories();
      
      if (!stories || stories.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">Belum ada cerita yang disimpan.</p>';
        return;
      }

      stories.forEach((story) => {
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
            this._renderFavorites(); // re-render layout
          });
        }

        listContainer.appendChild(storyItem);
      });
    } catch (error) {
      console.error(error);
      listContainer.innerHTML = '<p class="empty-state">Gagal memuat cerita favorit.</p>';
    }
  }
};

export default FavoritePage;
