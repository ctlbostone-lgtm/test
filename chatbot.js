// ==================== CTL-ASSISTANT CHATBOT ====================
(function() {
    const qaCategories = [
        { 
            title: "🚀 Démarrage rapide", 
            icon: "fas fa-bolt", 
            questions: [
                { q: "Comment créer mon premier devis ?", a: "C'est simple ! Remplissez vos coordonnées dans <b>'Entreprise'</b>, ajoutez vos prestations dans l'onglet <b>'Prestations'</b>, puis cliquez sur <b>'Générer PDF'</b> !", target: "company-tab", field: "company-name" },
                { q: "Mes réglages sont-ils sauvegardés ?", a: "Oui ! Chaque modification est automatiquement enregistrée dans votre navigateur. Quand vous rouvrirez l'application, tout sera restauré.", target: null, field: null },
                { q: "Puis-je tout réinitialiser ?", a: "Absolument. Cliquez sur <b>'Réinitialiser'</b> pour effacer tous les champs du formulaire en une fois.", target: null, field: "reset-form" }
            ]
        },
        { 
            title: "🏢 Identité de marque", 
            icon: "fas fa-id-card", 
            questions: [
                { q: "Comment ajouter mon logo ?", a: "Allez dans <b>'Entreprise'</b> et utilisez le champ <b>'Logo'</b>. Il apparaîtra instantanément dans l'aperçu du devis !", target: "company-tab", field: "company-logo" },
                { q: "Changer le nom de mon entreprise ?", a: "Modifiez le champ <b>'Nom de l'entreprise'</b> dans le premier onglet.", target: "company-tab", field: "company-name" },
                { q: "Où entrer mon numéro de TVA / SIRET ?", a: "C'est tout en bas de l'onglet <b>'Entreprise'</b>, dans le champ dédié.", target: "company-tab", field: "company-siret" },
                { q: "Puis-je changer le titre principal 'DEVIS' ?", a: "Oui ! Allez dans l'onglet <b>'Design'</b> et modifiez le champ <b>'Titre principal du document'</b>.", target: "design-tab", field: "invoice-main-title" }
            ]
        },
        { 
            title: "💰 Prix et taxes", 
            icon: "fas fa-hand-holding-usd", 
            questions: [
                { q: "Comment ajouter un article ?", a: "Dans l'onglet <b>'Prestations'</b>, remplissez la description et le prix, puis cliquez sur <b>'Ajouter article'</b>.", target: "items-tab", field: "add-item-btn" },
                { q: "Changer le taux de TVA ?", a: "Cochez <b>'Inclure la TVA'</b> et ajustez le pourcentage juste à côté.", target: "items-tab", field: "tva-rate" },
                { q: "Ajouter de la main-d'œuvre ?", a: "Cochez <b>'Inclure main-d'œuvre'</b>. Vous pouvez choisir un montant fixe ou un pourcentage.", target: "items-tab", field: "labor-value" },
                { q: "Personnaliser le texte de la main-d'œuvre (sans afficher le montant) ?", a: "Cochez <b>'Personnaliser le texte'</b> juste en dessous de la main-d'œuvre. Saisissez le texte désiré, il remplacera le montant dans l'aperçu.", target: "items-tab", field: "custom-labor-text-value" },
                { q: "Appliquer des frais supplémentaires ?", a: "Utilisez l'option <b>'Inclure frais supplémentaires'</b> dans l'onglet Prestations.", target: "items-tab", field: "extra-fees-value" },
                { q: "Changer de devise (FCFA, €, $) ?", a: "Allez dans l'onglet <b>'Détails'</b> et sélectionnez votre devise préférée. L'euro (€) est désormais disponible !", target: "details-tab", field: "currency" }
            ]
        },
        { 
            title: "🎨 Style et personnalisation", 
            icon: "fas fa-magic", 
            questions: [
                { q: "Changer la couleur du thème ?", a: "Utilisez la <b>palette flottante</b> en bas à droite ou l'onglet <b>'Design'</b>.", target: "design-tab", field: "theme-toggle" },
                { q: "Ajouter un filigrane (ex: BROUILLON) ?", a: "Dans <b>'Design'</b>, choisissez le type Texte, saisissez votre texte, ajustez la taille, l'opacité et la rotation. Déplacez-le directement dans l'aperçu !", target: "design-tab", field: "watermark-text" },
                { q: "Utiliser une image en filigrane ?", a: "Dans <b>'Design'</b>, choisissez le type Image, téléchargez votre image, puis réglez les paramètres.", target: "design-tab", field: "watermark-image-upload" },
                { q: "Comment ajouter mon tampon ?", a: "Allez dans <b>'Design'</b>, chargez votre image. Il apparaîtra en bas à droite. Vous pouvez le déplacer et ajuster sa taille/opacité.", target: "design-tab", field: "stamp-upload" },
                { q: "Modifier la date du devis ?", a: "Le champ <b>'Date'</b> se trouve dans l'onglet <b>'Détails'</b>.", target: "details-tab", field: "invoice-date" },
                { q: "Ajuster la période de validité ?", a: "Modifiez le nombre de jours dans l'onglet <b>'Détails'</b>.", target: "details-tab", field: "validity" }
            ]
        },
        { 
            title: "📝 Finalisation et export", 
            icon: "fas fa-file-export", 
            questions: [
                { q: "Où mettre mes conditions générales ?", a: "Utilisez l'onglet <b>'Notes'</b>, c'est la grande zone de texte.", target: "notes-tab", field: "notes" },
                { q: "Comment changer le mode de paiement ?", a: "C'est dans l'onglet <b>'Détails'</b>, liste déroulante <b>'Mode de paiement'</b>.", target: "details-tab", field: "payment-method" },
                { q: "Comment obtenir le fichier PDF ?", a: "Cliquez sur le bouton <b>'Générer PDF'</b>. Vous pouvez même choisir un style de bordure !", target: null, field: "generate-pdf" },
                { q: "À quoi sert le QR code ?", a: "Il est généré automatiquement avec les détails du devis pour une vérification rapide.", target: null, field: "qr-code" },
                { q: "Puis-je charger un ancien devis pour le modifier ?", a: "Oui ! Cliquez sur le bouton <b>'Charger devis'</b> en bas à gauche. La liste de vos devis sauvegardés apparaît. Choisissez celui à modifier.", target: null, field: "load-history-btn" }
            ]
        }
    ];

    function init() {
        const container = document.querySelector('.chatbot-container');
        if (container) return;

        const chatbotHTML = `
        <div class="chatbot-container">
            <div class="chatbot-window" id="bot-window">
                <div class="chatbot-header">
                    <div class="bot-info">
                        <div class="bot-avatar-header">🤖</div>
                        <div>
                            <h3>CTL-ASSISTANT</h3>
                            <div class="status"><div class="status-dot"></div>680040145</div>
                        </div>
                    </div>
                    <button class="close-btn-header" id="bot-close-top">❌</button>
                </div>
                <div class="chatbot-body" id="bot-body">
                    <div class="msg msg-bot">
                        Bonjour ! 👋 Je suis votre assistant <b>CTL-POWER</b>. 
                        <br><br>Comment puis-je vous aider à réaliser votre devis parfait aujourd'hui ?
                    </div>
                    <div id="questions-area"></div>
                </div>
                <div class="chatbot-footer">
                    <button class="btn-exit-bot" id="bot-close-bottom">❌ Fermer l'assistant</button>
                </div>
            </div>
            <div class="chatbot-launcher" id="bot-launcher">
                <div class="bot-badge">20</div>
                <div class="bot-icon">🤖</div>
            </div>
            <div class="chatbot-contacts" style="margin-top: 10px; font-size: 14px; font-weight: bold; color: #d4a017; background: white; padding: 8px 15px; border-radius: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; border: 1px solid #d4a017; display: flex; align-items: center; justify-content: center; gap: 12px;">
                <a href="tel:+237680040145" style="color: #d4a017; text-decoration: none; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-phone-alt"></i> +237 6 80 04 01 45
                </a>
                <span style="color: #d4a017;">|</span>
                <a href="https://wa.me/237680040145" target="_blank" style="color: #25D366; text-decoration: none; display: flex; align-items: center; gap: 5px;">
                    <i class="fab fa-whatsapp" style="font-size: 16px;"></i> WhatsApp
                </a>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);

        const launcher = document.getElementById('bot-launcher');
        const windowBot = document.getElementById('bot-window');
        const qArea = document.getElementById('questions-area');
        const body = document.getElementById('bot-body');

        launcher.addEventListener('click', () => { 
            windowBot.style.display = 'flex'; 
            launcher.style.opacity = '0';
            launcher.style.pointerEvents = 'none';
        });

        const closeBot = () => { 
            windowBot.style.animation = 'slideUpIn 0.4s reverse forwards';
            setTimeout(() => {
                windowBot.style.display = 'none'; 
                windowBot.style.animation = '';
                launcher.style.opacity = '1';
                launcher.style.pointerEvents = 'auto';
            }, 400);
        };

        document.getElementById('bot-close-top').addEventListener('click', closeBot);
        document.getElementById('bot-close-bottom').addEventListener('click', closeBot);

        function showTyping(callback) {
            const typing = document.createElement('div');
            typing.className = 'typing-indicator';
            typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
            body.appendChild(typing);
            body.scrollTop = body.scrollHeight;
            setTimeout(() => {
                typing.remove();
                callback();
            }, 800);
        }

        function addMsg(text, type) {
            const m = document.createElement('div');
            m.className = 'msg msg-' + type;
            m.innerHTML = text;
            body.appendChild(m);
            body.scrollTop = body.scrollHeight;
        }

        qaCategories.forEach(cat => {
            const section = document.createElement('div');
            section.className = 'category-section';
            section.innerHTML = `<div class="category-title"><i class="${cat.icon}"></i> ${cat.title}</div>`;
            const grid = document.createElement('div');
            grid.className = 'q-grid';
            cat.questions.forEach(q => {
                const btn = document.createElement('button');
                btn.className = 'q-btn';
                btn.innerHTML = `<i class="fas fa-chevron-right"></i> ${q.q}`;
                btn.addEventListener('click', () => {
                    addMsg(q.q, 'user');
                    showTyping(() => {
                        addMsg(q.a, 'bot');
                        if(q.target) { 
                            const tab = document.querySelector(`.tab-btn[data-tab="${q.target}"]`); 
                            if(tab) tab.click(); 
                        }
                        if(q.field) { 
                            const el = document.getElementById(q.field); 
                            if(el) { 
                                el.scrollIntoView({behavior:'smooth', block:'center'}); 
                                el.classList.add('highlight-target'); 
                                setTimeout(() => el.classList.remove('highlight-target'), 4000); 
                            }
                        }
                    });
                });
                grid.appendChild(btn);
            });
            section.appendChild(grid);
            qArea.appendChild(section);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
