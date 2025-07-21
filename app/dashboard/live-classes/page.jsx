"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { MdOutlineVideocam } from "react-icons/md";

// NEW: LiveClassRoom Component (conceptual WebRTC integration)
// This component is for demonstration purposes and needs a full signaling server
// and STUN/TURN server setup for a real-world WebRTC implementation.
const LiveClassRoom = ({ classId, classLink, calculatedStatus }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [rtcStatus, setRtcStatus] = useState("Initializing WebRTC...");
  const isLive = calculatedStatus === 'Live Now';

  useEffect(() => {
    if (!isLive) {
      setRtcStatus("Class is not live.");
      // Stop any active streams if class is no longer live
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        remoteVideoRef.current.srcObject = null;
      }
      return;
    }

    let localStream;
    let peerConnection;

    const startWebRTC = async () => {
      try {
        setRtcStatus("Requesting media access...");
        // 1. Get local media (camera/microphone)
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        setRtcStatus("Local media ready. Connecting...");

        // 2. Create RTCPeerConnection
        // In a real app, you'd configure STUN/TURN servers here for NAT traversal
        // Example: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        peerConnection = new RTCPeerConnection();

        // 3. Add local stream to peer connection
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });

        // 4. Handle remote stream (when another peer connects)
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setRtcStatus("Remote peer connected. Class in session.");
        };

        // 5. Handle ICE candidates (for network traversal)
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            // In a real app, send event.candidate to remote peer via signaling server
            console.log("Sending ICE candidate:", event.candidate);
          }
        };

        // 6. Signaling (Conceptual):
        // This is where you'd typically send SDP offers/answers via a WebSocket server
        // Example (conceptual):
        // const ws = new WebSocket('ws://localhost:3001'); // Your signaling server
        // ws.onopen = () => ws.send(JSON.stringify({ type: 'join', classId }));
        // ws.onmessage = async (message) => { /* handle offer/answer/candidate */ };
        // peerConnection.createOffer().then(offer => peerConnection.setLocalDescription(offer)).then(() => {
        //   ws.send(JSON.stringify({ type: 'offer', sdp: peerConnection.localDescription }));
        // });

        setRtcStatus("Waiting for mentor/other participants...");

      } catch (err) {
        console.error("Error accessing media devices or starting WebRTC:", err);
        setRtcStatus(`Error: ${err.message}. Please ensure camera/mic access.`);
      }
    };

    // Only attempt WebRTC if it's an "internal" class and currently live
    if ((classLink === '' || classLink === 'internal') && isLive) {
      startWebRTC();
    } else if (classLink && isLive) {
      setRtcStatus("This is an external class. Click 'Go to External Class' to join.");
    }

    // Cleanup function: stop media tracks and close peer connection
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
      console.log("WebRTC cleanup complete.");
    };

  }, [classId, isLive, classLink, calculatedStatus]); // Rerun effect if these props change

  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white flex flex-col items-center justify-center min-h-[400px]">
      <h3 className="text-lg font-semibold mb-2">Live Class Status: {rtcStatus}</h3>
      <div className="relative w-full max-w-2xl aspect-video bg-black rounded-md overflow-hidden">
        {/* Local video stream (your camera) */}
        <video ref={localVideoRef} autoPlay muted className="absolute top-2 right-2 w-1/4 h-auto rounded-md border-2 border-blue-500 z-10" />
        {/* Remote video stream (mentor/other students) */}
        <video ref={remoteVideoRef} autoPlay className="w-full h-full object-contain" />
      </div>
      <p className="text-sm mt-4 text-gray-400">
        {classLink && classLink !== 'internal' ? `External Class Link: ${classLink}` : "Internal Live Class"}
      </p>
      {calculatedStatus === 'Ended' && <p className="text-sm text-red-400">This class has ended.</p>}
      {calculatedStatus === 'Upcoming' && <p className="text-sm text-yellow-400">This class is upcoming.</p>}
      {calculatedStatus === 'Inactive' && <p className="text-sm text-red-400">This class is currently inactive.</p>}
      
      {classLink && classLink !== 'internal' && isLive && (
        <a
          href={classLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <MdOutlineVideocam /> Go to External Class
        </a>
      )}
    </div>
  );
};


