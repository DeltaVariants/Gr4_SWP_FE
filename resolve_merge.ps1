# Script để giải quyết merge conflicts
# Chạy script này: powershell -ExecutionPolicy Bypass -File resolve_merge.ps1

Write-Host "Đang giải quyết merge conflicts..." -ForegroundColor Green

# Đánh dấu các file employee đã giải quyết (giữ phiên bản hiện tại)
git add src/app/(employee)/dashboardstaff/page.tsx
git add src/app/(employee)/reservations/page.tsx

# Đánh dấu các file khác đã giải quyết
git add src/app/layout.tsx
git add src/lib/api.ts
git add src/middleware.ts

# Xử lý file bị xóa
if (Test-Path src/services/bookingService.ts) {
    git rm src/services/bookingService.ts
    Write-Host "Đã xóa src/services/bookingService.ts" -ForegroundColor Yellow
} else {
    Write-Host "File src/services/bookingService.ts đã bị xóa" -ForegroundColor Yellow
    git rm src/services/bookingService.ts 2>$null
}

# File admin - giữ nguyên phiên bản của leader (ours)
git add src/app/(admin)/station-management/page.tsx

Write-Host "`nĐã đánh dấu các file đã giải quyết!" -ForegroundColor Green
Write-Host "`nKiểm tra trạng thái:" -ForegroundColor Cyan
git status --short

Write-Host "`nNếu còn file nào có conflict, hãy kiểm tra và giải quyết thủ công." -ForegroundColor Yellow

