// Admin JavaScript Functions

// Global variables
let currentPage = 1;
let itemsPerPage = 10;
let currentFilter = 'all';

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    loadDashboardStats();
    setupEventListeners();
});

// Initialize admin interface
function initializeAdmin() {
    // Set active menu item based on current page
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });
    
    // Initialize tooltips and modals
    initializeModals();
    initializeTables();
}

// Setup event listeners
function setupEventListeners() {
    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Search functionality
    const searchInputs = document.querySelectorAll('.search-box input');
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(handleSearch, 300));
    });
    
    // Filter functionality
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', handleFilter);
    });
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close, .modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.closest('.modal'));
            }
        });
    });
}

// Modal functions
function initializeModals() {
    // Add click handlers for modal triggers
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Clear form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            clearFormErrors(form);
        }
    }
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    clearFormErrors(form);
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Trường này là bắt buộc');
            isValid = false;
        }
    });
    
    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            showFieldError(field, 'Email không hợp lệ');
            isValid = false;
        }
    });
    
    // Phone validation
    const phoneFields = form.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        if (field.value && !isValidPhone(field.value)) {
            showFieldError(field, 'Số điện thoại không hợp lệ');
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearFormErrors(form) {
    const invalidFields = form.querySelectorAll('.is-invalid');
    const errorMessages = form.querySelectorAll('.invalid-feedback');
    
    invalidFields.forEach(field => field.classList.remove('is-invalid'));
    errorMessages.forEach(error => error.remove());
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const table = e.target.closest('.admin-content').querySelector('.admin-table tbody');
    
    if (table) {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }
}

// Filter functionality
function handleFilter(e) {
    const filterValue = e.target.value;
    const table = e.target.closest('.admin-content').querySelector('.admin-table tbody');
    
    if (table) {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            if (filterValue === 'all') {
                row.style.display = '';
            } else {
                const statusCell = row.querySelector('.status-badge');
                if (statusCell) {
                    const status = statusCell.textContent.toLowerCase();
                    row.style.display = status.includes(filterValue) ? '' : 'none';
                }
            }
        });
    }
}

// Table functionality
function initializeTables() {
    // Add sort functionality to table headers
    const sortableHeaders = document.querySelectorAll('.admin-table th[data-sort]');
    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            const order = this.getAttribute('data-order') === 'asc' ? 'desc' : 'asc';
            sortTable(column, order);
            this.setAttribute('data-order', order);
        });
    });
}

function sortTable(column, order) {
    const table = document.querySelector('.admin-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.cells[column].textContent.trim();
        const bValue = b.cells[column].textContent.trim();
        
        if (order === 'asc') {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });
    
    rows.forEach(row => tbody.appendChild(row));
}

// Pagination
function setupPagination(totalItems, currentPage, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    paginationContainer.appendChild(prevBtn);
    
    // Generate page numbers with ellipsis logic
    const pages = generatePageNumbers(currentPage, totalPages);
    
    pages.forEach(page => {
        if (page === '...') {
            const ellipsisBtn = document.createElement('button');
            ellipsisBtn.textContent = '...';
            ellipsisBtn.className = 'ellipsis';
            ellipsisBtn.disabled = true;
            paginationContainer.appendChild(ellipsisBtn);
        } else {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = page;
            pageBtn.className = page === currentPage ? 'active' : '';
            pageBtn.addEventListener('click', () => changePage(page));
            paginationContainer.appendChild(pageBtn);
        }
    });
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    paginationContainer.appendChild(nextBtn);
}

// Generate page numbers with ellipsis
function generatePageNumbers(currentPage, totalPages) {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // Always show first page
        pages.push(1);
        
        if (currentPage <= 3) {
            // Show first 3 pages + ellipsis + last page
            for (let i = 2; i <= Math.min(3, totalPages - 1); i++) {
                pages.push(i);
            }
            if (totalPages > 4) {
                pages.push('...');
            }
            if (totalPages > 3) {
                pages.push(totalPages);
            }
        } else if (currentPage >= totalPages - 2) {
            // Show first page + ellipsis + last 3 pages
            if (totalPages > 4) {
                pages.push('...');
            }
            for (let i = Math.max(2, totalPages - 2); i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
            pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }
    }
    
    return pages;
}

function changePage(page) {
    currentPage = page;
    // Reload current page data
    loadCurrentPageData();
}

function loadCurrentPageData() {
    // This function should be overridden in each page
    console.log('Loading page:', currentPage);
}

// Alert functions
function showAlert(message, type = 'info') {
    const alertContainer = document.querySelector('.alert-container') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button type="button" class="close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.className = 'alert-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Dashboard stats
function loadDashboardStats() {
    // Mock data - replace with actual API calls
    const stats = {
        totalUsers: 1250,
        totalProducts: 450,
        totalOrders: 320,
        totalRevenue: 25000000
    };
    
    updateStatCard('total-users', stats.totalUsers);
    updateStatCard('total-products', stats.totalProducts);
    updateStatCard('total-orders', stats.totalOrders);
    updateStatCard('total-revenue', formatCurrency(stats.totalRevenue));
}

function updateStatCard(id, value) {
    const card = document.getElementById(id);
    if (card) {
        const numberElement = card.querySelector('.stat-number');
        if (numberElement) {
            numberElement.textContent = value;
        }
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// CRUD Operations
function handleAdd(formId, apiEndpoint) {
    const form = document.getElementById(formId);
    if (!validateForm(form)) return;
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Đang xử lý...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showAlert('Thêm thành công!', 'success');
        closeModal(form.closest('.modal'));
        form.reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Reload data
        loadCurrentPageData();
    }, 1000);
}

function handleEdit(id, formId, apiEndpoint) {
    // Load data for editing
    const modal = document.getElementById(formId.replace('Form', 'Modal'));
    openModal(modal.id);
    
    // Simulate loading data
    setTimeout(() => {
        // Populate form with data
        showAlert('Dữ liệu đã được tải', 'info');
    }, 500);
}

function handleDelete(id, itemName) {
    if (confirm(`Bạn có chắc chắn muốn xóa ${itemName} này?`)) {
        // Show loading
        showAlert('Đang xóa...', 'info');
        
        // Simulate API call
        setTimeout(() => {
            showAlert('Xóa thành công!', 'success');
            loadCurrentPageData();
        }, 1000);
    }
}

function handleStatusChange(id, currentStatus, itemName) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (confirm(`Bạn có chắc chắn muốn ${action} ${itemName} này?`)) {
        // Simulate API call
        setTimeout(() => {
            showAlert(`${action.charAt(0).toUpperCase() + action.slice(1)} thành công!`, 'success');
            loadCurrentPageData();
        }, 500);
    }
}

// Logout functionality
function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        // Clear any stored data
        localStorage.removeItem('adminToken');
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = 'login.html';
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

// Export functions for use in other scripts
window.AdminJS = {
    openModal,
    closeModal,
    validateForm,
    showAlert,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    formatCurrency,
    setupPagination,
    changePage,
    toggleMobileMenu
};
