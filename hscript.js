    // Fungsi untuk menampilkan gambar penuh
    function showFullImage(src) {
        const overlay = document.createElement(&#39;div&#39;);
        overlay.classList.add(&#39;image-overlay&#39;);
        
        const img = document.createElement(&#39;img&#39;);
        img.src = src;
        
        overlay.appendChild(img);
        document.body.appendChild(overlay);
        
        // Tambahkan event listener untuk menutup overlay
        overlay.addEventListener(&#39;click&#39;, function() {
            document.body.removeChild(overlay);
        });
        
        overlay.style.display = &#39;flex&#39;;
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