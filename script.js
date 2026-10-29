// Lightbox State & Elements cache
let galleryImages = [];
let currentIndex = 0;

// Refresh lightbox items based on what's in the DOM (scoped to #gallery-container for performance)
function refreshLightboxItems() {
    const container = document.getElementById('gallery-container');
    if (!container) {
        galleryImages = [];
        return;
    }
    galleryImages = Array.from(container.querySelectorAll('.project-card .img-after, .project-card .gallery-single-img'));
}

function openLightbox(index) {
    if (!galleryImages.length || index < 0 || index >= galleryImages.length) return;
    currentIndex = index;
    const img = galleryImages[currentIndex];
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const counterText = document.getElementById('lightbox-counter');

    if (lightbox) {
        lightbox.style.display = 'block';
        if (lightboxImg) lightboxImg.src = img.src;
        if (captionText) captionText.textContent = img.alt || "Project Image";
        if (counterText) counterText.textContent = `${currentIndex + 1} of ${galleryImages.length}`;
        document.body.style.overflow = 'hidden';
    }
}

function changeSlide(n) {
    if (!galleryImages.length) return;
    let newIndex = currentIndex + n;
    if (newIndex >= galleryImages.length) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = galleryImages.length - 1;
    }
    openLightbox(newIndex);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 1. Initialize Lightbox event listeners and controls
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementsByClassName('close')[0];
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                changeSlide(-1);
            } else if (e.key === 'ArrowRight') {
                changeSlide(1);
            }
        }
    });

    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

    // Gallery Delegation for card clicks and before/after toggle buttons
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
        galleryContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (card) {
                // If user clicked a before/after toggle button, handle toggle
                const toggleBtn = e.target.closest('.ba-toggle-btn');
                if (toggleBtn) {
                    e.stopPropagation();
                    const state = toggleBtn.getAttribute('data-view');
                    const imgBefore = card.querySelector('.img-before');
                    const imgAfter = card.querySelector('.img-after');
                    if (imgBefore && imgAfter) {
                        if (state === 'before') {
                            imgBefore.style.opacity = '1';
                            imgAfter.style.opacity = '0';
                        } else {
                            imgBefore.style.opacity = '0';
                            imgAfter.style.opacity = '1';
                        }
                        const toggleBar = toggleBtn.parentElement;
                        if (toggleBar) {
                            for (const btn of toggleBar.children) {
                                btn.classList.remove('active');
                            }
                        }
                        toggleBtn.classList.add('active');
                    }
                    return;
                }

                const activeImg = card.querySelector('.img-after') || card.querySelector('img');
                let index = galleryImages.indexOf(activeImg);
                if (index === -1) {
                    refreshLightboxItems();
                    index = galleryImages.indexOf(activeImg);
                }
                if (index !== -1) {
                    openLightbox(index);
                }
            }
        });
    }

    // Touch swipe support for lightbox on mobile
    let touchStartX = 0;
    let touchEndX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                changeSlide(1); // Swipe left -> next
            } else if (touchEndX - touchStartX > 50) {
                changeSlide(-1); // Swipe right -> prev
            }
        }, { passive: true });
    }

    // Initial check for pre-rendered items (e.g. in unit tests)
    refreshLightboxItems();
}

// 2. Initialize Hero Carousel
function initHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000;
        function nextSlide() {
            if (document.hidden) return;
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }
        setInterval(nextSlide, slideInterval);
    }
}

// 3. Initialize Contact Form Toggle
function initContactFormToggle() {
    const toggleBtn = document.getElementById('toggle-form-btn');
    const contactForm = document.getElementById('contact-form');
    if (toggleBtn && contactForm) {
        toggleBtn.addEventListener('click', () => {
            contactForm.classList.remove('hidden');
            toggleBtn.style.display = 'none';
        });
    }
}

// Helper: Flatten projects structure into uniform gallery items & categories
function flattenGalleryProjects(projects) {
    const flattenedItems = [];
    const categoriesMap = new Map();

    projects.forEach(project => {
        const categoryId = project.id;
        const categoryTitle = project.title;

        // If it's a specific project with before/after
        if (project.hasBefore && project.beforeImages && project.beforeImages.length > 0) {
            categoriesMap.set(categoryId, { id: categoryId, title: categoryTitle });
            flattenedItems.push({
                type: categoryId,
                title: categoryTitle,
                beforeImg: project.beforeImages[0],
                afterImg: project.afterImages[0],
                hasBefore: true
            });
            for (let i = 1; i < project.afterImages.length; i++) {
                flattenedItems.push({
                    type: categoryId,
                    title: `${categoryTitle} (Detail ${i + 1})`,
                    afterImg: project.afterImages[i],
                    hasBefore: false
                });
            }
        } else if (project.afterImages && project.afterImages.length > 0) {
            categoriesMap.set(categoryId, { id: categoryId, title: categoryTitle });
            project.afterImages.forEach((imgUrl, idx) => {
                flattenedItems.push({
                    type: categoryId,
                    title: project.id === 'general_work' ? `Plastering Work ${idx + 1}` : project.title,
                    afterImg: imgUrl,
                    hasBefore: false
                });
            });
        }
    });

    return {
        flattenedItems,
        categories: Array.from(categoriesMap.values())
    };
}

