# Instalação — WinTest 1.2.0

## Via Release (sem publicar em registros)

Baixe os artefatos de https://github.com/ens-Emilio/wintest/releases/tag/v1.2.0

### .NET (NuGet local)

```bash
dotnet add package WinTest.Core --source ./dist/nuget -v 1.2.0
dotnet add package WinTest.MSTest --source ./dist/nuget -v 1.2.0
```

### Python (wheel)

```bash
pip install dist/pypi/wintest-1.2.0-py3-none-any.whl
# ou
pip install https://github.com/ens-Emilio/wintest/releases/download/v1.2.0/wintest-1.2.0-py3-none-any.whl
```

### TypeScript (NPM local)

```bash
npm install ./dist/npm/wintest-typescript-1.2.0.tgz
npm install ./dist/npm/wintest-cli-1.2.0.tgz
# ou
npm install https://github.com/ens-Emilio/wintest/releases/download/v1.2.0/wintest-typescript-1.2.0.tgz
```

### CLI

```bash
bun packages/wintest-cli/src/index.ts --help
bun packages/wintest-cli/src/index.ts doctor
```

### Arch Linux (AUR)

```bash
makepkg -p dist/PKGBUILD
sudo pacman -U wintest-bin-1.2.0-1-x86_64.pkg.tar.zst
```

---

## Publicação Pública (requer tokens)

> **Não executado automaticamente** — requer `NUGET_API_KEY`, `PYPI_API_TOKEN`, `NPM_TOKEN`, `AUR_SSH`.

### NuGet

```bash
dotnet nuget push dist/nuget/WinTest.Core.1.2.0.nupkg --source https://api.nuget.org/v3/index.json --api-key $NUGET_API_KEY
dotnet nuget push dist/nuget/WinTest.MSTest.1.2.0.nupkg --source https://api.nuget.org/v3/index.json --api-key $NUGET_API_KEY
```

### PyPI

```bash
pip install twine
twine upload dist/pypi/wintest-1.2.0-py3-none-any.whl  # usa $TWINE_USERNAME=__token__ + $TWINE_PASSWORD=$PYPI_API_TOKEN
```

### NPM

```bash
npm login  # ou export NPM_TOKEN
npm publish dist/npm/wintest-typescript-1.2.0.tgz --access public
npm publish dist/npm/wintest-cli-1.2.0.tgz --access public
```

### AUR

```bash
git clone ssh://aur@aur.archlinux.org/wintest-bin.git /tmp/aur-wintest
cp dist/PKGBUILD /tmp/aur-wintest/
cd /tmp/aur-wintest && makepkg --printsrcinfo > .SRCINFO && git add PKGBUILD .SRCINFO && git commit -m "1.2.0" && git push
```

### GitHub Release já criado

Artefatos anexados em https://github.com/ens-Emilio/wintest/releases/tag/v1.2.0 — `dotnet add package` e `pip install` direto do release funcionam sem registro.
