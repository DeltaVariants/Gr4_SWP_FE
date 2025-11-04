console.log('Clearing auth data...');
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken'); 
document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
console.log('Done! Now you can test Google login.');
window.location.href = '/login';
