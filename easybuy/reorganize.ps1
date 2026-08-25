$homeFile = "app/home.tsx"
$homeContent = Get-Content $homeFile -Raw

# 1. Update imports in home.tsx
$homeContent = $homeContent -replace "'\.\./components/DarkLuxuryPromotionalSection'", "'../components/home/DarkLuxuryPromotionalSection'"
$homeContent = $homeContent -replace "'\.\./components/EditorialPromotionalBanner'", "'../components/home/EditorialPromotionalBanner'"
$homeContent = $homeContent -replace "'\.\./components/EditorialStoryModal'", "'../components/home/EditorialStoryModal'"
$homeContent = $homeContent -replace "'\.\./components/QuickBuySection'", "'../components/home/QuickBuySection'"

# 2. Delete SpinWinModal usage in home.tsx
$homeContent = $homeContent -replace "(?m)^import \{ SpinWinModal \}.*?\n", ""
$homeContent = $homeContent -replace "(?m)^.*setSpinWinModalVisible.*?\n", ""
$homeContent = $homeContent -replace "(?s)<SpinWinModal[^>]*/>", ""

Set-Content $homeFile -Value $homeContent

# 3. Move files
Move-Item "components/DarkLuxuryPromotionalSection.tsx" "components/home/" -Force
Move-Item "components/EditorialPromotionalBanner.tsx" "components/home/" -Force
Move-Item "components/EditorialStoryModal.tsx" "components/home/" -Force
Move-Item "components/QuickBuySection.tsx" "components/home/" -Force

# 4. Delete dead code
Remove-Item "components/SpinWinModal.tsx" -Force

# 5. Fix firebase config issue (Move src/config/firebase.ts to services/firebase.ts and delete src)
$firebaseConfigContent = Get-Content "src/config/firebase.ts" -Raw
Set-Content "services/firebase.ts" -Value $firebaseConfigContent
Remove-Item "src" -Recurse -Force

Write-Host "Reorganization complete!"
