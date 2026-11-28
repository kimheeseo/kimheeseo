"""Check local HTML/Markdown links, assets, and JSON-inserted material anchors."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import posixpath
import re

ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.refs = set(), []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        for key in ['href', 'src']:
            if attrs.get(key):
                self.refs.append(attrs[key])

    handle_startendtag = handle_starttag

texts = {p.relative_to(ROOT).as_posix(): p.read_text() for p in ROOT.rglob('*.html') if '.git' not in p.parts}
for p in ROOT.glob('quiz500/data/materials/*.json'):
    data = json.loads(p.read_text())
    texts['quiz500/' + data['page']] += data['html']
data = json.loads((ROOT / 'quiz500/data/changes.json').read_text())
texts['quiz500/changelog.html'] += data['previousHomeHtml']
data = json.loads((ROOT / 'quiz500/data/home-materials.json').read_text())
texts['quiz500/index.html'] += ''.join(data['blocks'].values())
for p in ROOT.rglob('*.md'):
    if '.git' in p.parts:
        continue
    refs = re.findall(r'!?\[[^\]]*\]\(([^\s)]+)(?:[^)]*)\)', p.read_text())
    texts[p.relative_to(ROOT).as_posix()] = ''.join('<a href="' + h + '"></a>' for h in refs)
docs = {key: Document(text) for key, text in texts.items()}
checked, failures = 0, []
for page, doc in docs.items():
    for href in doc.refs:
        url = urlsplit(href)
        if url.scheme or url.netloc or not (url.path or url.fragment):
            continue
        checked += 1
        target = posixpath.normpath(posixpath.join(posixpath.dirname(page), unquote(url.path))) if url.path else page
        if url.path.startswith('/'):
            target = unquote(url.path).removeprefix('/kimheeseo/').lstrip('/')
        path = ROOT / target
        if path.is_dir():
            target = posixpath.join(target, 'index.html')
            path = ROOT / target
        if not path.exists():
            failures.append((page, href, 'missing file'))
        elif url.fragment and target in docs and unquote(url.fragment) not in docs[target].ids and not url.fragment.startswith('screen='):
            failures.append((page, href, 'missing anchor'))
for failure in failures:
    print(*failure, sep=' | ')
print(f'{len(docs)} documents, {checked} internal references, {len(failures)} failures')
raise SystemExit(bool(failures))
