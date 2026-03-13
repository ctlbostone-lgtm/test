// ==================== VARIABLES GLOBALES ====================
let currentTheme = 'gold';
let invoiceItems = [];

// Données du tampon
let stampData = {
    image: null,
    imageWidth: 1,
    imageHeight: 1,
    xPercent: 80,
    yPercent: 90,
    size: 50,
    opacity: 1,
    isDragging: false,
    offsetX: 0,
    offsetY: 0
};

// Données du filigrane
let watermarkData = {
    type: 'none',
    text: '',
    image: null,
    imageWidth: 1,
    imageHeight: 1,
    xPercent: 50,
    yPercent: 50,
    size: 50,
    opacity: 0.3,
    rotation: 45,
    isDragging: false,
    offsetX: 0,
    offsetY: 0
};

// ==================== COMPTEUR DE GÉNÉRATIONS ====================
const GENERATION_KEY = 'generationCount';
const GENERATION_TIME_KEY = 'generationStartTime';
const MAX_GENERATIONS = 3;
const RESET_HOURS = 6; // 6 heures

function checkGenerationQuota() {
    const count = parseInt(localStorage.getItem(GENERATION_KEY) || '0');
    const startTime = parseInt(localStorage.getItem(GENERATION_TIME_KEY) || '0');
    const now = Date.now();
    if (startTime && (now - startTime) > RESET_HOURS * 3600000) {
        // Réinitialiser après 6h
        localStorage.setItem(GENERATION_KEY, '0');
        localStorage.setItem(GENERATION_TIME_KEY, now.toString());
        return 0;
    }
    return count;
}

function incrementGenerationCount() {
    let count = checkGenerationQuota();
    count++;
    localStorage.setItem(GENERATION_KEY, count.toString());
    if (count === 1) {
        // Première génération, enregistrer le timestamp
        localStorage.setItem(GENERATION_TIME_KEY, Date.now().toString());
    }
    updateGenerationDisplay();
    return count;
}

function updateGenerationDisplay() {
    const count = checkGenerationQuota();
    const remaining = Math.max(0, MAX_GENERATIONS - count);
    document.getElementById('remaining-generations').textContent = remaining;
    const timerSpan = document.getElementById('timer-reset');
    if (count >= MAX_GENERATIONS) {
        timerSpan.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Limite atteinte. Réessaie dans quelques heures.';
    } else {
        const startTime = parseInt(localStorage.getItem(GENERATION_TIME_KEY) || '0');
        if (startTime) {
            const elapsed = Date.now() - startTime;
            const remainingMs = RESET_HOURS * 3600000 - elapsed;
            if (remainingMs > 0) {
                const hours = Math.floor(remainingMs / 3600000);
                const minutes = Math.floor((remainingMs % 3600000) / 60000);
                timerSpan.textContent = ` (réinitialisation dans ${hours}h ${minutes}min)`;
            } else {
                timerSpan.textContent = '';
            }
        } else {
            timerSpan.textContent = '';
        }
    }
}

// ==================== REDIMENSIONNEUR ====================
function initResizer() {
    const container = document.getElementById('main-container');
    const resizer = document.getElementById('resizer');
    let isDragging = false;
    let startX, startLeftWidth, startRightWidth;

    resizer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        const columns = window.getComputedStyle(container).gridTemplateColumns.split(' ');
        startLeftWidth = parseFloat(columns[0]);
        startRightWidth = parseFloat(columns[2]);
        resizer.classList.add('dragging');
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const containerWidth = container.offsetWidth;
        const leftColMin = 300, rightColMin = 300;
        let newLeft = startLeftWidth + deltaX;
        let newRight = startRightWidth - deltaX;
        if (newLeft < leftColMin) {
            newLeft = leftColMin;
            newRight = containerWidth - newLeft - 10;
        }
        if (newRight < rightColMin) {
            newRight = rightColMin;
            newLeft = containerWidth - newRight - 10;
        }
        container.style.gridTemplateColumns = `${newLeft}px 10px ${newRight}px`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        resizer.classList.remove('dragging');
    });
}

// ==================== SAUVEGARDE & CHARGEMENT AUTO ====================
function saveDefaultSettings() {
    const settings = {
        companyName: document.getElementById('company-name')?.value,
        companyAddress: document.getElementById('company-address')?.value,
        companyCity: document.getElementById('company-city')?.value,
        companyPhone: document.getElementById('company-phone')?.value,
        companyEmail: document.getElementById('company-email')?.value,
        companySiret: document.getElementById('company-siret')?.value,
        logo: document.getElementById('company-logo-preview')?.src,
        clientName: document.getElementById('client-name')?.value,
        clientAddress: document.getElementById('client-address')?.value,
        clientPhone: document.getElementById('client-phone')?.value,
        clientEmail: document.getElementById('client-email')?.value,
        invoiceNumber: document.getElementById('invoice-number')?.value,
        reference: document.getElementById('reference')?.value,
        validity: document.getElementById('validity')?.value,
        paymentMethod: document.getElementById('payment-method')?.value,
        currency: document.getElementById('currency')?.value,
        notes: document.getElementById('notes')?.value,
        includeTva: document.getElementById('include-tva')?.checked,
        tvaRate: document.getElementById('tva-rate')?.value,
        includeLabor: document.getElementById('include-labor')?.checked,
        laborValue: document.getElementById('labor-value')?.value,
        laborType: document.getElementById('labor-type')?.value,
        customLaborText: document.getElementById('custom-labor-text')?.checked,
        customLaborTextValue: document.getElementById('custom-labor-text-value')?.value,
        includeExtraFees: document.getElementById('include-extra-fees')?.checked,
        extraFeesValue: document.getElementById('extra-fees-value')?.value,
        extraFeesType: document.getElementById('extra-fees-type')?.value,
        invoiceMainTitle: document.getElementById('invoice-main-title')?.value,
        templateStyle: document.getElementById('template-style')?.value,
        colorScheme: document.getElementById('color-scheme')?.value,
        fontFamily: document.getElementById('font-family')?.value,
        tableStyle: document.getElementById('table-style')?.value,
        // Filigrane
        watermarkType: watermarkData.type,
        watermarkText: watermarkData.text,
        watermarkSize: watermarkData.size,
        watermarkOpacity: watermarkData.opacity,
        watermarkRotation: watermarkData.rotation,
        watermarkXPercent: watermarkData.xPercent,
        watermarkYPercent: watermarkData.yPercent,
        watermarkImage: watermarkData.image,
        // Tampon
        stampXPercent: stampData.xPercent,
        stampYPercent: stampData.yPercent,
        stampSize: stampData.size,
        stampOpacity: stampData.opacity,
        stampImage: stampData.image
    };
    localStorage.setItem('invoiceDefaultSettings', JSON.stringify(settings));
}

function loadDefaultSettings() {
    const settings = JSON.parse(localStorage.getItem('invoiceDefaultSettings'));
    if (settings) {
        // Entreprise
        if (settings.companyName) {
            document.getElementById('company-name').value = settings.companyName;
            document.getElementById('company-name-display').textContent = settings.companyName;
            document.getElementById('company-name-signature').textContent = 'Pour ' + settings.companyName;
        }
        if (settings.companyAddress) document.getElementById('company-address').value = settings.companyAddress;
        if (settings.companyCity) document.getElementById('company-city').value = settings.companyCity;
        if (settings.companyPhone) document.getElementById('company-phone').value = settings.companyPhone;
        if (settings.companyEmail) document.getElementById('company-email').value = settings.companyEmail;
        if (settings.companySiret) document.getElementById('company-siret').value = settings.companySiret;
        if (settings.logo) document.getElementById('company-logo-preview').src = settings.logo;

        // Client
        if (settings.clientName) document.getElementById('client-name').value = settings.clientName;
        if (settings.clientAddress) document.getElementById('client-address').value = settings.clientAddress;
        if (settings.clientPhone) document.getElementById('client-phone').value = settings.clientPhone;
        if (settings.clientEmail) document.getElementById('client-email').value = settings.clientEmail;

        // Détails
        if (settings.invoiceNumber) document.getElementById('invoice-number').value = settings.invoiceNumber;
        if (settings.reference) document.getElementById('reference').value = settings.reference;
        if (settings.validity) document.getElementById('validity').value = settings.validity;
        if (settings.paymentMethod) document.getElementById('payment-method').value = settings.paymentMethod;
        if (settings.currency) document.getElementById('currency').value = settings.currency;

        // Notes
        if (settings.notes) document.getElementById('notes').value = settings.notes;

        // Options
        if (settings.includeTva !== undefined) document.getElementById('include-tva').checked = settings.includeTva;
        if (settings.tvaRate) document.getElementById('tva-rate').value = settings.tvaRate;
        if (settings.includeLabor !== undefined) document.getElementById('include-labor').checked = settings.includeLabor;
        if (settings.laborValue) document.getElementById('labor-value').value = settings.laborValue;
        if (settings.laborType) document.getElementById('labor-type').value = settings.laborType;
        if (settings.customLaborText !== undefined) document.getElementById('custom-labor-text').checked = settings.customLaborText;
        if (settings.customLaborTextValue) document.getElementById('custom-labor-text-value').value = settings.customLaborTextValue;
        if (settings.includeExtraFees !== undefined) document.getElementById('include-extra-fees').checked = settings.includeExtraFees;
        if (settings.extraFeesValue) document.getElementById('extra-fees-value').value = settings.extraFeesValue;
        if (settings.extraFeesType) document.getElementById('extra-fees-type').value = settings.extraFeesType;

        // Design
        if (settings.invoiceMainTitle) {
            document.getElementById('invoice-main-title').value = settings.invoiceMainTitle;
            document.getElementById('main-invoice-title').textContent = settings.invoiceMainTitle;
        }
        if (settings.templateStyle) document.getElementById('template-style').value = settings.templateStyle;
        if (settings.colorScheme) {
            document.getElementById('color-scheme').value = settings.colorScheme;
            applyTheme(settings.colorScheme);
        }
        if (settings.fontFamily) document.getElementById('font-family').value = settings.fontFamily;
        if (settings.tableStyle) document.getElementById('table-style').value = settings.tableStyle;

        // Filigrane
        if (settings.watermarkType) watermarkData.type = settings.watermarkType;
        if (settings.watermarkText) watermarkData.text = settings.watermarkText;
        if (settings.watermarkSize) watermarkData.size = settings.watermarkSize;
        if (settings.watermarkOpacity) watermarkData.opacity = settings.watermarkOpacity;
        if (settings.watermarkRotation) watermarkData.rotation = settings.watermarkRotation;
        if (settings.watermarkXPercent) watermarkData.xPercent = settings.watermarkXPercent;
        if (settings.watermarkYPercent) watermarkData.yPercent = settings.watermarkYPercent;
        if (settings.watermarkImage) watermarkData.image = settings.watermarkImage;

        // Tampon
        if (settings.stampXPercent) stampData.xPercent = settings.stampXPercent;
        if (settings.stampYPercent) stampData.yPercent = settings.stampYPercent;
        if (settings.stampSize) stampData.size = settings.stampSize;
        if (settings.stampOpacity) stampData.opacity = settings.stampOpacity;
        if (settings.stampImage) {
            stampData.image = settings.stampImage;
            stampData.imageWidth = 200;
            stampData.imageHeight = 200;
        }

        // Mettre à jour les champs du filigrane
        document.getElementById('watermark-type').value = watermarkData.type;
        document.getElementById('watermark-text').value = watermarkData.text;
        document.getElementById('watermark-size').value = watermarkData.size;
        document.getElementById('watermark-size-value').textContent = watermarkData.size + ' mm';
        document.getElementById('watermark-opacity').value = watermarkData.opacity;
        document.getElementById('watermark-opacity-value').textContent = watermarkData.opacity;
        document.getElementById('watermark-rotation').value = watermarkData.rotation;
        document.getElementById('watermark-rotation-value').textContent = watermarkData.rotation + '°';

        // Mettre à jour les champs du tampon
        document.getElementById('stamp-size').value = stampData.size;
        document.getElementById('stamp-size-value').textContent = stampData.size + ' mm';
        document.getElementById('stamp-opacity').value = stampData.opacity;
        document.getElementById('stamp-opacity-value').textContent = Math.round(stampData.opacity * 100) + '%';

        toggleOptionInputs();
        toggleWatermarkInputs();
        updateInvoicePreview();
        updateWatermarkPreview();
        updateStampPreview();
    }
}

