param($Api = 'http://localhost:5000/api')
$ErrorActionPreference = 'Stop'

Function Show-Json($obj) { $obj | ConvertTo-Json -Depth 5 | Write-Host }

Write-Host 'Registering client...'
$client = Invoke-RestMethod -Uri "$Api/auth/register" -Method Post -Body (@{name='Client A'; email='client@example.com'; password='password'; role='client'} | ConvertTo-Json) -ContentType 'application/json'
Show-Json $client
$clientToken = $client.token
if (-not $clientToken) { Write-Host 'Client token missing; aborting'; exit 1 }

Write-Host 'Registering freelancer...'
$freelancer = Invoke-RestMethod -Uri "$Api/auth/register" -Method Post -Body (@{name='Freelancer B'; email='freelancer@example.com'; password='password'; role='freelancer'} | ConvertTo-Json) -ContentType 'application/json'
Show-Json $freelancer
$freelancerToken = $freelancer.token
if (-not $freelancerToken) { Write-Host 'Freelancer token missing; aborting'; exit 1 }

Write-Host 'Client posting a job...'
$job = Invoke-RestMethod -Uri "$Api/jobs" -Method Post -Headers @{ Authorization = "Bearer $clientToken"; 'Content-Type' = 'application/json' } -Body (@{title='Test Job'; description='Do something cool'; budget=100} | ConvertTo-Json)
Show-Json $job
$jobId = $job._id

Write-Host 'Listing jobs...'
Show-Json (Invoke-RestMethod -Uri "$Api/jobs" -ContentType 'application/json')

Write-Host 'Freelancer placing a bid...'
$bid = Invoke-RestMethod -Uri "$Api/bids" -Method Post -Headers @{ Authorization = "Bearer $freelancerToken"; 'Content-Type' = 'application/json' } -Body (@{jobId=$jobId; amount=90; coverLetter='I can do this'} | ConvertTo-Json)
Show-Json $bid

Write-Host 'Get job details...'
Show-Json (Invoke-RestMethod -Uri "$Api/jobs/$jobId" -ContentType 'application/json')

Write-Host 'Client accepting bid...'
$accept = Invoke-RestMethod -Uri "$Api/bids/$($bid._id)/accept" -Method Post -Headers @{ Authorization = "Bearer $clientToken"; 'Content-Type' = 'application/json' }
Show-Json $accept

Write-Host 'Listing contracts as freelancer...'
$contracts = Invoke-RestMethod -Uri "$Api/contracts" -Headers @{ Authorization = "Bearer $freelancerToken"; 'Content-Type' = 'application/json' }
Show-Json $contracts

Write-Host 'Get contract...'
if ($contracts) {
  $cid = $contracts[0]._id
  Show-Json (Invoke-RestMethod -Uri "$Api/contracts/$cid" -Headers @{ Authorization = "Bearer $freelancerToken"; 'Content-Type' = 'application/json' })
}

Write-Host 'Smoke test complete.'


