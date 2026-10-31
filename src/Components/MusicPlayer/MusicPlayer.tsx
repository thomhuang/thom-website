import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, MouseEvent, PointerEvent } from 'react';

import styles from './MusicPlayer.module.css';

const VIDEO_ID = 'dq8-GOOPN7E';

// YouTube PlayerState.BUFFERING
const BUFFERING = 3;

function formatTime(totalSeconds: number): string {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return '0:00';
    }
    const seconds = Math.floor(totalSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return hours > 0
        ? `${hours}:${pad(minutes)}:${pad(secs)}`
        : `${minutes}:${pad(secs)}`;
}

type YtPlayer = {
    mute: () => void;
    unMute: () => void;
    setVolume: (volume: number) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlayerState: () => number;
    getVideoData: () => { title: string };
    destroy: () => void;
};

type YtApi = {
    Player: new (
        element: HTMLElement,
        config: {
            videoId: string;
            host?: string;
            playerVars?: Record<string, string | number>;
            events?: {
                onReady?: (event: { target: YtPlayer }) => void;
                onStateChange?: (event: { data: number; target: YtPlayer }) => void;
                onError?: () => void;
            };
        }
    ) => YtPlayer;
    PlayerState: { PLAYING: number; ENDED: number };
};

declare global {
    interface Window {
        YT?: YtApi;
        onYouTubeIframeAPIReady?: () => void;
    }
}

let apiPromise: Promise<YtApi> | null = null;

function loadYouTubeApi(): Promise<YtApi> {
    if (window.YT?.Player) {
        return Promise.resolve(window.YT);
    }
    if (!apiPromise) {
        apiPromise = new Promise((resolve) => {
            const previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                previous?.();
                if (window.YT) {
                    resolve(window.YT);
                }
            };
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            document.head.appendChild(script);
        });
    }
    return apiPromise;
}

type View = 'note' | 'bar' | 'video';

