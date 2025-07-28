#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 SAYLESS Entrance Page Test Script');
console.log('=====================================\n');

// Test results tracker
let passed = 0;
let failed = 0;
const issues = [];

function test(name, condition, details = '') {
    if (condition) {
        console.log(`✅ ${name}`);
        passed++;
    } else {
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
        failed++;
        issues.push(name);
    }
}

// Read entrance.html
const entranceFile = path.join(__dirname, 'entrance.html');
let htmlContent = '';

try {
    htmlContent = fs.readFileSync(entranceFile, 'utf8');
} catch (error) {
    console.log(`❌ Could not read entrance.html: ${error.message}`);
    process.exit(1);
}

console.log('📄 HTML Structure Tests\n');

// Basic HTML structure
test('HTML5 doctype exists', htmlContent.includes('<!doctype html>'));
test('HTML lang attribute set', htmlContent.includes('<html lang="en">'));
test('Meta charset UTF-8', htmlContent.includes('<meta charset="UTF-8"'));
test('Viewport meta tag', htmlContent.includes('name="viewport"'));
test('Title tag exists', htmlContent.includes('<title>'));

// SEO and Social Media
test('Meta description exists', htmlContent.includes('name="description"'));
test('Open Graph tags present', htmlContent.includes('property="og:'));
test('Twitter Card tags present', htmlContent.includes('name="twitter:'));

console.log('\n🎨 Design & Branding Tests\n');

// Font and styling
test('Stencil Gothic font declared', htmlContent.includes('Stencil Gothic'));
test('Font file reference', htmlContent.includes('StencilGothic.ttf'));
test('Black background styling', htmlContent.includes('background-color: black'));
test('White text color', htmlContent.includes('color: white'));

// Animations
test('Flicker animation defined', htmlContent.includes('@keyframes flicker'));
test('Glitch animations defined', htmlContent.includes('@keyframes glitch-'));
test('Terminal flicker animation', htmlContent.includes('@keyframes terminal-flicker'));

console.log('\n🔗 Links & External Content\n');

// Social media links
test('Instagram link present', htmlContent.includes('instagram.com/just.sayless'));
test('SoundCloud link present', htmlContent.includes('soundcloud.com/just-say-less'));
test('Links open in new tab', htmlContent.includes('target="_blank"'));

// Audio content
test('SoundCloud iframes present', (htmlContent.match(/soundcloud\.com\/player/g) || []).length >= 3);
test('Audio player element', htmlContent.includes('<audio'));
test('Audio file reference', htmlContent.includes('.mp3'));

console.log('\n📱 Responsive Design Tests\n');

// Mobile responsiveness
test('Mobile media queries', htmlContent.includes('@media (max-width: 768px)'));
test('Small mobile breakpoint', htmlContent.includes('@media (max-width: 480px)'));
test('Responsive font sizes', htmlContent.includes('font-size: 48px') && htmlContent.includes('font-size: 36px'));

console.log('\n⚙️  Interactive Features Tests\n');

// JavaScript functionality
test('Audio player JavaScript', htmlContent.includes('getElementById("audioPlayer")'));
test('Play button functionality', htmlContent.includes('playBtn.addEventListener'));
test('Progress bar interaction', htmlContent.includes('progressBar.addEventListener'));
test('Volume control', htmlContent.includes('volumeSlider.addEventListener'));
test('Console Easter egg', htmlContent.includes('console-easter-egg.js'));

console.log('\n🎯 Asset Dependencies\n');

// Check if asset files exist
const assetsToCheck = [
    'assets/fonts/StencilGothic.ttf',
    'assets/high-fidelity-autobiographical-record-collection.mp3',
    'assets/js/console-easter-egg.js'
];

assetsToCheck.forEach(asset => {
    const assetPath = path.join(__dirname, asset);
    const exists = fs.existsSync(assetPath);
    test(`${asset} exists`, exists);
});

console.log('\n📊 Test Summary');
console.log('===============');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (issues.length > 0) {
    console.log('\n🔧 Issues to address:');
    issues.forEach(issue => console.log(`   • ${issue}`));
}

console.log('\n🚀 Additional Recommendations:');
console.log('   • Test page in multiple browsers');
console.log('   • Validate CSS animations work smoothly');
console.log('   • Check audio playback on different devices');
console.log('   • Verify social media links are correct');
console.log('   • Test responsive design on actual mobile devices');

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);