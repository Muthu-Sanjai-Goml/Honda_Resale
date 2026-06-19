from dotenv import load_dotenv
import os
import json
import boto3

load_dotenv()

client = boto3.client(
    "bedrock-runtime",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

response = client.invoke_model(
    modelId="anthropic.claude-sonnet-4-6",
    body=json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [{"text": "Hello, Bedrock!"}]
            }
        ]
    })
)

print("✅ Model invocation successful")
print(response)