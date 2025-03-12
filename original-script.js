document.addEventListener("DOMContentLoaded", () => {
    const tabHtml = `
        <div class="tab-wrap">
            <input type="radio" id="tab1" name="tabGroup1" class="tab">
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

    // Map hash names to tab numbers
    const hashToTab = {
        'partitur': 1,
        'syair': 2,
        'media': 3,
        'unduh': 4,
        'info': 5
    };

    // Map tab numbers to hash names (reverse mapping)
    const tabToHash = {
        1: 'partitur',
        2: 'syair',
        3: 'media',
        4: 'unduh',
        5: 'info'
    };

    // Clone and append content for each tab
    for(let i = 1; i <= 5; i++) {
        const template = document.getElementById(`tab${i}-content`);
        const tabContent = template.content.cloneNode(true);
        const tabContents = container.querySelectorAll('.tab__content');
        tabContents[i-1].appendChild(tabContent);
    }

    // Function to open specific tab
    function openTab(tabNumber) {
        const tab = document.getElementById(`tab${tabNumber}`);
        if (tab) {
            tab.checked = true;
        }
    }

    // Check URL hash on load
    function checkHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash && hashToTab[hash]) {
            openTab(hashToTab[hash]);
        } else {
            // If no hash or invalid hash, default to tab1 (partitur)
            openTab(1);
        }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', checkHash);

    // Initial check
    checkHash();

    // Update hash when tabs are clicked
    const tabs = container.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        tab.addEventListener('change', () => {
            if (tab.checked) {
                const tabNumber = index + 1;
                window.location.hash = tabToHash[tabNumber];
            }
        });
    });
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
    if (index >= imageList.length) {
        index = 0; // Kembali ke gambar pertama jika melebihi jumlah gambar
    } else if (index < 0) {
        index = imageList.length - 1; // Kembali ke gambar terakhir jika kurang dari 0
    }

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
    
    // Tambahkan class 'last-image' jika sudah di gambar terakhir
    if (currentIndex === imageList.length - 1) {
        nextButton.classList.add('last-image');
    } else {
        nextButton.classList.remove('last-image');
    }

    // Tambahkan class 'first-image' jika sudah di gambar pertama
    if (currentIndex === 0) {
        prevButton.classList.add('first-image');
    } else {
        prevButton.classList.remove('first-image');
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
    function processPreContent(content) {
        const entries = content.trim().split(/(?=original-image-link:)/);
        const groups = [];
        let currentGroup = null;

        // Proses semua entri menjadi array data
        const dataEntries = [];
        entries.forEach(entry => {
            if (!entry.trim()) return;
            
            const data = {};
            const lines = entry.trim().split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (line.includes(':')) {
                    const [key, ...values] = line.split(':');
                    data[key.trim()] = values.join(':').trim().replace(/^"(.*)"$/, '$1');
                }
            });

            // Validasi field wajib
            const requiredFields = ['original-image-link', 'original-size', 'sizes', 'srcset', 'alt'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    console.error(`Missing required field: ${field}`);
                    return;
                }
            }
            dataEntries.push(data);
        });

        // Kelompokkan data berdasarkan title
        dataEntries.forEach((data) => {
            if (data.title) {
                currentGroup = {
                    title: data.title,
                    entries: [data]
                };
                groups.push(currentGroup);
            } else {
                if (currentGroup) {
                    currentGroup.entries.push(data);
                } else {
                    // Jika ada gambar tanpa title di awal, buat group khusus
                    currentGroup = {
                        title: 'Gambar',
                        entries: [data]
                    };
                    groups.push(currentGroup);
                }
            }
        });

        // Bangun HTML
        let processedHtml = '<div class="image-groups-wrapper">';
        
        // Container untuk tombol di atas
        processedHtml += '<div class="group-buttons-container">';
        groups.forEach((group, groupIndex) => {
            processedHtml += `
                <button class="group-button ${groupIndex === 0 ? 'active' : ''}" 
                        data-group-index="${groupIndex}">
                    ${group.title}
                </button>`;
        });
        processedHtml += '</div>'; // Tutup container tombol
        
        // Container untuk konten grup
        processedHtml += '<div class="group-contents-container">';
        groups.forEach((group, groupIndex) => {
            let imagesHtml = '';
            group.entries.forEach(data => {
                const [width, height] = data['original-size'].split('x');
                const originalExt = data['original-image-link'].match(/\.([^/.]+)$/)[1];
                
                const webpBase = data['original-image-link']
                    .replace('/images/', '/images/webp/')
                    .replace(/\.[^/.]+$/, "");
                    
                const fallbackBase = data['original-image-link']
                    .replace('/images/', '/images/fallback/')
                    .replace(/\.[^/.]+$/, "");

                const webpSrcset = data.srcset.split(',')
                    .map(w => w.trim().replace('w', ''))
                    .map(w => `${webpBase}-${w}.webp ${w}w`)
                    .join(', ');

                const fallbackSrcset = data['fallback-srcset'].split(',')
                    .map(w => w.trim().replace('w', ''))
                    .map(w => `${fallbackBase}-${w}.${originalExt} ${w}w`)
                    .join(', ');

                let mimeType = 'image/jpeg';
                if (originalExt.toLowerCase() === 'png') mimeType = 'image/png';
                if (originalExt.toLowerCase() === 'gif') mimeType = 'image/gif';

                imagesHtml += `
                    <figure class="image">
                        <picture>
                            <source 
                                sizes="${data.sizes.replace('sizes=', '')}"
                                srcset="${webpSrcset}"
                                type="image/webp">
                            <source 
                                sizes="${data.sizes.replace('sizes=', '')}"
                                srcset="${fallbackSrcset}"
                                type="${mimeType}">
                            <img src="${data['original-image-link']}"
                                alt="${data.alt}"
                                width="${width}"
                                height="${height}"
                                onclick="showFullImage(this.src)">
                        </picture>
                    </figure>`;
            });

            processedHtml += `
                <div class="image-group ${groupIndex === 0 ? 'active' : ''}" 
                     data-group-index="${groupIndex}">
                    ${imagesHtml}
                </div>`;
        });
        processedHtml += '</div></div>'; // Tutup container konten dan wrapper

        return processedHtml;
    }

    const pre = document.getElementById('imageData');
    if (pre) {
        pre.outerHTML = processPreContent(pre.textContent);
    }

    // Handle klik tombol grup
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('group-button')) {
            const allGroups = document.querySelectorAll('.image-group');
            const allButtons = document.querySelectorAll('.group-button');
            const targetGroupIndex = e.target.dataset.groupIndex;
            
            // Update tampilan grup
            allGroups.forEach(group => {
                group.style.display = group.dataset.groupIndex === targetGroupIndex ? 'block' : 'none';
            });

            // Update status tombol
            allButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.groupIndex === targetGroupIndex);
            });
        }
    });
});

// Fungsi showFullImage tetap sama

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
	INTRO: false,
	CODA: false,
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
            // Audio handling remains the same
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
    
    // Initialize lazy loading after content is added
    initializeLazyLoading();
});

function generateVideoHTML(title, videoUrl, embedUrl, channelName, channelUrl) {
    // Use a placeholder div instead of iframe initially
    return `
    <p class="judulvideo">
        <span class="baris1"><a target="_blank" rel="noopener noreferrer nofollow" href="${videoUrl}" title="Tonton di YouTube">🎬 ${title}</a></span>
        <span class="batas"> | </span>
        <span class="baris2"><a target="_blank" rel="noopener noreferrer nofollow" href="${channelUrl}" title="Buka kanal YouTube">📺 ${channelName}</a></span>
    </p>
    <div class="video-wrapper">
        <div class="video-placeholder" 
             data-embed-url="${embedUrl}"
             style="background: #000; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="text-align: center; color: white;">
                <div style="font-size: 48px;">▶️</div>
                <div>Klik untuk memuat video</div>
            </div>
        </div>
    </div>`;
}

function generateAudioHTML(title, audioTrackUrl, channelName, channelUrl, audioEmbedUrl) {
    // Audio HTML remains the same
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

function initializeLazyLoading() {
    // Initialize Intersection Observer
    const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const placeholder = entry.target;
                loadVideo(placeholder);
                observer.unobserve(placeholder);
            }
        });
    }, options);

    // Observe all video placeholders
    document.querySelectorAll('.video-placeholder').forEach(placeholder => {
        observer.observe(placeholder);
        // Add click handler for manual loading
        placeholder.addEventListener('click', () => loadVideo(placeholder));
    });
}

function loadVideo(placeholder) {
    const embedUrl = placeholder.dataset.embedUrl;
    const iframe = document.createElement('iframe');
    iframe.className = 'videoiframe';
    iframe.src = embedUrl;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.playsinline = true;
    iframe.allowFullscreen = true;

    // Replace placeholder with iframe
    placeholder.parentNode.replaceChild(iframe, placeholder);
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

    function createImagePage(links) {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview Images</title>
                <style>
                    body { margin: 20px; background: #f5f5f5; }
                    img { max-width: 100%; height: auto; margin: 10px 0; display: block; }
                </style>
            </head>
            <body>
        `);

        links.forEach(link => {
            newWindow.document.write(`<img src="${link}" alt="Preview Image">`);
        });

        newWindow.document.write('</body></html>');
        newWindow.document.close();
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

            const processedData = {
                'unduh-link': data['unduh-link'] || '#',
                'preview-source': data['preview-source'] || 'https://placehold.co/200x300',
                'width': data['width'] || '2481',
                'height': data['height'] || '3508',
                'alt': data['alt'] || 'No description available',
                'label': data['label'] || 'Download',
                'sub': data['sub'] || ''
            };

            if (data['judul-lagu']) {
                title = data['judul-lagu'];
                return;
            }

            const baseUrl = processedData['preview-source'].substring(0, processedData['preview-source'].lastIndexOf('/'));

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
            
            const links = processedData['unduh-link'].split(';').map(link => link.trim());
            const isMultipleLinks = links.length > 1;
            
            // Generate different HTML based on number of links
            currentRow += isMultipleLinks ? 
                `<a href="javascript:void(0)" 
                    data-links="${links.join(';')}"
                    title="${processedData.alt}" 
                    class="download-item multiple-links">` :
                `<a href="${processedData['unduh-link']}" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title="${processedData.alt}" 
                    class="download-item">`;
                
            currentRow += `
                    <figure class="unduh-preview">
                        <picture>
                            <source sizes="(max-width: ${data.width}px) 100vw, ${data.width}px" 
                                    srcset="${generateSrcset(baseUrl, parseInt(data.width))}"
                                    type="image/webp">
                            <img src="${processedData['preview-source']}" 
                                 alt="${processedData.alt}" 
                                 width="${processedData.width}" 
                                 height="${processedData.height}">
                        </picture>
                    </figure>
                    <div class="download-text">
                        <span class="download-label">${processedData.label}</span>
                        <span class="download-sub">${processedData.sub}</span>
                    </div>
                </a>`;

            if (itemCount % 2 === 0) {
                processedHtml += `<div class="download-row">${currentRow}</div>`;
                currentRow = '';
            }
        });

        if (currentRow !== '') {
            processedHtml += `<div class="download-row last-row">${currentRow}</div>`;
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

        // Add click event listeners only to download items with multiple links
        document.querySelectorAll('.download-item.multiple-links').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const links = this.getAttribute('data-links').split(';');
                createImagePage(links);
            });
        });
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

