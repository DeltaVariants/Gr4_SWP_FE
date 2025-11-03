/**
 * Migration Script: Add Auth Protection to Existing Pages
 * 
 * Chạy script này để tự động thêm auth protection cho các pages
 * 
 * Usage:
 * node scripts/add-auth-protection.js
 */

const fs = require('fs');
const path = require('path');

// Pages cần protect và role tương ứng
const PAGES_TO_PROTECT = {
  // Admin pages
  'src/app/(admin)/dashboard/page.tsx': 'ADMIN',
  'src/app/(admin)/battery-management/page.tsx': 'ADMIN',
  'src/app/(admin)/station-management/page.tsx': 'ADMIN',
  'src/app/(admin)/user-management/page.tsx': 'ADMIN',
  'src/app/(admin)/transactions-reports/page.tsx': 'ADMIN',
  'src/app/(admin)/system-config/page.tsx': 'ADMIN',
  
  // Staff pages
  'src/app/(employee)/dashboardstaff/page.tsx': 'STAFF',
  'src/app/(employee)/check-in/page.tsx': 'STAFF',
  'src/app/(employee)/swap/page.tsx': 'STAFF',
  'src/app/(employee)/inventory/page.tsx': 'STAFF',
  'src/app/(employee)/reports/page.tsx': 'STAFF',
  'src/app/(employee)/reservations/page.tsx': 'STAFF',
  
  // Customer pages
  'src/app/(customer)/home/page.tsx': 'CUSTOMER',
  'src/app/(customer)/booking/page.tsx': 'CUSTOMER',
  'src/app/(customer)/findstation/page.tsx': 'CUSTOMER',
  'src/app/(customer)/history/page.tsx': 'CUSTOMER',
  'src/app/(customer)/billing-plan/page.tsx': 'CUSTOMER',
  'src/app/(customer)/support/page.tsx': 'CUSTOMER',
  
  // Common pages
  'src/app/profile/page.tsx': 'ANY',
};

function addAuthProtection(filePath, role) {
  const fullPath = path.join(process.cwd(), filePath);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skip: ${filePath} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf-8');
  
  // Check if already protected
  if (content.includes('withAuth') || content.includes('withAdminAuth') || 
      content.includes('withStaffAuth') || content.includes('withCustomerAuth')) {
    console.log(`✅ Skip: ${filePath} (already protected)`);
    return;
  }
  
  // Add 'use client' if not present
  if (!content.includes("'use client'") && !content.includes('"use client"')) {
    content = `'use client';\n\n` + content;
  }
  
  // Determine import and wrapper
  let importStatement;
  let wrapperFunction;
  
  switch (role) {
    case 'ADMIN':
      importStatement = "import { withAdminAuth } from '@/hoc/withAuth';";
      wrapperFunction = 'withAdminAuth';
      break;
    case 'STAFF':
      importStatement = "import { withStaffAuth } from '@/hoc/withAuth';";
      wrapperFunction = 'withStaffAuth';
      break;
    case 'CUSTOMER':
      importStatement = "import { withCustomerAuth } from '@/hoc/withAuth';";
      wrapperFunction = 'withCustomerAuth';
      break;
    case 'ANY':
      importStatement = "import { withAuth } from '@/hoc/withAuth';";
      wrapperFunction = 'withAuth';
      break;
    default:
      console.log(`⚠️  Unknown role: ${role} for ${filePath}`);
      return;
  }
  
  // Add import after 'use client'
  const useClientRegex = /(['"])use client\1;?\s*/;
  if (useClientRegex.test(content)) {
    content = content.replace(useClientRegex, (match) => `${match}\n${importStatement}\n`);
  } else {
    // Add at the top
    content = `${importStatement}\n\n${content}`;
  }
  
  // Find the default export and wrap it
  const defaultExportRegex = /export\s+default\s+(\w+);?/;
  const match = content.match(defaultExportRegex);
  
  if (match) {
    const componentName = match[1];
    const newExport = `export default ${wrapperFunction}(${componentName});`;
    content = content.replace(defaultExportRegex, newExport);
    
    // Write back to file
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Protected: ${filePath} with ${wrapperFunction}`);
  } else {
    console.log(`⚠️  Could not find default export in ${filePath}`);
  }
}

// Main execution
console.log('🔐 Starting Auth Protection Migration...\n');

Object.entries(PAGES_TO_PROTECT).forEach(([filePath, role]) => {
  addAuthProtection(filePath, role);
});

console.log('\n✅ Migration completed!');
console.log('\n📝 Next steps:');
console.log('1. Review the changes');
console.log('2. Test each protected page');
console.log('3. Commit the changes');
