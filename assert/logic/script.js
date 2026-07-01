 const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyh-6xG5g335gyVreT6j_Md26mf5_HthbVRr4N3ktdz5nl3EA_hWyLeVY--9zFWd4TfFA/exec';
function initBackground() {
    const bgImageUrl = "assert/img/img.jpg";
    document.body.style.backgroundImage = `url('${bgImageUrl}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
}
const gridContainer = document.getElementById('gridContainer');
const addBtnTile = document.getElementById('addBtnTile');
const modalOverlay = document.getElementById('modalOverlay');
const shortcutForm = document.getElementById('shortcutForm');
const modalTitle = document.getElementById('modalTitle');
const webName = document.getElementById('webName');
const webUrl = document.getElementById('webUrl');
const closeModalBtn = document.getElementById('closeModalBtn');
const loader = document.getElementById('loader');
let currentEditingRowId = null;
addBtnTile.addEventListener('click', () => {
    currentEditingRowId = null;
    modalTitle.innerText = "Add shortcut";
    shortcutForm.reset();
    modalOverlay.classList.add('active');
});
closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
function renderTile(item) {
    const tile = document.createElement('div');
    tile.className = 'shortcut-tile dynamic-shortcut';
    tile.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-dots-btn') && !e.target.closest('.dropdown-menu')) {
            window.open(item.url, '_blank');
        }
    });
    const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${item.url}`;
    tile.innerHTML = `
        <div class="icon-container">
            <img src="${iconUrl}" class="shortcut-icon" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1242/1242392.png'">
        </div>
        <div class="tile-title">${item.name}</div>
        <button class="menu-dots-btn">⋮</button>
        <div class="dropdown-menu">
            <div class="dropdown-item edit-opt">Edit shortcut</div>
            <div class="dropdown-item remove-opt">Remove</div>
        </div>
    `;
    const dotsBtn = tile.querySelector('.menu-dots-btn');
    const menu = tile.querySelector('.dropdown-menu');
    dotsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown-menu').forEach(m => m !== menu && m.classList.remove('show'));
        menu.classList.toggle('show');
    });
    menu.querySelector('.edit-opt').addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.remove('show');
        currentEditingRowId = item.rowId;
        modalTitle.innerText = "Edit shortcut";
        webName.value = item.name;
        webUrl.value = item.url;
        modalOverlay.classList.add('active');
    });
    menu.querySelector('.remove-opt').addEventListener('click', async (e) => {
        e.stopPropagation();
        menu.classList.remove('show');
        if (confirm(`Remove "${item.name}"?`)) {
            await handleApiCall({ action: 'delete', rowId: item.rowId });
        }
    });
    gridContainer.insertBefore(tile, addBtnTile);
}
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
});
async function loadDashboard() {
    if (!SCRIPT_URL || SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) return;
    loader.style.display = 'block';
    try {
        document.querySelectorAll('.dynamic-shortcut').forEach(el => el.remove());
        const res = await fetch(SCRIPT_URL);
        const data = await res.json();
        data.forEach(item => renderTile(item));
    } catch (err) { 
        console.error(err); 
    }
    loader.style.display = 'none';
}
shortcutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let urlVal = webUrl.value.trim();
    if (!/^https?:\/\//i.test(urlVal)) urlVal = 'https://' + urlVal;
    const payload = {
        name: webName.value.trim(),
        url: urlVal
    };
    if (currentEditingRowId) {
        payload.action = 'edit';
        payload.rowId = currentEditingRowId;
    }
    modalOverlay.classList.remove('active');
    await handleApiCall(payload);
});
async function handleApiCall(bodyData) {
    loader.style.display = 'block';
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        setTimeout(loadDashboard, 600);
    } catch (err) { console.error(err); loader.style.display = 'none'; }
}
initBackground();
loadDashboard();