#!/usr/bin/env python3
"""
Scan all Python files in memory system for dependencies
"""

import ast
import os
import re
from pathlib import Path
from collections import defaultdict, Counter

def extract_imports_from_file(file_path: Path) -> set:
    """Extract all import statements from a Python file"""
    imports = set()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse with AST for accurate import detection
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.add(alias.name.split('.')[0])
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.add(node.module.split('.')[0])
        except SyntaxError:
            # Fallback to regex for files with syntax issues
            import_patterns = [
                r'^\s*import\s+([a-zA-Z_][a-zA-Z0-9_]*)',
                r'^\s*from\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+import',
            ]
            
            for line in content.split('\n'):
                for pattern in import_patterns:
                    match = re.search(pattern, line)
                    if match:
                        imports.add(match.group(1))
                        
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    
    return imports

def scan_memory_system():
    """Scan entire memory system for dependencies"""
    memory_root = Path(__file__).parent
    
    # Find all Python files
    python_files = []
    for root, dirs, files in os.walk(memory_root):
        for file in files:
            if file.endswith('.py'):
                python_files.append(Path(root) / file)
    
    print(f"Found {len(python_files)} Python files")
    
    # Track imports by file
    file_imports = {}
    all_imports = Counter()
    
    for py_file in python_files:
        relative_path = py_file.relative_to(memory_root)
        imports = extract_imports_from_file(py_file)
        file_imports[str(relative_path)] = imports
        all_imports.update(imports)
    
    # Standard library modules (Python 3.11+)
    stdlib_modules = {
        'os', 'sys', 'json', 'time', 'datetime', 'pathlib', 'threading', 'logging',
        'collections', 'functools', 'typing', 'dataclasses', 'hashlib', 're',
        'uuid', 'concurrent', 'asyncio', 'sqlite3', 'csv', 'urllib', 'http',
        'email', 'base64', 'math', 'random', 'itertools', 'operator', 'copy',
        'pickle', 'shutil', 'tempfile', 'glob', 'fnmatch', 'linecache',
        'traceback', 'warnings', 'io', 'struct', 'zlib', 'gzip', 'tarfile',
        'zipfile', 'configparser', 'argparse', 'subprocess', 'signal', 'socket',
        'ssl', 'multiprocessing', 'queue', 'weakref', 'gc', 'abc', 'contextlib',
        'importlib', 'pkgutil', 'modulefinder', 'runpy', 'ast', 'dis', 'inspect',
        'keyword', 'token', 'tokenize', 'parser', 'symbol', 'compiler'
    }
    
    # Separate third-party from standard library
    third_party = {}
    standard_lib = {}
    
    for module, count in all_imports.items():
        if module in stdlib_modules:
            standard_lib[module] = count
        else:
            third_party[module] = count
    
    return {
        'file_imports': file_imports,
        'third_party': third_party,
        'standard_lib': standard_lib,
        'all_files': [str(f.relative_to(memory_root)) for f in python_files]
    }

def generate_requirements_content(dependencies):
    """Generate requirements.txt content"""
    
    # Known package mappings and versions
    package_mapping = {
        'numpy': 'numpy>=1.21.0',
        'openai': 'openai>=1.0.0',
        'watchdog': 'watchdog>=2.1.0',
        'dotenv': 'python-dotenv>=0.19.0',
        'redis': 'redis>=4.0.0',
        'psycopg2': 'psycopg2-binary>=2.9.0',
        'requests': 'requests>=2.28.0',
        'flask': 'Flask>=2.0.0',
        'fastapi': 'fastapi>=0.68.0',
        'uvicorn': 'uvicorn>=0.15.0',
        'sqlalchemy': 'SQLAlchemy>=1.4.0',
        'alembic': 'alembic>=1.7.0',
        'pytest': 'pytest>=7.0.0',
        'black': 'black>=22.0.0',
        'flake8': 'flake8>=4.0.0',
        'mypy': 'mypy>=0.910',
        'pydantic': 'pydantic>=1.8.0',
        'click': 'click>=8.0.0',
        'jinja2': 'Jinja2>=3.0.0',
        'markdown': 'markdown>=3.3.0',
        'yaml': 'PyYAML>=6.0',
        'toml': 'tomli>=1.2.0',
        'rich': 'rich>=12.0.0',
        'typer': 'typer>=0.4.0',
        'httpx': 'httpx>=0.24.0',
        'aiohttp': 'aiohttp>=3.8.0',
        'websockets': 'websockets>=10.0',
        'pillow': 'Pillow>=9.0.0',
        'matplotlib': 'matplotlib>=3.5.0',
        'pandas': 'pandas>=1.4.0',
        'scipy': 'scipy>=1.8.0',
        'scikit': 'scikit-learn>=1.1.0',
        'sklearn': 'scikit-learn>=1.1.0',
        'torch': 'torch>=1.12.0',
        'tensorflow': 'tensorflow>=2.9.0',
        'transformers': 'transformers>=4.20.0',
        'huggingface': 'transformers>=4.20.0'
    }
    
    requirements = []
    
    # Add core dependencies that are commonly needed
    core_deps = [
        'numpy>=1.21.0',
        'python-dotenv>=0.19.0',
        'watchdog>=2.1.0',
        'openai>=1.0.0',
        'requests>=2.28.0',
        'pathlib-plus>=0.6.0'  # Enhanced pathlib
    ]
    
    requirements.extend(core_deps)
    
    # Add detected third-party packages
    for package in sorted(dependencies['third_party'].keys()):
        if package in package_mapping:
            req = package_mapping[package]
            if req not in requirements:
                requirements.append(req)
        else:
            # Generic version for unknown packages
            requirements.append(f"{package}>=1.0.0")
    
    return sorted(set(requirements))

def main():
    print("SCANNING MEMORY SYSTEM DEPENDENCIES...")
    print("=" * 60)
    
    dependencies = scan_memory_system()
    
    print(f"\nFiles Scanned: {len(dependencies['all_files'])}")
    print(f"Third-party packages: {len(dependencies['third_party'])}")
    print(f"Standard library modules: {len(dependencies['standard_lib'])}")
    
    print("\nThird-party Dependencies:")
    for package, count in sorted(dependencies['third_party'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {package:<20} (used in {count} files)")
    
    print("\nMost Used Standard Library:")
    for package, count in sorted(dependencies['standard_lib'].items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {package:<20} (used in {count} files)")
    
    # Generate requirements
    requirements = generate_requirements_content(dependencies)
    
    print(f"\nGenerated Requirements ({len(requirements)} packages):")
    for req in requirements:
        print(f"  {req}")
    
    # Save to file
    memory_root = Path(__file__).parent
    req_file = memory_root / 'requirements.txt'
    
    with open(req_file, 'w') as f:
        f.write("# Memory System Dependencies\n")
        f.write("# Generated automatically\n\n")
        for req in requirements:
            f.write(f"{req}\n")
    
    print(f"\n[OK] Requirements saved to: {req_file}")
    
    # Save detailed analysis
    analysis_file = memory_root / 'dependency_analysis.json'
    
    import json
    with open(analysis_file, 'w') as f:
        json.dump(dependencies, f, indent=2, default=str)
    
    print(f"[OK] Detailed analysis saved to: {analysis_file}")

if __name__ == "__main__":
    main()