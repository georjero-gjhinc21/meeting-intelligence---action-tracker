# 🔧 Fixing Salesforce OAuth Error

**Error:** `OAUTH_APPROVAL_ERROR_GENERIC`  
**Message:** "An unexpected error has occurred during authentication"

---

## 🎯 Root Cause

Your Connected App needs additional configuration for OAuth to work properly.

---

## ✅ Fix: Update Connected App Settings

### **Step 1: Edit Connected App**

1. Log into Salesforce: https://orgfarm-27aa34b5d9-dev-ed.develop.my.salesforce.com
2. Go to **Setup** (gear icon top right)
3. In Quick Find box, search: **App Manager**
4. Find your Connected App
5. Click **▼** dropdown → **Edit**

---

### **Step 2: OAuth Settings - CRITICAL**

Scroll to **OAuth Settings** section and configure:

#### **✅ Enable OAuth Settings**
- [x] **Enable OAuth Settings** (must be checked)

#### **✅ Callback URL**
```
http://localhost:3000/salesforce/callback
```
**IMPORTANT:** Must be EXACTLY this (no trailing slash, correct port)

#### **✅ Selected OAuth Scopes**
Move these to "Selected OAuth Scopes":
- **Access and manage your data (api)**
- **Perform requests at any time (refresh_token, offline_access)**

**How to add scopes:**
1. Find scopes in "Available OAuth Scopes" list (left)
2. Click to select
3. Click **Add** arrow button →
4. They should appear in "Selected OAuth Scopes" (right)

#### **✅ IMPORTANT: Enable for Admin-Approved Users**

This is often the missing piece:

1. Scroll down to **OAuth Policies** section
2. Find: **Permitted Users**
3. Change from: ~~"All users may self-authorize"~~
4. Change to: **"Admin approved users are pre-authorized"** ✅

**Why this matters:** Dev orgs often require this setting for OAuth to work.

---

### **Step 3: Additional OAuth Settings**

While still in OAuth Settings:

#### **✅ IP Relaxation** (Optional but helpful)
- **IP Relaxation**: "Relax IP restrictions"

#### **✅ Refresh Token Policy** (Optional)
- **Refresh Token Policy**: "Refresh token is valid until revoked"

---

### **Step 4: Save Changes**

1. Click **Save** at bottom
2. You'll see a warning about propagation time
3. **Wait 2-10 minutes** for changes to take effect

---

### **Step 5: Manage Connected App Profiles** (CRITICAL)

After saving, you need to assign users/profiles:

1. Still in **App Manager**, find your Connected App
2. Click **▼** dropdown → **Manage**
3. Click **Manage Profiles** or **Manage Permission Sets**
4. Select your profile (usually **System Administrator**)
5. Click **Save**

**Why this is needed:** The "Admin approved users" setting requires explicit profile/permission set assignment.

---

## 🔄 Alternative: Use "All Users May Self-Authorize"

If you don't want to manage profiles:

### **Simpler Approach:**

1. **Edit Connected App** → **OAuth Settings**
2. **Permitted Users**: **"All users may self-authorize"**
3. **Save**

This is easier for dev/testing but less secure for production.

---

## ✅ Complete Checklist

**In Connected App OAuth Settings:**
- [ ] **Enable OAuth Settings** - Checked
- [ ] **Callback URL** - `http://localhost:3000/salesforce/callback`
- [ ] **Selected OAuth Scopes** - `api` and `refresh_token`
- [ ] **Permitted Users** - Set to "Admin approved users" OR "All users may self-authorize"
- [ ] If using "Admin approved users":
  - [ ] **Manage Profiles** - Your profile added
  - [ ] Or **Manage Permission Sets** - Your permission set added
- [ ] **Saved** - Waited 2-10 minutes

---

## 🧪 Test Again

### **1. Clear Browser Cache**
```
Chrome/Edge: Ctrl+Shift+Del
Firefox: Ctrl+Shift+Del
Safari: Cmd+Option+E
```
Or use **Incognito/Private window**

