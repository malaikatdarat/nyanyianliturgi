  document.addEventListener("DOMContentLoaded", () => {
    const tabHtml = `
        <div class="tab-wrap">
            <input type="radio" id="tab1" name="tabGroup1" class="tab" checked>
            <label for="tab1"><span class="tab-text">Partitur</span><span class="tab-emoji">🎼</span></label>
            <input type="radio" id="tab2" name="tabGroup1" class="tab">
            <label for="tab2"><span class="tab-text">Syair</span><span class="tab-emoji">📖</span></label>
            <input type="radio" id="tab3" name="tabGroup1" class="tab">
            <label for="tab3"><span class="tab-text">Audio/Video</span><span class="tab-emoji">🎧</span></label>
            <input type="radio" id="tab4" name="tabGroup1" class="tab">
            <label for="tab4"><span class="tab-text">Unduh</span><span class="tab-emoji">📥</span></label>
            <input type="radio" id="tab5" name="tabGroup1" class="tab">
            <label for="tab5"><span class="tab-text">Detail Lagu</span><span class="tab-emoji">ℹ️</span></label>
            
            <div class="tab__content"></div>
            <div class="tab__content"></div>
            <div class="tab__content"></div>
            <div class="tab__content"></div>
            <div class="tab__content"></div>
        </div>
    `;
	
    const container = document.getElementById('mantab');
    container.innerHTML = tabHtml;

    const template = document.getElementById('tab1-content');
    const tab1Content = template.content.cloneNode(true);
    const tabContents = container.querySelectorAll('.tab__content');
    tabContents[0].appendChild(tab1Content);

    const template2 = document.getElementById('tab2-content');
    const tab2Content = template2.content.cloneNode(true);
    tabContents[1].appendChild(tab2Content);
	
	const template3 = document.getElementById('tab3-content');
    const tab3Content = template3.content.cloneNode(true);
    tabContents[2].appendChild(tab3Content);
	
	const template4 = document.getElementById('tab4-content');
    const tab4Content = template4.content.cloneNode(true);
    tabContents[3].appendChild(tab4Content);
	
	const template5 = document.getElementById('tab5-content');
    const tab5Content = template5.content.cloneNode(true);
    tabContents[4].appendChild(tab5Content);
});

