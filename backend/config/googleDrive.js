require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// OAuth2 Authentication
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env. Google Drive upload might fail once the token expires.');
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Default for tokens from playground
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Uploads a file to Google Drive
 * @param {string} filePath - Local path to the file to upload
 * @param {string} fileName - Name to give the file on Drive
 * @param {string} folderId - ID of the folder to upload to (optional)
 * @param {string} mimeType - The MIME type of the file (optional, defaults to video/mp4)
 * @returns {Promise<Object>} - Details of the uploaded file
 */
const uploadFileToDrive = async (filePath, fileName, folderId = null, mimeType = 'video/mp4') => {
  try {
    const uploadFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    console.log('DEBUG: Testing access for Folder ID:', uploadFolderId);

    // 1. Verify access to the folder first
    try {
      const folderCheck = await drive.files.get({
        fileId: uploadFolderId,
        fields: 'id, name, mimeType',
        supportsAllDrives: true,
      });
      console.log('DEBUG: Folder verified successfully:', folderCheck.data.name);
    } catch (checkError) {
      console.error('DEBUG: Access check failed for folderID:', uploadFolderId);
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error('Google Drive access expired. You MUST add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file to allow automatic refresh.');
      }
      throw new Error(`Your Google account cannot see the folder. Make sure your account has permission to view Folder ID: ${uploadFolderId}`);
    }

    const fileMetadata = {
      name: fileName,
      parents: [uploadFolderId],
      copyRequiresWriterPermission: true, // Prevents viewers from downloading/printing/copying
      writersCanShare: false, // Prevents editors from resharing the file
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    console.log('DEBUG: File uploaded successfully ID:', response.data.id);

    // Make the file public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    };
  } catch (error) {
    if (error.response) {
      console.error('DEBUG: Google API Error Details:', error.response.data);
    }
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

module.exports = { uploadFileToDrive };
