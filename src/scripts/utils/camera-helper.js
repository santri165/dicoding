const CameraHelper = {
  stream: null,

  async startCamera(videoElement) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      videoElement.srcObject = this.stream;
    } catch (error) {
      console.error('Camera access error:', error);
      throw new Error('Cannot access camera. Please allow permission.');
    }
  },

  takePhoto(videoElement, canvasElement) {
    if (!this.stream) return null;
    
    // Scale down image to ensure it's under 1MB API limit
    const MAX_DIMENSION = 800;
    let width = videoElement.videoWidth;
    let height = videoElement.videoHeight;

    if (width > height && width > MAX_DIMENSION) {
      height *= MAX_DIMENSION / width;
      width = MAX_DIMENSION;
    } else if (height > MAX_DIMENSION) {
      width *= MAX_DIMENSION / height;
      height = MAX_DIMENSION;
    }

    const context = canvasElement.getContext('2d');
    canvasElement.width = width;
    canvasElement.height = height;
    context.drawImage(videoElement, 0, 0, width, height);
    
    // Return compressed base64 string
    return canvasElement.toDataURL('image/jpeg', 0.6);
  },

  stopCamera() {
    if (this.stream) {
      const tracks = this.stream.getTracks();
      tracks.forEach((track) => track.stop());
      this.stream = null;
    }
  },

  dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
};

export default CameraHelper;
