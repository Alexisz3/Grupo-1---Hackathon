FROM python:3.12-slim
RUN pip install --no-cache-dir torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu \
 && pip install --no-cache-dir diffusers==0.32.2 transformers==4.48.0 accelerate==1.3.0 pillow==11.1.0
WORKDIR /app
COPY server.py .
ENV HF_HOME=/models PYTHONUNBUFFERED=1
EXPOSE 7860
CMD ["python", "server.py"]
