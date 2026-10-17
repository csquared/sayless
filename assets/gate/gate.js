// Download gate, Hypeddit-style: tap "follow" (opens the profile, in the app
// when installed), come back, and the download unlocks. Nothing is verified;
// a step counts as done once it has been opened. Progress is kept per track in
// localStorage so leaving for the app and coming back doesn't reset it.
//
// Page contract (see scripts/new-dl.sh):
//   <script type="application/json" id="gate-config">
//     {"slug": "...", "file": "assets/downloads/x.mp3", "filename": "SAYLESS - X.mp3"}
//   </script>
//   <div id="gate"></div>
(function () {
    var ICONS = {
        instagram:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>',
        soundcloud:
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z"/></svg>',
    };

    var DEFAULT_STEPS = [
        {
            id: "instagram",
            label: "FOLLOW @JUSTSAYLESS",
            url: "https://www.instagram.com/justsayless/",
            android: "com.instagram.android",
        },
        {
            id: "soundcloud",
            label: "FOLLOW ON SOUNDCLOUD",
            url: "https://soundcloud.com/just-say-less",
            android: "com.soundcloud.android",
        },
    ];

    var cfg = JSON.parse(document.getElementById("gate-config").textContent);
    var steps = cfg.steps || DEFAULT_STEPS;
    var root = document.getElementById("gate");
    var key = "sayless-gate:" + cfg.slug;
    var done = {};
    try {
        (JSON.parse(localStorage.getItem(key)) || []).forEach(function (id) {
            done[id] = true;
        });
    } catch (e) {}

    var ua = navigator.userAgent;
    // In-app browsers (Instagram, Facebook, TikTok) handle https profile links
    // themselves; Android intents from them are flaky, so only Chrome & co get one.
    var inApp = /Instagram|FBAN|FBAV|FB_IAB|musical_ly|BytedanceWebview/i.test(ua);
    var android = /Android/i.test(ua) && !inApp;

    // Deep link: on iOS the https URL is a universal link and opens the app when
    // it's installed. On Android an intent URL opens the app, falling back to
    // the web profile when it isn't.
    function linkFor(step) {
        if (android && step.android) {
            var u = new URL(step.url);
            return (
                "intent://" + u.host + u.pathname +
                "#Intent;scheme=https;package=" + step.android +
                ";S.browser_fallback_url=" + encodeURIComponent(step.url) +
                ";end"
            );
        }
        return step.url;
    }

    function save() {
        try {
            localStorage.setItem(key, JSON.stringify(Object.keys(done)));
        } catch (e) {}
    }

    var html = '<div class="gate-label">UNLOCK THE FREE DOWNLOAD</div><div class="gate-steps">';
    steps.forEach(function (s, i) {
        var intent = android && s.android;
        html +=
            '<a class="gate-step" data-step="' + s.id + '" href="' + linkFor(s) + '"' +
            (intent ? "" : ' target="_blank" rel="noopener"') + ">" +
            (ICONS[s.id] || "") +
            '<span class="gate-text">' + (i + 1) + ". " + s.label + "</span>" +
            '<span class="gate-check"></span></a>';
    });
    html +=
        '</div><a class="gate-download locked" id="gate-download" role="button" aria-disabled="true">DOWNLOAD</a>' +
        '<div class="gate-hint" id="gate-hint"></div>';
    root.innerHTML = html;

    var dl = document.getElementById("gate-download");
    var hint = document.getElementById("gate-hint");
    var stepEls = root.querySelectorAll(".gate-step");

    function unlocked() {
        return steps.every(function (s) {
            return done[s.id];
        });
    }

    function render() {
        stepEls.forEach(function (el) {
            el.classList.toggle("done", !!done[el.dataset.step]);
        });
        var ok = unlocked();
        dl.classList.toggle("locked", !ok);
        dl.setAttribute("aria-disabled", String(!ok));
        if (ok) {
            dl.href = cfg.file;
            dl.setAttribute("download", cfg.filename || "");
            hint.textContent = "";
        } else {
            dl.removeAttribute("href");
            dl.removeAttribute("download");
        }
    }

    // A step counts once it's been opened: when the visitor comes back from the
    // app or tab, or after a short beat if the page never lost focus.
    var pending = null;
    function complete() {
        if (!pending) return;
        clearTimeout(pending.timer);
        pending.el.classList.remove("pending");
        done[pending.id] = true;
        pending = null;
        save();
        render();
    }

    stepEls.forEach(function (el) {
        el.addEventListener("click", function () {
            complete();
            if (done[el.dataset.step]) return;
            el.classList.add("pending");
            pending = { id: el.dataset.step, el: el, timer: setTimeout(complete, 2500) };
        });
    });

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") setTimeout(complete, 400);
    });
    window.addEventListener("focus", function () {
        setTimeout(complete, 400);
    });

    dl.addEventListener("click", function (e) {
        if (!unlocked()) {
            e.preventDefault();
            hint.textContent = "FOLLOW BOTH FIRST";
        }
    });

    render();
})();
