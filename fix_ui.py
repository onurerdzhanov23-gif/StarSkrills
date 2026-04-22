import os

path = r'c:\Users\User\Desktop\BrawlClone3D\index.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix script leak
# Find the specific comment and the line after it
leak_target = "<!-- No more duplicate game.js needed -->\n    // Simple language switcher - works for sure"
leak_replacement = "<!-- No more duplicate game.js needed -->\n    <script>\n    // Simple language switcher - works for sure"

if leak_target in content:
    content = content.replace(leak_target, leak_replacement)
    print("Fixed script leak")
else:
    # Try with different line endings
    leak_target_crlf = leak_target.replace("\n", "\r\n")
    if leak_target_crlf in content:
        content = content.replace(leak_target_crlf, leak_replacement.replace("\n", "\r\n"))
        print("Fixed script leak (CRLF)")
    else:
        print("Could not find script leak target")

# 2. Add Settings CSS
css_target = "#reload-overlay {\n            position: fixed;\n            top: 0; left: 0; width: 100vw; height: 100vh;\n            background: rgba(0,0,0,0.9);\n            z-index: 9999;\n            display: none;\n            flex-direction: column;\n            align-items: center;\n            justify-content: center;\n            color: #ffcc00;\n            font-family: 'Outfit', sans-serif;\n        }"
css_replacement = css_target + """

        /* --- Settings Overlay Style --- */
        #settings-overlay {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            z-index: 8500;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-family: 'Poppins', sans-serif;
        }
        #settings-overlay h2 {
            font-size: 3rem;
            color: #ffcc00;
            text-shadow: 0 0 20px rgba(255, 204, 0, 0.4);
            margin-bottom: 30px;
        }
        .settings-content {
            background: rgba(255,255,255,0.05);
            padding: 40px;
            border-radius: 30px;
            border: 2px solid rgba(255,255,255,0.1);
            text-align: center;
            max-width: 800px;
        }
        .settings-languages-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
        }"""

if css_target in content:
    content = content.replace(css_target, css_replacement)
    print("Added settings CSS")
else:
    css_target_crlf = css_target.replace("\n", "\r\n")
    if css_target_crlf in content:
        content = content.replace(css_target_crlf, css_replacement.replace("\n", "\r\n"))
        print("Added settings CSS (CRLF)")
    else:
        print("Could not find CSS target")

# 3. Add Settings HTML
html_target = '<div id="reload-overlay">\n        <h1 id="reload-text" style="font-size: 3rem;">CARGANDO...</h1>\n    </div>'
html_replacement = html_target + """

    <!-- Settings Overlay (Ajustes) -->
    <div id="settings-overlay">
        <div class="settings-content">
            <h2>AJUSTES</h2>
            <p style="font-size: 1.2rem; margin-bottom: 20px;">IDIOMA / LANGUAGE</p>
            <div class="settings-languages-grid">
                <button class="lang-btn" data-lang="es">ESPAÑOL</button>
                <button class="lang-btn" data-lang="en">ENGLISH</button>
                <button class="lang-btn" data-lang="pt">PORTUGUÊS</button>
                <button class="lang-btn" data-lang="it">ITALIANO</button>
                <button class="lang-btn" data-lang="de">DEUTSCH</button>
                <button class="lang-btn" data-lang="fr">FRANÇAIS</button>
            </div>
            <button id="volver-btn" style="margin-top: 40px; padding: 15px 40px; background: #ff4444; color: #fff; border: 4px solid #fff; border-radius: 50px; font-weight: 800; cursor: pointer;">VOLVER</button>
        </div>
    </div>"""

if html_target in content:
    content = content.replace(html_target, html_replacement)
    print("Added settings HTML")
else:
    html_target_crlf = html_target.replace("\n", "\r\n")
    if html_target_crlf in content:
        content = content.replace(html_target_crlf, html_replacement.replace("\n", "\r\n"))
        print("Added settings HTML (CRLF)")
    else:
        print("Could not find HTML target")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
