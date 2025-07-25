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
        { text: saylessArt, style: 'color: #00ff00; font-family: monospace; font-size: 10px; line-height: 1.2;' }
    ];

    // Add man page function
    window.man = function(command) {
        if (command === 'sayless') {
            console.clear();
            console.log('%cSAYLESS(1)                    User Commands                    SAYLESS(1)', 'color: #00ff00; font-family: monospace; font-weight: bold;');
            console.log('');
            console.log('%cNAME', 'color: #00ff00; font-family: monospace; font-weight: bold;');
            console.log('%c    sayless - terminal interface for electronic music rebellion', 'color: #fff; font-family: monospace;');
            console.log('');
            console.log('%cSYNOPSIS', 'color: #00ff00; font-family: monospace; font-weight: bold;');
            console.log('%c    sayless [FUNCTION]', 'color: #fff; font-family: monospace;');
            console.log('');
            console.log('%cDESCRIPTION', 'color: #00ff00; font-family: monospace; font-weight: bold;');
            console.log('%c    SAYLESS is not for sale. It\'s a philosophy, a movement,', 'color: #fff; font-family: monospace;');
            console.log('%c    and a proof of concept for post-matrix creativity.', 'color: #fff; font-family: monospace;');
            console.log('');
            console.log('%cFUNCTIONS', 'color: #00ff00; font-family: monospace; font-weight: bold;');
            console.log('%c    remix()     Initiate reality remix sequence', 'color: #fff; font-family: monospace;');
            console.log('%c    void()      Enter the void (invert reality)', 'color: #fff; font-family: monospace;');
            console.log('%c    glitch()    Destabilize reality matrix', 'color: #fff; font-family: monospace;');
            console.log('');
            console.log('%cEXAMPLES', 'color: #00ff00; font-family: monospace; font-weight: bold;');
            console.log('%c    sayless.remix()    # Remix your world', 'color: #fff; font-family: monospace;');
            console.log('%c    sayless.void()     # Enter the void', 'color: #fff; font-family: monospace;');
            console.log('');
            console.log('%cAUTHOR', 'color: #00ff00; font-family: monospace; font-weight: bold;');
            console.log('%c    Chris - Electronic Music Rebellion', 'color: #fff; font-family: monospace;');
            console.log('');
            console.log('%cSEE ALSO', 'color: #00ff00; font-family: monospace; font-weight: bold;');
            console.log('%c    instagram.com/just.sayless', 'color: #fff; font-family: monospace;');
            console.log('%c    soundcloud.com/just-say-less', 'color: #fff; font-family: monospace;');
            console.log('');
            console.log('%cSAYLESS(1)                       July 2025                    SAYLESS(1)', 'color: #00ff00; font-family: monospace; font-weight: bold;');
            return 'MANUAL DISPLAYED';
        } else {
            console.log('%cman: no manual entry for ' + command, 'color: #ff0000; font-family: monospace;');
            return 'MANUAL NOT FOUND';
        }
    };

    // SAYLESS functions
    window.sayless = {
        remix: function() {
            const remixMessages = [
                'INITIATING REALITY REMIX...',
                'DECONSTRUCTING PATTERNS...',
                'REASSEMBLING FRAGMENTS...',
                'REMIX COMPLETE'
            ];
            
            let i = 0;
            const interval = setInterval(() => {
                console.log('%c' + remixMessages[i], 'color: #00ff00; font-size: 14px; letter-spacing: 2px; font-family: monospace;');
                i++;
                if (i >= remixMessages.length) {
                    clearInterval(interval);
                    console.log(' ');
                    console.log('%cYOUR WORLD HAS BEEN REMIXED', 'color: #00ff00; font-size: 16px; letter-spacing: 4px; font-family: monospace;');
                    
                    // Visual effect
                    document.body.style.transition = 'all 0.5s ease';
                    document.body.style.transform = 'rotate(1deg)';
                    setTimeout(() => {
                        document.body.style.transform = 'rotate(-1deg)';
                        setTimeout(() => {
                            document.body.style.transform = 'rotate(0deg)';
                        }, 500);
                    }, 500);
                }
            }, 1000);
            
            return 'REMIXING...';
        },
        
        void: function() {
            document.body.style.transition = 'all 2s ease';
            document.body.style.filter = 'invert(1)';
            setTimeout(() => {
                document.body.style.filter = 'invert(0)';
            }, 2000);
            return 'VOID ENTERED';
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
            return 'REALITY DESTABILIZED';
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
        
        // Show ASCII art
        console.log(saylessArt);
        console.log(' ');
        
        // Show man page immediately
        man('sayless');
        
        console.log(' ');
        console.log('%cAVAILABLE FUNCTIONS:', 'color: #00ff00; font-family: monospace; font-weight: bold;');
        console.log('%c  man(\'sayless\')     Display manual page', 'color: #fff; font-family: monospace;');
        console.log('%c  sayless.remix()    Remix your reality', 'color: #fff; font-family: monospace;');
        console.log('%c  sayless.void()     Enter the void', 'color: #fff; font-family: monospace;');
        console.log('%c  sayless.glitch()   Destabilize the matrix', 'color: #fff; font-family: monospace;');
    }

    // Also try to detect console.log calls
    console.log(element);
})();