// Tambahkan fungsi ini
function initMenu(containerId, menuListId) {
  // Cari elemen menu
  const rawMenuList = document.getElementById(menuListId);
  const menuContainer = document.getElementById(containerId);
  
  if (!rawMenuList || !menuContainer) {
    console.error('Menu elements not found');
    return;
  }

  const menuText = rawMenuList.textContent;
  const menuStructure = parseMenu(menuText);
  
  const menuHTML = generateHTML(menuStructure);
  menuContainer.innerHTML = menuHTML;

  rawMenuList.remove();

  const submenus = menuContainer.querySelectorAll('.submenu');
  submenus.forEach(submenu => {
    submenu.style.maxHeight = '0';
    submenu.style.opacity = '0';
  });

  const menuTitles = menuContainer.querySelectorAll('.menu-title');
  menuTitles.forEach(title => {
    title.addEventListener('click', (event) => toggle(title, event));
  });
}

// Buat fungsi untuk cek dan init menu
function tryInitMenu() {
  if (typeof Blogger !== 'undefined') {
    // Tunggu widget selesai dimuat
    const checkWidget = setInterval(() => {
      const rawMenuList = document.getElementById('rawMenuList');
      const menuContainer = document.getElementById('menu-container');
      
      if (rawMenuList && menuContainer) {
        clearInterval(checkWidget);
        initMenu('menu-container', 'rawMenuList');
      }
    }, 100);
    
    // Hentikan pengecekan setelah 10 detik
    setTimeout(() => clearInterval(checkWidget), 10000);
  } else {
    // Untuk penggunaan non-Blogger
    document.addEventListener('DOMContentLoaded', () => {
      initMenu('menu-container', 'rawMenuList');
    });
  }
}

