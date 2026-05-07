const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;

admin.initializeApp();

cloudinary.config({
  cloud_name: 'dfzrjuaap',
  api_key: '324446924179216',
  api_secret: 'CaSV4Q1Ik9Xb2vuK7-NbXtQLa_s'
});

exports.uploadImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { imageData, folder, fileName } = data;
  
  if (!imageData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'imageData is required'
    );
  }

  try {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder || 'afristory',
          public_id: fileName,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to upload image'
    );
  }
});

exports.deleteImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { publicId } = data;
  
  if (!publicId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'publicId is required'
    );
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete image'
    );
  }
});