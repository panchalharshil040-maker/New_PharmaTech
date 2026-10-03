import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_qr_decode_valid_token():
    # First generate a valid token via /api/qr
    gen_resp = client.post("/api/qr", json={
        "medicines": ["warfarin sodium", "clopidogrel"],
        "allergies": ["penicillin", "aspirin"]
    })
    assert gen_resp.status_code == 200
    token = gen_resp.json()["token"]

    # Decode via /api/qr/decode
    decode_resp = client.post("/api/qr/decode", json={"token": token})
    assert decode_resp.status_code == 200
    data = decode_resp.json()
    assert "medicines" in data
    assert "allergies" in data
    assert data["medicines"] == ["warfarin sodium", "clopidogrel"]
    assert data["allergies"] == ["penicillin", "aspirin"]

def test_qr_decode_invalid_token():
    # Tampered token
    decode_resp = client.post("/api/qr/decode", json={"token": "invalid.signature"})
    assert decode_resp.status_code == 400

def test_doctor_summary():
    payload = {
        "medicines": ["warfarin sodium", "clopidogrel"],
        "patient": {
            "ageGroup": "elderly",
            "isPregnant": False,
            "hasRenalImpairment": False,
            "hasLiverDisease": False,
            "hasCardiacHistory": True,
            "allergies": ["aspirin"]
        },
        "simulation": {
            "added": ["atorvastatin"],
            "removed": ["clopidogrel"],
            "before_score": 80,
            "after_score": 40,
            "delta": -40
        }
    }
    resp = client.post("/api/doctor/summary", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data
    assert "risk_score" in data
    assert "risk_level" in data
    assert "findings_count" in data
    assert "CLINICAL SAFETY SUMMARY" in data["summary"]
    assert "What-If Simulation Context" in data["summary"]
    assert "atorvastatin" in data["summary"]
