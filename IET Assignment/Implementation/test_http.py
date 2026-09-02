"""
Verify Flask web endpoints: GET /, POST /analyze with sample image, and static file delivery.
"""
import urllib.request
import urllib.parse
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("Testing GET /...")
res_home = urllib.request.urlopen("http://127.0.0.1:5000/")
assert res_home.getcode() == 200
html_content = res_home.read().decode('utf-8')
assert "AI Road Safety Analyzer" in html_content
print("✓ GET / passed (Status 200, contains title)")

print("\nTesting POST /analyze with sample1_urban_traffic.jpg...")
post_data = urllib.parse.urlencode({'sample_name': 'sample1_urban_traffic.jpg'}).encode('utf-8')
req = urllib.request.Request("http://127.0.0.1:5000/analyze", data=post_data)
res_analyze = urllib.request.urlopen(req)
assert res_analyze.getcode() == 200
result = json.loads(res_analyze.read().decode('utf-8'))
assert result['success'] is True
print("✓ POST /analyze passed (Status 200, success = True)")
print("  - Original image URL:", result['original_image_url'])
print("  - Analyzed image URL:", result['analyzed_image_url'])
print("  - Safety Level:", result['safety_assessment']['level'])
print("  - Vehicles:", result['statistics']['vehicles'])
print("  - Pedestrians:", result['statistics']['pedestrians'])
print("  - Road Signs:", result['statistics']['road_signs'])
print("  - Road Markings:", result['statistics']['road_markings'])
print("  - Processing Time:", result['performance']['processing_time_seconds'], "s")

print("\nTesting Output image retrieval...")
res_img = urllib.request.urlopen(f"http://127.0.0.1:5000{result['analyzed_image_url']}")
assert res_img.getcode() == 200
print(f"✓ Output image retrieved successfully ({len(res_img.read())} bytes)")

print("\n" + "="*60)
print(" ALL HTTP ENDPOINT & SERVER TESTS PASSED PERFECTLY!")
print("="*60)