function showFullImage(clickedImageSrc) {
    const allImages = Array.from(document.querySelectorAll('figure.image img'));
    const imageList = allImages.map(img => img.src);
    let currentIndex = imageList.indexOf(clickedImageSrc);

    const overlay = document.createElement('div');
    overlay.classList.add('image-overlay');

    const imgContainer = document.createElement('div');
    imgContainer.classList.add('image-container');

    const loader = document.createElement('div');
    loader.classList.add('loader');
    
    let loaderTimeout;
    let isImageLoaded = false;

    const counter = document.createElement('div');
    counter.classList.add('image-counter');

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');

    const img = document.createElement('img');
    img.style.display = 'none';

    let tapStartX = 0;
    let tapStartY = 0;
    let tapStartTime = 0;
    const TAP_THRESHOLD = 10;
    const TAP_DURATION = 200;
    
    function isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    img.onload = function() {
        isImageLoaded = true;
        clearTimeout(loaderTimeout);
        loader.style.display = 'none';
        img.style.display = 'block';
    };

    img.src = clickedImageSrc;

    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&#10094;';
    prevButton.classList.add('nav-button', 'prev');
    
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&#10095;';
    nextButton.classList.add('nav-button', 'next');

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&#10005;';
    closeButton.classList.add('close-button');

    function updateCounter() {
        counter.textContent = `${currentIndex + 1}/${imageList.length}`;
    }

    function showImage(index) {
        if (index >= 0 && index < imageList.length) {
            currentIndex = index;
            isImageLoaded = false;
            img.style.display = 'none';
            
            clearTimeout(loaderTimeout);
            loaderTimeout = setTimeout(() => {
                if (!isImageLoaded) {
                    loader.style.display = 'block';
                }
            }, 100);
            
            img.src = imageList[currentIndex];
            
            updateCounter();
            
            const currentImg = allImages[currentIndex];
            tooltip.textContent = currentImg.alt;
            
            prevButton.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
            nextButton.style.visibility = currentIndex === imageList.length - 1 ? 'hidden' : 'visible';
        }
    }

    let isZoomed = false;
    let zoomScale = isMobile() ? 1.5 : 2.5;
    const MOBILE_PAN_MULTIPLIER = 1.5;

    let lastPinchDistance = null;

    let offsetX = 0;
    let offsetY = 0;

    let lastTapTime = 0;
    let isDoubleTap = false;
    const doubleTapThreshold = 300;

    function applyTransform() {
        const { clampedX, clampedY } = clampOffsets(offsetX, offsetY);
        offsetX = clampedX;
        offsetY = clampedY;

        img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomScale})`;
    }

    function getMaxOffsets() {
        const containerRect = imgContainer.getBoundingClientRect();
        const zoomedWidth = img.naturalWidth * zoomScale;
        const zoomedHeight = img.naturalHeight * zoomScale;

        if (isMobile()) {
            const maxOffsetX = Math.min(
                Math.max(0, (zoomedWidth - containerRect.width) / 2),
                img.naturalWidth * zoomScale / 2
            );
            const maxOffsetY = Math.min(
                Math.max(0, (zoomedHeight - containerRect.height) / 2),
                img.naturalHeight * zoomScale / 2
            );
            return { maxOffsetX, maxOffsetY };
        } else {
            const maxOffsetY = img.naturalHeight;
            return { 
                maxOffsetX: 0,
                maxOffsetY: maxOffsetY
            };
        }
    }

    function clampOffsets(x, y) {
        const { maxOffsetX, maxOffsetY } = getMaxOffsets();
        const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, x));
        const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, y));
        return { clampedX, clampedY };
    }

    function zoomIn() {
        isZoomed = true;
        overlay.classList.add('zoomed-mode');

        if (isMobile()) {
            img.style.transformOrigin = 'center center';
        } else {
            img.style.transformOrigin = '50% 0%';
        }

        offsetX = 0;
        offsetY = 0;
        applyTransform();
    }

    function zoomOut() {
        isZoomed = false;
        overlay.classList.remove('zoomed-mode');
        img.style.transform = 'none';
        zoomScale = isMobile() ? 1.5 : 2.5;
    }

    function handlePinchZoom(e) {
        if (!isMobile()) return;
        
        if (e.touches.length === 2) {
            e.preventDefault();
            
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (lastPinchDistance === null) {
                lastPinchDistance = currentDistance;
                return;
            }
            
            const scale = currentDistance / lastPinchDistance;
            zoomScale = Math.min(Math.max(zoomScale * scale, 1), 3);
            
            lastPinchDistance = currentDistance;
            applyTransform();
        }
    }

    function handleImageClickDesktop(e) {
        e.stopPropagation();
        if (!isZoomed) {
            zoomIn();
        } else {
            zoomOut();
        }
    }

    let startX = 0;
    let startY = 0;
    const swipeThreshold = 50;

    function handleImageTouchStart(e) {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        tapStartX = touch.clientX;
        tapStartY = touch.clientY;
        tapStartTime = new Date().getTime();

        startX = touch.clientX;
        startY = touch.clientY;

        const currentTapTime = new Date().getTime();
        const tapInterval = currentTapTime - lastTapTime;
        lastTapTime = currentTapTime;

        if (tapInterval < doubleTapThreshold) {
            isDoubleTap = true;
            if (isZoomed) {
                zoomOut();
            } else {
                zoomIn();
            }
        } else {
            isDoubleTap = false;
        }
    }
}

    let lastMouseX = null;
    let lastMouseY = null;

    function handleMouseMove(e) {
        if (!isZoomed) return;
        
        if (lastMouseX === null || lastMouseY === null) {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            return;
        }

        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        offsetY -= 3 * deltaY;
        offsetX = 0;

        applyTransform();
    }

    function resetLastMousePosition() {
        lastMouseX = null;
        lastMouseY = null;
    }

    let touchLastX = null;
    let touchLastY = null;

    function handleTouchMove(e) {
        if (isZoomed) {
            if (e.touches.length === 1) {
                e.preventDefault();

                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;

                if (touchLastX === null || touchLastY === null) {
                    touchLastX = currentX;
                    touchLastY = currentY;
                    return;
                }

                const deltaX = (currentX - touchLastX) * MOBILE_PAN_MULTIPLIER;
                const deltaY = (currentY - touchLastY) * MOBILE_PAN_MULTIPLIER;

                touchLastX = currentX;
                touchLastY = currentY;

                offsetX += deltaX;
                offsetY += deltaY;

                applyTransform();
            }
        }
    }

    function handleTouchEnd(e) {
    touchLastX = null;
    touchLastY = null;
    lastPinchDistance = null;

    if (!isZoomed) {
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const diffX = endX - tapStartX;
        const diffY = endY - tapStartY;
        const tapDuration = new Date().getTime() - tapStartTime;

        const isTap = Math.abs(diffX) < TAP_THRESHOLD && 
                     Math.abs(diffY) < TAP_THRESHOLD && 
                     tapDuration < TAP_DURATION;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                showImage(currentIndex - 1);
            } else {
                showImage(currentIndex + 1);
            }
        } else if (!isDoubleTap && isTap) {
            const containerRect = imgContainer.getBoundingClientRect();
            const tapX = endX - containerRect.left;
            const containerWidth = containerRect.width;

            if (tapX < 0.2 * containerWidth) {
                showImage(currentIndex - 1);
            } else if (tapX > 0.8 * containerWidth) {
                showImage(currentIndex + 1);
            }
        }
    }
}

    prevButton.addEventListener('click', (e) => {
        if (!isZoomed) {
            e.stopPropagation();
            showImage(currentIndex - 1);
        }
    });

    nextButton.addEventListener('click', (e) => {
        if (!isZoomed) {
            e.stopPropagation();
            showImage(currentIndex + 1);
        }
    });

    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        cleanup();
    });

    function cleanup() {
        clearTimeout(loaderTimeout);
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', resetLastMousePosition);
        imgContainer.removeEventListener('touchmove', handleTouchMove, { passive: false });
        imgContainer.removeEventListener('touchend', handleTouchEnd);
        document.body.removeChild(overlay);
    }

    function handleKeydown(e) {
        if (!isZoomed) {
            if (e.key === 'ArrowLeft') {
                showImage(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                showImage(currentIndex + 1);
            } else if (e.key === 'Escape') {
                cleanup();
            }
        } else {
            if (e.key === 'Escape') {
                cleanup();
            }
        }
    }

    document.addEventListener('keydown', handleKeydown);

    imgContainer.appendChild(loader);
    imgContainer.appendChild(img);
    overlay.appendChild(counter);
    overlay.appendChild(tooltip);
    overlay.appendChild(prevButton);
    overlay.appendChild(imgContainer);
    overlay.appendChild(nextButton);
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);

overlay.addEventListener('click', (e) => {
    if (!isMobile() && (e.target === overlay || e.target === imgContainer)) {
        cleanup();
    }
});

    if (isMobile()) {
        img.addEventListener('touchstart', handleImageTouchStart, { passive: true });
        imgContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        imgContainer.addEventListener('touchend', handleTouchEnd);
        
        imgContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                lastPinchDistance = null;
            }
        }, { passive: false });
        
        imgContainer.addEventListener('touchmove', handlePinchZoom, { passive: false });
    } else {

    	img.addEventListener('touchstart', handleImageTouchStart, { passive: true });
    	imgContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    	imgContainer.addEventListener('touchend', handleTouchEnd);
	    
        img.addEventListener('click', handleImageClickDesktop);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', resetLastMousePosition);
    }

    showImage(currentIndex);
}

/*
    function showFullImage(src) {
        const overlay = document.createElement('div');
        overlay.classList.add('image-overlay');
        
        const img = document.createElement('img');
        img.src = src;
        
        overlay.appendChild(img);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        overlay.style.display = 'flex';
    }
    */


// Tab1
document.addEventListener('DOMContentLoaded', function() {
    function generateSrcset(baseUrl, originalWidth) {
        const increment = Math.max(80, Math.floor(originalWidth * 0.1));
        let breakpoints = [];
        let currentWidth = increment;
        
        while (currentWidth <= originalWidth && breakpoints.length < 10) {
            breakpoints.push(currentWidth);
            currentWidth += increment;
        }
        
        return breakpoints
            .map(width => `${baseUrl}/${width}.webp ${width}w`)
            .join(',');
    }

    function processPreContent(content) {
        const entries = content.trim().split(/(?=original-image-link:)/);
        let processedHtml = '';
        
        entries.forEach(entry => {
            if (!entry.trim()) return;
            
            const data = {};
            const lines = entry.trim().split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (line.includes(':')) {
                    const colonIndex = line.indexOf(':');
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim();
                    data[key] = value.replace(/^"(.*)"$/, '$1') || null;
                }
            });

            const requiredFields = ['original-image-link', 'width', 'height', 'alt'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    console.error(`Missing required field: ${field}`);
                    return;
                }
            }

            const resourceId = data['original-image-link'].split('/assets/')[1].split('/')[0];
            const baseUrl = data['original-image-link'].substring(0, data['original-image-link'].lastIndexOf('/'));
            
            let titleHtml = '';
            if (data.title && data.title.trim()) {
                titleHtml = `<p><strong>${data.title}</strong></p>`;
            }

            const html = `
                ${titleHtml}
                <figure class="image" data-ckbox-resource-id="${resourceId}">
                    <picture>
                        <source 
                            sizes="(max-width: ${data.width}px) 100vw, ${data.width}px"
                            srcset="${generateSrcset(baseUrl, parseInt(data.width))}"
                            type="image/webp">
                        <img src="${data['original-image-link']}"
                             alt="${data.alt}"
                             width="${data.width}"
                             height="${data.height}"
                             onclick="showFullImage(this.src)">
                    </picture>
                </figure>`;
            
            processedHtml += html;
        });

        return processedHtml;
    }

        const pre = document.getElementById('imageData');
        if (pre) {
        const content = pre.textContent;
        const html = processPreContent(content);
        pre.outerHTML = html;
    }
});

/*
document.addEventListener('DOMContentLoaded', function() {
    function generateSrcset(baseUrl, originalWidth) {
        const increment = Math.max(80, Math.floor(originalWidth * 0.1));
        let breakpoints = [];
        let currentWidth = increment;
        while (currentWidth <= originalWidth && breakpoints.length < 10) {
            breakpoints.push(currentWidth);
            currentWidth += increment;
        }
        return breakpoints
            .map(width => `${baseUrl}/${width}.webp ${width}w`)
            .join(',');
    }

    function processPreContent(preContent) {
        const entries = preContent.trim().split(/(?=original-image-link:)/);
        let processedHtml = '';
        
        entries.forEach(entry => {
            const data = {};
            const lines = entry.trim().split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (line.includes(':')) {
                    const colonIndex = line.indexOf(':');
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim();
                    data[key] = value.replace(/^"(.*)"$/, '$1') || null;
                }
            });

            const requiredFields = ['original-image-link', 'width', 'height', 'alt'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    console.error(`Missing required field: ${field}`);
                    return;
                }
            }

            const resourceId = data['original-image-link'].split('/assets/')[1].split('/')[0];
            const baseUrl = data['original-image-link'].substring(0, data['original-image-link'].lastIndexOf('/'));
            
            const html = `
                <figure class="hidden-thumbnail" data-ckbox-resource-id="${resourceId}">
                    <picture>
                        <source 
                            sizes="(max-width: ${data.width}px) 100vw, ${data.width}px"
                            srcset="${generateSrcset(baseUrl, parseInt(data.width))}"
                            type="image/webp">
                        <img src="${data['original-image-link']}"
                             alt="${data.alt}"
                             width="${data.width}"
                             height="${data.height}">
                    </picture>
                </figure>`;
            
            processedHtml += html;
        });
        
        return processedHtml;
    }

        const pre = document.getElementById('imageThumb');
        if (pre) {
        const content = pre.textContent;
        const html = processPreContent(content);
        pre.outerHTML = html;
    }
});
*/

// Tab2
document.addEventListener('DOMContentLoaded', function() {
    const rawSyairElement = document.getElementById('rawDataSyair');
    const rawSyairText = rawSyairElement.textContent.trim();
    const lines = rawSyairText.split('\n');

    const syairContainer = document.getElementById('syair-container');

    const headings = {
        REFRAIN: false,
        REFREN: false,
        ULANGAN: false,
        AYAT: true,
        BAIT: true
    };

    let currentMode = null;
    let currentOl = null;
    let currentP = null;
    let listBuffer = [];

    function closeCurrentStructures() {
        if (currentP) {
            syairContainer.appendChild(currentP);
            currentP = null;
        }
        if (currentOl && listBuffer.length > 0) {
            const li = document.createElement('li');
            li.innerHTML = listBuffer.join(''); // Tidak lagi menggunakan <br>
            currentOl.appendChild(li);
            listBuffer = [];
        }
        if (currentOl) {
            syairContainer.appendChild(currentOl);
            currentOl = null;
        }
        currentMode = null;
    }

    function processLine(line) {
        line = line.trim();
        
        if (!line && currentMode === 'list' && listBuffer.length > 0) {
            const li = document.createElement('li');
            li.innerHTML = listBuffer.join('');
            currentOl.appendChild(li);
            listBuffer = [];
            return;
        } else if (!line) {
            closeCurrentStructures();
            return;
        }

        const lineUpper = line.toUpperCase();
        let isHeading = false;
        let headingKey = null;
        
        for (let key in headings) {
            if (lineUpper.startsWith(key + ':')) {
                isHeading = true;
                headingKey = key;
                break;
            }
        }

        if (isHeading) {
            closeCurrentStructures();
            
            const p = document.createElement('p');
            const strong = document.createElement('strong');
            strong.textContent = line;
            p.appendChild(strong);
            syairContainer.appendChild(p);

            if (headings[headingKey]) {
                currentOl = document.createElement('ol');
                currentMode = 'list';
                listBuffer = [];
            } else {
                currentMode = 'para';
                currentP = document.createElement('p');
            }
        } else {
            if (currentMode === 'list') {
                listBuffer.push(convertLine(line));
            } else if (currentMode === 'para') {
                currentP.innerHTML += convertLine(line);
            } else {
                if (!currentP) {
                    currentP = document.createElement('p');
                }
                currentP.innerHTML += convertLine(line);
            }
        }
    }

    function convertLine(line) {
        const slashIndex = line.indexOf('/');
        if (slashIndex !== -1) {
            const before = line.substring(0, slashIndex).trim();
            const after = line.substring(slashIndex + 1).trim();
            return `<div class="syair-line"><span class="baris1">${before}/</span> <span class="baris2">${after}</span></div>`;
        }
        return `<div class="syair-line"><span class="baris1">${line}</span></div>`;
    }

    lines.forEach(processLine);
    closeCurrentStructures();

    rawSyairElement.remove();
});


// Tab3
document.addEventListener('DOMContentLoaded', function() {
    const mediaSource = document.querySelector('.media-source');
    const mediaContainer = document.getElementById('media-container');
    const text = mediaSource.innerHTML;
    let html = '';

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    for(let i = 0; i < lines.length; i += 2) {
        const mediaLine = lines[i];
        const channelLine = lines[i + 1];

        if(mediaLine.startsWith('Video:')) {
            const videoMatch = mediaLine.match(/Video: (.*?) \[(.*?)\]/);
            const channelMatch = channelLine.match(/Kanal: (.*?) \[(.*?)\]/);

            if(videoMatch && channelMatch) {
                const [_, title, videoIdWithParams] = videoMatch;
                const [__, channelName, channelId] = channelMatch;
                const embedUrl = `https://youtube.com/embed/${videoIdWithParams}`;
                const videoUrl = `https://www.youtube.com/watch?v=${videoIdWithParams.split('?')[0]}`;
                const channelUrl = `https://www.youtube.com/${channelId}`;
                html += generateVideoHTML(title, videoUrl, embedUrl, channelName, channelUrl);
            }
        } else if(mediaLine.startsWith('Audio:')) {
            const audioMatch = mediaLine.match(/Audio: (.*?) \[(.*?)\]/);
            const channelMatch = channelLine.match(/Kanal: (.*?) \[(.*?)\]/);

            if(audioMatch && channelMatch) {
                const [_, title, trackId] = audioMatch;
                const [__, channelName, audioTrackPath] = channelMatch;
                const audioEmbedUrl = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`;
                const audioTrackUrl = `https://soundcloud.com/${audioTrackPath}`;
                const channelBase = audioTrackPath.split('/')[0];
                const channelUrl = `https://soundcloud.com/${channelBase}`;
                html += generateAudioHTML(title, audioTrackUrl, channelName, channelUrl, audioEmbedUrl);
            }
        }
    }

    mediaContainer.innerHTML = html;

    mediaSource.remove();
});

