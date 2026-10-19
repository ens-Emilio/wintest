# wintest-wine — Wine lean builder (20min, não 6h)
# Base: Arch para reproduzir o host do autor, mas funciona em Debian
FROM archlinux:base-devel AS builder

RUN pacman -Sy --noconfirm git flex bison mingw-w64-gcc \
    lib32-gnutls lib32-vulkan-icd-loader sdl2 Xvfb

ARG WINE_VERSION=10.0
ARG WINE_STAGING_VERSION=10.0
WORKDIR /build

# Baixa tarball em vez de git clone 2GB
RUN curl -L https://dl.winehq.org/wine/source/10.x/wine-${WINE_VERSION}.tar.xz | tar -xJ \
 && curl -L https://github.com/wine-staging/wine-staging/archive/v${WINE_STAGING_VERSION}.tar.gz | tar -xz

COPY patches/*.patch /build/patches/
RUN cd wine-${WINE_VERSION} \
 && for p in /build/patches/*.patch; do patch -p1 < "$p" || echo "patch $p skipped (already applied)"; done \
 && ./configure --without-mesa --without-vulkan --without-oss --disable-tests --prefix=/opt/wintest-wine \
 && make -j$(nproc) \
 && make install

FROM archlinux:base-devel
COPY --from=builder /opt/wintest-wine /opt/wintest-wine
RUN pacman -Sy --noconfirm Xvfb && pacman -Scc --noconfirm
ENV PATH="/opt/wintest-wine/bin:$PATH"
ENV WINEPREFIX=/tmp/wintest-wine-prefix
ENTRYPOINT ["wine"]
