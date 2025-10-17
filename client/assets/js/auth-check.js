// File kiểm tra authentication cho tất cả các trang
// Include file này vào tất cả các trang để kiểm tra đăng nhập

// Kiểm tra authentication khi load trang
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra xem có file auth.js không
  if (typeof authSystem === "undefined") {
    console.error(
      "auth.js chưa được load. Vui lòng đảm bảo file auth.js được include trước file này."
    );
    return;
  }

  // Danh sách các trang cần đăng nhập (loại bỏ ../index.html vì đây là trang đích)
  const protectedPages = [
    "trangCaNhan.html",
    "donHangDaMua.html",
    "gioHang.html",
    "datHang.html",
    "doiMatKhau.html",
    "./client/chiTietSanPham.html",
    "datHangThanhCong.html",
  ];

  // Lấy tên trang hiện tại
  const currentPage = window.location.pathname.split("/").pop();

  // Kiểm tra nếu trang hiện tại cần đăng nhập
  if (protectedPages.includes(currentPage)) {
    if (!authSystem.isLoggedIn()) {
      // Redirect ngay lập tức về trang chủ với tham số để hiển thị modal đăng nhập
      window.location.href = "../index.html?showLogin=true";
      return; // Dừng thực thi các code phía dưới
    }
  }

  // Nếu đang ở trang chủ và có tham số showLogin=true, hiển thị modal đăng nhập
  if (
    currentPage === "../index.html" &&
    window.location.search.includes("showLogin=true")
  ) {
    // Delay một chút để đảm bảo trang đã load xong
    setTimeout(() => {
      authSystem.showLoginModal();
      // Xóa tham số khỏi URL sau khi hiển thị modal
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 500);
  }

  // Cập nhật UI header nếu đã đăng nhập
  if (authSystem.isLoggedIn()) {
    updateHeaderForLoggedInUser();
  }
});

// Hàm cập nhật header khi đã đăng nhập
function updateHeaderForLoggedInUser() {
  const currentUser = authSystem.getCurrentUser();

  // Cập nhật nút đăng nhập thành dropdown
  const loginBtn = document.querySelector(".menu_right-login .btn-primary");
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const cartSection = document.querySelector(".menu_right-bag");

  if (loginBtn && dropdownToggle) {
    loginBtn.style.display = "none";
    dropdownToggle.style.display = "block";
    dropdownToggle.textContent = currentUser.userName;
  }

  // Hiển thị giỏ hàng khi đã đăng nhập
  if (cartSection) {
    cartSection.style.display = "block";
  }
}

// Hàm kiểm tra authentication trước khi thực hiện hành động
function requireAuth() {
  if (!authSystem.isLoggedIn()) {
    // Redirect về trang chủ với tham số để hiển thị modal đăng nhập
    window.location.href = "../index.html?showLogin=true";
    return false;
  }
  return true;
}

// Export các hàm để sử dụng ở các trang khác
window.requireAuth = requireAuth;
window.updateHeaderForLoggedInUser = updateHeaderForLoggedInUser;
