FROM python:3.12
WORKDIR /agents
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["uvicorn", "agents.__main__:app", "--host", "0.0.0.0", "--port", "8080"]