function generateVideoHTML(title, videoUrl, embedUrl, channelName, channelUrl) {
    return `
    <p class="judulvideo">
        <span class="baris1"><a target="_blank" rel="noopener noreferrer nofollow" href="${videoUrl}" title="Tonton di YouTube">🎬 ${title}</a></span>
	<span class="batas"> | </span>
        <span class="baris2"><a target="_blank" rel="noopener noreferrer nofollow" href="${channelUrl}" title="Buka kanal YouTube">📺 ${channelName}</a></span>
    </p>
    <div class="video-wrapper">
        <iframe class="videoiframe"
            src="${embedUrl}"
	    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" 
            playsinline
	    allowfullscreen>
        </iframe>
    </div>`;
}

function generateAudioHTML(title, audioTrackUrl, channelName, channelUrl, audioEmbedUrl) {
    return `
    <p class="judulaudio">
        <span class="baris1"><a target="_blank" rel="noopener noreferrer nofollow" href="${audioTrackUrl}" title="Dengarkan di SoundCloud">🎶 ${title}</a></span>
	<span class="batas"> | </span>
        <span class="baris2"><a target="_blank" rel="noopener noreferrer nofollow" href="${channelUrl}" title="Buka kanal SoundCloud">📻 ${channelName}</a></span>
    </p>
    <div class="audio-wrapper">
        <iframe class="audioiframe"
            src="${audioEmbedUrl}"
            allowfullscreen>
        </iframe>
    </div>`;
}

