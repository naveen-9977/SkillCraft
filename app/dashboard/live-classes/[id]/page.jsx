'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HMSRoomProvider, useHMSActions, useHMSStore, selectPeers, selectLocalPeer, selectIsConnectedToRoom } from '@100mslive/react-sdk';
import '../styles/NewLiveClass.css';

// Icon component for the control bar
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// Main component to render the live class UI
const LiveClassUI = () => {
    const { id: classId } = useParams();
    const router = useRouter();
    const hmsActions = useHMSActions();
    const peers = useHMSStore(selectPeers);
    const localPeer = useHMSStore(selectLocalPeer);
    const isConnected = useHMSStore(selectIsConnectedToRoom);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const joinRoom = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/live-classes/get-token?room=${classId}`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch token.');
                }
                await hmsActions.join({ authToken: data.token, userName: localPeer.name });
            } catch (err) {
                setError(err.message || 'An error occurred while joining the room.');
                console.error("Join Room Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (classId && localPeer) {
            joinRoom();
        }

        return () => {
            hmsActions.leave();
        };
    }, [classId, localPeer, hmsActions]);

    const handleLeave = () => {
        hmsActions.leave();
        router.push('/dashboard/live-classes');
    };
    
    // You can customize this further with more controls
    const toggleAudio = () => hmsActions.setLocalAudioEnabled(!localPeer.isLocalAudioEnabled);
    const toggleVideo = () => hmsActions.setLocalVideoEnabled(!localPeer.isLocalVideoEnabled);

    if (isLoading && !isConnected) return <div className="status-container"><div className="loader"></div></div>;
    if (error) return <div className="status-container">Error: {error}</div>;

    return (
        <div className="live-class-container">
            <header className="live-class-header">
                <h1>Live Class</h1>
                <p>{peers.length} participants</p>
            </header>

            <main className="video-grid-container">
                {peers.map((peer) => (
                    <div key={peer.id} className="participant-video">
                        <VideoComponent peer={peer} />
                        <div className="participant-name-overlay">{peer.name}</div>
                    </div>
                ))}
            </main>

            {localPeer && (
                <footer className="controls-bar-floating">
                    <button onClick={toggleAudio} className={`control-btn ${!localPeer.isLocalAudioEnabled ? 'active' : ''}`}>
                        {!localPeer.isLocalAudioEnabled ? 
                            <Icon path="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /> : 
                            <Icon path="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.124-.082a9.008 9.008 0 0 1 8.61 8.61c-.026.375-.052.751-.082 1.124a2.25 2.25 0 0 1-2.192 1.976v-1.642m-5.25-6.375v1.5m-3-3v3M15 12v-1.5m3 1.5v-3m-3-3H9m6 6H9" />
                        }
                    </button>
                    <button onClick={toggleVideo} className={`control-btn ${!localPeer.isLocalVideoEnabled ? 'active' : ''}`}>
                        {!localPeer.isLocalVideoEnabled ? 
                            <Icon path="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /> : 
                            <Icon path="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        }
                    </button>
                    <button className="control-btn end-call" onClick={handleLeave}>
                        <Icon path="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H9" />
                    </button>
                </footer>
            )}
        </div>
    );
};

// Component to render a video feed from a peer
const VideoComponent = ({ peer }) => {
    const videoRef = useRef(null);
    const hmsActions = useHMSActions();

    useEffect(() => {
        if (videoRef.current && peer.videoTrack) {
            hmsActions.attachVideo(peer.videoTrack, videoRef.current);
        }

        return () => {
            if (videoRef.current && peer.videoTrack) {
                hmsActions.detachVideo(peer.videoTrack, videoRef.current);
            }
        };
    }, [peer.videoTrack, hmsActions]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={peer.isLocal} // Mute local video preview
            className="w-full h-full"
        />
    );
};

const LiveClassPageWrapper = () => {
    return (
        <HMSRoomProvider>
            <LiveClassUI />
        </HMSRoomProvider>
    );
};

export default LiveClassPageWrapper;