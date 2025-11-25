export function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

function waitForAllImages() {
    const images = document.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;
    if (totalImages === 0) {
        hidePreloader();
        return;
    }

    images.forEach(img => {
        if (img.complete) {
            loadedCount++;
        } else {
            img.addEventListener('load', imageLoaded);
            img.addEventListener('error', imageLoaded); 
        }
    });

    checkAllImagesLoaded();

    function imageLoaded() {
        loadedCount++;
        checkAllImagesLoaded();
    }

    function checkAllImagesLoaded() {
        if (loadedCount >= totalImages) {
            hidePreloader();
        }
    }
}

window.addEventListener('load', waitForAllImages);