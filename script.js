  document.addEventListener("DOMContentLoaded", () => {
    const tabHtml = `
        <div class="tab-wrap">
            <input type="radio" id="tab1" name="tabGroup1" class="tab" checked>
            <label for="tab1">Partitur 🎼</label>
            <input type="radio" id="tab2" name="tabGroup1" class="tab">
            <label for="tab2">Syair 📖</label>
            <input type="radio" id="tab3" name="tabGroup1" class="tab">
            <label for="tab3">Audio/Video 🎧</label>
            <input type="radio" id="tab4" name="tabGroup1" class="tab">
            <label for="tab4">Unduh 📥</label>
            <input type="radio" id="tab5" name="tabGroup1" class="tab">
            <label for="tab5">Detail Lagu ℹ️</label>
			
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

document.addEventListener('DOMContentLoaded', function() {
  const rawElement = document.getElementById('rawDataTabel');
  const rawText = rawElement.textContent.trim();
  const lines = rawText.split('\n');
  
  const table = document.createElement('table');
  table.className = 'infobox';

  let extractedTexts = []; // Array untuk menyimpan teks dari [[...]]

  function processLinks(str) {
    let result = str;

    // Proses [[...]]
    result = result.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      const originalText = p1;
      let urlPart = p1;
      const slashIndex = urlPart.indexOf('/');
      if (slashIndex !== -1) {
        urlPart = urlPart.substring(0, slashIndex);
      }
      urlPart = encodeURIComponent(urlPart).replace(/%20/g, '%20');

      // Tambahkan teks sebelum '/' ke array extractedTexts
      extractedTexts.push(slashIndex !== -1 ? p1.substring(0, slashIndex) : p1);

      return `<a href="/search/label/${urlPart}" target="_blank">${originalText}</a>`;
    });

    // Proses [http...]
    result = result.replace(/(.*?)\s*\[(https?:\/\/.*?)\]/, (match, textBefore, url) => {
      return `<a href="${url}" target="_blank">${textBefore.trim()}</a>`;
    });

    // Proses {...} -> /p/...html
    result = result.replace(/(.+?)\s*\{(.*?)\}/g, (match, textBefore, p1) => {
        return `<a href="/p/${p1}.html" target="_blank">${textBefore.trim()}</a>`;
    });
    return result;
  }

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    if (/^[A-Z0-9\s]+$/.test(line) && line.indexOf(':') === -1) {
      // Kategori
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.colSpan = 2;
      th.classList.add('category');
      th.textContent = line;
      tr.appendChild(th);
      table.appendChild(tr);
    } else {
      // Data (header: value)
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

  // Setelah selesai memproses, hapus elemen <pre> agar tidak tampil
  rawElement.remove();

  // Tampilkan hasil di console tanpa spasi setelah koma
  console.log('Label:', extractedTexts.join(','));
});


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
            const p = document.createElement('p');
            p.innerHTML = listBuffer.join('<br>');
            li.appendChild(p);
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
            const p = document.createElement('p');
            p.innerHTML = listBuffer.join('<br>');
            li.appendChild(p);
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
                if (currentP.innerHTML.length > 0) {
                    currentP.innerHTML += '<br>';
                }
                currentP.innerHTML += convertLine(line);
            } else {
                if (!currentP) {
                    currentP = document.createElement('p');
                } else if (currentP.innerHTML.length > 0) {
                    currentP.innerHTML += '<br>';
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
            return `<span class="baris1">${before}/</span> <span class="baris2">${after}</span>`;
        }
        return `<span class="baris1">${line}</span>`;
    }

    lines.forEach(processLine);
    closeCurrentStructures();

    rawSyairElement.remove();
});

document.addEventListener('DOMContentLoaded', function() {
    const mediaSource = document.querySelector('.media-source');
    const mediaContainer = document.getElementById('media-container');
    const text = mediaSource.innerHTML;
    let html = '';

    // Proses setiap baris
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

    // Hapus teks sumber setelah diproses
    mediaSource.remove();
});

function generateVideoHTML(title, videoUrl, embedUrl, channelName, channelUrl) {
    return `
    <!-- Video -->
    <!-- Bagian Judul -->
    <p class="judulvideo">
        <a target="_blank" rel="noopener noreferrer" href="${videoUrl}" title="Tonton di YouTube">🎬 ${title}</a>
        <span>|</span>
        <a target="_blank" rel="noopener noreferrer" href="${channelUrl}" title="Buka kanal YouTube">📺 ${channelName}</a>
    </p>
    <!-- Video Wrapper -->
    <div class="video-wrapper">
        <iframe class="videoiframe"
            src="${embedUrl}"
            allowfullscreen>
        </iframe>
    </div>`;
}

function generateAudioHTML(title, audioTrackUrl, channelName, channelUrl, audioEmbedUrl) {
    return `
    <!-- Audio -->
    <!-- Bagian Judul -->
    <p class="judulaudio">
        <a target="_blank" rel="noopener noreferrer" href="${audioTrackUrl}" title="Dengarkan di SoundCloud">🎶 ${title}</a>
        <span>|</span>
        <a target="_blank" rel="noopener noreferrer" href="${channelUrl}" title="Buka kanal SoundCloud">📻 ${channelName}</a>
    </p>
    <!-- Audio Wrapper -->
    <div class="audio-wrapper">
        <iframe class="audioiframe"
            src="${audioEmbedUrl}"
            allowfullscreen>
        </iframe>
    </div>`;
}

function showFullImage(clickedImageSrc) {
    // ------------------------------------------
    // 1) List gambar + overlay
    // ------------------------------------------
    const allImages = Array.from(document.querySelectorAll('figure.image img'));
    const imageList = allImages.map(img => img.src);
    let currentIndex = imageList.indexOf(clickedImageSrc);

    const overlay = document.createElement('div');
    overlay.classList.add('image-overlay');

    const imgContainer = document.createElement('div');
    imgContainer.classList.add('image-container');

    // Loader
    const loader = document.createElement('div');
    loader.classList.add('loader');
    let loaderTimeout;
    let isImageLoaded = false;

    // Counter
    const counter = document.createElement('div');
    counter.classList.add('image-counter');

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');

    // Gambar
    const img = document.createElement('img');
    img.style.display = 'none';

    // Tombol navigasi
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&#10094;';
    prevButton.classList.add('nav-button', 'prev');

    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&#10095;';
    nextButton.classList.add('nav-button', 'next');

    // ------------------------------------------
    // Utility & Navigasi
    // ------------------------------------------
    function updateCounter() {
        counter.textContent = `${currentIndex + 1}/${imageList.length}`;
    }

    function showImage(index) {
        if (index < 0 || index >= imageList.length) return;
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
        tooltip.textContent = currentImg.alt || '';

        // Sembunyikan tombol jika di ujung
        prevButton.style.visibility = (currentIndex === 0) ? 'hidden' : 'visible';
        nextButton.style.visibility = (currentIndex === imageList.length - 1) ? 'hidden' : 'visible';
    }

    // ------------------------------------------
    // Onload Gambar
    // ------------------------------------------
    img.onload = function() {
        isImageLoaded = true;
        clearTimeout(loaderTimeout);
        loader.style.display = 'none';
        img.style.display = 'block';
    };

    img.src = clickedImageSrc;

    // ------------------------------------------
    // Zoom & Pan
    // ------------------------------------------
    let isZoomed = false;
    let zoomScale = 2.5;   // nilai zoom
    let currentOffsetX = 0;
    let currentOffsetY = 0;

    // Variabel untuk mouse/touch tracking
    let lastPointerX = 0;
    let lastPointerY = 0;

    // ------------------------------------------
    //  A. Fungsi bounding (batasi panning)
    // ------------------------------------------
    function applyTransform() {
        if (!isImageLoaded) return;

        // Hitung bounding
        const rect = img.getBoundingClientRect();

        // Lebar/tinggi gambar (setelah dipasang ke DOM tapi sebelum transform)
        const displayedWidth = rect.width;
        const displayedHeight = rect.height;

        // Lebar/tinggi setelah zoom
        const zoomedWidth = displayedWidth * zoomScale;
        const zoomedHeight = displayedHeight * zoomScale;

        // Batas panning => setengah selisih
        // misalnya: (zoomedWidth - displayedWidth) / 2
        // Note: jika zoomScale < 1, adjust logika ini
        const maxOffsetX = (zoomedWidth - displayedWidth) / 2;
        const maxOffsetY = (zoomedHeight - displayedHeight) / 2;

        // Jaga agar offset tidak melebihi batas
        if (currentOffsetX > maxOffsetX) currentOffsetX = maxOffsetX;
        if (currentOffsetX < -maxOffsetX) currentOffsetX = -maxOffsetX;
        if (currentOffsetY > maxOffsetY) currentOffsetY = maxOffsetY;
        if (currentOffsetY < -maxOffsetY) currentOffsetY = -maxOffsetY;

        // Terapkan transform
        img.style.transform = `
            scale(${zoomScale})
            translate(${currentOffsetX / zoomScale}px, ${currentOffsetY / zoomScale}px)
        `;
    }

    // ------------------------------------------
    //  B. Toggle Zoom (single/double click)
    // ------------------------------------------
    let tapCount = 0;
    let tapTimeout = null;

    function toggleZoom(e) {
        e.stopPropagation();  // jangan menutup overlay

        tapCount++;
        if (tapCount === 1) {
            tapTimeout = setTimeout(() => {
                // Single tap => zoom in
                if (!isZoomed) {
                    isZoomed = true;
                    overlay.classList.add('zoomed-mode');

                    // Mulai dari offsetX=0, offsetY=0 (posisi tengah),
                    // LALU paksa agar gambar muncul di "atas" => set ke -maxOffsetY
                    currentOffsetX = 0;
                    currentOffsetY = 0;
                    
                    // 1) Terapkan sementara agar .getBoundingClientRect() terbaru
                    applyTransform();

                    // 2) Baru kemudian cari maxOffsetY dan geser ke atas
                    const rect = img.getBoundingClientRect();
                    const displayedHeight = rect.height;
                    const zoomedHeight = displayedHeight * zoomScale;
                    const maxOffsetY = (zoomedHeight - displayedHeight) / 2;
                    currentOffsetY = -maxOffsetY;

                    applyTransform();
                }
                tapCount = 0;
            }, 300); // waktu jeda cek double tap
        } else if (tapCount === 2) {
            // Double tap => zoom out
            clearTimeout(tapTimeout);
            tapCount = 0;

            if (isZoomed) {
                isZoomed = false;
                overlay.classList.remove('zoomed-mode');
                currentOffsetX = 0;
                currentOffsetY = 0;
                img.style.transform = 'none';
            }
        }
    }

    // ------------------------------------------
    //  C. Gerakan Mouse/Touch => Panning
    //     Tanpa menahan tombol.
    // ------------------------------------------
    function handlePointerMove(e) {
        if (!isZoomed) return;

        // Gunakan clientX/clientY baik untuk mouse maupun touch
        let clientX, clientY;
        if (e.type.startsWith('touch')) {
            if (e.touches.length < 1) return;
            const touch = e.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
            e.preventDefault(); // menonaktifkan scroll di mobile
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // hitung delta
        const deltaX = clientX - lastPointerX;
        const deltaY = clientY - lastPointerY;

        // perbarui offset
        currentOffsetX += deltaX;
        currentOffsetY += deltaY;

        applyTransform();

        // simpan posisi terakhir
        lastPointerX = clientX;
        lastPointerY = clientY;
    }

    // Saat pointer masuk ke area container
    function handlePointerEnter(e) {
        if (!isZoomed) return;
        // Set koordinat awal agar deltaX, deltaY pertama = 0
        if (e.type.startsWith('touch')) {
            const touch = e.touches[0];
            lastPointerX = touch.clientX;
            lastPointerY = touch.clientY;
        } else {
            lastPointerX = e.clientX;
            lastPointerY = e.clientY;
        }
    }

    // ------------------------------------------
    // Tombol Navigasi
    // ------------------------------------------
    prevButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isZoomed) {
            showImage(currentIndex - 1);
        }
    });

    nextButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isZoomed) {
            showImage(currentIndex + 1);
        }
    });

    // ------------------------------------------
    // Tutup Overlay
    // ------------------------------------------
    function cleanup() {
        clearTimeout(loaderTimeout);
        clearTimeout(tapTimeout);
        document.removeEventListener('keydown', handleKeydown);
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
        }
    }
    document.addEventListener('keydown', handleKeydown);

    // ------------------------------------------
    // Daftarkan Event
    // ------------------------------------------
    // Single/double click/tap => toggleZoom
    img.addEventListener('click', toggleZoom);
    img.addEventListener('touchstart', toggleZoom, { passive: false });

    // Gerakan panning
    // - mousemove di container
    imgContainer.addEventListener('mousemove', handlePointerMove);
    imgContainer.addEventListener('mouseenter', handlePointerEnter);

    // - touchmove di container
    imgContainer.addEventListener('touchmove', handlePointerMove, { passive: false });
    imgContainer.addEventListener('touchstart', handlePointerEnter, { passive: false });

    // Klik pada area overlay => close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target === imgContainer) {
            cleanup();
        }
    });

    // ------------------------------------------
    // Susun DOM
    // ------------------------------------------
    imgContainer.appendChild(loader);
    imgContainer.appendChild(img);

    overlay.appendChild(counter);
    overlay.appendChild(tooltip);
    overlay.appendChild(prevButton);
    overlay.appendChild(imgContainer);
    overlay.appendChild(nextButton);

    document.body.appendChild(overlay);

    // Tampilkan gambar pertama
    showImage(currentIndex);
}

    // ------------------------------------------
    // Susun DOM
    // ------------------------------------------
    imgContainer.appendChild(loader);
    imgContainer.appendChild(img);

    overlay.appendChild(counter);
    overlay.appendChild(tooltip);
    overlay.appendChild(prevButton);
    overlay.appendChild(imgContainer);
    overlay.appendChild(nextButton);

    document.body.appendChild(overlay);

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

            // Validasi data
            const requiredFields = ['original-image-link', 'width', 'height', 'alt'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    console.error(`Missing required field: ${field}`);
                    return;
                }
            }

            const resourceId = data['original-image-link'].split('/assets/')[1].split('/')[0];
            const baseUrl = data['original-image-link'].substring(0, data['original-image-link'].lastIndexOf('/'));
            
            // Add title if it exists
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

            // Handle title separately
            if (data['judul-lagu']) {
                title = data['judul-lagu'];
                return;
            }

            // Validate required fields
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

// Hanya tampilkan label yang relevan
document.addEventListener('DOMContentLoaded', () => {
  const allowedLabels = ['Pembuka', 'Penutup', 'Persembahan', 'Komuni'];

  // Menambahkan atribut allowed-labels pada .overflowable-item
  document.querySelectorAll('.overflowable-item a[rel="tag"]').forEach(link => {
    const linkText = link.textContent.trim();
    if (allowedLabels.includes(linkText)) {
      link.closest('.overflowable-item').setAttribute('allowed-labels', linkText);
    }
  });

  // Untuk byline.post-labels - disesuaikan dengan HTML dan CSS
  document.querySelectorAll('.byline.post-labels a[rel="tag"]').forEach(link => {
    const linkText = link.textContent.trim();
    if (allowedLabels.includes(linkText)) {
      link.setAttribute('allowed-labels', linkText);
    }
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
