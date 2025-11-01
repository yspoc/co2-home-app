# Dockerfile

# 1. ベースイメージ: Python 3.11 または 3.12 の軽量版 (alpineは非常に軽量だが、デバッグや互換性を考慮し slim-bullseye を使用)
FROM python:3.11-slim-bullseye

# 2. 環境変数の設定
# Pythonが出力バッファリングを行わないようにし、ログをリアルタイムでコンテナの標準出力に出力させる
ENV PYTHONUNBUFFERED=1

# 3. 作業ディレクトリの設定
WORKDIR /app

# 4. 依存関係のインストール
# requirements.txtを先にコピーすることで、依存関係の変更がない場合のキャッシュを効率的に利用できる (Docker Layer Caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. アプリケーションコードのコピー
# すべてのアプリケーションファイルをコンテナ内にコピー
COPY app/ app/
# .dockerignoreを作成していない場合、明示的にテストをコピーしないようにする
# COPY . . # (このコマンドを避けるため、今回は app/ のみをコピー)

# 6. アプリケーションの実行コマンド (Cloud Run向け)
# Gunicornを使ってUvicorn Workerを起動するのが一般的な本番環境の設定です。
# -w N: Workerプロセスの数 (通常は CPUコア数 * 2 + 1 または 2~4)
# -b 0.0.0.0:8080: 外部からのアクセスを受け付けるホストとポート
# app.main:app: 実行するASGIアプリケーション (app/main.py内の appインスタンス)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4"]

# 6. アプリケーションの実行コマンド (Gunicorn + Uvicorn Worker 構成)
# Gunicornを起動し、Uvicornワーカーで app/main.py の 'app' オブジェクトを実行します。
# Gunicornは、Cloud Runが自動設定する環境変数 $PORT をリッスンします。
# Herokuなどでは--workers 4 の固定値ではなく、環境変数 $WEB_CONCURRENCY を使用でき、
# Google Cloud Runでは以下のようにワーカー数を計算して設定することが可能です。
# CPUコア数から最適なワーカー数を計算し、Gunicornを起動する
# (例: CPUコア数 * 2 + 1, またはシンプルな CPUコア数 * 2)
CMD ["sh", "-c", "GUNICORN_WORKERS=$(python3 -c 'import os; print(os.cpu_count() * 2 + 1)') && gunicorn --bind 0.0.0.0:$PORT --workers $GUNICORN_WORKERS app.main:app --worker-class uvicorn.workers.UvicornWorker"]