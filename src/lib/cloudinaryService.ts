const CLOUDINARY_CLOUD_NAME = 'dfzrjuaap';

const cloudinaryService = {
  async uploadImage(file: File, folder: string = 'afristory'): Promise<string | null> {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Cloudinary error:', error);
        return null;
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  },

  async uploadCover(workId: string, file: File): Promise<string | null> {
    return this.uploadImage(file, `afristory/covers/${workId}`);
  },

  async uploadChapter(workId: string, chapterId: string, file: File): Promise<string | null> {
    return this.uploadImage(file, `afristory/chapters/${workId}/${chapterId}`);
  },

  async uploadChapterImage(file: File): Promise<string | null> {
    return this.uploadImage(file, 'afristory/chapters');
  },

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    return this.uploadImage(file, `afristory/avatars/${userId}`);
  },

  async uploadMerchandise(productId: string, file: File): Promise<string | null> {
    return this.uploadImage(file, `afristory/merchandise/${productId}`);
  },

  getOptimizedUrl(publicId: string, options: { width?: number; height?: number; quality?: number } = {}): string {
    const { width, height, quality = 80 } = options;
    let transformations = `c_scale,w_${width || 'auto'},h_${height || 'auto'},q_${quality}`;
    
    if (width || height) {
      transformations += ',c_pad';
    }
    
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
  },
};

export default cloudinaryService;