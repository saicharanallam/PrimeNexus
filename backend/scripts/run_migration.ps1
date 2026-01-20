# PowerShell script to run the user fields migration on Windows

Write-Host "Running database migration to add user fields..." -ForegroundColor Cyan

# Run the migration SQL
$sql = @"
DO `$`$ 
BEGIN
    -- Add display_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='display_name') THEN
        ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
    END IF;
    
    -- Add bio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    
    -- Add avatar_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
    END IF;
    
    -- Add phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    END IF;
    
    -- Add timezone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='timezone') THEN
        ALTER TABLE users ADD COLUMN timezone VARCHAR(100) DEFAULT 'UTC';
    END IF;
    
    -- Add preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='preferences') THEN
        ALTER TABLE users ADD COLUMN preferences JSON;
    END IF;
    
    -- Update existing users to have default timezone
    UPDATE users SET timezone = 'UTC' WHERE timezone IS NULL;
END `$`$;
"@

docker exec -i sigmachain-db psql -U sigmachain -d sigmachain -c $sql

Write-Host "Migration completed!" -ForegroundColor Green

