// ==================== GÉNÉRATION PDF ====================
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const btn = document.getElementById('generate-pdf');
    const invoicePreview = document.getElementById('invoice-preview');
    if (!btn || !invoicePreview) {
        alert('Erreur : aperçu ou bouton manquant.');
        return;
    }

    // Vérifier le quota
    let count = checkGenerationQuota();
    if (count >= MAX_GENERATIONS) {
        alert(`Vous avez atteint la limite de ${MAX_GENERATIONS} générations. Réessayez dans 6 heures.`);
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération...';
    btn.disabled = true;

    const borderStyle = await new Promise(resolve => showBorderStyleModal(resolve));
    if (borderStyle === null) {
        btn.innerHTML = '<i class="fas fa-file-pdf"></i> Générer PDF';
        btn.disabled = false;
        return;
    }
    const stopCountdown = showModernCountdownTimer();

    try {
        const invoiceNumber = document.getElementById('invoice-number-preview')?.textContent || '2023-001';
        const companyName = document.getElementById('company-name-display')?.textContent || 'CTL-POWER';
        const companyEmail = document.getElementById('company-email-preview')?.textContent.replace('Email: ', '') || 'ctlpowerr@gmail.com';
        const companyPhone = document.getElementById('company-phone-preview')?.textContent.replace('Tél: ', '') || '+237 6 80 04 01 45';
        const clientName = document.getElementById('client-name-preview')?.textContent || 'Client';
        const totalTtc = document.getElementById('total-ttc')?.textContent || '0';
        const currency = document.getElementById('currency')?.value || 'XAF';

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 10;
        const paddingMm = 5;
        const paddingPx = paddingMm * 3.7795;
        const contentWidth = pageWidth - 2 * margin;
        let pageNumber = 1;

        const clone = invoicePreview.cloneNode(true);
        clone.classList.add('pdf-export');
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.width = `${(contentWidth + 2 * paddingMm) * 3.7795}px`;
        clone.style.padding = `${paddingPx}px`;
        clone.style.boxSizing = 'border-box';
        const logoContainer = clone.querySelector('.logo-container');
        if (logoContainer) {
            logoContainer.style.width = '115px';
            logoContainer.style.height = '115px';
            logoContainer.style.padding = '5px';
            logoContainer.style.boxSizing = 'border-box';
        }
        const logoImg = clone.querySelector('#company-logo-preview');
        if (logoImg) {
            logoImg.style.width = '100%';
            logoImg.style.height = '100%';
            logoImg.style.objectFit = 'contain';
        }

        const styleSheets = Array.from(document.styleSheets)
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');
        const styleElement = document.createElement('style');
        styleElement.textContent = styleSheets + `
            * {
                box-sizing: border-box !important;
            }
            .pdf-export .invoice-header {
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-between !important;
                align-items: center !important;
            }
            .pdf-export .company-info {
                display: flex !important;
                align-items: center !important;
                gap: 20px !important;
            }
            .pdf-export .invoice-details {
                text-align: right !important;
                margin-top: 0 !important;
            }
            .pdf-export .client-info {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 20px !important;
            }
            .pdf-export .company-name-display {
                font-size: 1.43em !important;
                margin: 0 0 8px 0 !important;
            }
            .highlight-total {
                font-size: 16px !important;
                font-weight: bold !important;
                color: ${getCssVariable('--primary-color')} !important;
                background-color: rgba(${hexToRgb(getCssVariable('--secondary-color'))}, 0.1) !important;
                padding: 10px 15px !important;
                border: 2px solid ${getCssVariable('--secondary-color')} !important;
                border-radius: 8px !important;
                display: inline-block !important;
                margin: 5px 0 !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
            }
            .company-name-display {
                font-family: 'Roboto Slab', serif !important;
                font-size: 1.43em !important;
                font-weight: 700 !important;
                color: ${getCssVariable('--primary-color')} !important;
                text-transform: uppercase !important;
                letter-spacing: 1px !important;
                margin: 0 0 8px 0 !important;
                padding: 5px 10px !important;
                background: white !important;
                border-radius: 4px !important;
                display: inline-block !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.05) !important;
                position: relative !important;
                line-height: 1.2 !important;
            }
            .company-name-display::after {
                content: '' !important;
                position: absolute !important;
                bottom: -3px !important;
                left: 0 !important;
                width: 40px !important;
                height: 2px !important;
                background: ${getCssVariable('--primary-color')} !important;
                border-radius: 1px !important;
            }
            .logo-container {
                width: 115px !important;
                height: 115px !important;
                overflow: hidden !important;
                border-radius: 50% !important;
                border: 2px solid ${getCssVariable('--primary-color')} !important;
                background: white !important;
                padding: 5px !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .logo-container img {
                width: 100% !important;
                height: 100% !important;
                object-fit: contain !important;
                border-radius: 50% !important;
            }
            .invoice-preview {
                overflow: hidden !important;
            }
        `;
        clone.appendChild(styleElement);

        clone.querySelectorAll('.page-title').forEach(el => {
            el.style.fontSize = '14px';
        });
        clone.querySelectorAll('.invoice-footer, small').forEach(el => {
            el.style.fontSize = '10px';
        });

        const totalTtcElement = clone.querySelector('#total-ttc');
        if (totalTtcElement) {
            totalTtcElement.classList.add('highlight-total');
        }

        document.body.appendChild(clone);

        async function capturePage(element) {
            element.style.overflow = 'hidden';
            const canvas = await html2canvas(element, {
                scale: 2.6667,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: element.offsetWidth,
                height: element.offsetHeight,
                logging: false,
                allowTaint: false
            });
            const imgHeight = (canvas.height / canvas.width) * contentWidth;
            return { data: canvas.toDataURL('image/png', 1.0), height: imgHeight };
        }

        const tables = clone.querySelectorAll('.preview-table');
        const totalSection = clone.querySelector('.invoice-total');
        const footer = clone.querySelector('.invoice-footer');
        const continuationMessages = clone.querySelectorAll('.continuation-message');

        if (tables.length === 0) {
            const tempContainer = document.createElement('div');
            tempContainer.style.width = `${(contentWidth + 2 * paddingMm) * 3.7795}px`;
            tempContainer.style.padding = `${paddingPx}px`;
            tempContainer.style.margin = '0';
            tempContainer.style.boxSizing = 'border-box';
            tempContainer.classList.add('pdf-export');
            tempContainer.appendChild(styleElement.cloneNode(true));
            tempContainer.appendChild(clone.querySelector('.invoice-header').cloneNode(true));
            tempContainer.appendChild(clone.querySelector('.client-info').cloneNode(true));
            tempContainer.appendChild(totalSection.cloneNode(true));
            tempContainer.appendChild(footer.cloneNode(true));

            tempContainer.querySelectorAll('.page-title').forEach(el => el.style.fontSize = '14px');
            tempContainer.querySelectorAll('.invoice-footer, small').forEach(el => el.style.fontSize = '10px');

            document.body.appendChild(tempContainer);
            const { data, height } = await capturePage(tempContainer);
            document.body.removeChild(tempContainer);

            addPageBorders(doc, borderStyle);
            doc.addImage(data, 'PNG', margin, margin, contentWidth, Math.min(height, pageHeight - 2 * margin - 10), undefined, 'FAST');

            // Ajouter le filigrane et le tampon sur cette page
            addWatermarkToPage(doc);
            addStampToPage(doc);
        } else {
            for (let i = 0; i < tables.length; i++) {
                const tempContainer = document.createElement('div');
                tempContainer.style.width = `${(contentWidth + 2 * paddingMm) * 3.7795}px`;
                tempContainer.style.padding = `${paddingPx}px`;
                tempContainer.style.margin = '0';
                tempContainer.style.boxSizing = 'border-box';
                tempContainer.classList.add('pdf-export');
                tempContainer.appendChild(styleElement.cloneNode(true));

                const headerClone = clone.querySelector('.invoice-header').cloneNode(true);
                const headerLogoContainer = headerClone.querySelector('.logo-container');
                if (headerLogoContainer) {
                    headerLogoContainer.style.width = '115px';
                    headerLogoContainer.style.height = '115px';
                    headerLogoContainer.style.boxSizing = 'border-box';
                }
                const headerLogoImg = headerClone.querySelector('#company-logo-preview');
                if (headerLogoImg) {
                    headerLogoImg.style.width = '100%';
                    headerLogoImg.style.height = '100%';
                    headerLogoImg.style.objectFit = 'contain';
                }
                tempContainer.appendChild(headerClone);
                tempContainer.appendChild(clone.querySelector('.client-info').cloneNode(true));
                tempContainer.appendChild(tables[i].cloneNode(true));

                if (i === 0 && continuationMessages.length > 0) {
                    tempContainer.appendChild(continuationMessages[i].cloneNode(true));
                }

                if (i === tables.length - 1) {
                    tempContainer.appendChild(totalSection.cloneNode(true));
                    tempContainer.appendChild(footer.cloneNode(true));
                }

                tempContainer.querySelectorAll('.page-title').forEach(el => el.style.fontSize = '14px');
                tempContainer.querySelectorAll('.invoice-footer, small').forEach(el => el.style.fontSize = '10px');

                const tempTotalTtc = tempContainer.querySelector('#total-ttc');
                if (tempTotalTtc) {
                    tempTotalTtc.classList.add('highlight-total');
                }

                document.body.appendChild(tempContainer);
                const { data, height } = await capturePage(tempContainer);
                document.body.removeChild(tempContainer);

                addPageBorders(doc, borderStyle);
                doc.addImage(data, 'PNG', margin, margin, contentWidth, Math.min(height, pageHeight - 2 * margin - 10), undefined, 'FAST');

                // Ajouter le filigrane et le tampon sur cette page
                addWatermarkToPage(doc);
                addStampToPage(doc);

                if (i < tables.length - 1) {
                    doc.addPage();
                    pageNumber++;
                }
            }
        }

        document.body.removeChild(clone);

        const fileName = `Devis_${clientName.replace(/\s+/g, '_')}_${invoiceNumber.replace(/\s+/g, '-')}.pdf`;
        doc.save(fileName);
        saveToHistory();

        // Incrémenter le compteur après une génération réussie
        incrementGenerationCount();
        updateGenerationDisplay();

    } catch (error) {
        console.error('Erreur PDF:', error);
        alert('Erreur lors de la génération du PDF : ' + error.message);
    } finally {
        stopCountdown();
        btn.innerHTML = '<i class="fas fa-file-pdf"></i> Générer PDF';
        btn.disabled = false;
    }
}