export default function MusicPlayer() {
    const hostRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YtPlayer | null>(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);
    const [volume, setVolume] = useState(100);
    const [volumeOpen, setVolumeOpen] = useState(false);
    const [view, setView] = useState<View>('bar');
    const [title, setTitle] = useState('');
    const [failed, setFailed] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hover, setHover] = useState<{ time: number; x: number } | null>(null);
    const seekingRef = useRef(false);
    const [position, setPosition] = useState<{ right: number; bottom: number } | null>(
        null
    );
    const dragRef = useRef<{
        startX: number;
        startY: number;
        startRight: number;
        startBottom: number;
    } | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;

        loadYouTubeApi().then((yt) => {
            if (cancelled || !hostRef.current) {
                return;
            }
            playerRef.current = new yt.Player(hostRef.current, {
                videoId: VIDEO_ID,
                host: 'https://www.youtube-nocookie.com',
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 0,
                    loop: 1,
                    playlist: VIDEO_ID,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                },
                events: {
                    onReady: (event) => {
                        event.target.mute();
                        event.target.playVideo();
                        setTitle(event.target.getVideoData().title);
                        setDuration(event.target.getDuration());
                        setReady(true);
                        setPlaying(true);
                    },
                    onStateChange: (event) => {
                        if (event.data === yt.PlayerState.ENDED) {
                            event.target.seekTo(0, true);
                            event.target.playVideo();
                        }
                        setPlaying(event.data === yt.PlayerState.PLAYING);
                    },
                    onError: () => {
                        setFailed(true);
                    },
                },
            });
        });

        return () => {
            cancelled = true;
            playerRef.current?.destroy();
            playerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!ready) {
            return;
        }
        const id = window.setInterval(() => {
            const player = playerRef.current;
            if (!player || seekingRef.current) {
                return;
            }
            if (player.getPlayerState() === BUFFERING) {
                return;
            }
            setCurrentTime(player.getCurrentTime());
            setDuration(player.getDuration());
        }, 250);
        return () => window.clearInterval(id);
    }, [ready]);

    useLayoutEffect(() => {
        if (!position || !rootRef.current) {
            return;
        }
        const rect = rootRef.current.getBoundingClientRect();
        const right = Math.min(
            Math.max(position.right, 0),
            Math.max(0, window.innerWidth - rect.width)
        );
        const bottom = Math.min(
            Math.max(position.bottom, 0),
            Math.max(0, window.innerHeight - rect.height)
        );
        if (right !== position.right || bottom !== position.bottom) {
            setPosition({ right, bottom });
        }
    }, [view, position]);

    if (failed) {
        return null;
    }

    const togglePlay = () => {
        const player = playerRef.current;
        if (!player) {
            return;
        }
        if (playing) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    const toggleMute = () => {
        const player = playerRef.current;
        if (!player) {
            return;
        }
        if (muted) {
            player.unMute();
            setMuted(false);
        } else {
            player.mute();
            setMuted(true);
        }
    };

    const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
        const seconds = Number(event.target.value);
        setCurrentTime(seconds);
        playerRef.current?.seekTo(seconds, true);
    };

    const handleVolume = (event: ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        const player = playerRef.current;
        if (!player) {
            return;
        }
        setVolume(value);
        player.setVolume(value);
        if (value === 0) {
            player.mute();
            setMuted(true);
        } else {
            player.unMute();
            setMuted(false);
        }
    };

    const handleScrubberMove = (event: MouseEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        const rect = input.getBoundingClientRect();
        if (rect.width === 0) {
            return;
        }
        const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        setHover({ time: ratio * duration, x: ratio * 100 });
    };

    const handleScrubberLeave = () => {
        setHover(null);
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest('button, input, iframe')) {
            return;
        }
        if (window.matchMedia('(max-width: 640px)').matches) {
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            startRight: window.innerWidth - rect.right,
            startBottom: window.innerHeight - rect.bottom,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag) {
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        const right = Math.min(
            Math.max(drag.startRight - (event.clientX - drag.startX), 0),
            window.innerWidth - rect.width
        );
        const bottom = Math.min(
            Math.max(drag.startBottom - (event.clientY - drag.startY), 0),
            window.innerHeight - rect.height
        );
        setPosition({ right, bottom });
    };

    const handlePointerUp = () => {
        dragRef.current = null;
    };

    const scrubber = (
        <div className={styles.scrubberWrap} onMouseLeave={handleScrubberLeave}>
            {hover !== null && duration > 0 && (
                <div className={styles.timeTooltip} style={{ left: `${hover.x}%` }}>
                    {formatTime(hover.time)}
                </div>
            )}
            <input
                type="range"
                className={styles.scrubber}
                min={0}
                max={duration > 0 ? duration : 0}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                onMouseMove={handleScrubberMove}
                onPointerDown={() => {
                    seekingRef.current = true;
                }}
                onPointerUp={() => {
                    seekingRef.current = false;
                }}
                onPointerCancel={() => {
                    seekingRef.current = false;
                }}
                aria-label="Seek"
                disabled={!ready || duration <= 0}
            />
        </div>
    );

    const playPause = (
        <button
            type="button"
            className={styles.control}
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            disabled={!ready}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                {playing ? (
                    <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                ) : (
                    <path d="M8 5v14l11-7z" />
                )}
            </svg>
        </button>
    );

    const muteToggle = (
        <button
            type="button"
            className={styles.control}
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            disabled={!ready}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 9v6h4l5 5V4L7 9H3z" />
                {muted ? (
                    <path
                        d="M16 8l5 8M21 8l-5 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                    />
                ) : (
                    <path
                        d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                    />
                )}
            </svg>
        </button>
    );

    const volumeControl = (
        <div
            className={styles.volumeControl}
            onMouseEnter={() => setVolumeOpen(true)}
            onMouseLeave={() => setVolumeOpen(false)}
        >
            {volumeOpen && (
                <div className={styles.volumePopover}>
                    <input
                        type="range"
                        className={styles.volumeSlider}
                        min={0}
                        max={100}
                        step={1}
                        value={volume}
                        onChange={handleVolume}
                        aria-label="Volume"
                        disabled={!ready}
                    />
                </div>
            )}
            {muteToggle}
        </div>
    );

    const positionStyle: CSSProperties | undefined = position
        ? { right: position.right, bottom: position.bottom, left: 'auto', top: 'auto' }
        : undefined;

    const dragProps = {
        style: positionStyle,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerUp,
    };

    if (view === 'note') {
        return (
            <div className={styles.player} ref={rootRef} {...dragProps}>
                <div className={styles.hostWrap} aria-hidden="true">
                    <div ref={hostRef} />
                </div>
                <button
                    type="button"
                    className={styles.noteButton}
                    onClick={() => setView('bar')}
                    aria-label="Show music player"
                >
                    ♫
                </button>
            </div>
        );
    }

    if (view === 'video') {
        return (
            <div className={`${styles.player} ${styles.video}`} ref={rootRef} {...dragProps}>
                <div className={`${styles.hostWrap} ${styles.hostWrapVisible}`}>
                    <div ref={hostRef} />
                </div>
                <div className={styles.videoBar}>
                    <span className={styles.note} aria-hidden="true">
                        ♫
                    </span>
                    <span className={styles.title} title={title}>
                        {title || 'Loading…'}
                    </span>
                    <button
                        type="button"
                        className={styles.control}
                        onClick={() => setView('bar')}
                        aria-label="Collapse video"
                    >
                        ▼
                    </button>
                </div>
                <div className={styles.timeRow}>
                    <span className={styles.time}>{formatTime(currentTime)}</span>
                    {scrubber}
                    <span className={styles.time}>{formatTime(duration)}</span>
                </div>
                <div className={styles.videoControls}>
                    {playPause}
                    {volumeControl}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.player} ref={rootRef} {...dragProps}>
            <div className={styles.hostWrap} aria-hidden="true">
                <div ref={hostRef} />
            </div>
            <span className={styles.note} aria-hidden="true">
                ♫
            </span>
            <span className={styles.title} title={title}>
                {title || 'Loading…'}
            </span>
            <span className={styles.time}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            {scrubber}
            {playPause}
            {volumeControl}
            <button
                type="button"
                className={styles.control}
                onClick={() => setView('video')}
                aria-label="Expand video"
            >
                ▲
            </button>
            <button
                type="button"
                className={styles.control}
                onClick={() => setView('note')}
                aria-label="Hide music player"
            >
                ×
            </button>
        </div>
    );
}
