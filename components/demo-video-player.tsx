'use client'
import {
    VideoPlayer,
    VideoPlayerContent,
    VideoPlayerControlBar,
    VideoPlayerPlayButton,
    VideoPlayerTimeRange,
    VideoPlayerTimeDisplay,
    VideoPlayerMuteButton,
    VideoPlayerVolumeRange,
} from '@/components/ui/kibo-ui/video-player'

export default function DemoVideoPlayer() {
    return (
        <div className="w-full">
            <div className="relative">
                <div className="overflow-hidden rounded-xl border-2 border-yellow-400/20 bg-background shadow-2xl">
                    <VideoPlayer className="w-full">
                        <VideoPlayerContent
                            slot="media"
                            src="https://p9xcezb73lfrkkkg.public.blob.vercel-storage.com/Video/Tattoo_Design_Fade_Transition_Video.mp4"
                            poster="https://images.unsplash.com/photo-1598618443855-232ee0f819f6?w=800&h=450&fit=crop"
                            crossOrigin=""
                            className="aspect-video w-full object-cover"
                        />
                        <VideoPlayerControlBar>
                            <VideoPlayerPlayButton />
                            <VideoPlayerTimeRange />
                            <VideoPlayerTimeDisplay showDuration />
                            <VideoPlayerMuteButton />
                            <VideoPlayerVolumeRange />
                        </VideoPlayerControlBar>
                    </VideoPlayer>
                </div>
            </div>
        </div>
    )
}