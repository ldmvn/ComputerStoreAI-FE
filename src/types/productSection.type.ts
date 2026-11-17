import type { ProductHighlightSpec, ProductSpecification } from './product.type';

export type SectionProduct = {
  slug?: string;
  sku?: string;
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  isActive?: boolean;
  stockQuantity?: number;
  brandId?: number | null;
  categoryId?: number | null;
  attributeValueIds?: number[];
  specifications?: ProductSpecification[];
  highlightSpecs?: ProductHighlightSpec[];
  primaryImage?: string | null;
  sortOrder?: number;
};

export type QuickFilterTab = {
  id: string;
  label: string;
  filterType: 'ALL' | 'BRAND' | 'CATEGORY' | 'ATTRIBUTE';
  sortOrder: number;
  brandId?: number;
  brandSlug?: string | null;
  categoryId?: number;
  categorySlug?: string | null;
  attributeValueId?: number;
  attributeId?: number | null;
  attributeSlug?: string | null;
};

export type QuickFilterConfig = {
  enabled: boolean;
  tabs: QuickFilterTab[];
};

export type SectionType = 'PRODUCT_SECTION' | 'PROMOTIONAL_SECTION' | 'EVENT_SECTION';

// Khối sự kiện (flash sale). Tên giữa ruy băng = name, tên sự kiện = badge, phần nhấn = promoTitle, câu phụ = subtitle.
export type EventTheme = 'nha-giao' | 'black-friday' | '11-11' | 'tet';
export type EventIcon = 'cap' | 'tag' | 'gift' | 'flower' | 'bolt';

export type ProductSection = {
  id: number;
  type: SectionType;
  name: string;
  slug: string;
  subtitle: string | null;
  viewAllUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  showHighlightSpecs: boolean;
  quickFilterConfig: QuickFilterConfig | null;
  // Promotional fields
  badge: string | null;
  promoTitle: string | null;
  description: string | null;
  ctaEnabled: boolean;
  ctaLabel: string | null;
  ctaUrl: string | null;
  ctaStyle: 'primary' | 'outline';
  ctaRounded: 'rounded' | 'pill';
  imageUrl: string | null;
  imageAlt: string | null;
  imagePos: 'left' | 'right' | 'background' | 'none';
  colorPreset: 'dark-premium' | 'ember-orange' | 'light-minimal' | 'image-background';
  layout: 'text-left-cta-right' | 'image-left' | 'image-right';
  // Event fields (khối sự kiện)
  eventTheme?: EventTheme;
  eventIcon?: EventIcon;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
  products: SectionProduct[];
};

export type EventSectionInput = {
  type: 'EVENT_SECTION';
  name: string;
  slug: string;
  badge: string;
  promoTitle: string;
  subtitle: string;
  viewAllUrl: string;
  eventTheme: EventTheme;
  eventIcon: EventIcon;
  startsAt: string; // ISO
  endsAt: string;   // ISO
  sortOrder: number;
  isActive: boolean;
};

export type ProductSectionInput = {
  name: string;
  slug: string;
  subtitle: string;
  viewAllUrl: string;
  sortOrder: number;
  isActive: boolean;
  showHighlightSpecs: boolean;
};

export type PromotionalSectionInput = {
  type: 'PROMOTIONAL_SECTION';
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  badge: string;
  promoTitle: string;
  description: string;
  ctaEnabled: boolean;
  ctaLabel: string;
  ctaUrl: string;
  ctaStyle: 'primary' | 'outline';
  ctaRounded: 'rounded' | 'pill';
  imageAlt: string;
  imagePos: 'left' | 'right' | 'background' | 'none';
  colorPreset: 'dark-premium' | 'ember-orange' | 'light-minimal' | 'image-background';
  layout: 'text-left-cta-right' | 'image-left' | 'image-right';
};
