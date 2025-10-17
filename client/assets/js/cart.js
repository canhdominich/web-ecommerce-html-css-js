// Quản lý giỏ hàng phía client bằng localStorage và thao tác DOM thuần
(function() {
	const STORAGE_CART_KEY = 'cartItems';
	const STORAGE_ORDER_BUFFER_KEY = 'cartSelectedForCheckout';

	function getCart() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || '[]');
		} catch (e) {
			return [];
		}
	}

	function saveCart(items) {
		localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(items));
		updateHeaderCartCount();
	}

	function updateHeaderCartCount() {
		const count = getCart().reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
		
		// Cập nhật cho các selector khác nhau trên các trang
		const selectors = [
			'.menu_right-bag .badge',
			'.menu_right-bag .cart-count', 
			'.menu_right-bag .bag-amount',
			'.bag-amount'
		];
		
		selectors.forEach(selector => {
			const element = document.querySelector(selector);
			if (element) {
				element.textContent = String(count);
			}
		});
	}

	// API công khai để thêm vào giỏ từ bất kỳ trang nào
	function addToCart(product) {
		if (!window.authSystem || !window.authSystem.isLoggedIn || !window.authSystem.isLoggedIn()) {
			// Yêu cầu đăng nhập rồi mới thêm giỏ
			if (window.authSystem && window.authSystem.showLoginModal) {
				window.authSystem.showLoginModal();
			}
			return;
		}

		if (!product || !product.id) return;
		const cart = getCart();
		const existing = cart.find(i => String(i.id) === String(product.id));
		if (existing) {
			existing.quantity = Number(existing.quantity || 0) + Number(product.quantity || 1);
		} else {
			cart.push({
				id: product.id,
				name: product.name || '',
				price: Number(product.price || 0),
				image: product.image || '',
				quantity: Number(product.quantity || 1)
			});
		}
		saveCart(cart);
		showToast('Đã thêm vào giỏ hàng');
	}

	function removeFromCart(id) {
		const cart = getCart().filter(i => String(i.id) !== String(id));
		saveCart(cart);
	}

	function changeQty(id, qty) {
		const cart = getCart();
		const item = cart.find(i => String(i.id) === String(id));
		if (!item) return;
		item.quantity = Math.max(1, Math.min(999, Number(qty || 1)));
		saveCart(cart);
	}

	function formatVnd(n) {
		try {
			return new Intl.NumberFormat('vi-VN').format(Number(n)) + ' VND';
		} catch (e) {
			return (Number(n) || 0) + ' VND';
		}
	}

	function showToast(message) {
		const alertDiv = document.createElement('div');
		alertDiv.className = 'alert alert-success alert-dismissible fade show';
		alertDiv.style.position = 'fixed';
		alertDiv.style.top = '20px';
		alertDiv.style.right = '20px';
		alertDiv.style.zIndex = '9999';
		alertDiv.style.minWidth = '300px';
		alertDiv.innerHTML = `
			${message}
			<button type="button" class="close" data-dismiss="alert">
				<span>&times;</span>
			</button>
		`;
		document.body.appendChild(alertDiv);
		setTimeout(() => alertDiv.remove(), 2000);
	}

	// Render giỏ hàng trên trang gioHang.html
	function renderCartPage() {
		const container = document.querySelector('.product-card-list');
		if (!container) return;

		const cart = getCart();
		container.innerHTML = '';

		// Header
		const header = document.createElement('div');
		header.className = 'pcl-header';
		header.innerHTML = `
			<div class="--checkbox">
				<label class="main">
					<input type="checkbox" id="checkboxAll" />
					<span class="geekmark"></span>
				</label>
			</div>
			<div class="--product-name">Sản phẩm</div>
			<div class="--product-price-original">Đơn giá</div>
			<div class="--product-price">Đơn giá đã chiết khấu</div>
			<div class="--product-qty">Số lượng</div>
			<div class="--product-into-money">Số tiền</div>
			<div class="--product-action">Thao tác</div>
		`;
		container.appendChild(header);

		// Items
		cart.forEach((it) => {
			const row = document.createElement('div');
			row.className = 'pcl-item pcl-item-active';
			row.setAttribute('data-id', String(it.id));
            row.innerHTML = `
				<div class="--checkbox">
					<label class="main">
						<input type="checkbox" class="cartItem" />
						<span class="geekmark"></span>
					</label>
				</div>
                <div class="--product-name">
                    <img src="${it.image || '../assets/images/product-payment.png'}" loading="lazy"/>
					<span class="title">${it.name || ''}</span>
				</div>
				<div class="--product-price-original">${formatVnd(it.price)}</div>
				<div class="--product-price">${formatVnd(it.price)}</div>
				<div class="--product-qty">
					<div class="select-quantity">
						<span class="value-button decrease">-</span>
						<input type="text" value="${it.quantity}" class="input-number" />
						<span class="value-button increase">+</span>
					</div>
				</div>
				<div class="--product-into-money">${formatVnd(it.price * it.quantity)}</div>
				<div class="--product-action">
					<span class="btn-remove" title="Xóa">🗑</span>
				</div>
			`;
			container.appendChild(row);
		});

		// Footer
		const footer = document.createElement('div');
		footer.className = 'pcl-footer';
		footer.innerHTML = `
			<div class="pcl-footer-top">
				<div>
					Tổng thanh toán: <span class="pcl-t-f-price">${formatVnd(sumSelected(container))}</span>
				</div>
			</div>
			<div class="pcl-footer-btn-action">
				<button class="pcl-btn-action-item buy-more">Mua thêm</button>
				<button class="pcl-btn-action-item order">Đặt hàng</button>
			</div>
		`;
		container.appendChild(footer);

		// Sự kiện chọn tất cả
		const checkboxAll = container.querySelector('#checkboxAll');
		if (checkboxAll) {
			checkboxAll.addEventListener('change', () => {
				container.querySelectorAll('.cartItem').forEach(c => {
					c.checked = checkboxAll.checked;
				});
				updateFooterTotal(container);
			});
		}

		// Delegate sự kiện cho các hàng
		container.addEventListener('click', (e) => {
			const target = e.target;
			const row = target.closest('.pcl-item');
			if (!row) return;
			const id = row.getAttribute('data-id');
			
			// Xử lý checkbox của từng sản phẩm
			if (target.classList.contains('cartItem')) {
				updateFooterTotal(container);
				// Cập nhật trạng thái checkbox "Chọn tất cả"
				const checkboxAll = container.querySelector('#checkboxAll');
				const allCheckboxes = container.querySelectorAll('.cartItem');
				const checkedCount = container.querySelectorAll('.cartItem:checked').length;
				if (checkboxAll) {
					checkboxAll.checked = checkedCount === allCheckboxes.length;
					checkboxAll.indeterminate = checkedCount > 0 && checkedCount < allCheckboxes.length;
				}
			}
			
			if (target.classList.contains('increase')) {
				const input = row.querySelector('.input-number');
				input.value = String(Math.min(999, Number(input.value || 1) + 1));
				changeQty(id, input.value);
				updateRowTotal(row);
				updateFooterTotal(container);
			}

			if (target.classList.contains('decrease')) {
				const input = row.querySelector('.input-number');
				input.value = String(Math.max(1, Number(input.value || 1) - 1));
				changeQty(id, input.value);
				updateRowTotal(row);
				updateFooterTotal(container);
			}

			if (target.classList.contains('btn-remove')) {
				removeFromCart(id);
				row.remove();
				updateFooterTotal(container);
			}
		});

		// Input số lượng
		container.addEventListener('input', (e) => {
			if (!e.target.classList.contains('input-number')) return;
			const row = e.target.closest('.pcl-item');
			const id = row.getAttribute('data-id');
			const value = e.target.value.replace(/\D/g, '');
			e.target.value = value || '1';
			changeQty(id, e.target.value);
			updateRowTotal(row);
			updateFooterTotal(container);
		});

		// Nút hành động footer
		footer.querySelector('.buy-more').addEventListener('click', () => {
			window.location.href = 'trangChu.html';
		});
		footer.querySelector('.order').addEventListener('click', () => {
			const selected = collectSelected(container);
			if (selected.length === 0) {
				showToast('Vui lòng chọn sản phẩm để đặt hàng');
				return;
			}
			localStorage.setItem(STORAGE_ORDER_BUFFER_KEY, JSON.stringify(selected));
			window.location.href = 'datHang.html';
		});
	}

	function rowPrice(row) {
		const id = row.getAttribute('data-id');
		const item = getCart().find(i => String(i.id) === String(id));
		return item ? Number(item.price) : 0;
	}

	function updateRowTotal(row) {
		const qty = Number(row.querySelector('.input-number').value || 1);
		const price = rowPrice(row);
		const cell = row.querySelector('.--product-into-money');
		cell.textContent = formatVnd(price * qty);
	}

	function collectSelected(container) {
		const selected = [];
		container.querySelectorAll('.pcl-item').forEach(row => {
			const checkbox = row.querySelector('.cartItem');
			if (checkbox && checkbox.checked) {
				const id = row.getAttribute('data-id');
				const cartItem = getCart().find(i => String(i.id) === String(id));
				if (cartItem) {
					selected.push({ ...cartItem });
				}
			}
		});
		return selected;
	}

	function sumSelected(container) {
		let sum = 0;
		container.querySelectorAll('.pcl-item').forEach(row => {
			const checkbox = row.querySelector('.cartItem');
			if (checkbox && checkbox.checked) {
				const qty = Number(row.querySelector('.input-number').value || 1);
				sum += rowPrice(row) * qty;
			}
		});
		return sum;
	}

	function updateFooterTotal(container) {
		const totalEl = container.querySelector('.pcl-t-f-price');
		if (totalEl) totalEl.textContent = formatVnd(sumSelected(container));
	}

	// Trang đặt hàng: render danh sách đã chọn và xử lý tạo đơn
	function renderCheckoutPage() {
		// Phù hợp DOM hiện có của datHang.html
		const listContainer = document.querySelector('.product-payment-list');
		if (!listContainer) return;
		let selected = [];
		try { selected = JSON.parse(localStorage.getItem(STORAGE_ORDER_BUFFER_KEY) || '[]'); } catch (e) { selected = []; }

		listContainer.innerHTML = '';
		let total = 0;
		selected.forEach(it => {
			total += Number(it.price) * Number(it.quantity);
			const row = document.createElement('div');
			row.className = 'product-payment-item';
			row.innerHTML = `
                <div class="ppi-left">
                    <img src="${it.image || '../assets/images/product-payment.png'}" loading="lazy" alt="${it.name}">
				</div>
				<div class="ppi-right">
					<div class="--name">${it.name}</div>
				</div>
				<div class="--price">${formatVnd(it.price)}</div>
				<div class="--subtotal">${formatVnd(it.price * it.quantity)}</div>
				<div class="--qty">SL: ${it.quantity}</div>`;
			listContainer.appendChild(row);
		});

		const subtotalEl = document.querySelector('.--number-total');
		const finalEl = document.querySelector('.--number-into-money');
		if (subtotalEl) subtotalEl.textContent = formatVnd(total);
		if (finalEl) finalEl.textContent = formatVnd(total);

		const orderBtn = document.querySelector('.pyr-action-btn button');
		if (orderBtn) {
			orderBtn.removeAttribute('onclick');
			orderBtn.addEventListener('click', (e) => {
				e.preventDefault();
				if (!window.authSystem || !window.authSystem.isLoggedIn || !window.authSystem.isLoggedIn()) {
					if (window.authSystem && window.authSystem.showLoginModal) window.authSystem.showLoginModal();
					return;
				}

				const addressInput = document.querySelector('#addressSpecial') || document.querySelector('#address');
				const paymentRadio = document.querySelector('input[name="py-type-radio"]:checked');
				const paymentMethod = paymentRadio ? (function(idx){ return idx===0?'COD':idx===1?'BANK':'ONLINE'; })(Array.from(document.querySelectorAll('input[name="py-type-radio"]')).indexOf(paymentRadio)) : 'COD';
				const address = addressInput ? addressInput.value.trim() : '';
				if (!address) {
					showToast('Vui lòng nhập địa chỉ giao hàng');
					return;
				}

				const order = {
					id: Date.now(),
					userId: (window.authSystem && window.authSystem.getCurrentUser && (window.authSystem.getCurrentUser() || {}).id) || null,
					items: selected,
					total: total,
					address: address,
					paymentMethod: paymentMethod,
					createdAt: new Date().toISOString()
				};

				const orders = JSON.parse(localStorage.getItem('orders') || '[]');
				orders.push(order);
				localStorage.setItem('orders', JSON.stringify(orders));
				// Lưu đơn hàng gần nhất để trang thành công đọc và hiển thị
				localStorage.setItem('lastOrder', JSON.stringify(order));

				// Xóa các item đã mua khỏi giỏ
				const remaining = getCart().filter(ci => !selected.find(si => String(si.id) === String(ci.id)));
				saveCart(remaining);
				localStorage.removeItem(STORAGE_ORDER_BUFFER_KEY);

				window.location.href = 'datHangThanhCong.html';
			});
		}
	}

	// Render sơ bộ trang thành công
	function renderOrderSuccessPage() {
		const titleEl = document.querySelector('.product-result-title');
		const leftContainer = document.querySelector('.pr-information-detail');
		const rightContainer = document.querySelector('.payment-result-right .prr-content');
		if (!leftContainer || !rightContainer) return;

		let order;
		try { order = JSON.parse(localStorage.getItem('lastOrder') || 'null'); } catch (e) { order = null; }
		if (!order || !Array.isArray(order.items) || order.items.length === 0) {
			// Không có dữ liệu: giữ nguyên nội dung mẫu
			if (titleEl) titleEl.textContent = 'Kết quả đặt hàng';
			return;
		}

		if (titleEl) titleEl.textContent = 'Đặt hàng thành công';

		// Xóa danh sách mẫu, chỉ giữ header và footer
		const headerEl = leftContainer.querySelector('.pr-header');
		const footerEl = leftContainer.querySelector('.pr-footer');
		leftContainer.querySelectorAll('.pr-item').forEach(n => n.remove());

		// Chèn lại header nếu cần
		if (headerEl && !leftContainer.contains(headerEl)) {
			leftContainer.prepend(headerEl);
		}

		// Render từng sản phẩm
		order.items.forEach((it) => {
			const row = document.createElement('div');
			row.className = 'pr-item pr-item-active';
			row.innerHTML = `
				<div class="--product-name">
					<img src="${it.image || '../assets/images/product-payment.png'}" alt="${it.name || ''}" />
				</div>
				<div class="pr-item-main-content">
					<span class="title pr-item-main-content-child">${it.name || ''}</span>
					<div class="--product-qty pr-item-main-content-child">${Number(it.quantity) || 1}</div>
					<div class="--product-into-money pr-item-main-content-child">${formatVnd(Number(it.price) * Number(it.quantity))}</div>
				</div>
			`;
			if (footerEl) {
				leftContainer.insertBefore(row, footerEl);
			} else {
				leftContainer.appendChild(row);
			}
		});

		// Cập nhật tổng tiền ở footer
		const subtotal = order.items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);
		const footerSubtotal = leftContainer.querySelector('.pr-footer .pr-footer-item:nth-child(1) .pr-footer-item-content');
		const footerDiscount = leftContainer.querySelector('.pr-footer .pr-footer-item:nth-child(2) .pr-footer-item-content');
		const footerTotal = leftContainer.querySelector('.pr-footer .--product-into-money');
		if (footerSubtotal) footerSubtotal.textContent = formatVnd(subtotal);
		if (footerDiscount) footerDiscount.textContent = '-0 VND';
		if (footerTotal) footerTotal.textContent = formatVnd(subtotal);

		// Cập nhật thông tin bên phải: mã đơn, thời gian, tổng tiền, phương thức
		const codeEl = rightContainer.querySelector('.prr-content-item:nth-child(1) .prr-content-item-content');
		const timeEl = rightContainer.querySelector('.prr-content-item:nth-child(2) .prr-content-item-content');
		const totalEl = rightContainer.querySelector('.prr-content-item:nth-child(3) .prr-content-item-content');
		const methodEl = rightContainer.querySelector('.prr-content-item:nth-child(4) .prr-content-item-content');

		const createdAt = new Date(order.createdAt || Date.now());
		const pad = (n) => n.toString().padStart(2, '0');
		const timeString = `${pad(createdAt.getDate())}/${pad(createdAt.getMonth()+1)}/${createdAt.getFullYear()} ${pad(createdAt.getHours())}:${pad(createdAt.getMinutes())}`;
		const orderCode = (function(dt){
			const y = dt.getFullYear();
			const m = pad(dt.getMonth()+1);
			const d = pad(dt.getDate());
			return `#DH${y}${m}${d}-${String(order.id).slice(-4)}`;
		})(createdAt);

		if (codeEl) codeEl.textContent = orderCode;
		if (timeEl) timeEl.textContent = timeString;
		if (totalEl) totalEl.textContent = formatVnd(order.total || subtotal);
		if (methodEl) methodEl.textContent = order.paymentMethod || 'COD';
	}

	// Tự động bind các nút có data-add-to-cart
	function bindAutoButtons() {
		document.addEventListener('click', (e) => {
			const btn = e.target.closest('[data-add-to-cart]');
			if (!btn) return;
			const product = {
				id: btn.getAttribute('data-id'),
				name: btn.getAttribute('data-name'),
				price: Number(btn.getAttribute('data-price') || 0),
				image: btn.getAttribute('data-image') || '',
				quantity: Number(btn.getAttribute('data-qty') || 1)
			};
			addToCart(product);
		});
	}

	// Khởi tạo theo từng trang
	document.addEventListener('DOMContentLoaded', function() {
		updateHeaderCartCount();
		renderCartPage();
		renderCheckoutPage();
		renderOrderSuccessPage();
		bindAutoButtons();
	});

	// Xuất hàm để trang khác có thể gọi
	window.cartApi = { addToCart, removeFromCart, changeQty, getCart };
})();


