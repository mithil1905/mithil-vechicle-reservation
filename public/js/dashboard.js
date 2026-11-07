// =====================================================================
// Dashboard JavaScript - Mithil Vehicle Reservation System
// =====================================================================

document.addEventListener('DOMContentLoaded', async () => {
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const response = await apiCall('/api/stats');
        if (response.success) {
            const data = response.data;

            // Stat Cards
            document.getElementById('statCustomers').innerText = data.totalCustomers;
            document.getElementById('statVehicles').innerText = data.totalVehicles;
            document.getElementById('statPendingServices').innerText = data.pendingServices;
            document.getElementById('statRevenue').innerText = '₹ ' + formatINR(data.totalRevenue);

            // Hero Mini Stats
            document.getElementById('heroActiveJobs').innerText = data.pendingServices;
            document.getElementById('heroTotalFleet').innerText = data.totalVehicles;
            document.getElementById('heroRevenue').innerText = '₹ ' + formatINR(data.totalRevenue);

            // Populate Recent Services
            renderRecentServices(data.recentServices);
        }
    } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
    }
}

function renderRecentServices(services) {
    const tbody = document.getElementById('recentServicesTableBody');
    if (!services || services.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    No service reservations found in database.
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
                <td><span class="reg-plate">${s.registration_number}</span></td>
                <td>${s.brand} ${s.model}</td>
                <td>${s.customer_name}</td>
                <td><span style="color: var(--saffron); font-weight: 600;">${s.service_type}</span></td>
                <td>${formatDate(s.service_date)}</td>
                <td><span class="inr-price">${formatINR(s.estimated_cost)}</span></td>
                <td><span class="status-badge ${statusClass}">${s.status}</span></td>
            </tr>
        `;
    }).join('');
}

