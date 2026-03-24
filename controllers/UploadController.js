import cloudinary from '../configs/cloudinary.js';
import {
  handleError400,
  handleError500,
  handleSuccess200,
} from '../helper/index.js';

const UploadController = {
  uploadAudio: async (req, res) => {
    try {
      if (!req.file) {
        return handleError400(res, 'Vui lòng gửi file cần upload');
      }

      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'uploads_audio',
        resource_type: 'auto',
      });

      return handleSuccess200(res, 'Upload file thành công', {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
      });
    } catch (error) {
      return handleError500(res, error);
    }
  },
};

export default UploadController;
