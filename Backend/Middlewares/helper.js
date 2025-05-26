const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
Flask = process.env.FLASK_API;

const checkAbuse = async (text) => {
  try {
    const config = {
      headers: { "Content-type": "application/json" },
    };
    const res = await axios.post(`${Flask}/analyze`, { text }, config);
    console.log('Text abuse detection response:', res.data.abusive.label);
    return res.data.abusive.label === 'Toxic';
  } catch (err) {
    console.error('Text Abuse API error:', err);
    return false;
  }
};

const checkAudioAbuse = async (audio_url) => {
  try {
    const config = {
      headers: { "Content-type": "application/json" },
    };
    const res = await axios.post(`${Flask}/analyze/audio`, { audio_url }, config);
    console.log('Audio abuse detection response:', res.data.abusive.label);
    return res.data.abusive.label === 'Toxic';
  } catch (err) {
    console.error('Audio Abuse API error:', err);
    return false;
  }
};

const checkImageAbuse = async (image_url) => {
  try {
    const config = {
      headers: { "Content-type": "application/json" },
    };
    const res = await axios.post(`${Flask}/analyze/image`, { image_url }, config);
    console.log('Image abuse detection response:', res.data.classification);
    return res.data.classification === 'TOXIC';
  } catch (err) {
    console.error('Image Abuse API error:', err);
    return false;
  }
};

const checkVideoAbuse = async (video_url) => {
  try {
    const config = {
      headers: { "Content-type": "application/json" },
    };
    const res = await axios.post(`${Flask}/analyze/video`, { video_url }, config);

    // If response is an array and contains at least one 'Toxic' classification
    if (Array.isArray(res.data)) {
      const isToxic = res.data.some(item => item.classification === 'Toxic');
      console.log('Video abuse detection result:', isToxic ? 'Toxic' : 'Non-Toxic');
      return isToxic;
    }

    return false;
  } catch (err) {
    console.error('Video Abuse API error:', err);
    return false;
  }
};


module.exports = {
  checkAbuse,
  checkAudioAbuse,
  checkImageAbuse,
  checkVideoAbuse,
};
