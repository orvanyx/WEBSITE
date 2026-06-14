// ============================================================
// Bio Music Player — v2.1
// Features: Auto-play, Prev/Next, Progress bar, Visualizer
// Fixes: panel toggle, seeking edge case, visualizer state
// ============================================================

(function () {
    'use strict';

    // ── Panel toggle ────────────────────────────────────────
    const toggleButton = document.getElementById('musicDeckToggle');
    const panel = document.getElementById('musicDeckPanel');
    const closeButton = document.getElementById('musicDeckClose');

    if (toggleButton && panel) {
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('active');
        });
    }

    if (closeButton && panel) {
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.remove('active');
        });
    }

    // Close panel on outside click
    document.addEventListener('click', (e) => {
        if (
            panel &&
            toggleButton &&
            panel.classList.contains('active') &&
            !panel.contains(e.target) &&
            !toggleButton.contains(e.target)
        ) {
            panel.classList.remove('active');
        }
    });

    // ── Per-deck player setup ────────────────────────────────
    document.querySelectorAll('.bio-music').forEach((deck) => {
        const audio = deck.querySelector('.music-player');
        const select = deck.querySelector('.music-select');
        const volume = deck.querySelector('.music-volume');
        const status = deck.querySelector('.music-status');
        const playBtn = deck.querySelector('[data-action="play"]');
        const muteBtn = deck.querySelector('[data-action="mute"]');
        const prevBtn = deck.querySelector('[data-action="prev"]');
        const nextBtn = deck.querySelector('[data-action="next"]');
        const progressBar = deck.querySelector('.music-progress');
        const visualizer = deck.querySelector('.music-visualizer');

        // Guard — all required elements must exist
        if (!audio || !select || !volume || !status || !playBtn) {
            console.warn('Music player: missing required elements in', deck);
            return;
        }

        let isSeeking = false;

        // ── Helpers ──────────────────────────────────────────
        const trackName = () => select.options[select.selectedIndex]?.text ?? '—';

        const pad = (n) => String(Math.floor(n)).padStart(2, '0');
        const fmt = (s) => `${pad(s / 60)}:${pad(s % 60)}`;

        const setStatus = (msg) => { status.textContent = msg; };

        const setVisualizerState = (playing) => {
            if (!visualizer) return;
            // The CSS target is .music-paused on the visualizer's parent (.bio-music)
            deck.classList.toggle('music-paused', !playing);
        };

        const refreshProgress = () => {
            if (isSeeking || !audio.duration || !isFinite(audio.duration)) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            if (progressBar) {
                progressBar.value = pct;
                progressBar.style.background =
                    `linear-gradient(to right, var(--color-accent) ${pct}%, rgba(10,14,23,0.95) ${pct}%)`;
            }
        };

        const refreshStatus = () => {
            if (!audio.paused && audio.duration && isFinite(audio.duration)) {
                setStatus(`Playing: ${trackName()} [${fmt(audio.currentTime)} / ${fmt(audio.duration)}]`);
            }
        };

        const syncSource = () => {
            const src = select.value;
            if (!src) return;
            audio.src = src;
            audio.load();
        };

        const tryPlay = () =>
            audio.play().then(() => {
                playBtn.textContent = 'Pause';
                setVisualizerState(true);
                refreshStatus();
            });

        // ── Auto-play ─────────────────────────────────────────
        const autoPlay = () => {
            syncSource();
            setTimeout(() => {
                tryPlay().catch(() => {
                    setStatus('▶ Click Play to start music');
                    playBtn.textContent = 'Play';
                    setVisualizerState(false);
                });
            }, 150);
        };

        // ── Track change ──────────────────────────────────────
        select.addEventListener('change', () => {
            syncSource();
            tryPlay().catch(() => {
                setStatus('Track changed — press Play to start');
                playBtn.textContent = 'Play';
                setVisualizerState(false);
            });
        });

        // ── Play / Pause ──────────────────────────────────────
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                // If no source loaded yet, sync first
                if (!audio.src || audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
                    syncSource();
                }
                tryPlay().catch(() => setStatus('Press Play to start.'));
            } else {
                audio.pause();
                playBtn.textContent = 'Play';
                setStatus(`Paused: ${trackName()}`);
                setVisualizerState(false);
            }
        });

        // ── Mute ─────────────────────────────────────────────
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                audio.muted = !audio.muted;
                muteBtn.textContent = audio.muted ? 'Unmute' : 'Mute';
                setStatus(audio.muted ? '🔇 Muted' : `🔊 Volume ${Math.round(audio.volume * 100)}%`);
            });
        }

        // ── Prev ─────────────────────────────────────────────
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const len = select.options.length;
                select.selectedIndex = (select.selectedIndex - 1 + len) % len;
                select.dispatchEvent(new Event('change'));
            });
        }

        // ── Next ─────────────────────────────────────────────
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                select.selectedIndex = (select.selectedIndex + 1) % select.options.length;
                select.dispatchEvent(new Event('change'));
            });
        }

        // ── Volume ───────────────────────────────────────────
        volume.addEventListener('input', () => {
            audio.volume = Number(volume.value);
            if (audio.muted && audio.volume > 0) {
                audio.muted = false;
                if (muteBtn) muteBtn.textContent = 'Mute';
            }
            setStatus(`🔊 Volume ${Math.round(audio.volume * 100)}%`);
        });

        // ── Progress seeking ─────────────────────────────────
        if (progressBar) {
            progressBar.addEventListener('mousedown',  () => { isSeeking = true; });
            progressBar.addEventListener('touchstart', () => { isSeeking = true; }, { passive: true });

            progressBar.addEventListener('mouseup',  () => { isSeeking = false; });
            progressBar.addEventListener('touchend', () => { isSeeking = false; });

            progressBar.addEventListener('input', () => {
                if (audio.duration && isFinite(audio.duration)) {
                    audio.currentTime = (progressBar.value / 100) * audio.duration;
                    refreshProgress();
                }
            });
        }

        // ── Audio events ─────────────────────────────────────
        audio.addEventListener('timeupdate', () => {
            refreshProgress();
            refreshStatus();
        });

        audio.addEventListener('ended', () => {
            if (nextBtn) {
                nextBtn.click();
            } else {
                playBtn.textContent = 'Play';
                setStatus('Track ended.');
                setVisualizerState(false);
            }
        });

        audio.addEventListener('error', () => {
            setStatus('⚠ Error loading track. Try another.');
            playBtn.textContent = 'Play';
            setVisualizerState(false);
        });

        audio.addEventListener('loadstart', () => {
            setStatus('Loading…');
        });

        audio.addEventListener('canplay', () => {
            if (audio.paused) setStatus(`Ready: ${trackName()}`);
        });

        audio.addEventListener('play',  () => setVisualizerState(true));
        audio.addEventListener('pause', () => setVisualizerState(false));

        // ── Init ─────────────────────────────────────────────
        audio.volume = Math.min(1, Math.max(0, Number(volume.value)));
        autoPlay();
    });
})();
