#!/bin/sh
# zebra-rs APT installer  --  https://zebra.rs/apt/
#
#   curl -fsSL https://zebra.rs/install.sh | sh
#
# Installs the stable channel by default. For nightly builds:
#   curl -fsSL https://zebra.rs/install.sh | ZEBRA_RS_CHANNEL=nightly sh
#
# Supported: Ubuntu 22.04 (jammy), 24.04 (noble), 26.04 (resolute), amd64/arm64.
# POSIX sh, no gpg required (apt reads the armored key directly). No interactive prompts.
set -eu

REPO_BASE="https://github.com/zebra-rs/zebra-rs.github.io/releases/download"
KEY_URL="https://zebra.rs/apt/zebra-rs-archive-keyring.asc"
KEYRING="/etc/apt/keyrings/zebra-rs.asc"
SOURCES="/etc/apt/sources.list.d/zebra-rs.sources"
SUPPORTED="jammy noble resolute"

if [ -t 1 ]; then
  C_I=$(printf '\033[1;34m'); C_E=$(printf '\033[1;31m'); C_0=$(printf '\033[0m')
else
  C_I=; C_E=; C_0=
fi
info() { printf '%s==>%s %s\n' "$C_I" "$C_0" "$1"; }
die()  { printf '%sError:%s %s\n' "$C_E" "$C_0" "$1" >&2; exit 1; }

fetch() { # fetch URL ($1) to file ($2)
  if command -v curl >/dev/null 2>&1; then curl -fsSL "$1" -o "$2"
  elif command -v wget >/dev/null 2>&1; then wget -qO "$2" "$1"
  else die "need 'curl' or 'wget' to download the archive key"; fi
}

main() {
  # channel -> release-tag prefix
  case "${ZEBRA_RS_CHANNEL:-stable}" in
    stable)  tag=apt ;;
    nightly) tag=nightly ;;
    *) die "ZEBRA_RS_CHANNEL must be 'stable' or 'nightly' (got '${ZEBRA_RS_CHANNEL:-}')" ;;
  esac

  command -v apt-get >/dev/null 2>&1 || die "zebra-rs packages need an apt-based system (Ubuntu/Debian)."
  [ -r /etc/os-release ] || die "/etc/os-release not found; cannot detect your release."
  . /etc/os-release
  codename="${VERSION_CODENAME:-}"
  [ -n "$codename" ] || die "could not detect your Ubuntu codename (VERSION_CODENAME)."

  found=0
  for c in $SUPPORTED; do
    if [ "$c" = "$codename" ]; then found=1; break; fi
  done
  [ "$found" = 1 ] || die "Ubuntu '$codename' is not supported (supported: $SUPPORTED). See https://zebra.rs/apt/"

  if [ "$(id -u)" = 0 ]; then SUDO=; else
    command -v sudo >/dev/null 2>&1 || die "this installer needs root; re-run as root or install sudo."
    SUDO=sudo
  fi

  info "Setting up zebra-rs ${ZEBRA_RS_CHANNEL:-stable} repo for Ubuntu ${codename} (${tag}-${codename})"

  # Archive key: armored is fine, apt (>= 2.4 / jammy) reads it directly -- no gpg needed.
  tmp=$(mktemp)
  trap 'rm -f "$tmp"' EXIT INT TERM
  fetch "$KEY_URL" "$tmp" || die "failed to download the archive key from $KEY_URL"
  head -n 1 "$tmp" | grep -q 'BEGIN PGP PUBLIC KEY' || die "downloaded key is not a PGP public key block."
  $SUDO install -d -m 0755 /etc/apt/keyrings
  $SUDO install -m 0644 "$tmp" "$KEYRING"

  # deb822 source (paste-proof; flat repo => Suites: ./ and no Components).
  printf 'Types: deb\nURIs: %s\nSuites: ./\nSigned-By: %s\n' \
    "$REPO_BASE/${tag}-${codename}" "$KEYRING" | $SUDO tee "$SOURCES" >/dev/null
  $SUDO rm -f /etc/apt/sources.list.d/zebra-rs.list   # drop any legacy one-line entry

  info "Updating package lists"
  $SUDO env DEBIAN_FRONTEND=noninteractive apt-get update < /dev/null

  info "Installing zebra-rs"
  $SUDO env DEBIAN_FRONTEND=noninteractive apt-get install -y zebra-rs < /dev/null

  ver=$(dpkg-query -W -f='${Version}' zebra-rs 2>/dev/null || echo '?')
  info "Installed zebra-rs ${ver}"
  info "Status: systemctl status zebra-rs    Config: /etc/zebra-rs/"

  install_user="${SUDO_USER:-$(id -un)}"
  if [ "$install_user" != root ]; then
    info "Configure mode without a root password:"
    printf '\n  $ sudo usermod -aG zebra-rs %s\n  $ newgrp zebra-rs\n\n' "$install_user"
    printf 'After this you can run vty and enter configure to get into configure mode.\n'
    printf 'You may still need to reboot for the zebra-rs group to apply to every session.\n\n'
  fi
}

main "$@"
