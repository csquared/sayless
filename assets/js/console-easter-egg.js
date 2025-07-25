(function() {
    
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
        help: function() {
            console.clear();
            console.log(saylessArt);
            console.log(' ');
            console.log('SAYLESS(1)                    User Commands                    SAYLESS(1)');
            console.log('');
            console.log('NAME');
            console.log('    sayless - terminal interface for electronic music rebellion');
            console.log('');
            console.log('SYNOPSIS');
            console.log('    sayless [FUNCTION]');
            console.log('');
            console.log('DESCRIPTION');
            console.log('    SAYLESS is not for sale. It\'s a philosophy, a movement,');
            console.log('    and a proof of concept for post-matrix creativity.');
            console.log('');
            console.log('FUNCTIONS');
            console.log('    help()      Display this manual page');
            console.log('    print()     Display ASCII art');
            console.log('    ascii()     Display ASCII art');
            console.log('    remix()     Initiate reality remix sequence');
            console.log('    void()      Enter the void (invert reality)');
            console.log('    glitch()    Destabilize reality matrix');
            console.log('');
            console.log('EXAMPLES');
            console.log('    sayless.remix()    # Remix your world');
            console.log('    sayless.void()     # Enter the void');
            console.log('');
            console.log('AUTHOR');
            console.log('    Chris - Electronic Music Rebellion');
            console.log('');
            console.log('SEE ALSO');
            console.log('    instagram.com/just.sayless');
            console.log('    soundcloud.com/just-say-less');
            console.log('');
            console.log('SAYLESS(1)                       July 2025                    SAYLESS(1)');
            return 'MANUAL DISPLAYED';
        },
        
        print: function() {
            console.log(saylessArt);
            return 'ASCII ART DISPLAYED';
        },
        
        ascii: function() {
            console.log(saylessArt);
            return 'ASCII ART DISPLAYED';
        },
        
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

    // Simple devtools detection - just show the message once
    let messageShown = false;
    
    function showConsoleMessage() {
        if (!messageShown) {
            console.log(saylessArt);
            console.log(' ');
            console.log('TYPE: sayless.help()');
            messageShown = true;
        }
    }

    // Trigger on any console interaction
    const originalLog = console.log;
    console.log = function() {
        showConsoleMessage();
        originalLog.apply(console, arguments);
    };
    
    // Also show immediately for direct console access
    setTimeout(showConsoleMessage, 100);
})();