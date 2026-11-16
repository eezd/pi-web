# 自有版本发布

本仓库基于 [agegr/pi-web](https://github.com/agegr/pi-web)，只发布：

- npm：`@eezd/pi-web`
- GitHub Releases：`eezd/pi-web`，附带与 npm 相同的安装包

版本固定为 `<上游版本>-custom.N`，标签为 `v<上游版本>-custom.N`。例如 `0.17.0-custom.1`、`0.17.0-custom.2`；同步上游 `0.18.0` 后从 `0.18.0-custom.1` 开始。上游基础版本必须来自实际同步的代码，不随自有修改递增。

## 首次配置 npm

GitHub 用户名与 npm 用户名互不关联。发布 `@eezd/pi-web` 需要当前 npm 账号拥有 `eezd` 用户或组织作用域的发布权限；若实际作用域不同，先统一修改包配置、更新检查、文档及工作流中的包名。

首次发布前，在 npm 创建有该作用域写入权限的 granular access token，按 npm 当前策略配置用于 CI 的 2FA bypass。在 GitHub 仓库 **Settings → Secrets and variables → Actions** 添加 `NPM_TOKEN`。不要把 token 写进仓库或对话。

也可以从已登录且有权限的本机设置密钥：

```bash
gh secret set NPM_TOKEN --repo eezd/pi-web
```

此命令通过交互输入读取 token，不要把 token 放进命令参数。

包首次发布成功后，在 npm 包 **Settings → Trusted publishing → GitHub Actions** 配置：

- Organization or user：`eezd`
- Repository：`pi-web`
- Workflow filename：`publish.yml`
- Environment：留空

然后删除 GitHub 的 `NPM_TOKEN`，后续使用 OIDC 发布。工作流保留 `id-token: write`，使用 Node 24 所带的 npm。npm Trusted Publishing 无法用于创建尚不存在的包，因此首次发布需要另行授权。

## 发布流程与并发

`.github/workflows/publish.yml` 只接受 `v*-custom.*` 标签，并严格校验版本、包名及 lockfile。普通分支 push、PR 和上游标签不会启动发布 runner。

整个流程只有一个 job、一个 GitHub 托管 runner，顺序执行：版本和权限预检 → 安装依赖 → lint → TypeScript → 单元测试 → 浏览器依赖 → 构建 → E2E → 打包 → npm → GitHub Release。

固定的 workflow concurrency group `custom-release` 使不同版本也共用发布锁，`cancel-in-progress: false` 保留正在进行的发布。不要连续推送多个发布标签：GitHub 默认最多保留一个等待中的运行，更新的等待任务可能替换旧的等待任务。

上游的 `ci.yml` 与 `demo-pages.yml` 保留，但其 job 只在 `agegr/pi-web` 执行，在此 fork 不申请 runner。此 fork 不构建 Docker、不发布 GHCR、不部署 Pages，也不调用 GitHub Copilot / coding agent。并发限制是本项目的执行策略，并不代表 GitHub 规定普通 Actions 只能并发一次。

## 准备版本

先完成本地检查，确认发布提交包含预期修改：

```bash
npm ci
npm run lint
node_modules/.bin/tsc --noEmit
npm test
git status --short --branch
```

不要在日常开发目录运行生产构建，以免污染 `.next`。构建和 E2E 由发布 runner 的全新 checkout 完成。

第一次已经在 `package.json` 和 `package-lock.json` 准备好 `0.17.0-custom.1`。提交发布配置和代码后，为该提交创建标签：

```bash
git tag -a v0.17.0-custom.1 -m "Release v0.17.0-custom.1"
git push origin main v0.17.0-custom.1
```

之后在干净的 checkout 上，保持上游基础版本、递增自有修订号：

```bash
npm run release
# 例如 0.17.0-custom.1 → 0.17.0-custom.2
```

实际同步上游新版本后，指定基础版本：

```bash
npm run release -- 0.18.0
# → 0.18.0-custom.1
```

该命令同时更新 package/lockfile、创建 `Release v<version>` 提交和 annotated tag，不会 push。发布前确认目标版本未占用：

```bash
npm view @eezd/pi-web@<version> version --registry https://registry.npmjs.org/
git ls-remote --tags origin refs/tags/v<version>
git show --stat HEAD
```

npm 预期返回 E404，远端标签预期为空。仅推送本次标签：

```bash
git push origin main v<version>
```

不要用 `git push --tags`。版本包含 SemVer prerelease 后缀，工作流显式指定 `--tag latest`，让 `npx @eezd/pi-web@latest` 和自动更新都指向正式分发的自有版本。GitHub Release 也标为 latest。

## 观察与验收

```bash
gh run list --repo eezd/pi-web --workflow publish.yml --limit 5
gh run view <run-id> --repo eezd/pi-web
gh release view v<version> --repo eezd/pi-web
npm view @eezd/pi-web@<version> version --registry https://registry.npmjs.org/
npm view @eezd/pi-web dist-tags --registry https://registry.npmjs.org/
```

确认单个 release job 成功、GitHub Release 包含 `.tgz` 附件、npm 的精确版本存在且 `latest` 指向该版本。安装命令：

```bash
npm install -g @eezd/pi-web@latest
pi-web version
```

## 失败恢复

- npm 发布前失败：修复配置或授权后重试；代码修复优先使用下一个 `custom.N`，避免移动公开标签。
- npm 成功、GitHub Release 失败：重跑原 workflow。预检仅在 npm 版本的 `gitHead` 与当前标签提交一致时跳过 npm 发布，从 npm 下载已发布的原始 tarball，再补齐 Release，避免重新构建产生不同附件。
- 已发布版本属于其他提交：工作流拒绝复用版本号，必须递增 `custom.N`。
- npm 注册表可能短暂延迟；核实发布日志与精确版本后再决定是否重试，不要因 `latest` 暂未更新就重复发布。

npm 版本发布后不能覆盖。不要移动已发布版本的标签，不要取消正在进行的 npm 发布。
