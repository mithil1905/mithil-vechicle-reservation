// =====================================================================
// Services CRUD JavaScript - Mithil Vehicle Reservation System
// =====================================================================

let currentServices = [];
let availableVehicles = [];
let serviceSearchTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchServices();
    loadVehicleDropdowns();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('servDate');
    if (dateInput) dateInput.value = today;
});

// Load registered vehicles for dropdown
async function loadVehicleDropdowns() {
    try {
        const res = await apiCall('/api/vehicles');
        if (res.success) {
            availableVehicles = res.data;
            populateVehicleSelects();
        }
    } catch (err) {
        console.error('Failed to load vehicles for select:', err);
    }
}

function populateVehicleSelects() {
    const optionsHtml = availableVehicles.map(v => 
        `<option value="${v.vehicle_id}">${v.registration_number} - ${v.brand} ${v.model} (${v.customer_name})</option>`
    ).join('');

    const addSelect = document.getElementById('servVehicleId');
    if (addSelect) {
        addSelect.innerHTML = `<option value="">Select registered vehicle...</option>` + optionsHtml;
    }

    const editSelect = document.getElementById('editServVehicleId');
    if (editSelect) {
        editSelect.innerHTML = `<option value="">Select registered vehicle...</option>` + optionsHtml;
    }
}

// Preset Handler for Indian Service Packages
function applyServicePreset() {
    const preset = document.getElementById('servTypePreset');
    const selectedOption = preset.options[preset.selectedIndex];
    const typeInput = document.getElementById('servType');
    const costInput = document.getElementById('servCost');

    if (preset.value && preset.value !== 'custom') {
        typeInput.value = preset.value;
        const cost = selectedOption.getAttribute('data-cost');
        if (cost) costInput.value = cost;
    } else if (preset.value === 'custom') {
        typeInput.value = '';
        typeInput.focus();
    }
}

// READ: Fetch all services
async function fetchServices() {
    try {
        const search = document.getElementById('serviceSearchInput').value.trim();
        const status = document.getElementById('statusFilter').value;

        let url = '/api/services?';
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (status) url += `status=${encodeURIComponent(status)}&`;

        const res = await apiCall(url);
        if (res.success) {
            currentServices = res.data;
            renderServicesTable(currentServices);
        }
    } catch (err) {
        console.error('Failed to load services:', err);
    }
}

function handleServiceSearch() {
    clearTimeout(serviceSearchTimer);
    serviceSearchTimer = setTimeout(() => {
        fetchServices();
    }, 300);
}

function handleStatusFilter() {
    fetchServices();
}

// Render Table
function renderServicesTable(services) {
    const tbody = document.getElementById('servicesTableBody');
    if (!services || services.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <i class="fa-solid fa-wrench" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                    No service job cards found. Click <strong>"Book Service"</strong> to schedule one.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = services.map(s => {
        let statusClass = 'scheduled';
        if (s.status === 'In Progress') statusClass = 'in-progress';
        if (s.status === 'Ready for Delivery') statusClass = 'ready';
        if (s.status === 'Completed') statusClass = 'completed';
        if (s.status === 'Cancelled') statusClass = 'cancelled';

        return `
            <tr>
                <td><strong>#JOB-${s.service_id}</strong></td>
                <td>
                    <span class="reg-plate">${s.registration_number}</span>
                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${s.brand} ${s.model}</div>
                </td>
                <td>
                    <div style="font-weight: 600;">${s.customer_name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-phone"></i> +91 ${s.customer_phone || '-'}</div>
                </td>
                <td>
                    <span style="color: var(--saffron); font-weight: 600;">${s.service_type}</span>
                </td>
                <td>${formatDate(s.service_date)}</td>
                <td><span class="inr-price">${formatINR(s.estimated_cost)}</span></td>
                <td><span class="status-badge ${statusClass}">${s.status}</span></td>
                <td style="max-width: 220px; font-size: 0.82rem; color: var(--text-secondary);">${s.mechanic_notes || '-'}</td>
                <td style="text-align: right;">
                    <div class="table-actions" style="justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" title="Edit Service" onclick="openEditServiceModal(${s.service_id})">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" title="Delete Service" onclick="triggerDeleteService(${s.service_id}, '${s.service_type.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// CREATE Modal
function openAddServiceModal() {
    loadVehicleDropdowns();
    document.getElementById('addServiceForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('servDate').value = today;
    document.getElementById('servStatus').value = 'Scheduled';
    openModal('addServiceModal');
}

// CREATE Submit
async function saveService(e) {
    e.preventDefault();
    const vehicle_id = document.getElementById('servVehicleId').value;
    const service_type = document.getElementById('servType').value.trim();
    const service_date = document.getElementById('servDate').value;
    const status = document.getElementById('servStatus').value;
    const estimated_cost = document.getElementById('servCost').value;
    const description = document.getElementById('servDesc').value.trim();
    const mechanic_notes = document.getElementById('servNotes').value.trim();

    try {
        const res = await apiCall('/api/services', 'POST', {
            vehicle_id, service_type, service_date, status, estimated_cost, description, mechanic_notes
        });

        if (res.success) {
            showToast('Service reservation booked successfully!', 'success');
            closeModal('addServiceModal');
            fetchServices();
        }
    } catch (err) {
        // Handled
    }
}

// UPDATE Modal Prefill
function openEditServiceModal(id) {
    const s = currentServices.find(item => item.service_id === id);
    if (!s) return;

    loadVehicleDropdowns();
    document.getElementById('editServId').value = s.service_id;
    document.getElementById('editServVehicleId').value = s.vehicle_id;
    document.getElementById('editServType').value = s.service_type;
    document.getElementById('editServDate').value = s.service_date.split('T')[0];
    document.getElementById('editServStatus').value = s.status;
    document.getElementById('editServCost').value = s.estimated_cost;
    document.getElementById('editServDesc').value = s.description || '';
    document.getElementById('editServNotes').value = s.mechanic_notes || '';

    openModal('editServiceModal');
}

// UPDATE Submit
async function updateService(e) {
    e.preventDefault();
    const id = document.getElementById('editServId').value;
    const vehicle_id = document.getElementById('editServVehicleId').value;
    const service_type = document.getElementById('editServType').value.trim();
    const service_date = document.getElementById('editServDate').value;
    const status = document.getElementById('editServStatus').value;
    const estimated_cost = document.getElementById('editServCost').value;
    const description = document.getElementById('editServDesc').value.trim();
    const mechanic_notes = document.getElementById('editServNotes').value.trim();

    try {
        const res = await apiCall(`/api/services/${id}`, 'PUT', {
            vehicle_id, service_type, service_date, status, estimated_cost, description, mechanic_notes
        });

        if (res.success) {
            showToast('Service reservation updated successfully!', 'success');
            closeModal('editServiceModal');
            fetchServices();
        }
    } catch (err) {
        // Handled
    }
}

// DELETE Trigger
function triggerDeleteService(id, title) {
    confirmDelete(
        'Confirm Service Deletion',
        `Are you sure you want to delete service job "#JOB-${id}" (${title})?`,
        async () => {
            try {
                const res = await apiCall(`/api/services/${id}`, 'DELETE');
                if (res.success) {
                    showToast(`Service #JOB-${id} deleted successfully`, 'success');
                    fetchServices();
                }
            } catch (err) {
                // Handled
            }
        }
    );
}

