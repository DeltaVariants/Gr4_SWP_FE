console.log('🧹 Clearing all auth data...');

// Clear localStorage
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('role');
console.log('✅ localStorage cleared');

// Clear all auth-related cookies
const cookiesToClear = ['token', 'accessToken', 'refreshToken', 'role'];
cookiesToClear.forEach(cookieName => {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  console.log(`✅ Cookie '${cookieName}' cleared`);
});

console.log('✨ Done! Redirecting to login...');
setTimeout(() => {
  window.location.href = '/login';
}, 1000);
