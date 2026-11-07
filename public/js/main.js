// =====================================================================
// MITHIL VEHICLE RESERVATION SYSTEM - MAIN UTILITIES & APIS
// =====================================================================

// Toast Notification Manager
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Modal Controllers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal on click outside container
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Indian Currency Formatter (₹)
function formatINR(number) {
    if (isNaN(number) || number === null) return '0.00';
    return Number(number).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Date Formatter (DD-MMM-YYYY)
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Standard API Fetch Wrapper
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }

        const res = await fetch(endpoint, options);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || `Request failed with status ${res.status}`);
        }
        return data;
    } catch (err) {
        console.error(`API Call failed on [${method}] ${endpoint}:`, err);
        showToast(err.message, 'error');
        throw err;
    }
}

// Generic Delete Confirmation
let deleteCallback = null;
function confirmDelete(title, message, onConfirm) {
    deleteCallback = onConfirm;
    const modal = document.getElementById('deleteConfirmModal');
    if (!modal) {
        if (confirm(`${title}\n\n${message}`)) {
            onConfirm();
        }
        return;
    }
    document.getElementById('deleteModalTitle').innerText = title;
    document.getElementById('deleteModalMessage').innerText = message;
    openModal('deleteConfirmModal');
}

document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (deleteCallback) {
                closeModal('deleteConfirmModal');
                await deleteCallback();
                deleteCallback = null;
            }
        });
    }
});

