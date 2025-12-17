# SEO Configuration Guide

This document outlines all SEO optimizations implemented in this project. This serves as a template for future projects.

---

## Table of Contents

1. [Dynamic Page Titles & Meta Descriptions](#1-dynamic-page-titles--meta-descriptions)
2. [Open Graph & Social Media](#2-open-graph--social-media)
3. [Structured Data (Schema.org)](#3-structured-data-schemaorg)
4. [Language Support (Multilingual SEO)](#4-language-support-multilingual-seo)
5. [OG Image Generation](#5-og-image-generation)
6. [Automatic Image Optimization](#6-automatic-image-optimization)
7. [Sitemap & Robots.txt](#7-sitemap--robotstxt)
8. [Testing & Validation](#8-testing--validation)

---

## 1. Dynamic Page Titles & Meta Descriptions

### Implementation
Each page has unique, language-specific titles and meta descriptions that update dynamically.

### Files Modified
- `src/hooks/usePageMeta.ts` - Custom hook for updating page metadata
- `src/translations/translations.ts` - SEO translations for all pages
- All page components (HomePage, GalleryPage, etc.) - Use the hook

### How It Works
```typescript
// In each page component
usePageMeta({
  title: t.seo.home.title,
  description: t.seo.home.description
});
```

### Benefits
- ✅ Unique titles for each page improve search rankings
- ✅ Language-specific titles for FI/EN versions
- ✅ Updates document.title, meta description, OG tags, and Twitter tags
- ✅ Works with React 19+ without external dependencies

### Translation Structure
```typescript
seo: {
  home: {
    title: "Site Name - Main Description",
    description: "Detailed description of the homepage..."
  },
  // ... other pages
}
```

---

## 2. Open Graph & Social Media

### Implementation
Comprehensive Open Graph and Twitter Card tags for rich social media previews.

### Location
`index.html` - Lines 16-31

### Tags Included
```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="profile" />
<meta property="og:url" content="https://yourdomain.com/" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
<meta property="og:locale" content="fi_FI" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="..." />
<meta property="twitter:title" content="..." />
<meta property="twitter:description" content="..." />
<meta property="twitter:image" content="..." />
```

### Benefits
- ✅ Rich previews when shared on Facebook, LinkedIn, WhatsApp
- ✅ Twitter card support with large image
- ✅ Professional appearance in social media shares
- ✅ Increased click-through rates from social media

### Required Image
- **OG Image**: 1200×630px, JPG format
- Location: `/public/og-image.jpg`
- See [OG Image Generation](#5-og-image-generation) for automation

---

## 3. Structured Data (Schema.org)

### Implementation
JSON-LD structured data to help search engines understand content.

### Location
`index.html` - Lines 41-97

### Schemas Implemented

#### PerformingArtist Schema
```json
{
  "@context": "https://schema.org",
  "@type": "PerformingArtist",
  "name": "Person Name",
  "jobTitle": ["Title 1", "Title 2", "Title 3"],
  "description": "Description of the person",
  "genre": ["Genre1", "Genre2", "Genre3"],
  "nationality": { "@type": "Country", "name": "Country" },
  "knowsLanguage": ["Language1", "Language2"],
  "hasOccupation": [...]
}
```

**Use Cases**: Actors, musicians, performers, artists

#### ImageGallery Schema
```json
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Gallery Name",
  "description": "Gallery description",
  "url": "https://yourdomain.com/#gallery"
}
```

**Use Cases**: Photo galleries, portfolios, image collections

### Benefits
- ✅ Better indexing in Google search
- ✅ Can appear in Google Knowledge Graph
- ✅ Rich results in search (images, occupation, etc.)
- ✅ Industry-specific search optimization

### Customization
Replace `"PerformingArtist"` with appropriate schema type:
- `"Person"` - Generic person
- `"Organization"` - Companies
- `"LocalBusiness"` - Local businesses
- `"Product"` - Products/services

---

## 4. Language Support (Multilingual SEO)

### Implementation
URL-based language switching with hreflang tags.

### Files Modified
- `index.html` - Lines 36-39 (hreflang tags)
- `src/contexts/LanguageContext.tsx` - URL parameter handling

### How It Works

**URLs:**
- Finnish (default): `https://yourdomain.com/`
- English: `https://yourdomain.com/?lang=en`

**hreflang Tags:**
```html
<link rel="alternate" hreflang="fi" href="https://yourdomain.com/" />
<link rel="alternate" hreflang="en" href="https://yourdomain.com/?lang=en" />
<link rel="alternate" hreflang="x-default" href="https://yourdomain.com/" />
```

### Language Detection Priority
1. URL parameter (`?lang=en`)
2. localStorage (previous selection)
3. Default (Finnish)

### Benefits
- ✅ Google indexes both language versions separately
- ✅ Users can share language-specific URLs
- ✅ Better international SEO
- ✅ Cleaner URLs for primary language

### Adding More Languages
1. Add hreflang tag: `<link rel="alternate" hreflang="de" href="...?lang=de" />`
2. Update LanguageContext to support new language code
3. Add translations to `translations.ts`

---

## 5. OG Image Generation

### Implementation
Automated script to generate 1200×630px Open Graph images from hero images.

### Location
`create-og-image.js`

### Usage
```bash
node create-og-image.js
```

### Configuration
```javascript
const inputPath = 'public/assets/hero-bg.jpg';  // Source image
const outputPath = 'public/og-image.jpg';        // Output image
const cropTop = originalHeight / 5;              // Crop position
```

### Features
- ✅ Automatic cropping to 1200×630px (OG standard)
- ✅ Configurable crop position (default: 1/5 from top)
- ✅ JPEG output at 90% quality
- ✅ Maintains aspect ratio

### Requirements
- Input: High-resolution hero image (JPG/PNG)
- Output: `public/og-image.jpg` (1200×630px)
- Dependencies: Sharp (image processing library)

### Testing
Test your OG image using:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: Share the URL and preview

---

## 6. Automatic Image Optimization

### Implementation
Prebuild hook that automatically optimizes images before deployment.

### Files Modified
- `package.json` - Scripts section
- `optimize-images.js` - Optimization script

### Package.json Configuration
```json
{
  "scripts": {
    "optimize": "node optimize-images.js",
    "prebuild": "node optimize-images.js",
    "build": "tsc -b && vite build"
  }
}
```

### How It Works
1. Original images uploaded to `/public/images/downloads/`
2. Prebuild script runs before every build
3. Creates optimized WebP versions in `/public/images/web/`
4. Gallery auto-generates web paths from download paths

### Optimization Settings
- **Format**: WebP
- **Max width**: 1200px
- **Quality**: 85%
- **Input formats**: JPG, PNG

### Benefits
- ✅ Faster page loading
- ✅ Better Core Web Vitals scores
- ✅ Automatic optimization (no manual steps)
- ✅ Smaller file sizes (50-80% reduction)

### CMS Integration
- Users upload high-res images via CMS
- Only downloads folder configured in CMS
- Optimization happens automatically on build

---

## 7. Sitemap & Robots.txt

### Sitemap (`public/sitemap.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Additional pages... -->
</urlset>
```

**Update lastmod dates** when making significant changes.

### Robots.txt (`public/robots.txt`)

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml

Disallow: /admin/
```

### Benefits
- ✅ Helps search engines discover all pages
- ✅ Indicates update frequency
- ✅ Sets page priority
- ✅ Blocks crawling of admin areas

### Maintenance
Update sitemap when:
- Adding new pages
- Changing URL structure
- Making major content updates

---

## 8. Testing & Validation

### Tools for Testing SEO

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Tests: Structured data validation

2. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Tests: Open Graph tags

3. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Tests: Twitter card tags

4. **Google Search Console**
   - Submit sitemap
   - Monitor indexing status
   - Check mobile usability

5. **PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Tests: Core Web Vitals, performance

### Validation Checklist

- [ ] All pages have unique titles and descriptions
- [ ] OG image displays correctly (1200×630px)
- [ ] Structured data validates without errors
- [ ] hreflang tags point to correct URLs
- [ ] Sitemap.xml accessible and valid
- [ ] Robots.txt allows search engine crawling
- [ ] Images load in WebP format
- [ ] Language switching updates URL correctly
- [ ] Mobile-friendly (Google Mobile-Friendly Test)
- [ ] Page load time < 3 seconds

---

## Quick Reference

### Files to Update for New Projects

1. **index.html**
   - Update domain in all URLs
   - Update person/organization name
   - Update job titles and description
   - Update social media links

2. **translations.ts**
   - Update all SEO titles and descriptions
   - Customize for your content

3. **sitemap.xml**
   - Update domain
   - Update lastmod dates
   - Add/remove pages as needed

4. **robots.txt**
   - Update sitemap URL
   - Add any additional disallow rules

5. **create-og-image.js**
   - Update input image path
   - Adjust crop position if needed

6. **package.json**
   - Ensure prebuild script is present
   - Verify optimization script runs

---

## SEO Best Practices Summary

### Content
- ✅ Unique title for every page (50-60 characters)
- ✅ Compelling meta descriptions (150-160 characters)
- ✅ Proper heading hierarchy (H1, H2, H3)
- ✅ Alt text for all images
- ✅ Internal linking between pages

### Technical
- ✅ Fast loading times (< 3 seconds)
- ✅ Mobile-responsive design
- ✅ HTTPS enabled
- ✅ Clean URL structure
- ✅ Canonical tags
- ✅ XML sitemap
- ✅ Robots.txt

### Advanced
- ✅ Structured data (Schema.org)
- ✅ Open Graph tags
- ✅ Language alternates (hreflang)
- ✅ Image optimization
- ✅ Core Web Vitals optimization

---

## Additional Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Web.dev SEO Guide](https://web.dev/learn/seo/)
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)

---

**Last Updated**: December 2025
**Template Version**: 1.0
