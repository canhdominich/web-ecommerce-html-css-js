$(document).ready(function(){
    getMenuItemActive()
});
function getMenuItemActive() {
    let currentUrl = window.location.pathname;
    currentUrl = currentUrl.replace('/profile', '')
    switch (currentUrl) {
    case '/my-profile':
        $('#my-profile-tab').addClass('active-item')
        break;
    case '/change-password':
        $('#change-password-tab').addClass('active-item')
        break;
    case '/my-orders':
        $('#my-order-tab').addClass('active-item')
        break;
    case '/favorite-product':
        $('#my-favourite-product-tab').addClass('active-item')
        break;
    case '/seen-product':
        $('#my-seen-product-tab').addClass('active-item')
        break;
    default:
        $('#my-notification-tab').addClass('active-item')
        break;
    }
}
