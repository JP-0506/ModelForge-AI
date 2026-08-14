FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p media/datasets
RUN mkdir -p media/models
RUN mkdir -p media/reports
RUN mkdir -p media/temp

EXPOSE 10000

CMD ["gunicorn", "config.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:10000"]