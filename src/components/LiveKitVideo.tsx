import React, { useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { runtimeConfig } from '@/lib/runtime-config';

export const LiveKitVideo: React.FC = () => {
    const [roomName, setRoomName] = useState('my-room');
    const [participantName, setParticipantName] = useState('');
    const [token, setToken] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName || !participantName) {
            alert('Please enter room and participant name');
            return;
        }

        try {
            const response = await fetch('/api/livekit/get-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room_name: roomName,
                    participant_identity: participantName, // Using name as identity for simplicity
                    participant_name: participantName,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setToken(data.token);
            } else {
                throw new Error(data.detail || 'Failed to get token');
            }
        } catch (error) {
            console.error(error);
            alert('Error getting token');
        }
    };

    if (token) {
        return (
            <LiveKitRoom
                serverUrl={runtimeConfig.livekitUrl}
                token={token}
                connect={true}
                style={{ height: '100vh' }}
            >
                <VideoConference />
            </LiveKitRoom>
        );
    }

    return (
        <div>
            <h2>Join LiveKit Room</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Room Name:</label>
                    <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Participant Name:</label>
                    <input
                        type="text"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Join</button>
            </form>
        </div>
    );
}; 