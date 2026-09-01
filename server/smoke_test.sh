#!/usr/bin/env bash
# Simple smoke test for the API. Requires: curl, jq
# Usage: chmod +x smoke_test.sh && ./smoke_test.sh

API=${API:-http://localhost:5000/api}
set -e

echo "Registering client..."
CLIENT_RES=$(curl -s -X POST "$API/auth/register" -H 'Content-Type: application/json' -d '{"name":"Client A","email":"client@example.com","password":"password","role":"client"}')
echo "$CLIENT_RES" | jq .

echo "Registering freelancer..."
FREELANCER_RES=$(curl -s -X POST "$API/auth/register" -H 'Content-Type: application/json' -d '{"name":"Freelancer B","email":"freelancer@example.com","password":"password","role":"freelancer"}')
echo "$FREELANCER_RES" | jq .

CLIENT_TOKEN=$(echo "$CLIENT_RES" | jq -r '.token')
FREELANCER_TOKEN=$(echo "$FREELANCER_RES" | jq -r '.token')

if [ "$CLIENT_TOKEN" = "null" ] || [ -z "$CLIENT_TOKEN" ]; then
  echo "Client token missing; aborting"
  exit 1
fi
if [ "$FREELANCER_TOKEN" = "null" ] || [ -z "$FREELANCER_TOKEN" ]; then
  echo "Freelancer token missing; aborting"
  exit 1
fi

echo "Client posting a job..."
JOB_RES=$(curl -s -X POST "$API/jobs" -H "Authorization: Bearer $CLIENT_TOKEN" -H 'Content-Type: application/json' -d '{"title":"Test Job","description":"Do something cool","budget":100}')
echo "$JOB_RES" | jq .
JOB_ID=$(echo "$JOB_RES" | jq -r '._id')

echo "Listing jobs..."
curl -s "$API/jobs" | jq .

echo "Freelancer placing a bid..."
BID_RES=$(curl -s -X POST "$API/bids" -H "Authorization: Bearer $FREELANCER_TOKEN" -H 'Content-Type: application/json' -d '{"jobId":"'$JOB_ID'","amount":90,"coverLetter":"I can do this"}')
echo "$BID_RES" | jq .

echo "Get job details..."
curl -s "$API/jobs/$JOB_ID" | jq .

echo "Client accepting bid (if any)..."
BID_ID=$(echo "$BID_RES" | jq -r '._id')
if [ "$BID_ID" != "null" ] && [ -n "$BID_ID" ]; then
  ACCEPT_RES=$(curl -s -X POST "$API/bids/$BID_ID/accept" -H "Authorization: Bearer $CLIENT_TOKEN")
  echo "$ACCEPT_RES" | jq .
else
  echo "No bid id returned; skipping accept"
fi

echo "Smoke test complete."
