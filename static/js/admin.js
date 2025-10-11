async function fetchProducts() {
  const res = await fetch('/api/products');
  return await res.json();
}

let allProducts = [];
let currentFiltered = [];
let selectedRowId = null;
let isLoading = false;
let eventsBound = false;

function renderProducts(rows) {
  const tbody = document.getElementById('productsTable');
  if (!tbody) return;
  if (!rows.length) {
    tbody.innerHTML = '';
    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'block';
  } else {
    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'none';
    const newHtml = rows.map(r => {
      const stock = r.stock || 0;
      const stockClass = stock === 0 ? 'out-of-stock' : (stock < 10 ? 'low-stock' : '');
      const status = r.status || 'active';
      const brand = r.brand || 'Unknown';
      
      return `
        <tr data-id="${r.id}">
          <td>${r.title}</td>
          <td>${brand}</td>
          <td>$${parseFloat(r.price).toFixed(2)}</td>
          <td class="${stockClass}">${stock}</td>
          <td>${r.category}</td>
          <td><span class="status-badge status-${status}">${status}</span></td>
          <td class="actions-cell"><div class="actions">
            <button data-id="${r.id}" class="edit">Edit</button>
            <button data-id="${r.id}" class="delete secondary">Delete</button>
          </div></td>
        </tr>
      `;
    }).join('');

    // Only update DOM when HTML actually changes to avoid unnecessary reflows and image reloads
    if (tbody.innerHTML !== newHtml) {
      tbody.innerHTML = newHtml;
    }
  }
  updateMeta();
  highlightSelected();
}

function updateMeta() {
  const meta = document.getElementById('productMeta');
  if (meta) {
    meta.textContent = `${currentFiltered.length} of ${allProducts.length} products`;
  }
}

function applyFilters() {
  const term = document.getElementById('productSearch')?.value.trim().toLowerCase() || '';
  const cat = document.getElementById('categoryFilter')?.value || '';
  currentFiltered = allProducts.filter(p => {
    const matchesTerm = !term || p.title.toLowerCase().includes(term) || String(p.id).includes(term) || p.category.toLowerCase().includes(term);
    const matchesCat = !cat || p.category === cat;
    return matchesTerm && matchesCat;
  });
  renderProducts(currentFiltered);
}

async function load() {
  if (isLoading) return; // prevent concurrent loads
  isLoading = true;
  try {
    allProducts = await fetchProducts();
    currentFiltered = [...allProducts];
    renderProducts(currentFiltered);
  } finally {
    isLoading = false;
  }
}

function setImagePreview(path) {
  const wrap = document.getElementById('imagePreview');
  const img = document.getElementById('imagePreviewImg');
  if (!wrap || !img) return;
  if (path) {
    img.src = path;
    wrap.style.display = 'block';
  } else {
    img.src = '';
    wrap.style.display = 'none';
  }
}

// Clear the create/edit product form completely (including file input and preview)
function clearProductForm() {
  const form = document.getElementById('productForm');
  if (form) form.reset();
  const p_image = document.getElementById('p_image');
  if (p_image) p_image.value = '';
  const fileInput = document.getElementById('p_image_file');
  if (fileInput) {
    // revoke any created object URL
    if (fileInput._objectURL) {
      try { URL.revokeObjectURL(fileInput._objectURL); } catch (e) {}
      fileInput._objectURL = null;
    }
    try { fileInput.value = ''; } catch (e) {}
  }
  setImagePreview('');
  selectedRowId = null;
  highlightSelected();
}

