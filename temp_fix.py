import re

with open('D:\pos\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# Fix specific lines by index (0-based)
# Line 131 (index 130): '  fetchCloudData();' - ensure 2 spaces
if len(lines) > 130:
    lines[130] = '  fetchCloudData();'

# Line 132 (index 131): '}, []);' - ensure 2 spaces  
if len(lines) > 131:
    lines[131] = '  }, []); // Dependency [] kosong agar hanya berjalan 1x saat awal aplikasi dimuat'

# Line 133 (index 132): '  useEffect(() => {' - ensure 2 spaces
if len(lines) > 132:
    lines[132] = '  useEffect(() => {'

# Line 133 content: '    localStorage.setItem' - ensure 4 spaces
if len(lines) > 133:
    lines[133] = '    localStorage.setItem(\'pos_products\', JSON.stringify(products));'

# Line 134 (index 133): '  }, [products]);' - ensure 4 spaces  
if len(lines) > 134:
    lines[134] = '  }, [products]);'

# Line 135 (index 134): empty line
if len(lines) > 135:
    lines[135] = ''

# Line 136 (index 135): '  useEffect(() => {'
if len(lines) > 135:
    lines[135] = '  useEffect(() => {'

# Line 137 (index 136): '    localStorage.setItem' - ensure 4 spaces
if len(lines) > 136:
    lines[136] = '    localStorage.setItem(\'pos_history\', JSON.stringify(history));'

# Line 138 (index 137): '  }, [history]);' - ensure 4 spaces
if len(lines) > 137:
    lines[137] = '  }, [history]);'

# Line 139 (index 138): empty line
if len(lines) > 138:
    lines[138] = ''

# Line 140 (index 139): '  const categories'
if len(lines) > 139:
    lines[139] = '  const categories = useMemo(() => {'

content = '\n'.join(lines)

with open('D:\pos\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
