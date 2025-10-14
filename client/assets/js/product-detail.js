(function () {
  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function formatCurrency(number) {
    if (typeof number !== "number") return String(number || "");
    return number.toLocaleString("vi-VN");
  }

  function renderProductDetail(product) {
    // Title tag
    var titleTag = document.querySelector("title");
    if (titleTag) titleTag.textContent = product.name;

    // Breadcrumb level2
    var breadcrumb = document.querySelector(".category-text-level2");
    if (breadcrumb) breadcrumb.textContent = product.name;

    // Main image
    var mainImg = document.getElementById("product-detail-img-selected");
    if (mainImg && product.image) {
      mainImg.src = product.image;
      mainImg.setAttribute('loading', 'lazy');
    }

    // Name
    var nameNode = document.querySelector(".product-detail-top-right .--title");
    if (nameNode) nameNode.textContent = product.name;

    // Prices
    var currentPrice = document.querySelector(".prd-price .current-price");
    if (currentPrice) currentPrice.textContent = formatCurrency(product.price) + " VND";
    var originalPrice = document.querySelector(".prd-price .original-price");
    if (originalPrice) originalPrice.textContent = formatCurrency(product.oldPrice) + " VND";

    var retailPrice = document.querySelector(".prd-price .retail-price");
    if (retailPrice) retailPrice.textContent = "(Giá bán lẻ đề xuất: " + formatCurrency(product.price) + " VND)";

    // Bind nút hành động theo sản phẩm hiện tại
    var addBtn = document.querySelector('.prd-btn-action .add-to-card-btn');
    if (addBtn) {
      addBtn.removeAttribute('onclick');
      addBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var qtyInput = document.querySelector('.b-quantity .input-number');
        var qty = qtyInput ? Number(qtyInput.value || 1) : 1;
        qty = Math.max(1, Math.min(999, qty));
        if (window.cartApi && typeof window.cartApi.addToCart === 'function') {
          window.cartApi.addToCart({
            id: product.id,
            name: product.name,
            price: Number(product.price || 0),
            image: product.image || '',
            quantity: qty
          });
          // chuyển sang trang giỏ hàng theo yêu cầu nút hiện có
          window.location.href = 'gioHang.html';
        }
      });
    }

    var orderBtn = document.querySelector('.prd-btn-action .order-btn');
    if (orderBtn) {
      orderBtn.removeAttribute('onclick');
      orderBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var qtyInput = document.querySelector('.b-quantity .input-number');
        var qty = qtyInput ? Number(qtyInput.value || 1) : 1;
        qty = Math.max(1, Math.min(999, qty));
        var selected = [{ id: product.id, name: product.name, price: Number(product.price || 0), image: product.image || '', quantity: qty }];
        try { localStorage.setItem('cartSelectedForCheckout', JSON.stringify(selected)); } catch (e) {}
        window.location.href = 'datHang.html';
      });
    }
  }

  function init() {
    var id = getQueryParam("id");
    if (!id) return;
    var product = (typeof window.getProductById === "function")
      ? window.getProductById(id)
      : undefined;
    if (!product && Array.isArray(window.productsData)) {
      product = window.productsData.find(function (p) { return p.id === id; });
    }
    if (!product) return;
    renderProductDetail(product);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


