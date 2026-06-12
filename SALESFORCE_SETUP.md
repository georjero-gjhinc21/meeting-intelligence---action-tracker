# ✅ Salesforce Setup - Ready to Connect!

**Your Configuration:**
```bash
VITE_SALESFORCE_CLIENT_ID=3MVG9WVXk15qiz1Jdxbx5tCXDqPPYYmhOK4oP761sxA8i1tL1GBvxjhwY7CDT2pVB7XzZseT3kajnRHBEmQFz
VITE_SALESFORCE_REDIRECT_URI=http://localhost:3000/salesforce/callback
VITE_SALESFORCE_LOGIN_URL=https://login.salesforce.com
```

✅ **Added to `.env.local`** - Configuration complete!

---

## ⚠️ IMPORTANT: Update Salesforce Connected App

Your Connected App **must** have this exact callback URL:

```
http://localhost:3000/salesforce/callback
```

**If you set it to port 3002, you need to update it:**

### **Steps to Update in Salesforce:**

1. Log into Salesforce
2. Go to **Setup** → **App Manager**
3. Find your Connected App (the one with Client ID ending in `...EmQFz`)
4. Click **▼** dropdown → **Edit**
5. Scroll to **OAuth Settings**
6. Update **Callback URL** to:
   ```
   http://localhost:3000/salesforce/callback
   ```
7. Click **Save**
8. Wait 2-5 minutes for changes to propagate

---

## 🚀 Quick Start

### **1. Start the Application**
```bash
npm run dev
```

This will start:
- ✅ Express API server on port 3001
- ✅ Vite dev server on **port 3000**
- ✅ App accessible at: http://localhost:3000

### **2. Connect to Salesforce**
1. Navigate to **Salesforce Sync** tab
2. Click **"Connect to Salesforce"** button
3. You'll be redirected to Salesforce login
4. Enter your Salesforce credentials
5. Click **"Allow"** to grant permissions
6. You'll be redirected back to: `http://localhost:3000/salesforce/callback`
7. App will extract the access token and connect automatically
8. Status will show: **"Connected as [Your Name]"** ✅

### **3. Start Syncing**
**Option 1: Bulk Sync**
1. Stay on "Salesforce Sync" tab
2. Click **"Sync Actions"** button
3. Up to 5 pending actions will be pushed to Salesforce
4. See success notification with count

**Option 2: Individual Push**
1. Go to "Action Tracker" tab
2. Click any action item to open detail modal
3. Click **"Push to Salesforce"** button
4. See success message with Salesforce Task ID

---

## 🔍 Verify Connection

After connecting, you should see:

### **In the App:**
```
Salesforce CRM ✅ LIVE
Status: Connected ✅

Connected as [Your Name] • Push action items to Salesforce CRM

[Disconnect] [Sync Actions]
```

### **In Salesforce:**
1. Go to Salesforce → **Tasks** tab
2. Look for newly created tasks
3. Subject will match your action item titles
4. Description will include AI context

---

## 🐛 Troubleshooting

### **Issue: "redirect_uri_mismatch" Error**

**Cause:** Callback URL in Salesforce doesn't match `.env.local`

**Solution:**
1. Check Salesforce Connected App has: `http://localhost:3000/salesforce/callback`
2. Check `.env.local` has: `VITE_SALESFORCE_REDIRECT_URI=http://localhost:3000/salesforce/callback`
3. Restart dev server: `npm run dev`

### **Issue: "Not Configured" Warning**

**Cause:** Environment variables not loaded

**Solution:**
1. Verify `.env.local` has all 3 Salesforce variables
2. Restart dev server completely (Ctrl+C, then `npm run dev`)
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### **Issue: "Connected App Not Found"**

**Cause:** Client ID doesn't match or app not propagated

**Solution:**
1. Verify Client ID matches exactly
2. Wait 2-10 minutes after creating/editing Connected App
3. Try again

### **Issue: Redirect Goes to Port 3002**

**Cause:** Browser cached old redirect URI

**Solution:**
1. Update Salesforce Connected App callback to port 3000
2. Clear browser cache
3. Restart dev server
4. Try connecting again

---

## 📊 Configuration Summary

| Setting | Value | Status |
|---------|-------|--------|
| **Client ID** | `3MVG9WVXk15qiz1J...EmQFz` | ✅ Set |
| **Redirect URI** | `http://localhost:3000/salesforce/callback` | ✅ Corrected to port 3000 |
| **Login URL** | `https://login.salesforce.com` | ✅ Production |
| **Environment** | `.env.local` | ✅ Configured |
| **App Port** | `3000` | ✅ Vite default |

---

## ✅ Checklist

- [x] `.env.local` has `VITE_SALESFORCE_CLIENT_ID`
- [x] `.env.local` has `VITE_SALESFORCE_REDIRECT_URI` (port 3000)
- [x] `.env.local` has `VITE_SALESFORCE_LOGIN_URL`
- [ ] **Salesforce Connected App callback URL updated to port 3000**
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Ready to connect!

---

## 🎉 You're Ready!

Once you've updated the callback URL in Salesforce to port **3000**, you're all set!

**Next:** `npm run dev` and click "Connect to Salesforce"
