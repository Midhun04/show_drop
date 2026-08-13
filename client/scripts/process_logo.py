from PIL import Image
from pathlib import Path

src = Path(
    r"C:\Users\Hp\.cursor\projects\d-ott-platform-Main-Project\assets"
    r"\c__Users_Hp_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"fe31a019bd2fb7077c3d4b726f02ee9d_images_showdrop-47f2b53e-26e3-4aff-b7a7-6614bc12cd95.png"
)
out_dir = Path(r"d:\ott platform\Main_Project\client\src\assets")

img = Image.open(src).convert("RGBA")
w, h = img.size


def is_black(r, g, b, a, threshold=28):
    return a > 0 and r <= threshold and g <= threshold and b <= threshold


def is_whiteish(r, g, b, a):
    return (
        a > 0
        and r >= 170
        and g >= 170
        and b >= 170
        and abs(r - g) < 40
        and abs(g - b) < 40
    )


dark = img.copy()
dp = dark.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = dp[x, y]
        if is_black(r, g, b, a):
            dp[x, y] = (0, 0, 0, 0)

light = dark.copy()
lp = light.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = lp[x, y]
        if a == 0:
            continue
        if is_whiteish(r, g, b, a):
            brightness = (r + g + b) / 3
            v = int(max(20, min(55, 255 - brightness)))
            lp[x, y] = (v, v, v, a)

dark_path = out_dir / "showdrop-logo-dark.png"
light_path = out_dir / "showdrop-logo-light.png"
dark.save(dark_path)
light.save(light_path)
print("saved", dark_path, dark_path.stat().st_size)
print("saved", light_path, light_path.stat().st_size)
