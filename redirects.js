const redirects = {
    '/ps': '/p/puji-syukur.html',
    '/mb': '/p/madah-bakti.html',
    '/test': '/2024/12/peziarah-harapan-himne-yubileum-2025.html',
};

const currentPath = window.location.pathname;
if (redirects[currentPath]) {
    window.location.href = 'https://www.nyanyianliturgi.com' + redirects[currentPath];
}
