import os, sys

print("🛡️ CodeGuard AI Starting...")

if not os.path.exists("code.gs"):
    print("❌ CRITICAL: code.gs missing!")
    sys.exit(1)

with open("code.gs", "r", encoding="utf-8", errors="ignore") as f:
    code = f.read()

checks = ["getSuppliers", "getProducts", "doGet"]
missing = [c for c in checks if c not in code]

if missing:
    print(f"❌ Missing logic: {missing}")
    sys.exit(1)

print("✅ CodeGuard AI: All Safe!")