// Tab4
document.addEventListener('DOMContentLoaded', function () {
    function generateSrcset(baseUrl, originalWidth) {
        const increment = Math.max(80, Math.floor(originalWidth * 0.1));
        let breakpoints = [];
        let currentWidth = increment;
        
        while (currentWidth <= originalWidth && breakpoints.length < 10) {
            breakpoints.push(currentWidth);
            currentWidth += increment;
        }
        
        return breakpoints
            .map(width => `${baseUrl}/${width}.webp ${width}w`)
            .join(',');
    }

    function processPreContent(content) {
        const entries = content.trim().split(/(?=unduh-link:)/);
        let processedHtml = '';
        let title = '';
	let itemCount = 0;
	let currentRow = '';
        
        entries.forEach(entry => {
            if (!entry.trim()) return;
            
            const data = {};
            const lines = entry.trim().split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (line.includes(':')) {
                    const colonIndex = line.indexOf(':');
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim();
                    data[key] = value.replace(/^"(.*)"$/, '$1') || null;
                }
            });

            if (data['judul-lagu']) {
                title = data['judul-lagu'];
                return;
            }

            const requiredFields = ['unduh-link', 'preview-source', 'width', 'height', 'alt', 'label'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    console.error(`Missing required field: ${field}`);
                    return;
                }
            }

            const baseUrl = data['preview-source'].substring(0, data['preview-source'].lastIndexOf('/'));

            if (processedHtml === '') {
                processedHtml = `
                <div id="download-section">
                    <h2>Unduh Partitur</h2>
                    <p class="unduh-description">
		    <span class="baris1">Pilih format yang sesuai </span><span class="baris1">untuk mengunduh partitur lagu </span><span class="baris2"><strong>${title}</strong>.</span>
                    </p>
                    <div class="download-grid">`;
            }

	itemCount++;
        
        currentRow += `	
                <a href="${data['unduh-link']}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   title="${data.alt}" 
                   class="download-item">
                    <figure class="unduh-preview">
                        <picture>
                            <source sizes="(max-width: ${data.width}px) 100vw, ${data.width}px" 
                                    srcset="${generateSrcset(baseUrl, parseInt(data.width))}"
                                    type="image/webp">
                            <img src="${data['preview-source']}" 
                                 alt="${data.alt}" 
                                 width="${data.width}" 
                                 height="${data.height}">
                        </picture>
                    </figure>
                    <span class="download-label">${data.label}</span>
                </a>`;

		if (itemCount % 2 === 0) {
            processedHtml += `<div class="download-row">${currentRow}</div>`;
            currentRow = '';
        }
    });

	if (currentRow !== '') {
        processedHtml += `<div class="download-row">${currentRow}</div>`;
    	}

        if (processedHtml !== '') {
            processedHtml += `</div></div>`;
        }

        return processedHtml;
    }

        const pre = document.getElementById('download-tab');
        if (pre) {
        const content = pre.textContent;
        const html = processPreContent(content);
        pre.outerHTML = html;
    }
});

