(function () {
    "use strict";

    var COLORS = {
        playedHigh: "#ffffff",
        playedMid: "#cccccc",
        playedLow: "#999999",
        unplayedHigh: "#444444",
        unplayedMid: "#333333",
        unplayedLow: "#222222",
        line: "#1a1a1a",
        dim: "#666666",
        muted: "#999999"
    };

    function formatTime(ms) {
        var total = Math.max(0, Math.floor((ms || 0) / 1000));
        var m = Math.floor(total / 60);
        var s = total % 60;
        return m + ":" + (s < 10 ? "0" + s : s);
    }

    function decodeB64(b64) {
        var bin = atob(b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            bytes[i] = bin.charCodeAt(i);
        }
        return bytes;
    }

    function buildWaveform(bytes, columns) {
        var cols = [];
        var max = 0;
        for (var c = 0; c < columns; c++) {
            var o = c * 3;
            if (o + 2 >= bytes.length) break;
            var low = bytes[o];
            var mid = bytes[o + 1];
            var high = bytes[o + 2];
            cols.push({ low: low, mid: mid, high: high });
            var sum = low + mid + high;
            if (sum > max) max = sum;
        }
        return { cols: cols, max: max || 1 };
    }

    var ICONS = {
        play: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
    };

    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    }

    function makeCover() {
        var cover = el("div", "sp-cover");
        cover.appendChild(el("div", "sp-cover-text", "SAYLESS"));
        return cover;
    }

    function render(root, playlist) {
        root.textContent = "";

        var audio = document.createElement("audio");
        audio.preload = "none";
        audio.className = "sp-audio";
        root.appendChild(audio);

        var header = el("div", "sp-header");
        header.appendChild(makeCover());

        var controls = el("div", "sp-controls");
        var playBtn = el("button", "sp-play", null);
        playBtn.type = "button";
        playBtn.setAttribute("aria-label", "Play");
        playBtn.innerHTML = ICONS.play;
        controls.appendChild(playBtn);

        var titles = el("div", "sp-titles");
        titles.appendChild(el("div", "sp-artist", "SAYLESS"));
        var trackTitle = el("div", "sp-track-title", "");
        titles.appendChild(trackTitle);
        controls.appendChild(titles);
        header.appendChild(controls);

        var times = el("div", "sp-times");
        var elapsedLabel = el("span", "sp-elapsed", "0:00");
        var totalLabel = el("span", "sp-total", "0:00");
        times.appendChild(elapsedLabel);
        times.appendChild(totalLabel);

        var canvas = document.createElement("canvas");
        canvas.className = "sp-wave";

        var stage = el("div", "sp-stage");
        stage.appendChild(elapsedLabel);
        stage.appendChild(canvas);
        stage.appendChild(totalLabel);
        header.appendChild(stage);

        var list = el("div", "sp-list");
        header.appendChild(list);

        root.appendChild(header);

        var footer = el("div", "sp-footer");
        footer.appendChild(el("div", "sp-playlist-title", playlist.title || ""));
        if (playlist.description) {
            footer.appendChild(el("div", "sp-playlist-description", playlist.description));
        }
        root.appendChild(footer);

        var tracks = playlist.tracks || [];
        var selectedIndex = tracks.length ? 0 : -1;

        var rowNodes = tracks.map(function (track, i) {
            var row = el("button", "sp-row");
            row.type = "button";
            row.setAttribute("role", "button");
            row.setAttribute("aria-label", (track.n || i + 1) + " SAYLESS - " + track.title);

            var left = el("span", "sp-row-left");
            left.appendChild(el("span", "sp-row-name", (track.n || i + 1) + " \u00b7 SAYLESS \u2013 " + track.title));
            row.appendChild(left);

            var right = el("span", "sp-row-right");
            var meta = Math.round(track.bpm || 0) + " BPM";
            if (track.key) meta += " \u00b7 " + track.key;
            right.appendChild(el("span", "sp-row-meta", meta));
            right.appendChild(el("span", "sp-row-duration", formatTime(track.duration_ms)));
            row.appendChild(right);

            row.addEventListener("click", function () {
                select(i, true);
            });
            list.appendChild(row);
            return row;
        });

        var state = {
            audio: audio,
            playBtn: playBtn,
            trackTitle: trackTitle,
            elapsedLabel: elapsedLabel,
            totalLabel: totalLabel,
            canvas: canvas,
            rows: rowNodes,
            tracks: tracks,
            selectedIndex: selectedIndex,
            waveform: null,
            raf: 0,
            lastDrawn: -1
        };

        function loadWaveform(track) {
            if (!track || !track.waveform || !track.waveform.b64) {
                state.waveform = null;
                return;
            }
            var columns = track.waveform.columns || 0;
            var bytes = decodeB64(track.waveform.b64);
            state.waveform = buildWaveform(bytes, columns);
        }

        function select(i, autoplay) {
            if (i < 0 || i >= tracks.length) return;
            state.selectedIndex = i;
            var track = tracks[i];
            state.trackTitle.textContent = track.title;
            state.totalLabel.textContent = formatTime(track.duration_ms);
            state.elapsedLabel.textContent = "0:00";
            loadWaveform(track);
            rowNodes.forEach(function (row, idx) {
                row.classList.toggle("sp-current", idx === i);
            });
            if (autoplay) {
                playTrack(i);
            } else {
                audio.removeAttribute("src");
                audio.load();
                setPlayIcon(false);
                draw();
            }
        }

        function setPlayIcon(playing) {
            playBtn.innerHTML = playing ? ICONS.pause : ICONS.play;
            playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
        }

        function playTrack(i) {
            if (i < 0 || i >= tracks.length) return;
            var track = tracks[i];
            select(i, false);
            audio.src = new URL(track.audio, location.href).href;
            audio.play().then(function () {
                setPlayIcon(true);
            }).catch(function () {
                setPlayIcon(false);
            });
        }

        function toggle() {
            if (state.selectedIndex < 0) return;
            var src = audio.getAttribute("src");
            var selected = tracks[state.selectedIndex];
            var selectedUrl = selected ? new URL(selected.audio, location.href).href : "";
            if (!src || src !== selectedUrl) {
                playTrack(state.selectedIndex);
                return;
            }
            if (audio.paused) {
                audio.play().then(function () {
                    setPlayIcon(true);
                }).catch(function () {});
            } else {
                audio.pause();
                setPlayIcon(false);
            }
        }

        playBtn.addEventListener("click", function (e) {
            e.preventDefault();
            toggle();
        });

        audio.addEventListener("play", function () { setPlayIcon(true); });
        audio.addEventListener("pause", function () { setPlayIcon(false); });
        audio.addEventListener("loadedmetadata", function () { draw(); });
        audio.addEventListener("timeupdate", function () { scheduleDraw(); });
        audio.addEventListener("ended", function () {
            var next = state.selectedIndex + 1;
            if (next < tracks.length) {
                playTrack(next);
            } else {
                setPlayIcon(false);
                state.elapsedLabel.textContent = formatTime(0);
                draw();
            }
        });

        function scheduleDraw() {
            if (!state.raf) {
                state.raf = requestAnimationFrame(function () {
                    state.raf = 0;
                    draw();
                });
            }
        }

        function draw() {
            var canvas = state.canvas;
            var dpr = window.devicePixelRatio || 1;
            var cssWidth = canvas.clientWidth;
            var cssHeight = canvas.clientHeight;
            if (!cssWidth || !cssHeight) return;
            var pxWidth = Math.round(cssWidth * dpr);
            var pxHeight = Math.round(cssHeight * dpr);
            if (canvas.width !== pxWidth || canvas.height !== pxHeight) {
                canvas.width = pxWidth;
                canvas.height = pxHeight;
            }
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, pxWidth, pxHeight);

            if (!state.waveform) return;
            var track = tracks[state.selectedIndex];
            if (!track) return;

            var duration = track.duration_ms || 0;
            var progress = duration ? Math.min(1, Math.max(0, audio.currentTime / (duration / 1000))) : 0;

            var bar = 2;
            var gap = 1;
            var barCount = Math.floor(cssWidth / (bar + gap));
            var cols = state.waveform.cols;
            var max = state.waveform.max;

            var midY = pxHeight / 2;
            var maxAmp = pxHeight / 2;

            for (var i = 0; i < barCount; i++) {
                var lo = Math.floor((i / barCount) * cols.length);
                var hi = Math.max(lo + 1, Math.floor(((i + 1) / barCount) * cols.length));
                if (lo >= cols.length) break;
                var low = 0, mid = 0, high = 0;
                for (var j = lo; j < hi && j < cols.length; j++) {
                    var col = cols[j];
                    if (col.low > low) low = col.low;
                    if (col.mid > mid) mid = col.mid;
                    if (col.high > high) high = col.high;
                }
                var x = i * (bar + gap) * dpr;
                var w = bar * dpr;
                var played = (i + 1) / barCount <= progress;

                drawBand(ctx, x, w, midY, (high + mid + low) / max * maxAmp, played ? COLORS.playedHigh : COLORS.unplayedHigh);
                drawBand(ctx, x, w, midY, (high + mid) / max * maxAmp, played ? COLORS.playedMid : COLORS.unplayedMid);
                drawBand(ctx, x, w, midY, low / max * maxAmp, played ? COLORS.playedLow : COLORS.unplayedLow);
            }
        }

        function drawBand(ctx, x, w, midY, amp, color) {
            ctx.fillStyle = color;
            var h = Math.max(0, amp);
            ctx.fillRect(x, midY - h, w, h);
            ctx.fillRect(x, midY, w, h);
        }

        function seekFromPointer(e) {
            var rect = state.canvas.getBoundingClientRect();
            var ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            var track = tracks[state.selectedIndex];
            if (!track) return;
            var src = audio.getAttribute("src");
            var selectedUrl = new URL(track.audio, location.href).href;
            var seekTo = ratio * (track.duration_ms / 1000);
            var unloaded = !src || src !== selectedUrl;
            function doSeek() {
                if (audio.readyState > 0) {
                    try { audio.currentTime = seekTo; } catch (err) {}
                } else {
                    audio.addEventListener("loadedmetadata", function once() {
                        audio.removeEventListener("loadedmetadata", once);
                        try { audio.currentTime = seekTo; } catch (err) {}
                    });
                }
            }
            if (unloaded) {
                audio.src = selectedUrl;
                doSeek();
                var p = audio.play();
                if (p && p.catch) p.catch(function () {});
            } else {
                doSeek();
            }
        }

        var seeking = false;
        canvas.addEventListener("pointerdown", function (e) {
            seeking = true;
            try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
            seekFromPointer(e);
        });
        canvas.addEventListener("pointermove", function (e) {
            if (seeking) seekFromPointer(e);
        });
        canvas.addEventListener("pointerup", function (e) {
            seeking = false;
        });
        canvas.addEventListener("pointercancel", function () {
            seeking = false;
        });

        var ro = new ResizeObserver(function () {
            draw();
        });
        ro.observe(canvas);

        document.addEventListener("keydown", function (e) {
            if (e.code !== "Space") return;
            var tag = (document.activeElement && document.activeElement.tagName) || "";
            var tagName = tag.toLowerCase();
            var editable = document.activeElement && document.activeElement.isContentEditable;
            if (tagName === "input" || tagName === "textarea" || tagName === "select" || tagName === "button" || editable) {
                return;
            }
            e.preventDefault();
            toggle();
        });

        function setupMediaSession() {
            if (!("mediaSession" in navigator)) return;
            var md = { title: "", artist: "SAYLESS", album: playlist.title || "" };
            try {
                navigator.mediaSession.metadata = new MediaMetadata(md);
            } catch (err) {
                return;
            }
            function updateMetadata() {
                var track = tracks[state.selectedIndex];
                try {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: track ? track.title : "",
                        artist: "SAYLESS",
                        album: playlist.title || ""
                    });
                } catch (err) {}
            }
            var origSelect = select;
            select = function (i, autoplay) {
                origSelect(i, autoplay);
                updateMetadata();
            };
            try {
                navigator.mediaSession.setActionHandler("play", function () { toggle(); });
                navigator.mediaSession.setActionHandler("pause", function () {
                    if (!audio.paused) { audio.pause(); }
                });
                navigator.mediaSession.setActionHandler("nexttrack", function () {
                    var next = state.selectedIndex + 1;
                    if (next < tracks.length) playTrack(next);
                });
                navigator.mediaSession.setActionHandler("previoustrack", function () {
                    var prev = state.selectedIndex - 1;
                    if (prev >= 0) playTrack(prev);
                });
            } catch (err) {}
        }
        setupMediaSession();

        select(selectedIndex, false);
    }

    function init() {
        var root = document.getElementById("player");
        if (!root) return;
        var params = new URLSearchParams(location.search);
        var url = params.get("playlist") || "assets/player/playlist.json";
        fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error("playlist fetch failed");
                return res.json();
            })
            .then(function (playlist) {
                render(root, playlist);
            })
            .catch(function () {
                /* leave the noscript fallback intact */
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
