// =====================================================================
// Customers CRUD JavaScript - Mithil Vehicle Reservation System
// =====================================================================

let currentCustomers = [];
let searchDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchCustomers();
});

// READ: Fetch all customers with optional search term
async function fetchCustomers(search = '') {
    try {
        const url = search ? `/api/customers?search=${encodeURIComponent(search)}` : '/api/customers';
        const res = await apiCall(url);
        if (res.success) {
            currentCustomers = res.data;
            renderCustomersTable(currentCustomers);
        }
    } catch (err) {
        console.error('Failed to load customers:', err);
    }
}

// Live Search handler
function handleCustomerSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        const term = document.getElementById('customerSearchInput').value.trim();
        fetchCustomers(term);
    }, 300);
}

// Render Table
function renderCustomersTable(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!customers || customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <i class="fa-solid fa-user-slash" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                    No customers found. Click <strong>"Add Customer"</strong> to create a new profile.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td><strong>#${c.customer_id}</strong></td>
            <td>
                <div style="font-weight: 700; color: #ffffff;">${c.name}</div>
            </td>
            <td>
                <span style="color: var(--saffron); font-weight: 600;"><i class="fa-solid fa-phone" style="font-size: 0.8rem;"></i> +91 ${c.phone}</span>
            </td>
            <td>${c.email || '<span style="color: var(--text-muted);">Not Provided</span>'}</td>
            <td>
                <span style="background: rgba(59, 130, 246, 0.1); color: #93c5fd; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">
                    ${c.city}, ${c.state}
                </span>
            </td>
            <td style="max-width: 220px; font-size: 0.85rem; color: var(--text-secondary);">${c.address || '-'}</td>
            <td>${formatDate(c.created_at)}</td>
            <td style="text-align: right;">
                <div class="table-actions" style="justify-content: flex-end;">
                    <button class="btn btn-secondary btn-sm" title="Edit Customer" onclick="openEditCustomerModal(${c.customer_id})">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" title="Delete Customer" onclick="triggerDeleteCustomer(${c.customer_id}, '${c.name.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// CREATE Modal
function openAddCustomerModal() {
    document.getElementById('addCustomerForm').reset();
    document.getElementById('custCity').value = 'Bengaluru';
    document.getElementById('custState').value = 'Karnataka';
    openModal('addCustomerModal');
}

// CREATE Submit
async function saveCustomer(e) {
    e.preventDefault();
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const state = document.getElementById('custState').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    try {
        const res = await apiCall('/api/customers', 'POST', {
            name, phone, email, city, state, address
        });

        if (res.success) {
            showToast('Customer profile registered successfully!', 'success');
            closeModal('addCustomerModal');
            fetchCustomers();
        }
    } catch (err) {
        // Error toast handled by apiCall
    }
}

// UPDATE Modal prefill
function openEditCustomerModal(id) {
    const customer = currentCustomers.find(c => c.customer_id === id);
    if (!customer) return;

    document.getElementById('editCustId').value = customer.customer_id;
    document.getElementById('editCustName').value = customer.name;
    document.getElementById('editCustPhone').value = customer.phone;
    document.getElementById('editCustEmail').value = customer.email || '';
    document.getElementById('editCustCity').value = customer.city || '';
    document.getElementById('editCustState').value = customer.state || '';
    document.getElementById('editCustAddress').value = customer.address || '';

    openModal('editCustomerModal');
}

// UPDATE Submit
async function updateCustomer(e) {
    e.preventDefault();
    const id = document.getElementById('editCustId').value;
    const name = document.getElementById('editCustName').value.trim();
    const phone = document.getElementById('editCustPhone').value.trim();
    const email = document.getElementById('editCustEmail').value.trim();
    const city = document.getElementById('editCustCity').value.trim();
    const state = document.getElementById('editCustState').value.trim();
    const address = document.getElementById('editCustAddress').value.trim();

    try {
        const res = await apiCall(`/api/customers/${id}`, 'PUT', {
            name, phone, email, city, state, address
        });

        if (res.success) {
            showToast('Customer record updated successfully!', 'success');
            closeModal('editCustomerModal');
            fetchCustomers();
        }
    } catch (err) {
        // Error toast handled
    }
}

// DELETE Trigger
function triggerDeleteCustomer(id, name) {
    confirmDelete(
        'Confirm Customer Deletion',
        `Are you sure you want to permanently delete customer "${name}" (ID #${id})?`,
        async () => {
            try {
                const res = await apiCall(`/api/customers/${id}`, 'DELETE');
                if (res.success) {
                    showToast(`Customer #${id} deleted successfully`, 'success');
                    fetchCustomers();
                }
            } catch (err) {
                // Handled
            }
        }
    );
}