// ==================== FORMATAGE ====================
function getCurrencySymbol(currencyCode) {
    const symbols = {
        'XAF': 'FCFA',
        'XOF': 'FCFA',
        'NGN': '₦',
        'GHS': '₵',
        'KES': 'KSh',
        'MAD': 'DH',
        'ZAR': 'R',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };
    return symbols[currencyCode] || currencyCode;
}

function formatCurrency(amount, currencyCode) {
    const symbol = getCurrencySymbol(currencyCode);
    const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return formatted + ' ' + symbol;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function toggleVisibility(elementId, value, defaultValue = '', prefix = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('hidden', !value);
        element.textContent = value ? prefix + value : prefix + defaultValue;
    }
}

function toggleOptionInputs() {
    const inputs = {
        'include-tva': 'tva-input',
        'include-labor': 'labor-input',
        'custom-labor-text': 'custom-labor-text-input',
        'include-extra-fees': 'extra-fees-input'
    };
    Object.entries(inputs).forEach(([checkboxId, inputId]) => {
        const checkbox = document.getElementById(checkboxId);
        const input = document.getElementById(inputId);
        if (checkbox && input) {
            input.style.display = checkbox.checked ? 'flex' : 'none';
        }
    });
    const laborCheck = document.getElementById('include-labor');
    const customCheck = document.getElementById('custom-labor-text');
    if (laborCheck && customCheck) {
        if (!laborCheck.checked) {
            customCheck.checked = false;
            document.getElementById('custom-labor-text-input').style.display = 'none';
        }
    }
}

function toggleWatermarkInputs() {
    const type = document.getElementById('watermark-type').value;
    document.getElementById('watermark-text-group').style.display = type === 'text' ? 'block' : 'none';
    document.getElementById('watermark-image-group').style.display = type === 'image' ? 'block' : 'none';
}

// ==================== FONCTIONS TAMPON ====================
function updateStampPreview() {
    const stampOverlay = document.getElementById('stamp-overlay');
    stampOverlay.innerHTML = '';
    if (stampData.image) {
        const preview = document.getElementById('invoice-preview');
        const rect = preview.getBoundingClientRect();
        const xPx = (stampData.xPercent / 100) * rect.width;
        const yPx = (stampData.yPercent / 100) * rect.height;
        const sizePx = stampData.size * 3.78;

        const stampImg = document.createElement('img');
        stampImg.className = 'stamp-image';
        stampImg.src = stampData.image;
        stampImg.style.width = 'auto';
        stampImg.style.height = sizePx + 'px';
        stampImg.style.left = xPx + 'px';
        stampImg.style.top = yPx + 'px';
        stampImg.style.opacity = stampData.opacity;
        stampImg.style.transform = 'translate(-50%, -50%)';
        stampImg.addEventListener('mousedown', (e) => startDragStamp(e));
        stampOverlay.appendChild(stampImg);
    }
}

function startDragStamp(e) {
    e.preventDefault();
    stampData.isDragging = true;
    const stampImg = e.target;
    const rect = stampImg.getBoundingClientRect();
    stampData.offsetX = e.clientX - rect.left;
    stampData.offsetY = e.clientY - rect.top;
    document.addEventListener('mousemove', dragStamp);
    document.addEventListener('mouseup', stopDragStamp);
}

function dragStamp(e) {
    if (!stampData.isDragging) return;
    const invoicePreview = document.getElementById('invoice-preview');
    const rect = invoicePreview.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    stampData.xPercent = (x / rect.width) * 100;
    stampData.yPercent = (y / rect.height) * 100;
    updateStampPreview();
}

function stopDragStamp() {
    stampData.isDragging = false;
    document.removeEventListener('mousemove', dragStamp);
    document.removeEventListener('mouseup', stopDragStamp);
    saveDefaultSettings();
}

function removeStamp() {
    stampData.image = null;
    stampData.xPercent = 80;
    stampData.yPercent = 90;
    const stampOverlay = document.getElementById('stamp-overlay');
    stampOverlay.innerHTML = '';
    document.getElementById('stamp-upload').value = '';
    document.getElementById('stamp-size').value = 50;
    document.getElementById('stamp-size-value').textContent = '50 mm';
    document.getElementById('stamp-opacity').value = 1;
    document.getElementById('stamp-opacity-value').textContent = '100%';
    saveDefaultSettings();
}

// ==================== FONCTIONS FILIGRANE ====================
function updateWatermarkPreview() {
    const watermarkOverlay = document.getElementById('watermark-overlay');
    watermarkOverlay.innerHTML = '';
    if (watermarkData.type === 'none') return;

    const preview = document.getElementById('invoice-preview');
    const rect = preview.getBoundingClientRect();
    const xPx = (watermarkData.xPercent / 100) * rect.width;
    const yPx = (watermarkData.yPercent / 100) * rect.height;
    const sizePx = watermarkData.size * 3.78;

    let element;
    if (watermarkData.type === 'text' && watermarkData.text) {
        element = document.createElement('div');
        element.className = 'watermark-text';
        element.textContent = watermarkData.text;
        element.style.left = xPx + 'px';
        element.style.top = yPx + 'px';
        element.style.fontSize = sizePx + 'px';
        element.style.opacity = watermarkData.opacity;
        element.style.transform = `translate(-50%, -50%) rotate(${watermarkData.rotation}deg)`;
        element.style.color = getCssVariable('--primary-color');
        element.style.textShadow = '2px 2px 4px rgba(0,0,0,0.2)';
    } else if (watermarkData.type === 'image' && watermarkData.image) {
        element = document.createElement('img');
        element.className = 'watermark-image';
        element.src = watermarkData.image;
        element.style.left = xPx + 'px';
        element.style.top = yPx + 'px';
        element.style.height = sizePx + 'px';
        element.style.width = 'auto';
        element.style.opacity = watermarkData.opacity;
        element.style.transform = `translate(-50%, -50%) rotate(${watermarkData.rotation}deg)`;
    } else {
        return;
    }

    element.addEventListener('mousedown', (e) => startDragWatermark(e));
    watermarkOverlay.appendChild(element);
}

function startDragWatermark(e) {
    e.preventDefault();
    watermarkData.isDragging = true;
    const element = e.target;
    const rect = element.getBoundingClientRect();
    watermarkData.offsetX = e.clientX - rect.left;
    watermarkData.offsetY = e.clientY - rect.top;
    document.addEventListener('mousemove', dragWatermark);
    document.addEventListener('mouseup', stopDragWatermark);
}

function dragWatermark(e) {
    if (!watermarkData.isDragging) return;
    const invoicePreview = document.getElementById('invoice-preview');
    const rect = invoicePreview.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    watermarkData.xPercent = (x / rect.width) * 100;
    watermarkData.yPercent = (y / rect.height) * 100;
    updateWatermarkPreview();
}

function stopDragWatermark() {
    watermarkData.isDragging = false;
    document.removeEventListener('mousemove', dragWatermark);
    document.removeEventListener('mouseup', stopDragWatermark);
    saveDefaultSettings();
}

function removeWatermark() {
    watermarkData.type = 'none';
    watermarkData.text = '';
    watermarkData.image = null;
    watermarkData.xPercent = 50;
    watermarkData.yPercent = 50;
    watermarkData.size = 50;
    watermarkData.opacity = 0.3;
    watermarkData.rotation = 45;
    document.getElementById('watermark-type').value = 'none';
    document.getElementById('watermark-text').value = '';
    document.getElementById('watermark-image-upload').value = '';
    document.getElementById('watermark-size').value = 50;
    document.getElementById('watermark-size-value').textContent = '50 mm';
    document.getElementById('watermark-opacity').value = 0.3;
    document.getElementById('watermark-opacity-value').textContent = '0.3';
    document.getElementById('watermark-rotation').value = 45;
    document.getElementById('watermark-rotation-value').textContent = '45°';
    toggleWatermarkInputs();
    updateWatermarkPreview();
    saveDefaultSettings();
}

// ==================== GESTION DES SECTIONS ET ARTICLES ====================
function updateRowTotal(row) {
    const qty = parseFloat(row.querySelector('.item-quantity')?.value) || 0;
    const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
    const total = qty * price;
    const totalCell = row.querySelector('.item-total');
    if (totalCell) {
        totalCell.textContent = total.toFixed(2);
    }
}

function updateAllRowsTotal() {
    document.querySelectorAll('#items-table-body tr:not(.section-row):not(.section-option-row)').forEach(row => {
        updateRowTotal(row);
    });
}

function addSectionRow() {
    const tbody = document.getElementById('items-table-body');
    if (!tbody) return;

    const trSection = document.createElement('tr');
    trSection.className = 'section-row';
    trSection.innerHTML = `
        <td colspan="5" style="padding: 8px; background-color: #f0f2f5; text-align: center; vertical-align: middle;">
            <input type="text" class="form-control section-title" placeholder="Titre de la section" 
                   style="text-align: center; font-weight: bold; background-color: #f0f2f5; border: 1px solid var(--primary-color); width: 100%;">
        </td>
        <td style="padding: 8px; background-color: #f0f2f5; text-align: center; vertical-align: middle;">
            <div style="display: flex; gap: 5px; justify-content: center;">
                <button class="btn btn-success btn-sm add-item-in-section" title="Ajouter un article dans cette section"><i class="fas fa-plus"></i></button>
                <button class="btn btn-danger btn-sm remove-section"><i class="fas fa-trash"></i> Section</button>
            </div>
        </td>
    `;
    tbody.appendChild(trSection);

    const trOptions = document.createElement('tr');
    trOptions.className = 'section-option-row';
    trOptions.innerHTML = `
        <td colspan="4" style="padding: 8px; background-color: #fafbfc; text-align: left; vertical-align: middle;">
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" class="section-labor-checkbox">
                    <label style="font-weight: 600; margin: 0;">Main-d'œuvre section</label>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input type="number" class="form-control section-labor-value" value="0" min="0" step="0.01" style="width: 80px;" disabled>
                    <select class="form-control section-labor-type" style="width: 70px;" disabled>
                        <option value="percentage">%</option>
                        <option value="fixed">Montant fixe</option>
                    </select>
                </div>
                <span style="font-weight: 600;">Sous-total section :</span>
                <span class="section-total-display" style="font-weight: 700; color: var(--primary-color);">0.00 FCFA</span>
            </div>
        </td>
        <td colspan="2" style="padding: 8px; background-color: #fafbfc; text-align: right; vertical-align: middle;">
            <button class="btn btn-danger btn-sm remove-section-options" style="background: #e74c3c; padding: 6px 12px;"><i class="fas fa-trash-alt"></i> Supprimer options</button>
        </td>
    `;
    tbody.appendChild(trOptions);

    attachSectionListeners(trSection, trOptions);
    attachAddItemInSectionListeners();
    attachSectionOptionsListeners(trOptions);
    updateInvoicePreview();
}

function addSectionFirst() {
    const tbody = document.getElementById('items-table-body');
    if (!tbody) return;

    const trSection = document.createElement('tr');
    trSection.className = 'section-row';
    trSection.innerHTML = `
        <td colspan="5" style="padding: 8px; background-color: #f0f2f5; text-align: center; vertical-align: middle;">
            <input type="text" class="form-control section-title" placeholder="Titre de la section" 
                   style="text-align: center; font-weight: bold; background-color: #f0f2f5; border: 1px solid var(--primary-color); width: 100%;">
        </td>
        <td style="padding: 8px; background-color: #f0f2f5; text-align: center; vertical-align: middle;">
            <div style="display: flex; gap: 5px; justify-content: center;">
                <button class="btn btn-success btn-sm add-item-in-section" title="Ajouter un article dans cette section"><i class="fas fa-plus"></i></button>
                <button class="btn btn-danger btn-sm remove-section"><i class="fas fa-trash"></i> Section</button>
            </div>
        </td>
    `;
    tbody.insertBefore(trSection, tbody.firstChild);

    const trOptions = document.createElement('tr');
    trOptions.className = 'section-option-row';
    trOptions.innerHTML = `
        <td colspan="4" style="padding: 8px; background-color: #fafbfc; text-align: left; vertical-align: middle;">
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" class="section-labor-checkbox">
                    <label style="font-weight: 600; margin: 0;">Main-d'œuvre section</label>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input type="number" class="form-control section-labor-value" value="0" min="0" step="0.01" style="width: 80px;" disabled>
                    <select class="form-control section-labor-type" style="width: 70px;" disabled>
                        <option value="percentage">%</option>
                        <option value="fixed">Montant fixe</option>
                    </select>
                </div>
                <span style="font-weight: 600;">Sous-total section :</span>
                <span class="section-total-display" style="font-weight: 700; color: var(--primary-color);">0.00 FCFA</span>
            </div>
        </td>
        <td colspan="2" style="padding: 8px; background-color: #fafbfc; text-align: right; vertical-align: middle;">
            <button class="btn btn-danger btn-sm remove-section-options" style="background: #e74c3c; padding: 6px 12px;"><i class="fas fa-trash-alt"></i> Supprimer options</button>
        </td>
    `;
    tbody.insertBefore(trOptions, trSection.nextSibling);

    attachSectionListeners(trSection, trOptions);
    attachAddItemInSectionListeners();
    attachSectionOptionsListeners(trOptions);
    updateInvoicePreview();
}

