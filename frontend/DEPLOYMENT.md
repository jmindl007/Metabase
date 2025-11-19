# Nasazení EV dashboardu

Tyto instrukce popisují, kam nahrát statické soubory a jakou URL pak otevřít, aby se dashboard zobrazil. Cílové prostředí je klasický webhosting na Hostingeru (WordPress).

## Struktura souborů
```
frontend/
├─ ev-registrace.html
├─ ev-registrace.css
├─ ev-registrace.js
├─ ev-firma-detail.html
└─ index.html  (automatické přesměrování na `ev-registrace.html`)
```

## Doporučené umístění na Hostingeru
1. Připojte se do Správce souborů Hostingeru nebo použijte SFTP.
2. V kořeni webu (`/home/<user>/domains/<domena>/public_html/`) vytvořte podsložku `ev/`.
3. Do této složky zkopírujte **všechny** soubory z adresáře `frontend/` (viz výše). Výsledná cesta tedy bude například `public_html/ev/ev-registrace.html`.
4. Poté otevřete prohlížeč a navštivte `https://vase-domena/ev/`. Díky `index.html` se stránka automaticky přesměruje na `ev-registrace.html`, kde běží hlavní aplikace.

> Pokud soubory omylem nahrajete do `public_html/wp-content/ev`, musíte v prohlížeči přistoupit na `https://vase-domena/wp-content/ev/ev-registrace.html`. Wordpress totiž jinak zkusí najít vlastní stránku `/ev/…` a vrátí chybu 404, jak je vidět na screenshotu v zadání.

## Napojení na API na VPS
Frontend volá vaše existující API na `https://el-tech.vozidlaonline.cz/...`, takže není potřeba cokoliv dalšího nastavovat na Hostingeru. Stačí, že VPS běží a povoluje CORS pro váš hosting (což už je v současnosti splněné).

## Otevírání detailu firmy
Soubor `ev-firma-detail.html` musí ležet ve **stejné** složce jako hlavní dashboard. Klik na řádek firmy uloží data do `localStorage` a otevře nové okno právě na `ev-firma-detail.html`. Pokud by detail ležel na jiné doméně nebo v jiné podsložce, prohlížeč by data neviděl a stránka zůstala prázdná.

## Ověření po nasazení
1. Otevřete `https://vase-domena/ev/` – měla by se načíst mapa a tabulky s daty.
2. Vyberte kraj → okres → registrační místo → klikněte na konkrétní firmu. Mělo by se otevřít nové okno s mapou a tabulkami detailu.
3. Pokud by se místo aplikace zobrazila WordPress 404, je soubor ve špatné složce (viz výše). Pokud se zobrazí aplikace, ale bez dat, zkontrolujte v konzoli prohlížeče, zda API odpovídá (status 200).

Tím je nasazení hotové – není nutný žádný build krok ani úprava WordPressu.
