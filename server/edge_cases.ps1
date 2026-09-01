param($Api = 'http://localhost:5000/api')
$ErrorActionPreference = 'Stop'

Write-Host "`n=== EDGE CASE TESTS ==="

# Re-login with the previously registered client (will re-register since memory db)
Write-Host "1. Register + login (duplicate email should be 409)..."
$r1 = Invoke-RestMethod -Uri "$Api/auth/register" -Method Post -ContentType 'application/json' -Body (@{name='Edge C'; email='edge@example.com'; password='password123'; role='client'}|ConvertTo-Json)
Write-Host "   first register OK, token present:" ($r1.token -ne $null)
try {
  $r2 = Invoke-RestMethod -Uri "$Api/auth/register" -Method Post -ContentType 'application/json' -Body (@{name='Edge C2'; email='edge@example.com'; password='password123'; role='client'}|ConvertTo-Json)
  Write-Host "   ERROR: duplicate register should have failed!"
} catch {
  $status = $_.Exception.Response.StatusCode.value__
  Write-Host "   duplicate register correctly rejected with HTTP $status"
}

Write-Host "2. Login with correct credentials..."
$login = Invoke-RestMethod -Uri "$Api/auth/login" -Method Post -ContentType 'application/json' -Body (@{email='edge@example.com'; password='password123'}|ConvertTo-Json)
Write-Host "   login OK, token present:" ($login.token -ne $null)

Write-Host "3. Login with wrong password (should be 401)..."
try {
  Invoke-RestMethod -Uri "$Api/auth/login" -Method Post -ContentType 'application/json' -Body (@{email='edge@example.com'; password='wrongpassword'}|ConvertTo-Json)
  Write-Host "   ERROR: wrong password accepted!"
} catch {
  Write-Host "   wrong password correctly rejected with HTTP $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "4. Freelancer tries to post a job (should be 403)..."
$reg2 = Invoke-RestMethod -Uri "$Api/auth/register" -Method Post -ContentType 'application/json' -Body (@{name='Free E'; email='freee@example.com'; password='password123'; role='freelancer'}|ConvertTo-Json)
$tok = $reg2.token
try {
  Invoke-RestMethod -Uri "$Api/jobs" -Method Post -Headers @{Authorization="Bearer $tok"} -ContentType 'application/json' -Body (@{title='Hack'; description='x'; budget=10}|ConvertTo-Json)
  Write-Host "   ERROR: freelancer posted a job!"
} catch {
  Write-Host "   freelancer blocked from posting with HTTP $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "5. Unauthenticated request to protected route (should be 401)..."
try {
  Invoke-RestMethod -Uri "$Api/jobs" -Method Post -ContentType 'application/json' -Body (@{title='No Auth'; description='x'; budget=10}|ConvertTo-Json)
  Write-Host "   ERROR: unauthenticated job created!"
} catch {
  Write-Host "   unauthenticated request blocked with HTTP $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "6. Freelancer can view own contract (happy path)..."
$clientTok = $login.token
$job = Invoke-RestMethod -Uri "$Api/jobs" -Method Post -Headers @{Authorization="Bearer $clientTok"} -ContentType 'application/json' -Body (@{title='ContractTest'; description='x'; budget=50}|ConvertTo-Json)
$bid = Invoke-RestMethod -Uri "$Api/bids" -Method Post -Headers @{Authorization="Bearer $tok"} -ContentType 'application/json' -Body (@{jobId=$job._id; amount=40}|ConvertTo-Json)
$acc = Invoke-RestMethod -Uri "$Api/bids/$($bid._id)/accept" -Method Post -Headers @{Authorization="Bearer $clientTok"} -ContentType 'application/json'
$cid = $acc.contract._id
try {
  $ownC = Invoke-RestMethod -Uri "$Api/contracts/$cid" -Headers @{Authorization="Bearer $tok"} -ContentType 'application/json'
  Write-Host "   freelancer can view own contract: OK"
} catch {
  Write-Host "   ERROR: freelancer could not view own contract"
}

Write-Host "7. Invalid job id (should be 422)..."
try {
  Invoke-RestMethod -Uri "$Api/jobs/not-a-valid-id" -ContentType 'application/json'
  Write-Host "   ERROR: invalid id accepted!"
} catch {
  Write-Host "   invalid id rejected with HTTP $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "8. Complete + approve contract flow..."
Invoke-RestMethod -Uri "$Api/contracts/$cid/complete" -Method Post -Headers @{Authorization="Bearer $tok"} -ContentType 'application/json'
$d = Invoke-RestMethod -Uri "$Api/contracts/$cid" -Headers @{Authorization="Bearer $clientTok"} -ContentType 'application/json'
Write-Host "   after freelancer completes -> status:" $d.status
Invoke-RestMethod -Uri "$Api/contracts/$cid/approve" -Method Post -Headers @{Authorization="Bearer $clientTok"} -ContentType 'application/json'
$d2 = Invoke-RestMethod -Uri "$Api/contracts/$cid" -Headers @{Authorization="Bearer $clientTok"} -ContentType 'application/json'
Write-Host "   after client approves -> status:" $d2.status
$dj = Invoke-RestMethod -Uri "$Api/jobs/$($d2.job._id)" -ContentType 'application/json'
Write-Host "   job status after approval:" $dj.job.status

Write-Host "`nAll edge case tests done."
