(function () {
  function createProductItem(product) {
    const outer = document.createElement("div");
    outer.className = "product-category-wrapper-right-content-item";

    const wrapper = document.createElement("div");
    wrapper.className = "products-item-content";

    // ❌ Ngăn chặn mọi click lan ra ngoài wrapper
    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    const header = document.createElement("div");
    header.className = "product-item-header";

    // 🖼 Ảnh sản phẩm
    const img = document.createElement("img");
    img.src = product.image;
    img.setAttribute("loading", "lazy");
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.objectFit = "contain";
    img.style.cursor = "pointer";
    
    // Force reload ảnh để tránh cache
    img.onload = function() {
      console.log("✅ Image loaded:", product.name, product.image);
    };
    img.onerror = function() {
      console.error("❌ Image failed to load:", product.name, product.image);
    };
    
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    img.src = product.image + "?t=" + timestamp;
    
    img.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href =
        "./client/chiTietSanPham.html?id=" + encodeURIComponent(product.id);
    });
    header.appendChild(img);

    // ❤️ Icon trái tim
    const heartSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    heartSvg.setAttribute("class", "products-item-heart");
    heartSvg.setAttribute("width", "20");
    heartSvg.setAttribute("height", "20");
    heartSvg.setAttribute("viewBox", "0 0 20 20");
    const heartPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    heartPath.setAttribute(
      "d",
      "M10 18l-1.45-1.32C4.4 12.36 2 9.28 2 6.5 2 4.5 3.5 3 5.5 3c1.54 0 3.04.99 3.57 2.36h1.87C11.46 3.99 12.96 3 14.5 3 16.5 3 18 4.5 18 6.5c0 2.78-2.4 5.86-6.55 10.18L10 18z"
    );
    heartPath.setAttribute("fill", "#DDD");
    heartSvg.appendChild(heartPath);
    header.appendChild(heartSvg);

    // 🏷 Tên sản phẩm
    const title = document.createElement("div");
    title.className = "product-item-title";
    title.textContent = product.name;
    title.style.cursor = "pointer";
    title.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href =
        "./client/chiTietSanPham.html?id=" + encodeURIComponent(product.id);
    });

    // ⚖️ Khối lượng
    const weight = document.createElement("div");
    weight.className = "product-item-weight";
    weight.textContent = "(" + product.weight + ")";

    // 💸 Giá cũ
    const oldPrice = document.createElement("div");
    oldPrice.className = "--old-price";
    oldPrice.textContent =
      formatCurrency(product.oldPrice) + " " + (product.unit || "VND");

    // 💰 Giá hiện tại
    const currentPrice = document.createElement("div");
    currentPrice.className = "--current-price";
    currentPrice.textContent =
      formatCurrency(product.price) + " " + (product.unit || "VND");

    // 🛒 Nút thêm vào giỏ hàng
    const btnWrap = document.createElement("div");
    btnWrap.className = "product-item-btn";
    const btn = document.createElement("button");
    btn.className = "product-item-add-to-card";
    btn.textContent = "Thêm vào giỏ hàng";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🛒 Click thêm vào giỏ hàng:", product.name);
      if (window.cartApi && typeof window.cartApi.addToCart === "function") {
        window.cartApi.addToCart({
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          image: product.image || "",
          quantity: 1,
        });
      } else {
        alert("Giỏ hàng chưa được khởi tạo!");
      }
    });
    btnWrap.appendChild(btn);

    // 🧩 Lắp ghép các phần tử
    wrapper.appendChild(header);
    wrapper.appendChild(title);
    wrapper.appendChild(weight);
    wrapper.appendChild(oldPrice);
    wrapper.appendChild(currentPrice);
    wrapper.appendChild(btnWrap);

    outer.appendChild(wrapper);
    return outer;
  }

  function formatCurrency(number) {
    if (typeof number !== "number") return String(number || "");
    return number.toLocaleString("vi-VN");
  }

  function renderProducts(page = 1, itemsPerPage = 8) {
    const container = document.querySelector(
      ".--header-second.product-category-wrapper-right-content"
    );
    if (!container) {
      console.error("❌ Container not found!");
      return;
    }

    // Clear container trước khi render
    container.innerHTML = "";
    
    const data = Array.isArray(window.productsData) ? window.productsData : [];
    
    // Tính toán sản phẩm cho trang hiện tại
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsForPage = data.slice(startIndex, endIndex);
    
    productsForPage.forEach((p) => container.appendChild(createProductItem(p)));
  }

  // Tính toán số trang dựa trên dữ liệu
  function calculateTotalPages(itemsPerPage = 8) {
    const data = Array.isArray(window.productsData) ? window.productsData : [];
    return Math.ceil(data.length / itemsPerPage);
  }

  // Cập nhật phân trang dựa trên dữ liệu
  function updatePaginationBasedOnData(currentPage = 1, itemsPerPage = 8) {
    const totalPages = calculateTotalPages(itemsPerPage);
    
    // Cập nhật HTML phân trang
    document.querySelectorAll('.pagination').forEach(function(paginationContainer) {
      const prevBtn = paginationContainer.querySelector('.pagination-prev');
      const nextBtn = paginationContainer.querySelector('.pagination-next');
      const numbersContainer = paginationContainer.querySelectorAll('.pagination-number');
      
      // Xóa các số trang cũ (giữ lại prev/next buttons)
      numbersContainer.forEach(function(element) {
        if (!element.classList.contains('pagination-prev') && !element.classList.contains('pagination-next')) {
          element.remove();
        }
      });
      
      // Thêm số trang mới
      for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('div');
        pageNumber.className = 'pagination-number';
        if (i === currentPage) {
          pageNumber.classList.add('active');
        }
        pageNumber.textContent = i;
        
        // Chèn số trang vào vị trí đúng
        if (i === 1) {
          paginationContainer.insertBefore(pageNumber, nextBtn);
        } else {
          const lastNumber = paginationContainer.querySelector('.pagination-number:not(.pagination-prev):not(.pagination-next)');
          if (lastNumber) {
            paginationContainer.insertBefore(pageNumber, lastNumber.nextSibling);
          } else {
            paginationContainer.insertBefore(pageNumber, nextBtn);
          }
        }
      }
    });
  }

  // Export functions để sử dụng ở nơi khác
  window.renderProducts = renderProducts;
  window.calculateTotalPages = calculateTotalPages;
  window.updatePaginationBasedOnData = updatePaginationBasedOnData;

  // Không tự động khởi tạo ở đây, để index.html xử lý
})();
