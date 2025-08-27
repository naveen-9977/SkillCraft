import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import StudyMaterial from "@/schema/StudyMaterial";
import Users from "@/schema/Users";
import axios from "axios";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return { success: false, error: 'No token found' };
    
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('name role batchCodes');

    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Unauthorized access' };
    }
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

export async function POST(req) {
    try {
        const authResult = await verifyAdminOrMentor(req);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const { playlistFolderId } = await req.json();
        const apiKey = process.env.YOUTUBE_API_KEY;

        await ConnectToDB();

        const playlistFolder = await StudyMaterial.findById(playlistFolderId);
        if (!playlistFolder || !playlistFolder.youtubePlaylistId) {
            return NextResponse.json({ error: "Playlist folder not found or does not have a YouTube playlist ID." }, { status: 404 });
        }
        
        // Fetch existing videos in this playlist from our DB
        const existingVideos = await StudyMaterial.find({ parent: playlistFolderId });
        const existingVideoUrls = existingVideos.map(video => video.youtubeUrl);

        // Fetch all videos from the YouTube playlist
        const playlistItemsRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
            params: {
                part: 'snippet',
                playlistId: playlistFolder.youtubePlaylistId,
                maxResults: 50,
                key: apiKey
            }
        });

        const allVideosFromAPI = playlistItemsRes.data.items;
        let newVideosAddedCount = 0;

        for (const item of allVideosFromAPI) {
            const videoUrl = `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`;
            
            // If the video is not already in our database, add it
            if (!existingVideoUrls.includes(videoUrl)) {
                await StudyMaterial.create({
                    title: item.snippet.title,
                    description: item.snippet.description,
                    type: 'youtube_video',
                    parent: playlistFolderId,
                    batchCode: playlistFolder.batchCode,
                    youtubeUrl: videoUrl,
                    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                    mentor: playlistFolder.mentor,
                    createdBy: playlistFolder.createdBy,
                });
                newVideosAddedCount++;
            }
        }

        return NextResponse.json({ message: `Sync complete. Added ${newVideosAddedCount} new videos.` });

    } catch (error) {
        console.error("Error syncing playlist:", error);
        return NextResponse.json({ error: "Failed to sync playlist." }, { status: 500 });
    }
}