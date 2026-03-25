import API_ENDPOINT from './api-endpoint';
import Auth from '../utils/auth';

const Api = {
  async register({ name, email, password }) {
    const response = await fetch(API_ENDPOINT.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  },

  async login({ email, password }) {
    const response = await fetch(API_ENDPOINT.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson.loginResult;
  },

  async getAllStories(page = 1, size = 15, location = 0) {
    const url = `${API_ENDPOINT.STORIES}?page=${page}&size=${size}&location=${location}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson.listStory;
  },

  async storeStory({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    
    // API requires a filename context if it's a raw Blob
    if (photo.name) {
      formData.append('photo', photo);
    } else {
      formData.append('photo', photo, 'camera-capture.jpg');
    }
    
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    const response = await fetch(API_ENDPOINT.ADD_STORY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
      body: formData,
    });

    let responseJson;
    try {
      responseJson = await response.json();
    } catch {
      if (response.status === 413) throw new Error("Ukuran foto terlalu besar (Maksimal 1MB). Silakan gunakan gambar dengan resolusi lebih kecil.");
      throw new Error(`Koneksi ke server gagal (Kode ${response.status}).`);
    }

    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  },
};

export default Api;
