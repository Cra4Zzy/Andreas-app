"""Resize the existing Abbate artwork into the native templates; no generated artwork."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
icon = Image.open(root / 'dist/icon-512.png').convert('RGB')
for path in (root / 'android/app/src/main/res').glob('mipmap-*/*.png'):
    with Image.open(path) as old:
        size = old.size
    if 'foreground' in path.name:
        canvas = Image.new('RGBA', size, (0, 0, 0, 0))
        artwork = icon.resize((round(size[0] * .62), round(size[1] * .62)), Image.Resampling.LANCZOS)
        canvas.paste(artwork, ((size[0]-artwork.width)//2, (size[1]-artwork.height)//2))
    else:
        canvas = icon.resize(size, Image.Resampling.LANCZOS)
    canvas.save(path)
icon.resize((1024, 1024), Image.Resampling.LANCZOS).save(root / 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
for pattern in ['android/app/src/main/res/drawable*/splash.png', 'ios/App/App/Assets.xcassets/Splash.imageset/*.png']:
    for path in root.glob(pattern):
        with Image.open(path) as old:
            size = old.size
        canvas = Image.new('RGB', size, '#f7f5ef')
        edge = round(min(size) * .3)
        artwork = icon.resize((edge, edge), Image.Resampling.LANCZOS)
        canvas.paste(artwork, ((size[0]-edge)//2, (size[1]-edge)//2))
        canvas.save(path)
print('Abbate icons and launch images prepared.')
