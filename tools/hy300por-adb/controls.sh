#!/usr/bin/env bash
# Linkou > Samsung/Termux > ADB via Wi-Fi > HY300por
# Nenhum agente é instalado no projetor. Android 11 ARMv7.
set -euo pipefail
DEVICE="${HY300_ADB_TARGET:-192.168.77.4:5555}"
ADB="${ADB_BIN:-$(command -v adb || true)}"
[ -n "$ADB" ] || { echo "ERRO: adb nao encontrado"; exit 1; }
help_text() {
  cat <<'EOF'
Motion Laucher HY300por — comandos:
  status                      Testar conexão, sistema e launcher
  memory                      RAM física, ZRAM e processos
  apps                        Listar aplicativos de terceiros
  home|back|up|down|left|right|ok
  volume-up|volume-down|mute|play-pause
  launch <package>            Abrir aplicativo por pacote
  open-settings               Abrir configurações Android
  screenshot                  Salvar captura de tela no celular
  inventory                   Snapshot local dos aplicativos e HOME
  disable-telemetry --apply   Desativar só com.htc.eventuploadservice
  restore-telemetry           Restaurar o serviço de eventos do fabricante
  home-linkou                 Definir Linkou Home como HOME se instalado
  home-original               Restaurar launcher original
EOF
}
case "${1:-help}" in
 help|--help) help_text; exit 0;;
esac
"$ADB" connect "$DEVICE" >/dev/null 2>&1 || true
"$ADB" -s "$DEVICE" get-state 2>/dev/null | grep -qx 'device' || {
  echo "Projetor offline ou nao autorizado. Confirme depuracao e Wi-Fi: $DEVICE"; exit 2;
}
S=("$ADB" -s "$DEVICE")
case "$1" in
 status)
   echo "== HY300por $DEVICE =="
   "${S[@]}" shell 'getprop ro.product.model; getprop ro.build.version.release; getprop ro.product.cpu.abi'
   "${S[@]}" shell 'cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.HOME | tail -n 2'
   "${S[@]}" shell 'cat /proc/meminfo | grep -E "^(MemTotal|MemAvailable|SwapTotal|SwapFree):"'
   ;;
 memory)
   "${S[@]}" shell 'cat /proc/meminfo | grep -E "^(MemTotal|MemFree|MemAvailable|Cached|SwapTotal|SwapFree):"; cat /proc/swaps; dumpsys meminfo | head -n 23'
   ;;
 apps) "${S[@]}" shell pm list packages -3;;
 home|back|up|down|left|right|ok|volume-up|volume-down|mute|play-pause)
   case "$1" in
     home) key=3;; back) key=4;; up) key=19;; down) key=20;;
     left) key=21;; right) key=22;; ok) key=23;;
     volume-up) key=24;; volume-down) key=25;; mute) key=164;;
     play-pause) key=85;;
   esac
   "${S[@]}" shell input keyevent "$key"
   echo "Controle enviado: $1"
   ;;
 launch)
   pkg="${2:-}"
   [[ "$pkg" =~ ^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$ ]] || { echo "Pacote invalido"; exit 2; }
   "${S[@]}" shell monkey -p "$pkg" -c android.intent.category.LAUNCHER 1
   ;;
 open-settings) "${S[@]}" shell am start -a android.settings.SETTINGS;;
 screenshot)
   dir="$HOME/hy300por-screenshots"; mkdir -p "$dir"
   out="$dir/$(date +%Y%m%d_%H%M%S).png"
   "${S[@]}" exec-out screencap -p > "$out"
   echo "Captura: $out"
   ;;
 inventory)
   dir="$HOME/hy300por-inventory/$(date +%Y%m%d_%H%M%S)"
   mkdir -p "$dir"
   "${S[@]}" shell pm list packages -f > "$dir/packages.txt"
   "${S[@]}" shell pm list packages -d > "$dir/disabled.txt"
   "${S[@]}" shell 'cmd package query-activities --brief -a android.intent.action.MAIN -c android.intent.category.HOME' > "$dir/home.txt"
   "${S[@]}" shell 'cat /proc/meminfo; cat /proc/swaps' > "$dir/memory.txt"
   (cd "$dir" && sha256sum *.txt > SHA256SUMS)
   echo "Snapshot registrado em: $dir"
   ;;
 disable-telemetry)
   if [ "${2:-}" != "--apply" ]; then echo "SIMULACAO: pm disable-user --user 0 com.htc.eventuploadservice; confirme com --apply"; exit 0; fi
   "${S[@]}" shell pm disable-user --user 0 com.htc.eventuploadservice
   ;;
 restore-telemetry) "${S[@]}" shell pm enable --user 0 com.htc.eventuploadservice;;
 home-linkou)
   "${S[@]}" shell pm path pro.creativezone.hy300launcher | grep -q 'package:' || { echo "Launcher Linkou ainda nao instalado"; exit 3; }
   "${S[@]}" shell cmd package set-home-activity pro.creativezone.hy300launcher/com.tvlauncher.MainActivity
   ;;
 home-original)
   "${S[@]}" shell cmd package set-home-activity com.htc.htclauncherhighenglishd08/com.htc.activity.HomeActivity
   ;;
 *) echo "Comando desconhecido: $1"; help_text; exit 2;;
esac
