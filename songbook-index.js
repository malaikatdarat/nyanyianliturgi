<script>
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
</script>
