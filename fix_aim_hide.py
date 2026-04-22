import os
path = r"c:\Users\User\Desktop\BrawlClone3D\index.html"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Fix the IDs for hiding
text = text.replace("'fire-btn-mobile'", "'aim-base'")

# Fix remaining fb to aimBase in despawnWorld
old_hide = """            const fb = document.getElementById('aim-base');
            if (fb) fb.style.display = 'none';"""
new_hide = """            const ab = document.getElementById('aim-base');
            if (ab) ab.style.display = 'none';"""
if old_hide in text:
    text = text.replace(old_hide, new_hide)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Fixed hiding logic")
