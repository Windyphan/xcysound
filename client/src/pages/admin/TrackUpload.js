import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUpload, FiMusic, FiImage, FiSave } from 'react-icons/fi';

const TrackUpload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: '',
    price: '',
    description: '',
    tags: '',
    previewStartTime: '0',
    previewDuration: '30'
  });
  const [files, setFiles] = useState({
    audioFile: null,
    previewFile: null,
    artwork: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: fileList[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files.audioFile || !files.previewFile) {
      toast.error('Audio file and preview file are required');
      return;
    }

    setLoading(true);

    try {
      const uploadData = new FormData();

      // Add form fields
      Object.keys(formData).forEach(key => {
        uploadData.append(key, formData[key]);
      });

      // Add files
      uploadData.append('audioFile', files.audioFile);
      uploadData.append('previewFile', files.previewFile);
      if (files.artwork) {
        uploadData.append('artwork', files.artwork);
      }

      const response = await fetch('/api/admin/tracks', {
        method: 'POST',
        credentials: 'include',
        body: uploadData
      });

      if (response.ok) {
        toast.success('Track uploaded successfully!');
        navigate('/admin');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload track');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="track-upload">
      <div className="container">
        <div className="upload-header">
          <h1><FiUpload /> Upload New Track</h1>
          <p>Add a new track to your music platform</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-sections">
            {/* Track Information */}
            <div className="form-section">
              <h2><FiMusic /> Track Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter track title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="artist">Artist *</label>
                  <input
                    type="text"
                    id="artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter artist name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="album">Album</label>
                  <input
                    type="text"
                    id="album"
                    name="album"
                    value={formData.album}
                    onChange={handleInputChange}
                    placeholder="Enter album name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="genre">Genre *</label>
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select genre</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Classical">Classical</option>
                    <option value="R&B">R&B</option>
                    <option value="Country">Country</option>
                    <option value="Folk">Folk</option>
                    <option value="Reggae">Reggae</option>
                    <option value="Blues">Blues</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (seconds) *</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Track duration in seconds"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price (USD) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.99"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Track description (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            {/* Preview Settings */}
            <div className="form-section">
              <h2>Preview Settings</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="previewStartTime">Preview Start Time (seconds)</label>
                  <input
                    type="number"
                    id="previewStartTime"
                    name="previewStartTime"
                    value={formData.previewStartTime}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="previewDuration">Preview Duration (seconds)</label>
                  <input
                    type="number"
                    id="previewDuration"
                    name="previewDuration"
                    value={formData.previewDuration}
                    onChange={handleInputChange}
                    min="1"
                    max="60"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="form-section">
              <h2>File Uploads</h2>

              <div className="file-upload-group">
                <label className="file-upload-label">
                  <FiMusic />
                  <span>Full Audio Track *</span>
                  <input
                    type="file"
                    name="audioFile"
                    accept="audio/*"
                    onChange={handleFileChange}
                    required
                  />
                </label>
                {files.audioFile && (
                  <div className="file-info">
                    <span>{files.audioFile.name}</span>
                    <span>{formatFileSize(files.audioFile.size)}</span>
                  </div>
                )}
              </div>

              <div className="file-upload-group">
                <label className="file-upload-label">
                  <FiMusic />
                  <span>Preview Audio *</span>
                  <input
                    type="file"
                    name="previewFile"
                    accept="audio/*"
                    onChange={handleFileChange}
                    required
                  />
                </label>
                {files.previewFile && (
                  <div className="file-info">
                    <span>{files.previewFile.name}</span>
                    <span>{formatFileSize(files.previewFile.size)}</span>
                  </div>
                )}
              </div>

              <div className="file-upload-group">
                <label className="file-upload-label">
                  <FiImage />
                  <span>Artwork (optional)</span>
                  <input
                    type="file"
                    name="artwork"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                {files.artwork && (
                  <div className="file-info">
                    <span>{files.artwork.name}</span>
                    <span>{formatFileSize(files.artwork.size)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              <FiSave />
              {loading ? 'Uploading...' : 'Upload Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrackUpload;