// Panggil fungsi
tryInitMenu();

function parseMenu(text) {
  const lines = text.trim().split('\n');
  const menu = [];
  let currentPath = [menu];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const match = trimmedLine.match(/^(-+)\s*([^(]+)(?:\(([^)]+)\))?$/);

    if (!match) return;

    const level = match[1].length - 1;
    const title = match[2].trim();
    const link = match[3] ? match[3].trim() : '#';
    const item = { title, link, children: [] };

    // Memastikan currentPath memiliki panjang yang tepat
    while (currentPath.length > level + 1) {
      currentPath.pop();
    }

    // Menambahkan item ke level yang sesuai
    currentPath[level].push(item);
    currentPath[level + 1] = item.children;
  });

  return menu;
}

    function generateHTML(menu) {
      let html = '<ul class="nav">';

      menu.forEach(item => {
        const hasChildren = item.children && item.children.length > 0;
        html += `
          <li class="nav-item">
            <div class="menu-title">
              <a href="${item.link}">${item.title}</a>
              ${hasChildren ? '<span class="arrow"></span>' : ''}
            </div>
            ${hasChildren ? generateSubmenu(item.children) : ''}
          </li>
        `;
      });

      html += '</ul>';
      return html;
    }

    function generateSubmenu(items) {
      let html = '<ul class="submenu">';

      items.forEach(item => {
        const hasChildren = item.children && item.children.length > 0;
        html += `
          <li class="nav-item">
            <div class="menu-title">
              <a href="${item.link}">${item.title}</a>
              ${hasChildren ? '<span class="arrow"></span>' : ''}
            </div>
            ${hasChildren ? generateSubmenu(item.children) : ''}
          </li>
        `;
      });

      html += '</ul>';
      return html;
    }

    function toggle(el, event) {
      event.preventDefault();
      event.stopPropagation();

      const menuTitle = el.closest('.menu-title');
      const navItem = menuTitle.closest('.nav-item');
      const submenu = navItem.querySelector(':scope > .submenu');

      if (!submenu) {
        const link = menuTitle.querySelector('a').getAttribute('href');
        if (link && link !== '#') {
          window.location.href = link;
        }
        return;
      }

      const isExpanded = navItem.classList.contains('expanded');

      if (isExpanded) {
        collapseWithChildren(navItem);
      } else {
        expandSubmenu(navItem);
      }
    }

