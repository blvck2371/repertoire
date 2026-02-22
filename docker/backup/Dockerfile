# Image backup MongoDB → Restic → MinIO (Phase 9)
FROM mongo:7
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget bzip2 ca-certificates \
    && wget -q https://github.com/restic/restic/releases/download/v0.16.2/restic_0.16.2_linux_amd64.bz2 \
    && bunzip2 restic_0.16.2_linux_amd64.bz2 \
    && mv restic_0.16.2_linux_amd64 /usr/local/bin/restic \
    && chmod +x /usr/local/bin/restic \
    && apt-get purge -y wget bzip2 \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
COPY backup.sh /backup.sh
COPY restore.sh /restore.sh
RUN chmod +x /backup.sh /restore.sh
ENTRYPOINT ["/backup.sh"]
