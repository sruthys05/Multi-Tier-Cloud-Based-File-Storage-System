$body = @{fullName='Test User'; email='test@example.com'; password='password123'} | ConvertTo-Json
Write-Host "=== Register ==="
$response = Invoke-WebRequest -Uri 'http://localhost:8081/api/auth/register' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
Write-Host ('Status: ' + $response.StatusCode)
$response.Content

Write-Host "`n=== Login ==="
$loginBody = @{email='test@example.com'; password='password123'} | ConvertTo-Json
$loginResponse = Invoke-WebRequest -Uri 'http://localhost:8081/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -UseBasicParsing
Write-Host ('Status: ' + $loginResponse.StatusCode)
$loginResponse.Content