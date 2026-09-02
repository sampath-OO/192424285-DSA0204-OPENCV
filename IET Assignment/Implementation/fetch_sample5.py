"""
Generate a complex real-world traffic scene with cars, bus, pedestrians, lane markings.
"""
import urllib.request
import os

dest = "static/samples/sample5_multiclass_traffic.jpg"
# Download a rich street scene from open test data
url = "https://raw.githubusercontent.com/ultralytics/yolov5/master/data/images/bus.jpg"
try:
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as r, open(dest, 'wb') as f:
        f.write(r.read())
    print("Saved sample5_multiclass_traffic.jpg")
except Exception as e:
    print(f"Notice: {e}")
