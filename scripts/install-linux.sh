#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
APP_SOURCE_DIR="$SCRIPT_DIR/app"
ICON_SOURCE="$SCRIPT_DIR/icon.png"
INSTALL_ROOT="${HOME}/.local/opt/pos-tio-ale"
DESKTOP_DIR="${HOME}/.local/share/applications"
DESKTOP_FILE="${DESKTOP_DIR}/pos-tio-ale.desktop"
DESKTOP_SHORTCUT_TARGET=""

if [[ ! -x "${APP_SOURCE_DIR}/pos-vue" ]]; then
  echo "No se encontro el ejecutable en: ${APP_SOURCE_DIR}/pos-vue"
  exit 1
fi

mkdir -p "${INSTALL_ROOT}" "${DESKTOP_DIR}"
rm -rf "${INSTALL_ROOT}/app"
mkdir -p "${INSTALL_ROOT}/app"
cp -a "${APP_SOURCE_DIR}/." "${INSTALL_ROOT}/app/"

if [[ -f "${ICON_SOURCE}" ]]; then
  cp -f "${ICON_SOURCE}" "${INSTALL_ROOT}/icon.png"
fi

cat > "${DESKTOP_FILE}" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=POS Tio Ale
Comment=Abre el POS de escritorio o navegador
Exec=${INSTALL_ROOT}/app/pos-vue
Path=${INSTALL_ROOT}/app
Terminal=false
StartupNotify=true
Categories=Office;
Icon=${INSTALL_ROOT}/icon.png
EOF

chmod +x "${DESKTOP_FILE}"

if [[ -d "${HOME}/Desktop" ]]; then
  DESKTOP_SHORTCUT_TARGET="${HOME}/Desktop/POS Tio Ale.desktop"
elif [[ -d "${HOME}/Escritorio" ]]; then
  DESKTOP_SHORTCUT_TARGET="${HOME}/Escritorio/POS Tio Ale.desktop"
fi

if [[ -n "${DESKTOP_SHORTCUT_TARGET}" ]]; then
  cp -f "${DESKTOP_FILE}" "${DESKTOP_SHORTCUT_TARGET}"
  chmod +x "${DESKTOP_SHORTCUT_TARGET}"
fi

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "${DESKTOP_DIR}" >/dev/null 2>&1 || true
fi

echo "Instalacion completada."
echo "Aplicacion instalada en: ${INSTALL_ROOT}/app"
echo "Acceso de menu: ${DESKTOP_FILE}"
if [[ -n "${DESKTOP_SHORTCUT_TARGET}" ]]; then
  echo "Acceso de escritorio: ${DESKTOP_SHORTCUT_TARGET}"
fi
