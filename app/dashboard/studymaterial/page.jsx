"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Folder, File as FileIcon, Video, Image as ImageIcon, X, Play, Pause, Volume2, VolumeX, Maximize, FastForward, Rewind, Youtube, Lock } from 'lucide-react';
import './videoplayer.css';
import './splitview.css';

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
            playPromise.catch(error => {
                if (isMounted) {
                    console.error("Autoplay was prevented:", error);
                }
            });
        }

        const handleContextMenu = (e) => e.preventDefault();
        video.addEventListener('contextmenu', handleContextMenu);


        return () => {
            isMounted = false;
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', setVideoDuration);
            video.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [isYoutube]);

    const resetControlsTimeout = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        setIsControlsVisible(true);
        controlsTimeoutRef.current = setTimeout(() => {
            setIsControlsVisible(false);
        }, 5000);
    };

    useEffect(() => {
        if(isYoutube) return;
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('mousemove', resetControlsTimeout);
        resetControlsTimeout();

        return () => {
            container.removeEventListener('mousemove', resetControlsTimeout);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isYoutube]);

    const togglePlayPause = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };
    
    const handleSeek = (seconds) => {
        videoRef.current.currentTime += seconds;
    };
    
    const handleDoubleClick = (e) => {
        const rect = videoRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) {
            handleSeek(-10);
        } else {
            handleSeek(10);
        }
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
        if (!newMutedState && volume === 0) {
            setVolume(1);
            videoRef.current.volume = 1;
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        return new Date(time * 1000).toISOString().substr(11, 8);
    }

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
                <div className="video-header">
                    <h3 className="video-title">{title}</h3>
                </div>
                <button onClick={onClose} className="video-player-close-btn"><X size={20} /></button>
                <video 
                    ref={videoRef} 
                    src={src} 
                    className="main-video" 
                    onClick={togglePlayPause}
                    onDoubleClick={handleDoubleClick}
                >
                    Your browser does not support the video tag.
                </video>
                <div className="video-controls-overlay">
                    <div className="progress-bar-container">
                        <input type="range" min="0" max={duration} value={progress} className="progress-bar" onChange={(e) => videoRef.current.currentTime = e.target.value} />
                    </div>
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
                                <option value="0.5">0.5x</option>
                                <option value="1">1x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </select>
                            <button onClick={toggleFullScreen}><Maximize /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function StudentStudyMaterialsPage() {
  const [batches, setBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBatch, setCurrentBatch] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch("/api/studymaterial");
      const data = await res.json();
      if (res.ok) {
        setBatches(data.batches);
        setMaterials(data.materials);
      } else {
        setError(data.error || "Failed to fetch your study materials.");
      }
    } catch (err) {
      setError("An error occurred while loading your materials.");
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (url) => {
    if (!url) return null;
    try {
        const urlParts = new URL(url, window.location.origin).pathname.split('.');
        return urlParts.length > 1 ? urlParts.pop().toLowerCase() : null;
    } catch (e) {
        return null;
    }
  };

  const isVideoFile = (item) => {
    if (item.type === 'youtube_video' || item.type === 'youtube_playlist') return true;
    const videoExtensions = ['mp4', 'mov', 'webm', 'ogg'];
    const extension = getFileExtension(item.resourceUrl);
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
        case 'mp4': case 'mov': return <Video className="w-16 h-16 text-red-400" />;
        case 'jpg': case 'jpeg': case 'png': case 'gif': return <ImageIcon className="w-16 h-16 text-green-400" />;
        case 'pdf': return <FileIcon className="w-16 h-16 text-purple-400" />;
        default: return <FileIcon className="w-16 h-16 text-gray-400" />;
    }
  };

  const { currentItems } = useMemo(() => {
    if (!currentBatch) {
      return { currentItems: batches };
    }
    const items = materials.filter(m => m.batchCode === currentBatch.batchCode && m.parent === currentFolderId);
    return {
        currentItems: items.sort((a, b) => a.type === 'folder' ? -1 : 1),
    };
  }, [currentBatch, currentFolderId, batches, materials]);

  const handleItemClick = (item) => {
      if (item.isPremium) {
          alert("This is premium content. Please upgrade your membership to access.");
          return;
      }
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
            setShowVideoPlayer(true);
            setIsYoutubeVideo(!!item.youtubeUrl);
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
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading your materials...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Study Material</h1>
           <div className="text-sm text-gray-500 breadcrumbs mt-2">
                <span onClick={() => handleBreadcrumbClick(-1)} className="cursor-pointer hover:underline">Batches</span>
                {breadcrumbs.map((crumb, index) => (
                    <span key={index}>
                        <span className="mx-2">/</span>
                        <span onClick={() => handleBreadcrumbClick(index)} className="cursor-pointer hover:underline">{crumb.name}</span>
                    </span>
                ))}
            </div>
        </header>

        <main className="bg-white p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentItems.map(item => (
              <div 
                key={item._id} 
                className="flex flex-col items-center justify-center p-4 border rounded-lg aspect-square cursor-pointer hover:bg-gray-50 relative"
                onClick={() => handleItemClick(item)}
              >
                {item.isPremium && (
                    <div className="absolute top-2 right-2 p-1.5 bg-yellow-400 rounded-full text-white">
                        <Lock size={14} />
                    </div>
                )}
                {item.type === 'folder' || !currentBatch ? <Folder className="w-16 h-16 text-blue-400" /> : <FileTypeIcon item={item} />}
                <span className="text-center text-sm mt-2 break-all">{item.batchName || item.title}</span>
                {item.type === 'file' && <span className="text-xs text-gray-400">{getFileExtension(item.resourceUrl)}</span>}
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
    </div>
  );
}