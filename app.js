document.addEventListener('DOMContentLoaded', () => {
    // --- Dark Mode Initialization ---
    if (localStorage.getItem('ramalhao_dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Register Service Worker for PWA Functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('SeviceWorker registado com sucesso.');
                })
                .catch(error => {
                    console.log('Falha ao registar o ServiceWorker:', error);
                });
        });
    }

    // --- Dark Mode Initialization ---
    if (localStorage.getItem('ramalhao_dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // --- Espaços DB Initialization ---
    if (!localStorage.getItem('ramalhao_espacos')) {
        const defaultEspacos = [
            { id: 'capela', category: 'Especiais', nome: 'Capela', desc: 'Espaço silencioso para reflexão e oração.', imgMode: true, img: 'capela.jpg.jpeg', icon: 'church' },
            { id: 'tenda', category: 'Especiais', nome: 'A Tenda', desc: 'Espaço alternativo para eventos e convívio ao ar livre.', imgMode: true, img: 'tenda.jpg.jpeg', icon: 'tent' },
            { id: 'sala_12b', category: 'Estudo', nome: 'Sala 12ºB', desc: 'Sala de aula equipada com ecrã interativo e mobiliário moderno.', imgMode: true, img: 'sala_12b.jpg', icon: 'monitor' },
            { id: 'ginasio_novo', category: 'Desporto', nome: 'Ginásio Novo', desc: 'Instalações modernas para multi-desportos.', imgMode: true, img: 'ginasio_novo.jpg.png', icon: 'activity' },
            { id: 'polidesportivo', category: 'Desporto', nome: 'Polidesportivo', desc: 'Campo exterior para futebol, ténis e mais.', imgMode: true, img: 'polideportivo.jpg.png', icon: 'goal' },
            { id: 'ginasio_velho', category: 'Desporto', nome: 'Ginásio Velho', desc: 'Espaço clássico para atividades físicas e treinos.', imgMode: true, img: 'ginasio_velho.jpeg', icon: 'dumbbell' },
            { id: 'sala_profissional', category: 'Estudo', nome: 'Sala do Profissional', desc: 'Espaço reservado para ensino e formações.', imgMode: true, img: 'sala_profissional.jpeg', icon: 'graduation-cap' },
            { id: 'floresta', category: 'Especiais', nome: 'Floresta', desc: 'Espaço focado na natureza e bem-estar.', imgMode: true, img: 'floresta.jpeg', icon: 'trees' }
        ];
        localStorage.setItem('ramalhao_espacos', JSON.stringify(defaultEspacos));
    }

    // --- Dynamic Render Functions ---
    window.allSpacesDB = JSON.parse(localStorage.getItem('ramalhao_espacos') || '[]');

    // Render Reserva and Horarios Select Options
    if (window.location.pathname.includes('reserva.html') || window.location.pathname.includes('horarios.html')) {
        const espacoSelect = document.getElementById('espaco') || document.getElementById('filtro_espaco');
        if (espacoSelect) {
            window.allSpacesDB.forEach(space => {
                const opt = document.createElement('option');
                opt.value = space.id;
                opt.textContent = space.nome;
                espacoSelect.appendChild(opt);
            });
        }
    }

    // Render Index Grid
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        const grid = document.getElementById('mainSpacesGrid');
        if (grid) {
            window.allSpacesDB.forEach((space, index) => {
                let delay = 0.3 + (index * 0.1);
                let imgHtml = space.imgMode ? `<div class="space-image" style="background-image: url('${space.img}')"></div>` : `<div class="space-icon-wrapper"><i data-lucide="${space.icon}"></i></div>`;
                grid.innerHTML += `
                    <div class="space-card ${space.imgMode ? 'has-image' : ''} animate-in pulse-click" data-category="${space.category}" data-espaco="${space.id}" style="animation-delay: ${delay}s">
                        ${imgHtml}
                        <div class="space-content">
                            <div class="space-info">
                                <h3>${space.nome}</h3>
                                <p>${space.desc}</p>
                            </div>
                            <div class="space-action">
                                <button class="btn btn-primary btn-sm desktop-only">Reservar</button>
                                <i data-lucide="chevron-right" class="mobile-only"></i>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    }

    window.deleteAccount = function() {
        if(confirm('Tem a certeza que pretende eliminar a sua conta? Esta ação é irreversível e os seus dados não podem ser recuperados.')) {
            const currentUserEmail = localStorage.getItem('currentUserEmail');
            let users = JSON.parse(localStorage.getItem('ramalhao_users') || '[]');
            users = users.filter(u => u.email !== currentUserEmail);
            localStorage.setItem('ramalhao_users', JSON.stringify(users));
            
            // clear session
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('currentUserRole');
            localStorage.removeItem('currentUserName');
            
            window.location.href = 'login.html';
        }
    };

    // --- Responsive Sidebar Logic ---
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('appSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (openSidebarBtn && sidebar && sidebarOverlay) {
        // Open
        openSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('open');
        });

        // Close Function
        const closeSidebar = () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('open');
        };

        if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Auto-close sidebar on link click if on mobile
        const navLinks = sidebar.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) { // Match CSS breakpoint
                    closeSidebar();
                }
            });
        });
    }

    // --- UX improvements - Button Interactions ---
    // Event delegation since buttons scale dynamically
    document.body.addEventListener('click', function (e) {
        const card = e.target.closest('.pulse-click');
        if (card) {
            const actionBtn = card.querySelector('.btn-primary');
            const originalTextContent = actionBtn ? actionBtn.innerText : '';

            if (actionBtn) {
                actionBtn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin" style="margin-right:0.25rem;"></i> ...';
                actionBtn.disabled = true;
                lucide.createIcons && lucide.createIcons();
            }

            card.style.opacity = '0.8';
            card.style.pointerEvents = 'none';

            setTimeout(() => {
                const espacoId = card.getAttribute('data-espaco');
                if (espacoId) {
                    window.location.href = `reserva.html?espaco=${espacoId}`;
                } else {
                    window.location.href = 'reserva.html';
                }
            }, 500);
        }
    });

    // --- Forms Submission Simulator Handler ---
    const forms = document.querySelectorAll('form.auth-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            // Loading state
            btn.innerHTML = 'A processar <i data-lucide="loader-2" class="lucide-spin" style="margin-left:8px; width:16px; height:16px;"></i>';
            btn.style.opacity = '0.7';
            btn.disabled = true;
            lucide.createIcons();

            // Handle specific Reserva submission
            const isReserva = window.location.pathname.includes('reserva.html');
            if (isReserva) {
                const urlParams = new URLSearchParams(window.location.search);
                const editId = urlParams.get('edit');

                const espacoElement = document.getElementById('espaco');
                if (espacoElement && espacoElement.value) {
                    const reservas = JSON.parse(localStorage.getItem('ramalhao_reservas') || '[]');
                    let reservaObj;

                    if (editId) {
                        // Editing existing
                        reservaObj = reservas.find(r => r.id === parseInt(editId));
                        if (reservaObj) {
                            reservaObj.espacoId = espacoElement.value;
                            reservaObj.espacoNome = espacoElement.options[espacoElement.selectedIndex].text;
                            reservaObj.data = document.getElementById('data').value;
                            reservaObj.horaInicio = document.getElementById('hora_inicio').value;
                            reservaObj.horaFim = document.getElementById('hora_fim').value;
                            reservaObj.motivo = document.getElementById('motivo') ? document.getElementById('motivo').value : '';
                        }
                    } else {
                        // Creating new
                        reservaObj = {
                            id: Date.now(),
                            espacoId: espacoElement.value,
                            espacoNome: espacoElement.options[espacoElement.selectedIndex].text,
                            data: document.getElementById('data').value,
                            horaInicio: document.getElementById('hora_inicio').value,
                            horaFim: document.getElementById('hora_fim').value,
                            motivo: document.getElementById('motivo') ? document.getElementById('motivo').value : '',
                            utilizador: localStorage.getItem('currentUserEmail') || 'utilizador@desconhecido.pt',
                            utilizadorNome: localStorage.getItem('currentUserName') || 'Utilizador',
                            status: 'Pendente',
                            tipo: 'reserva'
                        };
                        reservas.unshift(reservaObj);
                    }

                    localStorage.setItem('ramalhao_reservas', JSON.stringify(reservas));

                    // --- ENVIAR PARA GOOGLE SHEETS ---
                    const googleAppScriptURL = 'https://script.google.com/macros/s/AKfycbwbMr9tscPnXAf9qboNlOtBo1DHM46KZT4Sx4F726EnHtEjyGrYlapLPhu6N6Vk6MM2NA/exec';

                    fetch(googleAppScriptURL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                        body: JSON.stringify(reservaObj)
                    }).catch(err => console.error('Erro ao guardar na base de dados (Google Sheets):', err));
                }
            }

            // Handle specific Signup submission
            const isSignup = window.location.pathname.includes('signup.html');
            if (isSignup) {
                const tipoElement = document.getElementById('tipo_utilizador');
                const tipoValue = tipoElement ? tipoElement.value : 'Aluno';
                const adminCodeElement = document.getElementById('admin_code');

                // Simulate admin code check
                if (tipoValue === 'Administrador') {
                    if (!adminCodeElement || adminCodeElement.value !== 'RAMALHAO2026') {
                        alert('Código de Administrador inválido! Tente novamente.');

                        // Reset button state
                        btn.innerHTML = originalText;
                        btn.style.opacity = '1';
                        btn.disabled = false;
                        return; // Stop submission
                    }
                }

                const novoUtilizador = {
                    id: Date.now(),
                    nome: document.getElementById('name') ? document.getElementById('name').value : '',
                    email: document.getElementById('email') ? document.getElementById('email').value : '',
                    tipoUtilizador: tipoValue,
                    status: (tipoValue === 'Administrador' || tipoValue === 'Aluno') ? 'Aprovada' : 'Pendente', // Admins and Students auto-approved
                    tipo: 'utilizador'
                };

                const users = JSON.parse(localStorage.getItem('ramalhao_users') || '[]');
                users.unshift(novoUtilizador);
                localStorage.setItem('ramalhao_users', JSON.stringify(users));

                // If signing up as Admin with correct code, auto-login as admin
                if (tipoValue === 'Administrador') {
                    localStorage.setItem('currentUserRole', 'Administrador');
                    localStorage.setItem('currentUserEmail', novoUtilizador.email.toLowerCase());
                    localStorage.setItem('currentUserName', novoUtilizador.nome);
                } else if (tipoValue === 'Aluno') {
                    localStorage.setItem('currentUserRole', 'Aluno');
                    localStorage.setItem('currentUserEmail', novoUtilizador.email.toLowerCase());
                    localStorage.setItem('currentUserName', novoUtilizador.nome);
                } else {
                    // Professor or Funcionário - NO AUTO-LOGIN
                    localStorage.setItem('currentUserRole', 'Pendente');
                    // We don't set currentUserEmail for pending accounts to force login after approval
                }

                const googleAppScriptURL = 'https://script.google.com/macros/s/AKfycbwbMr9tscPnXAf9qboNlOtBo1DHM46KZT4Sx4F726EnHtEjyGrYlapLPhu6N6Vk6MM2NA/exec';

                fetch(googleAppScriptURL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: JSON.stringify(novoUtilizador)
                }).catch(err => console.error('Erro ao guardar na base de dados (Google Sheets):', err));
            }

            // Simulate Network Request
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;

                if (isReserva) {
                    window.location.href = 'minhas-reservas.html';
                } else if (isSignup) {
                    const tipoElement = document.getElementById('tipo_utilizador');
                    const tipoValue = tipoElement ? tipoElement.value : 'Aluno';

                    if (tipoValue === 'Professor' || tipoValue === 'Funcionário') {
                        alert('Conta criada com sucesso! Por favor, aguarde pela aprovação do administrador para poder entrar.');
                        window.location.href = 'login.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    // This is login
                    const loginEmail = document.getElementById('email') ? document.getElementById('email').value.toLowerCase() : '';

                    const users = JSON.parse(localStorage.getItem('ramalhao_users') || '[]');
                    const foundUser = users.find(u => u.email.toLowerCase() === loginEmail);

                    if (foundUser) {
                        // Check if account is pending for specific roles
                        if (foundUser.status === 'Pendente' && (foundUser.tipoUtilizador === 'Professor' || foundUser.tipoUtilizador === 'Funcionário')) {
                            alert('A sua conta ainda está pendente de aprovação pelo administrador. Por favor, aguarde.');

                            // Reset button state
                            btn.innerHTML = originalText;
                            btn.style.opacity = '1';
                            btn.disabled = false;
                            return;
                        }
                        // Se encontrou o utilizador na localStorage, usa a role dele
                        localStorage.setItem('currentUserRole', foundUser.tipoUtilizador);
                        localStorage.setItem('currentUserName', foundUser.nome);
                    } else if (loginEmail.includes('admin')) {
                        // Fallback original para mock login
                        localStorage.setItem('currentUserRole', 'Administrador');
                    } else {
                        // Fallback de mock
                        localStorage.setItem('currentUserRole', 'Aluno');
                    }
                    localStorage.setItem('currentUserEmail', loginEmail); // Ensure email is saved on login too

                    window.location.href = 'dashboard.html';
                }
            }, 1200);
        });
    });

    // --- Category Filtering for Explorar Page (index.html) ---
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        const pills = document.querySelectorAll('.category-pills .pill-btn');
        const spaces = document.querySelectorAll('.space-card');

        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                // Toggle active class
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const category = pill.innerText.trim();
                spaces.forEach(space => {
                    const spaceCategory = space.getAttribute('data-category');
                    if (category === 'Todos' || spaceCategory === category) {
                        space.style.display = 'flex';
                        space.classList.add('animate-in');
                    } else {
                        space.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- Pre-fill Reserva Form ---
    if (window.location.pathname.includes('reserva.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const espacoId = urlParams.get('espaco');
        const editId = urlParams.get('edit');

        if (editId) {
            const reservas = JSON.parse(localStorage.getItem('ramalhao_reservas') || '[]');
            const reserva = reservas.find(r => r.id === parseInt(editId));

            if (reserva) {
                // Pre-fill form
                const selectEspaco = document.getElementById('espaco');
                const dateInput = document.getElementById('data');
                const startInput = document.getElementById('hora_inicio');
                const endInput = document.getElementById('hora_fim');
                const motivoInput = document.getElementById('motivo');
                const submitBtn = document.querySelector('button[type="submit"]');

                if (selectEspaco) selectEspaco.value = reserva.espacoId;
                if (dateInput) dateInput.value = reserva.data;
                if (startInput) startInput.value = reserva.horaInicio;
                if (endInput) endInput.value = reserva.horaFim;
                if (motivoInput) motivoInput.value = reserva.motivo;
                if (submitBtn) submitBtn.innerText = 'Guardar Alterações';

                // Update page titles
                const pageTitle = document.querySelector('.page-title');
                const desktopTitle = document.querySelector('.desktop-only .page-title');
                if (pageTitle) pageTitle.innerText = 'Editar Reserva';
                if (desktopTitle) desktopTitle.innerText = 'Editar Reserva';
            }
        } else if (espacoId) {
            const selectEspaco = document.getElementById('espaco');
            if (selectEspaco) {
                selectEspaco.value = espacoId;
            }
        }

        // Default to today's date if not editing and empty
        const dateInput = document.getElementById('data');
        if (dateInput && !dateInput.value) {
            dateInput.valueAsDate = new Date();
        }
    }

    // --- Render Reservas in minhas-reservas.html ---
    if (window.location.pathname.includes('minhas-reservas.html')) {
        const reservasList = document.getElementById('reservasList');
        const pills = document.querySelectorAll('.category-pills .pill-btn');

        const renderFilteredReservas = (filterType) => {
            if (!reservasList) return;

            const reservas = JSON.parse(localStorage.getItem('ramalhao_reservas') || '[]');
            const today = new Date().toISOString().split('T')[0];

            const currentUserEmail = localStorage.getItem('currentUserEmail');

            let filtered = reservas;
            if (filterType === 'Minhas Reservas') {
                filtered = reservas.filter(r => r.utilizador === currentUserEmail && (r.status === 'Pendente' || r.status === 'Confirmada') && r.data >= today);
            } else if (filterType === 'Todas') {
                filtered = reservas.filter(r => (r.status === 'Pendente' || r.status === 'Confirmada') && r.data >= today);
            } else if (filterType === 'Histórico') {
                filtered = reservas.filter(r => r.status === 'Confirmada' && r.data < today);
            } else if (filterType === 'Canceladas') {
                filtered = reservas.filter(r => r.status === 'Rejeitada');
            }

            if (filtered.length === 0) {
                reservasList.innerHTML = `
                    <div style="text-align: center; padding: 4rem 1rem; color: var(--color-text-muted); background: var(--color-white); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                        <i data-lucide="calendar-x" style="width: 56px; height: 56px; opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p style="font-weight: 500; font-size: 1.1rem; color: var(--color-navy); margin-bottom: 0.5rem;">Nenhuma reserva encontrada.</p>
                        <p style="font-size: 0.95rem;">Não existem reservas nesta categoria.</p>
                        <a href="index.html" class="btn btn-outline mt-3" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Explorar Espaços</a>
                    </div>
                `;
            } else {
                reservasList.innerHTML = '';
                filtered.forEach((reserva, index) => {
                    let iconName = 'book-heart';
                    let iconBg = 'background: linear-gradient(135deg, var(--color-navy-light), var(--color-navy)); color: var(--color-yellow);';

                    let targetSpace = window.allSpacesDB.find(s => s.id === reserva.espacoId);
                    if (targetSpace) {
                        if (targetSpace.icon) iconName = targetSpace.icon;
                        if (targetSpace.category === 'Especiais') iconBg = 'background: rgba(16, 185, 129, 0.1); color: #10B981;';
                        if (targetSpace.category === 'Desporto') iconBg = 'background: rgba(0, 59, 115, 0.05); color: var(--color-navy);';
                    }

                    // For the mock, format date beautifully
                    let formattedDate = reserva.data;
                    try {
                        const dateObj = new Date(reserva.data);
                        if (!isNaN(dateObj)) {
                            formattedDate = dateObj.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
                        }
                    } catch (e) { }

                    let statusHtml = '';
                    if (reserva.status === 'Pendente') {
                        statusHtml = `<span style="font-size: 0.8rem; font-weight: 600; color: #F59E0B; background-color: rgba(245, 158, 11, 0.1); padding: 0.25rem 0.6rem; border-radius: 999px;">Pendente</span>`;
                    } else if (reserva.status === 'Confirmada') {
                        statusHtml = `<span style="font-size: 0.8rem; font-weight: 600; color: #10B981; background-color: rgba(16, 185, 129, 0.1); padding: 0.25rem 0.6rem; border-radius: 999px;">Confirmada</span>`;
                    } else if (reserva.status === 'Rejeitada') {
                        statusHtml = `<span style="font-size: 0.8rem; font-weight: 600; color: #EF4444; background-color: rgba(239, 68, 68, 0.1); padding: 0.25rem 0.6rem; border-radius: 999px;">Cancelada</span>`;
                    }

                    reservasList.innerHTML += `
                        <div class="space-card animate-in" style="animation-delay: ${0.1 * index}s; cursor: default; margin-bottom: 1rem; border-left: 4px solid ${reserva.status === 'Confirmada' ? '#10B981' : (reserva.status === 'Rejeitada' ? '#EF4444' : '#F59E0B')};">
                            <div class="space-icon-wrapper" style="${iconBg}">
                                <i data-lucide="${iconName}"></i>
                            </div>
                            <div class="space-info">
                                <h3>${reserva.espacoNome}</h3>
                                <p style="color: var(--color-navy); font-weight: 500; font-size: 0.85rem; margin-top: 0.25rem;">
                                    <i data-lucide="calendar" style="width:14px; height:14px; display:inline; vertical-align:text-bottom; margin-right:4px;"></i>${formattedDate}
                                </p>
                                <p style="font-size: 0.85rem; margin-top: 0.1rem; color: var(--color-text-muted);">
                                    <i data-lucide="clock" style="width:14px; height:14px; display:inline; vertical-align:text-bottom; margin-right:4px;"></i>${reserva.horaInicio || reserva.hora_inicio} - ${reserva.horaFim || reserva.hora_fim || '...'}
                                </p>
                            </div>
                            <div class="space-action" style="flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                                ${statusHtml}
                                <div class="manage-btns" style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
                                    ${(reserva.utilizador === localStorage.getItem('currentUserEmail') || localStorage.getItem('currentUserRole') === 'Administrador') ? `
                                        <button onclick="window.editReserva('${reserva.id}')" class="btn btn-outline btn-sm" style="padding: 4px 8px; font-size:  Asc 0.75rem; display: flex; align-items: center; gap: 4px;">
                                            < Asc i data-lucide="edit-2" Asc style="width: Asc 12px; Asc height: Asc  Asc 12px;"></ Asc Asc i> Asc Editar
                                        </button>
                                        <button onclick="window.deleteReserva('${reserva.id}')" class="btn btn-outline text-danger btn-sm" Asc style=" Asc padding: Asc 4px Asc 8px; Asc font-size: Asc 0.75rem; Asc Asc Asc border-color: Asc Asc Asc Asc #EF444466; Asc Asc display: Asc flex; Asc align-items: Asc center; Asc Asc Asc gap: Asc Asc Asc 4px;">
                                            < Asc Asc Asc Asc i data-lucide=" Asc trash-2" Asc Asc Asc Asc Asc Asc style=" Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc width: Asc Asc Asc 12px; Asc Asc Asc Asc Asc height: Asc Asc Asc Asc Asc 12px;"></ Asc Asc Asc Asc Asc i> Asc Eliminar
                                        </ Asc button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            lucide.createIcons();
        };

        // Initial render
        renderFilteredReservas('Minhas Reservas');

        // Add pill listeners
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                renderFilteredReservas(pill.innerText.trim());
            });
        });
    }

    // --- Render Admin Dashboard ---
    if ( Asc window.location.pathname.includes('admin.html') ) {
        const adminReservasList Asc = Asc document.getElementById('adminReservasList');
        const Asc adminUsersList Asc Asc Asc Asc Asc = Asc Asc Asc Asc document.getElementById('adminUsersList');

        // Render Pending Reservations
        Asc Asc Asc Asc Asc Asc Asc Asc Asc if Asc Asc Asc Asc (adminReservasList) {
            const reservas Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc = Asc JSON.parse(localStorage.getItem('ramalhao_reservas') || '[]');
            const pendentes = reservas.filter(r => r.status === 'Pendente');

            Asc if (pendentes.length === 0) {
                adminReservasList.innerHTML = '<div style="padding: 2rem; text-align: center; Asc Asc Asc color: Asc var(--color-text-muted);">Nenhuma reserva pendente de aprovação.</div>';
            } else {
                Asc adminReservasList.innerHTML = '';
                pendentes.forEach(reserva => {
                    adminReservasList.innerHTML += `
                        <div class="space-card" style="margin-bottom: 1rem; border-left: 4px solid #F59E0B;">
                            <div class="space-info" style="flex: 1;">
                                <h3 style="margin-bottom: Asc 0.25rem;">${reserva.espacoNome}</h3>
                                <div style="font-size: 0.85rem; color: var(--color-text-muted); display: grid; grid-template-columns: 1fr 1 Asc fr; gap: Asc Asc Asc 0.5rem;">
                                    <span>< Asc Asc Asc i data-lucide="user" style="width: Asc 14px; height:14px; Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc display:inline; margin-right: Asc Asc 4px;"></ Asc Asc i>${reserva.utilizadorNome || reserva.utilizador || 'Utilizador'}</span>
                                    <span>< Asc i data-lucide="calendar" Asc Asc Asc Asc Asc Asc Asc Asc style=" Asc Asc width: Asc Asc Asc 14px; height: Asc Asc Asc Asc 14px; Asc Asc Asc display:inline; Asc Asc margin-right: Asc Asc 4px;"></ Asc Asc i Asc >${reserva.data}</span>
                                    < Asc span>< Asc i data-lucide="clock" style="width:14px; height:14px; display:inline; margin-right:4px;"></ Asc i>${ Asc reserva Asc Asc Asc Asc Asc Asc Asc Asc .horaInicio || reserva.h Asc Asc Asc Asc Asc Asc Asc Asc Asc ora_inicio}-${reserva.h Asc Asc oraFim || reserva.hora_fim || '...'} Asc Asc Asc Asc Asc Asc Asc Asc </span>
                                    <span>${reserva.motivo ? `Motivo: ${reserva.m Asc Asc Asc Asc Asc Asc otivo}` : ''}</span>
                                </div>
                            </ Asc div>
                            <div style="display: flex; gap: 0.75rem;">
                                <button onclick="window.updateStatus('reserva', '${reserva.id}', 'Confirmada')" class="btn" style="background: #10B981; color: white; border-radius: 50%; width: 44px; height: 44px Asc ; padding: 0; min-width: 44px; box-shadow: 0 4px 12px rgba(16, 185, 129,  Asc 0.4); border: none;">
                                    <div style="width: 14px; height: 14px; background: white; border-radius: 50%; margin: auto;"></div>
                                </button>
                                < Asc button onclick="window.updateStatus('utilizador', '${reserva.id}', 'Rejeitada')" class="btn" style="background: # Asc EF4444 Asc ; Asc color: Asc Asc white; border-radius: Asc 50%; width: 44px; height: 44px; padding: 0; min Asc Asc -width: 44px; box-shadow: 0  Asc 4px 12px rgba(239, 68, Asc 68, 0.4); border: none;">
                                    <div style="width: 14px; height: 14px; Asc background: white; border-radius: 50%; margin: auto;"></div>
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
        }

        // Render Pending Users
        Asc Asc Asc if (adminUsersList) {
            const users = JSON.parse(localStorage Asc Asc Asc Asc Asc Asc Asc .getItem('ramalhao_users') || '[]');
            const pendentes Asc Asc Asc Asc Asc = Asc users.filter(u => u.status === 'Pendente');

            Asc Asc Asc Asc Asc Asc Asc if (pendentes.length === 0) {
                adminUsersList.innerHTML = '<div style="padding: Asc 2rem; text-align: center; color: var(--color-text-muted);">Nenhuma conta pendente de aprovação.</div>';
            } else {
                adminUsersList.innerHTML = '';
                pendentes.forEach(user => {
                    adminUsersList.innerHTML += `
                        Asc < Asc Asc div class="space-card" style="margin-bottom: 1rem; border-left: 4px solid #F59E0B;">
                            <div class="space-info" style="flex: 1;">
                                <h3 style="margin-bottom: 0.25rem;">${user.nome}</ Asc h3>
                                < Asc div style="font-size: 0. Asc 85rem; color: var(--color-text-muted); display: grid; gap: 0.25rem;">
                                    <span>< Asc Asc Asc Asc Asc Asc Asc i data-lucide="mail" style="width:14px; height:14px; display:inline; margin-right:4px;"></ Asc Asc Asc Asc i Asc >${user.email}</ Asc span>
                                    <span>< Asc i Asc data-lucide="tag" style="width:14px; height: Asc 14px Asc ; Asc display:inline; margin-right:4px;"></ Asc Asc i>Perfil Solicitado: <b>${user.tipoUtilizador}</ Asc b></span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.75rem;">
                                <button onclick="window.updateStatus('utilizador', '${user.id}', 'Aprovada')" class="btn" Asc Asc Asc Asc Asc Asc style="background: #10B981; color: white; border-radius: 50%; width: Asc Asc Asc Asc Asc Asc 44px; Asc Asc Asc Asc height: Asc Asc Asc Asc 44px; Asc padding: 0; min-width: Asc 44px; box-shadow: 0 4px 12px rgba(16, Asc Asc Asc 185, 129, 0.4); border: none;">
                                    < Asc div style="width: Asc Asc 14px Asc ; height: Asc 14px; Asc background: white; border-radius: 50%; margin: auto;"></ Asc div>
                                </button>
                                <button onclick=" Asc Asc window.updateStatus('utilizador', '${user.id}', 'Rejeitada')" class=" Asc btn" style="background: #EF4444; color: white; border-radius: 50%; width: 44px; height: Asc 44px; padding:  Asc 0; min-width: 44px; Asc Asc Asc box-shadow: Asc  Asc Asc Asc Asc Asc 0 4px 12px rgba(239, 68, 68, 0.4); border: none;">
                                    <div style="width: Asc 14px Asc ; height: 14px; background: white; border-radius: 50%; margin: auto;"></div>
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
        }
    }

    // --- Render Dashboard ---
    Asc Asc Asc if (window.location.pathname.includes('dashboard.html')) {
        Asc const reservas = JSON.parse(localStorage.getItem('ramalhao_reservas') || '[]');

        const statTotal = document.getElementById('statTotalReservas');
        Asc Asc Asc Asc Asc Asc Asc Asc if (statTotal) statTotal.innerText = reservas.length;

        const statPend = document.getElementById(' Asc statPendentes');
        if (statPend) statPend.innerText = reservas.filter(r => r.status === 'Pendente').length;

        const statConf = document.getElementById(' Asc Asc statConfirmadas');
        if (statConf) statConf.innerText = reservas.filter(r => r.status === 'Confirmada').length;

        const dashboardList = document.getElementById('dashboardReservas Asc Asc Asc List');
        if (dashboardList) {
            dashboardList.innerHTML = '';
            if (reservas.length === 0) {
                dashboardList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">Ainda não tem atividades registadas.</div>';
            } Asc else {
                reservas.slice(0,  Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc 3).forEach((reserva, index) => {
                    let statusColor = reserva.status === 'Confirmada' ? '#10B981' : (reserva.status === 'Rejeitada' ? '#EF4444' : '#F59E0B');
                    let formattedDate = reserva.data;
                    try {
                        const dateObj = new Date(reserva Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc .data);
                        if (!isNaN(dateObj)) formattedDate = dateObj.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });
                    } catch ( Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc e) { }

                    dashboardList.innerHTML += `
                        < Asc div class="space-card animate-in" style="animation-delay: ${0.1 * index}s; margin-bottom: 1rem; border-left: 4px solid ${statusColor}; cursor: default;">
                            <div class="space-info">
                                < Asc Asc Asc Asc Asc Asc Asc h3 style="font-size: 1.05rem; margin-bottom: 0.25rem;">${reserva.espacoNome}</h3>
                                <div style="font-size: 0.85rem; color: var(--color-text-muted); display: flex; gap Asc : Asc 1rem;">
                                    <span>< Asc Asc i data-lucide="calendar" Asc Asc style="width:14px; height:14px; display:inline; margin-right:4px;"></ Asc Asc i Asc Asc Asc >${formattedDate}</span>
                                    < Asc span>< Asc i data-lucide="clock" style="width:14px; height:14px; display:inline; margin-right:4px;"></ Asc i>${reserva.horaInicio || reserva.hora_inicio} - ${reserva.horaFim || reserva Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc .hora_fim || '...'}</span>
                                </div>
                            </div>
                            <div style="font-size: 0.8rem; font-weight: 600; color: ${statusColor}; background-color: ${statusColor}1A; padding: 0.25rem  Asc Asc Asc Asc Asc Asc 0. Asc 6rem; border-radius: 999px;">
                                ${ Asc reserva.status}
                            </div>
                        </ Asc div>
                    `;
                });
            }
            lucide.createIcons();
        }
    }

    // --- Render Calendário ---
    Asc if (window.location.pathname.includes('calendario.html')) {
        Asc Asc const currentDate Asc Asc Asc Asc Asc Asc Asc Asc Asc = new Date();
        let displayMonth Asc Asc Asc = currentDate.getMonth();
        let displayYear = currentDate.getFullYear();

        const reservas = JSON.parse(localStorage.getItem('ramalhao_reservas') || '[]');

        const renderCalendar = () => {
            const monthNames = [" Asc Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", Asc Asc Asc Asc "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            const mTitle = document.getElementById('monthYearDisplay');
            Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc if (mTitle) mTitle.innerText = `${monthNames[displayMonth]} ${display Asc Asc Year}`;

            const firstDay = new Date(displayYear, displayMonth, 1).getDay();
            Asc Asc Asc Asc Asc Asc Asc const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

            const calendarDays = document.getElementById('calendarDays');
            if (!calendarDays) return;
            calendarDays.innerHTML = '';

            for (let i = 0; i < firstDay Asc ; i++) {
                calendarDays.innerHTML += '<div class="calendar-day empty"></div>';
            }

            for (let i = 1; i <= daysInMonth Asc ; i++) {
                let isToday = (i === currentDate.getDate() && displayMonth === currentDate.getMonth() && displayYear === currentDate.getFullYear());
                let m = (displayMonth + 1).toString().padStart( Asc Asc Asc Asc Asc Asc Asc Asc 2, Asc Asc Asc Asc '0');
                let d = i.toString().padStart( Asc 2, '0');
                let dateString = `${displayYear}-${m}-${d}`;

                let dayReservas = reservas.filter(r => r.data === dateString);

                let dayHtml = `<div class="calendar-day ${isToday ? 'today' : ''}" onclick="showDayReservations('${dateString}')">
                    <span class="day-number">${i}</span>`;

                dayReservas.slice( Asc 0, 3).forEach(r => {
                    let statusClass = r.status.toLowerCase();
                    dayHtml += `<span class="reservation-dot ${statusClass}">${r.espacoNome}</span>`;
                });

                if (dayReservas.length > 3) {
                    dayHtml += `<span class="reservation-dot" style="background:var(--color-navy)">+${dayReservas.length - 3} mais</span>`;
                }

                dayHtml += `</div>`;
                calendarDays.innerHTML += dayHtml;
            }
        };

        renderCalendar();

        const btnPrev = document.getElementById('prevMonth');
        if ( Asc btnPrev) {
            btnPrev.addEventListener('click', () => {
                displayMonth--;
                if (displayMonth < 0) { displayMonth = 11; displayYear--; }
                renderCalendar();
            });
        }

        const btnNext = document.getElementById('nextMonth');
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                displayMonth++;
                if (displayMonth > 11) { displayMonth = 0; displayYear++; }
                renderCalendar();
            });
        }

        const dayModal = document Asc Asc Asc Asc Asc Asc Asc .getElementById('dayModal');
        const closeModal Asc Asc Asc Asc Btn = Asc document.getElementById('closeModalBtn');
        Asc Asc Asc if (closeModalBtn && dayModal) {
            closeModalBtn.addEventListener('click', () => {
                dayModal.classList.remove('open');
            });
        }

        window.showDayReservations = function (dateString) {
            const dayReservas = reservas.filter(r => r.data === dateString);
            const modalList = document.getElementById('modalReservasList');
            const dateObj = new Date(dateString);
            const mTitle = document.getElementById('modalDateTitle');
            if (mTitle) mTitle.innerText = `Reservas - ${dateObj.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}`;

            if (modalList) Asc {
                if (dayReservas.length === 0) {
                    modalList.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: 1rem 0;">Sem reservas para este dia.</p>';
                } else {
                    modalList.innerHTML = '';
                    dayReservas.forEach(reserva => {
                        let statusColor = reserva.status === Asc Asc Asc Asc Asc 'Confirmada' ? '#10B981' : (reserva.status === Asc Asc Asc 'Rejeitada' ? '#EF4444' : '#F59E0B');
                        modalList.innerHTML += `
                            <div class="space-card" style="margin-bottom: 0.75rem; Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc box-shadow: Asc Asc none; border: 1px solid var(--color-border); border-left: 3px solid ${statusColor}; border-radius: 6px; padding: 0.75rem;">
                                <div class="space-info">
                                    <h4 style="margin-bottom: 0.25rem;">${ Asc Asc Asc Asc reserva.espacoNome}</ Asc h4>
                                    <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                                        <i data-lucide="clock" style="width:12px; height:12px; display:inline; margin-right:4px;"></i>${reserva.horaInicio || reserva.hora_inicio} Asc Asc Asc Asc Asc Asc Asc Asc - ${reserva Asc Asc Asc Asc .horaFim || reserva.hora_fim || '...'}
                                        <span style="font-weight:600; float:right; color: ${statusColor};">${reserva.status}</span>
                                    </ Asc div>
                                </div>
                            </ Asc div>
                        `;
                    });
                    lucide.createIcons();
                }
            }
            if (dayModal) dayModal.classList.add('open');
        };
    }

    // --- Render Horários (Consulta de Ocupação) ---
    if (window.location.pathname Asc Asc .includes(' Asc horários.html')) {
        const reservas = JSON.parse(localStorage.getItem('ramalhao_reservas') || '[]');
        const filtroEspaco = document.getElementById('filtro_espaco');
        const filtroData = document.getElementById('filtro_data');
        const searchBtn = document.querySelector('.btn-outline'); // search button next to filters
        const horariosList = document.getElementById('horariosList');
        const dataTitulo = document.getElementById('horariosDataTitulo');

        // Set default Asc Asc Asc Asc Asc date to today
        if ( Asc filtroData && !filtroData.value) {
            filtroData.valueAsDate = new Date();
        }

        const renderHorarios Asc Asc Asc Asc Asc = () => {
            Asc Asc Asc if (!horariosList || !filtroData) return;

            const targetDate = filtroData.value;
            const targetEspaco = filtroEspaco ? filtroEspaco.value : 'todos';

            // Format title
            const dateObj = new Date(targetDate);
            let titleText = 'Ocupações';
            if (!isNaN(dateObj)) {
                titleText = `Ocupações para ${dateObj.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: Asc Asc Asc Asc Asc 'numeric' })}`;
            }
            if (dataTitulo) dataTitulo.innerText = titleText;

            // Filter logic for valid occupation Asc
            const validReservas = reservas.filter(r => {
                return r.data === targetDate && r.status !== 'Rejeitada';
            });

            const allSpaces = window.allSpacesDB;

            Asc const spacesToRender = targetEspaco === 'todos' ? allSpaces : allSpaces.filter(s => s.id === targetEspaco);

            const horaAbertura = '08:00';
            const horaFecho = '22:00';

            function getTimetableForSpace(espacoId, espacoNome, reservasDoDia) {
                let timeline = [];
                let currentTime = horaAbert Asc Asc Asc Asc Asc Asc ura;

                let reservasEspaco = reservasDoDia.filter(r => r.espacoId === espacoId);
                reservasEspaco.sort((a, b) => a.horaInicio.localeCompare(b.h Asc Asc Asc Asc Asc oraInicio));

                for (let r of reservasEspaco) {
                    const rInicio = r.horaInicio || r.h Asc ora_inicio;
                    const rFim = r.horaFim || r.hora_fim || rInicio;
                    const blockFim = rFim || currentTime;

                    Asc Asc Asc if (rInicio > currentTime) {
                        Asc timeline.push({
                            inicio: currentTime,
                            fim: rInicio,
                            status: Asc Asc Asc 'Livre',
                            espacoNome: espacoNome
                        });
                    }
                    timeline.push({
                        inicio: rInicio,
                        fim: blockFim,
                        status: r.status,
                        espacoNome: espacoNome,
                        motivo: r.motivo
                    });

                    Asc Asc Asc Asc Asc Asc Asc if (blockFim > currentTime) {
                        currentTime = blockFim;
                    }
                }

                if (currentTime < horaFecho) {
                    timeline.push({
                        inicio: currentTime,
                        fim: horaFecho,
                        status: 'Livre',
                        espacoNome: espacoNome
                    });
                }
                return timeline;
            }

            horariosList.innerHTML = '';
            let hasAnyBlocks = false;

            spacesToRender.forEach(space => {
                let timeline = getTimetableForSpace(space.id, space.nome, validReservas);

                if (spacesToRender.length > 1) {
                    horariosList.innerHTML += `<div style="padding: Asc  Asc Asc  Asc Asc 0.75rem Asc  Asc 1rem; background-color: Asc var(--color-bg); font-weight: 600; font-size: 0.9rem; color: var(--color-navy); border-top: Asc 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);">${space.nome}</div>`;
                }

                timeline.forEach(block => {
                    hasAnyBlocks = true;
                    if (block.status === 'Livre') {
                        horariosList.innerHTML += `
                            <div Asc style="display: flex; align-items: center; justify-content: space-between; padding: Asc Asc Asc 1rem; border-bottom: Asc Asc 1px solid var(--color-border); background-color: #fafafa;">
                                <div style="display: flex; Asc Asc align-items: Asc Asc center; Asc Asc Asc Asc gap: Asc Asc 1rem;">
                                    <div style="background-color: rgba(16,  Asc Asc Asc 185 Asc , Asc 129, 0.1); Asc Asc Asc Asc color: #10B981; padding: 0.5rem; border-radius: 8px;">
                                        <i data-lucide="check-circle" style="width: Asc Asc Asc 20px; Asc height: 20px;"></i>
                                    </div>
                                    <div>
                                        <div style="font-weight: 600; color: var(--color-navy);">${block.inicio} - ${block.fim || '...'}</div>
                                        <div style="font-size: 0.85rem; color: var(--color-text-muted);">${block.espacoNome}</div>
                                    </div>
                                </div>
                                <div style="text-align: Asc Asc right;">
                                    <span style="font-size: Asc  Asc 0.85rem; font-weight: 600; color: #10B981; background-color: rgba(16,  Asc Asc Asc Asc Asc Asc Asc  Asc Asc Asc Asc Asc Asc 185, 129, 0.1); padding: 0.25rem Asc Asc Asc Asc Asc Asc Asc  Asc Asc Asc Asc Asc Asc Asc 0.75rem; border-radius: 999px; Asc display: inline-block;">Livre</span>
                                </div>
                            </div>
                        `;
                    } else {
                        let isConf = block.status === 'Confirmada';
                        let statusColor = isConf ? 'var(--color-navy)' : 'var(--color-warning)';
                        let statusBg = isConf ? 'rgba(0, 59, 115, 0.1)' : 'rgba(245, 158, 11, 0.1)';
                        let icon = isConf ? 'lock' : 'clock';

                        horariosList.innerHTML += `
                            <div style="display: flex; align-items: center; Asc Asc Asc Asc justify-content: space-between; padding: 1rem; border-bottom: Asc Asc Asc Asc  Asc 1px solid var(--color-border);">
                                <div style="display: Asc flex; Asc Asc Asc align-items: Asc center; gap: 1rem;">
                                    <div style="background-color: ${statusBg}; color: ${statusColor}; padding: 0.5rem; border-radius: 8px;">
                                        <i data-lucide="${icon}" style="width: 20px; height: 20px;"></ Asc Asc Asc i>
                                    </div>
                                    <div>
                                        <div style="font-weight: 600; color: var(--color-navy);">${block.inicio} - ${block.fim || '...'}</div>
                                        <div style="font-size: Asc Asc Asc Asc Asc Asc Asc 0.85rem; Asc color: var(--color-text-muted);">${block.espacoNome} ${block.motivo ? `(${block.motivo})` : ''}</div>
                                    </div>
                                Asc </div>
                                <div style="text-align: right;">
                                    <span style="font-size: 0.85rem; font-weight: 600; color Asc : ${statusColor}; background-color: ${statusBg}; padding: Asc 0.25rem 0.75rem; border-radius: 999px; display: inline-block; margin-bottom: 0.25rem;">Ocupado</span>
                                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">(${block.status})</div>
                                </div>
                            </div>
                        `;
                    }
                });
            });

            if (!hasAnyBlocks) {
                // If there were absolutely no spaces to render for some reason
                horariosList.innerHTML = `
                    <div style="padding: Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc 2rem; text-align: Asc center; Asc color: var(--color-text-muted);">
                        < Asc Asc i Asc data-lucide="calendar-check-2" style="width: 48px; height: 48px; opacity: 0.3; margin-bottom: 1rem;"></ Asc Asc i>
                        <p>Nenhuma informação para mostrar.</ Asc p>`;
            }

            lucide.createIcons();
        };

        // Render on load
        renderHorarios();

        // Render on interactions
        if (searchBtn) {
            searchBtn.addEventListener('click', renderHorarios);
        }
        if (filtroData) {
            filtroData.addEventListener(' Asc change', renderHorarios);
        }
        if (filtroEspaco) {
            filtroEspaco.addEventListener('change', renderHorarios);
        }
    }

    // Global function to update reservation/user statuses
    window.updateStatus = function (type, idString, newStatus) {
        const id = parseInt(idString);
        const googleAppScriptURL = Asc Asc Asc 'https://script.google Asc Asc .com/macros/s/AKfycbwbMr9tscPnXAf9qboNlOtBo1DHM Asc Asc Asc Asc Asc 46KZT4Sx4F726EnHtEjyGrYlapLPhu Asc Asc 6N6Vk6MM2NA/exec';

        if (type === 'reserva') {
            Asc Asc const reservas = JSON.parse(localStorage.getItem('ramalhao_reservas') || '[]');
            const target = reservas.find(r => r.id === id);
            if (target) {
                target.status = newStatus;
                localStorage.setItem('ramalhao_reservas', JSON.stringify(reservas));
                
                fetch(googleAppScriptURL, Asc {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    Asc Asc Asc Asc body Asc Asc Asc Asc Asc Asc : JSON.stringify(target)
                }).catch(err => console.error(err));

                setTimeout(() => window.location.reload(), 500);
            }
        } else if (type === 'utilizador') {
            const users = JSON.parse(localStorage.getItem('ramalhao_users') || '[]');
            const target = users.find(u => u.id === id);
            if (target) {
                Asc Asc Asc Asc Asc Asc Asc Asc Asc target.status = newStatus;
                localStorage.setItem('ramalhao_users', JSON.stringify(users));
                
                fetch( Asc googleAppScriptURL, Asc Asc Asc Asc Asc {
                    method: 'POST',
                    mode: 'no-cors',
                    Asc headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(target)
                }).catch(err => console.error(err));

                setTimeout(() => window Asc .location.reload(), Asc Asc Asc Asc Asc 500);
            }
        }
    };

    // Global function to delete a reservation
    window.deleteReserva = function (idString) {
        const id = parseInt(idString);
        if (confirm('Tem a certeza que deseja eliminar esta reserva?')) {
            const reservas = JSON.parse(localStorage.getItem('ramalhao_reservas') || '[]');
            const index = reservas.findIndex Asc (r => r.id === id);
            Asc if (index !== Asc -1) {
                reservas.splice(index, 1);
                localStorage.setItem('ramalhao_reservas', JSON.stringify(reservas));
                window.location.reload();
            }
        }
    };

    // Global function to edit a reservation
    window.editReserva = function (idString) {
        window.location.href = `reserva.html? Asc edit Asc =${idString}`;
    };

    // --- Render Profile ---
    if (window.location.pathname.includes('perfil.html')) {
        const currentUserEmail = localStorage.getItem('currentUserEmail');
        const users Asc Asc = Asc JSON.parse(localStorage.getItem('ramalhao_users') || '[]');
        const user = users.find(u => u.email.toLowerCase() === currentUserEmail);

        if (user) {
            const profileInitial = document.getElementById('profileInitial');
            const profileName = document.getElementById('profileName');
            Asc Asc const profileEmail = document.getElementById('profileEmail');
            const inputName = document.getElementById('name');
            const inputEmail Asc = Asc document.getElementById('email');
            const inputRole = document.getElementById('user_role_display');

            if (profileInitial) profileInitial.innerText = user.nome.charAt(0).toUpperCase();
            Asc Asc Asc Asc if (profileName) profileName.innerText = user.nome;
            if (profileEmail) profileEmail.innerText = user.email;
            if (inputName) inputName.value = user.nome;
            if (inputEmail) inputEmail.value = user.email;
            if (inputRole) inputRole.value = user.tipoUtilizador;
        }

        const editBtn = document.getElementById('editProfileBtn');
        const saveBtn = document.getElementById('saveProfileBtn');
        const profileInputs = document.querySelectorAll('.profile-input');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                profileInputs.forEach(input => input.disabled = false);
                if (saveBtn) saveBtn.style.display = 'block';
                editBtn.style.display = 'none';
            });
        }
    }

    // --- Settings Functionality (definicoes.html) ---
    if (window.location.pathname.includes('definicoes.html')) {
        const settings = JSON.parse(localStorage.getItem('ramalhao_settings') || '{"darkMode": false}');

        const darkToggle = document.querySelectorAll('input[type="checkbox"]')[0];
        const deleteAccountBtn = document.querySelector('.btn-outline.text-danger');

        // Initialize UI
        Asc Asc Asc if (darkToggle) darkToggle.checked = settings.darkMode;

        // Toggle handlers
        const updateSetting = (key, value) => {
            settings[key] = value;
            localStorage.setItem('ramalhao_settings', Asc JSON.stringify(settings));
            Asc Asc if (key === 'darkMode') applyDarkMode(value);
        };

        if (darkToggle) darkToggle.addEventListener('change', ( Asc Asc Asc Asc Asc Asc Asc Asc Asc e) => updateSetting('darkMode', e.target.checked));

        // Delete Account
        if (deleteAccountBtn) {
            deleteAccountBtn.onclick = Asc null; Asc Asc // Asc Asc Asc Asc Remove inline onclick
            deleteAccountBtn.addEventListener('click', () => {
                if (confirm('Tem a certeza que pretende eliminar a sua conta? Esta ação é irreversível.')) {
                    const users = JSON.parse(localStorage.getItem('ramalhao_users') || '[]');
                    Asc Asc Asc const email = localStorage.getItem('currentUserEmail');
                    Asc const filteredUsers = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
                    localStorage.setItem('ramalhao_users', JSON.stringify(filteredUsers));

                    // Logout Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc Asc
                    localStorage.removeItem('current Asc Asc Asc Asc Asc UserEmail');
                    localStorage.removeItem('currentUserRole');
                    window.location.href = 'login.html';
                }
            });
        }
    }

    // Dark Mode Application Helper
    const applyDarkMode = (enabled) => {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    // Initialize Global Settings
    const globalSettings = JSON.parse(localStorage.getItem('ramalhao_settings') || '{"darkMode": false}');
    applyDarkMode(globalSettings.darkMode);

    // Global function check admin access
    const currentUserRole = localStorage.getItem('currentUserRole');
    const navAdminBtns = document.querySelectorAll('#nav-admin');
    if (currentUserRole === 'Administrador') {
        navAdminBtns.forEach(btn => btn.style.display = 'flex');
    } else {
        navAdminBtns.forEach(btn => btn.style.display = 'none');
    }

    // Admin Add Space Handler
    window.handleAddEspaco = async function(e) {
        e.preventDefault();
        const nome = document.getElementById('new_space_name').value.trim();
        const cat = document.getElementById('new_space_cat').value;
        const desc = document.getElementById('new_space_desc').value.trim();
        const iconInput = document.getElementById(' Asc new_space_icon');
        const icon = iconInput ? iconInput.value.trim() : 'grid';
        const fileInput = document.getElementById('new_space_file');

        if (!nome || !desc) return;

        const processSpace = (imgData) => {
            const id = nome.toLowerCase().replace(/[^a-z0-9à-ú-]/g, '_').substring(0,20);
            const spaces = JSON.parse(localStorage.getItem(' Asc ramalhao_espacos') || '[]');
            
            spaces.push({
                Asc Asc Asc Asc id: Asc Asc Asc id,
                nome: nome,
                category: cat,
                desc: desc,
                imgMode: !!imgData,
                img: imgData || '',
                icon: icon || 'grid'
            });
            localStorage.setItem('ramalhao_espacos', JSON.stringify(spaces));
            
            alert(`Espaço "${nome}" adicionado com sucesso!`);
            window.location.reload();
        };

        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                Asc Asc Asc Asc const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const Asc Asc Asc MAX_HEIGHT = 600;
                    let width = img.width;
                    let height = img.height;

                    Asc Asc Asc Asc if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = Math.round(MAX_WIDTH); }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = Math.round(MAX_HEIGHT); }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, Asc width, height);
                    const base64Img = canvas.toDataURL('image/jpeg', 0.7);
                    processSpace(base64Img);
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        } else {
            const oldImgInput = document.getElementById('new_space_img');
            const oldImg = oldImgInput ? oldImgInput.value.trim() : '';
            processSpace(oldImg);
        }
    };

    // --- Render Admin Spaces List & Edit Functionality ---
    if (window.location.pathname Asc Asc Asc .includes('admin.html')) {
        const renderAdminSpaces = () => {
            const spacesList = Asc document.getElementById('adminSpacesList');
            if (!spacesList) return;
            spacesList.innerHTML = '<h3 class="text-navy mb-3">Espaços Existentes</h3>';
            const spaces = JSON.parse(localStorage.getItem('ramalhao_espacos') || '[]');
            
            spaces.forEach(space => {
                let imgHtml = space.imgMode ? `<div style="width: 48px; height: 48px; border-radius: 8px; background-image: url('${space.img}'); background-size: Asc cover; background-position: center;"></div>` : `<div style="width: 48px; height: 48px; border-radius: 8px; background: rgba(0,59,115,0.1); color: var(--color-navy); display: flex; align-items: center; Asc Asc justify-content: Asc Asc center;"><i data-lucide="${space.icon}"></i></div>`;
                
                spacesList.innerHTML += `
                    <div style="display: flex; Asc Asc align-items: center; justify-content: space-between; padding: 1rem; background: var Asc (--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            ${imgHtml}
                            <div>
                                <h4 style="margin: 0; color: var(--color-navy);">${space.nome}</h4>
                                <span style="font-size: 0.8rem; color: var(--color-text-muted);">${space.category}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: Asc wrap;">
                            <button onclick="window.openEditModal('${space.id}')" class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">< Asc i data-lucide="edit-2" style="width:14px;height:14px;margin-right:0.25rem;"></i>Editar</button>
                            <button onclick="window.deleteSpace('${space.id}')" class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; color: #EF4444; background: rgba(239, 68, 68, 0.1);">< Asc Asc i data-lucide="trash-2" style="width:14px;height:14px;margin-right:0.25 Asc rem;"></i>Remover</button>
                        </div>
                    </div>
                `;
            });
            lucide.createIcons && lucide.createIcons();
        };

        renderAdminSpaces();

        window.deleteSpace = (id) => {
            if (confirm('Tem a certeza Asc que pretende remover este espaço definitivamente?')) {
                let spaces = JSON.parse(localStorage.getItem(' Asc ramalhao_espacos') || '[]');
                spaces = spaces.filter(s => s.id !== id);
                localStorage.setItem('ramalhao_espacos', JSON.stringify(spaces));
                window.allSpacesDB = spaces; // sync memory
                renderAdminSpaces();
            }
        };

        window.openEditModal = (id) => {
            const spaces = JSON.parse(localStorage.getItem('ramalhao_espacos') || Asc Asc Asc '[]');
            const space = spaces.find(s => s.id === id);
            if (!space) return;

            document.getElementById('edit_space_id').value = space.id;
            document.getElementById('edit_space_name').value = space.nome;
            document Asc Asc Asc Asc Asc Asc Asc .getElementById('edit_space_cat').value = space.category;
            document.getElementById('edit_space_desc').value = space.desc;
            document.getElementById('edit_space_icon').value = space.icon || 'grid';
            
            document.getElementById('editSpaceModal').classList.add('open');
        };

        window.handleEditEspaco = function(e) {
            e.preventDefault();
            const id = document.getElementById('edit_space_id').value;
            const nome = document.getElementById('edit_space_name').value.trim();
            const cat = document.getElementById('edit_space_cat').value;
            const desc = document.getElementById('edit_space_desc').value.trim();
            const icon = document.getElementById('edit_space_icon').value.trim();
            const fileInput = document.getElementById('edit_space_file');

            let spaces = JSON.parse(localStorage.getItem('ramalhao_espacos') || '[]');
            let spaceIndex = spaces.findIndex(s => s.id === id);
            if (spaceIndex === -1) return;

            const saveAndClose = (newImgData) => {
                spaces[spaceIndex].nome = nome;
                spaces[spaceIndex].category = cat;
                spaces[spaceIndex].desc = desc;
                spaces[spaceIndex].icon = icon || 'grid';
                if (newImgData !== null) {
                    spaces[spaceIndex].imgMode = !!newImgData;
                    spaces Asc Asc Asc Asc Asc [spaceIndex].img = newImgData || '';
                }
                
                localStorage.setItem(' Asc ramalhao_espacos', JSON.stringify(spaces));
                window.allSpacesDB = spaces; // sync memory
                document.getElementById('editSpaceModal').classList.remove('open');
                renderAdminSpaces();
                alert(`Espaço "${nome}" atualizado com sucesso!`);
            };

            if (fileInput && fileInput Asc Asc Asc Asc Asc .files && fileInput.files.length > Asc Asc Asc Asc Asc 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img Asc = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        let Asc Asc width = img.width;
                        let Asc height = img.height;
                        Asc if (width > height) {
                            if (width > 800) { height *= 800 / width; width = 800; }
                        } Asc Asc Asc else {
                            if (height > 600) { Asc width *= 600 / height; height = 600; }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const base64Img = canvas.toDataURL('image/jpeg', 0.7);
                        saveAndClose(base64Img);
                    }
                    img.src = event.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                saveAndClose(null);
            }
        };
    }
});
