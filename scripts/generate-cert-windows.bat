@echo off
echo Generating Windows certificate for Comic Universe...

REM Create certificates directory
if not exist "certificates" mkdir certificates

echo Creating self-signed certificate...
powershell -Command "& {
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject 'CN=Comic Universe' -KeyUsage DigitalSignature -FriendlyName 'Comic Universe Code Signing' -CertStoreLocation Cert:\CurrentUser\My
    $pwd = ConvertTo-SecureString -String 'comicuniverse' -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath 'certificates\windows-cert.p12' -Password $pwd
    Write-Host 'Certificate generated successfully!'
    Write-Host 'Location: certificates\windows-cert.p12'
    Write-Host 'Password: comicuniverse'
}"

echo Certificate generation complete!
pause