export default function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/live-classes");
      const data = await res.json();

      if (res.ok) {
        setLiveClasses(data.liveClasses);
      } else {
        if (res.status === 401) {
          setError("Session expired or invalid. Please log in again.");
          router.push('/login');
        } else if (res.status === 403) {
          setError(data.error || "You are not authorized to view live classes. Please ensure your account is approved and assigned to a batch.");
        } else {
          setError(data.error || "Failed to fetch live classes.");
        }
      }
    } catch (err) {
      console.error("Error fetching live classes:", err);
      setError("An error occurred while loading live classes.");
    } finally {
      setLoading(false);
    }
  };

  // Removed isClassLive, isClassUpcoming, isClassEnded as calculatedStatus is now provided by API

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="text-red-600 mb-4 text-center px-4">{error}</div>
        <button
          onClick={fetchLiveClasses}
          className="text-primary hover:underline mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Helper function to get status styling for student view
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Live Now': return 'bg-green-100 text-green-800';
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Ended': return 'bg-gray-100 text-gray-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };


  return (
    <div className="bg-zinc-50 py-10 px-4 lg:px-10">
      <div className="">
        <h1 className="text-xl mb-6">Your Live Classes</h1>
        {liveClasses.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded h-[80vh] flex items-center justify-center">
            <h3 className="text-zinc-500 text-xl lg:text-2xl font-medium">
              No live classes scheduled for your batches yet.
            </h3>
          </div>
        ) : (
          liveClasses.map((liveClass, index) => (
            <div
              className="mt-2 py-4 bg-white px-4 border-[1px] border-zinc-200 rounded flex flex-col gap-4"
              key={index}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{liveClass.title}</h2>
                  <p className="text-gray-600 text-sm mt-1">{liveClass.description}</p>
                  <p className="text-gray-600 text-sm mt-2">Mentor: {liveClass.mentor}</p>
                  <p className="text-gray-600 text-sm">
                    Batches: {liveClass.batchCodes.join(', ')}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Start: {format(new Date(liveClass.startTime), 'MMM dd, yyyy HH:mm')}
                  </p>
                  <p className="text-gray-600 text-sm">
                    End: {format(new Date(liveClass.endTime), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* NEW: Display calculated status from API */}
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusClasses(liveClass.calculatedStatus)}`}>
                    {liveClass.calculatedStatus}
                  </span>

                  {liveClass.isActive ? (
                    // Conditional rendering for internal vs. external class
                    liveClass.classLink === '' || liveClass.classLink === 'internal' ? (
                      <button
                        className={`text-white px-3 py-1 rounded-md transition-colors text-sm flex items-center gap-1 ${
                          liveClass.calculatedStatus === 'Live Now'
                            ? 'bg-primary hover:bg-primary/90'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (liveClass.calculatedStatus === 'Live Now') {
                            alert("Attempting to join internal live class. (WebRTC logic would go here)");
                            // In a real app, you'd render a modal or navigate to a dedicated internal class page
                            // For now, the LiveClassRoom component is rendered below the class details.
                          }
                        }}
                        disabled={liveClass.calculatedStatus !== 'Live Now'}
                      >
                        <MdOutlineVideocam /> {liveClass.calculatedStatus === 'Live Now' ? 'Join Internal Class' : 'Internal Class'}
                      </button>
                    ) : (
                      <a
                        href={liveClass.classLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-white px-3 py-1 rounded-md transition-colors text-sm flex items-center gap-1 ${
                          liveClass.calculatedStatus === 'Live Now'
                            ? 'bg-primary hover:bg-primary/90'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          if (liveClass.calculatedStatus !== 'Live Now') {
                            e.preventDefault();
                          }
                        }}
                      >
                        <MdOutlineVideocam /> {liveClass.calculatedStatus === 'Live Now' ? 'Join External Class' : 'View Link'}
                      </a>
                    )
                  ) : (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      INACTIVE (Admin Disabled)
                    </span>
                  )}
                </div>
              </div>
              {/* NEW: Render LiveClassRoom if it's an internal class and currently live */}
              {liveClass.isActive && (liveClass.classLink === '' || liveClass.classLink === 'internal') && liveClass.calculatedStatus === 'Live Now' && (
                <div className="mt-4">
                  <LiveClassRoom
                    classId={liveClass._id}
                    classLink={liveClass.classLink}
                    calculatedStatus={liveClass.calculatedStatus}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
