export function initProjectSlider() {
    const triggers = document.querySelectorAll('[data-slider-trigger]');
    const modal = document.querySelector('.slider_open_card');

    if (!modal || triggers.length === 0) {
        console.warn('Слайдер: не найдены необходимые элементы');
        return;
    }

    const backdrop = modal.querySelector('.slider_backdrop');
    const container = modal.querySelector('.slider_container');
    const track = modal.querySelector('.slider_track');
    const dotsContainer = modal.querySelector('.slider_dots');
    const prevBtn = modal.querySelector('.slider_arrow--prev');
    const nextBtn = modal.querySelector('.slider_arrow--next');
    const closeBtn = modal.querySelector('.slider_close');
    if (!backdrop || !container || !track || !dotsContainer || !prevBtn || !nextBtn || !closeBtn) {
        console.warn('Слайдер: не все элементы найдены внутри модального окна');
        return;
    }

    let currentIndex = 0;
    let images = [];
    let dots = [];
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;


    triggers.forEach(trigger => {
        trigger.addEventListener('click', e => {
            e.preventDefault();
            const imgContainer = trigger.querySelector('.slider_img');
            if (!imgContainer) return;
            
            images = Array.from(imgContainer.querySelectorAll('img')).map(img => img.src);
            
            if (images.length === 0) return;

            openSlider();
        });
    });

    function openSlider() {
        renderSlides();
        renderDots();
        goToSlide(0);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSlider() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            track.innerHTML = '';
            dotsContainer.innerHTML = '';
            currentIndex = 0;
        }, 300);
    }

    function renderSlides() {
        track.innerHTML = '';
        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Проект';
            img.loading = 'lazy';
            track.appendChild(img);
        });
    }

    function renderDots() {
        dotsContainer.innerHTML = '';
        dots = [];
        images.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('slider_dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
            dots.push(dot);
        });
    }

    function goToSlide(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;

        currentIndex = index;
        currentTranslate = -index * 100;
        prevTranslate = currentTranslate;
        setPosition();

        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    function setPosition() {
        track.style.transform = `translateX(${currentTranslate}%)`;
    }

    const startDrag = e => {
        isDragging = true;
        startPos = getPositionX(e);
        track.style.transition = 'none';
    };

    const drag = e => {
        if (!isDragging) return;
        if (e.type.includes('touch')) e.preventDefault();
        const currentPosition = getPositionX(e);
        const diff = currentPosition - startPos;
        currentTranslate = prevTranslate + (diff / container.offsetWidth) * 100;
        setPosition();
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';

        const movedBy = currentTranslate - prevTranslate;
        if (movedBy < -30) goToSlide(currentIndex + 1);
        else if (movedBy > 30) goToSlide(currentIndex - 1);
        else goToSlide(currentIndex);
    };

    const getPositionX = e => e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;

    container.addEventListener('mousedown', startDrag);
    container.addEventListener('touchstart', startDrag, { passive: true });
    container.addEventListener('mousemove', drag);
    container.addEventListener('touchmove', drag, { passive: false });
    container.addEventListener('mouseup', endDrag);
    container.addEventListener('mouseleave', endDrag);
    container.addEventListener('touchend', endDrag);

    container.addEventListener('wheel', e => {
        if (!modal.classList.contains('active')) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;

        e.preventDefault();
        clearTimeout(container.wheelTimeout);
        container.wheelTimeout = setTimeout(() => {
            if (e.deltaX > 30) goToSlide(currentIndex + 1);
            else if (e.deltaX < -30) goToSlide(currentIndex - 1);
        }, 20);
    }, { passive: false });

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    closeBtn.addEventListener('click', closeSlider);
    backdrop.addEventListener('click', closeSlider);

    document.addEventListener('keydown', e => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeSlider();
        if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
        if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });
}