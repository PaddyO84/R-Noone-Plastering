document.addEventListener('DOMContentLoaded', () => {
    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const closeBtn = document.getElementsByClassName('close')[0];

    // Get all gallery items and convert to array for index access
    const galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
    let currentIndex = 0;

    // Open lightbox function
    function openLightbox(index) {
        currentIndex = index;
        const img = galleryImages[currentIndex];
        lightbox.style.display = 'block';
        lightboxImg.src = img.src;
        captionText.innerHTML = img.alt;
        document.body.style.overflow = 'hidden'; // Disable scroll
    }

    // Attach click events to images
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            openLightbox(index);
        });
    });

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

    // Hero Carousel Logic
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
});