function expandSubmenu(navItem) {
  const submenu = navItem.querySelector(':scope > .submenu');
  if (!submenu) return;

  // Tutup semua sibling menu di level yang sama
  const parent = navItem.parentElement;
  const siblings = parent.children;
  Array.from(siblings).forEach(sibling => {
    if (sibling !== navItem && sibling.classList.contains('nav-item')) {
      collapseWithChildren(sibling);
    }
  });

  // Tambahkan class expanded dan open
  navItem.classList.add('expanded');
  submenu.classList.add('open');

  // Buka semua parent submenu
  let parentEl = navItem.parentElement;
  while (parentEl) {
    if (parentEl.classList.contains('submenu')) {
      parentEl.style.maxHeight = 'none';
      parentEl.classList.add('open');
      parentEl.parentElement.classList.add('expanded');
    }
    parentEl = parentEl.parentElement;
  }

  // Set max height untuk scrolling
  const windowHeight = window.innerHeight;
  const submenuTop = submenu.getBoundingClientRect().top;
  const maxAvailableHeight = windowHeight - submenuTop - 20; // 20px margin bottom
  
  // Hitung total height termasuk nested submenu
  const totalHeight = getSubmenuFullHeight(submenu);
  // Gunakan nilai yang lebih kecil antara maxAvailableHeight dan totalHeight
  const finalHeight = Math.min(maxAvailableHeight, totalHeight);
  
  submenu.style.maxHeight = `${finalHeight}px`;
  submenu.style.opacity = '1';

  // Update parent submenu heights
  parentEl = navItem.parentElement;
  while (parentEl) {
    if (parentEl.classList.contains('submenu')) {
      const parentTotalHeight = getSubmenuFullHeight(parentEl);
      const parentTop = parentEl.getBoundingClientRect().top;
      const parentMaxHeight = Math.min(windowHeight - parentTop - 20, parentTotalHeight);
      parentEl.style.maxHeight = `${parentMaxHeight}px`;
    }
    parentEl = parentEl.parentElement;
  }
}
function collapseWithChildren(navItem) {
  // Simpan referensi ke semua submenu dalam navItem
  const allSubmenus = navItem.querySelectorAll('.submenu');
  const parentSubmenus = [];
  
  // Cari parent submenu yang perlu diupdate heightnya
  let parent = navItem.parentElement;
  while (parent) {
    if (parent.classList.contains('submenu')) {
      parentSubmenus.push(parent);
    }
    parent = parent.parentElement;
  }

  // Tutup semua submenu dalam navItem
  allSubmenus.forEach(sub => {
    sub.style.maxHeight = '0';
    sub.style.opacity = '0';
    sub.closest('.nav-item').classList.remove('expanded');
  });

  // Hapus class open setelah transisi selesai
  allSubmenus.forEach(sub => {
    sub.addEventListener('transitionend', function handler(e) {
      // Hanya proses event untuk maxHeight
      if (e.propertyName !== 'max-height') return;
      
      sub.classList.remove('open');
      sub.removeEventListener('transitionend', handler);
    }, { once: true }); // Gunakan once: true agar event handler terhapus otomatis
  });

  // Update height parent submenu
  parentSubmenus.forEach(sub => {
    const newHeight = getSubmenuFullHeight(sub);
    sub.style.maxHeight = `${newHeight}px`;
  });

  // Hapus expanded class dari navItem yang diklik
  navItem.classList.remove('expanded');
}