function attachSectionListeners(sectionRow, optionsRow) {
    const removeBtn = sectionRow.querySelector('.remove-section');
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sectionRow.remove();
            optionsRow.remove();
            updateInvoicePreview();
        });
    }
    const titleInput = sectionRow.querySelector('.section-title');
    if (titleInput) {
        titleInput.removeEventListener('input', updateInvoicePreview);
        titleInput.addEventListener('input', updateInvoicePreview);
    }
    const removeOptionsBtn = optionsRow.querySelector('.remove-section-options');
    if (removeOptionsBtn) {
        removeOptionsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            optionsRow.remove();
            updateInvoicePreview();
        });
    }
}

function attachSectionOptionsListeners(optionsRow) {
    const checkbox = optionsRow.querySelector('.section-labor-checkbox');
    const laborValue = optionsRow.querySelector('.section-labor-value');
    const laborType = optionsRow.querySelector('.section-labor-type');

    if (checkbox && laborValue && laborType) {
        checkbox.addEventListener('change', function() {
            const checked = this.checked;
            laborValue.disabled = !checked;
            laborType.disabled = !checked;
            updateInvoicePreview();
        });
        laborValue.addEventListener('input', updateInvoicePreview);
        laborType.addEventListener('change', updateInvoicePreview);
    }
}

function addItemAfterSection(sectionRow) {
    const tbody = document.getElementById('items-table-body');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="form-control item-description" placeholder="Nouvelle prestation"></td>
        <td>
            <select class="form-control item-unit">
                <option value="piece" data-label="Pièce">Pièce</option>
                <option value="liter" data-label="Litre">Litre</option>
                <option value="meter" data-label="Mètre">Mètre</option>
                <option value="kg" data-label="Kilogramme">Kilogramme</option>
                <option value="hour" data-label="Heure">Heure</option>
                <option value="day" data-label="Jour">Jour</option>
                <option value="sqm" data-symbol="m²" data-label="Mètre carré">Mètre carré (m²)</option>
                <option value="cbm" data-label="Mètre cube">Mètre cube</option>
                <option value="ton" data-label="Tonne">Tonne</option>
                <option value="flatrate" data-label="Forfait">Forfait</option>
                <option value="service" data-label="Prestation">Prestation</option>
                <option value="kit" data-label="Kit">Kit</option>
                <option value="carton" data-label="Carton">Carton</option>
                <option value="bottle" data-label="Bouteille">Bouteille</option>
                <option value="roll" data-label="Rouleau">Rouleau</option>
                <option value="bag" data-label="Sac">Sac</option>
                <option value="box" data-label="Boîte">Boîte</option>
                <option value="set" data-label="Set">Set</option>
                <option value="pack" data-label="Pack">Pack</option>
                <option value="bucket" data-label="Seau">Seau</option>
                <option value="barrel" data-label="Baril">Baril</option>
                <option value="pallet" data-label="Palette">Palette</option>
                <option value="dozen" data-label="Douzaine">Douzaine</option>
                <option value="pair" data-label="Paire">Paire</option>
            </select>
        </td>
        <td><input type="number" class="form-control item-quantity" value="1" min="1"></td>
        <td><input type="number" class="form-control item-price" value="0.00" step="0.01"></td>
        <td class="item-total">0.00</td>
        <td><button class="btn btn-danger btn-sm remove-item"><i class="fas fa-trash"></i> Suppr</button></td>
    `;
    const optionsRow = sectionRow.nextElementSibling;
    if (optionsRow && optionsRow.classList.contains('section-option-row')) {
        tbody.insertBefore(newRow, optionsRow);
    } else {
        tbody.insertBefore(newRow, sectionRow.nextSibling);
    }
    attachInputListeners();
    attachRemoveListeners();
    updateAllRowsTotal();
    updateInvoicePreview();
}

function attachAddItemInSectionListeners() {
    document.querySelectorAll('.add-item-in-section').forEach(btn => {
        btn.removeEventListener('click', addItemInSectionHandler);
        btn.addEventListener('click', addItemInSectionHandler);
    });
}

function addItemInSectionHandler(e) {
    const sectionRow = e.target.closest('tr');
    addItemAfterSection(sectionRow);
}

function addItemRow() {
    const tbody = document.getElementById('items-table-body');
    if (tbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="form-control item-description" placeholder="Nouvelle prestation"></td>
            <td>
                <select class="form-control item-unit">
                    <option value="piece" data-label="Pièce">Pièce</option>
                    <option value="liter" data-label="Litre">Litre</option>
                    <option value="meter" data-label="Mètre">Mètre</option>
                    <option value="kg" data-label="Kilogramme">Kilogramme</option>
                    <option value="hour" data-label="Heure">Heure</option>
                    <option value="day" data-label="Jour">Jour</option>
                    <option value="sqm" data-symbol="m²" data-label="Mètre carré">Mètre carré (m²)</option>
                    <option value="cbm" data-label="Mètre cube">Mètre cube</option>
                    <option value="ton" data-label="Tonne">Tonne</option>
                    <option value="flatrate" data-label="Forfait">Forfait</option>
                    <option value="service" data-label="Prestation">Prestation</option>
                    <option value="kit" data-label="Kit">Kit</option>
                    <option value="carton" data-label="Carton">Carton</option>
                    <option value="bottle" data-label="Bouteille">Bouteille</option>
                    <option value="roll" data-label="Rouleau">Rouleau</option>
                    <option value="bag" data-label="Sac">Sac</option>
                    <option value="box" data-label="Boîte">Boîte</option>
                    <option value="set" data-label="Set">Set</option>
                    <option value="pack" data-label="Pack">Pack</option>
                    <option value="bucket" data-label="Seau">Seau</option>
                    <option value="barrel" data-label="Baril">Baril</option>
                    <option value="pallet" data-label="Palette">Palette</option>
                    <option value="dozen" data-label="Douzaine">Douzaine</option>
                    <option value="pair" data-label="Paire">Paire</option>
                </select>
            </td>
            <td><input type="number" class="form-control item-quantity" value="1" min="1"></td>
            <td><input type="number" class="form-control item-price" value="0.00" step="0.01"></td>
            <td class="item-total">0.00</td>
            <td><button class="btn btn-danger btn-sm remove-item"><i class="fas fa-trash"></i> Suppr</button></td>
        `;
        tbody.appendChild(tr);
        attachInputListeners();
        attachRemoveListeners();
        updateAllRowsTotal();
        updateInvoicePreview();
    }
}

function attachRemoveListeners() {
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.removeEventListener('click', removeRowHandler);
        btn.addEventListener('click', removeRowHandler);
    });
}

function removeRowHandler() {
    this.closest('tr').remove();
    updateInvoicePreview();
}

function attachInputListeners() {
    document.querySelectorAll('.item-quantity, .item-price').forEach(input => {
        input.removeEventListener('input', rowInputHandler);
        input.addEventListener('input', rowInputHandler);
    });
    document.querySelectorAll('.form-control, .item-description, .item-unit, .section-title, .section-labor-value, .section-labor-type, #invoice-main-title, #custom-labor-text-value').forEach(input => {
        if (!input.classList.contains('item-quantity') && !input.classList.contains('item-price')) {
            input.removeEventListener('input', updateInvoicePreview);
            input.removeEventListener('change', updateInvoicePreview);
            input.addEventListener('input', updateInvoicePreview);
            input.addEventListener('change', updateInvoicePreview);
        }
    });
}

function rowInputHandler(e) {
    const row = e.target.closest('tr');
    if (row && !row.classList.contains('section-row') && !row.classList.contains('section-option-row')) {
        updateRowTotal(row);
    }
    updateInvoicePreview();
}

