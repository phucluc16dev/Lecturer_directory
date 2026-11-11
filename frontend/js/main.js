import { lecturerApi } from './api.js';

const elements = {
    list: document.querySelector('#lecturerList'),
    dialog: document.querySelector('#lecturerDialog'),
    deleteDialog: document.querySelector('#deleteDialog'),
    form: document.querySelector('#lecturerForm'),
    searchForm: document.querySelector('#searchForm'),
    searchInput: document.querySelector('#searchInput'),
    status: document.querySelector('#statusMessage'),
    resultSummary: document.querySelector('#resultSummary'),
    lecturerCount: document.querySelector('#lecturerCount'),
    classCount: document.querySelector('#classCount'),
    lecturerId: document.querySelector('#lecturerId'),
    lecturerName: document.querySelector('#lecturerName'),
    lecturerSumClass: document.querySelector('#lecturerSumClass'),
    lecturerImageFile: document.querySelector('#lecturerImageFile'),
    lecturerImageUrl: document.querySelector('#lecturerImageUrl'),
    previewImage: document.querySelector('#previewImage'),
    previewInitials: document.querySelector('#previewInitials'),
    removeImageButton: document.querySelector('#removeImageButton'),
    dialogTitle: document.querySelector('#dialogTitle'),
    formMode: document.querySelector('#formMode'),
    formError: document.querySelector('#formError'),
    saveButton: document.querySelector('#saveButton'),
    deleteLecturerName: document.querySelector('#deleteLecturerName'),
    confirmDeleteButton: document.querySelector('#confirmDeleteButton'),
    toast: document.querySelector('#toast'),
};

const state = {
    lecturers: [],
    image: '',
    deleteId: null,
    loadSequence: 0,
    toastTimer: null,
};

function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

function initials(name = '') {
    const words = name.trim().split(/\s+/).filter(Boolean);
    return (words.length ? words.slice(-2).map(word => word[0]) : ['L', 'T'])
        .join('')
        .toLocaleUpperCase('vi-VN');
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString('vi-VN');
}

