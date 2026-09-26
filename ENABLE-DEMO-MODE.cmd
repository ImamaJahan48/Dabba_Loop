@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='.env.local'; if (!(Test-Path $p)) { New-Item $p -ItemType File | Out-Null }; $c=Get-Content $p -Raw; if ($c -match '(?m)^NEXT_PUBLIC_DEMO_MODE=') { $c=[regex]::Replace($c,'(?m)^NEXT_PUBLIC_DEMO_MODE=.*$','NEXT_PUBLIC_DEMO_MODE=true') } else { if ($c.Length -gt 0 -and -not $c.EndsWith([Environment]::NewLine)) { $c += [Environment]::NewLine }; $c += 'NEXT_PUBLIC_DEMO_MODE=true' + [Environment]::NewLine }; Set-Content $p $c -NoNewline"
echo.
echo DabbaLoop demo mode is now ENABLED.
echo Stop npm run dev with Ctrl+C, then run npm run dev again.
echo In demo mode any valid-looking email and password of 6+ characters will work.
echo.
pause