function getSubmenuFullHeight(submenu) {
  const clone = submenu.cloneNode(true);
  clone.style.maxHeight = 'none';
  clone.style.opacity = '1';
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.display = 'block'; // Pastikan terlihat
  
  // Pastikan semua submenu di dalamnya juga visible
  const nestedSubmenus = clone.querySelectorAll('.submenu');
  nestedSubmenus.forEach(sub => {
    sub.style.maxHeight = 'none';
    sub.style.opacity = '1';
    sub.style.display = 'block';
  });
  
  document.body.appendChild(clone);
  const height = clone.scrollHeight;
  document.body.removeChild(clone);
  
  return height;
}

    document.addEventListener('DOMContentLoaded', () => {
      const menuText = document.getElementById('rawMenuList').textContent;
      const menuStructure = parseMenu(menuText);
      console.log('Parsed Menu Structure:', JSON.stringify(menuStructure, null, 2));

      const menuHTML = generateHTML(menuStructure);
      console.log('Generated HTML:', menuHTML);

      const menuContainer = document.getElementById('menu-container');
      menuContainer.innerHTML = menuHTML;

      document.getElementById('rawMenuList').remove();

      const submenus = menuContainer.querySelectorAll('.submenu');
      submenus.forEach(submenu => {
        submenu.style.maxHeight = '0';
        submenu.style.opacity = '0';
      });

      const menuTitles = menuContainer.querySelectorAll('.menu-title');
      menuTitles.forEach(title => {
        title.addEventListener('click', (event) => toggle(title, event));
      });
    });


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

