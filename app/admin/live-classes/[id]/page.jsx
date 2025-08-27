'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import '../styles/NewLiveClass.css'; // Make sure this path is correct for both files

// Icon component for the control bar
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const LiveClassPage = () => {
    const { id: classId } = useParams();
    const router = useRouter();
    const [classDetails, setClassDetails] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideosRef = useRef(null);
    const peerConnections = useRef({});
    const localStream = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // FIX: Create a buffer for ICE candidates that arrive early
    const iceCandidateBuffer = useRef({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const userRes = await fetch('/api/auth/user');
                const userData = await userRes.json();
                if (!userRes.ok || !userData.success) {
                    router.push('/login');
                    return;
                }
                setCurrentUser(userData.user);

                const classRes = await axios.get(`/api/live-classes/${classId}`);
                if (!classRes.data.success) {
                    throw new Error(classRes.data.message);
                }
                setClassDetails(classRes.data.data.classDetails);
                setParticipants(classRes.data.data.participants);

            } catch (err) {
                setError(err.message || 'Failed to load class data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [classId, router]);

    useEffect(() => {
        if (isLoading || !currentUser || !classDetails) return;

        const startMediaAndSignaling = async () => {
            try {
                localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream.current;
                }

                participants.forEach(participant => {
                    if (participant._id !== currentUser._id) {
                        initiateConnection(participant._id);
                    }
                });

                const poller = setInterval(pollSignalingServer, 3000);

                return () => {
                    clearInterval(poller);
                    if (localStream.current) {
                        localStream.current.getTracks().forEach(track => track.stop());
                    }
                    Object.values(peerConnections.current).forEach(pc => pc.close());
                };
            } catch (err) {
                setError('Failed to access camera/microphone. Please grant permission.');
            }
        };

        const cleanupPromise = startMediaAndSignaling();
        return () => {
            cleanupPromise.then(cleanup => {
                if (cleanup) cleanup();
            });
        };
    }, [isLoading, currentUser, classDetails, participants]);

    const pollSignalingServer = async () => {
        if (!classId) return;
        try {
            const { data } = await axios.get(`/api/live-class-signaling?classId=${classId}`);
            if (data.messages) {
                for (const message of data.messages) {
                    await handleSignalingMessage(message);
                }
            }
        } catch (err) {
            if (err.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Polling Error Response:", err.response.data);
                if (err.response.status === 401) {
                    setError("Your session has expired. Please log in again.");
                    router.push('/login');
                } else {
                    setError(`A server error occurred (Status: ${err.response.status}). Please check the console for details.`);
                }
            } else if (err.request) {
                // The request was made but no response was received
                console.error("Polling Network Error:", err.request);
                setError("A network error occurred. Please check your connection.");
            } else {
                // Something else happened while setting up the request
                console.error("Polling Setup Error:", err.message);
                setError("An unexpected error occurred.");
            }
        }
    };

    const handleSignalingMessage = async ({ senderId, messageType, payload }) => {
        let pc = peerConnections.current[senderId];
        if (!pc) pc = createPeerConnection(senderId);

        // FIX: If the remote description isn't set yet, buffer the candidate
        if (messageType === 'candidate' && !pc.remoteDescription) {
            if (!iceCandidateBuffer.current[senderId]) {
                iceCandidateBuffer.current[senderId] = [];
            }
            iceCandidateBuffer.current[senderId].push(payload);
            return;
        }

        if (messageType === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignalingMessage(senderId, 'answer', answer);
        } else if (messageType === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(payload));
        } else if (messageType === 'candidate') {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(payload));
            } catch (e) { 
                console.error('Error adding received ICE candidate', e); 
            }
        }
        
        // FIX: After setting a remote description, process any buffered candidates
        if ((messageType === 'offer' || messageType === 'answer') && iceCandidateBuffer.current[senderId]) {
            for (const candidate of iceCandidateBuffer.current[senderId]) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('Error adding buffered ICE candidate', e);
                }
            }
            delete iceCandidateBuffer.current[senderId];
        }
    };

    const createPeerConnection = (remoteUserId) => {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));
        }
        pc.ontrack = (event) => addRemoteStream(remoteUserId, event.streams[0]);
        pc.onicecandidate = (event) => {
            if (event.candidate) sendSignalingMessage(remoteUserId, 'candidate', event.candidate);
        };
        peerConnections.current[remoteUserId] = pc;
        return pc;
    };

    const initiateConnection = (remoteUserId) => {
        const pc = createPeerConnection(remoteUserId);
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .then(() => {
                if (pc.localDescription) sendSignalingMessage(remoteUserId, 'offer', pc.localDescription);
            });
    };

    const sendSignalingMessage = async (receiverId, messageType, payload) => {
        await axios.post('/api/live-class-signaling', { classId, receiverId, messageType, payload });
    };

    const addRemoteStream = (userId, stream) => {
        if (!remoteVideosRef.current || document.getElementById(`video-container-${userId}`)) return;

        const container = document.createElement('div');
        container.id = `video-container-${userId}`;
        container.className = 'participant-video';

        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;

        const nameTag = document.createElement('div');
        nameTag.className = 'participant-name-overlay';
        const participant = participants.find(p => p._id === userId);
        nameTag.innerText = participant ? participant.name : 'Participant';
        
        container.appendChild(video);
        container.appendChild(nameTag);
        remoteVideosRef.current.appendChild(container);
    };

    const toggleAudio = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
            setIsMuted(prev => !prev);
        }
    };

    const toggleVideo = () => {
        if (localStream.current) {
            localStream.current.getVideoTracks().forEach(track => { track.enabled = !track.enabled; });
            setIsCameraOff(prev => !prev);
        }
    };

    if (isLoading) return <div className="status-container"><div className="loader"></div></div>;
    if (error) return <div className="status-container">Error: {error}</div>;

    return (
        <div className="live-class-container">
            <header className="live-class-header">
                <h1>{classDetails?.topic}</h1>
                <p>{participants.length} participants</p>
            </header>
            
            <main ref={remoteVideosRef} className="video-grid-container"></main>

            <div className="local-video-pip">
                <video ref={localVideoRef} autoPlay playsInline muted />
                <div className="participant-name-overlay">You</div>
            </div>

            <footer className="controls-bar-floating">
                <button onClick={toggleAudio} className={`control-btn ${isMuted ? 'active' : ''}`}>
                    {isMuted ? 
                        <Icon path="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /> : 
                        <Icon path="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.124-.082a9.008 9.008 0 0 1 8.61 8.61c-.026.375-.052.751-.082 1.124a2.25 2.25 0 0 1-2.192 1.976v-1.642m-5.25-6.375v1.5m-3-3v3M15 12v-1.5m3 1.5v-3m-3-3H9m6 6H9" />
                    }
                </button>
                <button onClick={toggleVideo} className={`control-btn ${isCameraOff ? 'active' : ''}`}>
                    {isCameraOff ? 
                        <Icon path="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /> : 
                        <Icon path="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    }
                </button>
                <button className="control-btn end-call" onClick={() => window.location.href = '/dashboard/live-classes'}>
                    <Icon path="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H9" />
                </button>
            </footer>
        </div>
    );
};

export default LiveClassPage;