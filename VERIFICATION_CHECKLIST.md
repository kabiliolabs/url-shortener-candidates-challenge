# Verification Checklist

Quick checklist to verify the refactored URL shortener is working correctly.

---

## 🔍 Pre-Flight Check

Before testing, ensure:
- [x] Dependencies installed (`pnpm install` completed)
- [x] Database created (migration ran successfully)
- [x] Prisma client generated
- [x] Build successful (`pnpm build` passed)
- [x] Dev server running (`pnpm dev` on port 5173)

---

## ✅ Functional Tests

### 1. **URL Shortening Flow**

Visit `http://localhost:5173`

**Test Cases:**

| #  | Input URL | Expected Result | Pass/Fail |
|----|-----------|-----------------|-----------|
| 1  | `https://example.com` | ✅ Success message with short URL | ⬜ |
| 2  | `http://github.com` | ✅ Success message with short URL | ⬜ |
| 3  | Empty field | ❌ HTML5 validation error | ⬜ |
| 4  | `not-a-url` | ❌ "Invalid URL format" error | ⬜ |
| 5  | `javascript:alert(1)` | ❌ "Only HTTP and HTTPS" error | ⬜ |
| 6  | `http://localhost:8080` | ❌ "Cannot shorten internal" error | ⬜ |
| 7  | `http://192.168.1.1` | ❌ "Cannot shorten private" error | ⬜ |
| 8  | `https://example.com` (duplicate) | ✅ Returns existing short URL | ⬜ |

**Steps:**
1. Enter URL in the input field
2. Click "Shorten URL"
3. Verify success/error message
4. If success, verify short URL format (`/s/[7-chars]`)

---

### 2. **Copy to Clipboard**

**Test:**
1. ✅ Shorten a URL successfully
2. ✅ Click the "Copy" button
3. ✅ Paste in another app (should paste the full short URL)

Result: ⬜ Pass / ⬜ Fail

---

### 3. **URL Redirection**

**Test:**
1. ✅ Shorten `https://example.com`
2. ✅ Copy the short URL (e.g., `http://localhost:5173/s/Abc123X`)
3. ✅ Open the short URL in a new tab
4. ✅ Verify redirect to `https://example.com`

Result: ⬜ Pass / ⬜ Fail

---

### 4. **Dashboard Access**

Visit `http://localhost:5173/dashboard`

**Verify:**
- [ ] Dashboard loads without errors
- [ ] Shows "Total URLs" stat
- [ ] Shows "Total Clicks" stat
- [ ] Shows "Avg. Clicks per URL" stat
- [ ] Lists previously created URLs
- [ ] Each URL shows:
  - [ ] Short code with copy button
  - [ ] Original URL (clickable)
  - [ ] Click count
  - [ ] Creation date

Result: ⬜ Pass / ⬜ Fail

---

### 5. **Click Tracking**

**Test:**
1. ✅ Create a new shortened URL
2. ✅ Visit the dashboard (should show 0 clicks)
3. ✅ Click the short URL (opens in new tab, redirects)
4. ✅ Return to dashboard and refresh
5. ✅ Verify click count increased to 1
6. ✅ Expand "Recent Clicks" details
7. ✅ Verify timestamp, referer, and user agent recorded

Result: ⬜ Pass / ⬜ Fail

---

### 6. **404 Handling**

**Test:**
1. Visit `http://localhost:5173/s/invalid123`
2. Should see "Short URL not found" error page

Result: ⬜ Pass / ⬜ Fail

---

### 7. **Duplicate URL Handling**

**Test:**
1. ✅ Shorten `https://github.com` (note the short code)
2. ✅ Shorten `https://github.com` again
3. ✅ Verify same short code returned
4. ✅ Check dashboard (should show 1 URL, not 2)

Result: ⬜ Pass / ⬜ Fail

---

## 🔒 Security Tests

### 8. **Protocol Validation**

Test that dangerous protocols are blocked:

| Protocol | Test URL | Expected |
|----------|----------|----------|
| javascript | `javascript:alert(1)` | ❌ Rejected |
| file | `file:///etc/passwd` | ❌ Rejected |
| data | `data:text/html,<script>alert(1)</script>` | ❌ Rejected |
| ftp | `ftp://example.com/file.txt` | ❌ Rejected |

Result: ⬜ Pass / ⬜ Fail

---

### 9. **SSRF Prevention**

Test that internal addresses are blocked:

| Address | Test URL | Expected |
|---------|----------|----------|
| localhost | `http://localhost:8080` | ❌ Rejected |
| 127.0.0.1 | `http://127.0.0.1/admin` | ❌ Rejected |
| Private IP | `http://192.168.1.1` | ❌ Rejected |
| Private IP | `http://10.0.0.1` | ❌ Rejected |
| Link-local | `http://169.254.169.254/metadata` | ❌ Rejected |

Result: ⬜ Pass / ⬜ Fail

---

### 10. **Length Validation**

**Test:**
1. Create a URL longer than 2048 characters
2. Should be rejected with "URL is too long" error

Result: ⬜ Pass / ⬜ Fail

---

## 🎨 UI/UX Tests

### 11. **Responsive Design**

**Test on different screen sizes:**
- [ ] Desktop (>1024px) - Layout looks good
- [ ] Tablet (768px-1024px) - Layout adapts
- [ ] Mobile (< 768px) - Stacked layout, no horizontal scroll

Result: ⬜ Pass / ⬜ Fail

---

### 12. **Visual Design**

**Verify:**
- [ ] Clean, professional appearance (no garish colors)
- [ ] Consistent color scheme (blue/indigo theme)
- [ ] Proper spacing and alignment
- [ ] Readable fonts and text sizes
- [ ] Clear visual hierarchy

