import os
import re

target_dir = r"c:\Users\rudra\Desktop\hireconnect-frontend\hireconnect-frontend\src\app"

color_map = {
    r'#f8fafc': 'var(--bg-main)',
    r'#f1f5f9': 'var(--bg-main)',
    r'#ffffff': 'var(--bg-surface)',
    r'#fff(?![\w\d])': 'var(--text-primary)',
    r'background:\s*#fff(?![\w\d])': 'background: var(--bg-surface)',
    r'background-color:\s*#fff(?![\w\d])': 'background-color: var(--bg-surface)',
    r'#0f172a': 'var(--text-primary)',
    r'#1e293b': 'var(--text-primary)',
    r'#334155': 'var(--text-primary)',
    r'#475569': 'var(--text-secondary)',
    r'#64748b': 'var(--text-muted)',
    r'#94a3b8': 'var(--text-muted)',
    r'#cbd5e1': 'var(--border-strong)',
    r'#e2e8f0': 'var(--border-strong)',
    r'#4338ca': 'var(--accent-primary)',
    r'#3730a3': 'var(--accent-secondary)',
    r'#2563eb': 'var(--accent-primary)',
    r'#1d4ed8': 'var(--accent-secondary)',
    r'#dbeafe': 'rgba(99, 102, 241, 0.1)',
    r'#eff6ff': 'rgba(99, 102, 241, 0.05)',
    r'#16a34a': 'var(--success)',
    r'#15803d': 'var(--success)',
    r'#dcfce7': 'rgba(16, 185, 129, 0.1)',
    r'#bbf7d0': 'rgba(16, 185, 129, 0.2)',
    r'#ef4444': 'var(--error)',
    r'#dc2626': 'var(--error)',
    r'#fee2e2': 'rgba(239, 68, 68, 0.1)',
    r'#fca5a5': 'rgba(239, 68, 68, 0.2)',
    r'#f59e0b': 'var(--warning)',
    r'#d97706': 'var(--warning)',
    r'#fef3c7': 'rgba(245, 158, 11, 0.1)',
    r'#fde68a': 'rgba(245, 158, 11, 0.2)',
    r'border:\s*1px\s*solid\s*#e2e8f0': 'border: 1px solid var(--border-strong)',
    r'border-color:\s*#e2e8f0': 'border-color: var(--border-strong)',
    r'border-bottom:\s*1px\s*solid\s*#e2e8f0': 'border-bottom: 1px solid var(--border-strong)',
    r'border-top:\s*1px\s*solid\s*#e2e8f0': 'border-top: 1px solid var(--border-strong)',
    r'box-shadow:\s*0.*?(?:rgba\(0,\s*0,\s*0,\s*0\.\d+\)|#e2e8f0)': 'box-shadow: var(--shadow-md)',
}

def convert_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Don't touch already processed files completely
    if "Premium Dark Theme" in content or "var(--bg-main)" in content:
        # Check if we should still run some replacements just in case
        pass
    
    for pattern, replacement in color_map.items():
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.scss'):
            filepath = os.path.join(root, file)
            # Skip the ones we completely rewrote to avoid breaking their custom logic
            if file in ['styles.scss', 'login.component.scss', 'candidate-register.component.scss', 
                        'recruiter-register.component.scss', 'dashboard.component.scss', 'admin-dashboard.component.scss']:
                continue
            convert_file(filepath)