// Tab5
document.addEventListener('DOMContentLoaded', function() {
  const rawElement = document.getElementById('rawDataTabel');
  const rawText = rawElement.textContent.trim();
  const lines = rawText.split('\n');
  
  const table = document.createElement('table');
  table.className = 'infobox';

  let extractedTexts = [];

  function processLinks(str) {
    let result = str;

    result = result.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      const originalText = p1;
      let urlPart = p1;
      const slashIndex = urlPart.indexOf('/');
      if (slashIndex !== -1) {
        urlPart = urlPart.substring(0, slashIndex);
      }
      urlPart = encodeURIComponent(urlPart).replace(/%20/g, '%20');

      extractedTexts.push(slashIndex !== -1 ? p1.substring(0, slashIndex) : p1);

      return `<a href="/search/label/${urlPart}" target="_blank">${originalText}</a>`;
    });

    result = result.replace(/(.*?)\s*\[(https?:\/\/.*?)\]/, (match, textBefore, url) => {
      return `<a href="${url}" target="_blank">${textBefore.trim()}</a>`;
    });

    result = result.replace(/(.+?)\s*\{(.*?)\}/g, (match, textBefore, p1) => {
        return `<a href="/p/${p1}.html" target="_blank">${textBefore.trim()}</a>`;
    });
    return result;
  }

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    if (/^[A-Z0-9\s]+$/.test(line) && line.indexOf(':') === -1) {

      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.colSpan = 2;
      th.classList.add('category');
      th.textContent = line;
      tr.appendChild(th);
      table.appendChild(tr);
    } else {

      const parts = line.split(':');
      if (parts.length > 1) {
        const header = parts.shift().trim();
        let value = parts.join(':').trim();
        value = processLinks(value);

        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = header;

        const td = document.createElement('td');
        td.innerHTML = value;

        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
      }
    }
  });

  document.getElementById('table-container').appendChild(table);

  rawElement.remove();

  console.log('Label:', extractedTexts.join(','));
});