Result: ⬜ Pass / ⬜ Fail

---

### 13. **Loading States**

**Test:**
1. Submit URL shortening form
2. Verify button shows some feedback (disabled state, etc.)
3. Dashboard should load smoothly

Result: ⬜ Pass / ⬜ Fail

---

### 14. **Error Messages**

**Verify error messages are:**
- [ ] User-friendly (no technical jargon)
- [ ] Specific (explains what's wrong)
- [ ] Actionable (suggests how to fix)
- [ ] Visually distinct (red border/background)

Result: ⬜ Pass / ⬜ Fail

---

## 💾 Database Tests

### 15. **Data Persistence**

**Test:**
1. ✅ Create a shortened URL
2. ✅ Stop the dev server (Ctrl+C in terminal)
3. ✅ Restart dev server (`pnpm dev`)
4. ✅ Visit dashboard
5. ✅ Verify URL still exists

Result: ⬜ Pass / ⬜ Fail

---

### 16. **Database File**

**Check:**
```bash
ls -lh libs/db/dev.db
```

- [ ] File exists
- [ ] File size > 0 bytes
- [ ] Can open with SQLite browser (optional)

Result: ⬜ Pass / ⬜ Fail

---

### 17. **Prisma Studio** (Optional)

**Test:**
```bash
pnpm --filter @url-shortener/db prisma studio
```

- [ ] Opens at `http://localhost:5555`
- [ ] Shows `ShortenedUrl` table
- [ ] Shows `Click` table
- [ ] Can browse records

Result: ⬜ Pass / ⬜ Fail

---

## 🐳 Docker Tests

### 18. **Docker Build**

**Test:**
```bash
docker-compose build
```

- [ ] Build completes without errors
- [ ] All stages complete successfully
- [ ] Image size reasonable (< 500MB)

Result: ⬜ Pass / ⬜ Fail

---

### 19. **Docker Run**

**Test:**
```bash
docker-compose up
```

Then visit `http://localhost:3000`

- [ ] Application starts without errors
- [ ] Port 3000 accessible
- [ ] Can create shortened URLs
- [ ] Data persists after `docker-compose down && docker-compose up`

Result: ⬜ Pass / ⬜ Fail

---

## 🏗️ Architecture Tests

### 20. **Code Organization**

**Verify structure:**
```bash
tree -L 3 -I 'node_modules|.git|build|dist'
```

- [ ] `libs/db/` exists with Prisma schema
- [ ] `libs/engine/` has validators, short-code, types
- [ ] `applications/web/app/lib/` has service layer
- [ ] Old files removed (shortened-url.ts, base-url.ts)

Result: ⬜ Pass / ⬜ Fail

---

### 21. **TypeScript Compilation**

**Test:**
```bash
pnpm typecheck
```

- [ ] No TypeScript errors
- [ ] All types resolve correctly
- [ ] Prisma types generated

Result: ⬜ Pass / ⬜ Fail

---

### 22. **Build Process**

**Test:**
```bash
pnpm build
```

- [ ] Engine package builds (TypeScript → JavaScript)
- [ ] Web package builds (Vite + React Router)
- [ ] No build warnings or errors
- [ ] Build artifacts created

Result: ⬜ Pass / ⬜ Fail

---

## 📚 Documentation Tests

### 23. **Documentation Completeness**

**Verify files exist and are comprehensive:**
- [ ] `README.md` - Updated with new features
- [ ] `SETUP.md` - Complete setup instructions
- [ ] `REFACTORING_GUIDE.md` - Architecture decisions
- [ ] `IMPLEMENTATION_SUMMARY.md` - What was built
- [ ] `CHANGELOG.md` - Changes documented
- [ ] `VERIFICATION_CHECKLIST.md` - This file

Result: ⬜ Pass / ⬜ Fail

---

### 24. **Code Comments**

**Sample key files for documentation:**
```typescript
// Check these files have JSDoc comments:
libs/engine/src/validators.ts
libs/engine/src/short-code.ts
applications/web/app/lib/url-service.server.ts
```

- [ ] Functions have JSDoc comments
- [ ] Complex logic explained
- [ ] Security concerns documented
- [ ] Examples provided where helpful

Result: ⬜ Pass / ⬜ Fail

---

## 🎯 Summary

**Total Tests:** 24  
**Passed:** ___  
**Failed:** ___  
**Skipped:** ___  

---

## 🐛 Issue Tracking

If any test fails, document here:

### Issue 1:
- **Test:** #___
- **Expected:** 
- **Actual:** 
- **Fix:** 

### Issue 2:
- **Test:** #___
- **Expected:** 
- **Actual:** 
- **Fix:** 

---

## ✅ Sign-Off

**Tested by:** ________________  
**Date:** ________________  
**Status:** ⬜ All tests passed / ⬜ Issues found (see above)

---

## 🚀 Ready for Production?

After all tests pass:
- [ ] All functional tests passed
- [ ] All security tests passed
- [ ] UI/UX is acceptable
- [ ] Data persists correctly
- [ ] Docker deployment works
- [ ] Documentation complete

**If all checked: Ready for production! 🎉**

---

## Quick Test Script

For rapid testing, run these commands:

```bash
# 1. Verify installation
pnpm install

# 2. Build everything
pnpm build

# 3. Start dev server
pnpm dev

# 4. In another terminal, run typecheck
pnpm typecheck

# 5. Test Docker
docker-compose up --build

# 6. Test database
pnpm --filter @url-shortener/db prisma studio
```

Visit `http://localhost:5173` and manually test the features above.