// ==================== CHARGEMENT D'EXEMPLES DE MÉTIERS ====================
function loadExample(metier) {
    const tbody = document.getElementById('items-table-body');
    tbody.innerHTML = '';

    let sections = [];
    let titreDevis = '';

    switch (metier) {
        case 'electricien':
            titreDevis = 'Devis installation électrique';
            sections = [
                {
                    title: 'Gainage et câblage',
                    items: [
                        { description: 'Gaine ICTA 20/10', unit: 'meter', qty: 50, price: 12000 },
                        { description: 'Câble VGV 2,5 mm²', unit: 'meter', qty: 100, price: 19000 },
                        { description: 'Câble VGV 1,5 mm²', unit: 'meter', qty: 50, price: 14500 },
                        { description: 'Gaine annelée 25 mm', unit: 'meter', qty: 30, price: 8000 }
                    ]
                },
                {
                    title: 'Appareillage',
                    items: [
                        { description: 'Interrupteur simple', unit: 'piece', qty: 10, price: 3500 },
                        { description: 'Prise de courant 2P+T', unit: 'piece', qty: 15, price: 4200 },
                        { description: 'Tableau électrique 13 modules', unit: 'piece', qty: 1, price: 45000 },
                        { description: 'Disjoncteur 16A', unit: 'piece', qty: 8, price: 6500 }
                    ]
                }
            ];
            break;
        case 'plombier':
            titreDevis = 'Devis plomberie sanitaire';
            sections = [
                {
                    title: 'Tuyauterie',
                    items: [
                        { description: 'Tube PER Ø16', unit: 'meter', qty: 40, price: 2500 },
                        { description: 'Tube PER Ø20', unit: 'meter', qty: 30, price: 3200 },
                        { description: 'Tube cuivre Ø12', unit: 'meter', qty: 20, price: 8500 },
                        { description: 'Tube cuivre Ø14', unit: 'meter', qty: 15, price: 9800 }
                    ]
                },
                {
                    title: 'Robinetterie',
                    items: [
                        { description: 'Robinet d\'arrêt 1/2"', unit: 'piece', qty: 5, price: 4500 },
                        { description: 'Mélangeur lavabo', unit: 'piece', qty: 2, price: 25000 },
                        { description: 'Flexible 40 cm', unit: 'piece', qty: 10, price: 1800 },
                        { description: 'Clapet anti-retour', unit: 'piece', qty: 2, price: 6500 }
                    ]
                }
            ];
            break;
        case 'peintre':
            titreDevis = 'Devis travaux de peinture';
            sections = [
                {
                    title: 'Préparation',
                    items: [
                        { description: 'Enduit de lissage', unit: 'bag', qty: 5, price: 12000 },
                        { description: 'Bande à joint', unit: 'roll', qty: 3, price: 3500 },
                        { description: 'Papier de verre fin', unit: 'piece', qty: 10, price: 800 }
                    ]
                },
                {
                    title: 'Peinture',
                    items: [
                        { description: 'Peinture acrylique blanc', unit: 'bucket', qty: 4, price: 18500 },
                        { description: 'Peinture satinée', unit: 'bucket', qty: 2, price: 22000 },
                        { description: 'Rouleau 25 cm', unit: 'piece', qty: 3, price: 2500 },
                        { description: 'Pinceau 50 mm', unit: 'piece', qty: 2, price: 1200 }
                    ]
                }
            ];
            break;
        case 'geniecivil':
            titreDevis = 'Devis construction / génie civil';
            sections = [
                {
                    title: 'Fondations',
                    items: [
                        { description: 'Ciment (sac 50kg)', unit: 'bag', qty: 50, price: 6500 },
                        { description: 'Sable (m³)', unit: 'cbm', qty: 5, price: 25000 },
                        { description: 'Gravier (m³)', unit: 'cbm', qty: 8, price: 30000 },
                        { description: 'Fer à béton Ø10', unit: 'kg', qty: 200, price: 850 }
                    ]
                },
                {
                    title: 'Maçonnerie',
                    items: [
                        { description: 'Parpaing 20x20x40', unit: 'piece', qty: 400, price: 850 },
                        { description: 'Mortier prêt à l\'emploi', unit: 'bag', qty: 20, price: 7500 },
                        { description: 'Treillis soudé', unit: 'piece', qty: 10, price: 12500 }
                    ]
                }
            ];
            break;
        case 'mecanicien':
            titreDevis = 'Devis réparation automobile';
            sections = [
                {
                    title: 'Moteur',
                    items: [
                        { description: 'Kit distribution', unit: 'kit', qty: 1, price: 150000 },
                        { description: 'Courroie accessoires', unit: 'piece', qty: 1, price: 25000 },
                        { description: 'Filtre à huile', unit: 'piece', qty: 1, price: 5000 },
                        { description: 'Huile moteur 5W40', unit: 'liter', qty: 5, price: 8000 }
                    ]
                },
                {
                    title: 'Freinage',
                    items: [
                        { description: 'Plaquettes de frein avant', unit: 'set', qty: 1, price: 45000 },
                        { description: 'Disques de frein', unit: 'pair', qty: 1, price: 65000 },
                        { description: 'Liquide de frein', unit: 'liter', qty: 1, price: 7000 }
                    ]
                }
            ];
            break;
        case 'hydraulicien':
            titreDevis = 'Devis adduction d’eau potable (AEP)';
            sections = [
                {
                    title: 'Canalisations',
                    items: [
                        { description: 'Tube PEHD Ø63', unit: 'meter', qty: 200, price: 4200 },
                        { description: 'Tube PEHD Ø90', unit: 'meter', qty: 150, price: 6800 },
                        { description: 'Tube PEHD Ø110', unit: 'meter', qty: 100, price: 9200 },
                        { description: 'Raccord électrosoudable', unit: 'piece', qty: 30, price: 3500 }
                    ]
                },
                {
                    title: 'Équipements',
                    items: [
                        { description: 'Vanne à opercule', unit: 'piece', qty: 4, price: 55000 },
                        { description: 'Compteur d’eau', unit: 'piece', qty: 2, price: 38000 },
                        { description: 'Clapet anti-retour', unit: 'piece', qty: 3, price: 12500 },
                        { description: 'Bride PN10', unit: 'piece', qty: 10, price: 7500 }
                    ]
                }
            ];
            break;
        case 'carreleur':
            titreDevis = 'Devis carrelage';
            sections = [
                {
                    title: 'Préparation du sol',
                    items: [
                        { description: 'Ragréage sol', unit: 'bag', qty: 10, price: 9500 },
                        { description: 'Primaire d’accrochage', unit: 'bucket', qty: 2, price: 12000 }
                    ]
                },
                {
                    title: 'Carrelage',
                    items: [
                        { description: 'Carrelage 30x30 (m²)', unit: 'sqm', qty: 25, price: 15000 },
                        { description: 'Carrelage 60x60 (m²)', unit: 'sqm', qty: 30, price: 22000 },
                        { description: 'Croisillon 2mm', unit: 'pack', qty: 2, price: 1500 },
                        { description: 'Joint epoxy', unit: 'bucket', qty: 3, price: 8500 }
                    ]
                }
            ];
            break;
        default:
            return;
    }

    document.getElementById('invoice-title-input').value = titreDevis;

    sections.forEach(section => {
        const trSection = document.createElement('tr');
        trSection.className = 'section-row';
        trSection.innerHTML = `
            <td colspan="5" style="padding: 8px; background-color: #f0f2f5; text-align: center; vertical-align: middle;">
                <input type="text" class="form-control section-title" value="${section.title}" 
                       style="text-align: center; font-weight: bold; background-color: #f0f2f5; border: 1px solid var(--primary-color); width: 100%;">
            </td>
            <td style="padding: 8px; background-color: #f0f2f5; text-align: center; vertical-align: middle;">
                <div style="display: flex; gap: 5px; justify-content: center;">
                    <button class="btn btn-success btn-sm add-item-in-section" title="Ajouter un article dans cette section"><i class="fas fa-plus"></i></button>
                    <button class="btn btn-danger btn-sm remove-section"><i class="fas fa-trash"></i> Section</button>
                </div>
            </td>
        `;
        tbody.appendChild(trSection);

        const trOptions = document.createElement('tr');
        trOptions.className = 'section-option-row';
        trOptions.innerHTML = `
            <td colspan="4" style="padding: 8px; background-color: #fafbfc; text-align: left; vertical-align: middle;">
                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <input type="checkbox" class="section-labor-checkbox">
                        <label style="font-weight: 600; margin: 0;">Main-d'œuvre section</label>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <input type="number" class="form-control section-labor-value" value="0" min="0" step="0.01" style="width: 80px;" disabled>
                        <select class="form-control section-labor-type" style="width: 70px;" disabled>
                            <option value="percentage">%</option>
                            <option value="fixed">Montant fixe</option>
                        </select>
                    </div>
                    <span style="font-weight: 600;">Sous-total section :</span>
                    <span class="section-total-display" style="font-weight: 700; color: var(--primary-color);">0.00 FCFA</span>
                </div>
            </td>
            <td colspan="2" style="padding: 8px; background-color: #fafbfc; text-align: right; vertical-align: middle;">
                <button class="btn btn-danger btn-sm remove-section-options" style="background: #e74c3c; padding: 6px 12px;"><i class="fas fa-trash-alt"></i> Supprimer options</button>
            </td>
        `;
        tbody.appendChild(trOptions);

        attachSectionListeners(trSection, trOptions);
        attachSectionOptionsListeners(trOptions);

        section.items.forEach(item => {
            const trItem = document.createElement('tr');
            trItem.innerHTML = `
                <td><input type="text" class="form-control item-description" value="${item.description}"></td>
                <td>
                    <select class="form-control item-unit">
                        <option value="piece" data-label="Pièce">Pièce</option>
                        <option value="liter" data-label="Litre">Litre</option>
                        <option value="meter" data-label="Mètre">Mètre</option>
                        <option value="kg" data-label="Kilogramme">Kilogramme</option>
                        <option value="hour" data-label="Heure">Heure</option>
                        <option value="day" data-label="Jour">Jour</option>
                        <option value="sqm" data-symbol="m²" data-label="Mètre carré">Mètre carré (m²)</option>
                        <option value="cbm" data-label="Mètre cube">Mètre cube</option>
                        <option value="ton" data-label="Tonne">Tonne</option>
                        <option value="flatrate" data-label="Forfait">Forfait</option>
                        <option value="service" data-label="Prestation">Prestation</option>
                        <option value="kit" data-label="Kit">Kit</option>
                        <option value="carton" data-label="Carton">Carton</option>
                        <option value="bottle" data-label="Bouteille">Bouteille</option>
                        <option value="roll" data-label="Rouleau">Rouleau</option>
                        <option value="bag" data-label="Sac">Sac</option>
                        <option value="box" data-label="Boîte">Boîte</option>
                        <option value="set" data-label="Set">Set</option>
                        <option value="pack" data-label="Pack">Pack</option>
                        <option value="bucket" data-label="Seau">Seau</option>
                        <option value="barrel" data-label="Baril">Baril</option>
                        <option value="pallet" data-label="Palette">Palette</option>
                        <option value="dozen" data-label="Douzaine">Douzaine</option>
                        <option value="pair" data-label="Paire">Paire</option>
                    </select>
                </td>
                <td><input type="number" class="form-control item-quantity" value="${item.qty}" min="1"></td>
                <td><input type="number" class="form-control item-price" value="${item.price}" step="0.01"></td>
                <td class="item-total">${(item.qty * item.price).toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm remove-item"><i class="fas fa-trash"></i> Suppr</button></td>
            `;
            tbody.insertBefore(trItem, trOptions);

            const unitSelect = trItem.querySelector('.item-unit');
            if (unitSelect) {
                unitSelect.value = item.unit;
            }
        });
    });

    attachAddItemInSectionListeners();
    attachRemoveListeners();
    attachInputListeners();
    updateAllRowsTotal();
    updateInvoicePreview();
}

