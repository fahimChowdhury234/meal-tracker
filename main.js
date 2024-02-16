// Funktion til at skifte mellem menuer
function showMenu(menuId) {
    const menus = document.querySelectorAll('.menu-content');
    menus.forEach(menu => (menu.style.display = 'none'));

    const selectedMenu = document.getElementById(menuId);
    if (selectedMenu) {
        selectedMenu.style.display = 'block';
    }


}