function addWatermarkToPage(doc) {
    if (watermarkData.type === 'none') return;
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: watermarkData.opacity }));
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const x = (watermarkData.xPercent / 100) * pageWidth;
    const y = (watermarkData.yPercent / 100) * pageHeight;
    const angle = watermarkData.rotation;

    if (watermarkData.type === 'text' && watermarkData.text) {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(watermarkData.size);
        doc.text(watermarkData.text, x, y, { angle: angle, align: 'center' });
    } else if (watermarkData.type === 'image' && watermarkData.image) {
        const aspectRatio = watermarkData.imageWidth / watermarkData.imageHeight || 1;
        const widthMm = watermarkData.size * aspectRatio;
        const heightMm = watermarkData.size;
        doc.addImage(watermarkData.image, 'PNG', x - widthMm/2, y - heightMm/2, widthMm, heightMm, undefined, 'FAST', angle);
    }
    doc.restoreGraphicsState();
}

function addStampToPage(doc) {
    if (!stampData.image) return;
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: stampData.opacity }));
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const x = (stampData.xPercent / 100) * pageWidth;
    const y = (stampData.yPercent / 100) * pageHeight;
    const aspectRatio = stampData.imageWidth / stampData.imageHeight || 1;
    const widthMm = stampData.size * aspectRatio;
    const heightMm = stampData.size;
    doc.addImage(stampData.image, 'PNG', x - widthMm/2, y - heightMm/2, widthMm, heightMm, undefined, 'FAST');
    doc.restoreGraphicsState();
}

