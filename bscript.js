  document.addEventListener("DOMContentLoaded", () => {
  console.log("Skrip dimulai...");
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

    console.log('Tab-wrap berhasil dimuat.');

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