// ==================== CALCULS & APERÇU ====================
function calculateDatas() {
    const rows = document.querySelectorAll('#items-table-body tr');
    let totalHTGlobal = 0;
    const currency = document.getElementById('currency')?.value || 'XAF';
    const includeTVA = document.getElementById('include-tva')?.checked;
    const includeLaborGlobal = document.getElementById('include-labor')?.checked;
    const includeExtraFees = document.getElementById('include-extra-fees')?.checked;
    const tvaRate = parseFloat(document.getElementById('tva-rate')?.value) || 0;
    const laborValueGlobal = parseFloat(document.getElementById('labor-value')?.value) || 0;
    const laborTypeGlobal = document.getElementById('labor-type')?.value;
    const extraFeesValue = parseFloat(document.getElementById('extra-fees-value')?.value) || 0;
    const extraFeesType = document.getElementById('extra-fees-type')?.value;
    const customLaborTextChecked = document.getElementById('custom-labor-text')?.checked;
    const customLaborTextValue = document.getElementById('custom-labor-text-value')?.value.trim();

    const container = document.getElementById('preview-tables-container');
    if (container) container.innerHTML = '';

    let sections = [];
    let currentSection = null;
    let itemIndex = 1;

    rows.forEach((row) => {
        if (row.classList.contains('section-row')) {
            const titleInput = row.querySelector('.section-title');
            const title = titleInput ? titleInput.value.trim() : 'SECTION';
            let optionsRow = row.nextElementSibling;
            let sectionOptions = {
                enabled: false,
                laborValue: 0,
                laborType: 'percentage'
            };
            if (optionsRow && optionsRow.classList.contains('section-option-row')) {
                const checkbox = optionsRow.querySelector('.section-labor-checkbox');
                const laborVal = optionsRow.querySelector('.section-labor-value');
                const laborTyp = optionsRow.querySelector('.section-labor-type');
                sectionOptions.enabled = checkbox ? checkbox.checked : false;
                sectionOptions.laborValue = laborVal ? parseFloat(laborVal.value) || 0 : 0;
                sectionOptions.laborType = laborTyp ? laborTyp.value : 'percentage';
            }
            currentSection = {
                title: title,
                items: [],
                options: sectionOptions,
                totalHT: 0,
                laborAmount: 0,
                totalWithLabor: 0
            };
            sections.push(currentSection);
        } else if (!row.classList.contains('section-option-row')) {
            const description = row.querySelector('.item-description')?.value.trim() || '';
            const unitSelect = row.querySelector('.item-unit');
            let unit = '';
            if (unitSelect) {
                const unitOption = unitSelect.options[unitSelect.selectedIndex];
                unit = unitOption.getAttribute('data-symbol') || 
                       unitOption.getAttribute('data-label') || 
                       unitOption.textContent.trim() || 
                       unitOption.value;
            } else {
                unit = 'piece';
            }
            const quantity = parseFloat(row.querySelector('.item-quantity')?.value) || 0;
            const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
            const totalCell = row.querySelector('.item-total');
            const total = totalCell ? parseFloat(totalCell.textContent) || 0 : quantity * price;
            if (description || quantity > 0 || price > 0) {
                totalHTGlobal += total;
                const item = { description, unit, quantity, price, total, currency, index: itemIndex++ };
                if (currentSection) {
                    currentSection.items.push(item);
                    currentSection.totalHT += total;
                } else {
                    if (sections.length === 0 || sections[sections.length-1].title !== 'Général') {
                        currentSection = {
                            title: 'Général',
                            items: [],
                            options: { enabled: false, laborValue: 0, laborType: 'percentage' },
                            totalHT: 0,
                            laborAmount: 0,
                            totalWithLabor: 0
                        };
                        sections.push(currentSection);
                    }
                    sections[sections.length-1].items.push(item);
                    sections[sections.length-1].totalHT += total;
                }
            }
        }
    });

    let totalLaborSections = 0;
    sections.forEach(section => {
        if (section.options.enabled) {
            if (section.options.laborType === 'percentage') {
                section.laborAmount = section.totalHT * (section.options.laborValue / 100);
            } else {
                section.laborAmount = section.options.laborValue;
            }
            totalLaborSections += section.laborAmount;
        }
        section.totalWithLabor = section.totalHT + section.laborAmount;
    });

    const laborAdjustment = laborTypeGlobal === 'percentage' ? totalHTGlobal * (laborValueGlobal / 100) : laborValueGlobal;
    const adjustedLaborGlobal = includeLaborGlobal ? laborAdjustment : 0;
    const extraFeesAdjustment = extraFeesType === 'percentage' ? totalHTGlobal * (extraFeesValue / 100) : extraFeesValue;
    const adjustedExtraFees = includeExtraFees ? extraFeesAdjustment : 0;
    const tva = includeTVA ? totalHTGlobal * (tvaRate / 100) : 0;
    const totalTTC = totalHTGlobal + tva + adjustedLaborGlobal + totalLaborSections + adjustedExtraFees;

    document.getElementById('total-ht').textContent = formatCurrency(totalHTGlobal, currency);
    document.getElementById('tva-amount').textContent = formatCurrency(tva, currency);
    const laborAmountElement = document.getElementById('labor-amount');
    if (includeLaborGlobal || totalLaborSections > 0) {
        const totalLabor = adjustedLaborGlobal + totalLaborSections;
        if (customLaborTextChecked && customLaborTextValue) {
            laborAmountElement.textContent = customLaborTextValue;
        } else {
            laborAmountElement.textContent = formatCurrency(totalLabor, currency);
        }
    } else {
        laborAmountElement.textContent = formatCurrency(0, currency);
    }
    document.getElementById('extra-fees-amount').textContent = formatCurrency(adjustedExtraFees, currency);
    document.getElementById('total-ttc').textContent = formatCurrency(totalTTC, currency);
    document.getElementById('tva-rate-preview').textContent = tvaRate;
    document.getElementById('tva-row').classList.toggle('hidden', !includeTVA);
    document.getElementById('labor-row').classList.toggle('hidden', !includeLaborGlobal && totalLaborSections === 0);
    document.getElementById('extra-fees-row').classList.toggle('hidden', !includeExtraFees);

    const tableStyle = document.getElementById('table-style')?.value || 'default';
    const tableClass = tableStyle !== 'default' ? `table-style-${tableStyle}` : '';

    if (sections.length > 0 && container) {
        const itemsPerPage = 15;
        let allRows = [];
        sections.forEach((section) => {
            allRows.push({ type: 'section', title: section.title });
            section.items.forEach(item => {
                allRows.push({ type: 'item', data: item });
            });
            allRows.push({ 
                type: 'sectionTotal', 
                labor: section.laborAmount, 
                total: section.totalWithLabor,
                currency: currency,
                enabled: section.options.enabled
            });
        });

        for (let i = 0; i < allRows.length; i += itemsPerPage) {
            const pageSlice = allRows.slice(i, i + itemsPerPage);
            const table = document.createElement('table');
            table.className = `preview-table ${tableClass}`;
            table.style.cssText = `
                border: 2px solid ${currentTheme === 'gold' ? '#d4a017' : currentTheme === 'blue' ? '#0984e3' : currentTheme === 'green' ? '#2ecc71' : currentTheme === 'purple' ? '#9b59b6' : currentTheme === 'orange' ? '#e67e22' : '#e74c3c'};
                border-collapse: collapse;
                margin: 10px 0;
                width: 100%;
                font-size: 12px;
            `;
            let tbodyHtml = '';
            pageSlice.forEach(row => {
                if (row.type === 'section') {
                    tbodyHtml += `
                        <tr style="background-color: #e9ecef; font-weight: bold;">
                            <td colspan="6" style="padding: 8px; border: 1px solid #d4a017; text-align: center; font-size: 13px; color: var(--dark-color);">
                                ${row.title}
                            </td>
                        </tr>
                    `;
                } else if (row.type === 'item') {
                    const item = row.data;
                    tbodyHtml += `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 10px;">${item.index}</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 10px;">${item.description}</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 10px;">${item.unit}</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 10px;">${item.quantity}</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 10px;">${formatCurrency(item.price, item.currency)}</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 10px;">${formatCurrency(item.total, item.currency)}</td>
                        </tr>
                    `;
                } else if (row.type === 'sectionTotal') {
                    let laborText = row.enabled ? `Main-d'œuvre: ${formatCurrency(row.labor, row.currency)}` : '';
                    let totalText = `Total section: ${formatCurrency(row.total, row.currency)}`;
                    tbodyHtml += `
                        <tr style="background-color: #fff3cd; font-weight: 600;">
                            <td colspan="3" style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-size: 11px;">
                                ${laborText}
                            </td>
                            <td colspan="3" style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-size: 11px; color: var(--primary-color);">
                                ${totalText}
                            </td>
                        </tr>
                    `;
                }
            });
            table.innerHTML = `
                <thead style="background: linear-gradient(to right, ${currentThemeColors()}); color: white;">
                    <tr>
                        <th style="padding: 8px; border: 1px solid ${currentTheme === 'gold' ? '#d4a017' : currentTheme === 'blue' ? '#0984e3' : currentTheme === 'green' ? '#2ecc71' : currentTheme === 'purple' ? '#9b59b6' : currentTheme === 'orange' ? '#e67e22' : '#e74c3c'}; font-size: 10px;" width="5%">N°</th>
                        <th style="padding: 8px; border: 1px solid ${currentTheme === 'gold' ? '#d4a017' : currentTheme === 'blue' ? '#0984e3' : currentTheme === 'green' ? '#2ecc71' : currentTheme === 'purple' ? '#9b59b6' : currentTheme === 'orange' ? '#e67e22' : '#e74c3c'}; font-size: 10px;" width="45%">Description</th>
                        <th style="padding: 8px; border: 1px solid ${currentTheme === 'gold' ? '#d4a017' : currentTheme === 'blue' ? '#0984e3' : currentTheme === 'green' ? '#2ecc71' : currentTheme === 'purple' ? '#9b59b6' : currentTheme === 'orange' ? '#e67e22' : '#e74c3c'}; font-size: 10px;" width="15%">Unité</th>
                        <th style="padding: 8px; border: 1px solid ${currentTheme === 'gold' ? '#d4a017' : currentTheme === 'blue' ? '#0984e3' : currentTheme === 'green' ? '#2ecc71' : currentTheme === 'purple' ? '#9b59b6' : currentTheme === 'orange' ? '#e67e22' : '#e74c3c'}; font-size: 10px;" width="10%">Qté</th>
                        <th style="padding: 8px; border: 1px solid ${currentTheme === 'gold' ? '#d4a017' : currentTheme === 'blue' ? '#0984e3' : currentTheme === 'green' ? '#2ecc71' : currentTheme === 'purple' ? '#9b59b6' : currentTheme === 'orange' ? '#e67e22' : '#e74c3c'}; font-size: 10px;" width="15%">Prix unitaire</th>
                        <th style="padding: 8px; border: 1px solid ${currentTheme === 'gold' ? '#d4a017' : currentTheme === 'blue' ? '#0984e3' : currentTheme === 'green' ? '#2ecc71' : currentTheme === 'purple' ? '#9b59b6' : currentTheme === 'orange' ? '#e67e22' : '#e74c3c'}; font-size: 10px;" width="10%">Sous-total</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbodyHtml}
                </tbody>
            `;
            container.appendChild(table);
            if (i + itemsPerPage < allRows.length) {
                const continuationMessage = document.createElement('div');
                continuationMessage.className = 'continuation-message';
                continuationMessage.style.cssText = `
                    margin: 20px auto;
                    padding: 15px;
                    width: 85%;
                    text-align: center;
                    background: linear-gradient(145deg, ${currentThemeColors()});
                    color: white;
                    font-family: Helvetica, sans-serif;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 10px;
                    box-shadow: 0 8px 15px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                `;
                continuationMessage.innerHTML = `
                    Suite sur la page suivante
                    <i class="fas fa-arrow-right" style="font-size: 18px; animation: pulse 1.5s infinite;"></i>
                `;
                container.appendChild(continuationMessage);
            }
        }
    }

    rows.forEach(row => {
        if (row.classList.contains('section-option-row')) {
            const sectionRow = row.previousElementSibling;
            if (sectionRow && sectionRow.classList.contains('section-row')) {
                const titleInput = sectionRow.querySelector('.section-title');
                const sectionTitle = titleInput ? titleInput.value.trim() : 'SECTION';
                const section = sections.find(s => s.title === sectionTitle);
                if (section) {
                    const totalSpan = row.querySelector('.section-total-display');
                    if (totalSpan) {
                        totalSpan.textContent = formatCurrency(section.totalWithLabor, currency);
                    }
                }
            }
        }
    });

    const qrCodeDiv = document.getElementById('qr-code');
    if (qrCodeDiv) {
        try {
            const qr = qrcode(0, 'M');
            qr.addData(`CTL-POWER
Devis n° ${document.getElementById('invoice-number-preview')?.textContent || '2023-001'}
Total : ${formatCurrency(totalTTC, currency)}
Site web : https://ctlpower.com/
Facebook : https://www.facebook.com/profile.php?id=100084738536892
Tél : +237 6 80 04 01 45 / +237 6 93 72 81 10
Email : ctlpowerr@gmail.com`);
            qr.make();
            qrCodeDiv.innerHTML = `<div style="border: 2px solid ${currentTheme === 'gold' ? '#d4a017' : currentTheme === 'blue' ? '#0984e3' : currentTheme === 'green' ? '#2ecc71' : currentTheme === 'purple' ? '#9b59b6' : currentTheme === 'orange' ? '#e67e22' : '#e74c3c'}; padding: 5px; display: inline-block;">${qr.createImgTag(3)}</div>`;
        } catch (e) {
            console.error('Erreur QR code', e);
        }
    }
}

function currentThemeColors() {
    switch(currentTheme) {
        case 'gold': return '#d4a017, #b58900';
        case 'blue': return '#0984e3, #0652dd';
        case 'green': return '#2ecc71, #27ae60';
        case 'purple': return '#9b59b6, #8e44ad';
        case 'orange': return '#e67e22, #d35400';
        case 'red': return '#e74c3c, #c0392b';
        default: return '#d4a017, #b58900';
    }
}

function updateInvoicePreview() {
    const companyName = document.getElementById('company-name')?.value;
    const companyNameDisplay = document.getElementById('company-name-display');
    const companyNameSignature = document.getElementById('company-name-signature');
    if (companyNameDisplay) {
        companyNameDisplay.textContent = companyName || 'CTL-POWER';
        companyNameDisplay.classList.remove('hidden');
        companyNameDisplay.style.background = 'white';
        companyNameDisplay.style.padding = '5px 10px';
        companyNameDisplay.style.borderRadius = '4px';
        companyNameDisplay.style.display = 'inline-block';
    }
    if (companyNameSignature) {
        companyNameSignature.textContent = 'Pour ' + (companyName || 'CTL-POWER');
    }

    const fields = {
        'company-address': ['company-address-preview', '123 Rue Exemple'],
        'company-city': ['company-city-preview', '75000 DOUALA, Cameroun'],
        'company-phone': ['company-phone-preview', 'Tél: +237 6 80 04 01 45', 'Tél: '],
        'company-email': ['company-email-preview', 'Email: ctlpowerr@gmail.com', 'Email: '],
        'company-siret': ['company-siret-preview', 'N° fiscal: 123 456 789 00010', 'N° fiscal: '],
        'client-name': ['client-name-preview', 'Nom du client'],
        'client-address': ['client-address-preview', 'Adresse du client'],
        'client-phone': ['client-phone-preview', 'Téléphone'],
        'client-email': ['client-email-preview', 'Email'],
        'invoice-number': ['invoice-number-preview', '2026-001'],
        'reference': ['reference-preview-container', 'PROJ-2026-001', 'Référence : ', 'reference-preview'],
        'invoice-title-input': ['custom-title-preview', '']
    };
    Object.entries(fields).forEach(([inputId, [previewId, defaultValue, prefix = '', textId = previewId]]) => {
        const value = document.getElementById(inputId)?.value;
        const element = document.getElementById(textId);
        if (element) {
            toggleVisibility(textId, value, defaultValue, prefix);
            element.style.fontSize = '12px';
        }
    });

    const mainTitle = document.getElementById('invoice-main-title')?.value || 'DEVIS';
    document.getElementById('main-invoice-title').textContent = mainTitle;

    const invoiceDate = document.getElementById('invoice-date')?.value;
    const validity = document.getElementById('validity')?.value;
    const paymentMethod = document.getElementById('payment-method')?.value;
    const currency = document.getElementById('currency')?.value;
    if (document.getElementById('invoice-date-preview')) {
        document.getElementById('invoice-date-preview').textContent = formatDate(invoiceDate) || '01/01/2023';
        document.getElementById('invoice-date-preview').style.fontSize = '12px';
    }
    if (document.getElementById('validity-preview')) {
        document.getElementById('validity-preview').textContent = validity || '30';
        document.getElementById('validity-preview').style.fontSize = '12px';
    }
    if (document.getElementById('payment-method-preview')) {
        document.getElementById('payment-method-preview').textContent = paymentMethod || 'Virement';
        document.getElementById('payment-method-preview').style.fontSize = '12px';
    }
    if (document.getElementById('currency-preview')) {
        const currencyDisplay = getCurrencySymbol(currency);
        document.getElementById('currency-preview').textContent = currencyDisplay;
        document.getElementById('currency-preview').style.fontSize = '12px';
    }

    const showValidity = document.getElementById('show-validity')?.checked;
    const validityContainer = document.getElementById('validity-preview-container');
    if (validityContainer) {
        validityContainer.style.display = showValidity ? 'block' : 'none';
    }

    const notes = document.getElementById('notes')?.value;
    const notesContainer = document.getElementById('notes-preview-container');
    const notesPreview = document.getElementById('notes-preview');
    if (notesContainer && notesPreview) {
        notesContainer.classList.toggle('hidden', !notes);
        notesPreview.innerHTML = notes ? notes.replace(/\n/g, '<br>') : '';
        notesPreview.style.fontSize = '12px';
    }

    const templateStyle = document.getElementById('template-style')?.value || 'elegant';
    const previewElement = document.getElementById('invoice-preview');
    previewElement.classList.remove('template-entreprise', 'template-innovant', 'template-ctl', 'template-elegant');
    if (templateStyle !== 'elegant') {
        previewElement.classList.add(`template-${templateStyle}`);
    }

    calculateDatas();
    updateStampPreview();
    updateWatermarkPreview();
}

