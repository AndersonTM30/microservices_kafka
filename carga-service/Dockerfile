FROM python:3.9

WORKDIR /app

COPY main.py .

RUN pip install fastapi uvicorn cassandra-driver kafka-python

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]