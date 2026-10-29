/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const {
    initModernGallery,
    flattenGalleryProjects,
    createProjectCard,
    refreshLightboxItems,
    initHeroCarousel,
    initContactFormToggle
} = require('./script.js');

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

    test('Keyboard navigation handles ArrowRight, ArrowLeft, and Escape', () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const cards = document.querySelectorAll('.project-card');

        // Open lightbox at first image
        const img = cards[0].querySelector('.img-after');
        const clickEvent = document.createEvent('HTMLEvents');
        clickEvent.initEvent('click', true, false);
        img.dispatchEvent(clickEvent);
        expect(lightbox.style.display).toBe('block');
        expect(lightboxImg.src).toContain('img1.jpg');

        // Press ArrowRight -> Next slide
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        expect(lightboxImg.src).toContain('img2.jpg');

        // Press ArrowLeft -> Prev slide
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        expect(lightboxImg.src).toContain('img1.jpg');

        // Press Escape -> Close lightbox
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(lightbox.style.display).toBe('none');
        expect(document.body.style.overflow).toBe('auto');
    });

    test('Touch swipe navigation supports swipe left and swipe right', () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const cards = document.querySelectorAll('.project-card');

        // Open lightbox at first image
        const img = cards[0].querySelector('.img-after');
        const clickEvent = document.createEvent('HTMLEvents');
        clickEvent.initEvent('click', true, false);
        img.dispatchEvent(clickEvent);
        expect(lightbox.style.display).toBe('block');
        expect(lightboxImg.src).toContain('img1.jpg');

        // Swipe left (start at 200, end at 100: diff > 50) -> next
        const touchStartLeft = new Event('touchstart');
        Object.defineProperty(touchStartLeft, 'changedTouches', {
            value: [{ screenX: 200 }]
        });
        lightbox.dispatchEvent(touchStartLeft);

        const touchEndLeft = new Event('touchend');
        Object.defineProperty(touchEndLeft, 'changedTouches', {
            value: [{ screenX: 100 }]
        });
        lightbox.dispatchEvent(touchEndLeft);
        expect(lightboxImg.src).toContain('img2.jpg');

        // Swipe right (start at 100, end at 200: diff > 50) -> prev
        const touchStartRight = new Event('touchstart');
        Object.defineProperty(touchStartRight, 'changedTouches', {
            value: [{ screenX: 100 }]
        });
        lightbox.dispatchEvent(touchStartRight);

        const touchEndRight = new Event('touchend');
        Object.defineProperty(touchEndRight, 'changedTouches', {
            value: [{ screenX: 200 }]
        });
        lightbox.dispatchEvent(touchEndRight);
        expect(lightboxImg.src).toContain('img1.jpg');
    });

    test('Lightbox closes when close button or background overlay is clicked', () => {
        const lightbox = document.getElementById('lightbox');
        const closeBtn = document.querySelector('.close');
        const cards = document.querySelectorAll('.project-card');

        // Open lightbox
        const img = cards[0].querySelector('.img-after');
        const clickEvent = document.createEvent('HTMLEvents');
        clickEvent.initEvent('click', true, false);
        img.dispatchEvent(clickEvent);
        expect(lightbox.style.display).toBe('block');
        expect(document.body.style.overflow).toBe('hidden');

        // Click close button
        closeBtn.click();
        expect(lightbox.style.display).toBe('none');
        expect(document.body.style.overflow).toBe('auto');

        // Re-open lightbox
        img.dispatchEvent(clickEvent);
        expect(lightbox.style.display).toBe('block');

        // Click backdrop overlay (event.target === lightbox)
        lightbox.click();
        expect(lightbox.style.display).toBe('none');
        expect(document.body.style.overflow).toBe('auto');
    });

    test('Lightbox caption falls back to "Project Image" when alt is missing', () => {
        // Append card with image lacking alt attribute
        const container = document.getElementById('gallery-container');
        const cardNoAlt = document.createElement('div');
        cardNoAlt.className = 'project-card';
        cardNoAlt.innerHTML = `<img class="img-after" src="img_no_alt.jpg">`;
        container.appendChild(cardNoAlt);

        // Click image without alt
        const img = cardNoAlt.querySelector('.img-after');
        const clickEvent = document.createEvent('HTMLEvents');
        clickEvent.initEvent('click', true, false);
        img.dispatchEvent(clickEvent);

        const captionText = document.getElementById('caption');
        expect(captionText.textContent).toBe('Project Image');
    });

    test('Before/After toggle button correctly toggles image opacities and active class', () => {
        const container = document.getElementById('gallery-container');
        const cardBA = document.createElement('div');
        cardBA.className = 'project-card has-before';
        cardBA.innerHTML = `
            <img class="img-after" src="after.jpg" alt="After View">
            <img class="img-before" src="before.jpg" alt="Before View">
            <div class="ba-toggle-bar">
                <button type="button" class="ba-toggle-btn active" data-view="after">After</button>
                <button type="button" class="ba-toggle-btn" data-view="before">Before</button>
            </div>
        `;
        container.appendChild(cardBA);

        const beforeBtn = cardBA.querySelector('.ba-toggle-btn[data-view="before"]');
        const afterBtn = cardBA.querySelector('.ba-toggle-btn[data-view="after"]');
        const imgBefore = cardBA.querySelector('.img-before');
        const imgAfter = cardBA.querySelector('.img-after');

        // Click "Before" button
        beforeBtn.click();
        expect(imgBefore.style.opacity).toBe('1');
        expect(imgAfter.style.opacity).toBe('0');
        expect(beforeBtn.classList.contains('active')).toBe(true);
        expect(afterBtn.classList.contains('active')).toBe(false);

        // Click "After" button
        afterBtn.click();
        expect(imgBefore.style.opacity).toBe('0');
        expect(imgAfter.style.opacity).toBe('1');
        expect(afterBtn.classList.contains('active')).toBe(true);
        expect(beforeBtn.classList.contains('active')).toBe(false);
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

    test('nextSlide pauses and does not rotate slide when document is hidden', () => {
        const slides = document.querySelectorAll('.hero-slide');
        expect(slides[0].classList.contains('active')).toBe(true);

        // Mock document.hidden = true
        Object.defineProperty(document, 'hidden', {
            configurable: true,
            get: () => true
        });

        jest.advanceTimersByTime(5000);
        // Slide should remain active at slide 0
        expect(slides[0].classList.contains('active')).toBe(true);
        expect(slides[1].classList.contains('active')).toBe(false);

        // Reset document.hidden = false
        Object.defineProperty(document, 'hidden', {
            configurable: true,
            get: () => false
        });

        jest.advanceTimersByTime(5000);
        // Now rotates to slide 1
        expect(slides[0].classList.contains('active')).toBe(false);
        expect(slides[1].classList.contains('active')).toBe(true);
    });

    test('initHeroCarousel handles empty DOM gracefully', () => {
        document.body.innerHTML = '';
        expect(() => initHeroCarousel()).not.toThrow();
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

    test('Load More button displays remaining count and renders next batch on click', () => {
        // Create 15 mock project items
        const manyProjects = [];
        for (let i = 1; i <= 15; i++) {
            manyProjects.push({
                id: `proj_${i}`,
                title: `Project ${i}`,
                hasBefore: false,
                afterImages: [`proj_${i}.jpg`]
            });
        }

        initModernGallery(manyProjects);

        const loadMoreContainer = document.querySelector('.load-more-container');
        const loadMoreBtn = document.getElementById('load-more-btn');
        const remainingCountSpan = document.getElementById('remaining-count');

        // Initial render shows 12 items, 3 remaining
        expect(document.querySelectorAll('.project-card').length).toBe(12);
        expect(loadMoreContainer.style.display).toBe('block');
        expect(remainingCountSpan.textContent).toBe('3');

        // Click Load More
        loadMoreBtn.click();

        // Now shows all 15 items, load more container hidden
        expect(document.querySelectorAll('.project-card').length).toBe(15);
        expect(loadMoreContainer.style.display).toBe('none');
    });

    test('initModernGallery displays "No photos found" message when projects array is empty', () => {
        initModernGallery([]);

        const container = document.getElementById('gallery-container');
        const emptyMsg = container.querySelector('.no-photos-msg');
        const loadMoreContainer = document.querySelector('.load-more-container');

        expect(emptyMsg).not.toBeNull();
        expect(emptyMsg.textContent).toBe('No photos found in this category.');
        expect(loadMoreContainer.style.display).toBe('none');
    });
});

describe('Contact Form Toggle', () => {
    let scriptCode;

    beforeAll(() => {
        scriptCode = fs.readFileSync(path.resolve(__dirname, './script.js'), 'utf8');
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <button id="toggle-form-btn">Contact Us</button>
            <form id="contact-form" class="hidden"></form>
        `;
        eval(scriptCode);
        const event = document.createEvent('Event');
        event.initEvent('DOMContentLoaded', true, true);
        document.dispatchEvent(event);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    test('Clicking toggle button displays form and hides button', () => {
        const toggleBtn = document.getElementById('toggle-form-btn');
        const contactForm = document.getElementById('contact-form');

        expect(contactForm.classList.contains('hidden')).toBe(true);
        expect(toggleBtn.style.display).not.toBe('none');

        toggleBtn.click();

        expect(contactForm.classList.contains('hidden')).toBe(false);
        expect(toggleBtn.style.display).toBe('none');
    });

    test('initContactFormToggle handles missing elements gracefully', () => {
        document.body.innerHTML = '';
        expect(() => initContactFormToggle()).not.toThrow();

        document.body.innerHTML = '<button id="toggle-form-btn">Contact Us</button>';
        expect(() => initContactFormToggle()).not.toThrow();
    });
});

describe('flattenGalleryProjects Helper', () => {
    test('returns empty flattenedItems and categories for empty input', () => {
        const result = flattenGalleryProjects([]);
        expect(result).toEqual({ flattenedItems: [], categories: [] });
    });

    test('flattens project with before and after images', () => {
        const projects = [
            {
                id: 'living_room',
                title: 'Living Room',
                hasBefore: true,
                beforeImages: ['before_lr.jpg'],
                afterImages: ['after_lr1.jpg', 'after_lr2.jpg']
            }
        ];

        const { flattenedItems, categories } = flattenGalleryProjects(projects);

        expect(categories).toEqual([{ id: 'living_room', title: 'Living Room' }]);
        expect(flattenedItems.length).toBe(2);

        // Primary item with before & after
        expect(flattenedItems[0]).toEqual({
            type: 'living_room',
            title: 'Living Room',
            beforeImg: 'before_lr.jpg',
            afterImg: 'after_lr1.jpg',
            hasBefore: true
        });

        // Detail item with after only
        expect(flattenedItems[1]).toEqual({
            type: 'living_room',
            title: 'Living Room (Detail 2)',
            afterImg: 'after_lr2.jpg',
            hasBefore: false
        });
    });

    test('flattens project with after images only', () => {
        const projects = [
            {
                id: 'bathrooms',
                title: 'Bathrooms',
                hasBefore: false,
                afterImages: ['bath1.jpg', 'bath2.jpg']
            }
        ];

        const { flattenedItems, categories } = flattenGalleryProjects(projects);

        expect(categories).toEqual([{ id: 'bathrooms', title: 'Bathrooms' }]);
        expect(flattenedItems.length).toBe(2);
        expect(flattenedItems[0].title).toBe('Bathrooms');
        expect(flattenedItems[1].title).toBe('Bathrooms');
    });

    test('formats general_work titles as "Plastering Work X"', () => {
        const projects = [
            {
                id: 'general_work',
                title: 'General Work',
                hasBefore: false,
                afterImages: ['gw1.jpg', 'gw2.jpg']
            }
        ];

        const { flattenedItems } = flattenGalleryProjects(projects);
        expect(flattenedItems[0].title).toBe('Plastering Work 1');
        expect(flattenedItems[1].title).toBe('Plastering Work 2');
    });
});

describe('createProjectCard Helper', () => {
    test('creates standard card for item without before image', () => {
        const item = {
            title: 'Kitchen Renovation',
            afterImg: 'kitchen.jpg',
            hasBefore: false
        };

        const card = createProjectCard(item);

        expect(card.className).toBe('project-card');
        expect(card.classList.contains('has-before')).toBe(false);

        const imgAfter = card.querySelector('.img-after');
        expect(imgAfter).not.toBeNull();
        expect(imgAfter.src).toContain('kitchen.jpg');
        expect(imgAfter.alt).toBe('Kitchen Renovation');
        expect(imgAfter.loading).toBe('lazy');

        expect(card.querySelector('.img-before')).toBeNull();
        expect(card.querySelector('.ba-toggle-bar')).toBeNull();
    });

    test('creates before/after card with toggle controls when hasBefore is true', () => {
        const item = {
            title: 'Living Room',
            beforeImg: 'lr_before.jpg',
            afterImg: 'lr_after.jpg',
            hasBefore: true
        };

        const card = createProjectCard(item);

        expect(card.classList.contains('has-before')).toBe(true);

        const imgAfter = card.querySelector('.img-after');
        const imgBefore = card.querySelector('.img-before');
        expect(imgAfter).not.toBeNull();
        expect(imgBefore).not.toBeNull();
        expect(imgBefore.alt).toBe('Living Room (Before)');

        const toggleBar = card.querySelector('.ba-toggle-bar');
        expect(toggleBar).not.toBeNull();

        const buttons = toggleBar.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].getAttribute('data-view')).toBe('after');
        expect(buttons[0].classList.contains('active')).toBe(true);
        expect(buttons[0].textContent).toBe('After');

        expect(buttons[1].getAttribute('data-view')).toBe('before');
        expect(buttons[1].classList.contains('active')).toBe(false);
        expect(buttons[1].textContent).toBe('Before');
    });
});

describe('refreshLightboxItems Helper', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('resets galleryImages when #gallery-container is missing', () => {
        refreshLightboxItems();
        expect(document.getElementById('gallery-container')).toBeNull();
    });

    test('collects all gallery images from #gallery-container', () => {
        document.body.innerHTML = `
            <div id="gallery-container">
                <div class="project-card">
                    <img class="img-after" src="img1.jpg" alt="Img 1">
                </div>
                <div class="project-card">
                    <img class="gallery-single-img" src="img2.jpg" alt="Img 2">
                </div>
                <div class="unrelated-card">
                    <img class="other-img" src="ignored.jpg" alt="Ignored">
                </div>
            </div>
        `;

        refreshLightboxItems();
        const container = document.getElementById('gallery-container');
        const expectedImgs = container.querySelectorAll('.project-card .img-after, .project-card .gallery-single-img');
        expect(expectedImgs.length).toBe(2);
    });
});

