#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE="$ROOT/archives/legacy-launcher-source.tar.gz"
[ -f "$ARCHIVE" ] || { echo "Arquivo de migracao ausente: $ARCHIVE"; exit 2; }
[ ! -e "$ROOT/apps/projector-launcher" ] || { echo "apps/projector-launcher ja existe. Nao sobrescrevendo."; exit 3; }
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
tar -xzf "$ARCHIVE" -C "$TEMP" --no-same-owner
[ -d "$TEMP/experiments/hy300por-launcher" ] || { echo "Snapshot invalido."; exit 4; }
mkdir -p "$ROOT/apps" "$ROOT/tools"
cp -a "$TEMP/experiments/hy300por-launcher" "$ROOT/apps/projector-launcher"
if [ -d "$TEMP/packages/skills/projector-hy300por" ]; then
 cp -a "$TEMP/packages/skills/projector-hy300por" "$ROOT/tools/legacy-hy300por"
fi
echo "Codigo-fonte materializado em apps/projector-launcher/"
echo "O codigo pertence ao CreativeScreen OS e deve ser adaptado para integrações nativas, nao use a Linkou como dependencia."