// ==================== GESTION DE L'HISTORIQUE ====================
function collectInvoiceData() {
    const items = [];
    const rows = document.querySelectorAll('#items-table-body tr');
    rows.forEach(row => {
        if (row.classList.contains('section-row')) {
            const titleInput = row.querySelector('.section-title');
            const title = titleInput ? titleInput.value : '';
            items.push({ type: 'section', title: title });
        } else if (row.classList.contains('section-option-row')) {
            const checkbox = row.querySelector('.section-labor-checkbox');
            const laborValue = row.querySelector('.section-labor-value')?.value;
            const laborType = row.querySelector('.section-labor-type')?.value;
            items.push({ 
                type: 'sectionOptions', 
                enabled: checkbox ? checkbox.checked : false,
                laborValue: laborValue || '0',
                laborType: laborType || 'percentage'
            });
        } else {
            const description = row.querySelector('.item-description')?.value || '';
            const unitSelect = row.querySelector('.item-unit');
            const unit = unitSelect ? unitSelect.value : 'piece';
            const quantity = row.querySelector('.item-quantity')?.value || '1';
            const price = row.querySelector('.item-price')?.value || '0';
            items.push({ 
                type: 'item',
                description: description,
                unit: unit,
                quantity: quantity,
                price: price
            });
        }
    });

    return {
        company: {
            name: document.getElementById('company-name')?.value,
            address: document.getElementById('company-address')?.value,
            city: document.getElementById('company-city')?.value,
            phone: document.getElementById('company-phone')?.value,
            email: document.getElementById('company-email')?.value,
            siret: document.getElementById('company-siret')?.value,
            logo: document.getElementById('company-logo-preview')?.src
        },
        client: {
            name: document.getElementById('client-name')?.value,
            address: document.getElementById('client-address')?.value,
            phone: document.getElementById('client-phone')?.value,
            email: document.getElementById('client-email')?.value
        },
        invoice: {
            title: document.getElementById('invoice-title-input')?.value,
            number: document.getElementById('invoice-number')?.value,
            reference: document.getElementById('reference')?.value,
            date: document.getElementById('invoice-date')?.value,
            validity: document.getElementById('validity')?.value,
            showValidity: document.getElementById('show-validity')?.checked,
            paymentMethod: document.getElementById('payment-method')?.value,
            currency: document.getElementById('currency')?.value,
            mainTitle: document.getElementById('invoice-main-title')?.value
        },
        options: {
            includeTva: document.getElementById('include-tva')?.checked,
            tvaRate: document.getElementById('tva-rate')?.value,
            includeLabor: document.getElementById('include-labor')?.checked,
            laborValue: document.getElementById('labor-value')?.value,
            laborType: document.getElementById('labor-type')?.value,
            customLaborText: document.getElementById('custom-labor-text')?.checked,
            customLaborTextValue: document.getElementById('custom-labor-text-value')?.value,
            includeExtraFees: document.getElementById('include-extra-fees')?.checked,
            extraFeesValue: document.getElementById('extra-fees-value')?.value,
            extraFeesType: document.getElementById('extra-fees-type')?.value
        },
        design: {
            templateStyle: document.getElementById('template-style')?.value,
            colorScheme: document.getElementById('color-scheme')?.value,
            fontFamily: document.getElementById('font-family')?.value,
            tableStyle: document.getElementById('table-style')?.value
        },
        notes: document.getElementById('notes')?.value,
        items: items,
        stamp: {
            image: stampData.image,
            xPercent: stampData.xPercent,
            yPercent: stampData.yPercent,
            size: stampData.size,
            opacity: stampData.opacity
        },
        watermark: {
            type: watermarkData.type,
            text: watermarkData.text,
            image: watermarkData.image,
            xPercent: watermarkData.xPercent,
            yPercent: watermarkData.yPercent,
            size: watermarkData.size,
            opacity: watermarkData.opacity,
            rotation: watermarkData.rotation
        }
    };
}

function saveToHistory() {
    const invoiceData = {
        id: Date.now(),
        date: new Date().toLocaleString('fr-FR'),
        data: collectInvoiceData()
    };
    const invoiceHistory = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
    invoiceHistory.push(invoiceData);
    localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory));
    alert('Devis enregistré dans l’historique.');
}

function restoreInvoice(data) {
    // Remplir tous les champs avec les données fournies
    // Entreprise
    if (data.company) {
        document.getElementById('company-name').value = data.company.name || '';
        document.getElementById('company-address').value = data.company.address || '';
        document.getElementById('company-city').value = data.company.city || '';
        document.getElementById('company-phone').value = data.company.phone || '';
        document.getElementById('company-email').value = data.company.email || '';
        document.getElementById('company-siret').value = data.company.siret || '';
        if (data.company.logo) document.getElementById('company-logo-preview').src = data.company.logo;
    }

    // Client
    if (data.client) {
        document.getElementById('client-name').value = data.client.name || '';
        document.getElementById('client-address').value = data.client.address || '';
        document.getElementById('client-phone').value = data.client.phone || '';
        document.getElementById('client-email').value = data.client.email || '';
    }

    // Détails
    if (data.invoice) {
        document.getElementById('invoice-title-input').value = data.invoice.title || '';
        document.getElementById('invoice-number').value = data.invoice.number || '';
        document.getElementById('reference').value = data.invoice.reference || '';
        document.getElementById('invoice-date').value = data.invoice.date || '';
        document.getElementById('validity').value = data.invoice.validity || '30';
        document.getElementById('show-validity').checked = data.invoice.showValidity !== undefined ? data.invoice.showValidity : true;
        document.getElementById('payment-method').value = data.invoice.paymentMethod || 'Virement';
        document.getElementById('currency').value = data.invoice.currency || 'XAF';
        document.getElementById('invoice-main-title').value = data.invoice.mainTitle || 'DEVIS';
    }

    // Options
    if (data.options) {
        document.getElementById('include-tva').checked = data.options.includeTva || false;
        document.getElementById('tva-rate').value = data.options.tvaRate || '20';
        document.getElementById('include-labor').checked = data.options.includeLabor || false;
        document.getElementById('labor-value').value = data.options.laborValue || '0';
        document.getElementById('labor-type').value = data.options.laborType || 'percentage';
        document.getElementById('custom-labor-text').checked = data.options.customLaborText || false;
        document.getElementById('custom-labor-text-value').value = data.options.customLaborTextValue || '';
        document.getElementById('include-extra-fees').checked = data.options.includeExtraFees || false;
        document.getElementById('extra-fees-value').value = data.options.extraFeesValue || '0';
        document.getElementById('extra-fees-type').value = data.options.extraFeesType || 'percentage';
    }

    // Design
    if (data.design) {
        document.getElementById('template-style').value = data.design.templateStyle || 'elegant';
        document.getElementById('color-scheme').value = data.design.colorScheme || 'gold';
        document.getElementById('font-family').value = data.design.fontFamily || 'Source Sans Pro';
        document.getElementById('table-style').value = data.design.tableStyle || 'default';
        applyTheme(data.design.colorScheme || 'gold');
    }

    // Notes
    document.getElementById('notes').value = data.notes || '';

    // Tampon
    if (data.stamp) {
        stampData.image = data.stamp.image || null;
        stampData.xPercent = data.stamp.xPercent || 80;
        stampData.yPercent = data.stamp.yPercent || 90;
        stampData.size = data.stamp.size || 50;
        stampData.opacity = data.stamp.opacity || 1;
        document.getElementById('stamp-size').value = stampData.size;
        document.getElementById('stamp-size-value').textContent = stampData.size + ' mm';
        document.getElementById('stamp-opacity').value = stampData.opacity;
        document.getElementById('stamp-opacity-value').textContent = Math.round(stampData.opacity * 100) + '%';
    } else {
        stampData.image = null;
    }

    // Filigrane
    if (data.watermark) {
        watermarkData.type = data.watermark.type || 'none';
        watermarkData.text = data.watermark.text || '';
        watermarkData.image = data.watermark.image || null;
        watermarkData.xPercent = data.watermark.xPercent || 50;
        watermarkData.yPercent = data.watermark.yPercent || 50;
        watermarkData.size = data.watermark.size || 50;
        watermarkData.opacity = data.watermark.opacity || 0.3;
        watermarkData.rotation = data.watermark.rotation || 45;
        document.getElementById('watermark-type').value = watermarkData.type;
        document.getElementById('watermark-text').value = watermarkData.text;
        document.getElementById('watermark-size').value = watermarkData.size;
        document.getElementById('watermark-size-value').textContent = watermarkData.size + ' mm';
        document.getElementById('watermark-opacity').value = watermarkData.opacity;
        document.getElementById('watermark-opacity-value').textContent = watermarkData.opacity;
        document.getElementById('watermark-rotation').value = watermarkData.rotation;
        document.getElementById('watermark-rotation-value').textContent = watermarkData.rotation + '°';
        toggleWatermarkInputs();
    } else {
        watermarkData.type = 'none';
    }

    // Reconstruction du tableau des prestations
    const tbody = document.getElementById('items-table-body');
    tbody.innerHTML = '';
    if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
            if (item.type === 'section') {
                const trSection = document.createElement('tr');
                trSection.className = 'section-row';
                trSection.innerHTML = `
                    <td colspan="5" style="padding: 8px; background-color: #f0f2f5; text-align: center; vertical-align: middle;">
                        <input type="text" class="form-control section-title" value="${item.title || ''}" 
                               style="text-align: center; font-weight: bold; background-color: #f0f2f5; border: 1px solid var(--primary-color); width: 100%;">
                    </td>
                    <td style="padding: 8px; background-color: #f0f2f5; text-align: center; vertical-align: middle;">
                        <div style="display: flex; gap: 5px; justify-content: center;">
                            <button class="btn btn-success btn-sm add-item-in-section" title="Ajouter un article dans cette section"><i class="fas fa-plus"></i></button>
                            <button class="btn btn-danger btn-sm remove-section"><i class="fas fa-trash"></i> Section</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(trSection);
            } else if (item.type === 'sectionOptions') {
                const trOptions = document.createElement('tr');
                trOptions.className = 'section-option-row';
                trOptions.innerHTML = `
                    <td colspan="4" style="padding: 8px; background-color: #fafbfc; text-align: left; vertical-align: middle;">
                        <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 5px;">
                                <input type="checkbox" class="section-labor-checkbox" ${item.enabled ? 'checked' : ''}>
                                <label style="font-weight: 600; margin: 0;">Main-d'œuvre section</label>
                            </div>
                            <div style="display: flex; align-items: center; gap: 5px;">
                                <input type="number" class="form-control section-labor-value" value="${item.laborValue}" min="0" step="0.01" style="width: 80px;" ${item.enabled ? '' : 'disabled'}>
                                <select class="form-control section-labor-type" style="width: 70px;" ${item.enabled ? '' : 'disabled'}>
                                    <option value="percentage" ${item.laborType === 'percentage' ? 'selected' : ''}>%</option>
                                    <option value="fixed" ${item.laborType === 'fixed' ? 'selected' : ''}>Montant fixe</option>
                                </select>
                            </div>
                            <span style="font-weight: 600;">Sous-total section :</span>
                            <span class="section-total-display" style="font-weight: 700; color: var(--primary-color);">0.00 FCFA</span>
                        </div>
                    </td>
                    <td colspan="2" style="padding: 8px; background-color: #fafbfc; text-align: right; vertical-align: middle;">
                        <button class="btn btn-danger btn-sm remove-section-options" style="background: #e74c3c; padding: 6px 12px;"><i class="fas fa-trash-alt"></i> Supprimer options</button>
                    </td>
                `;
                tbody.appendChild(trOptions);
                attachSectionOptionsListeners(trOptions);
            } else if (item.type === 'item') {
                const trItem = document.createElement('tr');
                trItem.innerHTML = `
                    <td><input type="text" class="form-control item-description" value="${item.description || ''}"></td>
                    <td>
                        <select class="form-control item-unit">
                            <option value="piece" data-label="Pièce">Pièce</option>
                            <option value="liter" data-label="Litre">Litre</option>
                            <option value="meter" data-label="Mètre">Mètre</option>
                            <option value="kg" data-label="Kilogramme">Kilogramme</option>
                            <option value="hour" data-label="Heure">Heure</option>
                            <option value="day" data-label="Jour">Jour</option>
                            <option value="sqm" data-symbol="m²" data-label="Mètre carré">Mètre carré (m²)</option>
                            <option value="cbm" data-label="Mètre cube">Mètre cube</option>
                            <option value="ton" data-label="Tonne">Tonne</option>
                            <option value="flatrate" data-label="Forfait">Forfait</option>
                            <option value="service" data-label="Prestation">Prestation</option>
                            <option value="kit" data-label="Kit">Kit</option>
                            <option value="carton" data-label="Carton">Carton</option>
                            <option value="bottle" data-label="Bouteille">Bouteille</option>
                            <option value="roll" data-label="Rouleau">Rouleau</option>
                            <option value="bag" data-label="Sac">Sac</option>
                            <option value="box" data-label="Boîte">Boîte</option>
                            <option value="set" data-label="Set">Set</option>
                            <option value="pack" data-label="Pack">Pack</option>
                            <option value="bucket" data-label="Seau">Seau</option>
                            <option value="barrel" data-label="Baril">Baril</option>
                            <option value="pallet" data-label="Palette">Palette</option>
                            <option value="dozen" data-label="Douzaine">Douzaine</option>
                            <option value="pair" data-label="Paire">Paire</option>
                        </select>
                    </td>
                    <td><input type="number" class="form-control item-quantity" value="${item.quantity || 1}" min="1"></td>
                    <td><input type="number" class="form-control item-price" value="${item.price || 0}" step="0.01"></td>
                    <td class="item-total">${(parseFloat(item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2)}</td>
                    <td><button class="btn btn-danger btn-sm remove-item"><i class="fas fa-trash"></i> Suppr</button></td>
                `;
                tbody.appendChild(trItem);
                const unitSelect = trItem.querySelector('.item-unit');
                if (unitSelect && item.unit) unitSelect.value = item.unit;
            }
        });
    } else {
        // Ligne par défaut
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="form-control item-description" value="câble vgv 2,5 mm"></td>
            <td>
                <select class="form-control item-unit">
                    <option value="piece" data-label="Pièce">Pièce</option>
                    <option value="liter" data-label="Litre">Litre</option>
                    <option value="meter" data-label="Mètre">Mètre</option>
                    <option value="kg" data-label="Kilogramme">Kilogramme</option>
                    <option value="hour" data-label="Heure">Heure</option>
                    <option value="day" data-label="Jour">Jour</option>
                    <option value="sqm" data-symbol="m²" data-label="Mètre carré">Mètre carré (m²)</option>
                    <option value="cbm" data-label="Mètre cube">Mètre cube</option>
                    <option value="ton" data-label="Tonne">Tonne</option>
                    <option value="flatrate" data-label="Forfait">Forfait</option>
                    <option value="service" data-label="Prestation">Prestation</option>
                    <option value="kit" data-label="Kit">Kit</option>
                    <option value="carton" data-label="Carton">Carton</option>
                    <option value="bottle" data-label="Bouteille">Bouteille</option>
                    <option value="roll" data-label="Rouleau">Rouleau</option>
                    <option value="bag" data-label="Sac">Sac</option>
                    <option value="box" data-label="Boîte">Boîte</option>
                    <option value="set" data-label="Set">Set</option>
                    <option value="pack" data-label="Pack">Pack</option>
                    <option value="bucket" data-label="Seau">Seau</option>
                    <option value="barrel" data-label="Baril">Baril</option>
                    <option value="pallet" data-label="Palette">Palette</option>
                    <option value="dozen" data-label="Douzaine">Douzaine</option>
                    <option value="pair" data-label="Paire">Paire</option>
                </select>
            </td>
            <td><input type="number" class="form-control item-quantity" value="1" min="1"></td>
            <td><input type="number" class="form-control item-price" value="1200.00" step="0.01"></td>
            <td class="item-total">1200.00</td>
            <td><button class="btn btn-danger btn-sm remove-item"><i class="fas fa-trash"></i> Suppr</button></td>
        `;
        tbody.appendChild(tr);
    }

    attachRemoveListeners();
    attachInputListeners();
    attachAddItemInSectionListeners();
    updateInvoicePreview();
    updateStampPreview();
    updateWatermarkPreview();
    saveDefaultSettings(); // met à jour les préférences par défaut
}

function showHistoryModal() {
    const modal = document.getElementById('history-modal');
    const listContainer = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');

    if (history.length === 0) {
        listContainer.innerHTML = '<div class="empty-history">Aucun devis enregistré pour le moment.</div>';
    } else {
        let html = '';
        history.forEach((item, index) => {
            const clientName = item.data?.client?.name || 'Client inconnu';
            const invoiceNumber = item.data?.invoice?.number || 'N° inconnu';
            const total = item.data ? formatCurrency(parseFloat(item.data?.invoice?.totalTTC?.replace(/[^0-9]/g, '')) || 0, item.data?.invoice?.currency || 'XAF') : '0';
            html += `
                <div class="history-item">
                    <div class="history-item-info">
                        <p><strong>${invoiceNumber}</strong> - ${clientName}</p>
                        <p>Date: ${item.date} | Total: ${total}</p>
                    </div>
                    <div class="history-actions">
                        <button class="btn btn-primary btn-sm load-history" data-index="${index}"><i class="fas fa-folder-open"></i> Charger</button>
                        <button class="btn btn-danger btn-sm delete-history" data-index="${index}"><i class="fas fa-trash"></i> Supprimer</button>
                    </div>
                </div>
            `;
        });
        listContainer.innerHTML = html;

        listContainer.querySelectorAll('.load-history').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.getAttribute('data-index');
                loadInvoiceFromHistory(parseInt(idx));
                modal.classList.remove('active');
            });
        });

        listContainer.querySelectorAll('.delete-history').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.getAttribute('data-index');
                deleteFromHistory(parseInt(idx));
                showHistoryModal(); // rafraîchir
            });
        });
    }

    modal.classList.add('active');
}

