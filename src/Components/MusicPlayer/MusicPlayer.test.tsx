import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import MusicPlayer from './MusicPlayer';

type PlayerEvents = {
    onReady?: (event: { target: FakePlayer }) => void;
    onStateChange?: (event: { data: number; target: FakePlayer }) => void;
    onError?: () => void;
};

const created: FakePlayer[] = [];

class FakePlayer {
    events: PlayerEvents;
    mute = vi.fn();
    unMute = vi.fn();
    setVolume = vi.fn();
    playVideo = vi.fn();
    pauseVideo = vi.fn();
    seekTo = vi.fn();
    getCurrentTime = vi.fn(() => 0);
    getDuration = vi.fn(() => 123);
    getPlayerState = vi.fn(() => 1);
    destroy = vi.fn();

    constructor(_element: HTMLElement, config: { events?: PlayerEvents }) {
        this.events = config.events ?? {};
        created.push(this);
    }

    getVideoData() {
        return { title: 'Minna-no-Kimochi - Live @Narita Airport, T1, Runway B' };
    }

    fireReady() {
        this.events.onReady?.({ target: this });
    }

    fireState(data: number) {
        this.events.onStateChange?.({ data, target: this });
    }
}

function seedYouTube() {
    created.length = 0;
    window.YT = {
        Player: FakePlayer,
        PlayerState: { PLAYING: 1, ENDED: 0 },
    } as unknown as NonNullable<typeof window.YT>;
}

beforeEach(() => {
    delete window.YT;
    delete window.onYouTubeIframeAPIReady;
});

describe('MusicPlayer', () => {
    test('autoplays muted and shows the track title once ready', async () => {
        seedYouTube();
        render(<MusicPlayer />);

        const player = await waitFor(() => {
            if (!created[0]) {
                throw new Error('player not created');
            }
            return created[0];
        });
        act(() => {
            player.fireReady();
        });

        expect(player.mute).toHaveBeenCalled();
        expect(player.playVideo).toHaveBeenCalled();
        expect(
            await screen.findByText(/Minna-no-Kimochi/)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Unmute' })
        ).toBeInTheDocument();
    });

    test('mute and play controls toggle the player', async () => {
        seedYouTube();
        const user = userEvent.setup();
        render(<MusicPlayer />);

        const player = await waitFor(() => {
            if (!created[0]) {
                throw new Error('player not created');
            }
            return created[0];
        });
        act(() => {
            player.fireReady();
        });

        await user.click(await screen.findByRole('button', { name: 'Unmute' }));
        expect(player.unMute).toHaveBeenCalled();
        expect(
            screen.getByRole('button', { name: 'Mute' })
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Pause' }));
        expect(player.pauseVideo).toHaveBeenCalled();
    });

    test('collapses to a note and reopens', async () => {
        seedYouTube();
        const user = userEvent.setup();
        render(<MusicPlayer />);

        await user.click(
            await screen.findByRole('button', { name: 'Hide music player' })
        );
        expect(
            screen.getByRole('button', { name: 'Show music player' })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'Show music player' })
        );
        expect(
            screen.getByRole('button', { name: 'Hide music player' })
        ).toBeInTheDocument();
    });

    test('scrubbing seeks to a position', async () => {
        seedYouTube();
        render(<MusicPlayer />);

        const player = await waitFor(() => {
            if (!created[0]) {
                throw new Error('player not created');
            }
            return created[0];
        });
        act(() => {
            player.fireReady();
        });

        const scrubber = await screen.findByRole('slider', { name: 'Seek' });
        fireEvent.change(scrubber, { target: { value: '30' } });

        expect(player.seekTo).toHaveBeenCalledWith(30, true);
    });

    test('replays when the video ends', async () => {
        seedYouTube();
        render(<MusicPlayer />);

        const player = await waitFor(() => {
            if (!created[0]) {
                throw new Error('player not created');
            }
            return created[0];
        });
        act(() => {
            player.fireReady();
            player.fireState(0);
        });

        expect(player.seekTo).toHaveBeenCalledWith(0, true);
        expect(player.playVideo).toHaveBeenCalled();
    });

    test('expands to show the video and collapses back', async () => {
        seedYouTube();
        const user = userEvent.setup();
        render(<MusicPlayer />);

        await user.click(
            await screen.findByRole('button', { name: 'Expand video' })
        );
        expect(
            screen.getByRole('button', { name: 'Collapse video' })
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Collapse video' }));
        expect(
            screen.getByRole('button', { name: 'Expand video' })
        ).toBeInTheDocument();
    });

    test('hovering the volume control reveals a vertical slider', async () => {
        seedYouTube();
        render(<MusicPlayer />);

        const player = await waitFor(() => {
            if (!created[0]) {
                throw new Error('player not created');
            }
            return created[0];
        });
        act(() => {
            player.fireReady();
        });

        const muteButton = await screen.findByRole('button', { name: 'Unmute' });
        fireEvent.mouseOver(muteButton);

        const volume = await screen.findByRole('slider', { name: 'Volume' });
        fireEvent.change(volume, { target: { value: '40' } });

        expect(player.setVolume).toHaveBeenCalledWith(40);
        expect(player.unMute).toHaveBeenCalled();
    });

    test('shows current and total time', async () => {
        seedYouTube();
        render(<MusicPlayer />);

        const player = await waitFor(() => {
            if (!created[0]) {
                throw new Error('player not created');
            }
            return created[0];
        });
        act(() => {
            player.fireReady();
        });

        // FakePlayer.getDuration() returns 123 → 2:03; current time is 0:00.
        expect(await screen.findByText('0:00 / 2:03')).toBeInTheDocument();
    });
});
