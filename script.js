document.addEventListener('DOMContentLoaded', () => {
    // 1. Lightbox State & Elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const counterText = document.getElementById('lightbox-counter');
    const closeBtn = document.getElementsByClassName('close')[0];
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let galleryImages = [];
    let currentIndex = 0;

    // Refresh lightbox items based on what's in the DOM
    function refreshLightboxItems() {
        galleryImages = Array.from(document.querySelectorAll('.project-card .img-after, .project-card .gallery-single-img'));
    }

    function openLightbox(index) {
        if (!galleryImages.length || index < 0 || index >= galleryImages.length) return;
        currentIndex = index;
        const img = galleryImages[currentIndex];
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

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (lightbox) lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            } else if (e.key === 'ArrowLeft') {
                changeSlide(-1);
            } else if (e.key === 'ArrowRight') {
                changeSlide(1);
            }
        }
    });

    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

    // Gallery Delegation
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

    // Initial check for pre-rendered items (e.g. In unit tests)
    refreshLightboxItems();

    // 2. Render Gallery if dynamic data exists
    if (typeof galleryData !== 'undefined' && galleryData.length > 0) {
        initModernGallery(galleryData, { onRender: refreshLightboxItems });
    }

    // 3. Hero Carousel Logic
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000;
        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }
        setInterval(nextSlide, slideInterval);
    }

    // 4. Contact Form Toggle
    const toggleBtn = document.getElementById('toggle-form-btn');
    const contactForm = document.getElementById('contact-form');
    if (toggleBtn && contactForm) {
        toggleBtn.addEventListener('click', () => {
            contactForm.classList.remove('hidden');
            toggleBtn.style.display = 'none';
        });
    }
});

// Modern Gallery Helpers
function transformProjectsToItems(projects) {
    const flattenedItems = [];
    const categoriesMap = new Map();

    projects.forEach(project => {
        const categoryId = project.id;
        const categoryTitle = project.title;

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
        parsedCategories: Array.from(categoriesMap.values())
    };
}

function renderFilterButtons(filterContainer, parsedCategories) {
    if (!filterContainer) return;
    filterContainer.innerHTML = '';

    if (parsedCategories.length > 1) {
        filterContainer.style.display = 'flex';

        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn active';
        allBtn.setAttribute('data-filter', 'all');
        allBtn.textContent = 'All Photos';
        filterContainer.appendChild(allBtn);

        parsedCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', cat.id);
            btn.textContent = cat.title;
            filterContainer.appendChild(btn);
        });
    } else {
        filterContainer.style.display = 'none';
    }
}

function createProjectCard(item) {
    const card = document.createElement('div');
    card.className = 'project-card';
    if (item.hasBefore) card.classList.add('has-before');

    const imgAfter = document.createElement('img');
    imgAfter.src = item.afterImg;
    imgAfter.alt = item.title;
    imgAfter.className = 'img-after';
    imgAfter.loading = 'lazy';
    card.appendChild(imgAfter);

    if (item.hasBefore) {
        const imgBefore = document.createElement('img');
        imgBefore.src = item.beforeImg;
        imgBefore.alt = item.title + " (Before)";
        imgBefore.className = 'img-before';
        imgBefore.loading = 'lazy';
        card.appendChild(imgBefore);

        const toggleBar = document.createElement('div');
        toggleBar.className = 'ba-toggle-bar';
        toggleBar.innerHTML = `
            <button type="button" class="ba-toggle-btn active" data-view="after">After</button>
            <button type="button" class="ba-toggle-btn" data-view="before">Before</button>
        `;
        card.appendChild(toggleBar);
    }

    return card;
}

// Modern Gallery Grid, Filtering, and Pagination
function initModernGallery(projects, options = {}) {
    const container = document.getElementById('gallery-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const remainingCountSpan = document.getElementById('remaining-count');
    const filterContainer = document.getElementById('gallery-filters');
    if (!container) return;

    const { flattenedItems, parsedCategories } = transformProjectsToItems(projects);

    renderFilterButtons(filterContainer, parsedCategories);

    let currentFilter = 'all';
    let visibleCount = 12;
    const batchSize = 12;
    let cachedFilteredItems = flattenedItems;

    function renderItems() {
        const toShow = cachedFilteredItems.slice(0, visibleCount);

        container.innerHTML = '';

        if (toShow.length === 0) {
            container.innerHTML = '<p class="no-photos-msg">No photos found in this category.</p>';
            if (loadMoreBtn) loadMoreBtn.parentElement.style.display = 'none';
            if (options.onRender) options.onRender();
            return;
        }

        const fragment = document.createDocumentFragment();

        toShow.forEach(item => {
            fragment.appendChild(createProjectCard(item));
        });

        container.appendChild(fragment);

        // Update Load More button state
        const remaining = cachedFilteredItems.length - visibleCount;
        if (loadMoreBtn) {
            if (remaining > 0) {
                loadMoreBtn.parentElement.style.display = 'block';
                if (remainingCountSpan) remainingCountSpan.textContent = remaining;
            } else {
                loadMoreBtn.parentElement.style.display = 'none';
            }
        }

        if (options.onRender) {
            options.onRender();
        }
    }

    // Attach listener to filterContainer using event delegation
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (btn) {
                const currentActive = filterContainer.querySelector('.filter-btn.active');
                if (currentActive) currentActive.classList.remove('active');
                btn.classList.add('active');
                currentFilter = btn.getAttribute('data-filter');
                cachedFilteredItems = currentFilter === 'all'
                    ? flattenedItems
                    : flattenedItems.filter(item => item.type === currentFilter);
                visibleCount = 12;
                renderItems();
            }
        });
    }

    // Load More Click
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount += batchSize;
            renderItems();
        });
    }

    renderItems();
}

// Export for Jest testing if running in Node environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initModernGallery
    };
}
