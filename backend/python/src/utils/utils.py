# backend/python/src/utils/utils.py
import json

def serialize_result(data):
    return json.dumps(data, indent=2, ensure_ascii=False)