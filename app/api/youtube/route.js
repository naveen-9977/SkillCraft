import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
    try {
        const { url } = await req.json();
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "YouTube API key is not configured." }, { status: 500 });
        }

        const urlParams = new URLSearchParams(new URL(url).search);
        const videoId = urlParams.get('v');
        const playlistId = urlParams.get('list');

        if (playlistId) {
            // --- HANDLE PLAYLIST ---
            // 1. Get playlist details (for the title)
            const playlistDetailsRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&key=${apiKey}&part=snippet`);
            const playlistDetails = playlistDetailsRes.data.items[0]?.snippet;

            if (!playlistDetails) {
                return NextResponse.json({ error: "Could not fetch playlist details from YouTube." }, { status: 404 });
            }

            // 2. Get all video items in the playlist
            const playlistItemsRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
                params: {
                    part: 'snippet',
                    playlistId: playlistId,
                    maxResults: 50, // Fetches up to 50 videos from the playlist
                    key: apiKey
                }
            });

            const allVideos = playlistItemsRes.data.items;

            // 3. Format the data for each video
            const formattedVideos = allVideos
                .filter(item => item.snippet.resourceId.videoId) // Ensure item is a valid video
                .map(item => ({
                    title: item.snippet.title,
                    description: item.snippet.description,
                    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                    videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
                }));
            
            // 4. Return a special response for playlists
            return NextResponse.json({
                type: 'playlist',
                playlistTitle: playlistDetails.title,
                videos: formattedVideos
            }, { status: 200 });

        } else if (videoId) {
            // --- HANDLE SINGLE VIDEO (Existing logic) ---
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`);
            const videoDetails = response.data.items[0]?.snippet;

            if (!videoDetails) {
                return NextResponse.json({ error: "Could not fetch video details from YouTube." }, { status: 404 });
            }

            return NextResponse.json({
                type: 'video', // Added type for clarity
                title: videoDetails.title,
                description: videoDetails.description,
                thumbnailUrl: videoDetails.thumbnails.high.url,
            }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Invalid YouTube URL. Could not find a video or playlist ID." }, { status: 400 });
        }

    } catch (error) {
        console.error("Error fetching YouTube data:", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}