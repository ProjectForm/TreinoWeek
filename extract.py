import re, sys

with open('/home/claude/treino-app.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

def find_matching(src, open_pos, open_ch, close_ch):
    depth = 0
    i = open_pos
    while i < len(src):
        if src[i] == open_ch: depth += 1
        elif src[i] == close_ch:
            depth -= 1
            if depth == 0: return i
        i += 1
    raise Exception('não balanceado a partir de ' + str(open_pos))

def extract_decl(name, src):
    m = re.search(r'\n(?:export default )?(?:async )?function ' + re.escape(name) + r'\s*\(', src)
    if m:
        start = m.start() + 1
        paren_open = src.index('(', m.end() - 1)
        paren_close = find_matching(src, paren_open, '(', ')')
        brace_start = src.index('{', paren_close)
        brace_end = find_matching(src, brace_start, '{', '}')
        return src[start:brace_end+1]
    m = re.search(r'\nconst ' + re.escape(name) + r'\s*=', src)
    if m:
        start = m.start() + 1
        i = m.end()
        depth = 0
        while i < len(src):
            c = src[i]
            if c in '{[(': depth += 1
            elif c in '}])': depth -= 1
            elif c == ';' and depth == 0:
                return src[start:i+1]
            i += 1
        raise Exception('Fim não encontrado para const ' + name)
    raise Exception('Declaração não encontrada: ' + name)

if __name__ == '__main__':
    names = sys.argv[1:]
    for n in names:
        try:
            block = extract_decl(n, src)
            print('=== ' + n + ' (' + str(len(block)) + ' chars) ===')
        except Exception as e:
            print('ERRO em ' + n + ': ' + str(e))