// Label
document.addEventListener('DOMContentLoaded', () => {
  const allowedLabels = ['Pembuka', 'Kyrie', 'Gloria', 'Mazmur Tanggapan', 'Persembahan', 'Credo', 'Sanctus', 'Pater Noster', 'Agnus Dei', 'Komuni', 'Syukur', 'Penutup'];

  const sortByAllowedLabels = (a, b) => {
    const labelA = a.getAttribute('allowed-labels');
    const labelB = b.getAttribute('allowed-labels');
    return allowedLabels.indexOf(labelA) - allowedLabels.indexOf(labelB);
  };

  const overflowContainer = document.querySelector('.overflowable-contents');
  if (overflowContainer) {
    const items = Array.from(overflowContainer.querySelectorAll('.overflowable-item'));
    
    items.forEach(item => {
      const link = item.querySelector('a[rel="tag"]');
      if (link) {
        const linkText = link.textContent.trim();
        if (allowedLabels.includes(linkText)) {
          item.setAttribute('allowed-labels', linkText);
        }
      }
    });

    const sortedItems = items
      .filter(item => item.hasAttribute('allowed-labels'))
      .sort(sortByAllowedLabels);
    
    sortedItems.forEach(item => {
      overflowContainer.appendChild(item);
    });
  }

  const labelContainer = document.querySelector('.byline.post-labels');
  if (labelContainer) {
    const links = Array.from(labelContainer.querySelectorAll('a[rel="tag"]'));
    
    links.forEach(link => {
      const linkText = link.textContent.trim();
      if (allowedLabels.includes(linkText)) {
        link.setAttribute('allowed-labels', linkText);
      }
    });

    const sortedLinks = links
      .filter(link => link.hasAttribute('allowed-labels'))
      .sort(sortByAllowedLabels);
    
    links.forEach(link => link.remove());
    
    sortedLinks.forEach((link, index) => {
      labelContainer.appendChild(link);
    });
  }
});

// Menu
function toggle(el) {
 event.preventDefault();
 const submenu = el.closest('.nav-item').querySelector('.submenu');
 submenu.classList.toggle('active');
 el.closest('.menu-title').querySelector('.arrow').style.transform = 
   submenu.classList.contains('active') ? 'rotate(-135deg)' : 'rotate(45deg)';
}

	/*
  // Fungsi menuliskan hakcipta
        document.addEventListener(&quot;DOMContentLoaded&quot;, () =&gt; {
            const endnoteDiv = document.getElementById(&quot;hakcipta&quot;);
            endnoteDiv.textContent = &quot;Hak Cipta.&quot;;
            endnoteDiv.classList.add(&quot;endnote&quot;);
        });
*/
  
/*
  // Fungsi menuliskan endnote
        document.addEventListener(&quot;DOMContentLoaded&quot;, () =&gt; {
            const endnoteDiv = document.getElementById(&quot;endnote&quot;);
            endnoteDiv.textContent = &quot;Ini adalah contoh.&quot;;
            endnoteDiv.classList.add(&quot;endnote&quot;);
        });
*/