### **2. Restart Dev Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### **3. Try Connecting Again**
1. Go to http://localhost:3000
2. Navigate to **Salesforce Sync** tab
3. Click **"Connect to Salesforce"**
4. Should now work! ✅

---

## 🐛 Still Getting Errors?

### **Check These:**

#### **1. Verify Callback URL EXACTLY Matches**

In Salesforce:
```
http://localhost:3000/salesforce/callback
```

In `.env.local`:
```
VITE_SALESFORCE_REDIRECT_URI=http://localhost:3000/salesforce/callback
```

**Common mistakes:**
- ❌ `https://` instead of `http://`
- ❌ Trailing slash: `callback/`
- ❌ Wrong port: `:3002` instead of `:3000`

#### **2. Check Client ID**

In Connected App → **Consumer Key**:
```
3MVG9WVXk15qiz1Jdxbx5tCXDqPPYYmhOK4oP761sxA8i1tL1GBvxjhwY7CDT2pVB7XzZseT3kajnRHBEmQFz
```

In `.env.local` → `VITE_SALESFORCE_CLIENT_ID`:
```
3MVG9WVXk15qiz1Jdxbx5tCXDqPPYYmhOK4oP761sxA8i1tL1GBvxjhwY7CDT2pVB7XzZseT3kajnRHBEmQFz
```

Must match EXACTLY (no spaces, no line breaks)

#### **3. Check Session Security**

1. **Setup** → **Session Settings**
2. Scroll to **Session Security Levels**
3. If "High Assurance" is required, temporarily disable for testing:
   - Uncheck "Require high-assurance session security"
   - Or add exception for localhost

#### **4. Check User Permissions**

Your Salesforce user needs:
- **API Enabled** permission
- Access to the Connected App

To verify:
1. **Setup** → **Users** → Your user
2. Check **API Enabled** is checked
3. Check profile has "Connected App Access"

---

## 📋 Quick Fix Summary

**Most Common Fix (90% of cases):**

1. Connected App → **Edit**
2. **Permitted Users** → "All users may self-authorize"
3. **Save**
4. Wait 2 minutes
5. Try connecting again

**OR if you prefer security:**

1. **Permitted Users** → "Admin approved users are pre-authorized"
2. **Manage Profiles** → Add "System Administrator"
3. **Save**
4. Wait 2 minutes
5. Try connecting again

---

## 🔍 Debug: Check OAuth URL

When you click "Connect to Salesforce", the URL should look like:

```
https://orgfarm-27aa34b5d9-dev-ed.develop.my.salesforce.com/services/oauth2/authorize?
  response_type=token
  &client_id=3MVG9WVXk15qiz1Jdxbx5tCXDqPPYYmhOK4oP761sxA8i1tL1GBvxjhwY7CDT2pVB7XzZseT3kajnRHBEmQFz
  &redirect_uri=http://localhost:3000/salesforce/callback
  &scope=api refresh_token
  &state=<random-uuid>
```

**Check:**
- ✅ `client_id` matches your Consumer Key
- ✅ `redirect_uri` = `http://localhost:3000/salesforce/callback`
- ✅ `scope` includes `api` and `refresh_token`

---

## 📞 If Still Stuck

**Create a NEW Connected App from scratch:**

Sometimes easier than debugging:

1. **Setup** → **App Manager** → **New Connected App**
2. **Name**: Zireh Meeting Intelligence V2
3. **Email**: your@email.com
4. **Enable OAuth Settings**: ✅
5. **Callback URL**: `http://localhost:3000/salesforce/callback`
6. **OAuth Scopes**: `api`, `refresh_token`
7. **Permitted Users**: "All users may self-authorize"
8. **Save**
9. Copy new **Consumer Key**
10. Update `.env.local` with new Client ID
11. Restart dev server
12. Try again

---

## ✅ Expected Success Flow

After fixing, you should see:

1. Click "Connect to Salesforce"
2. Redirect to Salesforce login (dev org)
3. Enter credentials
4. Click "Allow"
5. Redirect back to app
6. **Success!** "Connected as [Your Name]"
7. Can now sync actions

---

**The issue is 99% likely in the Connected App OAuth configuration. Follow the checklist above and it should work! 🚀**
