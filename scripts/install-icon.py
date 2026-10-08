from pathlib import Path
from PIL import Image
root = Path('android/app/src/main/res')
source = Image.open('www/app-icon.png').convert('RGB')
for density, size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    folder=root / ('mipmap-' + density)
    folder.mkdir(parents=True,exist_ok=True)
    for name in ['ic_launcher','ic_launcher_round']:
        source.resize((size,size), Image.Resampling.LANCZOS).save(folder/(name+'.png'))
# Android adaptive icons use full-bleed artwork with a crop-safe central subject.
folder=root/'drawable'
folder.mkdir(parents=True,exist_ok=True)
source.resize((432,432),Image.Resampling.LANCZOS).save(folder/'color_pop_icon.png')
(folder/'color_pop_foreground.xml').write_text('''<inset xmlns:android="http://schemas.android.com/apk/res/android" android:insetLeft="18%" android:insetRight="18%" android:insetTop="18%" android:insetBottom="18%"><bitmap android:src="@drawable/color_pop_icon" android:gravity="fill" /></inset>''')
values=root/'values'
values.mkdir(parents=True,exist_ok=True)
(values/'color_pop_icon_colors.xml').write_text('<resources><color name="color_pop_icon_bg">#51049C</color></resources>')
for qualifier in ['mipmap-anydpi-v26','mipmap-anydpi-v33']:
    folder=root/qualifier
    folder.mkdir(parents=True,exist_ok=True)
    for name in ['ic_launcher','ic_launcher_round']:
        (folder/(name+'.xml')).write_text('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
<background android:drawable="@color/color_pop_icon_bg" />
<foreground android:drawable="@drawable/color_pop_foreground" />
</adaptive-icon>''')
print('Color Pop Rush launcher icons installed')
