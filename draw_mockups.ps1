Add-Type -AssemblyName System.Drawing

$colors = @('DarkBlue', 'DarkRed', 'DarkGreen', 'DarkSlateGray')
$texts = @('Backlit Channel Letters', 'Freestanding Pylon Sign', 'Wayfinding Board', 'Frosted Glass Partitions')
$files = @('mock_sign_3.png', 'mock_sign_4.png', 'mock_sign_5.png', 'mock_sign_6.png')

for ($i = 0; $i -lt 4; $i++) {
    $bmp = New-Object System.Drawing.Bitmap(800, 600)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromName($colors[$i]))
    $graphics.FillRectangle($brush, 0, 0, 800, 600)
    
    $font = New-Object System.Drawing.Font("Arial", 40)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.RectangleF(0, 0, 800, 600)
    $graphics.DrawString($texts[$i], $font, $textBrush, $rect, $stringFormat)
    
    $path = "c:\Users\PC\OneDrive\Documents\DOCS\coding\PROJECTS\prodeal systems\prodeal-portal\public\mockups\" + $files[$i]
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bmp.Dispose()
}
