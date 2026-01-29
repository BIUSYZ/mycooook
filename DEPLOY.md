# 部署指南 (Linux 服务器)

本项目已完全容器化，支持使用 Docker 和 Docker Compose 进行一键部署。

## 前置要求

确保您的 Linux 服务器已安装：
*   **Docker**: [安装文档](https://docs.docker.com/engine/install/)
*   **Docker Compose**: [安装文档](https://docs.docker.com/compose/install/)

## 部署步骤

### 1. 上传代码

将整个项目代码上传到您的服务器。您可以使用 `git` 或 `scp`。

如果使用 Git（推荐）：
```bash
git clone <your-repo-url> my-recipe-app
cd my-recipe-app
```

或者直接上传文件，确保包含以下核心文件：
*   `Dockerfile`
*   `docker-compose.yml`
*   `package.json`, `package-lock.json`
*   `tsconfig.json`
*   `vite.config.ts`
*   `server/` 目录
*   `src/` 目录
*   `public/` 目录
*   `prisma/` 目录

### 2. 启动服务

在项目根目录下运行：

```bash
docker-compose up -d --build
```

此命令会自动：
1.  构建前端 React 应用。
2.  构建后端 Node.js 服务。
3.  启动容器并在后台运行。

### 3. 验证部署

服务默认运行在 **3000** 端口。

*   **访问应用**: `http://<您的服务器IP>:3000`
*   **查看日志**: `docker-compose logs -f`

## 数据持久化

为了防止重启容器丢失数据，我们在 `docker-compose.yml` 中配置了数据卷挂载：

*   **数据库**: `prisma/dev.db` (SQLite 数据库文件)
*   **上传的图片**: `server/uploads`

这些文件会保存在您服务器上的项目目录中。请定期备份这两个路径的数据。

## 常用运维命令

*   **停止服务**:
    ```bash
    docker-compose down
    ```

*   **更新应用** (代码变更后):
    ```bash
    git pull  # 拉取最新代码
    docker-compose up -d --build  # 重新构建并重启
    ```

*   **重启服务**:
    ```bash
    docker-compose restart
    ```

## 配置 Nginx 反向代理 (可选)

如果您希望通过域名访问（例如 `http://recipes.example.com`）而不是 `IP:3000`，建议配置 Nginx。

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name recipes.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
