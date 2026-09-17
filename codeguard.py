import os, sys
print("🛡️ CodeGuard AI Starting...")

with open("code.gs", "r", encoding="utf-8", errors="ignore") as f:
    code = f.read()

checks = ["getSuppliers", "getProducts", "getLedger", "getProductLedger", "deleteAndRecalculate", "doGet"]
missing = []

for c in checks:
    if c not in code:
        missing.append(c)

if missing:
    print(f"❌ CRITICAL FAIL: Deleted functions -> {missing}")
    print("🚨 AI deleted business logic! Build failed to protect shopkeeper data!")
    sys.exit(1)

print("✅ CodeGuard AI: All Safe! All functions present.")
