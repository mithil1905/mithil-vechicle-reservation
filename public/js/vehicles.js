// =====================================================================
// Vehicles CRUD JavaScript - Mithil Vehicle Reservation System
// =====================================================================

let currentVehicles = [];
let availableCustomers = [];
let vehicleSearchTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchVehicles();
    loadCustomerDropdowns();
});

// Load customers for select dropdowns
async function loadCustomerDropdowns() {
    try {
        const res = await apiCall('/api/customers');
        if (res.success) {
            availableCustomers = res.data;
            populateCustomerSelects();
        }
    } catch (err) {
        console.error('Failed to load customers for dropdown:', err);
    }
}

function populateCustomerSelects() {
    const optionsHtml = availableCustomers.map(c => 
        `<option value="${c.customer_id}">${c.name} (+91 ${c.phone}) - ${c.city}</option>`
    ).join('');

    const addSelect = document.getElementById('vehCustomerId');
    if (addSelect) {
        addSelect.innerHTML = `<option value="">Select registered customer...</option>` + optionsHtml;
    }

    const editSelect = document.getElementById('editVehCustomerId');
    if (editSelect) {
        editSelect.innerHTML = `<option value="">Select registered customer...</option>` + optionsHtml;
    }
}

// READ: Fetch all vehicles
async function fetchVehicles(search = '') {
    try {
        const url = search ? `/api/vehicles?search=${encodeURIComponent(search)}` : '/api/vehicles';
        const res = await apiCall(url);
        if (res.success) {
            currentVehicles = res.data;
            renderVehiclesTable(currentVehicles);
        }
    } catch (err) {
        console.error('Failed to load vehicles:', err);
    }
}

// Search handler
function handleVehicleSearch() {
    clearTimeout(vehicleSearchTimer);
    vehicleSearchTimer = setTimeout(() => {
        const term = document.getElementById('vehicleSearchInput').value.trim();
        fetchVehicles(term);
    }, 300);
}

// Render Table
function renderVehiclesTable(vehicles) {
    const tbody = document.getElementById('vehiclesTableBody');
    if (!vehicles || vehicles.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <i class="fa-solid fa-car-tunnel" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                    No vehicles found. Click <strong>"Add Vehicle"</strong> to register one.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = vehicles.map(v => {
        const isEV = v.fuel_type === 'Electric';
        let fuelColor = '#38bdf8';
        if (isEV) fuelColor = '#34d399';
        if (v.fuel_type === 'Diesel') fuelColor = '#fbbf24';
        if (v.fuel_type === 'CNG') fuelColor = '#a78bfa';

        return `
            <tr>
                <td><strong>#${v.vehicle_id}</strong></td>
                <td>
                    <span class="reg-plate ${isEV ? 'ev-plate' : ''}">${v.registration_number}</span>
                </td>
                <td>
                    <div style="font-weight: 700; color: #ffffff;">${v.brand} ${v.model}</div>
                </td>
                <td><span style="color: var(--text-secondary); font-size: 0.85rem;">${v.vehicle_type}</span></td>
                <td>
                    <span style="border: 1px solid ${fuelColor}; color: ${fuelColor}; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 700;">
                        ${v.fuel_type}
                    </span>
                </td>
                <td>${v.manufacture_year}</td>
                <td>
                    <div style="font-weight: 600; color: var(--saffron);">${v.customer_name || 'Unknown'}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);"><i class="fa-solid fa-phone"></i> +91 ${v.customer_phone || '-'}</div>
                </td>
                <td style="text-align: right;">
                    <div class="table-actions" style="justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" title="Edit Vehicle" onclick="openEditVehicleModal(${v.vehicle_id})">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" title="Delete Vehicle" onclick="triggerDeleteVehicle(${v.vehicle_id}, '${v.registration_number}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// CREATE Modal
function openAddVehicleModal() {
    loadCustomerDropdowns();
    document.getElementById('addVehicleForm').reset();
    document.getElementById('vehYear').value = new Date().getFullYear();
    openModal('addVehicleModal');
}

// CREATE Submit
async function saveVehicle(e) {
    e.preventDefault();
    const customer_id = document.getElementById('vehCustomerId').value;
    const registration_number = document.getElementById('vehRegNo').value.trim();
    const vehicle_type = document.getElementById('vehType').value;
    const brand = document.getElementById('vehBrand').value.trim();
    const model = document.getElementById('vehModel').value.trim();
    const fuel_type = document.getElementById('vehFuel').value;
    const manufacture_year = document.getElementById('vehYear').value;

    try {
        const res = await apiCall('/api/vehicles', 'POST', {
            customer_id, registration_number, vehicle_type, brand, model, fuel_type, manufacture_year
        });

        if (res.success) {
            showToast(`Vehicle ${registration_number} registered successfully!`, 'success');
            closeModal('addVehicleModal');
            fetchVehicles();
        }
    } catch (err) {
        // Handled
    }
}

// UPDATE Modal Prefill
function openEditVehicleModal(id) {
    const v = currentVehicles.find(item => item.vehicle_id === id);
    if (!v) return;

    loadCustomerDropdowns();
    document.getElementById('editVehId').value = v.vehicle_id;
    document.getElementById('editVehCustomerId').value = v.customer_id;
    document.getElementById('editVehRegNo').value = v.registration_number;
    document.getElementById('editVehType').value = v.vehicle_type;
    document.getElementById('editVehBrand').value = v.brand;
    document.getElementById('editVehModel').value = v.model;
    document.getElementById('editVehFuel').value = v.fuel_type;
    document.getElementById('editVehYear').value = v.manufacture_year;

    openModal('editVehicleModal');
}

// UPDATE Submit
async function updateVehicle(e) {
    e.preventDefault();
    const id = document.getElementById('editVehId').value;
    const customer_id = document.getElementById('editVehCustomerId').value;
    const registration_number = document.getElementById('editVehRegNo').value.trim();
    const vehicle_type = document.getElementById('editVehType').value;
    const brand = document.getElementById('editVehBrand').value.trim();
    const model = document.getElementById('editVehModel').value.trim();
    const fuel_type = document.getElementById('editVehFuel').value;
    const manufacture_year = document.getElementById('editVehYear').value;

    try {
        const res = await apiCall(`/api/vehicles/${id}`, 'PUT', {
            customer_id, registration_number, vehicle_type, brand, model, fuel_type, manufacture_year
        });

        if (res.success) {
            showToast('Vehicle information updated successfully!', 'success');
            closeModal('editVehicleModal');
            fetchVehicles();
        }
    } catch (err) {
        // Handled
    }
}

// DELETE Trigger
function triggerDeleteVehicle(id, regPlate) {
    confirmDelete(
        'Confirm Vehicle Deletion',
        `Are you sure you want to delete vehicle with registration number "${regPlate}" (ID #${id})?`,
        async () => {
            try {
                const res = await apiCall(`/api/vehicles/${id}`, 'DELETE');
                if (res.success) {
                    showToast(`Vehicle ${regPlate} deleted successfully`, 'success');
                    fetchVehicles();
                }
            } catch (err) {
                // Handled
            }
        }
    );
}

