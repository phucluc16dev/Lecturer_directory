const API_BASE_URL = 'http://localhost:8000/api';

async function request(path, options = {}) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
    } catch {
        throw new Error(
            `Unable to connect to the API at ${API_BASE_URL}. ` +
            'Run: php -S localhost:8000 -t backend/public'
        );
    }

    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error('The server returned invalid JSON');
    }

    if (!response.ok) {
        throw new Error(result.message || 'The API request failed');
    }
    return result;
}

export const lecturerApi = {
    getAll(keyword = '') {
        const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
        return request(`/lecturers${query}`);
    },
    create(data) {
        return request('/lecturers', { method: 'POST', body: JSON.stringify(data) });
    },
    update(id, data) {
        return request(`/lecturers?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    remove(id) {
        return request(`/lecturers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
};
