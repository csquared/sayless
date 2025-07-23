(function() {
    let devtoolsOpen = false;
    let threshold = 160;
    let emitEvent = false;
    
    // ASCII art for console
    const saylessArt = `
███████╗ █████╗ ██╗   ██╗██╗     ███████╗███████╗███████╗
██╔════╝██╔══██╗╚██╗ ██╔╝██║     ██╔════╝██╔════╝██╔════╝
███████╗███████║ ╚████╔╝ ██║     █████╗  ███████╗███████╗
╚════██║██╔══██║  ╚██╔╝  ██║     ██╔══╝  ╚════██║╚════██║
███████║██║  ██║   ██║   ███████╗███████╗███████║███████║
╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝╚══════╝╚══════╝`;

    const messages = [
        { text: saylessArt, style: 'color: #fff; font-family: monospace; font-size: 10px; line-height: 1.2;' },
        { text: '%cNOT FOR SALE', style: 'color: #fff; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 8px; padding: 20px 0;' },
        { text: '%cREMIX YOUR WORLD', style: 'color: #fff; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 6px; padding: 10px 0;' },
        { text: '%cYOU FOUND THE VOID', style: 'color: #fff; font-size: 16px; letter-spacing: 4px;' },
        { text: '%cMAKE YOUR MARK • LEAVE NO TRACE', style: 'color: #888; font-size: 12px; letter-spacing: 2px;' },
        { text: '%c🖤', style: 'font-size: 40px; padding: 20px 0;' },
        { text: '%cTYPE: sayless.reveal()', style: 'color: #fff; font-size: 14px; font-family: monospace; background: #222; padding: 10px; border: 1px solid #444;' }
    ];

    // Hidden command
    window.sayless = {
        reveal: function() {
            console.clear();
            console.log('%cINNER CIRCLE', 'color: #fff; font-size: 20px; letter-spacing: 6px; padding: 20px 0;');
            console.log('%cEMAIL: void@sayless.xyz', 'color: #fff; font-size: 14px; font-family: monospace;');
            console.log('%cSUBJECT: "CONSOLE"', 'color: #fff; font-size: 14px; font-family: monospace;');
            console.log('%cPROVE YOU WERE HERE', 'color: #888; font-size: 12px; letter-spacing: 2px; padding-top: 20px;');
            return '🌑';
        },
        
        // Extra hidden functions
        void: function() {
            document.body.style.transition = 'all 2s ease';
            document.body.style.filter = 'invert(1)';
            setTimeout(() => {
                document.body.style.filter = 'invert(0)';
            }, 2000);
            return 'YOU ENTERED THE VOID';
        },
        
        glitch: function() {
            const glitchStyle = document.createElement('style');
            glitchStyle.innerHTML = `
                @keyframes glitch {
                    0%, 100% { transform: translate(0); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(-2px, -2px); }
                    60% { transform: translate(2px, 2px); }
                    80% { transform: translate(2px, -2px); }
                }
                body { animation: glitch 0.3s infinite; }
            `;
            document.head.appendChild(glitchStyle);
            setTimeout(() => {
                document.head.removeChild(glitchStyle);
            }, 3000);
            return 'REALITY UNSTABLE';
        }
    };

    // Devtools detection methods
    const devtools = {
        open: false,
        orientation: null
    };

    // Method 1: Element toString detection
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            devtoolsOpen = true;
            emitEvent = true;
        }
    });

    // Method 2: Performance detection
    const checkDevtools = function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                emitEvent = true;
            }
        } else {
            devtoolsOpen = false;
        }
    };

    // Method 3: Debugger statement timing
    const checkDebugger = function() {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                emitEvent = true;
            }
        }
    };

    // Check periodically
    setInterval(function() {
        checkDevtools();
        if (emitEvent && devtoolsOpen) {
            emitEvent = false;
            showConsoleMessage();
        }
    }, 500);

    // Show message when devtools opens
    function showConsoleMessage() {
        console.clear();
        messages.forEach(msg => {
            if (msg.text === saylessArt) {
                console.log(msg.text);
            } else {
                console.log(msg.text, msg.style);
            }
        });
    }

    // Also try to detect console.log calls
    console.log(element);
})();