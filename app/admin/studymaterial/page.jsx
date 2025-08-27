"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Folder, File as FileIcon, Upload, Trash2, Video, Image as ImageIcon, X, Play, Pause, Volume2, VolumeX, Maximize, FastForward, Rewind, Youtube, Sparkles, Lock, Calendar, RefreshCw } from 'lucide-react';
import './videoplayer.css';

// MovingText component for video player watermark
const MovingText = () => {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  useEffect(() => {
    const interval = setInterval(() => {
      const newTop = Math.random() * 85;
      const newLeft = Math.random() * 85;
      setPosition({ top: `${newTop}%`, left: `${newLeft}%` });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="moving-test-container" style={{ top: position.top, left: position.left }}>
      SkillCrafters
    </div>
  );
};

// VideoPlayer component
const VideoPlayer = ({ src, title, onClose, isYoutube = false }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const controlsTimeoutRef = useRef(null);

    const getYoutubeEmbedUrl = (url) => {
        let videoId;
        if (url.includes('youtu.be')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('playlist?list=')) {
            const listId = url.split('playlist?list=')[1];
            return `https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=1&rel=0&modestbranding=1&showinfo=0&disablekb=1`;
        }
        else {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v');
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&disablekb=1`;
    }

    useEffect(() => {
        if (isYoutube) return;

        const video = videoRef.current;
        if (!video) return;
        let isMounted = true;
        const updateProgress = () => setProgress(video.currentTime);
        const setVideoDuration = () => setDuration(video.duration);
        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', setVideoDuration);
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => isMounted && console.error("Autoplay was prevented:", error));
        }
        const handleContextMenu = (e) => e.preventDefault();
        video.addEventListener('contextmenu', handleContextMenu);
        return () => {
            isMounted = false;
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', setVideoDuration);
            video.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [src, isYoutube]);

    const resetControlsTimeout = () => {
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        setIsControlsVisible(true);
        controlsTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 5000);
    };

    useEffect(() => {
        if (isYoutube) return;

        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('mousemove', resetControlsTimeout);
        resetControlsTimeout();
        return () => {
            container.removeEventListener('mousemove', resetControlsTimeout);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isYoutube]);

    const togglePlayPause = () => {
        if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
        else { videoRef.current.pause(); setIsPlaying(false); }
    };

    const handleSeek = (seconds) => { videoRef.current.currentTime += seconds; };
    const handleDoubleClick = (e) => {
        const rect = videoRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        handleSeek(x < rect.width / 2 ? -10 : 10);
    };
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };
    const toggleMute = () => {
        const newMutedState = !isMuted;
        videoRef.current.muted = newMutedState;
        setIsMuted(newMutedState);
        if (!newMutedState && volume === 0) { setVolume(1); videoRef.current.volume = 1; }
    };
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) containerRef.current.requestFullscreen();
        else document.exitFullscreen();
    };
    const formatTime = (time) => new Date(time * 1000).toISOString().substr(11, 8);

    if (isYoutube) {
        return (
            <div className="video-player-backdrop" onClick={onClose}>
                <div className={`video-player-container`} ref={containerRef} onClick={(e) => e.stopPropagation()}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={getYoutubeEmbedUrl(src)}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                    </iframe>
                </div>
            </div>
        )
    }

    return (
        <div className="video-player-backdrop" onClick={onClose}>
            <div className={`video-player-container ${!isControlsVisible ? 'hide-controls' : ''}`} ref={containerRef} onClick={(e) => e.stopPropagation()}>
                <MovingText />
                <div className="video-header"><h3 className="video-title">{title}</h3></div>
                <button onClick={onClose} className="video-player-close-btn"><X size={20} /></button>
                <video ref={videoRef} src={src} className="main-video" onClick={togglePlayPause} onDoubleClick={handleDoubleClick}>Your browser does not support the video tag.</video>
                <div className="video-controls-overlay">
                    <div className="progress-bar-container"><input type="range" min="0" max={duration} value={progress} className="progress-bar" onChange={(e) => videoRef.current.currentTime = e.target.value} /></div>
                    <div className="controls-bottom-bar">
                        <div className="controls-left">
                            <button onClick={togglePlayPause}>{isPlaying ? <Pause /> : <Play />}</button>
                            <button onClick={() => handleSeek(-10)}><Rewind /></button>
                            <button onClick={() => handleSeek(10)}><FastForward /></button>
                            <div className="volume-control">
                                <button onClick={toggleMute}>{isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}</button>
                                <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="volume-slider" />
                            </div>
                            <span className="time-display">{formatTime(progress)} / {formatTime(duration)}</span>
                        </div>
                        <div className="controls-right">
                            <select className="speed-select" defaultValue="1" onChange={(e) => videoRef.current.playbackRate = parseFloat(e.target.value)}>
                                <option value="0.5">0.5x</option><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option>
                            </select>
                            <button onClick={toggleFullScreen}><Maximize /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AdminStudyMaterialsPage() {
  const [user, setUser] = useState(null);
  const [batches, setBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentBatch, setCurrentBatch] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Video Player State
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false);

  // Modal states
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);
  const [showAddYoutubeModal, setShowAddYoutubeModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // New states for YouTube and Premium content
  const [youtubeData, setYoutubeData] = useState({ title: '', description: '', url: '', type: 'youtube_video', thumbnailUrl: '' });
  const [premiumSettings, setPremiumSettings] = useState({ isPremium: false, dripDate: '' });
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);

  // New states for handling playlists
  const [youtubeModalView, setYoutubeModalView] = useState('input'); // 'input' or 'confirm'
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();
        if (res.ok) setUser(data.user);
    } catch (e) {
        console.error("Failed to fetch user", e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch("/api/admin/studymaterial");
      const data = await res.json();
      if (res.ok) {
        setBatches(data.batches);
        setMaterials(data.materials);
      } else {
        setError(data.error || "Failed to fetch data.");
      }
    } catch (err) {
      setError("An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (url) => {
    if (!url) return null;
    try {
        const urlParts = new URL(url, window.location.origin).pathname.split('.');
        return urlParts.length > 1 ? urlParts.pop().toUpperCase() : null;
    } catch (e) {
        return null;
    }
  };

  const isVideoFile = (item) => {
      if (item.type === 'youtube_video' || item.type === 'youtube_playlist') return true;
      const videoExtensions = ['mp4', 'mov', 'webm', 'ogg'];
      const extension = getFileExtension(item.resourceUrl)?.toLowerCase();
      return videoExtensions.includes(extension);
  };

    const FileTypeIcon = ({ item }) => {
        const isVideo = isVideoFile(item);

        if (item.thumbnailUrl) {
            return (
                <div className="relative w-full h-full">
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                    {isVideo && (
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <Play size={48} className="text-white" />
                        </div>
                    )}
                </div>
            );
        }

        if (item.type === 'youtube_video' || item.type === 'youtube_playlist') {
            return <Youtube className="w-16 h-16 text-red-500" />;
        }

        const extension = getFileExtension(item.resourceUrl);
        switch (extension) {
            case 'MP4': case 'MOV': return <Video className="w-16 h-16 text-red-400" />;
            case 'JPG': case 'JPEG': case 'PNG': case 'GIF': return <img src={item.resourceUrl} alt={item.title} className="w-full h-full object-cover rounded-lg" />;
            case 'PDF': return <FileIcon className="w-16 h-16 text-purple-400" />;
            default: return <FileIcon className="w-16 h-16 text-gray-400" />;
        }
    };

  const { currentItems } = useMemo(() => {
    if (!currentBatch) {
      return { currentItems: batches };
    }
    const items = materials.filter(m => m.batchCode === currentBatch.batchCode && m.parent === currentFolderId);
    return { currentItems: items.sort((a, b) => a.type === 'folder' ? -1 : 1) };
  }, [currentBatch, currentFolderId, batches, materials]);

  const handleItemClick = (item) => {
      if (item.type === 'folder' || !currentBatch) {
          if (item.batchName) {
            setCurrentBatch(item);
            setCurrentFolderId(null);
            setBreadcrumbs([{ id: null, name: item.batchName }]);
          } else {
            setCurrentFolderId(item._id);
            setBreadcrumbs(prev => [...prev, { id: item._id, name: item.title }]);
          }
      } else {
          if(isVideoFile(item)) {
            setVideoUrl(item.resourceUrl || item.youtubeUrl);
            setVideoTitle(item.title);
            setIsYoutubeVideo(!!item.youtubeUrl);
            setShowVideoPlayer(true);
          } else {
            window.open(item.resourceUrl, '_blank');
          }
      }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
        setCurrentBatch(null);
        setCurrentFolderId(null);
        setBreadcrumbs([]);
    } else {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    }
  };

  const handleFetchYoutubeDetails = async () => {
      if (!youtubeData.url) {
          alert("Please enter a YouTube URL.");
          return;
      }
      setIsFetchingYoutube(true);
      try {
          const res = await fetch('/api/youtube', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: youtubeData.url })
          });
          if (res.ok) {
              const data = await res.json();
              if (data.type === 'playlist') {
                  setYoutubeData(prev => ({...prev, title: data.playlistTitle, type: 'youtube_playlist'}));
                  setPlaylistVideos(data.videos);
                  setYoutubeModalView('confirm');
              } else {
                  setYoutubeData(prev => ({...prev, title: data.title, description: data.description, thumbnailUrl: data.thumbnailUrl, type: 'youtube_video' }));
              }
          } else {
              const data = await res.json();
              alert(data.error || "Failed to fetch details.");
          }
      } catch (e) {
          alert("An error occurred while fetching details.");
      } finally {
          setIsFetchingYoutube(false);
      }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
        const formData = new FormData();
        formData.append('type', 'folder');
        formData.append('title', newFolderName);
        formData.append('batchCode', currentBatch.batchCode);
        if (currentFolderId) formData.append('parent', currentFolderId);

        const res = await fetch('/api/admin/studymaterial', { method: 'POST', body: formData });
        if (res.ok) {
            setShowCreateFolderModal(false);
            setNewFolderName('');
            fetchData();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to create folder');
        }
    } catch (e) {
        alert('An error occurred.');
    }
  };

    const generateVideoThumbnail = (file) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => {
                video.currentTime = 1; // Seek to 1 second
            };
            video.onseeked = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                canvas.toBlob((blob) => {
                    resolve(new window.File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
                }, 'image/jpeg');
            };
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setNewFile(file);
        if (file && file.type.startsWith('video/')) {
            const thumb = await generateVideoThumbnail(file);
            setThumbnailFile(thumb);
        } else {
            setThumbnailFile(null);
        }
    };

  const handleUploadFile = async () => {
    if (!newFile) return;
    try {
        const formData = new FormData();
        formData.append('type', 'file');
        formData.append('title', newFileName || newFile.name);
        formData.append('batchCode', currentBatch.batchCode);
        if (currentFolderId) formData.append('parent', currentFolderId);
        formData.append('resourceFile', newFile);
        if (thumbnailFile) {
            formData.append('thumbnailUrl', thumbnailFile);
        }

        const res = await fetch('/api/admin/studymaterial', { method: 'POST', body: formData });
        if (res.ok) {
            setShowUploadFileModal(false);
            setNewFileName('');
            setNewFile(null);
            setThumbnailFile(null);
            fetchData();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to upload file');
        }
    } catch (e) {
        alert('An error occurred.');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"? This will also delete all its contents.`)) return;
    try {
        const res = await fetch(`/api/admin/studymaterial?id=${item._id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchData();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to delete.');
        }
    } catch (e) {
        alert('An error occurred.');
    }
  };

  const handleAddSingleYoutubeLink = async () => {
    if (!youtubeData.title || !youtubeData.url) return;
    try {
        const formData = new FormData();
        formData.append('type', youtubeData.type);
        formData.append('title', youtubeData.title);
        formData.append('description', youtubeData.description);
        formData.append('thumbnailUrl', youtubeData.thumbnailUrl);
        formData.append('youtubeUrl', youtubeData.url);
        formData.append('batchCode', currentBatch.batchCode);
        if (currentFolderId) formData.append('parent', currentFolderId);

        formData.append('isPremium', premiumSettings.isPremium);
        if (premiumSettings.dripDate) {
            formData.append('dripDate', premiumSettings.dripDate);
        }

        const res = await fetch('/api/admin/studymaterial', { method: 'POST', body: formData });
        if (res.ok) {
            closeAndResetYoutubeModal();
            fetchData();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to add YouTube link');
        }
    } catch (e) {
        alert('An error occurred.');
    }
  };

  const handleAddPlaylistVideos = async () => {
    if (playlistVideos.length === 0) return;
    setIsAddingPlaylist(true);

    try {
        // 1. Create a new folder for the playlist
        const folderFormData = new FormData();
        folderFormData.append('type', 'folder');
        folderFormData.append('title', youtubeData.title); // Use the playlist's title
        folderFormData.append('batchCode', currentBatch.batchCode);
        if (currentFolderId) folderFormData.append('parent', currentFolderId);
        
        // **FIX**: Extract and save the playlist ID
        const urlParams = new URLSearchParams(new URL(youtubeData.url).search);
        const playlistId = urlParams.get('list');
        if (playlistId) {
            folderFormData.append('youtubePlaylistId', playlistId);
        }


        const folderRes = await fetch('/api/admin/studymaterial', { method: 'POST', body: folderFormData });
        if (!folderRes.ok) {
            throw new Error("Failed to create a folder for the playlist.");
        }
        const folderData = await folderRes.json();
        const newParentFolderId = folderData.material._id;

        // 2. Loop and add each video inside the new folder
        for (const video of playlistVideos) {
            const videoFormData = new FormData();
            videoFormData.append('type', 'youtube_video');
            videoFormData.append('title', video.title);
            videoFormData.append('description', video.description);
            videoFormData.append('thumbnailUrl', video.thumbnailUrl);
            videoFormData.append('youtubeUrl', video.videoUrl);
            videoFormData.append('batchCode', currentBatch.batchCode);
            videoFormData.append('parent', newParentFolderId);
            videoFormData.append('isPremium', premiumSettings.isPremium);
            if (premiumSettings.dripDate) videoFormData.append('dripDate', premiumSettings.dripDate);

            await fetch('/api/admin/studymaterial', { method: 'POST', body: videoFormData });
        }

        alert(`Successfully started adding ${playlistVideos.length} videos from the playlist. They will appear shortly.`);
        closeAndResetYoutubeModal();
        setTimeout(() => fetchData(), 2000);

    } catch (err) {
        alert(err.message || "An error occurred while adding the playlist.");
    } finally {
        setIsAddingPlaylist(false);
    }
  };

  const handleSyncPlaylist = async (item) => {
    try {
        const res = await fetch('/api/admin/studymaterial/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlistFolderId: item._id })
        });

        const data = await res.json();
        alert(data.message);
        if (res.ok) {
            fetchData();
        }
    } catch (e) {
        alert("An error occurred during sync.");
    }
  };
  
  const closeAndResetYoutubeModal = () => {
    setShowAddYoutubeModal(false);
    setYoutubeData({ title: '', description: '', url: '', type: 'youtube_video', thumbnailUrl: '' });
    setPremiumSettings({ isPremium: false, dripDate: '' });
    setYoutubeModalView('input');
    setPlaylistVideos([]);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Study Material</h1>
            <div className="text-sm text-gray-500 breadcrumbs mt-2">
                <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:underline">Batches</span>
                {breadcrumbs.map((crumb, index) => (
                    <span key={index}> / <span onClick={() => handleBreadcrumbClick(index)} className="cursor-pointer hover:underline">{crumb.name}</span></span>
                ))}
            </div>
          </div>
          {currentBatch && (
            <div className="flex gap-2 mt-4 sm:mt-0">
                <button onClick={() => setShowCreateFolderModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
                    <Folder size={16} /> Create Folder
                </button>
                <button onClick={() => setShowUploadFileModal(true)} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                    <Upload size={16} /> Upload File
                </button>
                <button onClick={() => setShowAddYoutubeModal(true)} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
                    <Youtube size={16} /> Add YouTube Link
                </button>
            </div>
          )}
        </header>

        <main className="bg-white p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentItems.map(item => (
              <div key={item._id} className="relative group">
                <div
                    className="flex flex-col items-center justify-center p-4 border rounded-lg aspect-square cursor-pointer hover:bg-gray-50"
                    onClick={() => handleItemClick(item)}
                >
                    {item.type === 'folder' || !currentBatch ? <Folder className="w-16 h-16 text-blue-400" /> : <FileTypeIcon item={item} />}
                    <span className="text-center text-sm mt-2 break-all">{item.batchName || item.title}</span>
                    {item.type === 'file' && <span className="text-xs text-gray-400">{getFileExtension(item.resourceUrl)}</span>}
                </div>
                {currentBatch && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex flex-col gap-2">
                        {item.youtubePlaylistId && (
                             <button onClick={() => handleSyncPlaylist(item)} className="p-1.5 bg-white rounded-full shadow hover:bg-blue-50" title="Sync Playlist">
                                <RefreshCw size={16} className="text-blue-500"/>
                            </button>
                        )}
                        <button onClick={() => handleDelete(item)} className="p-1.5 bg-white rounded-full shadow hover:bg-red-50" title="Delete">
                            <Trash2 size={16} className="text-red-500"/>
                        </button>
                    </div>
                )}
              </div>
            ))}
          </div>
          {currentItems.length === 0 && (
            <div className="text-center py-16 text-gray-500">
                This folder is empty.
            </div>
          )}
        </main>
      </div>

      {showVideoPlayer && <VideoPlayer src={videoUrl} title={videoTitle} onClose={() => setShowVideoPlayer(false)} isYoutube={isYoutubeVideo} />}

      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
                <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder Name" className="w-full p-2 border rounded-md mb-4"/>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowCreateFolderModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleCreateFolder} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Create</button>
                </div>
            </div>
        </div>
      )}
        {showUploadFileModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                    <h3 className="text-lg font-semibold mb-4">Upload File</h3>
                    <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded-md mb-4"/>
                    <input type="text" value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="Optional: Rename file" className="w-full p-2 border rounded-md mb-4"/>
                    {thumbnailFile && <img src={URL.createObjectURL(thumbnailFile)} alt="Thumbnail preview" className="w-full h-auto rounded-md mb-4" />}
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setShowUploadFileModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        <button onClick={handleUploadFile} className="px-4 py-2 bg-green-500 text-white rounded-lg">Upload</button>
                    </div>
                </div>
            </div>
        )}
      {showAddYoutubeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-4 rounded-lg w-full max-w-3xl">
                <h3 className="text-lg font-semibold mb-3">Add YouTube Content</h3>
                
                {youtubeModalView === 'input' ? (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input type="url" value={youtubeData.url} onChange={e => setYoutubeData(p => ({...p, url: e.target.value}))} placeholder="YouTube URL (Video or Playlist)" className="flex-grow p-1.5 border rounded-md text-sm"/>
                                <button onClick={handleFetchYoutubeDetails} disabled={isFetchingYoutube} className="p-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300">
                                    {isFetchingYoutube ? "..." : <Sparkles size={18} />}
                                </button>
                            </div>
                            <input type="text" value={youtubeData.title} onChange={e => setYoutubeData(p => ({...p, title: e.target.value}))} placeholder="Title (auto-filled for single video)" className="w-full p-1.5 border rounded-md text-sm"/>
                        </div>

                        <div className="border-t pt-3 mt-3 space-y-3">
                            <h4 className="font-semibold text-base">Access Settings</h4>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isPremium" checked={premiumSettings.isPremium} onChange={e => setPremiumSettings(p => ({...p, isPremium: e.target.checked}))} />
                                <label htmlFor="isPremium" className="text-sm">This is Premium Content</label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <label htmlFor="dripDate" className="text-sm">Release Date (Optional)</label>
                            </div>
                            <input type="date" id="dripDate" value={premiumSettings.dripDate} onChange={e => setPremiumSettings(p => ({...p, dripDate: e.target.value}))} className="w-full p-1.5 border rounded-md text-sm"/>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={closeAndResetYoutubeModal} className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm">Cancel</button>
                            <button onClick={handleAddSingleYoutubeLink} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm">Add Content</button>
                        </div>
                    </>
                ) : (
                    <div>
                        <h4 className="font-semibold text-base">Confirm Playlist Addition</h4>
                        <p className="text-sm text-gray-600 mt-2">
                            Found <strong>{playlistVideos.length}</strong> videos in the playlist titled "{youtubeData.title}".
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            A new folder will be created with this title, and all videos will be added inside it.
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setYoutubeModalView('input')} className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm" disabled={isAddingPlaylist}>Back</button>
                            <button onClick={handleAddPlaylistVideos} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm" disabled={isAddingPlaylist}>
                                {isAddingPlaylist ? 'Adding...' : 'Add All Videos'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}