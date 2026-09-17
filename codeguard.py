import sys

print("==========================================")
print("🛡️  CodeGuard AI Protection Started")
print("==========================================")

with open("code.gs", "r", encoding="utf-8", errors="ignore") as f:
    code = f.read()

critical = {
    "getSuppliers": "Supplier Data Logic",
    "getProducts": "Product List Logic", 
    "getLedger": "Khata Ledger Logic",
    "getProductLedger": "Product Ledger Report",
    "deleteAndRecalculate": "Stock Calculation",
    "doGet": "Main API Entry Point"
}

print(f"Checking {len(critical)} critical functions...\n")

deleted = []
for func, desc in critical.items():
    if func not in code:
        deleted.append(f"{func} ({desc})")
        print(f"❌ MISSING: {func} -> {desc}")
    else:
        print(f"✅ Found: {func}")

print("\n==========================================")
if deleted:
    print("🚨 CODEGUARD FAILED!")
    print(f"🚨 Total Deleted: {len(deleted)} functions")
    for d in deleted:
        print(f"   -> {d} DELETED by AI!")
    print("==========================================")
    print("⛔ Build FAILED to protect shopkeeper's business!")
    sys.exit(1)
else:
    print("✅ ALL SAFE! No deletion detected.")
    print("==========================================")
