/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Gallery Lightbox Logic', () => {
    let scriptCode;
    
    beforeAll(() => {
        // Read script.js so we can execute it in the test environment
        scriptCode = fs.readFileSync(path.resolve(__dirname, './script.js'), 'utf8');
    });

    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <div id="gallery-container">
                <div class="project-card">
                    <img class="img-after" src="img1.jpg" alt="Image 1">
                </div>
                <div class="project-card">
                    <img class="img-after" src="img2.jpg" alt="Image 2">
                </div>
                <div class="project-card">
                    <img class="img-after" src="img3.jpg" alt="Image 3">
                </div>
            </div>
            
            <div id="lightbox" style="display: none;">
                <span class="close">&times;</span>
                <img id="lightbox-img" src="">
                <div id="caption"></div>
                <a class="prev" id="prev-btn">&#10094;</a>
                <a class="next" id="next-btn">&#10095;</a>
            </div>
        `;

        // Execute script.js code in the current scope
        eval(scriptCode);

        // Trigger DOMContentLoaded so our script's listeners are attached
        const event = document.createEvent('Event');
        event.initEvent('DOMContentLoaded', true, true);
        document.dispatchEvent(event);
    });

    afterEach(() => {
        // Clean up DOM and any listeners
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    test('Lightbox opens when a gallery image is clicked', () => {
        const firstCard = document.querySelector('.project-card');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');

        expect(lightbox.style.display).toBe('none');

        // Click the first card
        // We need to simulate bubble because event delegation relies on it
        const img = firstCard.querySelector('.img-after');
        const event = document.createEvent('HTMLEvents');
        event.initEvent('click', true, false);
        img.dispatchEvent(event);

        expect(lightbox.style.display).toBe('block');
        expect(lightboxImg.src).toContain('img1.jpg');
    });

    test('Slide navigation wraps around from last to first (forward boundary)', () => {
        const nextBtn = document.getElementById('next-btn');
        const lightboxImg = document.getElementById('lightbox-img');
        const cards = document.querySelectorAll('.project-card');

        // Open last image
        const img = cards[2].querySelector('.img-after');
        const clickEvent = document.createEvent('HTMLEvents');
        clickEvent.initEvent('click', true, false);
        img.dispatchEvent(clickEvent);
        
        expect(lightboxImg.src).toContain('img3.jpg');

        // Click next -> Should wrap to first image
        nextBtn.click();
        expect(lightboxImg.src).toContain('img1.jpg');
    });

    test('Slide navigation wraps around from first to last (backward boundary)', () => {
        const prevBtn = document.getElementById('prev-btn');
        const lightboxImg = document.getElementById('lightbox-img');
        const cards = document.querySelectorAll('.project-card');

        // Open first image
        const img = cards[0].querySelector('.img-after');
        const clickEvent = document.createEvent('HTMLEvents');
        clickEvent.initEvent('click', true, false);
        img.dispatchEvent(clickEvent);
        
        expect(lightboxImg.src).toContain('img1.jpg');

        // Click prev -> Should wrap to last image
        prevBtn.click();
        expect(lightboxImg.src).toContain('img3.jpg');
    });
});
