// Hệ thống Authentication với localStorage
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // Kiểm tra user đã đăng nhập chưa khi load trang
    this.checkAuthStatus();
    this.initDropdownState();
    this.bindEvents();
  }

  // Kiểm tra trạng thái đăng nhập
  checkAuthStatus() {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.updateUIAfterLogin();
    }
    // Không tự động hiển thị modal đăng nhập khi load trang
  }

  // Khởi tạo trạng thái dropdown và giỏ hàng
  initDropdownState() {
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const cartSection = document.querySelector(".menu_right-bag");

    // Chỉ ẩn dropdown menu và giỏ hàng khi chưa đăng nhập
    if (!this.currentUser) {
      if (dropdownMenu) {
        dropdownMenu.style.display = "none";
      }

      if (dropdownToggle) {
        dropdownToggle.style.display = "none";
      }

      if (cartSection) {
        cartSection.style.display = "none";
      }
    }
  }

  // Bind các sự kiện
  bindEvents() {
    // Đăng nhập
    document.addEventListener("DOMContentLoaded", () => {
      // Bind cho các nút đăng nhập và đăng ký
      const loginButtons = document.querySelectorAll(".btn-login");
      loginButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();

          // Phân biệt nút đăng nhập và đăng ký bằng text content
          if (button.textContent.trim() === "Đăng nhập") {
            this.handleLogin();
          } else if (button.textContent.trim() === "Đăng ký") {
            this.handleRegister();
          }
        });
      });

      // Đăng xuất ở trang index.html
      const logoutBtnAtIndexPage = document.querySelector(
        '.dropdown-item[href="#index.html"]'
      );
      if (logoutBtnAtIndexPage) {
        logoutBtnAtIndexPage.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleLogoutAtIndexPage();
        });
      }

      // Đăng xuất
      const logoutBtn = document.querySelector('.dropdown-item[href="#"]');
      if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleLogout();
        });
      }
    });
  }

  // Xử lý đăng nhập
  handleLogin() {
    const phoneNumber = document.getElementById("phone-number").value;
    const password = document.getElementById("loginPassword").value;

    if (!phoneNumber || !password) {
      this.showMessage("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }

    // Lấy danh sách user từ localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Tìm user theo số điện thoại
    const user = users.find((u) => u.phoneNumber === phoneNumber);

    if (!user) {
      this.showMessage("Số điện thoại chưa được đăng ký", "error");
      return;
    }

    // Kiểm tra mật khẩu (so sánh text thuần)
    if (user.password !== password) {
      this.showMessage("Mật khẩu không đúng", "error");
      return;
    }

    // Đăng nhập thành công
    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));

    this.showMessage("Đăng nhập thành công!", "success");
    this.closeModals();

    // Refresh trang để cập nhật UI hoàn toàn
    setTimeout(() => {
      window.location.reload();
    }, 1000); // Delay 1 giây để user thấy thông báo
  }

  // Xử lý đăng ký
  handleRegister() {
    const userName = document.getElementById("userName").value;
    const phoneNumber = document.getElementById("phone-number-register").value;
    const password = document.getElementById("password-register").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    // Hỗ trợ cả id "email-register"/"address-register" và "email"/"address" trên HTML
    const emailInputEl =
      document.getElementById("email-register") ||
      document.getElementById("email");
    const addressInputEl =
      document.getElementById("address-register") ||
      document.getElementById("address");

    const email = emailInputEl ? emailInputEl.value : "";
    const address = addressInputEl ? addressInputEl.value : "";

    if (!userName || !phoneNumber || !password || !confirmPassword) {
      this.showMessage("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }

    if (password !== confirmPassword) {
      this.showMessage("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    if (password.length < 6) {
      this.showMessage("Mật khẩu phải có ít nhất 6 ký tự", "error");
      return;
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u) => u.phoneNumber === phoneNumber);

    if (existingUser) {
      this.showMessage("Số điện thoại đã được đăng ký", "error");
      return;
    }

    // Tạo user mới
    const newUser = {
      id: Date.now(),
      userName: userName,
      phoneNumber: phoneNumber,
      password: password,
      email: email,
      address: address,
      createdAt: new Date().toISOString(),
      type: "customer", // mặc định là khách hàng
    };

    // Lưu user mới
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Đăng nhập luôn sau khi đăng ký
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    this.currentUser = newUser;

    this.showMessage("Đăng ký thành công!", "success");
    this.closeModals();

    // Refresh trang để cập nhật UI hoàn toàn
    setTimeout(() => {
      window.location.reload();
    }, 1000); // Delay 1 giây để user thấy thông báo
  }

  // Xử lý đăng xuất
  handleLogoutAtIndexPage() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    this.updateUIAfterLogout();
    this.showMessage("Đã đăng xuất thành công", "success");

    // Redirect về trang chủ sau khi đăng xuất
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 1000); // Delay 1 giây để user thấy thông báo
  }

  // Xử lý đăng xuất
  handleLogout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    this.updateUIAfterLogout();
    this.showMessage("Đã đăng xuất thành công", "success");

    // Redirect về trang chủ sau khi đăng xuất
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000); // Delay 1 giây để user thấy thông báo
  }

  // Cập nhật UI sau khi đăng nhập
  updateUIAfterLogin() {
    const loginBtn = document.querySelector(".menu_right-login .btn-primary");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const cartSection = document.querySelector(".menu_right-bag");

    if (loginBtn) {
      loginBtn.style.display = "none";
    }

    if (dropdownToggle) {
      dropdownToggle.style.display = "block";
      dropdownToggle.textContent = this.currentUser.userName;
    }

    if (cartSection) {
      cartSection.style.display = "block";
    }
  }

  // Cập nhật UI sau khi đăng xuất
  updateUIAfterLogout() {
    const loginBtn = document.querySelector(".menu_right-login .btn-primary");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const cartSection = document.querySelector(".menu_right-bag");

    if (loginBtn) {
      loginBtn.style.display = "block";
    }

    if (dropdownToggle) {
      dropdownToggle.style.display = "none";
    }

    if (dropdownMenu) {
      dropdownMenu.style.display = "none";
    }

    if (cartSection) {
      cartSection.style.display = "none";
    }
  }

  // Hiển thị modal đăng nhập
  showLoginModal() {
    // Chỉ hiển thị modal đăng nhập nếu chưa có user
    if (!this.currentUser) {
      $("#loginModal").modal("show");
    }
  }

  // Đóng tất cả modal
  closeModals() {
    $("#loginModal").modal("hide");
    $("#registerModal").modal("hide");
    $("#forgotPasswordModal").modal("hide");
  }

  // Hiển thị thông báo
  showMessage(message, type = "info") {
    // Tạo element thông báo
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${
      type === "error" ? "danger" : type
    } alert-dismissible fade show`;
    alertDiv.style.position = "fixed";
    alertDiv.style.top = "20px";
    alertDiv.style.right = "20px";
    alertDiv.style.zIndex = "9999";
    alertDiv.style.minWidth = "300px";

    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        `;

    document.body.appendChild(alertDiv);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 3000);
  }

  // Kiểm tra authentication cho trang hiện tại
  requireAuth() {
    if (!this.currentUser) {
      this.showLoginModal();
      return false;
    }
    return true;
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    return this.currentUser;
  }

  // Kiểm tra user có đăng nhập không
  isLoggedIn() {
    return this.currentUser !== null;
  }
}

// Khởi tạo hệ thống auth
const authSystem = new AuthSystem();

// Export để sử dụng ở các file khác
window.authSystem = authSystem;

// Hàm kiểm tra authentication cho tất cả các trang
function checkPageAuth() {
  // Danh sách các trang cần đăng nhập
  const protectedPages = [
    "trangCaNhan.html",
    "donHangDaMua.html",
    "gioHang.html",
    "datHang.html",
    "doiMatKhau.html",
  ];

  const currentPage = window.location.pathname.split("/").pop();

  if (protectedPages.includes(currentPage)) {
    if (!authSystem.requireAuth()) {
      // Redirect về trang chủ nếu chưa đăng nhập
      window.location.href = "../index.html";
    }
  }
}

// Chạy kiểm tra khi load trang
document.addEventListener("DOMContentLoaded", checkPageAuth);
