# Graph Report - frontend  (2026-10-08)

## Corpus Check
- 145 files · ~64,550 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .css 6, .example 1)

## Summary
- 723 nodes · 1880 edges · 37 communities (27 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f8aa48e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lucide-react
- ProductManager.tsx
- useAuthStore
- apiRequest
- react
- CategoryManager.tsx
- MegaMenuManager.tsx
- Skeleton.tsx
- Toast.tsx
- compilerOptions
- package.json
- product-detail.cjs
- wishlist.store.ts
- interactions.cjs
- product-images.cjs
- ref_node_assert
- banners.cjs
- devDependencies
- scripts
- playwright
- FilterSidebar.tsx
- banner-responsive.cjs
- Báo cáo refactor frontend
- mega-menu.cjs
- dependencies
- home-products.cjs
- ref_node_crypto
- .eslintrc.json
- next.config.js
- tailwindcss
- route.ts
- engines

## God Nodes (most connected - your core abstractions)
1. `apiRequest()` - 78 edges
2. `react` - 49 edges
3. `lucide-react` - 45 edges
4. `useAuthStore` - 39 edges
5. `mediaUrl()` - 35 edges
6. `Modal()` - 28 edges
7. `next` - 26 edges
8. `AttributeManager()` - 22 edges
9. `CategoryManager()` - 20 edges
10. `ProductSectionManager()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `6–7. Hợp nhất` --references--> `AuthUser`  [INFERRED]
  REFACTOR_REPORT.md → src/types/user.type.ts
- `DashboardPlaceholderPage()` --calls--> `AdminPageHeader()`  [EXTRACTED]
  src/app/admin/[...slug]/page.tsx → src/components/admin/AdminPageHeader.tsx
- `getAdminCategory()` --calls--> `apiRequest()`  [EXTRACTED]
  src/services/category.service.ts → src/services/http.client.ts
- `Page()` --calls--> `AttributeManager()`  [EXTRACTED]
  src/app/admin/attributes/page.tsx → src/components/admin/attribute/AttributeManager.tsx
- `BannersPage()` --calls--> `BannerManager()`  [EXTRACTED]
  src/app/admin/banners/page.tsx → src/components/admin/banner/BannerManager.tsx

## Import Cycles
- None detected.

## Communities (37 total, 10 thin omitted)

### Community 0 - "lucide-react"
Cohesion: 0.06
Nodes (53): lucide-react, next, zustand, Page(), Page(), Page(), Page(), STOCK_LABELS (+45 more)

### Community 1 - "ProductManager.tsx"
Cohesion: 0.06
Nodes (61): ProductsPage(), ProductDetail(), ProductForm(), slugify(), emptyQuery, ProductManager(), ProductDescription(), DetailState (+53 more)

### Community 2 - "useAuthStore"
Cohesion: 0.07
Nodes (50): DashboardLayout(), DashboardPlaceholderPage(), DashboardPlaceholderPageProps, GoogleCallbackPage(), ForgotPasswordPage(), metadata, LoginPage(), AdminUserMenu() (+42 more)

### Community 3 - "apiRequest"
Cohesion: 0.09
Nodes (52): Page(), DashboardPage(), ProductSectionsPage(), AdminFeedback(), AdminFeedbackProps, AdminPageHeader(), AdminPageHeaderProps, AttributeManager() (+44 more)

### Community 4 - "react"
Cohesion: 0.13
Nodes (33): react, BannersPage(), BannerCard(), BannerDeleteDialog(), BannerForm(), BannerManager(), BannerPreview(), BannerMedia() (+25 more)

### Community 5 - "CategoryManager.tsx"
Cohesion: 0.11
Nodes (31): CategoriesPage(), AdminFilterBar(), AdminFilterBarProps, slugifyCategory(), CategoryForm(), CategoryIconPicker(), CategoryManager(), compareCategories() (+23 more)

### Community 6 - "MegaMenuManager.tsx"
Cohesion: 0.12
Nodes (32): BrandsPage(), Page(), BrandForm(), slugify(), BrandManager(), emptyGroup, emptyItem, MegaMenuManager() (+24 more)

### Community 7 - "Skeleton.tsx"
Cohesion: 0.12
Nodes (20): CustomerLayout(), Loading(), Loading(), ProductPage(), BannerSkeleton(), CustomerShell(), aboutLinks, Footer() (+12 more)

### Community 8 - "Toast.tsx"
Cohesion: 0.10
Nodes (21): metadata, RootLayout(), ConfirmContext, ConfirmContextValue, ConfirmDialog(), ConfirmOptions, ConfirmProvider(), ConfirmRequest (+13 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "package.json"
Cohesion: 0.12
Nodes (16): description, name, private, version, autoprefixer, axe-core, clsx, eslint (+8 more)

### Community 11 - "product-detail.cjs"
Cohesion: 0.12
Nodes (13): assert, backend, { chromium }, path, { pathToFileURL }, { randomUUID, createHash }, assert, backend (+5 more)

### Community 12 - "wishlist.store.ts"
Cohesion: 0.24
Nodes (13): ApiRequestError, addWishlist(), checkWishlist(), getWishlist(), isUnauthorized(), removeWishlist(), WishlistAuthError, WishlistItem (+5 more)

### Community 13 - "interactions.cjs"
Cohesion: 0.12
Nodes (11): assert, banners, { chromium }, errors, hover(), product(), section, setup() (+3 more)

### Community 14 - "product-images.cjs"
Cohesion: 0.14
Nodes (10): assert, { chromium }, fs, os, path, { randomUUID }, remember(), request() (+2 more)

### Community 15 - "ref_node_assert"
Cohesion: 0.15
Nodes (8): assert, { chromium }, assert, { chromium }, assert, { chromium }, assert, { chromium }

### Community 16 - "banners.cjs"
Cohesion: 0.17
Nodes (7): assert, { chromium }, fs, os, path, { randomUUID }, sharp

### Community 17 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, axe-core, eslint, eslint-config-next, playwright, postcss, tailwindcss (+4 more)

### Community 18 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, lint, start, test:banners, test:brand-filter, test:google-auth (+3 more)

### Community 19 - "playwright"
Cohesion: 0.18
Nodes (8): playwright, assert, { chromium }, assert, banner, { chromium }, assert, { chromium }

### Community 20 - "FilterSidebar.tsx"
Cohesion: 0.29
Nodes (10): Collapsible(), FilterPanel(), FilterSidebar(), FilterSidebarProps, FilterState, OptionRow(), PanelProps, PriceFilter() (+2 more)

### Community 21 - "banner-responsive.cjs"
Cohesion: 0.22
Nodes (8): assert, boxes(), { chromium }, fs, geometry(), os, path, sharp

### Community 22 - "Báo cáo refactor frontend"
Cohesion: 0.20
Nodes (9): 10. Tệp không dùng đã xóa, 11. Kiểm tra, 12. Giới hạn còn tồn tại, 1. Cấu trúc trước, 2. Cấu trúc sau, 3–5. Thư mục xóa, đổi tên và tệp di chuyển, 6–7. Hợp nhất, 8–9. Route và import (+1 more)

### Community 23 - "mega-menu.cjs"
Cohesion: 0.22
Nodes (6): assert, backend, { chromium }, path, { pathToFileURL }, { randomUUID }

### Community 24 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, clsx, lucide-react, next, react, react-dom, tailwind-merge, zustand

### Community 25 - "home-products.cjs"
Cohesion: 0.25
Nodes (5): assert, { chromium }, fs, os, path

### Community 26 - "ref_node_crypto"
Cohesion: 0.40
Nodes (3): assert, { chromium }, { createHash }

## Knowledge Gaps
- **216 isolated node(s):** `extends`, `next/core-web-vitals`, `nextConfig`, `name`, `version` (+211 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 254 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playwright` connect `playwright` to `package.json`, `product-detail.cjs`, `interactions.cjs`, `product-images.cjs`, `banner-responsive.cjs`, `mega-menu.cjs`, `home-products.cjs`, `ref_node_crypto`?**
  _High betweenness centrality (0.261) - this node is a cross-community bridge._
- **What connects `extends`, `next/core-web-vitals`, `nextConfig` to the rest of the system?**
  _216 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.06049382716049383 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `lucide-react`, `ProductManager.tsx`, `useAuthStore`, `apiRequest`, `CategoryManager.tsx`, `MegaMenuManager.tsx`, `Skeleton.tsx`, `Toast.tsx`, `package.json`, `FilterSidebar.tsx`?**
  _High betweenness centrality (0.260) - this node is a cross-community bridge._
- **Should `ProductManager.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06393606393606394 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `ProductManager.tsx`, `useAuthStore`, `apiRequest`, `react`, `CategoryManager.tsx`, `MegaMenuManager.tsx`, `Skeleton.tsx`, `Toast.tsx`, `package.json`, `FilterSidebar.tsx`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Should `useAuthStore` be split into smaller, more focused modules?**
  _Cohesion score 0.06649616368286446 - nodes in this community are weakly interconnected._