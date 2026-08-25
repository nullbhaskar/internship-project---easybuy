# 1. Add .env to .gitignore if it's not already there
$gitignorePath = ".gitignore"
$gitignore = ""
if (Test-Path $gitignorePath) {
    $gitignore = Get-Content $gitignorePath -Raw
}
if ($gitignore -notmatch "(?m)^\.env\s*$") {
    Add-Content $gitignorePath "`n.env"
    Write-Host "Added .env to .gitignore"
}

# 2. Create a secure .env.example file
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $exampleContent = $envContent | ForEach-Object {
        if ($_ -match "^([^=]+)=") {
            $key = $matches[1]
            "$key=your_value_here"
        } else {
            $_
        }
    }
    Set-Content ".env.example" $exampleContent
    Write-Host "Created .env.example"
}

# 3. Git Operations
git rm --cached .env
git add .gitignore .env.example
git commit -m "Security: Remove .env from tracking and add .env.example"
git push
