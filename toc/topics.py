"""The table of contents: every topic, grouped into chapters, in a fixed order.

All the content lives in toc/topics.json (titles, 3 levels of explanation,
example, source links). Edit that file to add or change topics.

AWS S3 (optional): if the environment variable TOC_S3_BUCKET is set, topics.json
is read from s3://<TOC_S3_BUCKET>/<TOC_S3_PREFIX>/topics.json instead, so the
team can update topics by uploading a new file. If S3 is not set up or fails,
the local file is used, so the page always works.

Sorting topics per user comes later (see personalize.py).
"""

import json
import os
from pathlib import Path

TOPICS_FILE = Path(__file__).parent / "topics.json"
LEVELS = ["novice", "intermediate", "expert"]
DISCLAIMER = (
    "Educational content only. This is not personalized financial advice. "
    "Talk to a licensed advisor before making investment decisions."
)


def s3_location():
    """'s3://bucket/prefix/topics.json', or None when S3 is not set up."""
    bucket = os.environ.get("TOC_S3_BUCKET")
    if not bucket:
        return None
    key = "/".join(p for p in [os.environ.get("TOC_S3_PREFIX", "").strip("/"), "topics.json"] if p)
    return f"s3://{bucket}/{key}"


def _read_from_s3():
    location = s3_location()
    if not location:
        return None
    bucket, key = location[len("s3://"):].split("/", 1)
    try:
        import boto3  # only needed when S3 is used

        body = boto3.client("s3").get_object(Bucket=bucket, Key=key)["Body"].read()
        return json.loads(body)
    except Exception as err:  # no keys, no internet, bad file...: fall back to local
        print(f"[toc] could not read {location}, using local topics.json: {err}")
        return None


def load_topics():
    """Return the parsed topics.json (from S3 if set up, otherwise local)."""
    data = _read_from_s3()
    if data is None:
        with open(TOPICS_FILE, encoding="utf-8") as f:
            data = json.load(f)
    return data


def build_contents(level="novice", data=None):
    """The whole table of contents as a plain dict (easy to send as JSON).

    {"level", "disclaimer", "topic_count",
     "chapters": [{"id", "number", "title",
                   "topics": [{"id", "number": "1.1", "title", "summary",
                               "levels": {novice, intermediate, expert},
                               "example", "sources": [{"title", "url"}],
                               "lessons": [lesson ids with a full lesson page]}]}]}
    """
    level = level if level in LEVELS else "novice"
    data = data or load_topics()

    chapters = []
    for n, cat in enumerate(data["categories"], start=1):
        topics = [c for c in data["concepts"] if c["category"] == cat["id"]]
        if not topics:
            continue
        chapters.append({
            "id": cat["id"],
            "number": n,
            "title": cat["title"].split(". ", 1)[-1],
            "topics": [
                {
                    "id": c["id"],
                    "number": f"{n}.{i}",
                    "title": c["title"],
                    "summary": c["summary"],
                    "levels": c["levels"],
                    "example": c.get("example", ""),
                    "sources": c.get("sources", []),
                    "lessons": c.get("lessons", []),
                }
                for i, c in enumerate(topics, start=1)
            ],
        })

    return {
        "level": level,
        "disclaimer": DISCLAIMER,
        "chapters": chapters,
        "topic_count": sum(len(ch["topics"]) for ch in chapters),
    }
