@echo off
echo Generating Windows self-signed certificate...

REM Create certificates directory
if not exist "certificates" mkdir certificates

REM Generate Windows certificate using PowerShell
powershell -Command "& {
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject 'CN=Comic Universe' -KeyUsage DigitalSignature -FriendlyName 'Comic Universe Code Signing' -CertStoreLocation Cert:\CurrentUser\My
    $pwd = ConvertTo-SecureString -String 'comicuniverse' -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath 'certificates\windows-cert.p12' -Password $pwd
    Write-Host 'Certificate generated: certificates\windows-cert.p12'
    Write-Host 'Password: comicuniverse'
}"

echo Certificate generation complete!
pause
