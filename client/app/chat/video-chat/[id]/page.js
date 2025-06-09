'use client';
import { use, useEffect, useState, useRef } from 'react';
import { useChat } from '../../../../contexts/ChatContext';

export default function VideoChatPage({ params }) {
    const { id } = use(params);
    const { peer, socket, name, peerId } = useChat();
    
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState(null);
    const [participants, setParticipants] = useState(0);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState('');
    const [currentStream, setCurrentStream] = useState(null);
    const [showCameraSettings, setShowCameraSettings] = useState(false);
    const [peers, setPeers] = useState({});
    const [videoStreams, setVideoStreams] = useState({});
    
    const localPeersRef = useRef({});

    useEffect(() => {
        if (!name) {
            window.location.href = '/';
            return;
        }
        
        if (!peer || !socket || !name || !peerId) return;

        const initializeCameras = async () => {
            try {
                // Clear existing video streams
                setVideoStreams({});
                
                // Get available cameras
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setAvailableCameras(videoDevices);
                
                // Set default camera if none selected
                const defaultCameraId = selectedCameraId || (videoDevices.length > 0 ? videoDevices[0].deviceId : null);
                if (defaultCameraId && !selectedCameraId) {
                    setSelectedCameraId(defaultCameraId);
                }

                // Get user media with selected or default camera
                const stream = await getUserMediaWithCamera(defaultCameraId);
                setCurrentStream(stream);
                
                // Add self to video streams
                setVideoStreams(prev => ({
                    ...prev,
                    [peerId]: {
                        stream: stream,
                        userName: name,
                        isSelf: true,
                        peerId: peerId
                    }
                }));
                
                setIsConnecting(false);
                setParticipants(1);

                // Clear any existing event listeners
                peer.removeAllListeners('call');
                socket.removeAllListeners('user_joined_video_chat');

                peer.on('call', (call) => {
                    console.log('Receiving call from:', call.peer);
                    call.answer(stream);
                    
                    // Check if we already have this peer
                    if (localPeersRef.current[call.peer]) {
                        console.log('Already connected to peer:', call.peer);
                        return;
                    }
                    
                    call.on('stream', (userVideoStream) => {
                        setVideoStreams(prev => ({
                            ...prev,
                            [call.peer]: {
                                stream: userVideoStream,
                                userName: 'Unknown User',
                                isSelf: false,
                                peerId: call.peer
                            }
                        }));
                        setParticipants(prev => prev + 1);
                    });
                    
                    call.on('close', () => {
                        setVideoStreams(prev => {
                            const newStreams = { ...prev };
                            delete newStreams[call.peer];
                            return newStreams;
                        });
                        setParticipants(prev => Math.max(1, prev - 1));
                    });
                    
                    localPeersRef.current[call.peer] = call;
                });

                socket.on('user_joined_video_chat', (data) => {
                    console.log('User joined video chat:', data);
                    const { user } = data;
                    if (user && user.peerId && user.peerId !== peerId) {
                        if (localPeersRef.current[user.peerId]) {
                            console.log('Already connected to peer:', user.peerId);
                            return;
                        }
                        connectToNewUser(user.peerId, stream, user.name || 'Unknown User');
                    }
                });

                // Join the video chat room
                console.log('Joining video chat with ID:', id);
                socket.emit('join_video_chat', id, { name: name, peerId: peerId });

            } catch (error) {
                console.error('Error accessing media devices.', error);
                setError('Failed to access camera/microphone. Please check permissions.');
                setIsConnecting(false);
            }
        };

        initializeCameras();

        socket.on('user_left_video_chat', (data) => {
            console.log('User left video chat:', data);
            const { user } = data;
            if (user && user.peerId && localPeersRef.current[user.peerId]) {
                localPeersRef.current[user.peerId].close();
                delete localPeersRef.current[user.peerId];
                
                setVideoStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[user.peerId];
                    return newStreams;
                });
                
                setParticipants(prev => Math.max(1, prev - 1));
            }
        });

        function connectToNewUser(userPeerId, stream, userName = 'Unknown User') {
            if (localPeersRef.current[userPeerId]) {
                console.log('Already connected to peer:', userPeerId);
                return;
            }
            
            console.log('Connecting to new user:', userPeerId, userName);
            const call = peer.call(userPeerId, stream);
            
            call.on('stream', (userVideoStream) => {
                setVideoStreams(prev => ({
                    ...prev,
                    [userPeerId]: {
                        stream: userVideoStream,
                        userName: userName,
                        isSelf: false,
                        peerId: userPeerId
                    }
                }));
                setParticipants(prev => prev + 1);
            });
            
            call.on('close', () => {
                setVideoStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[userPeerId];
                    return newStreams;
                });
                setParticipants(prev => Math.max(1, prev - 1));
            });
            
            call.on('error', (err) => {
                console.error('Call error:', err);
                setVideoStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[userPeerId];
                    return newStreams;
                });
            });
            
            localPeersRef.current[userPeerId] = call;
            setPeers(prev => ({ ...prev, [userPeerId]: call }));
        }

        // Cleanup function
        return () => {
            // Close all peer connections
            Object.values(localPeersRef.current).forEach(call => call.close());
            localPeersRef.current = {};
            
            // Remove socket listeners
            socket.off('user_joined_video_chat');
            socket.off('user_left_video_chat');
            
            // Stop media tracks
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
            
            // Leave the video chat room
            socket.emit('leave_video_chat', id, { name: name, peerId: peerId });
        };
    }, [id, peer, socket, name, peerId, selectedCameraId]);

    // Keyboard shortcuts for camera switching
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') return;
            
            if (event.key.toLowerCase() === 'c' && availableCameras.length > 1) {
                setShowCameraSettings(prev => !prev);
            }
            
            const keyNum = parseInt(event.key);
            if (keyNum >= 1 && keyNum <= 9 && keyNum <= availableCameras.length) {
                const targetCamera = availableCameras[keyNum - 1];
                if (targetCamera && targetCamera.deviceId !== selectedCameraId) {
                    switchCamera(targetCamera.deviceId);
                }
            }
            
            if (event.key === 'Escape' && showCameraSettings) {
                setShowCameraSettings(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [availableCameras, selectedCameraId, showCameraSettings]);

    // Get user media with specific camera
    const getUserMediaWithCamera = async (cameraId = null) => {
        const constraints = {
            video: cameraId ? { deviceId: { exact: cameraId } } : true,
            audio: true
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            return stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    };

    // Switch camera
    const switchCamera = async (newCameraId) => {
        if (newCameraId === selectedCameraId) return;
        
        try {
            setIsConnecting(true);
            setError(null);
            
            // Get new stream with selected camera
            const newStream = await getUserMediaWithCamera(newCameraId);
            
            // Stop current stream only after successfully getting new stream
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
            
            setCurrentStream(newStream);
            setSelectedCameraId(newCameraId);

            // Update self video stream
            setVideoStreams(prev => ({
                ...prev,
                [peerId]: {
                    ...prev[peerId],
                    stream: newStream
                }
            }));

            // Update all peer connections with new stream
            const videoTrack = newStream.getVideoTracks()[0];
            const audioTrack = newStream.getAudioTracks()[0];
            
            Object.values(peers).forEach(call => {
                if (call.peerConnection) {
                    // Replace video track
                    const videoSender = call.peerConnection.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    );
                    if (videoSender && videoTrack) {
                        videoSender.replaceTrack(videoTrack).catch(err => {
                            console.error('Failed to replace video track:', err);
                        });
                    }
                    
                    // Replace audio track
                    const audioSender = call.peerConnection.getSenders().find(s => 
                        s.track && s.track.kind === 'audio'
                    );
                    if (audioSender && audioTrack) {
                        audioSender.replaceTrack(audioTrack).catch(err => {
                            console.error('Failed to replace audio track:', err);
                        });
                    }
                }
            });

            setIsConnecting(false);
            setShowCameraSettings(false);
        } catch (error) {
            console.error('Error switching camera:', error);
            setError('Failed to switch camera. Please try again.');
            setIsConnecting(false);
        }
    };

    const copyVideoIdToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(id);
            setShowCopiedToast(true);
            setTimeout(() => setShowCopiedToast(false), 3000);
        } catch (err) {
            console.error('Failed to copy video ID:', err);
            const textArea = document.createElement('textarea');
            textArea.value = id;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setShowCopiedToast(true);
                setTimeout(() => setShowCopiedToast(false), 3000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr);
            }
            document.body.removeChild(textArea);
        }
    };

    const shareVideoChat = async () => {
        const shareData = {
            title: 'Join my video chat!',
            text: `Join my video chat using this ID: ${id}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                copyVideoIdToClipboard();
            }
        } catch (err) {
            console.error('Error sharing:', err);
            copyVideoIdToClipboard();
        }
    };

    // Video component for rendering individual videos
    const VideoComponent = ({ videoData }) => {
        const videoRef = useRef(null);

        useEffect(() => {
            if (videoRef.current && videoData.stream) {
                videoRef.current.srcObject = videoData.stream;
            }
        }, [videoData.stream]);

        const handleVideoClick = () => {
            if (videoRef.current && videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        };

        return (
            <div className={`relative rounded-lg overflow-hidden ${
                videoData.isSelf ? 'border-4 border-blue-500' : 'border-2 border-gray-600'
            }`}>
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover cursor-pointer"
                    autoPlay
                    playsInline
                    muted={videoData.isSelf}
                    onClick={handleVideoClick}
                    title="Click to fullscreen"
                />
                <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-semibold text-white ${
                    videoData.isSelf ? 'bg-blue-600' : 'bg-black bg-opacity-70'
                }`}>
                    {videoData.isSelf ? `${videoData.userName} (You)` : videoData.userName}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="relative w-full h-screen bg-gray-900">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold">Video Chat</h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs opacity-75">ID:</span>
                                <code className="text-xs bg-gray-700 px-2 py-1 rounded font-mono break-all">
                                    <span className="sm:hidden">{id.length > 15 ? `${id.substring(0, 15)}...` : id}</span>
                                    <span className="hidden sm:inline">{id.length > 25 ? `${id.substring(0, 25)}...` : id}</span>
                                </code>
                                <button
                                    onClick={copyVideoIdToClipboard}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
                                    title="Copy video chat ID"
                                >
                                    📋
                                </button>
                                <button
                                    onClick={shareVideoChat}
                                    className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded transition-colors"
                                    title="Share video chat"
                                >
                                    📤
                                </button>
                                {availableCameras.length > 1 && (
                                    <button
                                        onClick={() => setShowCameraSettings(!showCameraSettings)}
                                        className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded transition-colors"
                                        title="Camera settings"
                                    >
                                        📹
                                    </button>
                                )}
                            </div>
                            <p className="text-sm opacity-75 mt-1">Participants: {participants}</p>
                        </div>
                        <div className="flex gap-2">
                            {name && (
                                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                                    {name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Camera Settings Panel */}
                {showCameraSettings && (
                    <div className="absolute top-20 left-4 z-20 bg-black bg-opacity-90 text-white p-4 rounded shadow-lg max-w-xs">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold">Camera Settings</h3>
                            <button
                                onClick={() => setShowCameraSettings(false)}
                                className="text-gray-400 hover:text-white text-lg"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-300 mb-1">Select Camera:</label>
                                <select
                                    value={selectedCameraId}
                                    onChange={(e) => switchCamera(e.target.value)}
                                    className="w-full bg-gray-700 text-white text-xs p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                                    disabled={isConnecting}
                                >
                                    {availableCameras.map((camera, index) => (
                                        <option key={camera.deviceId} value={camera.deviceId}>
                                            {`${index + 1}. ${camera.label || `Camera ${index + 1}`}`}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    💡 Press C to toggle, 1-{availableCameras.length} to switch, Esc to close
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={async () => {
                                        try {
                                            const devices = await navigator.mediaDevices.enumerateDevices();
                                            const videoDevices = devices.filter(device => device.kind === 'videoinput');
                                            setAvailableCameras(videoDevices);
                                        } catch (error) {
                                            console.error('Error refreshing cameras:', error);
                                        }
                                    }}
                                    className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                                    disabled={isConnecting}
                                >
                                    🔄 Refresh
                                </button>
                                <span className="text-xs text-gray-400">
                                    {availableCameras.length} camera(s)
                                </span>
                            </div>
                            
                            {isConnecting && (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400"></div>
                                    <p className="text-xs text-yellow-400">Switching camera...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Copied Toast */}
                {showCopiedToast && (
                    <div className="absolute top-20 right-4 z-20 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-slide-in">
                        ✅ Video ID copied to clipboard!
                    </div>
                )}

                {/* Loading/Error States */}
                {isConnecting && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
                        <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Connecting to video chat...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
                        <div className="text-center text-white max-w-md">
                            <div className="text-red-500 text-4xl mb-4">⚠️</div>
                            <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
                            <p className="text-gray-300 mb-4">{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Video Grid */}
                <section 
                    className="w-full h-screen pt-16 relative"
                    style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gridAutoRows: '300px',
                        gap: '10px',
                        padding: '10px'
                    }}
                >
                    {/* Camera switching overlay */}
                    {isConnecting && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-30">
                            <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span className="text-sm">Switching camera...</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Render video streams using React state */}
                    {Object.entries(videoStreams).map(([peerId, videoData]) => (
                        <VideoComponent key={peerId} videoData={videoData} />
                    ))}
                </section>

                {/* Instructions */}
                {!error && participants === 1 && !isConnecting && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                        <div className="text-center">
                            <p className="text-sm">Share this video chat with others:</p>
                            <div className="flex items-center gap-2 mt-2">
                                <code className="text-xs bg-gray-700 px-2 py-1 rounded font-mono">
                                    {id}
                                </code>
                                <button
                                    onClick={copyVideoIdToClipboard}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
                                >
                                    Copy ID
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
