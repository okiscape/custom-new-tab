# Pretty New Tab
> Browser extension that replaces New-Tab with a new pretty one.

### About "New Tab" page
The default page in `./page/` written using `vue` + `vite`.
It have a simple logic for wallpaper random display, parallax effect(only for background), support for settings, and for pretty digit transitions.

### About "Settings" page
On Settings page you can:
1. Toggle seconds display
2. Toggle parallax effect
3. Manage added backgrounds
4. Edit Custom CSS for New-Tab page
*You can open settings in your browser extensions settings*

## Previews
**New-Tab page**
![New-Tab GIF](.readme/page-preview.gif)

**Settings page**
![Settings page screenshot](.readme/settings-preview.png)

## Customize
To replace default page with your own you should:
1. Replace `./src/page/` to your rendered page
2. Zip entire `./src/` folder in `*.xpi` archive
It's content should look like:\
`my-archive.xpi`\
 | - `manifest.json`\
 | - `page/`\
 | + - `index.html`
3. Move archive into Firefox's window to import your extension.
If previous version of extension was already imported - browser will replace it.
