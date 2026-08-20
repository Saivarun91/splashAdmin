'use client';

import {
  Aperture,
  Camera,
  Crown,
  Focus,
  Frame,
  Gem,
  Globe,
  Image,
  Images,
  Layers,
  LayoutGrid,
  Link,
  Mail,
  Megaphone,
  Monitor,
  Package,
  Palette,
  Scan,
  Share2,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Sun,
  Tag,
  Truck,
  Wand2,
  Watch,
} from 'lucide-react';

const ICON_COMPONENTS = {
  Sparkles,
  Camera,
  Image,
  Aperture,
  Wand2,
  Palette,
  Gem,
  Sun,
  Layers,
  Focus,
  Scan,
  Frame,
  Shirt,
  Watch,
  Crown,
  ShoppingBag,
  ShoppingCart,
  Store,
  Globe,
  Smartphone,
  Monitor,
  Share2,
  Package,
  Tag,
  Truck,
  LayoutGrid,
  Images,
  Megaphone,
  Link,
  Mail,
};

export const GENERATE_ICON_NAMES = [
  'Sparkles',
  'Camera',
  'Image',
  'Aperture',
  'Wand2',
  'Palette',
  'Gem',
  'Sun',
  'Layers',
  'Focus',
  'Scan',
  'Frame',
  'Shirt',
  'Watch',
  'Crown',
];

export const ECOMMERCE_ICON_NAMES = [
  'ShoppingBag',
  'ShoppingCart',
  'Store',
  'Globe',
  'Smartphone',
  'Monitor',
  'Share2',
  'Package',
  'Tag',
  'Truck',
  'LayoutGrid',
  'Images',
  'Megaphone',
  'Link',
  'Mail',
];

export function LucideIconByName({ name, className = 'h-5 w-5', ...props }) {
  const Cmp = ICON_COMPONENTS[name] || Sparkles;
  return <Cmp className={className} {...props} />;
}

export default function IconPicker({ value, onChange, kind = 'generate' }) {
  const names = kind === 'ecommerce' ? ECOMMERCE_ICON_NAMES : GENERATE_ICON_NAMES;
  const options = names.includes(value) || !value ? names : [value, ...names];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {options.map((name) => {
          const selected = value === name;
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => onChange(name)}
              className={`flex h-11 flex-col items-center justify-center gap-1 rounded-md border ${
                selected
                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <LucideIconByName name={name} className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">Selected: {value || 'None'}</p>
    </div>
  );
}
