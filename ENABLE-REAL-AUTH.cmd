@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='.env.local'; if (!(Test-Path $p)) { New-Item $p -ItemType File | Out-Null }; $c=Get-Content $p -Raw; if ($c -match '(?m)^NEXT_PUBLIC_DEMO_MODE=') { $c=[regex]::Replace($c,'(?m)^NEXT_PUBLIC_DEMO_MODE=.*$','NEXT_PUBLIC_DEMO_MODE=false') } else { if ($c.Length -gt 0 -and -not $c.EndsWith([Environment]::NewLine)) { $c += [Environment]::NewLine }; $c += 'NEXT_PUBLIC_DEMO_MODE=false' + [Environment]::NewLine }; Set-Content $p $c -NoNewline"
echo.
echo DabbaLoop real Supabase authentication is now ENABLED.
echo Restart npm run dev for the change to take effect.
echo.
pause