function renderLecturers(items) {
    if (!items.length) {
        const keyword = elements.searchInput.value.trim();
        elements.list.innerHTML = `
            <tr class="state-row"><td colspan="5">
                <div class="empty-state">
                   
                    <strong>${keyword ? 'No lecturers found' : 'No lecturers yet'}</strong>
                    <span>${keyword ? 'Try a different search term.' : 'Add your first record to get started.'}</span>
                </div>
            </td></tr>`;
        return;
    }

    elements.list.innerHTML = items.map(lecturer => {
        const id = Number(lecturer.IDGV);
        const name = escapeHTML(lecturer.Fullname);
        const image = lecturer.Image ? escapeHTML(lecturer.Image) : '';
        const avatar = image
            ? `<span class="avatar"><img src="${image}" alt="Photo of ${name}"><span>${initials(lecturer.Fullname)}</span></span>`
            : `<span class="avatar avatar--initials"><span>${initials(lecturer.Fullname)}</span></span>`;

        return `
            <tr>
                <td data-label="Lecturer ID"><span class="id-chip">LEC-${String(id).padStart(3, '0')}</span></td>
                <td data-label="Photo">${avatar}</td>
                <td data-label="Full name"><strong class="lecturer-name">${name}</strong></td>
                <td data-label="Classes"><span class="class-count">${formatNumber(lecturer.SumClass)}</span></td>
                <td data-label="Actions">
                    <div class="row-actions">
                        <button class="action-button" type="button" data-action="edit" data-id="${id}" aria-label="Edit ${name}">
                            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 6 4 4M5 19l3.5-.7L19 7.8 16.2 5 5.7 15.5 5 19Z"/></svg><span>Edit</span>
                        </button>
                        <button class="action-button action-button--danger" type="button" data-action="delete" data-id="${id}" aria-label="Delete ${name}">
                            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M8 7l1 13h6l1-13M11 11v5m2-5v5"/></svg><span>Delete</span>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function updateSummary(items) {
    const totalClasses = items.reduce((sum, lecturer) => sum + Number(lecturer.SumClass || 0), 0);
    elements.lecturerCount.textContent = formatNumber(items.length);
    elements.classCount.textContent = formatNumber(totalClasses);
    const keyword = elements.searchInput.value.trim();
    elements.resultSummary.textContent = keyword
        ? `${formatNumber(items.length)} results for “${keyword}”`
        : `${formatNumber(items.length)} lecturers in the database`;
}

async function loadLecturers(keyword = '') {
    const sequence = ++state.loadSequence;
    elements.status.textContent = '';
    elements.list.innerHTML = '<tr class="state-row"><td colspan="5"><span class="loader" aria-hidden="true"></span>Loading records…</td></tr>';

    try {
        const result = await lecturerApi.getAll(keyword);
        if (sequence !== state.loadSequence) return;
        state.lecturers = result.data;
        renderLecturers(state.lecturers);
        updateSummary(state.lecturers);
    } catch (error) {
        if (sequence !== state.loadSequence) return;
        state.lecturers = [];
        elements.list.innerHTML = '<tr class="state-row state-row--error"><td colspan="5">Unable to load records. Check the backend and MySQL connection.</td></tr>';
        elements.status.textContent = error.message;
        elements.resultSummary.textContent = 'Database connection unavailable';
        elements.lecturerCount.textContent = '—';
        elements.classCount.textContent = '—';
    }
}

function setPreview(image, name = '') {
    state.image = image || '';
    elements.previewInitials.textContent = initials(name || elements.lecturerName.value);
    elements.previewImage.classList.remove('is-visible');
    elements.previewImage.removeAttribute('src');

    if (state.image) {
        elements.previewImage.src = state.image;
        elements.previewImage.classList.add('is-visible');
    }
    elements.removeImageButton.disabled = !state.image;
}

function openDialog(lecturer = null) {
    elements.form.reset();
    elements.formError.textContent = '';
    elements.lecturerId.value = lecturer?.IDGV ?? '';
    elements.lecturerName.value = lecturer?.Fullname ?? '';
    elements.lecturerSumClass.value = lecturer?.SumClass ?? 0;
    const existingImage = lecturer?.Image ?? '';
    elements.lecturerImageUrl.value = existingImage.startsWith('http') ? existingImage : '';
    setPreview(existingImage, lecturer?.Fullname ?? '');
    elements.dialogTitle.textContent = lecturer ? 'Update lecturer' : 'Add lecturer';
    elements.formMode.textContent = lecturer ? `ID LEC-${String(lecturer.IDGV).padStart(3, '0')}` : 'New record';
    elements.saveButton.querySelector('span').textContent = lecturer ? 'Save changes' : 'Save lecturer';
    elements.dialog.showModal();
    requestAnimationFrame(() => elements.lecturerName.focus());
}

function closeDialog() {
    if (elements.saveButton.classList.contains('is-loading')) return;
    elements.dialog.close();
}

function showToast(message) {
    window.clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 3200);
}

function setSaving(isSaving) {
    elements.saveButton.classList.toggle('is-loading', isSaving);
    elements.saveButton.disabled = isSaving;
}

document.querySelectorAll('#headerAddButton, #addButton, #mobileAddButton')
    .forEach(button => button.addEventListener('click', () => openDialog()));

document.querySelector('#closeDialogButton').addEventListener('click', closeDialog);
document.querySelector('#cancelButton').addEventListener('click', closeDialog);

elements.dialog.addEventListener('click', event => {
    if (event.target === elements.dialog) closeDialog();
});

elements.lecturerName.addEventListener('input', () => {
    elements.previewInitials.textContent = initials(elements.lecturerName.value);
});

elements.lecturerImageFile.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) return;
    elements.formError.textContent = '';

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        elements.formError.textContent = 'Choose a JPG, PNG, WEBP, or GIF file.';
        event.target.value = '';
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        elements.formError.textContent = 'The image must not exceed 2 MB.';
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
        elements.lecturerImageUrl.value = '';
        setPreview(String(reader.result));
    });
    reader.readAsDataURL(file);
});

elements.lecturerImageUrl.addEventListener('change', event => {
    const value = event.target.value.trim();
    if (value) setPreview(value);
    else if (state.image.startsWith('http')) setPreview('');
});

elements.removeImageButton.addEventListener('click', () => {
    elements.lecturerImageFile.value = '';
    elements.lecturerImageUrl.value = '';
    setPreview('');
});

elements.previewImage.addEventListener('error', () => {
    elements.previewImage.classList.remove('is-visible');
    elements.formError.textContent = 'Unable to load the image from this URL.';
});

elements.searchForm.addEventListener('submit', event => {
    event.preventDefault();
    loadLecturers(elements.searchInput.value.trim());
});

elements.searchInput.addEventListener('search', () => {
    if (!elements.searchInput.value) loadLecturers();
});

elements.list.addEventListener('error', event => {
    const image = event.target.closest('.avatar img');
    if (image) image.classList.add('is-broken');
}, true);

elements.list.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const lecturer = state.lecturers.find(item => Number(item.IDGV) === Number(button.dataset.id));
    if (!lecturer) return;

    if (button.dataset.action === 'edit') openDialog(lecturer);
    if (button.dataset.action === 'delete') {
        state.deleteId = Number(lecturer.IDGV);
        elements.deleteLecturerName.textContent = lecturer.Fullname;
        elements.deleteDialog.showModal();
    }
});

elements.form.addEventListener('submit', async event => {
    event.preventDefault();
    elements.formError.textContent = '';

    if (!elements.form.reportValidity()) return;
    const sumClass = Number(elements.lecturerSumClass.value);
    if (!Number.isInteger(sumClass) || sumClass < 0) {
        elements.formError.textContent = 'Total classes must be a non-negative integer.';
        return;
    }

    const id = elements.lecturerId.value;
    const imageUrl = elements.lecturerImageUrl.value.trim();
    const data = {
        Fullname: elements.lecturerName.value.trim(),
        SumClass: sumClass,
        Image: imageUrl || state.image,
    };

    try {
        setSaving(true);
        const result = id
            ? await lecturerApi.update(id, data)
            : await lecturerApi.create(data);
        elements.dialog.close();
        showToast(result.message);
        await loadLecturers(elements.searchInput.value.trim());
    } catch (error) {
        elements.formError.textContent = error.message;
    } finally {
        setSaving(false);
    }
});

document.querySelector('#cancelDeleteButton').addEventListener('click', () => {
    state.deleteId = null;
    elements.deleteDialog.close();
});

elements.confirmDeleteButton.addEventListener('click', async () => {
    if (!state.deleteId) return;
    elements.confirmDeleteButton.disabled = true;
    try {
        const result = await lecturerApi.remove(state.deleteId);
        elements.deleteDialog.close();
        showToast(result.message);
        state.deleteId = null;
        await loadLecturers(elements.searchInput.value.trim());
    } catch (error) {
        elements.deleteDialog.close();
        elements.status.textContent = error.message;
    } finally {
        elements.confirmDeleteButton.disabled = false;
    }
});

loadLecturers();
