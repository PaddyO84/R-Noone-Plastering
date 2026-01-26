document.addEventListener('DOMContentLoaded', () => {
    // 1. Render Gallery if data exists
    if (typeof galleryData !== 'undefined' && galleryData.length > 0) {
        renderGallery(galleryData);
    }

    // 2. Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const closeBtn = document.getElementsByClassName('close')[0];

    // Note: We need to re-select images after rendering
    let galleryImages = [];
    let currentIndex = 0;

    function initLightbox() {
        // Select all 'After' images (the visible ones in the grid)
        // Adjust logic if we want to show both before and after in lightbox
        // For now, let's just show the images that are displayed in the grid (project covers)
        // Actually, if a project has multiple images, this simple grid click won't show them.
        // But per the request, the user organizes by folder.
        // Let's assume the grid shows the 'cover' (after). Clicking it opens lightbox.

        // Strategy: Create a flat list of images for the lightbox.
        // For simple navigation, we'll just use the images rendered in the DOM.
        galleryImages = Array.from(document.querySelectorAll('.project-card .img-after'));

        galleryImages.forEach((img, index) => {
            // Find parent card to add click listener
            const card = img.closest('.project-card');
            card.addEventListener('click', () => {
                openLightbox(index);
            });
        });
    }

    // Open lightbox function
    function openLightbox(index) {
        currentIndex = index;
        const img = galleryImages[currentIndex];
        lightbox.style.display = 'block';
        lightboxImg.src = img.src;
        // Use alt text or project title
        captionText.innerHTML = img.alt || "Project Image";
        document.body.style.overflow = 'hidden'; // Disable scroll
    }

    // Close functionality
    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scroll
    });

    // Close on click outside image (but not on arrows)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scroll
        }
    });

    // Close on Escape key and navigate with arrows
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto'; // Enable scroll
            } else if (e.key === 'ArrowLeft') {
                changeSlide(-1);
            } else if (e.key === 'ArrowRight') {
                changeSlide(1);
            }
        }
    });

    // Make changeSlide globally available
    window.changeSlide = function(n) {
        let newIndex = currentIndex + n;
        if (newIndex >= galleryImages.length) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = galleryImages.length - 1;
        }
        openLightbox(newIndex);
    };

    // Initialize Lightbox listeners
    initLightbox();

    // 3. Hero Carousel Logic
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000; // 5 seconds

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

function renderGallery(projects) {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    container.innerHTML = ''; // Clear loading state

    projects.forEach(project => {
        if (!project.afterImages || project.afterImages.length === 0) return;

        const coverAfter = project.afterImages[0];
        const coverBefore = project.hasBefore && project.beforeImages.length > 0 ? project.beforeImages[0] : null;

        const card = document.createElement('div');
        card.className = 'project-card';
        if (coverBefore) card.classList.add('has-before');

        // After Image (Default Visible)
        const imgAfter = document.createElement('img');
        imgAfter.src = coverAfter;
        imgAfter.alt = project.title + " (After)";
        imgAfter.className = 'img-after';
        imgAfter.loading = 'lazy';
        card.appendChild(imgAfter);

        // Before Image (Hover)
        if (coverBefore) {
            const imgBefore = document.createElement('img');
            imgBefore.src = coverBefore;
            imgBefore.alt = project.title + " (Before)";
            imgBefore.className = 'img-before';
            imgBefore.loading = 'lazy';
            card.appendChild(imgBefore);
        }

        // Title/Badge
        const badge = document.createElement('div');
        badge.className = 'project-badge';
        badge.innerText = project.title;
        card.appendChild(badge);

        container.appendChild(card);
    });
}
