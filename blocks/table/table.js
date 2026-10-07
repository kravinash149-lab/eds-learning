function createTag(tag, attributes = {}, text = '') {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    Object.entries(attributes).forEach(([key, val]) => element.setAttribute(key, val));
    return element;
  }
  
  export default async function decorate(block) {
    const jsonUrl = '/countries.json';
    
    block.textContent = '';
    
    // Create a filter wrapper container
    const filterWrapper = createTag('div', { class: 'countries-filter-wrapper' });
    const tableContainer = createTag('div', { class: 'table-responsive' });
    tableContainer.textContent = 'Loading countries data...';
    
    block.append(filterWrapper, tableContainer);
  
    try {
      const response = await fetch(jsonUrl);
      if (!response.ok) {
        throw new Error(`Server returned HTTP Status ${response.status}`);
      }
      
      const json = await response.json();
      const records = json.data || [];
  
      if (records.length === 0) {
        tableContainer.textContent = 'No country entries found.';
        return;
      }
  
      tableContainer.textContent = '';
  
      // --- STEP 1: CREATE THE DROPDOWN FILTER ---
      const label = createTag('label', { for: 'country-select' }, 'Filter by Country: ');
      const select = createTag('select', { id: 'country-select', class: 'country-dropdown' });
      
      // Add default "Show All" option
      select.append(createTag('option', { value: 'all' }, 'All Countries'));
  
      // Dynamically look for the column that contains country names
      // It assumes a property named 'country', 'name', or defaults to the first available column key
      const keys = Object.keys(records[0]);
      const countryKey = keys.find((key) => key.toLowerCase() === 'country' || key.toLowerCase() === 'name') || keys[0];
  
      // Gather unique country names and sort them alphabetically
      const uniqueCountries = [...new Set(records.map((item) => item[countryKey]))]
        .filter(Boolean)
        .sort();
  
      // Populate dropdown options
      uniqueCountries.forEach((country) => {
        select.append(createTag('option', { value: country }, country));
      });
  
      filterWrapper.append(label, select);
  
      // --- STEP 2: BUILD THE TABLE STRUCTURE ---
      const table = createTag('table', { class: 'countries-table' });
      const thead = createTag('thead');
      const tbody = createTag('tbody');
  
      // Headers
      const headerRow = createTag('tr');
      keys.forEach((key) => {
        const readableHeader = key.charAt(0).toUpperCase() + key.slice(1);
        headerRow.append(createTag('th', {}, readableHeader));
      });
      thead.append(headerRow);
  
      // Body Rows
      records.forEach((record) => {
        // Store the specific country value as a custom data attribute on the row for fast filtering
        const countryValue = record[countryKey] || '';
        const row = createTag('tr', { 'data-country': countryValue });
        
        keys.forEach((key) => {
          const cellValue = record[key] !== undefined && record[key] !== null ? record[key] : '';
          row.append(createTag('td', {}, cellValue));
        });
        tbody.append(row);
      });
  
      table.append(thead, tbody);
      tableContainer.append(table);
  
      // --- STEP 3: ADD THE FILTER INTERACTION ---
      select.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        const rows = tbody.querySelectorAll('tr');
  
        rows.forEach((row) => {
          const rowCountry = row.getAttribute('data-country');
          
          if (selectedValue === 'all' || rowCountry === selectedValue) {
            row.style.display = ''; // Reset display style to show row
          } else {
            row.style.display = 'none'; // Hide row
          }
        });
      });
  
    } catch (error) {
      tableContainer.textContent = `Failed to load data: ${error.message}`;
      tableContainer.classList.add('table-error');
    }
  }
  