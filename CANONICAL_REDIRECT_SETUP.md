# Canonical URL & Redirect Setup - sparklights.co.ke

## ✅ Canonical URLs Confirmed

All canonical URLs are set to **https://sparklights.co.ke** (non-www version):

### Pages with Canonical Tags:
- ✅ `index.html` → `https://sparklights.co.ke/`
- ✅ `collection.html` → `https://sparklights.co.ke/collection.html`
- ✅ `chandeliers-nairobi.html` → `https://sparklights.co.ke/chandeliers-nairobi.html`
- ✅ `ceiling-lights-nairobi.html` → `https://sparklights.co.ke/ceiling-lights-nairobi.html`
- ✅ `pendant-lights-nairobi.html` → `https://sparklights.co.ke/pendant-lights-nairobi.html`
- ✅ `dining-room-lights-nairobi.html` → `https://sparklights.co.ke/dining-room-lights-nairobi.html`

## 🔄 Redirect Implementation

### Method 1: JavaScript Redirect (Implemented)
Added redirect script to all HTML pages that automatically redirects `www.sparklights.co.ke` to `sparklights.co.ke`.

**Location:** In `<head>` section of all HTML files, before `</head>` tag.

**Code:**
```javascript
<script>
  if (window.location.hostname === 'www.sparklights.co.ke') {
    window.location.replace('https://sparklights.co.ke' + window.location.pathname + window.location.search + window.location.hash);
  }
</script>
```

### Method 2: _redirects File (For Netlify)
Created `_redirects` file for Netlify hosting (if applicable).

### Method 3: DNS/Hosting Level Redirect (Recommended)
For best SEO and performance, set up redirect at DNS/hosting level:

**GitHub Pages:**
- Configure custom domain in repository settings
- Set up DNS CNAME record pointing to GitHub Pages
- Add redirect rule in hosting provider

**Alternative Hosting:**
- Configure 301 redirect in hosting control panel
- Set up redirect rule: `www.sparklights.co.ke` → `sparklights.co.ke`

## 📋 Verification Checklist

- [x] All canonical URLs use `https://sparklights.co.ke` (non-www)
- [x] JavaScript redirect added to all HTML pages
- [x] _redirects file created (for Netlify)
- [ ] DNS-level redirect configured (recommended)
- [ ] Test redirect: Visit `www.sparklights.co.ke` → should redirect to `sparklights.co.ke`
- [ ] Verify canonical tags in Google Search Console

## 🎯 SEO Benefits

1. **Prevents Duplicate Content:** Ensures search engines index only one version (non-www)
2. **Consolidates Link Equity:** All links point to canonical domain
3. **Better Rankings:** Single domain authority instead of split between www and non-www
4. **User Experience:** Consistent URL structure

## 🔍 Testing

After deployment, test:
1. Visit `https://www.sparklights.co.ke` → Should redirect to `https://sparklights.co.ke`
2. Visit `http://www.sparklights.co.ke` → Should redirect to `https://sparklights.co.ke`
3. Check browser console for any redirect errors
4. Verify canonical tags in page source

## 📝 Notes

- JavaScript redirect works immediately but is not ideal for SEO (301 redirect preferred)
- For best results, configure DNS/hosting-level 301 redirect
- All canonical URLs are correctly set to non-www version
- Open Graph and Twitter Card URLs also use non-www version
