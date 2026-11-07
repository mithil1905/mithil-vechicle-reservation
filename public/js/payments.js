// =====================================================================
// Payments CRUD JavaScript - Mithil Vehicle Reservation System
// =====================================================================

let currentPayments = [];
let availableServices = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchPayments();
    loadServiceDropdowns();
});

// Load service records for select dropdown
async function loadServiceDropdowns() {
    try {
        const res = await apiCall('/api/services');
        if (res.success) {
            availableServices = res.data;
            populateServiceSelects();
        }
    } catch (err) {
        console.error('Failed to load services for payment select:', err);
    }
}

function populateServiceSelects() {
    const optionsHtml = availableServices.map(s => 
        `<option value="${s.service_id}" data-cost="${s.estimated_cost}">#JOB-${s.service_id}: ${s.registration_number} - ${s.service_type} (₹${formatINR(s.estimated_cost)})</option>`
    ).join('');

    const addSelect = document.getElementById('payServiceId');
    if (addSelect) {
        addSelect.innerHTML = `<option value="">Select service job card...</option>` + optionsHtml;
    }

    const editSelect = document.getElementById('editPayServiceId');
    if (editSelect) {
        editSelect.innerHTML = `<option value="">Select service job card...</option>` + optionsHtml;
    }
}

// When service is selected in form, auto-fill amount
function onServiceSelect(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const cost = selectedOption.getAttribute('data-cost');
    if (cost) {
        document.getElementById('payAmount').value = cost;
    }
}

// READ: Fetch all payments
async function fetchPayments() {
    try {
        const status = document.getElementById('paymentStatusFilter').value;
        const url = status ? `/api/payments?status=${encodeURIComponent(status)}` : '/api/payments';

        const res = await apiCall(url);
        if (res.success) {
            currentPayments = res.data;
            renderPaymentsTable(currentPayments);
        }
    } catch (err) {
        console.error('Failed to load payments:', err);
    }
}

function handlePaymentFilter() {
    fetchPayments();
}

// Render Table
function renderPaymentsTable(payments) {
    const tbody = document.getElementById('paymentsTableBody');
    if (!payments || payments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <i class="fa-solid fa-receipt" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                    No payments found. Click <strong>"Record Payment"</strong> to register a transaction.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = payments.map(p => {
        let statusClass = 'paid';
        if (p.payment_status === 'Pending') statusClass = 'pending';
        if (p.payment_status === 'Failed') statusClass = 'failed';

        return `
            <tr>
                <td><strong>#REC-${p.payment_id}</strong></td>
                <td>
                    <span style="font-family: monospace; font-size: 0.8rem; background: rgba(255, 153, 51, 0.12); color: var(--saffron); padding: 2px 6px; border-radius: 4px;">
                        ${p.transaction_ref || 'UPI-REF-NA'}
                    </span>
                </td>
                <td><span class="reg-plate">${p.registration_number}</span></td>
                <td>
                    <div style="font-weight: 600;">${p.customer_name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-phone"></i> +91 ${p.customer_phone || '-'}</div>
                </td>
                <td><span style="color: var(--saffron); font-size: 0.85rem;">${p.service_type}</span></td>
                <td><span class="inr-price">${formatINR(p.amount)}</span></td>
                <td>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);"><i class="fa-solid fa-shield-halved" style="color: var(--emerald);"></i> ${p.payment_mode}</span>
                </td>
                <td><span class="status-badge ${statusClass}">${p.payment_status}</span></td>
                <td>${formatDate(p.payment_date)}</td>
                <td style="text-align: right;">
                    <div class="table-actions" style="justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" title="View / Print Tax Invoice" onclick="viewInvoiceReceipt(${p.payment_id})">
                            <i class="fa-solid fa-print"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="Edit Payment" onclick="openEditPaymentModal(${p.payment_id})">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" title="Delete Payment" onclick="triggerDeletePayment(${p.payment_id}, '${p.transaction_ref}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// CREATE Modal
function openAddPaymentModal() {
    loadServiceDropdowns();
    document.getElementById('addPaymentForm').reset();
    document.getElementById('payTxnRef').value = `UPI/${new Date().getFullYear()}/MTHL/${Math.floor(10000000 + Math.random() * 90000000)}`;
    openModal('addPaymentModal');
}

// CREATE Submit
async function savePayment(e) {
    e.preventDefault();
    const service_id = document.getElementById('payServiceId').value;
    const amount = document.getElementById('payAmount').value;
    const payment_mode = document.getElementById('payMode').value;
    const payment_status = document.getElementById('payStatus').value;
    const transaction_ref = document.getElementById('payTxnRef').value.trim();

    try {
        const res = await apiCall('/api/payments', 'POST', {
            service_id, amount, payment_mode, payment_status, transaction_ref
        });

        if (res.success) {
            showToast('Payment transaction recorded successfully!', 'success');
            closeModal('addPaymentModal');
            fetchPayments();
        }
    } catch (err) {
        // Handled
    }
}

// UPDATE Modal Prefill
function openEditPaymentModal(id) {
    const p = currentPayments.find(item => item.payment_id === id);
    if (!p) return;

    loadServiceDropdowns();
    document.getElementById('editPayId').value = p.payment_id;
    document.getElementById('editPayServiceId').value = p.service_id;
    document.getElementById('editPayAmount').value = p.amount;
    document.getElementById('editPayMode').value = p.payment_mode;
    document.getElementById('editPayStatus').value = p.payment_status;
    document.getElementById('editPayTxnRef').value = p.transaction_ref || '';

    openModal('editPaymentModal');
}

// UPDATE Submit
async function updatePayment(e) {
    e.preventDefault();
    const id = document.getElementById('editPayId').value;
    const service_id = document.getElementById('editPayServiceId').value;
    const amount = document.getElementById('editPayAmount').value;
    const payment_mode = document.getElementById('editPayMode').value;
    const payment_status = document.getElementById('editPayStatus').value;
    const transaction_ref = document.getElementById('editPayTxnRef').value.trim();

    try {
        const res = await apiCall(`/api/payments/${id}`, 'PUT', {
            service_id, amount, payment_mode, payment_status, transaction_ref
        });

        if (res.success) {
            showToast('Payment record updated successfully!', 'success');
            closeModal('editPaymentModal');
            fetchPayments();
        }
    } catch (err) {
        // Handled
    }
}

// DELETE Trigger
function triggerDeletePayment(id, txnRef) {
    confirmDelete(
        'Confirm Payment Record Deletion',
        `Are you sure you want to delete payment receipt "#REC-${id}" (Ref: ${txnRef})?`,
        async () => {
            try {
                const res = await apiCall(`/api/payments/${id}`, 'DELETE');
                if (res.success) {
                    showToast(`Payment #REC-${id} deleted successfully`, 'success');
                    fetchPayments();
                }
            } catch (err) {
                // Handled
            }
        }
    );
}

