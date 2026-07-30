const fs = require('fs');
const files = [
  'app/profile/[id]/page.tsx',
  'components/Traders/JobsLeads.tsx',
  'app/customer-dashboard/saved/page.tsx',
  'app/customer-dashboard/trader-profile/[id]/page.tsx',
  'components/Trader/TraderReviews.tsx',
  'components/Trader/TraderNavbar.tsx',
  'components/HomePage/ReviewSection.tsx',
  'components/DirectoryListing/DirectorySearchResults.tsx',
  'components/DirectoryListing/DirectoryListings.tsx',
  'components/Chat/ChatWindow.tsx',
  'app/customer-dashboard/inbox/page.tsx',
  'app/trader/inbox/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/if\s*\(!path\)\s*return\s*['"].*?['"];/g, 'if (!path) return "/avt.png";');
    content = content.replace(/if\s*\(!path\)\s*return\s*null;/g, 'if (!path) return "/avt.png";');
    content = content.replace(/if\s*\(!path\)\s*return\s*undefined;/g, 'if (!path) return "/avt.png";');
    
    // special cases
    content = content.replace(/if\s*\(!path\)\s*return\s*'';/g, 'if (!path) return "/avt.png";');
    
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  } else {
    console.log('Not found', file);
  }
});
