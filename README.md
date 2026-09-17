# 🛡️ CodeGuard - AI Safety for Small Business

### Protecting Jai Bhavani Traders from AI Mistakes

> Problem: AI coding assistants can delete critical business logic in 1 second. For a shopkeeper, if `deleteAndRecalculate()` is deleted, his entire stock management fails and business is at risk.

### 🚀 My Solution - 2 Layer Protection

**1. Daily Auto Backup (Fixed 31st Aug Bug):**
- GitHub Action automatically backs up `code.gs` daily in `/backup` folder.
- Fixed bug where backup stopped working after 31st Aug due to date parsing logic.
- Even if live app crashes, shopkeeper can restore in 1 minute.

**2. CodeGuard AI Protection (Live in Actions):**
- `codeguard.py` checks every commit for 6 critical functions:
  `getSuppliers`, `getProducts`, `getLedger`, `getProductLedger`, `deleteAndRecalculate`, `doGet`
- If any function is deleted by AI -> Build FAILS with clear message: `DELETED by AI!`
- If all safe -> Build PASSES

### 📸 Live Proof

| Action | Result | What Happened |
| :--- | :--- | :--- |
| Delete `deleteAndRecalculate` | ❌ FAIL (Red) | CodeGuard detected: `Stock Calculation DELETED by AI!` |
| Restore Function | ✅ PASS (Green) | All critical functions found, business safe |

This proves the shop's business logic is protected from AI errors.

### 🌍 Where This Logic Can Be Used
- **Hospital App:** Protect `getPatientHistory`
- **School App:** Protect `calculateResult`
- **E-commerce:** Protect `processPayment`
- Any industry where AI must not delete critical code.

### Built For
e-Yantra IIT Bombay - AI Safety Hackathon 2026
Tech: Google Apps Script, GitHub Actions, Python