// Helper: Create a project card element
function createProjectCard(item) {
    const card = document.createElement('div');
    card.className = 'project-card';
    if (item.hasBefore) card.classList.add('has-before');

    // After Image
    const imgAfter = document.createElement('img');
    imgAfter.src = item.afterImg;
    imgAfter.alt = item.title;
    imgAfter.className = 'img-after';
    imgAfter.loading = 'lazy';
    card.appendChild(imgAfter);

    // Before Image if available
    if (item.hasBefore) {
        const imgBefore = document.createElement('img');
        imgBefore.src = item.beforeImg;
        imgBefore.alt = item.title + " (Before)";
        imgBefore.className = 'img-before';
        imgBefore.loading = 'lazy';
        card.appendChild(imgBefore);

        // Mobile/Touch Friendly Toggle Controls
        const toggleBar = document.createElement('div');
        toggleBar.className = 'ba-toggle-bar';

        const afterBtn = document.createElement('button');
        afterBtn.type = 'button';
        afterBtn.className = 'ba-toggle-btn active';
        afterBtn.setAttribute('data-view', 'after');
        afterBtn.textContent = 'After';

        const beforeBtn = document.createElement('button');
        beforeBtn.type = 'button';
        beforeBtn.className = 'ba-toggle-btn';
        beforeBtn.setAttribute('data-view', 'before');
        beforeBtn.textContent = 'Before';

        toggleBar.appendChild(afterBtn);
        toggleBar.appendChild(beforeBtn);
        card.appendChild(toggleBar);
    }

    return card;
}

// Helper: Render a batch of gallery cards into container
function renderGalleryBatch({ container, items, visibleCount, batchSize, isAppend, loadMoreBtn, remainingCountSpan, onRender }) {
    if (!isAppend) {
        container.textContent = '';
        if (items.length === 0) {
            const noPhotosMsg = document.createElement('p');
            noPhotosMsg.className = 'no-photos-msg';
            noPhotosMsg.textContent = 'No photos found in this category.';
            container.appendChild(noPhotosMsg);
            if (loadMoreBtn && loadMoreBtn.parentElement) loadMoreBtn.parentElement.style.display = 'none';
            if (onRender) onRender();
            return;
        }
    }

    const startIndex = isAppend ? visibleCount - batchSize : 0;
    const toShow = items.slice(startIndex, visibleCount);

    const fragment = document.createDocumentFragment();
    toShow.forEach(item => {
        fragment.appendChild(createProjectCard(item));
    });
    container.appendChild(fragment);

    // Update Load More button state
    const remaining = items.length - visibleCount;
    if (loadMoreBtn && loadMoreBtn.parentElement) {
        if (remaining > 0) {
            loadMoreBtn.parentElement.style.display = 'block';
            if (remainingCountSpan) remainingCountSpan.textContent = remaining;
        } else {
            loadMoreBtn.parentElement.style.display = 'none';
        }
    }

    if (onRender) {
        onRender();
    }
}

// Helper: Setup category filter buttons and click event delegation
function setupGalleryFilters(filterContainer, categories, onFilterSelect) {
    filterContainer.textContent = '';
    if (categories.length > 1) {
        filterContainer.style.display = 'flex';

        // "All Photos" button
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn active';
        allBtn.setAttribute('data-filter', 'all');
        allBtn.textContent = 'All Photos';
        filterContainer.appendChild(allBtn);

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', cat.id);
            btn.textContent = cat.title;
            filterContainer.appendChild(btn);
        });

        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (btn) {
                const currentActive = filterContainer.querySelector('.filter-btn.active');
                if (currentActive) currentActive.classList.remove('active');
                btn.classList.add('active');
                const filterId = btn.getAttribute('data-filter');
                onFilterSelect(filterId);
            }
        });
    } else {
        filterContainer.style.display = 'none';
    }
}

// Modern Gallery Grid, Filtering, and Pagination
function initModernGallery(projects, options = {}) {
    const container = document.getElementById('gallery-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const remainingCountSpan = document.getElementById('remaining-count');
    const filterContainer = document.getElementById('gallery-filters');
    if (!container) return;

    const { flattenedItems, categories } = flattenGalleryProjects(projects || []);

    // Build pre-computed Map for O(1) filtering lookup using a single pass (O(N))
    const groupedItemsMap = new Map();
    groupedItemsMap.set('all', flattenedItems);
    categories.forEach(cat => groupedItemsMap.set(cat.id, []));
    flattenedItems.forEach(item => {
        const group = groupedItemsMap.get(item.type);
        if (group) group.push(item);
    });

    let currentFilter = 'all';
    let visibleCount = 12;
    const batchSize = 12;
    let cachedFilteredItems = flattenedItems;

    function render(isAppend = false) {
        renderGalleryBatch({
            container,
            items: cachedFilteredItems,
            visibleCount,
            batchSize,
            isAppend,
            loadMoreBtn,
            remainingCountSpan,
            onRender: options.onRender
        });
    }

    if (filterContainer) {
        setupGalleryFilters(filterContainer, categories, (filterId) => {
            currentFilter = filterId;
            cachedFilteredItems = groupedItemsMap.get(currentFilter) || [];
            visibleCount = batchSize;
            render(false);
        });
    }

    // Load More Click with incremental rendering
    if (loadMoreBtn) {
        loadMoreBtn.onclick = () => {
            visibleCount += batchSize;
            render(true);
        };
    }

    render(false);
}

// Orchestrate initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initLightbox();

    if (typeof galleryData !== 'undefined' && galleryData.length > 0) {
        initModernGallery(galleryData, { onRender: refreshLightboxItems });
    }

    initHeroCarousel();
    initContactFormToggle();
});

// Export for Jest testing if running in Node environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initModernGallery,
        setupGalleryFilters,
        renderGalleryBatch,
        initLightbox,
        initHeroCarousel,
        initContactFormToggle,
        flattenGalleryProjects,
        createProjectCard,
        refreshLightboxItems,
        openLightbox,
        closeLightbox,
        changeSlide
    };
}