function addPageBorders(doc, borderStyle) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const primaryColor = getCssVariable('--primary-color');
    const secondaryColor = getCssVariable('--secondary-color');
    if (borderStyle === 'simple') {
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(0.8);
        doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S');
    } else if (borderStyle === 'gradient') {
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1.2);
        doc.rect(margin + 5, margin + 5, pageWidth - 2 * (margin + 5), pageHeight - 2 * (margin + 5), 'S');
        doc.setDrawColor(secondaryColor);
        doc.setLineWidth(0.6);
        doc.rect(margin + 7, margin + 7, pageWidth - 2 * (margin + 7), pageHeight - 2 * (margin + 7), 'S');
    } else if (borderStyle === 'double') {
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1);
        doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S');
        doc.setDrawColor(secondaryColor);
        doc.setLineWidth(1);
        doc.rect(margin + 3, margin + 3, pageWidth - 2 * (margin + 3), pageHeight - 2 * (margin + 3), 'S');
    } else if (borderStyle === 'neon') {
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1.5);
        doc.rect(margin + 3, margin + 8, pageWidth - 2 * (margin + 3), pageHeight - 2 * (margin + 8), 'S');
        doc.setDrawColor(secondaryColor);
        doc.setLineWidth(0.3);
        doc.rect(margin + 4, margin + 9, pageWidth - 2 * (margin + 4), pageHeight - 2 * (margin + 9), 'S');
        doc.setLineWidth(0.2);
        doc.rect(margin + 5, margin + 10, pageWidth - 2 * (margin + 5), pageHeight - 2 * (margin + 10), 'S');
    } else if (borderStyle === 'geometric') {
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1);
        doc.rect(margin + 2, margin + 2, pageWidth - 2 * (margin + 2), pageHeight - 2 * (margin + 2), 'S');
        doc.setFillColor(secondaryColor);
        const cornerSize = 8;
        doc.triangle(margin + 2, margin + 2, margin + 2 + cornerSize, margin + 2, margin + 2, margin + 2 + cornerSize, 'F');
        doc.triangle(pageWidth - margin - 2, margin + 2, pageWidth - margin - 2 - cornerSize, margin + 2, pageWidth - margin - 2, margin + 2 + cornerSize, 'F');
        doc.triangle(margin + 2, pageHeight - margin - 2, margin + 2 + cornerSize, pageHeight - margin - 2, margin + 2, pageHeight - margin - 2 - cornerSize, 'F');
        doc.triangle(pageWidth - margin - 2, pageHeight - margin - 2, pageWidth - margin - 2 - cornerSize, pageHeight - margin - 2, pageWidth - margin - 2, pageHeight - 2 * margin - cornerSize, 'F');
        const hexSize = 4;
        doc.setFillColor(primaryColor);
        for (let x = margin + 20; x < pageWidth - margin - 20; x += 15) {
            doc.polyline([
                [x, margin + 2], [x + hexSize, margin + 2 + hexSize * 0.5],
                [x + hexSize, margin + 2 + hexSize * 1.5], [x, margin + 2 + hexSize * 2],
                [x - hexSize, margin + 2 + hexSize * 1.5], [x - hexSize, margin + 2 + hexSize * 0.5]
            ], { close: true, fill: true });
        }
    } else if (borderStyle === 'floating') {
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(1);
        doc.rect(margin + 5, margin + 5, pageWidth - 2 * margin - 5, pageHeight - 2 * margin - 5, 'S');
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1.2);
        doc.rect(margin + 2, margin + 2, pageWidth - 2 * margin - 5, pageHeight - 2 * margin - 5, 'S');
        doc.setDrawColor(secondaryColor);
        doc.setLineWidth(0.5);
        doc.rect(margin + 3, margin + 3, pageWidth - 2 * margin - 7, pageHeight - 2 * margin - 7, 'S');
    } else if (borderStyle === 'wavy') {
        doc.setDrawColor(secondaryColor);
        doc.setLineWidth(1);
        const waveAmplitude = 3;
        const waveFrequency = 8;
        for (let x = margin; x < pageWidth - margin; x += waveFrequency) {
            doc.line(
                x, margin + waveAmplitude * Math.sin(x / waveFrequency),
                x + waveFrequency, margin + waveAmplitude * Math.sin((x + waveFrequency) / waveFrequency)
            );
            doc.line(
                x, pageHeight - margin + waveAmplitude * Math.sin(x / waveFrequency),
                x + waveFrequency, pageHeight - margin + waveAmplitude * Math.sin((x + waveFrequency) / waveFrequency)
            );
        }
        for (let y = margin + 20; y < pageHeight - margin - 20; y += waveFrequency) {
            doc.line(
                margin, y,
                margin + waveAmplitude, y + waveFrequency / 2
            );
            doc.line(
                pageWidth - margin, y,
                pageWidth - margin - waveAmplitude, y + waveFrequency / 2
            );
        }
    } else if (borderStyle === 'metallic') {
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(2);
        doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 'S');
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.4);
        for (let i = 0; i < pageWidth; i += 10) {
            doc.line(margin + i, margin, margin + i - 10, margin + 10);
            doc.line(pageWidth - margin - i, pageHeight - margin, pageWidth - margin - i + 10, pageHeight - margin - 10);
        }
        doc.setDrawColor(secondaryColor);
        doc.setLineWidth(0.8);
        doc.rect(margin + 3, margin + 3, pageWidth - 2 * margin - 6, pageHeight - 2 * margin - 6, 'S');
    } else if (borderStyle === 'futuristic') {
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(1);
        const segmentLength = 12;
        const gap = 6;
        for (let x = margin + 10; x < pageWidth - margin - 10; x += segmentLength + gap) {
            if (x + segmentLength <= pageWidth - margin - 10) {
                doc.line(x, margin + 5, x + segmentLength, margin + 5);
                doc.line(x, pageHeight - margin - 5, x + segmentLength, pageHeight - margin - 5);
            }
        }
        for (let y = margin + 15; y < pageHeight - margin - 15; y += segmentLength + gap) {
            if (y + segmentLength <= pageHeight - margin - 15) {
                doc.line(margin + 5, y, margin + 5, y + segmentLength);
                doc.line(pageWidth - margin - 5, y, pageWidth - margin - 5, y + segmentLength);
            }
        }
        doc.setFillColor(secondaryColor);
        doc.circle(margin + 5, margin + 5, 2, 'F');
        doc.circle(pageWidth - margin - 5, margin + 5, 2, 'F');
        doc.circle(margin + 5, pageHeight - margin - 5, 2, 'F');
        doc.circle(pageWidth - margin - 5, pageHeight - margin - 5, 2, 'F');
    }
}
