// Cho phép `import './globals.css'` (import chỉ để nạp CSS). Một số bản TypeScript trong trình soạn thảo
// (VS Code dùng bản riêng) bật kiểm tra import kiểu này và báo "Cannot find module or type declarations".
// File `*.module.css` đã có khai báo riêng của Next nên không bị ảnh hưởng.
declare module '*.css';
