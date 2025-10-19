// Xử lý tìm kiếm và filter sản phẩm cho trang chủ
(function () {
  "use strict";

  // Cấu hình filter và search
  const CONFIG = {
    searchInputSelector: '.form_search input[type="text"]',
    filterContainerSelector: ".product-category-wrapper-left",
    sortDropdownSelector: "#dropdownMenuFilter",
    productContainerSelector: ".product-category-wrapper-right-content",
    countDisplaySelector: ".--header-top-right",
    paginationSelector: ".pagination",
  };

  // State quản lý filter hiện tại
  let currentFilters = {
    searchTerm: "",
    categories: [],
    brands: [],
    sortBy: "newest",
    minPrice: null,
    maxPrice: null,
  };

  // Danh sách sản phẩm gốc (sẽ được cập nhật từ products-data.js)
  let allProducts = [];
  let filteredProducts = [];

  // Mapping category và brand cho sản phẩm
  const PRODUCT_CATEGORIES = {
    "prod-001": ["Chăm Sóc Răng Miệng"],
    "prod-002": ["Chăm Sóc Răng Miệng"],
    "prod-003": ["Chăm sóc da"],
    "prod-004": ["Chăm sóc tóc"],
    "prod-005": ["Chăm sóc da"],
    "prod-006": ["Dụng cụ y tế"],
    "prod-007": ["Dụng cụ y tế"],
    "prod-008": ["Dụng cụ y tế"],
  };

  const PRODUCT_BRANDS = {
    "prod-001": ["Eagle"],
    "prod-002": ["Panadol"],
    "prod-003": ["Medica"],
    "prod-004": ["Panadol"],
    "prod-005": ["Medica"],
    "prod-006": ["Eagle"],
    "prod-007": ["Panadol"],
    "prod-008": ["Medica"],
  };

  // Khởi tạo
  function init() {
    // Lấy dữ liệu sản phẩm từ products-data.js
    if (window.productsData && Array.isArray(window.productsData)) {
      allProducts = [...window.productsData];
      filteredProducts = [...allProducts];
    }

    // Bind events
    bindSearchEvents();
    bindFilterEvents();
    bindSortEvents();

    // Render sản phẩm ban đầu
    renderProducts();
    updateProductCount();
  }

  // Bind sự kiện tìm kiếm
  function bindSearchEvents() {
    const searchInput = document.querySelector(CONFIG.searchInputSelector);
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener("input", function (e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.searchTerm = e.target.value.trim().toLowerCase();
        applyFilters();
      }, 300); // Debounce 300ms
    });

    // Tìm kiếm khi nhấn Enter
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        currentFilters.searchTerm = e.target.value.trim().toLowerCase();
        applyFilters();
      }
    });
  }

  // Bind sự kiện filter
  function bindFilterEvents() {
    const filterContainer = document.querySelector(
      CONFIG.filterContainerSelector
    );
    if (!filterContainer) return;

    // Bind checkbox events
    filterContainer.addEventListener("change", function (e) {
      if (e.target.type === "checkbox") {
        const label = e.target.closest("label");
        const text =
          label.querySelector("span.active") || label.querySelector("span");
        const filterValue = text ? text.textContent.trim() : "";

        if (e.target.checked) {
          addFilter(filterValue);
        } else {
          removeFilter(filterValue);
        }
        applyFilters();
      }
    });
  }

  // Bind sự kiện sắp xếp
  function bindSortEvents() {
    const dropdown = document.querySelector(CONFIG.sortDropdownSelector);
    if (!dropdown) return;

    const dropdownMenu = dropdown.nextElementSibling;
    if (!dropdownMenu) return;

    dropdownMenu.addEventListener("click", function (e) {
      if (e.target.classList.contains("dropdown-item")) {
        e.preventDefault();
        const sortText = e.target.textContent.trim();
        currentFilters.sortBy = getSortKey(sortText);

        // Cập nhật text của button
        dropdown.textContent = sortText;

        applyFilters();
      }
    });
  }

  // Thêm filter
  function addFilter(value) {
    // Xác định loại filter dựa trên context
    const categoryLabels = [
      "Chăm Sóc Răng Miệng",
      "Chăm sóc da",
      "Dụng cụ y tế",
      "Thực phẩm chức năng",
      "Chăm sóc tóc",
    ];
    const brandLabels = ["Panadol", "Eagle", "Medica"];

    if (categoryLabels.includes(value)) {
      if (!currentFilters.categories.includes(value)) {
        currentFilters.categories.push(value);
      }
    } else if (brandLabels.includes(value)) {
      if (!currentFilters.brands.includes(value)) {
        currentFilters.brands.push(value);
      }
    }
  }

  // Xóa filter
  function removeFilter(value) {
    currentFilters.categories = currentFilters.categories.filter(
      (c) => c !== value
    );
    currentFilters.brands = currentFilters.brands.filter((b) => b !== value);
  }

  // Lấy key sắp xếp từ text
  function getSortKey(sortText) {
    const sortMap = {
      "Mới nhất": "newest",
      "Bán chạy nhất": "popular",
      "Giá từ cao đến thấp": "price-desc",
      "Giá từ thấp đến cao": "price-asc",
      "Tên từ A - Z": "name-asc",
      "Tên từ Z - A": "name-desc",
    };
    return sortMap[sortText] || "newest";
  }

  // Áp dụng tất cả filters
  function applyFilters() {
    filteredProducts = allProducts.filter((product) => {
      // Filter theo tìm kiếm
      if (currentFilters.searchTerm) {
        const searchMatch = product.name
          .toLowerCase()
          .includes(currentFilters.searchTerm);
        if (!searchMatch) return false;
      }

      // Filter theo category
      if (currentFilters.categories.length > 0) {
        const productCategories = PRODUCT_CATEGORIES[product.id] || [];
        const categoryMatch = currentFilters.categories.some((cat) =>
          productCategories.includes(cat)
        );
        if (!categoryMatch) return false;
      }

      // Filter theo brand
      if (currentFilters.brands.length > 0) {
        const productBrands = PRODUCT_BRANDS[product.id] || [];
        const brandMatch = currentFilters.brands.some((brand) =>
          productBrands.includes(brand)
        );
        if (!brandMatch) return false;
      }

      // Filter theo giá
      if (currentFilters.minPrice !== null || currentFilters.maxPrice !== null) {
        const productPrice = product.price;
        
        if (currentFilters.minPrice !== null && productPrice < currentFilters.minPrice) {
          return false;
        }
        
        if (currentFilters.maxPrice !== null && productPrice > currentFilters.maxPrice) {
          return false;
        }
      }

      return true;
    });

    // Sắp xếp
    sortProducts();

    // Render lại
    renderProducts();
    updateProductCount();
  }

  // Sắp xếp sản phẩm
  function sortProducts() {
    switch (currentFilters.sortBy) {
      case "newest":
        // Giữ nguyên thứ tự ban đầu (mới nhất)
        break;
      case "popular":
        // Sắp xếp theo giá giảm nhiều nhất (popular)
        filteredProducts.sort((a, b) => {
          const discountA = a.oldPrice - a.price;
          const discountB = b.oldPrice - b.price;
          return discountB - discountA;
        });
        break;
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "name-asc":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
  }

  // Render sản phẩm
  function renderProducts() {
    const container = document.querySelector(CONFIG.productContainerSelector);
    if (!container) return;

    container.innerHTML = "";

    if (filteredProducts.length === 0) {
      const noResults = document.createElement("div");
      noResults.className = "no-results";
      noResults.style.textAlign = "center";
      noResults.style.padding = "40px";
      noResults.style.color = "#666";
      noResults.innerHTML = `
                <h3>Không tìm thấy sản phẩm nào</h3>
                <p>Vui lòng thử lại với từ khóa khác hoặc bỏ bớt bộ lọc</p>
            `;
      container.appendChild(noResults);
      return;
    }

    // Sử dụng hàm createProductItem từ render-products.js nếu có
    if (window.createProductItem) {
      filteredProducts.forEach((product) => {
        container.appendChild(window.createProductItem(product));
      });
    } else {
      // Fallback: tạo HTML đơn giản
      filteredProducts.forEach((product) => {
        const productElement = createSimpleProductElement(product);
        container.appendChild(productElement);
      });
    }
  }

  // Tạo element sản phẩm đơn giản (fallback)
  function createSimpleProductElement(product) {
    const wrapper = document.createElement("div");
    wrapper.className = "product-category-wrapper-right-content-item";

    const content = document.createElement("div");
    content.className = "products-item-content";

    // Ngăn chặn event bubbling
    content.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Tạo header với ảnh có thể click
    const header = document.createElement("div");
    header.className = "product-item-header";

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.setAttribute("loading", "lazy");
    img.style.maxWidth = "100%";
    img.style.height = "130";
    img.style.objectFit = "contain";
    img.style.cursor = "pointer";
    img.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `./client/chiTietSanPham.html?id=${encodeURIComponent(
        product.id
      )}`;
    });
    header.appendChild(img);

    // Tên sản phẩm có thể click
    const title = document.createElement("div");
    title.className = "product-item-title";
    title.textContent = product.name;
    title.style.cursor = "pointer";
    title.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `./client/chiTietSanPham.html?id=${encodeURIComponent(
        product.id
      )}`;
    });

    // Các phần tử khác không thể click
    const weight = document.createElement("div");
    weight.className = "product-item-weight";
    weight.textContent = `(${product.weight})`;

    const oldPrice = document.createElement("div");
    oldPrice.className = "--old-price";
    oldPrice.textContent = `${formatCurrency(product.oldPrice)} ${
      product.unit || "VND"
    }`;

    const currentPrice = document.createElement("div");
    currentPrice.className = "--current-price";
    currentPrice.textContent = `${formatCurrency(product.price)} ${
      product.unit || "VND"
    }`;

    // Nút thêm vào giỏ hàng
    const btnWrap = document.createElement("div");
    btnWrap.className = "product-item-btn";

    const btn = document.createElement("button");
    btn.className = "product-item-add-to-card";
    btn.textContent = "Thêm vào giỏ hàng";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.cartApi && typeof window.cartApi.addToCart === "function") {
        window.cartApi.addToCart({
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          image: product.image || "",
          quantity: 1,
        });
      }
    });
    btnWrap.appendChild(btn);

    // Lắp ghép các phần tử
    content.appendChild(header);
    content.appendChild(title);
    content.appendChild(weight);
    content.appendChild(oldPrice);
    content.appendChild(currentPrice);
    content.appendChild(btnWrap);

    wrapper.appendChild(content);
    return wrapper;
  }

  // Cập nhật số lượng sản phẩm hiển thị
  function updateProductCount() {
    const countElement = document.querySelector(CONFIG.countDisplaySelector);
    if (!countElement) return;

    const total = filteredProducts.length;
    const start = 1;
    const end = Math.min(24, total); // Giả sử hiển thị tối đa 24 sản phẩm

    countElement.textContent = `Hiển thị ${start} - ${end} trên tổng số ${total} sản phẩm`;
  }

  // Format currency
  function formatCurrency(number) {
    if (typeof number !== "number") return String(number || "");
    return number.toLocaleString("vi-VN");
  }

  // Reset filters
  function resetFilters() {
    currentFilters = {
      searchTerm: "",
      categories: [],
      brands: [],
      sortBy: "newest",
      minPrice: null,
      maxPrice: null,
    };

    // Reset UI
    const searchInput = document.querySelector(CONFIG.searchInputSelector);
    if (searchInput) searchInput.value = "";

    const checkboxes = document.querySelectorAll(
      CONFIG.filterContainerSelector + ' input[type="checkbox"]'
    );
    checkboxes.forEach((cb) => (cb.checked = false));

    // Reset price inputs
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    if (minPriceInput) minPriceInput.value = "";
    if (maxPriceInput) maxPriceInput.value = "";

    const dropdown = document.querySelector(CONFIG.sortDropdownSelector);
    if (dropdown) dropdown.textContent = "Sắp xếp theo";

    applyFilters();
  }

  // Export functions để có thể gọi từ bên ngoài
  window.searchFilterApi = {
    resetFilters,
    applyFilters,
    getCurrentFilters: () => ({ ...currentFilters }),
    getFilteredProducts: () => [...filteredProducts],
  };

  // Function để lọc theo giá
  window.applyPriceFilter = function() {
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    // Validate input
    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      alert('Giá tối thiểu không thể lớn hơn giá tối đa!');
      return;
    }
    
    // Cập nhật filter
    currentFilters.minPrice = minPrice ? parseFloat(minPrice) : null;
    currentFilters.maxPrice = maxPrice ? parseFloat(maxPrice) : null;
    
    // Áp dụng filter
    applyFilters();
  };

  // Khởi tạo khi DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
