#!/bin/bash
# Script cron pour backup - fréquence selon BACKUP_ENV
# prod: quotidien (0 2 * * *) | dev/staging: hebdo (0 2 * * 0)
# Usage: mettre dans crontab -e

set -e
cd /root/repertoire

# Charger .env si présent
[ -f .env ] && export $(grep -v '^#' .env | xargs)

# Backup Borg (chiffré, DigitalOcean Spaces)
docker compose -f docker-compose.prod.yml -f docker-compose.backup-borg.yml run --rm --build backup-borg 2>&1 | logger -t repertoire-backup
