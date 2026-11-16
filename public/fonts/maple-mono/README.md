# Maple Mono Normal NL NF CN

Self-hosted default font for both interface and code. Source: [Maple Mono v7.9](https://github.com/subframe7536/maple-font/releases/tag/v7.9), `MapleMonoNormalNL-NF-CN.zip`.

Official archive SHA-256: `af8082c484cb1103da6c2efa4b76f403fe342f9a3ac81ff665b8c6c66c2f8863`.

Licensed under SIL Open Font License 1.1; see [LICENSE.txt](LICENSE.txt). The family name is `Maple Mono Normal NL NF CN`; the release archive names it `MapleMonoNormalNL-NF-CN`.

The regular (400) and bold (700) faces are converted to WOFF2. Both retain all 33,091 encoded characters, including Chinese, Nerd Font icons and Powerline glyphs. Browsers choose the nearest available weight and synthesize italics. Unicode ranges keep unused Chinese/icon subsets from downloading; common UI Chinese has a separate subset. The entire font bundle is about 15.3 MB, while regular Latin is about 70 KB and common Chinese about 250 KB.

Rebuild with Python and `fonttools[woff]==4.61.1`, after verifying the official archive hash:

```bash
python scripts/build-maple-fonts.py /path/to/MapleMonoNormalNL-NF-CN.zip
```

This generates the WOFF2 assets here and `app/fonts.css`. The script asserts that no encoded characters are lost. It is an asset maintenance step, not part of npm installation or application startup.