function loadInvoiceFromHistory(index) {
    const history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
    if (history[index]) {
        restoreInvoice(history[index].data);
    }
}

function deleteFromHistory(index) {
    const history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
    if (index >= 0 && index < history.length) {
        history.splice(index, 1);
        localStorage.setItem('invoiceHistory', JSON.stringify(history));
    }
}

function resetForm() {
    if (confirm('Réinitialiser le formulaire ? Toutes les données seront perdues.')) {
        document.querySelector('form')?.reset();
        const tbody = document.getElementById('items-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td><input type="text" class="form-control item-description" placeholder="Description"></td>
                    <td>
                        <select class="form-control item-unit">
                            <option value="piece" data-label="Pièce">Pièce</option>
                            <option value="liter" data-label="Litre">Litre</option>
                            <option value="meter" data-label="Mètre">Mètre</option>
                            <option value="kg" data-label="Kilogramme">Kilogramme</option>
                            <option value="hour" data-label="Heure">Heure</option>
                            <option value="day" data-label="Jour">Jour</option>
                            <option value="sqm" data-symbol="m²" data-label="Mètre carré">Mètre carré (m²)</option>
                            <option value="cbm" data-label="Mètre cube">Mètre cube</option>
                            <option value="ton" data-label="Tonne">Tonne</option>
                            <option value="flatrate" data-label="Forfait">Forfait</option>
                            <option value="service" data-label="Prestation">Prestation</option>
                            <option value="kit" data-label="Kit">Kit</option>
                            <option value="carton" data-label="Carton">Carton</option>
                            <option value="bottle" data-label="Bouteille">Bouteille</option>
                            <option value="roll" data-label="Rouleau">Rouleau</option>
                            <option value="bag" data-label="Sac">Sac</option>
                            <option value="box" data-label="Boîte">Boîte</option>
                            <option value="set" data-label="Set">Set</option>
                            <option value="pack" data-label="Pack">Pack</option>
                            <option value="bucket" data-label="Seau">Seau</option>
                            <option value="barrel" data-label="Baril">Baril</option>
                            <option value="pallet" data-label="Palette">Palette</option>
                            <option value="dozen" data-label="Douzaine">Douzaine</option>
                            <option value="pair" data-label="Paire">Paire</option>
                        </select>
                    </td>
                    <td><input type="number" class="form-control item-quantity" placeholder="1" min="1"></td>
                    <td><input type="number" class="form-control item-price" placeholder="0.00" step="0.01"></td>
                    <td class="item-total">0.00</td>
                    <td><button class="btn btn-danger btn-sm remove-item"><i class="fas fa-trash"></i> Suppr</button></td>
                </tr>
            `;
        }
        const logoPreview = document.getElementById('company-logo-preview');
        if (logoPreview) {
            logoPreview.src = 'https://via.placeholder.com/80x80?text=LOGO';
        }
        const checkboxes = ['include-labor'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = true;
        });
        const includeTva = document.getElementById('include-tva');
        if (includeTva) includeTva.checked = false;
        const includeExtraFees = document.getElementById('include-extra-fees');
        if (includeExtraFees) includeExtraFees.checked = false;
        const customLaborText = document.getElementById('custom-labor-text');
        if (customLaborText) customLaborText.checked = false;
        const inputs = {
            'tva-rate': '20',
            'labor-value': '0',
            'extra-fees-value': '0',
            'custom-labor-text-value': ''
        };
        Object.entries(inputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) input.value = value;
        });
        const selects = ['labor-type', 'extra-fees-type'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select) select.value = 'percentage';
        });
        const companyNameDisplay = document.getElementById('company-name-display');
        companyNameDisplay.textContent = 'CTL-POWER';
        companyNameDisplay.style.background = 'white';
        companyNameDisplay.style.padding = '5px 10px';
        companyNameDisplay.style.borderRadius = '4px';
        document.getElementById('company-name-signature').textContent = 'Pour CTL-POWER';
        removeStamp();
        removeWatermark();
        toggleOptionInputs();
        loadDefaultSettings();
        updateInvoicePreview();
        attachRemoveListeners();
    }
}

function showModernCountdownTimer() {
    let countdownOverlay = document.getElementById('countdown-overlay');
    if (countdownOverlay) {
        countdownOverlay.remove();
    }
    countdownOverlay = document.createElement('div');
    countdownOverlay.id = 'countdown-overlay';
    countdownOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease-in;
    `;
    const countdownContainer = document.createElement('div');
    countdownContainer.style.cssText = `
        padding: 25px 40px;
        background: linear-gradient(145deg, ${currentThemeColors()});
        border: 2px solid ${currentTheme === 'gold' ? '#b58900' : currentTheme === 'blue' ? '#0652dd' : currentTheme === 'green' ? '#27ae60' : currentTheme === 'purple' ? '#8e44ad' : currentTheme === 'orange' ? '#d35400' : '#c0392b'};
        border-radius: 15px;
        box-shadow: 0 15px 30px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.3);
        transform: perspective(1200px) rotateX(15deg) rotateY(5deg);
        color: white;
        font-family: Helvetica, sans-serif;
        font-weight: bold;
        font-size: 24px;
        text-align: center;
        animation: float 2s ease-in-out infinite;
    `;
    countdownContainer.innerHTML = `
        <div id="countdown-text" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.7), -1px -1px 2px rgba(255,255,255,0.3);">
            Génération : <span id="countdown-timer">0.0</span>s
        </div>
        <div style="margin-top: 15px; font-size: 16px; font-weight: normal; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
            Création de votre devis professionnel...
        </div>
    `;
    countdownOverlay.appendChild(countdownContainer);
    document.body.appendChild(countdownOverlay);
    const timerElement = document.getElementById('countdown-timer');
    const startTime = performance.now();
    function updateTimer() {
        const elapsed = (performance.now() - startTime) / 1000;
        if (timerElement) {
            timerElement.textContent = elapsed.toFixed(1);
        }
        return requestAnimationFrame(updateTimer);
    }
    const animationFrame = updateTimer();
    return () => {
        cancelAnimationFrame(animationFrame);
        if (countdownOverlay) {
            countdownOverlay.remove();
        }
    };
}

function showBorderStyleModal(callback) {
    const modal = document.createElement('div');
    modal.id = 'border-style-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        max-width: 700px;
        width: 90%;
        text-align: center;
        font-family: Helvetica, sans-serif;
    `;
    modalContent.innerHTML = `
        <h2 style="margin-bottom: 15px; color: ${getCssVariable('--primary-color')};">Choisissez un style de bordure pour le devis</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; justify-content: center;">
            <button class="border-option" data-style="simple" style="padding: 12px; background: ${getCssVariable('--primary-color')}; color: white; border: none; border-radius: 5px; cursor: pointer;">Bordure simple</button>
            <button class="border-option" data-style="gradient" style="padding: 12px; background: linear-gradient(to right, ${getCssVariable('--primary-color')}, ${getCssVariable('--secondary-color')}); color: white; border: none; border-radius: 5px; cursor: pointer;">Bordure dégradée</button>
            <button class="border-option border-option-double" data-style="double" style="padding: 12px; background: ${getCssVariable('--primary-color')}; color: white; border: none; border-radius: 5px; cursor: pointer; animation: shineDouble 2s infinite, pulseDouble 1.5s infinite;">✨ Double bordure ✨</button>
            <button class="border-option" data-style="neon" style="padding: 12px; background: ${getCssVariable('--primary-color')}; color: white; border: none; border-radius: 5px; cursor: pointer; box-shadow: 0 0 8px ${getCssVariable('--primary-color')};">Bordure néon</button>
            <button class="border-option" data-style="geometric" style="padding: 12px; background: linear-gradient(to right, ${getCssVariable('--primary-color')}, ${getCssVariable('--secondary-color')}); color: white; border: none; border-radius: 5px; cursor: pointer;">Bordure géométrique</button>
            <button class="border-option" data-style="floating" style="padding: 12px; background: ${getCssVariable('--primary-color')}; color: white; border: none; border-radius: 5px; cursor: pointer; box-shadow: 3px 3px 8px rgba(0,0,0,0.3);">Bordure flottante</button>
            <button class="border-option" data-style="wavy" style="padding: 12px; background: ${getCssVariable('--primary-color')}; color: white; border: none; border-radius: 5px; cursor: pointer;">Bordure ondulée</button>
            <button class="border-option" data-style="metallic" style="padding: 12px; background: linear-gradient(to right, ${getCssVariable('--primary-color')}, #ffffff, ${getCssVariable('--secondary-color')}); color: white; border: none; border-radius: 5px; cursor: pointer;">Bordure métallique</button>
            <button class="border-option" data-style="futuristic" style="padding: 12px; background: ${getCssVariable('--primary-color')}; color: white; border: none; border-radius: 5px; cursor: pointer; box-shadow: 0 0 5px ${getCssVariable('--secondary-color')};">Bordure futuriste</button>
            <button class="border-option" data-style="none" style="padding: 12px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">Aucune bordure</button>
        </div>
        <button id="cancel-border" style="margin-top: 20px; padding: 12px 25px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Annuler</button>
    `;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    document.querySelectorAll('.border-option').forEach(button => {
        button.addEventListener('click', () => {
            const style = button.getAttribute('data-style');
            modal.remove();
            callback(style);
        });
    });
    document.getElementById('cancel-border').addEventListener('click', () => {
        modal.remove();
        callback(null);
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes shineDouble {
            0% { filter: brightness(1); }
            50% { filter: brightness(1.3); box-shadow: 0 0 15px gold; }
            100% { filter: brightness(1); }
        }
        @keyframes pulseDouble {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initResizer();
    loadDefaultSettings();

    const today = new Date().toISOString().split('T')[0];
    const invoiceDate = document.getElementById('invoice-date');
    if (invoiceDate) invoiceDate.value = today;
    const invoiceDatePreview = document.getElementById('invoice-date-preview');
    if (invoiceDatePreview) invoiceDatePreview.textContent = formatDate(today);

    setupTabNavigation();
    setupThemeSelector();
    handleLogoUpload();
    attachInputListeners();
    attachRemoveListeners();

    // Initialiser l'affichage du compteur
    updateGenerationDisplay();

    document.getElementById('load-example-btn').addEventListener('click', () => {
        const metier = document.getElementById('example-trade').value;
        if (metier) {
            loadExample(metier);
        } else {
            alert('Veuillez sélectionner un métier.');
        }
    });

    // Gestion du tampon
    document.getElementById('stamp-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                stampData.image = event.target.result;
                const img = new Image();
                img.onload = function() {
                    stampData.imageWidth = img.width;
                    stampData.imageHeight = img.height;
                    updateStampPreview();
                    saveDefaultSettings();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('stamp-size').addEventListener('input', function() {
        stampData.size = parseInt(this.value);
        document.getElementById('stamp-size-value').textContent = this.value + ' mm';
        updateStampPreview();
        saveDefaultSettings();
    });

    document.getElementById('stamp-opacity').addEventListener('input', function() {
        stampData.opacity = parseFloat(this.value);
        document.getElementById('stamp-opacity-value').textContent = Math.round(this.value * 100) + '%';
        updateStampPreview();
        saveDefaultSettings();
    });

    document.getElementById('stamp-remove-btn').addEventListener('click', removeStamp);

    // Gestion du filigrane
    document.getElementById('watermark-type').addEventListener('change', function() {
        watermarkData.type = this.value;
        toggleWatermarkInputs();
        if (watermarkData.type === 'none') {
            watermarkData.text = '';
            watermarkData.image = null;
            updateWatermarkPreview();
        } else if (watermarkData.type === 'text' && watermarkData.text) {
            updateWatermarkPreview();
        }
        saveDefaultSettings();
    });

    document.getElementById('watermark-text').addEventListener('input', function() {
        watermarkData.text = this.value;
        if (watermarkData.type === 'text') {
            updateWatermarkPreview();
        }
        saveDefaultSettings();
    });

    document.getElementById('watermark-size').addEventListener('input', function() {
        watermarkData.size = parseInt(this.value);
        document.getElementById('watermark-size-value').textContent = this.value + ' mm';
        if (watermarkData.type !== 'none') {
            updateWatermarkPreview();
        }
        saveDefaultSettings();
    });

    document.getElementById('watermark-opacity').addEventListener('input', function() {
        watermarkData.opacity = parseFloat(this.value);
        document.getElementById('watermark-opacity-value').textContent = this.value;
        if (watermarkData.type !== 'none') {
            updateWatermarkPreview();
        }
        saveDefaultSettings();
    });

    document.getElementById('watermark-rotation').addEventListener('input', function() {
        watermarkData.rotation = parseInt(this.value);
        document.getElementById('watermark-rotation-value').textContent = this.value + '°';
        if (watermarkData.type !== 'none') {
            updateWatermarkPreview();
        }
        saveDefaultSettings();
    });

    document.getElementById('watermark-image-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                watermarkData.image = event.target.result;
                const img = new Image();
                img.onload = function() {
                    watermarkData.imageWidth = img.width;
                    watermarkData.imageHeight = img.height;
                    if (watermarkData.type === 'image') {
                        updateWatermarkPreview();
                    }
                    saveDefaultSettings();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('watermark-remove-btn').addEventListener('click', removeWatermark);

    document.querySelector('.add-item')?.addEventListener('click', addItemRow);
    document.querySelector('.add-section')?.addEventListener('click', addSectionRow);
    document.querySelector('.add-section-first')?.addEventListener('click', addSectionFirst);

    document.getElementById('generate-pdf')?.addEventListener('click', generatePDF);
    document.getElementById('save-template')?.addEventListener('click', saveToHistory);
    document.getElementById('reset-form')?.addEventListener('click', resetForm);
    document.getElementById('load-history-btn')?.addEventListener('click', showHistoryModal);
    document.getElementById('close-history-modal')?.addEventListener('click', () => {
        document.getElementById('history-modal').classList.remove('active');
    });

    const autoSaveFields = [
        'company-name', 'company-address', 'company-city', 'company-phone', 'company-email', 'company-siret',
        'client-name', 'client-address', 'client-phone', 'client-email',
        'invoice-number', 'reference', 'invoice-date', 'validity', 'payment-method', 'currency',
        'notes', 'include-tva', 'tva-rate', 'include-labor', 'labor-value', 'labor-type',
        'custom-labor-text', 'custom-labor-text-value',
        'include-extra-fees', 'extra-fees-value', 'extra-fees-type',
        'invoice-main-title', 'template-style', 'color-scheme', 'font-family',
        'table-style'
    ];
    autoSaveFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', saveDefaultSettings);
            el.addEventListener('change', saveDefaultSettings);
        }
    });
    document.getElementById('company-logo')?.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('company-logo-preview').src = e.target.result;
                updateInvoicePreview();
                saveDefaultSettings();
            };
            reader.readAsDataURL(file);
        }
    });

    ['include-tva', 'include-labor', 'custom-labor-text', 'include-extra-fees', 'show-validity'].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                toggleOptionInputs();
                updateInvoicePreview();
                saveDefaultSettings();
            });
        }
    });

    ['tva-rate', 'labor-value', 'extra-fees-value', 'invoice-title-input', 'custom-labor-text-value'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', updateInvoicePreview);
    });

    ['labor-type', 'extra-fees-type', 'table-style', 'template-style'].forEach(id => {
        const select = document.getElementById(id);
        if (select) select.addEventListener('change', updateInvoicePreview);
    });

    toggleOptionInputs();
    toggleWatermarkInputs();
    updateInvoicePreview();

    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
            0% { transform: perspective(1200px) rotateX(15deg) rotateY(5deg) translateY(0); }
            50% { transform: perspective(1200px) rotateX(15deg) rotateY(5deg) translateY(-10px); }
            100% { transform: perspective(1200px) rotateX(15deg) rotateY(5deg) translateY(0); }
        }
        .border-option:hover {
            transform: scale(1.05);
            transition: transform 0.2s;
        }
        .highlight-total {
            font-size: 15px !important;
            font-weight: bold !important;
            color: ${getCssVariable('--primary-color')} !important;
            background-color: rgba(${hexToRgb(getCssVariable('--secondary-color'))}, 0.1) !important;
            padding: 5px 9px !important;
            border: 1px solid ${getCssVariable('--secondary-color')} !important;
            border-radius: 4px !important;
            display: inline-block !important;
        }
    `;
    document.head.appendChild(style);
});

function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-tab'))?.classList.add('active');
        });
    });
}