function showNotification(message, type = 'info') {
  // Create or reuse notification element
  let notification = document.getElementById('admin-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'admin-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      font-family: 'Archivo', sans-serif;
      font-weight: 500;
      max-width: 350px;
    `;
    document.body.appendChild(notification);
  }
  
  // Set colors based on type
  const colors = {
    success: { bg: '#4CAF50', text: 'white' },
    error: { bg: '#f44336', text: 'white' },
    warning: { bg: '#ff9800', text: 'white' },
    info: { bg: '#2196F3', text: 'white' }
  };
  
  const color = colors[type] || colors.info;
  notification.style.backgroundColor = color.bg;
  notification.style.color = color.text;
  notification.textContent = message;
  
  // Show notification
  notification.style.opacity = '1';
  notification.style.transform = 'translateX(0)';
  
  // Hide after 4 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
  }, 4000);
}

function buildFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([k,v]) => fd.append(k, v));
  const fileInput = document.getElementById('p_image_file');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    fd.append('imageFile', fileInput.files[0]);
  }
  return fd;
}

async function saveProduct(data) {
  const method = 'POST';
  let body; let headers = {};
  const fileInput = document.getElementById('p_image_file');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    body = buildFormData(data);
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }
  const res = await fetch('/api/products', { method, headers, body });
  return await res.json();
}

async function updateProduct(id, data) {
  let body; let headers = {};
  const fileInput = document.getElementById('p_image_file');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    body = buildFormData(data);
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers,
    body
  });
  return await res.json();
}

async function deleteProduct(id) {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  return await res.json();
}

function populateForm(r) {
  document.getElementById('p_id').value = r.id;
  document.getElementById('p_title').value = r.title;
  document.getElementById('p_brand').value = r.brand || '';
  // prefer dynamic served image_url if present
  const path = r.image_url || r.image || '';
  document.getElementById('p_image').value = path;
  setImagePreview(path);
  document.getElementById('p_price').value = r.price;
  document.getElementById('p_stock').value = r.stock || 0;
  document.getElementById('p_category').value = r.category;
  document.getElementById('p_status').value = r.status || 'active';
  const fileInput = document.getElementById('p_image_file');
  if (fileInput) fileInput.value = '';
  
  // populate description and specs
  const descEl = document.getElementById('p_description');
  const specsEl = document.getElementById('p_specs');
  const colorsEl = document.getElementById('p_colors');
  const storageEl = document.getElementById('p_storage');
  
  if (descEl) descEl.value = r.description || '';
  if (colorsEl) colorsEl.value = Array.isArray(r.colors) ? r.colors.join(', ') : (r.colors || '');
  if (storageEl) storageEl.value = Array.isArray(r.storage_options) ? r.storage_options.join(', ') : (r.storage_options || '');
  
  if (specsEl) {
    if (!r.specs) specsEl.value = '';
    else if (typeof r.specs === 'string') specsEl.value = r.specs;
    else if (typeof r.specs === 'object') specsEl.value = Object.entries(r.specs).map(([k,v]) => `${k}: ${v}`).join('\n');
  }
}

function highlightSelected() {
  const rows = document.querySelectorAll('#productsTable tr');
  rows.forEach(tr => {
    if (Number(tr.dataset.id) === selectedRowId) tr.classList.add('selected');
    else tr.classList.remove('selected');
  });
}

function exportCsv() {
  const rows = currentFiltered.length ? currentFiltered : allProducts;
  if (!rows.length) return alert('No products to export');
  // Export columns: ID, Title, Brand, Price, Stock, Category, Status
  const header = ['ID','Title','Brand','Price','Stock','Category','Status'];
  const body = rows.map(r => [
    r.id,
    String(r.title || '').replace(/"/g,'""'),
    String(r.brand || '').replace(/"/g,'""'),
    typeof r.price !== 'undefined' ? r.price : '',
    typeof r.stock !== 'undefined' ? r.stock : '',
    String(r.category || '').replace(/"/g,'""'),
    String(r.status || '').replace(/"/g,'""')
  ]);
  const csv = [header.join(','), ...body.map(r => r.map(x => /[",\n]/.test(String(x)) ? `"${x}"` : x).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'products.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

let pdfLibPromise = null;
function ensurePdfLib() {
  if (pdfLibPromise) return pdfLibPromise;
  pdfLibPromise = new Promise((resolve, reject) => {
    // If already loaded
    if (window.jsPDF || (window.jspdf && window.jspdf.jsPDF)) return resolve();
    const cdns = [
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
    ];
    let loaded = false;
    let attempts = 0;
    function loadNext() {
      if (attempts >= cdns.length) {
        return reject(new Error('Failed to load jsPDF from all CDNs'));
      }
      const src = cdns[attempts++];
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        if (window.jsPDF || (window.jspdf && window.jspdf.jsPDF)) {
          loaded = true;
          resolve();
        } else {
          loadNext();
        }
      };
      script.onerror = () => loadNext();
      document.head.appendChild(script);
    }
    loadNext();
  }).then(() => new Promise((res) => {
    // small defer to ensure globals settle
    setTimeout(res, 20);
  }));
  return pdfLibPromise;
}

async function exportPdf() {
  const rows = (currentFiltered.length ? currentFiltered : allProducts).map(r => ({
    id: r.id,
    title: r.title,
    brand: r.brand || '',
    price: r.price,
    stock: r.stock,
    category: r.category,
    status: r.status || ''
  }));
  if (!rows.length) return alert('No products to export');

  const btn = document.getElementById('exportPdf');
  if (btn) { btn.disabled = true; btn.textContent = 'Loading...'; }
  try {
    await ensurePdfLib();
    const JsPDFCtor = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
    if (!JsPDFCtor) throw new Error('jsPDF not available after load');
    const doc = new JsPDFCtor({ orientation: 'p', unit: 'pt', format: 'a4' });

    const marginX = 40;
    const marginY = 50;
    doc.setFont('helvetica','');
    doc.setFontSize(16);
    doc.text('Products Export', marginX, marginY - 15);
    doc.setFontSize(10);
    const generated = new Date().toLocaleString();
    doc.text(`Generated: ${generated}`, marginX, marginY - 2);

  const head = [['ID','Title','Brand','Price','Stock','Category','Status']];
  const body = rows.map(r => [r.id, r.title, r.brand, `$${r.price}`, r.stock, r.category, r.status]);

    if (doc.autoTable) {
      doc.autoTable({
        head,
        body,
        startY: marginY,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [255,140,0], textColor: 255, halign: 'left' },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 180 }, 2: { cellWidth: 110 }, 3: { cellWidth: 70, halign: 'right' }, 4: { cellWidth: 60 }, 5: { cellWidth: 110 }, 6: { cellWidth: 80 } },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) {
            data.cell.styles.halign = 'right';
          }
        }
      });
    } else {
      // Fallback simple list if autotable failed to load
      let y = marginY;
      doc.setFontSize(11);
      doc.text(head[0].join(' | '), marginX, y);
      y += 16;
      doc.setFontSize(9);
      body.forEach(row => {
        doc.text(row.join(' | '), marginX, y);
        y += 14;
        if (y > 780) { // basic page break
          doc.addPage();
          y = marginY;
        }
      });
    }

    doc.save('products.pdf');
  } catch (err) {
    console.error(err);
    alert('Failed to generate PDF: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Export PDF'; }
  }
}

function bindEvents() {
  if (eventsBound) return; // avoid binding multiple times
  eventsBound = true;
  const form = document.getElementById('productForm');
  const resetBtn = document.getElementById('resetForm');
  const tbody = document.getElementById('productsTable');
  const search = document.getElementById('productSearch');
  const filter = document.getElementById('categoryFilter');
  const exportBtn = document.getElementById('exportCsv');
  const exportPdfBtn = document.getElementById('exportPdf');
  const fileInput = document.getElementById('p_image_file');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Parse colors and storage options from comma-separated strings
    const colorsValue = document.getElementById('p_colors')?.value || '';
    const storageValue = document.getElementById('p_storage')?.value || '';
    
    const data = {
      id: Number(document.getElementById('p_id').value),
      title: document.getElementById('p_title').value,
      brand: document.getElementById('p_brand')?.value || '',
      image: document.getElementById('p_image').value,
      description: document.getElementById('p_description')?.value || '',
      specs: document.getElementById('p_specs')?.value || '',
      price: Number(document.getElementById('p_price').value),
      stock: Number(document.getElementById('p_stock')?.value) || 0,
      category: document.getElementById('p_category').value,
      status: document.getElementById('p_status')?.value || 'active',
      colors: colorsValue ? colorsValue.split(',').map(c => c.trim()).filter(c => c) : [],
      storage_options: storageValue ? storageValue.split(',').map(s => s.trim()).filter(s => s) : []
    };

    // If product exists (update) else create
    const existing = allProducts.find(p => p.id === data.id);
    const resp = existing ? await updateProduct(data.id, data) : await saveProduct(data);

    if (resp.success) {
      await load();
      // fully reset the form including preview and hidden inputs
      clearProductForm();
      selectedRowId = null;
      highlightSelected();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Show success message
      showNotification(existing ? 'Product updated successfully!' : 'Product created successfully!', 'success');
    } else {
      alert(resp.message || 'Failed to save');
    }
  });

  resetBtn.addEventListener('click', () => { clearProductForm(); });

  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    const row = e.target.closest('tr');
    if (row && !btn) { // row click selection
      selectedRowId = Number(row.dataset.id);
      highlightSelected();
    }
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.classList.contains('edit')) {
      const prod = allProducts.find(x => x.id === id);
      if (prod) {
        // revoke any previous object URL to avoid stale previews
        const fileInput = document.getElementById('p_image_file');
        if (fileInput && fileInput._objectURL) {
          try { URL.revokeObjectURL(fileInput._objectURL); } catch (e) {}
          fileInput._objectURL = null;
        }
        populateForm(prod);
        selectedRowId = id;
        highlightSelected();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (btn.classList.contains('delete')) {
      if (confirm('Delete this product?')) {
        const resp = await deleteProduct(id);
        if (resp.success) {
          if (selectedRowId === id) selectedRowId = null;
          await load();
          // clear form if deleted product was being edited
          clearProductForm();
          showNotification('Product deleted successfully!', 'success');
        } else {
          alert(resp.message || 'Failed to delete');
        }
      }
    }
  });

  search?.addEventListener('input', () => applyFilters());
  filter?.addEventListener('change', () => applyFilters());
  exportBtn?.addEventListener('click', exportCsv);
  exportPdfBtn?.addEventListener('click', exportPdf);
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (file) {
        // revoke previous object URL if any
        if (fileInput._objectURL) {
          try { URL.revokeObjectURL(fileInput._objectURL); } catch (e) {}
          fileInput._objectURL = null;
        }
        const url = URL.createObjectURL(file);
        fileInput._objectURL = url;
        setImagePreview(url);
      } else {
        setImagePreview(document.getElementById('p_image').value);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await load();
  bindEvents();
});