// View / Print Invoice Receipt (Indian Garage Tax Invoice Layout)
function viewInvoiceReceipt(id) {
    const p = currentPayments.find(item => item.payment_id === id);
    if (!p) return;

    const modalContent = document.getElementById('invoiceReceiptContent');
    modalContent.innerHTML = `
        <div style="text-align: center; border-bottom: 2px dashed #334155; padding-bottom: 1.2rem; margin-bottom: 1.2rem;">
            <div style="font-size: 1.4rem; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">MITHIL VEHICLE RESERVATION SYSTEM</div>
            <div style="font-size: 0.85rem; color: var(--saffron);">Authorized Multi-Brand Automotive Service Center</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">GSTIN: 29AAAAA0000A1Z5 | Indiranagar, Bengaluru, KA</div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 1rem;">
            <div>
                <strong style="color: #ffffff;">Billed To:</strong><br>
                ${p.customer_name}<br>
                <i class="fa-solid fa-phone" style="color: var(--saffron);"></i> +91 ${p.customer_phone || '-'}
            </div>
            <div style="text-align: right;">
                <strong style="color: #ffffff;">Receipt #:</strong> REC-${p.payment_id}<br>
                <strong>Date:</strong> ${formatDate(p.payment_date)}<br>
                <strong>Vehicle:</strong> <span class="reg-plate" style="font-size: 0.75rem; padding: 2px 6px;">${p.registration_number}</span>
            </div>
        </div>

        <div style="background: #1e293b; border-radius: 8px; padding: 12px; margin-bottom: 1.2rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 700; color: #ffffff; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 6px;">
                <span>Service Description</span>
                <span>Amount (INR)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
                <span>${p.service_type} (${p.brand} ${p.model})</span>
                <span class="inr-price">${formatINR(p.amount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
                <span>GST / SGST (18% inclusive)</span>
                <span>Included</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; color: #ffffff; border-top: 1px dashed #475569; padding-top: 8px;">
                <span>Total Paid</span>
                <span class="inr-price" style="color: var(--emerald);">${formatINR(p.amount)}</span>
            </div>
        </div>

        <div style="font-size: 0.8rem; color: var(--text-muted); background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 6px; padding: 8px 12px;">
            <div><strong>Payment Mode:</strong> ${p.payment_mode}</div>
            <div><strong>Transaction Reference:</strong> ${p.transaction_ref || 'UPI/VERIFIED/DIRECT'}</div>
            <div><strong>Status:</strong> <span style="color: var(--emerald); font-weight: 700;">${p.payment_status}</span></div>
        </div>

        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.78rem; color: var(--text-muted);">
            धन्यवाद (Thank You) for choosing Mithil Vehicle Reservation System!<br>
            Drive Safe & Follow Traffic Guidelines on Bharat Roads.
        </div>
    `;

    openModal('receiptModal');
}

