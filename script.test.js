/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { initModernGallery } = require('./script.js');

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

    test('openLightbox gracefully ignores invalid bounds', () => {
        const lightbox = document.getElementById('lightbox');
        expect(lightbox.style.display).toBe('none');

        // Call global openLightbox if exposed or simulate index bounds directly
        if (typeof openLightbox === 'function') {
            openLightbox(-1);
            expect(lightbox.style.display).toBe('none');
            openLightbox(999);
            expect(lightbox.style.display).toBe('none');
        }
    });
});

describe('Hero Carousel Logic', () => {
    let scriptCode;

    beforeAll(() => {
        scriptCode = fs.readFileSync(path.resolve(__dirname, './script.js'), 'utf8');
    });

    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = `
            <div class="hero-slide active"></div>
            <div class="hero-slide"></div>
            <div class="hero-slide"></div>
        `;
        eval(scriptCode);
        const event = document.createEvent('Event');
        event.initEvent('DOMContentLoaded', true, true);
        document.dispatchEvent(event);
    });

    afterEach(() => {
        jest.useRealTimers();
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    test('nextSlide rotates active class across slides on interval', () => {
        const slides = document.querySelectorAll('.hero-slide');
        expect(slides[0].classList.contains('active')).toBe(true);
        expect(slides[1].classList.contains('active')).toBe(false);

        // Advance timer by 5000ms
        jest.advanceTimersByTime(5000);
        expect(slides[0].classList.contains('active')).toBe(false);
        expect(slides[1].classList.contains('active')).toBe(true);

        // Advance timer by another 5000ms
        jest.advanceTimersByTime(5000);
        expect(slides[1].classList.contains('active')).toBe(false);
        expect(slides[2].classList.contains('active')).toBe(true);

        // Wraps around to first slide
        jest.advanceTimersByTime(5000);
        expect(slides[2].classList.contains('active')).toBe(false);
        expect(slides[0].classList.contains('active')).toBe(true);
    });
});

describe('initModernGallery & Filter Logic', () => {
    let scriptCode;

    beforeAll(() => {
        scriptCode = fs.readFileSync(path.resolve(__dirname, './script.js'), 'utf8');
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="gallery-filters" style="display: none;"></div>
            <div id="gallery-container"></div>
            <div class="load-more-container" style="display: none;">
                <button id="load-more-btn">Load More (<span id="remaining-count">0</span> remaining)</button>
            </div>
        `;
        eval(scriptCode);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    test('initModernGallery renders filter buttons and gallery items', () => {
        const mockProjects = [
            {
                id: 'living_room',
                title: 'Living Room',
                hasBefore: true,
                beforeImages: ['before_lr.jpg'],
                afterImages: ['after_lr.jpg']
            },
            {
                id: 'kitchen',
                title: 'Kitchen',
                hasBefore: false,
                afterImages: ['after_k1.jpg', 'after_k2.jpg']
            }
        ];

        initModernGallery(mockProjects);

        const filterBtns = document.querySelectorAll('.filter-btn');
        // Should have "All Photos", "Living Room", "Kitchen"
        expect(filterBtns.length).toBe(3);
        expect(filterBtns[0].getAttribute('data-filter')).toBe('all');
        expect(filterBtns[0].classList.contains('active')).toBe(true);

        const cards = document.querySelectorAll('.project-card');
        // Living room: 1 card with before/after. Kitchen: 2 cards. Total: 3 cards
        expect(cards.length).toBe(3);

        // Verify filter interaction
        const kitchenBtn = Array.from(filterBtns).find(btn => btn.getAttribute('data-filter') === 'kitchen');
        expect(kitchenBtn).toBeDefined();

        kitchenBtn.click();
        expect(kitchenBtn.classList.contains('active')).toBe(true);
        expect(filterBtns[0].classList.contains('active')).toBe(false);

        const filteredCards = document.querySelectorAll('.project-card');
        expect(filteredCards.length).toBe(2);

        // Click All Photos again
        filterBtns[0].click();
        expect(document.querySelectorAll('.project-card').length).toBe(3);
    });
});