/* Songbook Index */
document.addEventListener('DOMContentLoaded', function() {
    // Get the pre element content
    const preContent = document.getElementById('hymn-data').textContent;
    
    // Initialize variables
    let currentSection = '';
    let bookCode = ''; // Variable to store the book code
    const tableData = [];
    
    // Process each line
    preContent.split('\n').forEach(line => {
        line = line.trim();
        
        // Skip empty lines
        if (!line) return;
        
        // Check if line is Kode Buku
        if (line.startsWith('Kode Buku:')) {
            bookCode = line.replace('Kode Buku:', '').trim();
            return;
        }
        
        // Check if line is a section header
        if (line.startsWith('Bagian:')) {
            currentSection = line.replace('Bagian:', '').trim();
        }
        // Process hymn entries
        else if (line.match(/^\d+:/)) {
            const [numberPart, ...titleParts] = line.split(':');
            const fullTitle = titleParts.join(':').trim(); // Handle if there's : in title
            
            // Extract link if exists
            const linkMatch = fullTitle.match(/\[(.*?)\]$/);
            let title = fullTitle;
            let link = '';
            
            if (linkMatch) {
                link = linkMatch[1];
                title = fullTitle.substring(0, fullTitle.indexOf('[')).trim();
            }
            
            // Extract subtitle (text in parentheses)
            let subtitle = '';
            const parenthesesMatch = title.match(/\((.*?)\)$/);
            if (parenthesesMatch) {
                subtitle = parenthesesMatch[1];
                title = title.substring(0, title.indexOf('(')).trim();
            }
            
            tableData.push({
                section: currentSection,
                number: `${bookCode} ${numberPart.trim()}`,
                title: title,
                subtitle: subtitle,
                link: link
            });
        }
    });
    
    // Create table
    const table = document.createElement('table');
    table.className = 'hymn-table';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Nomor</th>
            <th>Judul</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    let currentSectionRow = null;
    
    tableData.forEach((item, index) => {
        // Add section row if new section or first item
        if (index === 0 || item.section !== tableData[index - 1].section) {
            currentSectionRow = document.createElement('tr');
            currentSectionRow.className = 'section-row';
            currentSectionRow.innerHTML = `
                <td colspan="2" class="section-cell">${item.section}</td>
            `;
            tbody.appendChild(currentSectionRow);
        }
        
        // Add hymn row
        const row = document.createElement('tr');
        const titleCell = document.createElement('td');
        titleCell.className = 'title-cell';
        
        // Build title content
        let titleContent = '';
        if (item.link) {
            titleContent = `<a href="${item.link}" target="_blank">${item.title}</a>`;
        } else {
            titleContent = item.title;
        }
        
        if (item.subtitle) {
            titleContent += ` <span class="subtitle">(${item.subtitle})</span>`;
        }
        
        titleCell.innerHTML = titleContent;
        
        row.innerHTML = `<td class="number-cell">${item.number}</td>`;
        row.appendChild(titleCell);
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
        .hymn-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .hymn-table th, .hymn-table td {
            padding: 8px;
            border: 1px solid #ddd;
        }
        .section-cell {
            text-align: center;
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .number-cell {
            white-space: nowrap;
        }
        .title-cell {
            width: 100%;
        }
        .subtitle {
            color: #666;
            font-style: italic;
        }
        .hymn-table a {
            color: #0066cc;
            text-decoration: none;
        }
        .hymn-table a:hover {
            text-decoration: underline;
        }
    `;
    
    // Replace pre with table
    const preElement = document.getElementById('hymn-data');
    preElement.parentNode.insertBefore(styles, preElement);
    preElement.parentNode.replaceChild(table, preElement);
});

/* Sembunyikan semua pesan error dari console */

(function() {
  // Simpan fungsi asli console.error
  const originalConsoleError = console.error;

  // Override console.error
  console.error = function(...args) {
    // Kosong: tidak melakukan apa pun
    // originalConsoleError.apply(console, args); // Uncomment baris ini jika ingin mencatat error ke log lain.
  };

  // Opsional: Jika ingin memulihkan fungsi console.error seperti semula
  // cukup panggil:
  // console.error = originalConsoleError;
})();

window.onerror = function(message, source, lineno, colno, error) {
  // Kosong: tidak melakukan apa pun
  // atau log ke server, misalnya:
  // sendToServer({ message, source, lineno, colno, error });
  
  // Return true agar browser tidak lagi menampilkan pesan error di console
  return true;
};