function setupThemeSelector() {
    const themeToggle = document.getElementById('theme-toggle');
    const themePanel = document.getElementById('theme-panel');
    const themeOptions = document.querySelectorAll('.theme-option');
    if (themeToggle && themePanel) {
        themeToggle.addEventListener('click', () => themePanel.classList.toggle('active'));
    }
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            applyTheme(option.getAttribute('data-theme'));
            themePanel?.classList.remove('active');
            updateInvoicePreview();
            saveDefaultSettings();
        });
    });
}

function applyTheme(theme) {
    currentTheme = theme;
    const themes = {
        blue: { primary: '#0984e3', secondary: '#0652dd' },
        green: { primary: '#2ecc71', secondary: '#27ae60' },
        gold: { primary: '#d4a017', secondary: '#b58900' },
        purple: { primary: '#9b59b6', secondary: '#8e44ad' },
        orange: { primary: '#e67e22', secondary: '#d35400' },
        red: { primary: '#e74c3c', secondary: '#c0392b' }
    };
    const { primary, secondary } = themes[theme] || themes.gold;
    document.documentElement.style.setProperty('--primary-color', primary);
    document.documentElement.style.setProperty('--secondary-color', secondary);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.style.backgroundColor = primary;
    }
}

function handleLogoUpload() {
    const logoInput = document.getElementById('company-logo');
    const logoPreview = document.getElementById('company-logo-preview');
    if (logoInput && logoPreview) {
        logoInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = event => {
                    logoPreview.src = event.target.result;
                    updateInvoicePreview();
                    saveDefaultSettings();
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}
