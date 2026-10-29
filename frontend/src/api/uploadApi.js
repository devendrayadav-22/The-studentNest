/**
 * Upload API stub for file handling
 * Prepares image file URLs or mocks backend multipart upload
 */
export const uploadApi = {
  uploadFile: async (file) => {
    // Return a local Object URL or simulate backend upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url: URL.createObjectURL(file),
          filename: file.name
        });
      }, 300);
    });
  },

  uploadMultiple: async (files) => {
    return Promise.all(Array.from(files).map((f) => uploadApi.uploadFile(f)));
  }
};

export default uploadApi;

